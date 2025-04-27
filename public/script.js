document.addEventListener('DOMContentLoaded', () => {
    // --- Partie API GiantBomb (déjà présente) ---
    const apiKey = '5bfe3224040dc95a4255fe5f602918dd6b5afaa8';
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = 'https://www.giantbomb.com/api/games/';
    const pageSize = 10;
    const pcPlatformId = 94;

    async function fetchAndDisplayFilteredGames() {
        try {
            const randomOffset = Math.floor(Math.random() * 1000);
            const apiUrlWithParams = `${proxyUrl}${apiUrl}?api_key=${apiKey}&format=json&limit=${pageSize}&offset=${randomOffset}&field_list=name,deck,image,platforms,original_release_date&filter=platforms:${pcPlatformId}&filter=original_release_date:2020-01-01 00:00:00|2025-03-01 00:00:00`;
            console.log('URL utilisée :', apiUrlWithParams);
            const gamesData = await fetchJson(apiUrlWithParams);
            if (gamesData.results.length === 0) {
                console.warn('Aucun jeu correspondant aux critères.');
                return;
            }
            gamesData.results.forEach((gameInfo, index) => {
                displayGameInfo(gameInfo, `game-info-${index}`, `game-img-${index}`);
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux :', error);
        }
    }

    async function fetchJson(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'My Awesome App' },
        });
        return response.json();
    }

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

    fetchAndDisplayFilteredGames().then(() => {
        console.log("Les jeux ont été affichés, on installe les handlers du panier.");
        setupCartHandlers();
    });
});

function setupCartHandlers() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const card = this.closest('.card');
            if (!card) {
                console.warn("Carte non trouvée.");
                return;
            }
            const titleEl = card.querySelector('h2');
            if (!titleEl) {
                console.warn("Titre introuvable dans la carte.");
                return;
            }
            const gameTitle = titleEl.textContent.trim();
            
            try {
                const response = await fetch('/api/cart/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ gameTitle })
                });
                
                if (response.ok) {
                    console.log(`Jeu ajouté au panier: ${gameTitle}`);
                    const cartResponse = await fetch('/api/cart', { credentials: 'include' });
                    const cart = await cartResponse.json();
                    console.log('Contenu du panier:', cart);
                } else {
                    console.error('Erreur lors de l\'ajout au panier');
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        });
    });
}
