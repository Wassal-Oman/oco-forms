// import needed libraries
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const encrypt = require('../config/encryption');
const settings = require('../config/settings');
const mail = require('../config/sendemail');
const AdminController = require('../controllers/AdminController');
const ManagerController = require('../controllers/ManagerController');
const ResearcherController = require('../controllers/ResearcherController');

// initialize router
const router = express.Router();

// get JWT secret key
const jwtSecretKey = settings.JWT_SECRET_KEY;

// get host server
const host = settings.HOST;

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }    
};

/* ***** General Routes ***** */
// default
router.get('/', sessionChecker, (req, res) => {
    // get user type
    if(req.session.user) {
        switch(req.session.user.type) {
            case 'A': 
                res.redirect('/admin');
                break;
            case 'M':
                res.redirect('/manager');
                break;
            case 'R':
                res.redirect('/researcher');
                break;
            default:
                res.redirect('/logout');
        }
    } else {
        res.redirect('/login');
    }
});

// login - GET
router.get('/login', (req, res) => {

    // check if user exists
    if(req.session.user) {
        // get user type
        switch(req.session.user.type) {
            case 'A': 
                res.redirect('/admin');
                break;
            case 'M':
                res.redirect('/manager');
                break;
            case 'R':
                res.redirect('/researcher');
                break;
            default:
                res.redirect('/logout');
                break;
        }
    } else {
        res.render('login');
    }
});

// login - POST
router.post('/login', (req, res) => {
    // get employee number and password
    const { id, password } = req.body;

    // fetch user data
    User.findOne({ where: { id } }).then((user) => {
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
                    switch(user.dataValues.type) {
                        case 'A': 
                            req.session.user = user.dataValues;
                            res.redirect('/admin');
                            break;
                        case 'M':
                            req.session.user = user.dataValues;
                            res.redirect('/manager');
                            break;
                        case 'R':
                            req.session.user = user.dataValues;
                            res.redirect('/researcher');
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
router.get('/admin', sessionChecker, AdminController.home);
router.get('/admin/profile', sessionChecker, AdminController.profile);
router.get('/admin/users', sessionChecker, AdminController.users);
router.get('/admin/users/add', sessionChecker, AdminController.addUserGet);
router.post('/admin/users/add', sessionChecker, AdminController.addUserPost);
router.get('/admin/users/:id/delete', sessionChecker, AdminController.deleteUser);
router.get('/admin/users/:id/edit', sessionChecker, AdminController.updateUserGet);
router.post('/admin/users/edit', sessionChecker, AdminController.updateUserPost);
router.get('/admin/settings', sessionChecker, AdminController.settings);
router.get('/admin/disasters', sessionChecker, AdminController.getDisasterForms);
router.get('/admin/mazyoonas', sessionChecker, AdminController.getMazyoonaForms);
router.get('/admin/rescues', sessionChecker, AdminController.getRescueForms);
router.get('/admin/generals', sessionChecker, AdminController.getGeneralForms);

/* ***** manager routes ***** */
router.get('/manager', sessionChecker, ManagerController.home);
router.get('/manager/profile', sessionChecker, ManagerController.profile);
router.get('/manager/disasters', sessionChecker, ManagerController.getDisasterForms);
router.get('/manager/mazyoonas', sessionChecker, ManagerController.getMazyoonaForms);
router.get('/manager/rescues', sessionChecker, ManagerController.getRescueForms);
router.get('/manager/generals', sessionChecker, ManagerController.getGeneralForms);

/* ***** researcher routes ***** */
router.get('/researcher', sessionChecker, ResearcherController.home);
router.get('/researcher/profile', sessionChecker, ResearcherController.profile);
router.get('/researcher/disasters', sessionChecker, ResearcherController.getDisasterForms);
router.get('/researcher/mazyoonas', sessionChecker, ResearcherController.getMazyoonaForms);
router.get('/researcher/rescues', sessionChecker, ResearcherController.getRescueForms);
router.get('/researcher/generals', sessionChecker, ResearcherController.getGeneralForms);

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
                User.update({ password: hash }, { where: { id }}).then(val => {
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

// forget password route GET
router.get('/forget-password', (req, res) => {
    res.render('forget-password');
});

// forget password route POST
router.post('/forget-password', (req, res) => {
    // get employee id
    const id = req.body.id;

    // check user if exists
    User.findOne({ where: { id }}).then(user => {
        if(!user) {
            req.flash('error', 'المستخدم غير مسجل في النظام');
            res.redirect('/forget-password');
        } else {
            // create a payload
            const { id, name, email } = user;
            const payload = { id, name, email };

            // send an email request for reseting password
            jwt.sign({ payload }, jwtSecretKey, { expiresIn: "1h" }, (err, token) => {
                if(err) {
                    req.flash('error', 'لا يمكن تعيين رمز استخدام النظام');
                    res.redirect('/forget-password');
                } else {
                    // send an email
                    mail(email, 'اعادة تعيين كلمة المرور', `<p>انقر الرابط التالي لاعادة تعيين كلمة المرور</p><br><a href='${host}/reset-password/${id}/${token}'>اضغط هنا</a>`).then(val => {
                        if(val) {
                            req.flash('success', 'تم ارسال ايميل لاعادة نعيين كلمة المرور');
                            res.redirect('/login');
                        } else {
                            req.flash('error', 'حدث خطا في الخادم .. لا يمكن ارسال ايميل لاعادة تعيين كلمة المرور');
                            res.redirect('/login');
                        }
                    }).catch(err => {
                        console.log(err);
                        req.flash('error', 'حدث خطا في الخادم .. لا يمكن ارسال ايميل لاعادة تعيين كلمة المرور');
                        res.redirect('/login');
                    });
                }
            });
        }
    }).catch(err => {
        console.log(err);
        req.flash('error', 'حدث خطا في قاعدة البيانات');
        res.redirect('/forget-password');
    });
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

// export router
module.exports = router;