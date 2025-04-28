const config = {
    home: {
        pageSize: 10,
        dateFilter: '2020-01-01 00:00:00|2025-03-01 00:00:00'
    },
    category: {
        pageSize: 12, // 3 lignes de 4
        dateFilter: '2010-01-01 00:00:00|2025-03-01 00:00:00'
    }
};
const apiKey = '5bfe3224040dc95a4255fe5f602918dd6b5afaa8';
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = 'https://www.giantbomb.com/api/games/';
const pcPlatformId = 94;


async function fetchJson(url) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'My Awesome App' }
    });
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayFilteredGames();
});


async function fetchAndDisplayFilteredGames() {
    const gamesContainer = document.getElementById('games-container');
    const pageType = gamesContainer.dataset.pageType;
    const { pageSize, dateFilter } = config[pageType];

    try {
        const randomOffset = Math.floor(Math.random() * 1000);
        const apiUrlWithParams = `${proxyUrl}${apiUrl}?api_key=${apiKey}&format=json&limit=${pageSize}&offset=${randomOffset}&field_list=name,deck,image,platforms,original_release_date&filter=platforms:${pcPlatformId}&filter=original_release_date:${dateFilter}`;

        const gamesData = await fetchJson(apiUrlWithParams);

        gamesContainer.innerHTML = gamesData.results
            .map((game, index) => createGameTile(game, index, pageType))
            .join('');

    } catch (error) {
        gamesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Erreur de chargement des jeux</p>
                <small>${error.message}</small>
            </div>`;
    }
}

function createGameTile(gameInfo, index, pageType) {
    return `
    <div class="col">
        <div class="card h-100 ${pageType === 'category' ? 'category-card' : ''}">
            <div class="img-container">
                <img src="${gameInfo.image?.original_url || 'default-image.jpg'}" 
                     class="card-img-top" 
                     alt="${gameInfo.name}">
                <img src="img/add.png" 
                     class="hover-icon"
                     data-game-index="${index}"
                     data-game-title="${gameInfo.name}"
                     role="button">
            </div>
            <div class="card-body">
                <h3 class="h5">${gameInfo.name}</h3>
                <p class="game-description">
                    ${gameInfo.deck || 'Description non disponible'}
                </p>
                ${pageType === 'category' ? 
                    `<div class="category-meta">
                        <small>Sortie : ${gameInfo.original_release_date?.split(' ')[0] || 'Inconnue'}</small>
                    </div>` : ''}
            </div>
        </div>
    </div>`;
}


document.addEventListener('click', async (e) => {
    // Ajout au panier


    /*if (e.target.classList.contains('hover-icon')) {
        const index = e.target.dataset.gameIndex;
        const title = e.target.dataset.gameTitle;
        alert(`Tile n°${index}\nJeu : ${title}`);
    }*/
    if (e.target.classList.contains('hover-icon')) {
        const title = e.target.dataset.gameTitle;
        
        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            
            if (response.ok) {
                alert(`"${title}" ajouté au panier !`);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
    
    // Affichage du panier
    if (e.target.classList.contains('panier-icon')) {
        try {
            const response = await fetch('/api/cart');
            const games = await response.json();
            
            const message = games.length > 0 
                ? `Votre panier:\n- ${games.join('\n- ')}` 
                : 'Panier vide';
                
            alert(message);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
});