document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '5bfe3224040dc95a4255fe5f602918dd6b5afaa8'; // Clé API GiantBomb
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';  // Reverse Proxy pour éviter CORS
    const apiUrl = 'https://www.giantbomb.com/api/games/';

    // Étape 1 : Récupérer une liste d'IDs de jeux
    fetch(`${proxyUrl}${apiUrl}?api_key=${apiKey}&format=json&limit=100&field_list=id`, {
        method: 'GET',
        headers: {
            'User-Agent': 'My Awesome App'  // Obligatoire pour utiliser l'API
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Games List:', data);
        const gamesList = data.results;

        // Étape 2 : Sélectionner 3 IDs au hasard
        const randomGameIds = getRandomGameIds(gamesList, 3);

        // Étape 3 : Récupérer les détails des jeux sélectionnés
        randomGameIds.forEach((gameId, index) => {
            fetch(`${proxyUrl}https://www.giantbomb.com/api/game/${gameId}/?api_key=${apiKey}&format=json`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'My Awesome App'
                }
            })
            .then(response => response.json())
            .then(gameDetails => {
                console.log('Game Details:', gameDetails);

                // Étape 4 : Afficher les informations dans les "tiles" correspondantes
                const gameInfo = gameDetails.results;
                const elementId = `game-info-${index}`;
                const imageElementId = `game-img-${index}`;
                displayGameInfo(gameInfo, elementId, imageElementId);
            })
            .catch(error => console.error('Error fetching game details:', error));
        });
    })
    .catch(error => console.error('Error fetching games list:', error));

    // Fonction pour sélectionner des IDs de jeux au hasard
    function getRandomGameIds(gamesList, numGames) {
        return Array.from({ length: numGames }, () => 
            gamesList[Math.floor(Math.random() * gamesList.length)].id
        );
    }

    // Fonction pour afficher les informations d'un jeu
    function displayGameInfo(gameInfo, elementId, imageElementId) {
        const gameElement = document.getElementById(elementId);
        const imageElement = document.getElementById(imageElementId);
    
        if (gameElement) {
            gameElement.innerHTML = `
                <h2>${gameInfo.name}</h2>
                <p>${gameInfo.deck || 'Description non disponible'}</p>
            `;
        }
    
        if (imageElement) {
            imageElement.src = gameInfo.image?.original_url || 'default-image.jpg';
            imageElement.alt = gameInfo.name || 'Game Image';
        }
    }
})


//Ajouter persistence et caching pour un charment plus rapide
//Promise pour chargement en paralléle ?