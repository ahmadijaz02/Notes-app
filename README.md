# Notes App - Security Properties Demo

This project demonstrates:
- **Confidentiality**: Access control (users see/manage only their own notes, admin sees all)
- **Availability**: Automatic failover between primary and fallback MongoDB databases
- **Accountability**: Audit logs for login, signup, note actions (viewable only by admin)

## Features
- Modern, interactive UI (login, signup, notes, audit log)
- Signup and login for new users
- Admin and user roles (admin can view audit log and all notes)
- Responsive design and smooth animations
- Two MongoDB databases: primary (Atlas or remote) and fallback (local or remote)
- Simulate primary DB failure via config flag

## How to Simulate Primary DB Failure
Edit `config.js` and set `PRIMARY_DB_DOWN = true` to force the app to use the fallback database. Restart the server after changing this flag.

## Getting Started
1. Install dependencies: `npm install express express-session mongoose`
2. Set your MongoDB URIs in `config.js` for both primary and fallback
3. Start the app: `node app.js`
4. Visit `http://localhost:3000` in your browser

## Creating an Admin User
1. Sign up as a new user
2. In your MongoDB database, update the user's `role` field to `admin` (using Atlas dashboard or MongoDB shell)

## File Structure
- `app.js` - Main server
- `config.js` - DB config and failover flag
- `public/` - Static files (HTML/CSS/JS)

---

## Deployment (Render / Railway / Vercel)

This app is ready to be deployed to free Node hosting providers. Below are quick, copy-paste friendly steps.

Required environment variables (set these in your host's dashboard):
- `PRIMARY_DB_URI` — MongoDB connection string (Atlas recommended)
- `FALLBACK_DB_URI` — optional fallback MongoDB URI
- `SESSION_SECRET` — strong secret for session cookies

Render (simple):
1. Push your repo to GitHub.
2. Create a free account on https://render.com and connect your GitHub repo.
3. Create a new Web Service, choose your repo and branch.
4. Build command: `npm install` (optional). Start command: `npm start`.
5. Add the environment variables in the service settings.
6. Deploy and open the provided URL.

Railway (simple):
1. Create a Railway project and link to your GitHub repo.
2. Railway will detect a Node.js app; set the start command to `npm start` if required.
3. Add `PRIMARY_DB_URI` and `SESSION_SECRET` to project variables.
4. Deploy and use the generated domain.

Vercel (note):
- Vercel is oriented to serverless functions. This app is a full Express server and is better hosted on Render or Railway unless you convert it to serverless.

Local quick run
```powershell
npm install
$env:PRIMARY_DB_URI='your-mongo-uri'
$env:SESSION_SECRET='a-strong-secret'
npm start
```
# Notes App - Security Properties Demo

This project demonstrates:
- **Confidentiality**: Access control (users see/manage only their own notes, admin sees all)
- **Availability**: Automatic failover between primary and fallback MongoDB databases
- **Accountability**: Audit logs for login, signup, note actions (viewable only by admin)

## Features
- Modern, interactive UI (login, signup, notes, audit log)
- Signup and login for new users
- Admin and user roles (admin can view audit log and all notes)
- Responsive design and smooth animations
- Two MongoDB databases: primary (Atlas or remote) and fallback (local or remote)
- Simulate primary DB failure via config flag

## How to Simulate Primary DB Failure
Edit `config.js` and set `PRIMARY_DB_DOWN = true` to force the app to use the fallback database. Restart the server after changing this flag.

## Getting Started
1. Install dependencies: `npm install express express-session mongoose`
2. Set your MongoDB URIs in `config.js` for both primary and fallback
3. Start the app: `node app.js`
4. Visit `http://localhost:3000` in your browser

## Creating an Admin User
1. Sign up as a new user
2. In your MongoDB database, update the user's `role` field to `admin` (using Atlas dashboard or MongoDB shell)

## File Structure
- `app.js` - Main server
- `config.js` - DB config and failover flag
- `public/` - Static files (HTML/CSS/JS)

---

## Deployment (Render / Railway / Vercel)

This app is ready to be deployed to free Node hosting providers. Below are quick, copy-paste friendly steps.

Required environment variables (set these in your host's dashboard):
- `PRIMARY_DB_URI` — MongoDB connection string (Atlas recommended)
- `FALLBACK_DB_URI` — optional fallback MongoDB URI
- `SESSION_SECRET` — strong secret for session cookies

Render (simple):
1. Push your repo to GitHub.
2. Create a free account on https://render.com and connect your GitHub repo.
3. Create a new Web Service, choose your repo and branch.
4. Build command: `npm install` (optional). Start command: `npm start`.
5. Add the environment variables in the service settings.
6. Deploy and open the provided URL.

Railway (simple):
1. Create a Railway project and link to your GitHub repo.
2. Railway will detect a Node.js app; set the start command to `npm start` if required.
3. Add `PRIMARY_DB_URI` and `SESSION_SECRET` to project variables.
4. Deploy and use the generated domain.

Vercel (note):
- Vercel is oriented to serverless functions. This app is a full Express server and is better hosted on Render or Railway unless you convert it to serverless.

Local quick run
