const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const path = require('path'); // Pour gérer les chemins de fichiers

const app = express();

//parite API perso
const fs = require('fs');
const cartFilePath = path.join(__dirname, 'temp_cart.json');

if (!fs.existsSync(cartFilePath)) {
    fs.writeFileSync(cartFilePath, JSON.stringify([]));
}

// Simuler des utilisateurs
const users = [
    { id: 1, username: 'caca@gmail.com', password: 'pipicaca' },
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


// Middleware
app.use(express.urlencoded({ extended: false })); // Traitement des formulaires
app.use(session({ secret: 'secret_key', resave: false, saveUninitialized: false })); // Sessions utilisateur
app.use(passport.initialize());
app.use(passport.session());

// Servir les fichiers statiques dans le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));
// Ajoutez cette ligne après app.use(express.urlencoded...
app.use(express.json()); // Pour parser les corps de requête JSON
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


//API PERSO
app.post('/api/cart/add', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { gameTitle } = req.body;
    if (!gameTitle) {
        return res.status(400).json({ error: 'Game title is required' });
    }

    const cart = JSON.parse(fs.readFileSync(cartFilePath));
    cart.push(gameTitle);
    fs.writeFileSync(cartFilePath, JSON.stringify(cart));

    res.json({ success: true });
});

app.get('/api/cart', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const cart = JSON.parse(fs.readFileSync(cartFilePath));
    res.json(cart);
});
// Nettoyer le fichier à la fermeture du serveur
process.on('SIGINT', () => {
    if (fs.existsSync(cartFilePath)) {
        fs.unlinkSync(cartFilePath);
    }
    process.exit();
});

// Démarrer le serveur
app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
