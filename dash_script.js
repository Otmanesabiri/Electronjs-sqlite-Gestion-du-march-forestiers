let menuicn = document.querySelector("#menuicn");
let nav = document.querySelector(".navcontainer");

menuicn.addEventListener("click", () => {
    nav.classList.toggle("navclose");
})


document.addEventListener('DOMContentLoaded', function() {
  // Assuming you have a method to fetch markets data
  window.electron.send('fetch-markets');

  window.electron.receive('markets-data', (response) => {
    console.log('Response received:', response);
    if (response.success) {
      renderTableData(response.data);
    } else {
      console.error('Failed to fetch markets: ' + response.error);
    }
  });
});

// let menuicn = document.querySelector(".menuicn");
// let nav = document.querySelector(".navcontainer");

// menuicn.addEventListener("click", () => {
//   nav.classList.toggle("navclose");
// });

function renderTableData(data) {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = ''; // Clear existing rows

  // If data is not an array, wrap it in an array
  const dataArray = Array.isArray(data) ? data : [data];


  console.log('Data received:', dataArray);
  
  dataArray.forEach(row => {
    console.log('Processing row:', row);
  
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', row.numéro_marché); // Ajout de data-id
  
    // Calculate status (remaining days)
    const en_cours = calculateRemainingDays(row.dernière_date_fin);
  
    tr.innerHTML = `
      <td class="t-op">N° ${row.numéro_marché || 'N/A'}</td>
      <td class="t-op">${row.nombre_prestations || 'N/A'}</td>
      <td class="t-op">${row.preneur_marché || 'N/A'}</td>
      <td class="t-op">${en_cours}</td>
      <td class="t-op">
        <button class="action-btn modify">Modifier</button>
        <button class="action-btn delete">Supprimer</button>
      </td>
    `;
  
    tbody.appendChild(tr);
  });


  // Add event listeners to the buttons after the rows are rendered
  document.querySelectorAll('.modify').forEach(button => {
    button.addEventListener('click', handleModify);
  });

  document.querySelectorAll('.delete').forEach(button => {
    button.addEventListener('click', handleDelete);
  });

}

function handleModify(event) {
  const marketId = event.target.getAttribute('data-id');
  console.log('Modifying market:', marketId);
  // Open a modal or a new window for modification
  // You can send an IPC event to open a modal with the market data
  window.electron.send('modify-market', marketId);
}

function handleDelete(event) {
  const marketId = event.target.closest('tr').dataset.id;
  console.log('Deleting market:', marketId);

  if (confirm('Êtes-vous sûr de vouloir supprimer ce marché ?')) {
    window.electron.send('delete-market', marketId);
    
    window.electron.once('market-deleted', (response) => {
      if (response.success) {
        // Refresh the table data
        renderTableData(response.data);
      } else {
        console.error('Failed to delete market: ' + response.error);
      }
    });
  }
}



function calculateRemainingDays(date_fin) {
  if (!date_fin) {
    return 'No Date';
  }

  const currentDate = new Date();
  const endDate = new Date(date_fin);
  const remainingTime = endDate - currentDate;
  const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

  if (remainingDays > 0) {
    return `${remainingDays} jours restants`;
  } else if (remainingDays === 0) {
    return 'Se termine aujourd\'hui';
  } else {
    return 'Expiré';
  }
}

window.electron.receive('market-deleted', (response) => {
  if (response.success) {
    // Re-fetch the updated market list
    window.electron.send('fetch-markets');
  } else {
    console.error('Failed to delete market: ' + response.error);
  }
});



document.getElementById('redirectDiv').addEventListener('click', function() {
  window.location.href = 'liste_prestation.html';
});

document.getElementById('redirectDiv2').addEventListener('click', function() {
  window.location.href = 'xls.html';
});
