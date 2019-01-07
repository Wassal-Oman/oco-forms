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
const Accommodation = sequelize.define('accommodations', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    is_owned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    type: {
        type: Sequelize.STRING,
        allowNull: true
    },
    room_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    corridor_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    flat_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    roof: {
        type: Sequelize.STRING,
        allowNull: true
    },
    floor: {
        type: Sequelize.STRING,
        allowNull: true
    },
    wall: {
        type: Sequelize.STRING,
        allowNull: true
    },
    content: {
        type: Sequelize.STRING,
        allowNull: true
    },
    others: {
        type: Sequelize.STRING,
        allowNull: true
    },
    uses: {
        type: Sequelize.STRING,
        allowNull: true
    },
    is_furnished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    furniture_status: {
        type: Sequelize.STRING,
        allowNull: true
    },
    is_financed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    finance_type: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

// foreign key relationship
Accommodation.belongsTo(Beneficiary);

// create table and sync database
sequelize.sync().then(() => {
    console.log('Accommodations Table Created!');
}).catch((err) => {
    console.log(err);
});

// export model globaly
module.exports = Accommodation;