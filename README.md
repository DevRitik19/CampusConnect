# CampusConnect — Single-College Student Utility & Community Hub

> **Everything happening around your campus, in one place.**

CampusConnect is a production-conscious, full-stack MERN web application engineered for college students and authorized university administrators. It unifies lost-and-found recoveries, peer-to-peer used student item exchange, study and hackathon team matching, campus events, and real-time student messaging within a secured college-domain authenticated ecosystem.

---

## 1. Project Overview & Problem Statement

College students frequently rely on scattered, ephemeral WhatsApp groups, crowded notice boards, and unorganized social media pages to find lost belongings, exchange used textbooks, locate project teammates, or learn about university events. Crucial notices are easily buried under chat noise, and contact details are unsafely broadcast.

**CampusConnect** solves this by providing:
- **Centralized Campus Utilities**: Searchable Lost & Found, Student Marketplace (priced in INR ₹), and Study/Project Collaboration directories.
- **Official Campus Calendar**: Verified workshops, hackathons, seminars, and official notices managed by college administration.
- **Built-in Safe Messaging**: Direct peer-to-peer conversations without exposing private phone numbers or personal emails.
- **Strict Campus Affiliation**: Enforced student email verification (`@campus.edu`) ensuring a safe, trusted, single-college student environment.
- **Active Community Moderation**: Content reporting and an administrator dashboard for prompt takedowns and user management.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with modern ES Modules
- **Build Tool**: Vite 5
- **Routing**: React Router DOM (v6)
- **API Client**: Axios with centralized interceptors & credentialed cookies
- **State Management**: React Context API (`AuthContext`)
- **Styling**: Vanilla CSS Design System with CSS tokens, fluid responsive grids, glassmorphism headers, and accessible contrast
- **Iconography**: Lucide React

### Backend
- **Runtime & Framework**: Node.js + Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **Security & Headers**: Helmet, CORS with strict origin validation, Express Rate Limiting
- **Authentication**: JWT signed tokens transmitted via `httpOnly`, `sameSite`, and `secure` cookies
- **Hashing**: bcryptjs (10 salt rounds)
- **Logging**: Morgan HTTP logger

---

## 3. Application Architecture

```
CampusConnect Architecture
┌────────────────────────────────────────────────────────┐
│              Client Application (React + Vite)         │
│  - Public Landing & Campus Feed                        │
│  - Lost & Found Desk | Marketplace | Collaborate       │
│  - Events & Announcements | Direct Messaging           │
│  - User Profile & Saved Bookmarks | Admin Dashboard    │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTPS / REST API (Cookies: httpOnly)
                            │
┌───────────────────────────▼────────────────────────────┐
│              Backend Service (Express.js API)          │
│  - Security: Helmet, RateLimiter, CORS Origin Check   │
│  - Auth Middleware: Cookie verification & Active check │
│  - Controllers: Auth, Users, Posts, Events, Messages  │
│  - Moderation: Admin Role Verification & Reports       │
└───────────────────────────┬────────────────────────────┘
                            │
               Mongoose ODM Connections
                            │
┌───────────────────────────▼────────────────────────────┐
│              Database Layer (MongoDB Atlas)            │
│  - Collections: Users, Posts, Events,                  │
│                 Conversations, Messages, Reports       │
│  - Indexes: Text Search, Compound, Foreign Keys        │
└────────────────────────────────────────────────────────┘
```

---

## 4. Folder Structure

```
CampusConnect/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Badge.jsx            # Dynamic category & status badges
│   │   │   ├── EmptyState.jsx       # Reusable empty state view
│   │   │   ├── EventCard.jsx        # Campus event card with bookmark toggle
│   │   │   ├── Footer.jsx           # Responsive campus footer
│   │   │   ├── LoadingSkeleton.jsx  # Pulse skeleton loaders
│   │   │   ├── Navbar.jsx           # Responsive header with mobile drawer
│   │   │   ├── PostCard.jsx         # Card for all 3 post types with badges
│   │   │   └── ReportModal.jsx      # Moderation report submission modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global session & current user state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx   # Moderation headquarters & report actions
│   │   │   ├── Collaborate.jsx      # Study partner & hackathon team finder
│   │   │   ├── CreatePost.jsx       # Dynamic 3-category post creation form
│   │   │   ├── EditPost.jsx         # Post updater
│   │   │   ├── EditProfile.jsx      # User profile editor
│   │   │   ├── Events.jsx           # Official workshops, hackathons & notices
│   │   │   ├── HomeFeed.jsx         # Live multi-category campus feed
│   │   │   ├── Landing.jsx          # Public showcase & category shortcuts
│   │   │   ├── Login.jsx            # Sign in with quick-fill demo buttons
│   │   │   ├── LostFound.jsx        # Lost and found notices with state filter
│   │   │   ├── Marketplace.jsx      # Peer-to-peer used items priced in INR ₹
│   │   │   ├── Messages.jsx         # Responsive 2-pane chat with auto-polling
│   │   │   ├── MyListings.jsx       # Student post management & status toggles
│   │   │   ├── NotFound.jsx         # 404 handler
│   │   │   ├── PostDetails.jsx      # Full detail view with message trigger
│   │   │   ├── Profile.jsx          # Public student profile with listings
│   │   │   ├── Register.jsx         # Student signup enforcing @campus.edu
│   │   │   └── SavedItems.jsx       # Bookmarked posts and events
│   │   ├── services/
│   │   │   └── api.js               # Central Axios client with credentials
│   │   ├── styles/
│   │   │   └── index.css            # Complete design system & tokens
│   │   ├── App.jsx                  # React Router configuration & guards
│   │   └── main.jsx                 # Application entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── scripts/
│   │   └── seed.js                  # Idempotent realistic campus demo seed
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection handler
│   │   │   └── env.js               # Environment configuration & validation
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, logout, me
│   │   │   ├── eventController.js   # Event CRUD, admin publication, bookmark
│   │   │   ├── messageController.js # Conversations & chat message handling
│   │   │   ├── postController.js    # Post CRUD, filters, status, bookmark
│   │   │   ├── reportController.js  # Moderation reports & admin actions
│   │   │   └── userController.js    # Profiles, personal listings, saved items
│   │   ├── middleware/
│   │   │   ├── adminMiddleware.js   # Enforces role === 'ADMIN'
│   │   │   ├── authMiddleware.js    # JWT cookie verification & active check
│   │   │   ├── errorMiddleware.js   # 404 & centralized error formatting
│   │   │   └── rateLimiter.js       # IP rate limiting
│   │   ├── models/
│   │   │   ├── Conversation.js      # Normalized participant pair & post
│   │   │   ├── Event.js             # Official campus event schema
│   │   │   ├── Message.js           # Chat message schema with read receipts
│   │   │   ├── Post.js              # Typed details schema (Lost/Market/Collab)
│   │   │   ├── Report.js            # Content/user moderation report schema
│   │   │   └── User.js              # Student & admin user schema
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── postRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── utils/
│   │   │   └── generateToken.js     # Signed JWT & secure cookie generator
│   │   ├── app.js                   # Express configuration & middleware
│   │   └── index.js                 # Server entry & graceful shutdown
│   └── package.json
├── .env.example                     # Environment template
├── .gitignore                       # Source control exclusions
└── README.md
```

---

## 5. Database Models Overview

1. **User**:
   - `name`, `email` (unique, lowercase, validated domain), `passwordHash` (hidden in queries), `department`, `year`, `bio`, `avatarUrl`, `role` (`STUDENT` / `ADMIN`), `isActive`, `savedPosts`, `savedEvents`.
2. **Post**:
   - `author` (User ref), `type` (`LOST_FOUND` / `MARKETPLACE` / `COLLABORATION`), `title`, `description`, `category`, `images`, `tags`, `location`, `status` (`ACTIVE` / `RESOLVED` / `SOLD` / `CLOSED`), and typed `details` object:
     - `LOST_FOUND`: `itemState` (`LOST` or `FOUND`), `dateOccurred`.
     - `MARKETPLACE`: `price` (INR non-negative), `condition`, `itemType`.
     - `COLLABORATION`: `subject`, `skills`, `availability`, `collaborationType`.
3. **Event**:
   - `author` (Admin User ref), `title`, `description`, `category`, `venue`, `startsAt`, `endsAt`, `registrationUrl`, `imageUrl`, `status` (`PUBLISHED` / `CANCELLED`).
4. **Conversation**:
   - `participants` (2 User refs), `post` (optional Post ref), `lastMessage` (Message ref), `lastMessageAt`.
5. **Message**:
   - `conversation` (ref), `sender` (ref), `text` (1-2000 chars), `readBy` (array of User refs), `createdAt`.
6. **Report**:
   - `reporter` (User ref), `targetType` (`POST` / `USER` / `EVENT`), `targetId`, `reason`, `description`, `status` (`OPEN` / `REVIEWED` / `DISMISSED`), `reviewedBy`, `reviewedAt`.

---

## 6. Local Setup & Execution Guide

### Prerequisites
- **Node.js**: v18+ (verified on Node v24.11.0)
- **npm**: v9+ (verified on npm 11.8.0)
- **MongoDB**: MongoDB Atlas connection string or local MongoDB instance (`mongodb://localhost:27017/campusconnect`)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd CampusConnect
   ```

2. **Configure Environment Variables:**
   - Copy `.env.example` to `server/.env`:
     ```bash
     cp .env.example server/.env
     ```
   - Update `MONGODB_URI` and `JWT_SECRET` in `server/.env` as needed.

3. **Install Dependencies:**
   ```bash
   # Install server packages
   cd server
   npm install

   # Install client packages
   cd ../client
   npm install
   cd ..
   ```

4. **Seed Demonstration Data:**
   Run the seed script from the `server` directory to populate realistic campus data:
   ```bash
   cd server
   npm run seed
   ```

5. **Start Development Servers:**
   - **Start Backend API** (Port 5000):
     ```bash
     cd server
     npm run dev
     ```
   - **Start Frontend Client** (Port 5173):
     ```bash
     cd client
     npm run dev
     ```
   - Open your browser at `http://localhost:5173`.

---

## 7. Pre-Configured Demonstration Accounts

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Student** | `arjun@campus.edu` | `Campus@123` | Active student with listings and messages |
| **Student** | `priya@campus.edu` | `Campus@123` | Active student with lost & found / study notices |
| **Student** | `rohan@campus.edu` | `Campus@123` | Active student with marketplace textbook |
| **Administrator** | `admin@campus.edu` | `Campus@123` | Official events management & report moderation |

> **Convenience Feature**: The login page (`/login`) includes one-click **Quick-Fill Demo Account** buttons for immediate evaluation.

---

## 8. API Endpoints Overview

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health & database status |
| `POST` | `/api/auth/register` | Public | Register new student with `@campus.edu` |
| `POST` | `/api/auth/login` | Public | Authenticate and issue secure JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clear JWT session cookie |
| `GET` | `/api/auth/me` | Authenticated | Fetch current logged-in user |
| `GET` | `/api/users/:id` | Public | Fetch student profile & active posts |
| `PATCH` | `/api/users/me` | Authenticated | Update user bio, department, year, avatar |
| `GET` | `/api/users/me/posts` | Authenticated | Fetch user's own listings |
| `GET` | `/api/users/me/saved` | Authenticated | Fetch bookmarked posts and events |
| `GET` | `/api/posts` | Public | Fetch posts with search, filter, sort, pagination |
| `POST` | `/api/posts` | Authenticated | Create a new campus listing |
| `GET` | `/api/posts/:id` | Public | Fetch single post details |
| `PATCH` | `/api/posts/:id` | Owner / Admin | Update post details |
| `PATCH` | `/api/posts/:id/status` | Owner / Admin | Change post status (`ACTIVE`, `SOLD`, `RESOLVED`, `CLOSED`) |
| `DELETE` | `/api/posts/:id` | Owner / Admin | Delete post listing |
| `POST` | `/api/posts/:id/save` | Authenticated | Bookmark post |
| `DELETE` | `/api/posts/:id/save` | Authenticated | Remove post bookmark |
| `GET` | `/api/events` | Public | Fetch published campus events & announcements |
| `POST` | `/api/events` | Admin Only | Publish official campus event |
| `PATCH` | `/api/events/:id` | Admin Only | Edit campus event |
| `POST` | `/api/events/:id/save` | Authenticated | Bookmark campus event |
| `DELETE` | `/api/events/:id/save` | Authenticated | Remove event bookmark |
| `POST` | `/api/conversations` | Authenticated | Start or retrieve existing conversation |
| `GET` | `/api/conversations` | Authenticated | Get all user conversations |
| `GET` | `/api/conversations/:id/messages` | Participant | Get message history in conversation |
| `POST` | `/api/conversations/:id/messages` | Participant | Send message in conversation |
| `POST` | `/api/reports` | Authenticated | Submit report for post, user, or event |
| `GET` | `/api/admin/reports` | Admin Only | Review moderation reports |
| `PATCH` | `/api/admin/reports/:id` | Admin Only | Dismiss or mark report reviewed |
| `PATCH` | `/api/admin/users/:id/status` | Admin Only | Suspend or reactivate user |
| `DELETE` | `/api/admin/posts/:id` | Admin Only | Moderator post takedown |

---

## 9. Security & Authentication Architecture

1. **HTTP-Only Cookie Storage**: JWTs are never stored in `localStorage` or `sessionStorage` to mitigate Cross-Site Scripting (XSS) risks.
2. **Domain Restriction**: Enforces `@campus.edu` (configured via `COLLEGE_EMAIL_DOMAIN`) on server registration.
3. **Privilege Escalation Protection**: Public registration strictly hardcodes `role: 'STUDENT'`. Arbitrary client `role`, `isAdmin`, or `isActive` payload properties are ignored.
4. **Conversation Privacy**: Endpoints verify that the requester is a registered participant of the conversation.
5. **Ownership Guard**: Posts can only be modified or deleted by the original author or an authorized administrator.
6. **Rate Limiting**: Protects against brute-force authentication and spam submissions using `express-rate-limit`.

---

## 10. Deployment Instructions

### Backend (Render)
1. Create a Web Service connected to your repository.
2. Set Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables in Render dashboard:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=<your_mongodb_atlas_uri>`
   - `JWT_SECRET=<unique_random_secret>`
   - `CLIENT_URL=https://<your_vercel_app>.vercel.app`
   - `COLLEGE_NAME="Apex Institute of Technology"`
   - `COLLEGE_EMAIL_DOMAIN=campus.edu`

### Frontend (Vercel)
1. Import repository on Vercel.
2. Set Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Configure Environment Variables:
   - `VITE_API_URL=https://<your_render_service>.onrender.com/api`
5. Deploy and verify API connectivity.

---

## 11. Known Limitations & Future Enhancements

- **Email Service**: Verification emails currently default to active in development/demo mode. Production configuration supports pluggable SMTP or Resend/SendGrid providers.
- **WebSocket Upgrade**: Real-time chat currently uses 5-second polling (per PRD instructions to ensure reliable deployment before considering Socket.IO).
- **Persistent Image Hosting**: Post image inputs accept verified web URLs. Persistent Cloudinary upload integration is ready for environment variable attachment.
