const express = require('express')
const router = express.Router()

const bankController = require('./../controller/bankController')
const authController = require('./../controller/authController')


router.post('/accountInfo',authController.protectedRoute, authController.restrictedTo('officer'), bankController.clientAccInfo)

router
    .route('/myAccountInfo')
    .get(authController.protectedRoute, authController.restrictedTo('client'),  bankController.myAccInfo)
    

module.exports = router;