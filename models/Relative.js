// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');
const Beneficiary = require('./Beneficiary');
const Relation = require('./Relation');

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
const Relative = sequelize.define('relatives', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    date_of_birth: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: '1900-01-01'
    },
    nationality: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'UNKNOWN'
    },
    mobile: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: true
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: true
    },
    passport: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
    },
    civil_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: true
    },
    address: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    }
});

// foreign key relationship
Relative.belongsTo(Relation);
Relative.belongsTo(Beneficiary);

// create table and sync database
sequelize.sync().then(() => {
    console.log('Relatives Table Created!');
}).catch((err) => {
    console.log(err);
});

// export model globaly
module.exports = Relative;