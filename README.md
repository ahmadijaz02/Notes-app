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
- `public/` - Static files (CSS)

---

