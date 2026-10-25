import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Event } from '../src/models/Event.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';
import { Report } from '../src/models/Report.js';

let server;
let baseUrl;

// Helper to make requests with cookies
const makeRequest = async (path, options = {}, cookie = '') => {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(cookie ? { Cookie: cookie } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const setCookieHeader = response.headers.get('set-cookie');
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  return {
    status: response.status,
    data,
    cookie: setCookieHeader || cookie,
  };
};

test.before(async () => {
  await connectDB();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ==========================================
// 1. AUTHENTICATION & SECURITY TESTS
// ==========================================
test('AUTH: Reject registration with non-college email domain', async () => {
  const res = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'External Person',
      email: 'external@gmail.com',
      password: 'password123',
    }),
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.match(res.data.message, /college email address/);
});

test('AUTH: Reject registration with weak password (< 6 chars)', async () => {
  const res = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Weak Pass',
      email: 'weakpass@campus.edu',
      password: '123',
    }),
  });
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});

test('AUTH: Valid registration succeeds and assigns STUDENT role', async () => {
  const uniqueEmail = `test_student_${Date.now()}@campus.edu`;
  const res = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Student',
      email: uniqueEmail,
      password: 'CampusPassword123',
      role: 'ADMIN', // Try privilege escalation
      isAdmin: true,
    }),
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.role, 'STUDENT', 'Public registration must never assign ADMIN');
  assert.ok(res.cookie.includes('campusconnect_token'), 'HTTP-only cookie must be set');
});

test('AUTH: Reject duplicate email registration', async () => {
  const res = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Duplicate Arjun',
      email: 'arjun@campus.edu',
      password: 'Password123',
    }),
  });
  assert.equal(res.status, 409);
  assert.equal(res.data.success, false);
});

test('AUTH: Correct login issues auth cookie and returns safe user', async () => {
  const res = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'arjun@campus.edu',
      password: 'Campus@123',
    }),
  });
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.email, 'arjun@campus.edu');
  assert.equal(res.data.data.passwordHash, undefined, 'Password hash must never leak in response');
  assert.ok(res.cookie.includes('campusconnect_token'));
});

test('AUTH: Incorrect login fails with 401', async () => {
  const res = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'arjun@campus.edu',
      password: 'WrongPassword!',
    }),
  });
  assert.equal(res.status, 401);
  assert.equal(res.data.success, false);
});

test('AUTH: /api/auth/me works with valid session and rejects unauthenticated', async () => {
  // Unauthenticated
  const unauthRes = await makeRequest('/auth/me');
  assert.equal(unauthRes.status, 401);

  // Authenticated
  const loginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });
  const meRes = await makeRequest('/auth/me', {}, loginRes.cookie);
  assert.equal(meRes.status, 200);
  assert.equal(meRes.data.data.email, 'arjun@campus.edu');
});

test('AUTH: Logout clears the token cookie', async () => {
  const res = await makeRequest('/auth/logout', { method: 'POST' });
  assert.equal(res.status, 200);
  assert.ok(res.cookie.includes('Expires=') || res.cookie.includes('Max-Age=0'));
});

// ==========================================
// 2. POSTS & OWNERSHIP TESTS
// ==========================================
test('POSTS: Create valid Marketplace post & reject negative price', async () => {
  const loginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });

  // Negative price should be rejected
  const invalidRes = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'MARKETPLACE',
        title: 'Negative Price Calculator',
        description: 'Should fail validation',
        category: 'Electronics',
        details: { price: -50 },
      }),
    },
    loginRes.cookie
  );
  assert.equal(invalidRes.status, 400);

  // Valid marketplace post
  const validRes = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'MARKETPLACE',
        title: 'Valid Used Physics Textbook',
        description: 'Excellent condition with complete problem solutions.',
        category: 'Books & Notes',
        location: 'Hostel 4',
        details: { price: 250, condition: 'LIKE_NEW' },
      }),
    },
    loginRes.cookie
  );
  assert.equal(validRes.status, 201);
  assert.equal(validRes.data.data.title, 'Valid Used Physics Textbook');
});

test('POSTS: Student cannot edit or delete another user’s post', async () => {
  // Login as Arjun and create a post
  const arjunLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });
  const postRes = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'LOST_FOUND',
        title: 'Arjun Protected Water Bottle',
        description: 'Left near sports ground bench yesterday.',
        category: 'Bottles & Flasks',
        details: { itemState: 'LOST' },
      }),
    },
    arjunLogin.cookie
  );
  const postId = postRes.data.data._id;

  // Login as Priya (different student)
  const priyaLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@campus.edu', password: 'Campus@123' }),
  });

  // Priya tries to edit Arjun's post -> Expect 403
  const editRes = await makeRequest(
    `/posts/${postId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Hacked Title' }),
    },
    priyaLogin.cookie
  );
  assert.equal(editRes.status, 403);

  // Priya tries to delete Arjun's post -> Expect 403
  const deleteRes = await makeRequest(
    `/posts/${postId}`,
    { method: 'DELETE' },
    priyaLogin.cookie
  );
  assert.equal(deleteRes.status, 403);
});

// ==========================================
// 3. MESSAGING & PRIVACY TESTS
// ==========================================
test('MESSAGES: Prevent self-conversations', async () => {
  const arjunLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });
  const arjunId = arjunLogin.data.data._id;

  const res = await makeRequest(
    '/conversations',
    {
      method: 'POST',
      body: JSON.stringify({ recipientId: arjunId }),
    },
    arjunLogin.cookie
  );
  assert.equal(res.status, 400);
  assert.match(res.data.message, /cannot start a conversation with yourself/i);
});

test('MESSAGES: Non-participant cannot view conversation messages', async () => {
  const arjunLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });
  const priyaLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@campus.edu', password: 'Campus@123' }),
  });
  const rohanLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'rohan@campus.edu', password: 'Campus@123' }),
  });

  // Conversation between Arjun and Priya
  const convRes = await makeRequest(
    '/conversations',
    {
      method: 'POST',
      body: JSON.stringify({ recipientId: priyaLogin.data.data._id }),
    },
    arjunLogin.cookie
  );
  const convId = convRes.data.data._id;

  // Rohan (third-party student) tries to access messages -> Expect 403
  const rohanReadRes = await makeRequest(`/conversations/${convId}/messages`, {}, rohanLogin.cookie);
  assert.equal(rohanReadRes.status, 403);
  assert.equal(rohanReadRes.data.success, false);
});

// ==========================================
// 4. EVENTS & MODERATION TESTS
// ==========================================
test('EVENTS: Student cannot publish official campus events', async () => {
  const arjunLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });

  const res = await makeRequest(
    '/events',
    {
      method: 'POST',
      body: JSON.stringify({
        title: 'Fake Student Event',
        description: 'Should be rejected because author is not admin',
        venue: 'Campus Lawn',
        startsAt: new Date(Date.now() + 86400000),
      }),
    },
    arjunLogin.cookie
  );
  assert.equal(res.status, 403);
});

test('ADMIN: Administrator can access moderation reports & manage content', async () => {
  const adminLogin = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@campus.edu', password: 'Campus@123' }),
  });
  assert.equal(adminLogin.data.data.role, 'ADMIN');

  const reportsRes = await makeRequest('/admin/reports', {}, adminLogin.cookie);
  assert.equal(reportsRes.status, 200);
  assert.equal(reportsRes.data.success, true);
});
