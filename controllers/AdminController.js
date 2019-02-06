// import needed libraries
const User = require('../models/User');
const Disaster = require('../models/Disaster');
const Mazyoona = require('../models/Mazyoona');
const Rescue = require('../models/Rescue');
const General = require('../models/General');
const Category = require('../models/Category');
const Governate = require('../models/Governate');

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
        users: '',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: '',
        settings: ''
    };

    // get all statistics
    Promise.all([disasterPromise, mazyoonaPromise, rescuePromise, generalPromise]).then(val => {
        // render home page
        res.render('admin/home', {
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
        users: '',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: '',
        settings: ''
    };

    // render home page
    res.render('admin/profile', {
        user: req.session.user,
        pages
    });
}

// users
module.exports.getUsers =  (req, res) => {
    //get users
    getUsers().then(val => {
        // set active pages
        const pages = {
            home: '',
            profile: '',
            users: 'active',
            disaster: '',
            mazyoona: '',
            rescue: '',
            general: '',
            settings: ''
        };

        res.render('admin/users', {
            user: req.session.user,
            pages,
            users: val
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
}

// add user - GET
module.exports.addUserGet = (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: '',
        users: 'active',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: '',
        settings: ''
    };

    res.render('admin/add-user', {
        user: req.session.user,
        pages
    });
}

// add user - POST
module.exports.addUserPost = (req, res) => {
    // get user inputs
    const { id, name, phone, email, password, type } = req.body;

    // add new user
    User.create({
        id,
        name,
        phone,
        email,
        password,
        type
    }).then(val => {
        console.log(val);
        req.flash('success', 'تم تسجيل مستخدم جديد');
        res.redirect('/admin/add-user');
    }).catch(err => {
        console.log(err);
        req.flash('error', 'حدث خطأ اثناء تسجيل المستخدم');
        res.redirect('/admin/add-user');
    });
}

// delete user
module.exports.deleteUser = (req, res) => {
    // get user id
    const id = req.params.id;

    // delete user based on id
    if(id != req.session.user.id) {
        User.destroy({ where: { id } }).then(val => {
            if(val > 0) {
                req.flash('success', 'تم حذف المستخدم بنجاح');
                res.redirect('/admin/users');
            } else {
                req.flash('warning', 'لم يتم حذف المستخدم');
                res.redirect('/admin/users');
            }
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        req.flash('error', 'لا يمكن حذف المستخدم الحالي');
        res.redirect('/admin/users');
    }
}

// update user - GET
module.exports.updateUserGet = (req, res) => {
    // get user id
    const id = req.params.id;

    // fetch user data
    User.findOne({ where: { id } }).then(user => {
        if(!user) {
            req.flash('error', 'لا يوجد بيانات لهذا المستخدم');
            res.redirect('/admin/users');
        } else {
            // active page
            const pages = {
                home: '',
                profile: '',
                users: 'active',
                disaster: '',
                mazyoona: '',
                rescue: '',
                general: '',
                settings: ''
            };

            // render update user page
            res.render('admin/update-user', {
                user: req.session.user,
                pages,
                employee: user.dataValues
            });
        }
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
    });
}

// update user - POST
module.exports.updateUserPost = (req, res) => {
    // get updated data
    const { id, name, phone, email, password, type } = req.body;

    // encrypt new password
    encrypt.hashData(password).then(hash => {
        // update user based on id
        User.update({ name, phone, email, password: hash, type }, { where: { id }}).then(val => {
            console.log(val);
            req.flash('success', 'تم تعديل بيانات المستخدم بنجاح');
            res.redirect('/admin/users');
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    }).catch(err => {
        console.log(err);
        req.flash('error', 'لا يمكن تشفير كلمة المرور');
        res.redirect('/admin/users');
    });
}

// settings
module.exports.settings = (req, res) => {
    // promises
    const categories = getCategories();
    const governates = getGovenates();

    // run all promises
    Promise.all([categories, governates]).then(val => {
        // set active pages
        const pages = {
            home: '',
            profile: '',
            users: '',
            disaster: '',
            mazyoona: '',
            rescue: '',
            general: '',
            settings: 'active'
        };

        res.render('admin/settings', {
            user: req.session.user,
            pages,
            categories: val[0],
            governates: val[1]
        });
    }).catch(err => {
        console.log(err);
        res.redirect('/500');
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
        res.render('admin/disaster-form', {
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
        res.render('admin/mazyoona-form', {
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
        res.render('admin/rescue-form', {
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
        res.render('admin/general-form', {
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
function getUsers() {
    return new Promise((resolve, reject) => {
        User.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getUsersCount() {
    return new Promise((resolve, reject) => {
        User.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

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

function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getCategoriesCount() {
    return new Promise((resolve, reject) => {
        Category.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getGovenates() {
    return new Promise((resolve, reject) => {
        Governate.findAll().then(val => {
            return resolve(val);
        }).catch(err => {
            return reject(err);
        });
    });
}

function getGovenatesCount() {
    return new Promise((resolve, reject) => {
        Governate.findAndCountAll().then(val => {
            return resolve(val.count);
        }).catch(err => {
            return reject(err);
        });
    });
}