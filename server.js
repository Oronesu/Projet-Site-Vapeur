const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const path = require('path'); // Pour gérer les chemins de fichiers

const app = express();

// Simuler des utilisateurs
const users = [
    { id: 1, username: 'user1@example.com', password: 'password123' },
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

// Gestion de la route POST /login
app.post(
    '/login',
    passport.authenticate('local', { 
        successRedirect: '/login.html?auth=success', // Ajout d'un paramètre pour signaler le succès
        failureRedirect: '/login.html?auth=failed', // Indicateur d'échec
    })
);

// Démarrer le serveur
app.listen(3000, () => console.log('Serveur lancé sur http://localhost:3000'));
