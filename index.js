const express = require('express');
const { create } = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const User = require('./Models/User');
require('dotenv').config();
require('./db/sqlMongoose');

const app = express();

// Configuración de la sesión
app.use(session({
    secret: '52D5FA11-9E49-49D4-A0FD-394E0D0FE98E',
    resave: false,
    saveUninitialized: false,
    name: "secret-name-yolo", // Nombre personalizado para la cookie de la sesión
}));

app.use(flash());

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, { id: user._id, userName: user.userName }));

passport.deserializeUser(async (user, done) => {
    try {
        const userdb = await User.findById(user.id);
        if (!userdb) {
            console.log(userdb)
            return done(new Error('User not found'));
        }
        return done(null, { id: userdb._id, username: userdb.userName });
    } catch (error) {
        return done(error);
    }
});

// Configuración de Handlebars
const hbs = create({
    extname: 'hbs',
    layoutsDir: 'Views/Layouts', // Esta debe ser una cadena
    partialsDir: 'Views/Components', // También debe ser una cadena
    defaultLayout: 'main' // Nombre del archivo de layout sin la extensión
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './Views');



app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('Views', './Views');


// Middleware para leer datos del formulario
app.use(express.urlencoded({ extended: false }));



// Middleware para manejar JSON
app.use(express.json());

// Rutas principales
app.use('/auth', require('./Routes/authRoutes'));
app.use('/', require('./Routes/homeRoutes'));


// Archivos estáticos
app.use(express.static(__dirname + '/public'));

// Levantar el servidor
const PORT = process.env.PORT || 3000; // Default por si falta la variable PORT
app.listen(PORT, () => {
    console.log(`Escuchando en el puerto http://localhost:${PORT}/auth/`);
});
