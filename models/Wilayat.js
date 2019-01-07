// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');
const Governate = require('./Governate');

// import database connection details
const conn = settings.connection;

// create connection
const sequelize = new Sequelize(conn.database, conn.user, conn.password, {
    host: conn.host,
    dialect: conn.dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});

// check database connection
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// schema
const Wilayat = sequelize.define('wilayats', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    }
});

// foreign key relationship
Wilayat.belongsTo(Governate);

// create table and sync database
sequelize.sync().then(() => {
    console.log('Wilayats Table Created!');
}).catch((err) => {
    console.log(err);
});

// export model globaly
module.exports = Wilayat;