// auth.js
//
// Gère toutes les fonction qui seront relatives à la connexion au site
//


document.addEventListener('DOMContentLoaded', () => {
    // Gestion de l'état utilisateur
    fetch('/user-status')
        .then(response => response.json())
        .then(data => {
            const navbarStatus = document.getElementById('navbar-status');
            const authButton = document.getElementById('auth-button');
            //on verifie si l'utilisateur est connecté et on adapte le texte et le bouton de connexion selon le cas
            if (data.isLoggedIn) {
                navbarStatus.innerText = 'Connecté';
                authButton.innerText = 'Se Déconnecter';
                authButton.href = '/logout';
            } else {
                navbarStatus.innerText = 'Invité';
                authButton.innerText = 'Se Connecter';
                authButton.href = '/login.html';
            }
        })
        .catch(err => console.error('Erreur lors de la récupération de l\'état utilisateur :', err));



    // Affichage des messages de succès ou d'échec sur login.html
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    // On regarde si l'utilisateur à réussi à se connecter
    if (authStatus === 'success') {
        // On affiche le bandeau de succés
        const successBanner = document.getElementById('success-banner');
        successBanner.style.display = 'block';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    } else if (authStatus === 'failed') {
        const errorBanner = document.createElement('div');
        errorBanner.className = 'alert alert-danger text-center mt-3';
        errorBanner.innerText = 'Échec de l\'authentification. Veuillez réessayer.';
        document.body.insertBefore(errorBanner, document.body.firstChild);
    }
});
