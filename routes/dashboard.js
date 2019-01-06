// import needed libraries
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const encrypt = require('../config/encryption');
const settings = require('../config/settings');

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
                            res.redirect('/manager-home');
                            break;
                        case 'R':
                            req.session.user = user.dataValues;
                            res.redirect('/researcher-home');
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

// manager home route
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

// manager home route
router.get('/manager-home', sessionChecker, (req, res) => {

    // set active pages
    const pages = {
        home: 'active',
        profile: '',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: ''
    };

    // render home page
    res.render('manager-home', {
        user: req.session.user,
        pages
    });
});

// manager home route
router.get('/researcher-home', sessionChecker, (req, res) => {

    // set active pages
    const pages = {
        home: 'active',
        profile: '',
        disaster: '',
        mazyoona: '',
        rescue: '',
        general: ''
    };

    // render home page
    res.render('researcher-home', {
        user: req.session.user,
        pages
    });
});

// admin profile
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

// users route
router.get('/users', sessionChecker, (req, res) => {
    if(req.session.user.type !== 'A') {
        res.redirect('/logout');
    } else {
        // set active pages
        const pages = {
            home: '',
            profile: '',
            users: 'active'
        };

        res.render('users', {
            user: req.session.user,
            pages
        });
    }
});

// add user routes
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
        pages
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

// logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// if route does not exist
router.use((req, res, next) => {
    res.status(404).render('404');
});

// export router
module.exports = router;