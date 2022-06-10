const express = require('express')
const router = express.Router()


const authController = require('./../controller/authController')
const adminController = require('./../controller/adminController')

router
    .post('/login', authController.userLogin)
    .post('/createOfficerAccount', authController.protectedRoute, authController.restrictedTo('admin'), adminController.createOfficerAcc)
    .post('/disableAccount', authController.protectedRoute, authController.restrictedTo('admin'), adminController.disableAcc)
    .post('/enableAccount', authController.protectedRoute, authController.restrictedTo('admin'), adminController.enableAcc)
    // .post('/forgotpassword', authController.forgotPassword)


module.exports = router;