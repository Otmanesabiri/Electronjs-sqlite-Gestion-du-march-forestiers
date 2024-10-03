const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to your database file
const dbPath = path.join(__dirname, 'base_donnee2.db');

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database: ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create the tables
db.serialize(() => {
  // Create 'markets' table
  db.run(`
    CREATE TABLE IF NOT EXISTS marchés (
      numéro_marché INTEGER PRIMARY KEY ,
      objet_marché TEXT NOT NULL,
      preneur_marché TEXT NOT NULL,
      nombre_prestations INTEGER NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating markets table: ' + err.message);
    } else {
      console.log('Created markets table.');
    }
  });

  // Create 'prestations' table
  db.run(`
    CREATE TABLE IF NOT EXISTS prestations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marché_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      date_debut TEXT,
      date_fin TEXT,
      FOREIGN KEY(marché_id) REFERENCES marchés(numéro_marché)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating prestations table: ' + err.message);
    } else {
      console.log('Created prestations table.');
    }
  });
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database: ' + err.message);
  } else {
    console.log('Database connection closed.');
  }
});
