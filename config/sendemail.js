const nodemailer = require('nodemailer');
const settings = require('./settings');

const config = settings.EMAIL_CREDENTAILS;

module.exports = (receiver, subject, emailBody) => {

    // mail configuration
    let transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: false,
        auth: config.AUTH,
        tls: config.TLS
    });
    
    // mail options
    let mailOptions = {
        from: '"استمارات الباحث الاجتماعي" <no-reply@oco.org.om>',
        to: receiver,
        subject: subject,
        text: '',
        html: emailBody
    };
    
    return new Promise((resolve, reject) => {
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(`EMAIL ERROR: ${err.message}`);
                return reject(false);
            } else {
                return resolve(true);
            }
        });
    });
}