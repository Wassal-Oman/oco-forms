// import needed libraries
const express = require("express");
const Joi = require("joi");
const encrypt = require("../config/encryption");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const settings = require("../config/settings");
const mail = require("../config/sendemail");
const Category = require("../models/Category");
const Beneficiary = require("../models/Beneficiary");
const Income = require("../models/Income");
const router = express.Router();

// get JWT secret key
const jwtSecretKey = settings.JWT_SECRET_KEY;

// get host server
const host = settings.HOST;

// define login schema
const loginSchema = Joi.object().keys({
  id: Joi.string().required(),
  password: Joi.string()
    .min(6)
    .required()
});

// define reset password schema
const resetPasswordSchema = Joi.object().keys({
  id: Joi.string().required()
});

// login route
router.post("/login", (req, res) => {
  // get user input
  const data = req.body;

  // validate input
  Joi.validate(data, loginSchema, (err, val) => {
    if (err) {
      // validation fails
      res.json({
        status: "error",
        message: "فشل في التعرف على البيانات المرسلة",
        data: err.message
      });
    } else {
      // validation succeed
      // check user through database
      User.findOne({
        where: {
          id: req.body.id
        }
      })
        .then(user => {
          if (!user) {
            res.json({
              status: "error",
              message: "المستخدم غير مسجل في النظام"
            });
          } else {
            // compare input password with db password
            encrypt
              .compareData(req.body.password, user.dataValues.password)
              .then(val => {
                if (!val) {
                  res.json({
                    status: "error",
                    message: "كلمة المرور غير صحيحة"
                  });
                } else {
                  // create a payload
                  const { id, name, email, phone } = user;
                  const payload = { id, name, email, phone };

                  // generate a token
                  jwt.sign(
                    { payload },
                    jwtSecretKey,
                    { expiresIn: "2 days" },
                    (err, token) => {
                      if (err) {
                        res.status(403).json({
                          status: "error",
                          message: "لا يمكن تعيين رمز استخدام النظام",
                          data: err
                        });
                      } else {
                        res.status(200).json({
                          status: "success",
                          message: "تم تسجيل الدخول بنجاح",
                          token: token,
                          data: payload
                        });
                      }
                    }
                  );
                }
              })
              .catch(err => {
                res.json({
                  status: "error",
                  message: "لا يمكن فك تشفير كلمة المرور",
                  data: err
                });
              });
          }
        })
        .catch(err => {
          res.json({
            status: "error",
            message: "لا يمكن الوصول لقاعدة البيانات",
            data: err
          });
        });
    }
  });
});

// reset password route
router.post("/reset-password", (req, res) => {
  // get requested data
  const data = req.body;

  // validate request
  Joi.validate(data, resetPasswordSchema, (err, val) => {
    if (err) {
      console.log(err);
      res.json({
        status: "error",
        message: "فشل في التعرف على البيانات المرسلة",
        data: err.message
      });
    } else {
      User.findOne({
        where: {
          id: req.body.id
        }
      })
        .then(user => {
          if (!user) {
            res.json({
              status: "error",
              message: "المستخدم غير مسجل في النظام"
            });
          } else {
            // get payload
            const { id, name, email } = user;
            const payload = { id, name, email };

            // generate a new token
            jwt.sign(
              { payload },
              jwtSecretKey,
              { expiresIn: "1h" },
              (err, token) => {
                if (err) {
                  res.status(403).json({
                    status: "error",
                    message: "لا يمكن تعيين رمز استخدام النظام",
                    data: err
                  });
                } else {
                  // send an email
                  mail(
                    email,
                    "اعادة تعيين كلمة المرور",
                    `<p>انقر الرابط التالي لاعادة تعيين كلمة المرور</p><br><a href='${host}/reset-password/${id}/${token}'>اضغط هنا</a>`
                  )
                    .then(val => {
                      if (val) {
                        res.json({
                          status: "success",
                          message: "تم ارسال ايميل لاعادة نعيين كلمة المرور"
                        });
                      } else {
                        res.json({
                          status: "error",
                          message:
                            "حدث خطا في الخادم .. لا يمكن ارسال ايميل لاعادة تعيين كلمة المرور"
                        });
                      }
                    })
                    .catch(err => {
                      res.json({
                        status: "error",
                        message:
                          "حدث خطا في الخادم .. لا يمكن ارسال ايميل لاعادة تعيين كلمة المرور"
                      });
                    });
                }
              }
            );
          }
        })
        .catch(err => {
          res.json({
            status: "error",
            message: "لا يمكن الوصول لقاعدة البيانات",
            data: err
          });
        });
    }
  });
});

// get categories data
router.get("/categories", (req, res) => {
  // load all avaliable categories
  Category.findAll()
    .then(val => {
      res.json({
        status: "success",
        message: "تم جلب بيانات الحالات الاجتماعية",
        data: val
      });
    })
    .catch(err => {
      res.json({
        status: "error",
        message: "حدث خطا في قاعدة البيانات",
        data: err
      });
    });
});

// get categories data
router.post("/categories/id", verifyToken, (req, res) => {
  // verify token
  jwt.verify(req.token, jwtSecretKey, (err, data) => {
    if (err) {
      res.json({
        status: "error",
        message: "رمز الوصول غير صحيح"
      });
    } else {
      // get category
      const id = req.body.id;

      if (id) {
        Category.findOne({ where: { id } })
          .then(val => {
            res.json({
              status: "success",
              message: "تم جلب الحالة الاجتماعية بنجاح",
              data: val
            });
          })
          .catch(err => {
            res.json({
              status: "error",
              message: "حصل خطأ في قاعدة البيانات",
              data: { name: err }
            });
          });
      } else {
        res.json({
          status: "error",
          message: "الحالة الاجتماعية غير معروفة",
          data: { name: "No Category" }
        });
      }
    }
  });
});

// search for registered beneficiary
router.post("/beneficiary", verifyToken, (req, res) => {
  // verify token
  jwt.verify(req.token, jwtSecretKey, (err, data) => {
    if (err) {
      res.json({
        status: "error",
        message: "رمز الوصول غير صحيح"
      });
    } else {
      // get file number
      const fileNumber = req.body.file_number;

      // fetch beneficiary data
      Beneficiary.findOne({ where: { file_id: fileNumber } })
        .then(beneficiary => {
          if (beneficiary) {
            res.json({
              status: "success",
              message: "تم جلب بيانات المستفيد بنجاح",
              data: beneficiary
            });
          } else {
            res.json({
              status: "error",
              message: "لا توجد بيانات لهذا المستفيد"
            });
          }
        })
        .catch(err => {
          res.json({
            status: "error",
            message: "حدث خطأ اثناء جلب بيانات المستفيد",
            data: err
          });
        });
    }
  });
});

// add beneficiary
router.post("/beneficiary/add", verifyToken, (req, res) => {
  // verify token
  jwt.verify(req.token, jwtSecretKey, (err, data) => {
    if (err) {
      res.json({
        status: "error",
        message: "رمز الوصول غير صحيح"
      });
    } else {
      // beneficiary details
      const {
        file_number,
        name,
        dob,
        nationality,
        phone,
        address,
        category
      } = req.body;

      // add benefiaciary
      Beneficiary.create({
        file_id: file_number,
        name,
        date_of_birth: dob,
        nationality,
        mobile: phone,
        address,
        categoryId: category
      })
        .then(val => {
          console.log(val);
          res.json({
            status: "success",
            message: "تم ادخال بيانات المستفيد بنجاح",
            data: val
          });
        })
        .catch(err => {
          console.log(err);
          res.json({
            status: "error",
            message: "حدث خطأ اثناء ادخال بيانات المستفيد",
            data: err
          });
        });
    }
  });
});

// add beneficiary
router.post("/beneficiary/update", verifyToken, (req, res) => {
  // verify token
  jwt.verify(req.token, jwtSecretKey, (err, data) => {
    if (err) {
      res.json({
        status: "error",
        message: "رمز الوصول غير صحيح"
      });
    } else {
      // beneficiary details
      const {
        file_number,
        name,
        dob,
        nationality,
        phone,
        address,
        category
      } = req.body;

      // update beneficiary
      Beneficiary.update(
        {
          name,
          date_of_birth: dob,
          nationality,
          mobile: phone,
          address,
          categoryId: category
        },
        { where: { file_id: file_number } }
      )
        .then(val => {
          console.log(val);
          res.json({
            status: "success",
            message: "تم تحديث بيانات المستفيد بنجاح",
            data: val
          });
        })
        .catch(err => {
          res.json({
            status: "error",
            message: "حدث خطأ أثناء تحديث بيانات المستفيد",
            data: err
          });
        });
    }
  });
});

// search for income
router.post("/income", verifyToken, (req, res) => {
  // get beneficiary id
  const beneficiaryId = req.body.beneficiary_id;

  if (beneficiaryId) {
    Income.findOne({ where: { beneficiaryId } })
      .then(val => {
        res.json({
          status: "success",
          message: "تم جلب معلومات الدخل بنجاح",
          data: val
        });
      })
      .catch(err => {
        res.json({
          status: "error",
          message: "حدث خطأ في قاعدة البيانات"
        });
      });
  } else {
    res.json({
      status: "error",
      message: "المستفيد عير معروف"
    });
  }
});

// add new income
router.post("/income/add", verifyToken, (req, res) => {
  // get beneficiary id
  const beneficiaryId = req.body.beneficiary_id;
  const income_source = req.body.income_source;
  const other_source = req.body.other_source;

  if (beneficiaryId && income_source) {
    // check if beneficiary does not have any income source
    Income.findOne({ where: { beneficiaryId } })
      .then(income => {
        if (income) {
          console.log(income);
          res.json({
            status: "error",
            message:
              "بيانات الدخل موجودة بالفعل ... لا يمكن ادخال بيانات اضافية"
          });
        } else {
          Income.create({
            beneficiaryId,
            income_source,
            other_source
          })
            .then(val => {
              console.log(val);
              res.json({
                status: "success",
                message: "تم ادخال بيانات الدخل بنجاح"
              });
            })
            .catch(err => {
              console.log(err);
              res.json({
                status: "error",
                message: "حدث خطأ في قاعدة البيانات"
              });
            });
        }
      })
      .catch(err => {
        console.log(err);
        res.json({
          status: "error",
          message: "حدث خطأ في قاعدة البيانات"
        });
      });
  } else {
    res.json({
      status: "error",
      message: "بيانات الدخل غير مكتملة"
    });
  }
});

// add new income
router.post("/income/update", verifyToken, (req, res) => {
  // get beneficiary id
  const beneficiaryId = req.body.beneficiary_id;
  const income_source = req.body.income_source;
  const other_source = req.body.other_source;

  if (beneficiaryId && income_source) {
    // check if beneficiary does not have any income source
    Income.findOne({ where: { beneficiaryId } })
      .then(income => {
        if (!income) {
          console.log(income);
          res.json({
            status: "error",
            message:
              "لا توجد بيانات للدخل مسجلة بأسم هذا المستخدم .. الرجاء أدخال بيانات جديدة"
          });
        } else {
          Income.update(
            {
              beneficiaryId,
              income_source,
              other_source
            },
            { where: { beneficiaryId } }
          )
            .then(val => {
              console.log(val);
              res.json({
                status: "success",
                message: "تم تحديث بيانات الدخل بنجاح"
              });
            })
            .catch(err => {
              console.log(err);
              res.json({
                status: "error",
                message: "حدث خطأ في قاعدة البيانات"
              });
            });
        }
      })
      .catch(err => {
        console.log(err);
        res.json({
          status: "error",
          message: "حدث خطأ في قاعدة البيانات"
        });
      });
  } else {
    res.json({
      status: "error",
      message: "بيانات الدخل غير مكتملة"
    });
  }
});

// if route does not exist
router.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "لا يمكن الوصول الى الرابط المطلوب"
  });
});

// method to verify token
function verifyToken(req, res, next) {
  // get request header of type authorization
  const bearerHeader = req.headers["authorization"];

  // check if authorization header is sent through the request
  if (typeof bearerHeader !== "undefined") {
    // extract token from the authorization header
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    // set request token
    req.token = bearerToken;

    // exit middleware
    next();
  } else {
    res.status(403).json({
      status: "error",
      message: "استخدام غير مصرح به"
    });
  }
}

// export router
module.exports = router;
