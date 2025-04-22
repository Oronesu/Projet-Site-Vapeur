document.addEventListener('DOMContentLoaded', () => {
    // script.js
    //
    // Gère principalement l'API GiantBomb
    //
        
    const apiKey = '5bfe3224040dc95a4255fe5f602918dd6b5afaa8'; // Clé API GiantBomb
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Reverse Proxy pour éviter CORS
    const apiUrl = 'https://www.giantbomb.com/api/games/';
    const pageSize = 10; // Nombre maximum de jeux à récupérer directement
    const pcPlatformId = 94; // Identifiant pour les jeux PC (GiantBomb)

    async function fetchAndDisplayFilteredGames() {
        try {
            // Créer une URL avec les deux filtres : date et plateforme
            const randomOffset = Math.floor(Math.random() * 1000); // pagination aléatoire
            const apiUrlWithParams = `${proxyUrl}${apiUrl}?api_key=${apiKey}&format=json&limit=${pageSize}&offset=${randomOffset}&field_list=name,deck,image,platforms,original_release_date&filter=platforms:${pcPlatformId}&filter=original_release_date:2020-01-01 00:00:00|2025-03-01 00:00:00`;

            console.log('URL utilisée :', apiUrlWithParams); // Pour débogage

            const gamesData = await fetchJson(apiUrlWithParams);

            // Vérifier les résultats retournés
            if (gamesData.results.length === 0) {
                console.warn('Aucun jeu correspondant aux critères.');
                return;
            }

            // Afficher chaque jeu dans les éléments correspondants
            gamesData.results.forEach((gameInfo, index) => {
                displayGameInfo(gameInfo, `game-info-${index}`, `game-img-${index}`);
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux :', error);
        }
    }

    // Fonction utilitaire pour effectuer une requête fetch et obtenir une réponse JSON
    async function fetchJson(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'My Awesome App' },
        });
        return response.json();
    }

    // Fonction pour afficher les informations d'un jeu
    function displayGameInfo(gameInfo, elementId, imageElementId) {
        const gameElement = document.getElementById(elementId);
        const imageElement = document.getElementById(imageElementId);

        if (gameElement) {
            gameElement.innerHTML = `
                <h2>${gameInfo.name}</h2>
                <p class="game-description">${gameInfo.deck || 'Description non disponible'}</p>
            `;
        }

        if (imageElement) {
            imageElement.src = gameInfo.image?.original_url || 'default-image.jpg';
            imageElement.alt = gameInfo.name || 'Game Image';
        }
    }


    // Lancer la récupération et l'affichage des jeux filtrésd
    fetchAndDisplayFilteredGames();
});
