// import needed libraries
const Disaster = require('../models/Disaster');
const Mazyoona = require('../models/Mazyoona');
const Rescue = require('../models/Rescue');
const General = require('../models/General');

// home
module.exports.home = (req, res) => {

    // define promises
    const disasterPromise = getDisasterFormsCount();
    const mazyoonaPromise = getMazyoonaFormsCount();
    const rescuePromise = getRescueFormsCount();
    const generalPromise = getGeneralFormsCount();

    // set active pages
    const pages = {
        home: 'active',
        profile: '',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: ''
    };

    // get all statistics
    Promise.all([disasterPromise, mazyoonaPromise, rescuePromise, generalPromise]).then(val => {
        // render home page
        res.render('researcher/home', {
            user: req.session.user,
            pages,
            disasterCount: val[0],
            mazyoonaCount: val[1],
            rescueCount: val[2],
            generalCount: val[3]
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
}

// profile
module.exports.profile = (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: 'active',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: ''
    };

    // render home page
    res.render('researcher/profile', {
        user: req.session.user,
        pages
    });
}

// get disaster forms
module.exports.getDisasterForms = (req, res) => {

    // set active pages
    const pages = {
        home: '',
        profile: '',
        disaster: 'active',
        mazyoona: '',
        rescue: '',
        general: ''
    };

    // fetch disaster forms
    getDisasterForms().then(val => {
        console.log(val);
        res.render('researcher/disaster-form', {
            user: req.session.user,
            pages,
            data: val
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
}

// get mazyoona forms
module.exports.getMazyoonaForms = (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: '',
        disaster: '',
        mazyoona: 'active',
        rescue: '',
        general: ''
    };

    // fetch mazyoona forms
    getMazyoonaForms().then(val => {
        console.log(val);
        res.render('researcher/mazyoona-form', {
            user: req.session.user,
            pages,
            data: val
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
}

// get rescue forms
module.exports.getRescueForms = (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: '',
        disaster: '',
        mazyoona: '',
        rescue: 'active',
        general: ''
    };

    getRescueForms().then(val => {
        console.log(val);
        res.render('researcher/rescue-form', {
            user: req.session.user,
            pages,
            data: val
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
}

// get general forms
module.exports.getGeneralForms = (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: '',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: 'active'
    };

    getGeneralForms().then(val => {
        console.log(val);
        res.render('researcher/general-form', {
            user: req.session.user,
            pages,
            data: val
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
}

/* **** functions **** */
function getDisasterForms() {
    return new Promise((resolve, reject) => {
        Disaster.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getDisasterFormsCount() {
    return new Promise((resolve, reject) => {
        Disaster.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getMazyoonaForms() {
    return new Promise((resolve, reject) => {
        Mazyoona.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getMazyoonaFormsCount() {
    return new Promise((resolve, reject) => {
        Mazyoona.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getRescueForms() {
    return new Promise((resolve, reject) => {
        Rescue.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getRescueFormsCount() {
    return new Promise((resolve, reject) => {
        Rescue.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getGeneralForms() {
    return new Promise((resolve, reject) => {
        General.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getGeneralFormsCount() {
    return new Promise((resolve, reject) => {
        General.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}