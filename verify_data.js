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

// Fetch all projects and their prestations
db.serialize(() => {
  db.each(`SELECT * FROM marchés`, (err, row) => {
    if (err) {
      console.error('Error fetching data from markets table: ' + err.message);
    }
    console.log(`marché: ${row.numéro_marché} (preneur: ${row.preneur_marché}, Nombre de prestations: ${row.nombre_prestations})`);
    
    db.each(`SELECT * FROM prestations WHERE marché_id = ${row.numéro_id}`, (err, prestation) => {
      if (err) {
        console.error('Error fetching data from prestations table: ' + err.message);
      }
      console.log(`  Prestation: ${prestation.description} (ID: ${prestation.id}, Date début: ${prestation.date_debut}, Date fin: ${prestation.date_fin})`);
    });
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
