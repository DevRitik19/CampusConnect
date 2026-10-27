import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Post } from '../src/models/Post.js';
import { Event } from '../src/models/Event.js';
import { Conversation } from '../src/models/Conversation.js';
import { Message } from '../src/models/Message.js';
import { Report } from '../src/models/Report.js';
import { ENV } from '../src/config/env.js';
import { validateCollegeDomainConfig } from '../src/utils/collegeEmail.js';
import { isFutureDate, getCampusDateString, CAMPUS_TIMEZONE } from '../src/utils/dateUtils.js';

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
  await User.deleteMany({
    $or: [
      { email: { $in: ['external@gmail.com', 'weakpass@campus.edu', 'newstudent@campus.edu'] } },
      { email: { $regex: /^test_/ } },
    ],
  });
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
  await User.deleteMany({
    $or: [
      { email: { $in: ['external@gmail.com', 'weakpass@campus.edu', 'newstudent@campus.edu'] } },
      { email: { $regex: /^test_/ } },
    ],
  });
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

// ==========================================
// 1. AUTHENTICATION & SECURITY TESTS
// ==========================================
test('COLLEGE_EMAIL: Configuration validation for production vs development', () => {
  // Production validation: prohibited unrestricted or invalid domains
  assert.equal(validateCollegeDomainConfig({ domain: '', nodeEnv: 'production' }).valid, false);
  assert.equal(validateCollegeDomainConfig({ domain: 'all', nodeEnv: 'production' }).valid, false);
  assert.equal(validateCollegeDomainConfig({ domain: '*', nodeEnv: 'production' }).valid, false);
  assert.equal(validateCollegeDomainConfig({ domain: 'invalid domain', nodeEnv: 'production' }).valid, false);
  assert.equal(validateCollegeDomainConfig({ domain: 'nodotdomain', nodeEnv: 'production' }).valid, false);

  // Production validation: valid domains
  assert.equal(validateCollegeDomainConfig({ domain: 'campus.edu', nodeEnv: 'production' }).valid, true);
  assert.equal(validateCollegeDomainConfig({ domain: '@campus.edu', nodeEnv: 'production' }).domain, 'campus.edu');
  assert.equal(validateCollegeDomainConfig({ domain: 'student.college.ac.in', nodeEnv: 'production' }).domain, 'student.college.ac.in');

  // Development validation: allows 'all' and '*' for local testing
  const devAll = validateCollegeDomainConfig({ domain: 'all', nodeEnv: 'development' });
  assert.equal(devAll.valid, true);
  assert.equal(devAll.unrestricted, true);

  const devStar = validateCollegeDomainConfig({ domain: '*', nodeEnv: 'development' });
  assert.equal(devStar.valid, true);
  assert.equal(devStar.unrestricted, true);

  const devSpecific = validateCollegeDomainConfig({ domain: 'campus.edu', nodeEnv: 'development' });
  assert.equal(devSpecific.valid, true);
  assert.equal(devSpecific.unrestricted, false);
  assert.equal(devSpecific.domain, 'campus.edu');
});

test('AUTH: Allowed domain registration succeeds', async () => {
  const originalDomain = ENV.COLLEGE_EMAIL_DOMAIN;
  ENV.COLLEGE_EMAIL_DOMAIN = 'campus.edu';
  try {
    const uniqueEmail = `test_allowed_${Date.now()}@campus.edu`;
    const res = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Allowed Student',
        email: uniqueEmail,
        password: 'Password123',
      }),
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.email, uniqueEmail);
  } finally {
    ENV.COLLEGE_EMAIL_DOMAIN = originalDomain;
  }
});

test('AUTH: Allowed domain registration succeeds when domain has leading @', async () => {
  const originalDomain = ENV.COLLEGE_EMAIL_DOMAIN;
  ENV.COLLEGE_EMAIL_DOMAIN = '@campus.edu';
  try {
    const uniqueEmail = `test_at_domain_${Date.now()}@campus.edu`;
    const res = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'At Student',
        email: uniqueEmail,
        password: 'Password123',
      }),
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.email, uniqueEmail);
  } finally {
    ENV.COLLEGE_EMAIL_DOMAIN = originalDomain;
  }
});

test('AUTH: Reject registration with disallowed external email domain', async () => {
  const originalDomain = ENV.COLLEGE_EMAIL_DOMAIN;
  ENV.COLLEGE_EMAIL_DOMAIN = 'campus.edu';
  try {
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
    assert.match(res.data.message, /college email address ending with @campus\.edu/);
  } finally {
    ENV.COLLEGE_EMAIL_DOMAIN = originalDomain;
  }
});

test('AUTH: Reject registration with lookalike or attacker subdomains', async () => {
  const originalDomain = ENV.COLLEGE_EMAIL_DOMAIN;
  ENV.COLLEGE_EMAIL_DOMAIN = 'campus.edu';
  try {
    // Suffix lookalike: fakecampus.edu
    const fakeRes = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Fake College Student',
        email: 'test_attacker@fakecampus.edu',
        password: 'password123',
      }),
    });
    assert.equal(fakeRes.status, 400);
    assert.match(fakeRes.data.message, /college email address ending with @campus\.edu/);

    // Attacker domain with campus.edu as prefix: user@campus.edu.attacker.com
    const prefixRes = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Attacker Domain',
        email: 'test_attacker@campus.edu.attacker.com',
        password: 'password123',
      }),
    });
    assert.equal(prefixRes.status, 400);
    assert.match(prefixRes.data.message, /college email address ending with @campus\.edu/);
  } finally {
    ENV.COLLEGE_EMAIL_DOMAIN = originalDomain;
  }
});

test('AUTH: Case normalization handles mixed-case email and uppercase domain', async () => {
  const originalDomain = ENV.COLLEGE_EMAIL_DOMAIN;
  ENV.COLLEGE_EMAIL_DOMAIN = 'CAMPUS.EDU';
  try {
    const timestamp = Date.now();
    const mixedEmail = `Test_Case_${timestamp}@CaMpUs.EdU`;
    const res = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Case Normalization Student',
        email: mixedEmail,
        password: 'Password123',
      }),
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.email, mixedEmail.toLowerCase());
  } finally {
    ENV.COLLEGE_EMAIL_DOMAIN = originalDomain;
  }
});

test('AUTH: Production fails safely when domain is "all" or "*"', async () => {
  const originalEnv = ENV.NODE_ENV;
  const originalDomain = ENV.COLLEGE_EMAIL_DOMAIN;
  ENV.NODE_ENV = 'production';

  try {
    // Test 'all'
    ENV.COLLEGE_EMAIL_DOMAIN = 'all';
    const resAll = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Prod All User',
        email: 'test_prod_all@gmail.com',
        password: 'Password123',
      }),
    });
    assert.equal(resAll.status, 500);
    assert.equal(resAll.data.success, false);
    assert.match(resAll.data.message, /Server configuration error/);

    // Test '*'
    ENV.COLLEGE_EMAIL_DOMAIN = '*';
    const resStar = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Prod Star User',
        email: 'test_prod_star@gmail.com',
        password: 'Password123',
      }),
    });
    assert.equal(resStar.status, 500);
    assert.equal(resStar.data.success, false);
    assert.match(resStar.data.message, /Server configuration error/);
  } finally {
    ENV.NODE_ENV = originalEnv;
    ENV.COLLEGE_EMAIL_DOMAIN = originalDomain;
  }
});

test('AUTH: Production fails safely when domain is missing or invalid', async () => {
  const originalEnv = ENV.NODE_ENV;
  const originalDomain = ENV.COLLEGE_EMAIL_DOMAIN;
  ENV.NODE_ENV = 'production';

  try {
    // Missing domain
    ENV.COLLEGE_EMAIL_DOMAIN = '';
    const resMissing = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Prod Missing Domain',
        email: 'test_prod_missing@campus.edu',
        password: 'Password123',
      }),
    });
    assert.equal(resMissing.status, 500);
    assert.equal(resMissing.data.success, false);
    assert.match(resMissing.data.message, /Server configuration error/);

    // Invalid domain
    ENV.COLLEGE_EMAIL_DOMAIN = 'invalid domain with spaces';
    const resInvalid = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Prod Invalid Domain',
        email: 'test_prod_invalid@campus.edu',
        password: 'Password123',
      }),
    });
    assert.equal(resInvalid.status, 500);
    assert.equal(resInvalid.data.success, false);
    assert.match(resInvalid.data.message, /Server configuration error/);
  } finally {
    ENV.NODE_ENV = originalEnv;
    ENV.COLLEGE_EMAIL_DOMAIN = originalDomain;
  }
});

test('AUTH: Development mode permits registration when domain is "all" or "*"', async () => {
  const originalEnv = ENV.NODE_ENV;
  const originalDomain = ENV.COLLEGE_EMAIL_DOMAIN;
  ENV.NODE_ENV = 'development';
  ENV.COLLEGE_EMAIL_DOMAIN = 'all';

  try {
    const devEmail = `test_dev_${Date.now()}@gmail.com`;
    const res = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Dev Any Domain Student',
        email: devEmail,
        password: 'Password123',
      }),
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.email, devEmail);
  } finally {
    ENV.NODE_ENV = originalEnv;
    ENV.COLLEGE_EMAIL_DOMAIN = originalDomain;
  }
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

test('POSTS: Lost & Found accepts yesterday dateOccurred', async () => {
  const loginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayStr = getCampusDateString(yesterday);
  const res = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'LOST_FOUND',
        title: 'Lost Keys Yesterday',
        description: 'Lost a bunch of keys in the cafeteria yesterday afternoon.',
        category: 'Accessories',
        details: {
          itemState: 'LOST',
          dateOccurred: yesterdayStr,
        },
      }),
    },
    loginRes.cookie
  );

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data._id);
});

test('POSTS: Lost & Found accepts today dateOccurred', async () => {
  const loginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });

  const todayStr = getCampusDateString();

  const res = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'LOST_FOUND',
        title: 'Found Umbrella Today',
        description: 'Found black umbrella near the main entrance this morning.',
        category: 'Accessories',
        details: {
          itemState: 'FOUND',
          dateOccurred: todayStr,
        },
      }),
    },
    loginRes.cookie
  );

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data._id);
});

test('POSTS: Lost & Found rejects tomorrow dateOccurred with 400 for both LOST and FOUND', async () => {
  const loginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStr = getCampusDateString(tomorrow);

  // Test LOST with tomorrow's date
  const lostRes = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'LOST_FOUND',
        title: 'Future Lost Item',
        description: 'Should fail validation because date is in the future.',
        category: 'Electronics',
        details: {
          itemState: 'LOST',
          dateOccurred: tomorrowStr,
        },
      }),
    },
    loginRes.cookie
  );

  assert.equal(lostRes.status, 400);
  assert.equal(lostRes.data.success, false);
  assert.match(lostRes.data.message, /future/i);

  // Test FOUND with tomorrow's timestamp
  const foundRes = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'LOST_FOUND',
        title: 'Future Found Item',
        description: 'Should also fail validation because date is in the future.',
        category: 'Electronics',
        details: {
          itemState: 'FOUND',
          dateOccurred: tomorrow.toISOString(),
        },
      }),
    },
    loginRes.cookie
  );

  assert.equal(foundRes.status, 400);
  assert.equal(foundRes.data.success, false);
  assert.match(foundRes.data.message, /future/i);
});

test('POSTS: Future dates in Marketplace and Collaboration are unaffected by Lost & Found rule', async () => {
  const loginRes = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'arjun@campus.edu', password: 'Campus@123' }),
  });

  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Marketplace listing with future date in description or custom details
  const marketRes = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'MARKETPLACE',
        title: 'Marketplace Item Available Next Week',
        description: `Available for pickup on ${nextWeek}`,
        category: 'Electronics',
        details: {
          price: 999,
          condition: 'LIKE_NEW',
          itemType: 'Monitor',
          dateAvailable: nextWeek,
        },
      }),
    },
    loginRes.cookie
  );

  assert.equal(marketRes.status, 201);
  assert.equal(marketRes.data.success, true);

  // Collaboration listing with future availability / date in details
  const collabRes = await makeRequest(
    '/posts',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'COLLABORATION',
        title: 'Hackathon Partner Starting Next Week',
        description: 'Looking for partner starting next week',
        category: 'Hackathons',
        details: {
          collaborationType: 'HACKATHON_TEAM',
          subject: 'AI Hackathon',
          availability: `Starting ${nextWeek}`,
          skills: ['React', 'Node.js'],
        },
      }),
    },
    loginRes.cookie
  );

  assert.equal(collabRes.status, 201);
  assert.equal(collabRes.data.success, true);
});

test('TIMEZONE: Asia/Kolkata midnight transitions evaluate correctly without false rejections', async () => {
  assert.equal(CAMPUS_TIMEZONE, 'Asia/Kolkata');

  // 1 second BEFORE midnight in Asia/Kolkata (23:59:59 IST on 2026-10-27 = 18:29:59 UTC on 2026-10-27)
  const beforeMidnight = new Date('2026-10-27T18:29:59.000Z');
  assert.equal(getCampusDateString(beforeMidnight), '2026-10-27');
  assert.equal(isFutureDate('2026-10-26', beforeMidnight), false, 'Yesterday should be accepted before midnight');
  assert.equal(isFutureDate('2026-10-27', beforeMidnight), false, 'Today should be accepted before midnight');
  assert.equal(isFutureDate('2026-10-28', beforeMidnight), true, 'Tomorrow should be rejected before midnight');

  // 1 second AFTER midnight in Asia/Kolkata (00:00:01 IST on 2026-10-28 = 18:30:01 UTC on 2026-10-27)
  const afterMidnight = new Date('2026-10-27T18:30:01.000Z');
  assert.equal(getCampusDateString(afterMidnight), '2026-10-28');
  assert.equal(isFutureDate('2026-10-27', afterMidnight), false, 'Yesterday should be accepted after midnight');
  assert.equal(isFutureDate('2026-10-28', afterMidnight), false, 'New today should be accepted after midnight');
  assert.equal(isFutureDate('2026-10-29', afterMidnight), true, 'New tomorrow should be rejected after midnight');
});

test('TIMEZONE: Cross-timezone servers do not reject Indian students’ current date or permit future date', async () => {
  // Scenario: Server runs in UTC time (e.g. cloud hosting) at 19:00:00 UTC on 2026-10-27.
  // In India, it is 00:30 AM on 2026-10-28.
  const utcServerRef = new Date('2026-10-27T19:00:00.000Z');
  assert.equal(getCampusDateString(utcServerRef), '2026-10-28');
  // Student selects 2026-10-28 (their current campus date): MUST NOT be rejected
  assert.equal(isFutureDate('2026-10-28', utcServerRef), false, 'Indian student today must be accepted on UTC server');
  // Student enters 2026-10-29 (tomorrow): MUST be rejected
  assert.equal(isFutureDate('2026-10-29', utcServerRef), true, 'Tomorrow must be rejected on UTC server');

  // Scenario: Testing date-only string vs Date object vs ISO string
  assert.equal(isFutureDate(new Date('2026-10-28T05:30:00.000Z'), utcServerRef), false);
  assert.equal(isFutureDate(new Date('2026-10-29T05:30:00.000Z'), utcServerRef), true);
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
