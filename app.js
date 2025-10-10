const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const config = require('./config');


const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const ejs = require('ejs');
// Production check
const isProduction = process.env.NODE_ENV === 'production';


// DB connection logic
function getDbUri() {
  return config.PRIMARY_DB_DOWN ? config.FALLBACK_DB_URI : config.PRIMARY_DB_URI;
}

// Connect to MongoDB with proper error handling
mongoose.connect(getDbUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    // Test the connection by trying to find a user
    return User.findOne({}).then(user => {
      console.log('Database connection verified:', user ? 'Found test user' : 'No users yet');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if we can't connect to database
  });

// Mongoose models

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }
});
const User = mongoose.model('User', userSchema);

const noteSchema = new mongoose.Schema({
  content: String,
  owner: String
});
const Note = mongoose.model('Note', noteSchema);

const auditSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  username: String,
  role: String,
  action: String
});
const Audit = mongoose.model('Audit', auditSchema);


// Audit log function
async function logAudit(user, action) {
  await Audit.create({ username: user.username, role: user.role, action });
}

app.use(express.urlencoded({ extended: true }));

// Root route - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: getDbUri(),
    ttl: 24 * 60 * 60, // 1 day
    crypto: {
      secret: process.env.SESSION_SECRET || 'secret'
    }
  }),
  cookie: {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Prevent unauthenticated direct access to sensitive static files (notes page)
app.use((req, res, next) => {
  if (req.path === '/notes.html') {
    if (!req.session.user) return res.redirect('/login');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/user', requireLogin, (req, res) => {
  res.json({
    username: req.session.user.username,
    role: req.session.user.role
  });
});

// Audit logging: write to DB and append to file
async function writeAuditLog(username, role, action, ip) {
  try {
    await Audit.create({ username, role, action });
  } catch (e) {
    // DB write failed; still attempt to write to file
  }
  const line = `${new Date().toISOString()} | ${username} (${role}) | ${action} | ${ip || 'unknown'}\n`;
  fs.appendFile(path.join(__dirname, 'audit.log'), line, (err) => {
    if (err) console.error('Failed to write to audit.log', err);
  });
}

// Helper that accepts a user object or a username string
async function logAudit(userOrName, action, ip) {
  if (!userOrName) return writeAuditLog('unknown', 'unknown', action, ip);
  if (typeof userOrName === 'string') return writeAuditLog(userOrName, 'unknown', action, ip);
  return writeAuditLog(userOrName.username || 'unknown', userOrName.role || 'unknown', action, ip);
}

// Middleware: require login
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// Middleware: require admin
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Forbidden');
  next();
}

// Login page


// Render login page with error message if present (EJS)
app.get('/login', (req, res) => {
  res.render('login', { error: req.query.error || null });
});

// Handle login POST
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;
  const user = await User.findOne({ username });
  if (!user) {
    await logAudit(username, 'failed login', ip);
    return res.redirect('/login?error=Invalid+credentials');
  }
  let passwordOk = false;
  try {
    passwordOk = await bcrypt.compare(password, user.password);
  } catch (e) {
    passwordOk = false;
  }
  // Migration fallback: if stored password was plaintext, re-hash it
  if (!passwordOk && user.password === password) {
    try {
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
      await user.save();
      passwordOk = true;
    } catch (e) {
      // ignore
    }
  }
  if (passwordOk) {
    req.session.user = { username: user.username, role: user.role };
    await logAudit(user, 'login', ip);
    return res.redirect('/notes');
  }
  await logAudit(username, 'failed login', ip);
  return res.redirect('/login?error=Invalid+credentials');
});

// Signup page


// Render signup page with error message if present (EJS)
app.get('/signup', (req, res) => {
  res.render('signup', { error: req.query.error || null });
});

// Handle signup POST
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.redirect('/signup?error=Username+already+exists');
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hash, role: 'user' });
    await logAudit(user, 'signup', req.ip);
    req.session.user = { username: user.username, role: user.role };
    res.redirect('/notes');
  } catch (err) {
    res.redirect('/signup?error=Error+creating+user');
  }
});

// Notes page (EJS)
app.get('/notes', requireLogin, async (req, res) => {
  await logAudit(req.session.user, 'access notes', req.ip);
  res.render('notes', { user: req.session.user });
});

// API: get notes

app.get('/api/notes', requireLogin, async (req, res) => {
  try {
    let notes;
    if (req.session.user.role === 'admin') {
      notes = await Note.find();
    } else {
      notes = await Note.find({ owner: req.session.user.username });
    }
    res.json(notes);
  } catch (err) {
    res.status(500).send('DB error');
  }
});

// API: create note

app.post('/api/notes', requireLogin, async (req, res) => {
  try {
    const { content } = req.body;
    const owner = req.session.user.username;
    await Note.create({ content, owner });
    await logAudit(req.session.user, 'create note');
    res.redirect('/notes');
  } catch (err) {
    res.status(500).send('DB error');
  }
});

// API: delete note

app.post('/api/notes/delete', requireLogin, async (req, res) => {
  try {
    const { id } = req.body;
    const note = await Note.findById(id);
    if (!note) return res.status(404).send('Note not found');
    if (req.session.user.role !== 'admin' && note.owner !== req.session.user.username) {
      return res.status(403).send('Forbidden');
    }
    await Note.deleteOne({ _id: id });
    await logAudit(req.session.user, 'delete note');
    res.redirect('/notes');
  } catch (err) {
    res.status(500).send('DB error');
  }
});


// Audit log page (EJS, admin only)
app.get('/audit', requireLogin, requireAdmin, async (req, res) => {
  try {
    const logs = await Audit.find().sort({ timestamp: -1 });
    let logText = logs.map(l => `${l.timestamp.toISOString()} | ${l.username} (${l.role}) | ${l.action}`).join('\n');
    res.render('audit', { logText });
  } catch (err) {
    res.status(500).send('Audit log error');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});


console.log('Connecting to MongoDB URI:', getDbUri());
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
