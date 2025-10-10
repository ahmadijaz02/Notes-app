module.exports = {
  PRIMARY_DB_DOWN: false, // Set to true to simulate primary DB failure
  PRIMARY_DB_URI: 'mongodb+srv://mahmadijaz192:ahmad3643@cluster0a.e4g2z.mongodb.net/notes_primary?retryWrites=true&w=majority&appName=Cluster0A',
  FALLBACK_DB_URI: 'mongodb://localhost:27017/notes_fallback'
};
