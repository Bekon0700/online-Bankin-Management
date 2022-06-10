const express = require('express')
const router = express.Router()

const authController = require('./../controller/authController')
const loanController = require('./../controller/loanController')

router
    .post('/permission', authController.protectedRoute, authController.restrictedTo('officer'), authController.checkLoanDisability, loanController.loanPermission)


module.exports = router;