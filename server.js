const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const path = require('path'); // Pour gérer les chemins de fichiers
const fs = require('fs');


const app = express();
const cartFilePath = path.join(__dirname, 'cart.json');

// Simuler des utilisateurs
const users = [
    { id: 1, username: 'caca@example.com', password: 'pipicaca' },
    { id: 2, username: 'user2@example.com', password: 'mypassword' },
];

// Configuration de Passport.js
passport.use(
    new LocalStrategy((username, password, done) => {
        const user = users.find(u => u.username === username && u.password === password);
        return user ? done(null, user) : done(null, false, { message: 'Identifiants incorrects.' });
    })
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
});

// Créer cart.json s'il n'existe pas
if (!fs.existsSync(cartFilePath)) {
    fs.writeFileSync(cartFilePath, '[]');
}

// Middleware
app.use(express.urlencoded({ extended: false })); // Traitement des formulaires
app.use(session({ secret: 'secret_key', resave: false, saveUninitialized: false })); // Sessions utilisateur
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
// Servir les fichiers statiques dans le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Gestion de la route POST /login
app.post(
    '/login',
    passport.authenticate('local', { 
        successRedirect: '/login.html?auth=success', // Ajout d'un paramètre pour signaler le succès
        failureRedirect: '/login.html?auth=failed', // Indicateur d'échec
    })
);

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Erreur lors de la déconnexion');
        }
        res.redirect('/login.html');
    });
});

//route pour vérifier le statut de l'auth de l'utilisateur
app.get('/user-status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});


// API pour ajouter un jeu
app.post('/api/cart', (req, res) => {
    const { title } = req.body;
    const cart = JSON.parse(fs.readFileSync(cartFilePath));
    
    cart.push({
        title,
        addedAt: new Date().toISOString()
    });
    
    fs.writeFileSync(cartFilePath, JSON.stringify(cart, null, 2));
    res.json({ success: true });
});

// API pour récupérer le panier
app.get('/api/cart', (req, res) => {
    const cart = JSON.parse(fs.readFileSync(cartFilePath));
    res.json(cart.map(item => item.title));
});

//suppression fichier fermeture
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
    if (fs.existsSync(cartFilePath)) {
        fs.unlinkSync(cartFilePath);
        console.log('Panier supprimé');
    }
    process.exit();
}


// Servir les fichiers statiques
app.use(express.static('public'));

// Démarrer le serveur
app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
