// import needed libraries
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const flash = require('connect-flash');

// import routes
const api = require('./routes/api');
const dashboard = require('./routes/dashboard');

// initialize app and specify port
const app = express();
const port = 3000 || process.env.PORT;

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(express.static('public'));
app.use(session({
    key: 'user',
    secret: 'oco',
    resave: false,
    saveUninitialized: true
}));

// set the view engine and views folder
app.set('view engine', 'ejs');
app.set('views', 'views');

// notification messages
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    next();
});

// routes
app.use('/api', api);
app.use('/', dashboard);

// run app
app.listen(port, () => console.log(`Running on port ${port}`));