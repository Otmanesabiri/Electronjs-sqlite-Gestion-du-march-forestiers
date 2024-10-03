// 

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Créer une instance de la base de données
const db = new sqlite3.Database('base_donnee2.db');

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));

// Endpoint pour récupérer les données
app.get('/api/marches', (req, res) => {
    db.all('SELECT m.numéro_marché, m.nombre_prestations, m.preneur_marché, MAX(p.date_fin) as dernière_date_fin \
            FROM marchés m \
            LEFT JOIN prestations p ON m.numéro_marché = p.marché_id \
            GROUP BY m.numéro_marché \
            ORDER BY dernière_date_fin DESC', 
     (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
