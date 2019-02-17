// import needed libraries
const encrypt = require('../config/encryption');
const User = require('../models/User');
const Disaster = require('../models/Disaster');
const Mazyoona = require('../models/Mazyoona');
const Rescue = require('../models/Rescue');
const General = require('../models/General');
const Category = require('../models/Category');
const Governate = require('../models/Governate');

// home
module.exports.home = (req, res) => {
    if(req.session.user.type === 'A') {
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
    } else {
        res.redirect('/logout');
    }
}

// profile
module.exports.profile = (req, res) => {
    if(req.session.user.type === 'A') {
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
    } else {
        res.redirect('/logout');
    }
}

// users
module.exports.getUsers =  (req, res) => {
    if(req.session.user.type === 'A') {
        // get users
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
    } else {
        res.redirect('/logout');
    }
}

// add user - GET
module.exports.addUser = (req, res) => {
    if(req.session.user.type === 'A') {
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

        res.render('admin/addUser', {
            user: req.session.user,
            pages
        });
    } else {
        res.redirect('/logout');
    }
}

// add user - POST
module.exports.storeUser = (req, res) => {
   if(req.session.user.type === 'A') {
        // get user inputs
        const { id, name, phone, email, type } = req.body;

        // add new user
        User.create({
            id,
            name,
            phone,
            email,
            password: 'oco654321',
            type
        }).then(val => {
            console.log(val);
            req.flash('success', 'تم تسجيل مستخدم جديد');
            res.redirect('/admin/users');
        }).catch(err => {
            console.log(err);
            req.flash('error', 'حدث خطأ اثناء تسجيل المستخدم');
            res.redirect('/admin/users');
        });
   } else {
       res.redirect('/logout');
   }
}

// delete user
module.exports.deleteUser = (req, res) => {
    if(req.session.user.type === 'A') {
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
    } else {
        res.redirect('/logout');
    }
}

// update user - GET
module.exports.editUser = (req, res) => {
    if(req.session.user.type === 'A') {
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
                res.render('admin/editUser', {
                    user: req.session.user,
                    pages,
                    employee: user.dataValues
                });
            }
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// update user - POST
module.exports.updateUser = (req, res) => {
    if(req.session.user.type === 'A') {
        // get updated data
        const { id, name, phone, email, type } = req.body;

        // update user details
        User.update({ name, phone, email, type }, { where: { id }}).then(val => {
            console.log(val);
            req.flash('success', 'تم تعديل بيانات المستخدم بنجاح');
            res.redirect('/admin/users');
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// settings
module.exports.settings = (req, res) => {
    if(req.session.user.type === 'A') {
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
    } else {
        res.redirect('/logout');
    }
}

// add categoy - GET
module.exports.addCategory = (req, res) => {
    if(req.session.user.type === 'A') {
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

        res.render('admin/addCategory', {
            user: req.session.user,
            pages
        });
    } else {
        res.redirect('/logout');
    }
}

// add category - POST
module.exports.storeCategory = (req, res) => {
    if(req.session.user.type === 'A') {
        // get user inputs
        const name = req.body.name;

        // add new user
        Category.create({
            name
        }).then(val => {
            console.log(val);
            req.flash('success', 'تم تسجيل حالة اجتماعية جديدة');
            res.redirect('/admin/settings');
        }).catch(err => {
            console.log(err);
            req.flash('error', 'حدث خطأ اثناء تسجيل الحالة الاجتماعية');
            res.redirect('/admin/settings');
        });
   } else {
       res.redirect('/logout');
   }
}

// delete category
module.exports.deleteCategory = (req, res) => {
    if(req.session.user.type === 'A') {
        // get id
        const id = req.params.id;

        // delete category
        Category.destroy({ where: { id }}).then(val => {
            console.log(val);
            req.flash('success', 'تم حذف الحالة الاجتماعية بنجاح');
            res.redirect('/admin/settings');
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// update category - GET
module.exports.editCategory = (req, res) => {
    if(req.session.user.type === 'A') {

        // get id
        const id = req.params.id;

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

        // get category
        Category.findOne({ where: { id }}).then(category => {
            if(!category) {
                req.flash('error', 'لا يمكن العثور على معلومات الحالة الاجتماعية');
                res.redirect('/admin/settings');
            } else {
                res.render('admin/editCategory', {
                    user: req.session.user,
                    pages,
                    category
                });
            }
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// update category - POST
module.exports.updateCategory = (req, res) => {
    if(req.session.user.type === 'A') {
        // get id
        const { id, name } = req.body;

        // update category
        Category.update({ name }, { where: { id }}).then(val => {
            console.log(val);
            req.flash('success', 'تم تعديل الحالة الاجتماعية بنجاح');
            res.redirect('/admin/settings');
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
        
    } else {
        res.redirect('/logout');
    } 
}

// add governate - GET
module.exports.addGovernate = (req, res) => {
    if(req.session.user.type === 'A') {
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

        res.render('admin/addGovernate', {
            user: req.session.user,
            pages
        });
    } else {
        res.redirect('/logout');
    }
}

// add governate - POST
module.exports.storeGovernate = (req, res) => {
    if(req.session.user.type === 'A') {
        // get user inputs
        const name = req.body.name;

        // add new user
        Governate.create({
            name
        }).then(val => {
            console.log(val);
            req.flash('success', 'تم تسجيل محافظة جديدة');
            res.redirect('/admin/settings');
        }).catch(err => {
            console.log(err);
            req.flash('error', 'حدث خطأ اثناء تسجيل المحافظة');
            res.redirect('/admin/settings');
        });
   } else {
       res.redirect('/logout');
   }
}

// delete governate
module.exports.deleteGovernate = (req, res) => {
    if(req.session.user.type === 'A') {
        // get id
        const id = req.params.id;

        // delete category
        Governate.destroy({ where: { id }}).then(val => {
            console.log(val);
            req.flash('success', 'تم حذف المحافظة بنجاح');
            res.redirect('/admin/settings');
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
};

// update governate - GET
module.exports.editGovernate = (req, res) => {
    if(req.session.user.type === 'A') {

        // get id
        const id = req.params.id;

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

        // get category
        Governate.findOne({ where: { id }}).then(governate => {
            if(!governate) {
                req.flash('error', 'لا يمكن العثور على معلومات المحافظة');
                res.redirect('/admin/settings');
            } else {
                res.render('admin/editGovernate', {
                    user: req.session.user,
                    pages,
                    governate
                });
            }
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// update governate - POST
module.exports.updateGovernate = (req, res) => {
    if(req.session.user.type === 'A') {
        // get inputs
        const { id, name } = req.body;

        // update category
        Governate.update({ name }, { where: { id }}).then(val => {
            console.log(val);
            req.flash('success', 'تم تعديل المحافظة بنجاح');
            res.redirect('/admin/settings');
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// get disaster forms
module.exports.getDisasters = (req, res) => {
    if(req.session.user.type === 'A') {
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
            res.render('admin/disasters', {
                user: req.session.user,
                pages,
                data: val
            });
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// get one disaster form
module.exports.getDisaster = (req, res) => {

}

// delete disaster
module.exports.deleteDisaster = (req, res) => {

}

// update disaster - GET
module.exports.editDisaster = (req, res) => {

}

// update disaster - POST
module.exports.updateDisaster = (req, res) => {

}

// get mazyoona forms
module.exports.getMazyoonas = (req, res) => {
   if(req.session.user.type === 'A') {
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
            res.render('admin/mazyoonas', {
                user: req.session.user,
                pages,
                data: val
            });
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
   } else {
       res.redirect('/logout');
   }
}

// get one mazyoona form
module.exports.getMazyoona = (req, res) => {

}

// delete mazyoona
module.exports.deleteMazyoona = (req, res) => {

}

// update mazyoona - GET
module.exports.editMazyoona = (req, res) => {

}

// update mazyoona - POST
module.exports.updateMazyoona = (req, res) => {

}

// get rescue forms
module.exports.getRescues = (req, res) => {
    if(req.session.user.type === 'A') {
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
            res.render('admin/rescues', {
                user: req.session.user,
                pages,
                data: val
            });
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// get one general form
module.exports.getRescue = (req, res) => {

}

// delete general
module.exports.deleteRescue = (req, res) => {

}

// update rescue - GET
module.exports.editRescue = (req, res) => {

}

// update rescue - POST
module.exports.updateRescue = (req, res) => {
    
}

// get general forms
module.exports.getGenerals = (req, res) => {
    if(req.session.user.type === 'A') {
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
            res.render('admin/generals', {
                user: req.session.user,
                pages,
                data: val
            });
        }).catch(err => {
            console.log(err);
            res.redirect('/500');
        });
    } else {
        res.redirect('/logout');
    }
}

// get one general form
module.exports.getGeneral = (req, res) => {

}

// delete general
module.exports.deleteGeneral = (req, res) => {

}

// update general - GET
module.exports.editGeneral = (req, res) => {

}

// update general - POST
module.exports.updateGeneral = (req, res) => {

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