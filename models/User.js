// import needed libraries
const Sequelize = require('sequelize');
const settings = require('../config/settings');
const encrypt = require('../config/encryption');

// import database connection details
const conn = settings.connection;

// import admin credentails
const super_admin = settings.SUPER_ADMIN;

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

// customer schema
const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    phone: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isNumeric: true,
            notEmpty: true
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.CHAR,
        allowNull: false,
        validate: {
            min: 1,
            max: 1
        }
    }
}, {
    hooks: {
        beforeCreate: (user) => {
            return encrypt.hashData(user.password).then((hash) => {
                user.password = hash;
            }).catch((err) => {
                if(err) console.log(err);
            });
        }
    }
});

// validate password through this method
User.prototype.validPassword = (password, hash) => {
    return encrypt.compareData(password, hash).then((val) => {
        return val;
    });
}

// create customer table once application starts
sequelize.sync().then(() => {

    console.log('Users Table Created!');

    // create super admin user
    return User.create({
        id: super_admin.ID,
        name: super_admin.NAME,
        email: super_admin.EMAIL,
        phone: super_admin.PHONE,
        password: super_admin.PASSWORD,
        type: super_admin.TYPE
    });
}).catch((err) => {
    console.log(err);
});;

module.exports = User;