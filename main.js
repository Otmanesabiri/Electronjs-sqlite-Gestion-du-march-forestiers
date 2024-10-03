 // // main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Ensure the 'userData' directory exists
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'base_donnee2.db');

// Create a new database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(path.join(__dirname, 'base_donnee2.db'), dbPath);
}

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database: ' + err.message);
  }
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 3000,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false ,
    }
  });

  mainWindow.loadFile('dashboard.html');
};

ipcMain.on('create-market', (event, data) => {
  const { numeroMarché, objetMarché,  preneurMarché, nombrePrestation, prestations } = data;

  db.run(`INSERT INTO marchés (numéro_marché, objet_marché, preneur_marché, nombre_prestations) VALUES (?,?,?,?)`, [ numeroMarché,objetMarché, preneurMarché,  nombrePrestation], function(err) {
    if (err) {
      console.error('Failed to create market: ' + err.message);
      event.reply('market-created', false);
    } else {
      const marketId = this.lastID;
      const stmt = db.prepare(`INSERT INTO prestations (marché_id, description, date_debut, date_fin) VALUES (?, ?, ?, ?)`);
      
      prestations.forEach(prestation => {
        stmt.run([marketId, prestation.nom, prestation.date_debut, prestation.date_fin]);
      });

      stmt.finalize();
      event.reply('market-created', true);
    }
  });
});


ipcMain.on('fetch-markets', (event) => {
  const query = `
      SELECT m.numéro_marché, m.nombre_prestations, m.preneur_marché, MAX(p.date_fin) as dernière_date_fin
      FROM marchés m
      LEFT JOIN prestations p ON m.numéro_marché = p.marché_id
      GROUP BY m.numéro_marché
    `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Failed to fetch markets: ' + err.message);
      event.reply('markets-data', { success: false, error: err.message });
    } else {
      event.reply('markets-data', { success: true, data: rows });
    }
  });
});



// Écoute l'événement pour modifier un marché
ipcMain.on('modify-market', (event, data) => {
  if (!data) {
    console.error('Data is null or undefined');
    event.reply('market-modified', { success: false, error: 'Data is null or undefined' });
    return;
  }

  const { numéro_marché, nombre_prestations, preneur_marché } = data;

  const query = `
    UPDATE marchés 
    SET nombre_prestations = ?, preneur_marché = ?
    WHERE numéro_marché = ?
  `;

  db.run(query, [nombre_prestations, preneur_marché, numéro_marché], function(err) {
    if (err) {
      console.error('Failed to modify market: ' + err.message);
      event.reply('market-modified', { success: false, error: err.message });
    } else {
      event.reply('market-modified', { success: true });
    }
  });
});


// Écoute l'événement pour supprimer un marché

ipcMain.on('delete-market', (event, marketId) => {
  // Supprimer d'abord les prestations liées
  db.run(`DELETE FROM prestations WHERE marché_id = ?`, [marketId], function(err) {
    if (err) {
      console.error('Failed to delete related prestations: ' + err.message);
      event.reply('market-deleted', { success: false, error: err.message });
      return;
    }

    // Puis supprimer le marché
    db.run(`DELETE FROM marchés WHERE numéro_marché = ?`, [marketId], function(err) {
      if (err) {
        console.error('Failed to delete market: ' + err.message);
        event.reply('market-deleted', { success: false, error: err.message });
      } else {
        event.reply('market-deleted', { success: true });
        
        // Optionnel: Rafraîchir la liste des marchés
        db.all(`SELECT * FROM marchés`, (err, rows) => {
          if (err) {
            console.error('Failed to fetch markets: ' + err.message);
          } else {
            event.reply('markets-data', { success: true, data: rows });
          }
        });
      }
    });
  });
});

//IPC listener that checks whether the market number already exists in the database.


ipcMain.on('check-market-number', (event, numeroMarché) => {
  console.log(`Checking market number: ${numeroMarché}`);

  const query = `SELECT COUNT(*) as count FROM marchés WHERE numéro_marché = ?`;

  db.get(query, [numeroMarché], (err, row) => {
    if (err) {
      console.error('Failed to check market number:', err.message);
      event.reply('market-number-checked', { success: false, error: err.message });
    } else {
      const isUnique = row.count === 0;  // If count is 0, the number is unique
      console.log(`Market number ${numeroMarché} is ${isUnique ? 'unique' : 'not unique'}`);
      event.reply('market-number-checked', { success: true, isUnique: isUnique });
    }
  });
});


ipcMain.on('fetch-market-number', (event, marketId) => {
  const query = `
    SELECT numéro_marché 
    FROM marchés 
    WHERE numéro_marché = ?
  `;

  db.get(query, [marketId], (err, row) => {
    if (err) {
      console.error('Failed to fetch market number: ' + err.message);
      event.reply('market-number-data', { success: false, error: err.message });
    } else {
      event.reply('market-number-data', { success: true, data: row });
    }
  });
});

ipcMain.on('fetch-prestations', (event, marketId) => {
  const query = `
    SELECT * 
    FROM prestations 
    WHERE marché_id = ?
  `;

  db.all(query, [marketId], (err, rows) => {
    if (err) {
      console.error('Failed to fetch prestations: ' + err.message);
      event.reply('prestations-data', { success: false, error: err.message });
    } else {
      event.reply('prestations-data', { success: true, data: rows });
    }
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


