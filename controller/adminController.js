const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.createOfficerAcc = catchAsync(async (req, res, next) => {
    console.log(req.user)
    const newOfficer = await User.create({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: 'officer'
    })

    res.status(200).json({
        status: 'success',
        officer: newOfficer
    })
})

exports.disableAcc = catchAsync(async( req, res, next ) => {
    const accinfo = await User.findOne({phoneNumber: req.body.phoneNumber})

    if(!accinfo){
        return next(new AppError('Not a valid Account to disable', 404))
    }

    const updatedAcc = await User.findOneAndUpdate({phoneNumber: req.body.phoneNumber}, {activeStatus: false}, {
        new: true
    })

    res.status(200).json({
        status: 'success',
        AccountInfo: updatedAcc
    })
})


exports.enableAcc = catchAsync(async( req, res, next ) => {
    const accinfo = await User.findOne({phoneNumber: req.body.phoneNumber})

    if(!accinfo){
        return next(new AppError('Not a valid Account to disable', 404))
    }

    const updatedAcc = await User.findOneAndUpdate({phoneNumber: req.body.phoneNumber}, {activeStatus: true}, {
        new: true
    })

    res.status(200).json({
        status: 'success',
        AccountInfo: updatedAcc
    })
})