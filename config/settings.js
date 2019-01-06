const connection = {
    host: "31.170.166.179",
    user: "u327976002_oco",
    password: "oco123",
    database: "u327976002_oco",
    dialect: "mysql"
};

const saltRound = 10;
const HOST = 'http://localhost:3000';

const EMAIL_CREDENTAILS = {
    SMTP_HOST: "smtp.oco.org.om",
    SMTP_PORT: 25,
    AUTH: {
        user: "no-reply@oco.org.om",
        pass: "@c@654987321"
    },
    TLS: {
        rejectUnauthorized: false
    }
};

const SUPER_ADMIN = {
    ID: 144,
    NAME: 'غانم المرزوقي',
    EMAIL: 'ghanim.almarzouqi@oco.org.om',
    PASSWORD: 'oco654321',
    PHONE: '96132329',
    TYPE: 'A'
};

const JWT_SECRET_KEY = 'API_JWT_SECRET';

module.exports.connection = connection;
module.exports.round = saltRound;
module.exports.EMAIL_CREDENTAILS = EMAIL_CREDENTAILS;
module.exports.SUPER_ADMIN = SUPER_ADMIN;
module.exports.JWT_SECRET_KEY = JWT_SECRET_KEY;
module.exports.HOST = HOST;