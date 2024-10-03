// Fix variable name and access 'data' correctly
window.electron.receive('market-number-data', (marketsResponse) => {
  console.log('Markets data callback triggered');
  console.log('Markets data received:', marketsResponse); // Check the structure of data received
  const select = document.querySelector('#marcheSelect');

  // Access the 'data' field which contains the array of markets
  const markets = marketsResponse.data;
  
  if (Array.isArray(markets)) {
    select.innerHTML = '<option value="">-- Sélectionner un marché --</option>'; // Default option
    
    markets.forEach(market => {
      console.log('Market object:', market); // Check the structure of each market object
      
      if (market && market.numéro_marché) {
        console.log('numéro_marché:', market.numéro_marché);
        const option = document.createElement('option');
        option.value = market.id;  // Ensure 'id' is the correct identifier
        option.textContent = market.numéro_marché;
        select.appendChild(option);
      } else {
        console.warn('numéro_marché is missing or undefined for market:', market);
      }
      
    });
  } else {
    console.error('La réponse des marchés n\'est pas un tableau:', markets);
  }
});

// Event listener for selecting a market and fetching prestations
document.querySelector('#marcheSelect').addEventListener('change', (event) => {
  const marketId = event.target.value;
  console.log('Selected market ID:', marketId); // Ensure the ID is correctly selected

  if (marketId) {
    window.electron.send('fetch-prestations', marketId);
    console.log('Sending fetch-prestations request with market ID:', marketId);
  } else {
    console.error('No market ID selected.');
  }
});

// Listening for the prestations data response
window.electron.receive('prestations-data', (response) => {
  console.log('Prestations data received:', response); // Check the structure of the data

  if (response.success) {
    const prestations = response.data;
    console.log('Prestations data:', prestations); // Check the structure of each prestation
    const table = document.querySelector('#marche1 table');
    
    // Reset table header
    table.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Description</th>
        <th>Date Début</th>
        <th>Date Fin</th>
        <th>Jours Restant</th>
      </tr>
    `;

    prestations.forEach(prestation => {
      console.log('Prestation object:', prestation); // Check each prestation object
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${prestation.id}</td>
        <td>${prestation.description}</td>
        <td>${new Date(prestation.date_debut).toLocaleDateString()}</td>
        <td>${new Date(prestation.date_fin).toLocaleDateString()}</td>
        <td>${calculateDaysRemaining(prestation.date_fin)}</td>
      `;
      table.appendChild(tr);
    });
  } else {
    console.error('Erreur lors de la récupération des prestations:', response.error);
  }
});

// Function to calculate days remaining until the end date
function calculateDaysRemaining(dateFin) {
  const today = new Date();
  const endDate = new Date(dateFin);
  const timeDiff = endDate - today;
  return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
}

// Event listener for fetching prestations based on selected market ID
document.querySelector('#fetchPrestationsButton').addEventListener('click', () => {
  const marketId = document.querySelector('#marcheSelect').value;
  console.log('Selected market ID:', marketId); // Ensure the ID is correctly selected
  if (!marketId) {
    alert('Veuillez sélectionner un marché.');
    return;
  }
  window.electron.send('fetch-prestations', marketId);
  console.log('Sending fetch-prestations request with market ID:', marketId);
});
