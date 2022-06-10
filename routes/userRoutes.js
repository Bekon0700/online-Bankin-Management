const express = require('express')
const router = express.Router()


const authController = require('./../controller/authController')
const bankController = require('./../controller/bankController')


router
    .post('/signUp', authController.userSignUp)
    .post('/login', authController.userLogin)
    // .post('/forgotpassword', authController.forgotPassword)

router
    .route('/statement')
    .get(authController.protectedRoute, authController.restrictedTo('client'), authController.checkWithdrawDisability, bankController.getStatement)

router
    .route('/checkToken')
    .get(authController.protectedRoute, authController.sendToken)
router
    .route('/deleteToken')
    .get(authController.deleteToken)

router
    .route('/sendRole')
    .get(authController.protectedRoute, authController.sendUser)



module.exports = router;