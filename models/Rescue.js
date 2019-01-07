// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');
const Beneficiary = require('./Beneficiary');

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
const Rescue = sequelize.define('rescues', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    }
});

// foreign key relationship
Rescue.belongsTo(Beneficiary);

// create table and sync database
sequelize.sync().then(() => {
    console.log('Rescue Table Created!');
}).catch((err) => {
    console.log(err);
});

// export model globaly
module.exports = Rescue;