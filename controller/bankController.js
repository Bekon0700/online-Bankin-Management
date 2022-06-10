const BankInfo = require("../models/bankModel");
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.clientAccInfo = catchAsync(async (req, res, next) => {
    if(!req.body){ // NOT WORKING
        return next(new AppError('Please insert clients phone number', 404))
    }
    const client = await User.findOne(req.body)
    const id = client._id
    const accinfo = await BankInfo.findOne({clientId: id})

    // if not exists, throw an error
    if(!accinfo){
        return next(new AppError('Account doesnt Exists or log into right account', 404))
    }

    res.status(200).json({
        status: 'success',
        clientInfo: accinfo
    })
})

exports.myAccInfo = catchAsync(async (req, res, next) => {
    const accinfo = await BankInfo.findOne({clientId: req.user._id})

    // if not exists, throw an error
    if(!accinfo){
        return next(new AppError('Account doesnt Exists', 404))
    }

    res.status(200).json({
        status: 'Success',
        clientName: req.user.name,
        clientInfo: accinfo
    })
})

exports.getStatement = catchAsync(async (req, res, next) => {
    const allTranx = await Transaction.find({clientId: req.user._id})

    res.status(200).json({
        status: 'Success',
        statement: allTranx
    })
})
