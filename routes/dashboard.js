// import needed libraries
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const encrypt = require('../config/encryption');
const settings = require('../config/settings');
const Disaster = require('../models/Disaster');
const Mazyoona = require('../models/Mazyoona');
const Rescue = require('../models/Rescue');
const General = require('../models/General');

// initialize router
const router = express.Router();

// get JWT secret key
const jwtSecretKey = settings.JWT_SECRET_KEY;

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }    
};

// default route
router.get('/', sessionChecker, (req, res) => {
    res.redirect('/home');
});

// login routes
router.get('/login', (req, res) => {
    if(req.session.user) {
        res.redirect('/home');
    } 
    res.render('login');
});

router.post('/login', (req, res) => {
    // get employee number and password
    const { id, password, type } = req.body;

    User.findOne({ where: { id, type } }).then((user) => {
        if (!user) {
            req.flash('error', 'المستخدم غير مسجل في النظام');
            res.redirect('/login');
        } else {
            // compare input password with db password
            encrypt.compareData(password, user.dataValues.password).then(val => {
                if(!val) {
                    req.flash('error', 'كلمة المرور غير صحيحة');
                    res.redirect('/login');
                } else {
                    // redirect based on user type
                    switch(type) {
                        case 'A': 
                            req.session.user = user.dataValues;
                            res.redirect('/admin-home');
                            break;
                        case 'M':
                            req.session.user = user.dataValues;
                            res.redirect('/home');
                            break;
                        case 'R':
                            req.session.user = user.dataValues;
                            res.redirect('/home');
                            break;
                        default:
                            res.redirect('/logout');
                            break;
                    }
                }
            }).catch(err => {
                console.log(err);
                req.flash('error', 'لا يمكن فك تشفير كلمة المرور');
                res.redirect('/login');
            });
        }
    }).catch(err => {
        console.log(err);
        req.flash('error', 'لا يمكن الوصول لقاعدة البيانات');
        res.redirect('/login');
    });
});

/* ***** admin routes ***** */

// admin home route
router.get('/admin-home', sessionChecker, (req, res) => {

    // set active pages
    const pages = {
        home: 'active',
        profile: '',
        users: ''
    };

    // render home page
    res.render('admin-home', {
        user: req.session.user,
        pages
    });
});

// admin profile route
router.get('/admin-profile', sessionChecker, (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: 'active',
        users: ''
    };

    // render home page
    res.render('admin-profile', {
        user: req.session.user,
        pages
    });
});

// users route
router.get('/users', sessionChecker, (req, res) => {
    if(req.session.user.type !== 'A') {
        res.redirect('/logout');
    } else {

        //get users
        getUsers().then(val => {
            // set active pages
            const pages = {
                home: '',
                profile: '',
                users: 'active'
            };

            res.render('users', {
                user: req.session.user,
                pages,
                users: val
            });
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    }
});

// add user GET
router.get('/add-user', sessionChecker, (req, res) => {
    if(req.session.user.type !== 'A') {
        res.redirect('/logout');
    } else {
        // set active pages
        const pages = {
            home: '',
            profile: '',
            users: 'active'
        };

        res.render('add-user', {
            user: req.session.user,
            pages
        });
    }
});

// add user POST
router.post('/add-user', sessionChecker, (req, res) => {
    if(req.session.user.type !== 'A') {
        res.redirect('/logout');
    } else {
        // get user inputs
        const { id, name, phone, email, type, password } = req.body;

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
            res.redirect('/add-user');
        }).catch(err => {
            console.log(err);
            req.flash('error', 'حدث خطأ اثناء تسجيل المستخدم');
            res.redirect('/add-user');
        });
    }
});

// delete user
router.get('/delete-user/:id', sessionChecker, (req, res) => {
    if(req.session.user.type !== 'A') {
        res.redirect('/logout');
    } else {
        // get user id
        const id = req.params.id;

        // delete user based on id
        if(id != req.session.user.id) {
            User.destroy({ where: { id: id } }).then(val => {
                if(val > 0) {
                    req.flash('success', 'تم حذف المستخدم بنجاح');
                    res.redirect('/users');
                } else {
                    req.flash('warning', 'لم يتم حذف المستخدم');
                    res.redirect('/users');
                }
            }).catch(err => {
                console.log(err);
                req.flash('warning', 'لم يتم حذف المستخدم');
                res.redirect('/users');
            });
        } else {
            req.flash('error', 'لا يمكن حذف المستخدم الحالي');
            res.redirect('/users');
        }
    }
});

// update user route GET
router.get('/update-user/:id', sessionChecker, (req, res) => {
    if(req.session.user.type !== 'A') {
        res.redirect('/logout');
    } else {
        // get user data
        const id = req.params.id;

        User.findOne({ where: { id } }).then(user => {
            if(!user) {
                req.flash('error', 'لا يمكن تعديل بيانات هذا المستخدم');
                res.redirect('/users');
            } else {
                // active page
                const pages = {
                    home: '',
                    profile: '',
                    users: 'active'
                };

                // render update user page
                res.render('update-user', {
                    user: req.session.user,
                    pages,
                    employee: user.dataValues
                });
            }
        }).catch(err => {
            console.log(err);
            req.flash('error', 'لا يمكن تعديل بيانات هذا المستخدم');
            res.redirect('/users');
        });
    }
});

// update user route POST
router.post('/update-user/', sessionChecker, (req, res) => {
    if(req.session.user.type !== 'A') {
        res.redirect('/logout');
    } else {
        // get updated data
        const { id, name, phone, email, password } = req.body;

        // encrypt new password
        encrypt.hashData(password).then(hash => {
            // update user based on id
            User.update({ name, phone, email, password: hash }, { where: { id }}).then(val => {
                console.log(val);
                req.flash('success', 'تم تعديل بيانات المستخدم بنجاح');
                res.redirect('/users');
            }).catch(err => {
                console.log(err);
                req.flash('error', 'لا يمكن تعديل بيانات المستخدم');
                res.redirect('/users');
            });
        }).catch(err => {
            console.log(err);
            req.flash('error', 'لا يمكن تشفير كلمة المرور');
            res.redirect('/users');
        });
    }
});

/* ***** manager & researcher routes ***** */

// home route
router.get('/home', sessionChecker, (req, res) => {

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
        res.render('home', {
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
});

// profile route
router.get('/profile', sessionChecker, (req, res) => {
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
    res.render('profile', {
        user: req.session.user,
        pages
    });
});

// disaster route
router.get('/disaster-form', sessionChecker, (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: '',
        disaster: 'active',
        mazyoona: '',
        rescue: '',
        general: ''
    };

    // render page
    res.render('disaster-form', {
        user: req.session.user,
        pages,
        disasters: null
    });
});

// mazyoona route
router.get('/mazyoona-form', sessionChecker, (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: '',
        disaster: '',
        mazyoona: 'active',
        rescue: '',
        general: ''
    };

    // render page
    res.render('mazyoona-form', {
        user: req.session.user,
        pages
    });
});

// rescue route
router.get('/rescue-form', sessionChecker, (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: '',
        disaster: '',
        mazyoona: '',
        rescue: 'active',
        general: ''
    };

    // render page
    res.render('rescue-form', {
        user: req.session.user,
        pages
    });
});

// general route
router.get('/general-form', sessionChecker, (req, res) => {
    // set active pages
    const pages = {
        home: '',
        profile: '',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: 'active'
    };

    // render page
    res.render('general-form', {
        user: req.session.user,
        pages
    });
});

/* ***** common routes ***** */

// reset password for API
router.get('/reset-password/:id/:token', (req, res) => {
    // get id and token
    const id = req.params.id;
    const token = req.params.token;

    // verify token
    jwt.verify(token, jwtSecretKey, (err, val) => {
        if(err) {
            res.render('message', {
                title: 'حدث خطا',
                message: 'لا يمكن استخدام هذا الرابط .. الرجاء ارسال طلب آخر لاعادة تعيين كلمة المرور'
            });
        } else {
            res.render('reset-password-api', {
                id
            });
        }
    });
});

// confirm password route
router.post('/confirm-password', (req, res) => {
    // get id
    const id = req.body.id;

    if(!id) {
        res.render('message', {
            title: 'حدث خطا',
            message: 'لم يتم التعرف على المستخدم'
        });
    } else {
        // read data
        const { password, confirmPassword } = req.body;

        // check if passwords match
        if(password !== confirmPassword) {
            res.render('reset-password-api', {
                id
            });
        } else {
            // encrypt password
            encrypt.hashData(password).then(hash => {
                // update user password
                User.update({ password: hash }, { where: { id: id }}).then(val => {
                    console.log(val);
                    res.render('message', {
                        title: 'تم بنجاح',
                        message: 'تم تغيير كلمة المرور بنجاح'
                    });
                }).catch(err => {
                    console.log(err);
                    res.render('message', {
                        title: 'حدث خطا',
                        message: 'لم يتم التعرف على المستخدم'
                    });
                });
            }).catch(err => {
                console.log(err);
                res.render('message', {
                    title: 'حدث خطا',
                    message: 'لا يمكن تشفير كلمة المرور'
                });
            });
        }
    }
});

// logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// if there is server error
router.get('/500', (req, res) => {
    res.status(500).render('500');
});

// if route does not exist
router.use((req, res, next) => {
    res.status(404).render('404');
});

/* ***** Helper Functions ***** */
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

// export router
module.exports = router;