# 🛡️ Role-Based Access Control (RBAC) using MERN Stack

This project is a full-stack **Role-Based Access Control (RBAC)** system built with the **MERN stack** — **MongoDB, Express.js, React, and Node.js**.  
It provides a complete authentication and authorization solution that ensures users have access only to the resources permitted by their role.  

The system defines roles such as **Admin**, **Editor**, and **Viewer**, each with different levels of access and permissions, offering a secure and scalable foundation for modern web applications.

---

## 🌟 Overview

This RBAC project demonstrates how to:
- Authenticate users using JWT-based authentication.
- Authorize access to routes and UI components based on roles.
- Implement ownership-based permissions (e.g., users can edit only their own content).
- Maintain a central permission matrix for cleaner and more flexible access control.
- Secure both frontend and backend using proper validation, middleware, and guard logic.

---

## 🚀 Key Features

### 🔸 Role & Permission Matrix
Define capabilities for each role (**Admin**, **Editor**, **Viewer**) to perform CRUD operations and admin-level actions.  
Roles and permissions are stored in configuration files or MongoDB collections, allowing easy customization.

### 🔸 Auth Tokens
Implements secure authentication using **JWT (JSON Web Tokens)** that include `role` and `userId` claims.  
Supports **httpOnly cookies** or secure storage for access and refresh tokens.

### 🔸 API Enforcement
Custom **Express middleware** validates user permissions before accessing routes.  
For example:
```js
can('posts:update')

enforces only authorized users can modify specific resources.
Includes ownership and deny-by-default logic for extra security.

🔸 Data Scoping

MongoDB queries automatically filter by user role and ownership to prevent unauthorized data access.

authorId === userId


ensures Editors can only modify their own data.

🔸 UI Guarding

Frontend route guards and component-level restrictions hide or disable unauthorized UI elements.
Users only see what they’re allowed to access — providing a seamless and secure experience.

🔸 Administration

An Admin Panel allows administrators to:

Manage users and their roles.

View activity logs and audit trails.

Track who changed what and when.

🔸 Validation & Security

Input validation and sanitization using middleware.

Rate limiting, CORS, and CSRF protection for enhanced security.

Password hashing with bcrypt.

Secure API error handling and consistent response formats.

🔸 Observability

Includes structured logs with correlation IDs and traceable 401/403 responses for debugging and monitoring authorization failures.

🔸 Testing

Comprehensive unit and integration tests for middleware, repositories, and access logic.
End-to-end (E2E) tests ensure role behavior is consistent across routes and components.

🔸 Seed & Dev Setup

Includes ready-to-use seed scripts to populate MongoDB with sample users:

Admin

Editor

Viewer

Also includes Docker Compose setup for running both the API and MongoDB with a single command.

🧩 Tech Stack
Layer	Technology Used
Frontend	React.js / Next.js, Context API, Hooks, Tailwind CSS
Backend	Node.js, Express.js
Database	MongoDB (Mongoose ORM)
Authentication	JWT, bcrypt
Security	CORS, CSRF, rate limiting, input sanitization
Deployment	(Optional) Docker, Render, Vercel, or Railway
📂 Folder Structure
Role-based-Access-Control-using-MERN/
│
├── backend/        # Express API, routes, controllers, models
├── frontend/       # React or Next.js frontend with protected routes
├── components/     # Shared UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility and helper functions
├── public/         # Static assets
├── styles/         # Global and module styles
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json

⚙️ Setup & Run Locally
1️⃣ Clone the repository
git clone https://github.com/Alishaa221/Role-based-Access-Control-using-MERN.git
cd Role-based-Access-Control-using-MERN

2️⃣ Setup the backend
cd backend
npm install
npm start

3️⃣ Setup the frontend
cd ../frontend
npm install
npm run dev

🔑 Default Roles
Role	Description
Admin	Full access to manage users, roles, and permissions.
Editor	Can create and modify own data, view limited resources.
Viewer	Read-only access to allowed resources.
🧪 Testing

Run unit and integration tests:

npm test


Run E2E tests:

npm run test:e2e

🧰 Environment Variables

Create a .env file in your backend directory with:

PORT=5000
MONGO_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_secret_key
TOKEN_EXPIRY=1h


For frontend (if using Vite or Next.js), include:

VITE_API_BASE_URL=http://localhost:5000

👩‍💻 Author

Alisha
GitHub: @Alishaa221