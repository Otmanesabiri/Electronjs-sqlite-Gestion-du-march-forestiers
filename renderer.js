document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");  // Vérifie que l'événement DOM est bien déclenché
  
    const marketForm = document.getElementById('marketForm');
    const prestationsContainer = document.getElementById('prestationsContainer');
    const nombrePrestationInput = document.getElementById('nombrePrestation');
  
    if (!marketForm) {
        console.error("marketForm element not found.");
    }
    if (!prestationsContainer) {
        console.error("prestationsContainer element not found.");
    }
    if (!nombrePrestationInput) {
        console.error("nombrePrestationInput element not found.");
    }
  
    const generatePrestationFields = (count) => {
        console.log("Generating prestation fields: ", count);
        prestationsContainer.innerHTML = '';  // Reset the container
        for (let i = 1; i <= count; i++) {
            const prestationDiv = document.createElement('div');
            prestationDiv.classList.add('prestation');
            prestationDiv.innerHTML = `
                <div class="form-group">
                    <label for="prestation${i}">Prestation ${i}:</label>
                    <input type="text" id="prestation${i}" name="prestations[${i-1}][nom]" placeholder="Description de la prestation ${i}" required>
                </div>
                <div class="form-group">
                    <label for="dateDebut${i}">Date de début:</label>
                    <input type="date" id="dateDebut${i}" name="prestations[${i-1}][date_debut]" required>
                </div>
                <div class="form-group">
                    <label for="dateFin${i}">Date de fin:</label>
                    <input type="date" id="dateFin${i}" name="prestations[${i-1}][date_fin]" required>
                </div>
            `;
            prestationsContainer.appendChild(prestationDiv);
        }
    };
  
    // Debug the input event
    nombrePrestationInput.addEventListener('input', (event) => {
        const count = parseInt(event.target.value, 10) || 1;
        console.log("Nombre de prestations:", count);
        generatePrestationFields(count);
    });
  
    // Debug initial prestation generation
    generatePrestationFields(parseInt(nombrePrestationInput.value, 10) || 1);
  
    const isEndDateValid = (startDate, endDate) => {
        const valid = new Date(startDate) < new Date(endDate);
        console.log("Validating dates:", startDate, endDate, "->", valid);
        return valid;
    };
  
    const validateForm = () => {
        console.log("Validating form...");
        const numeroMarché = document.getElementById('numeroMarché').value;
        const objetMarché = document.getElementById('objetMarché').value;
        const preneurMarché = document.getElementById('preneurMarché').value;
        const prestationCount = parseInt(nombrePrestationInput.value);
        let isValid = true;
  
        if (!numeroMarché || !objetMarché || !preneurMarché) {
            alert('Tous les champs sont requis.');
            isValid = false;
        }
  
        for (let i = 1; i <= prestationCount; i++) {
            const prestation = document.getElementById(`prestation${i}`).value;
            const dateDebut = document.getElementById(`dateDebut${i}`).value;
            const dateFin = document.getElementById(`dateFin${i}`).value;
  
            if (!prestation || !dateDebut || !dateFin) {
                alert(`Tous les champs de la prestation ${i} sont requis.`);
                isValid = false;
                break;
            }
  
            if (!isEndDateValid(dateDebut, dateFin)) {
                alert(`La date de fin doit être supérieure à la date de début pour la prestation ${i}.`);
                isValid = false;
                break;
            }
        }
  
        return isValid;
    };
  
    marketForm.addEventListener('submit', (event) => {
        event.preventDefault();
        console.log("Form submitted.");
        if (!validateForm()) {
            console.log("Form validation failed.");
            return;
        }
  
        const numeroMarché = document.getElementById('numeroMarché').value;
  
        // Vérifier l'unicité du numéro de marché
        console.log("Checking market number uniqueness:", numeroMarché);
        window.electron.send('check-market-number', numeroMarché);

        window.electron.receive('market-number-checked', (result) => {
        console.log("Market number check result:", result);
    
        if (!result.success) {
        // Handle errors from the main process
        alert(`Error: ${result.error}`);
         return;
        }

        if (!result.isUnique) {
        alert('Le numéro du marché existe déjà. Veuillez en saisir un autre.');
        return;
        }

    // Proceed with creating the market if unique
    const objetMarché = document.getElementById('objetMarché').value;
    const preneurMarché = document.getElementById('preneurMarché').value;
    const prestationCount = parseInt(nombrePrestationInput.value);
    const prestations = [];

    for (let i = 1; i <= prestationCount; i++) {
        const prestation = document.getElementById(`prestation${i}`).value;
        const dateDebut = document.getElementById(`dateDebut${i}`).value;
        const dateFin = document.getElementById(`dateFin${i}`).value;
        prestations.push({ nom: prestation, date_debut: dateDebut, date_fin: dateFin });
    }

    const marketData = {
        numeroMarché: numeroMarché,
        objetMarché: objetMarché,
        preneurMarché: preneurMarché,
        nombrePrestation: prestationCount,
        prestations: prestations
    };
    console.log('Data to send:', marketData);  // Vérifier les données envoyées
    window.electron.send('create-market', marketData);
});

    });

    
  
    window.electron.receive('market-created', (success) => {
        console.log("Market created event received:", success);
        const messageDiv = document.getElementById('message-div');
        if (messageDiv) {
            messageDiv.textContent = success ? 'Market created successfully' : 'Error creating market';
            messageDiv.style.color = success ? 'green' : 'red';
        } else {
            console.error("Element 'message-div' not found.");
        }
    });
  });
  