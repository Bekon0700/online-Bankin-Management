const express = require('express')
const router = express.Router()


const authController = require('./../controller/authController')
const transaction = require('./../controller/transactionController')

router
    .route('/deposit')
    .post(authController.protectedRoute, authController.restrictedTo('officer'), authController.checkDepositDisability, transaction.depositTranx)

router
    .route('/withdraw')
    .post(authController.protectedRoute, authController.restrictedTo('client'), authController.checkWithdrawDisability, transaction.withdrawMoney)

router
    .route('/sendMoney')
    .post(authController.protectedRoute, authController.restrictedTo('client'), authController.checkWithdrawDisability, transaction.sendMoney)

router
    .route('/loanPayBack')
    .post(authController.protectedRoute, authController.restrictedTo('client'), authController.checkWithdrawDisability, transaction.loanPayBack)

module.exports = router;