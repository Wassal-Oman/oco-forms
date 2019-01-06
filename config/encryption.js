const bcrypt = require('bcryptjs');
const settings = require('./settings');

// salt rounds
const saltRounds = settings.round;

const hashData = (text) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            // Encrypt password using bycrpt module
            if (err) return reject(err);

            bcrypt.hash(text, salt, (err, hash) => {
                if (err) return reject(err);
                return resolve(hash);
            });
        });
    });
}

const compareData = (text, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(text, hash, (err, same) => {
            if(err) return reject(err);
            return resolve(same);
        })
    });
}

module.exports.hashData = hashData;
module.exports.compareData = compareData;