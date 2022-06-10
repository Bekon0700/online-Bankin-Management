const BankInfo = require("../models/bankModel")
const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.loanPermission = catchAsync(async( req, res, next ) => {
    console.log(req.client)
    const newC = await User.findOneAndUpdate( {_id: req.client._id}, {activeLoan: true}, {new: true})
    const updatedAcc = await BankInfo.findOneAndUpdate(
        {clientId: req.client._id}, 
        {$set: {loanAmount: req.body.loanAmount}}, 
        {
        new: true,
        omitUndefined: true
        }
    )
    console.log(updatedAcc)
    console.log(newC)
    res.status(200).json({
        status: 'success',
        client: newC,
        updatedAcc
    })
})
