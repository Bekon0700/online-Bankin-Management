const User = require("../models/userModel")
const BankInfo = require("../models/bankModel")
const Transaction = require("../models/transactionModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")


exports.depositTranx = catchAsync(async (req, res, next) => {
    const accinfo = await BankInfo.findOne({clientId: req.client._id})
    
    // if not exists, throw an error
    if(!accinfo){
        return next(new AppError('Not a valid client to deposit money', 404))
    }
    
    // add the deposited money to the currentAmount value
    accinfo.currentBalance += req.body.depositAmount

    const tranX = await Transaction.create({
        tranxType: "deposit",
        tranxAmount: req.body.depositAmount,
        officerId: req.user._id,
        clientId: req.client._id,
        // receiverId: undefined
    })
    
    const updatedAcc = await BankInfo.findOneAndUpdate({clientId: req.client._id}, accinfo, {
        new: true
    })

    res.status(200).json({
        status: 'success',
        clientInfo: updatedAcc,
        transactionInfo: tranX
    })
})

exports.withdrawMoney = catchAsync(async (req, res, next) => {
    // find if the client account
    const accinfo = await BankInfo.findOne({clientId: req.user._id})
    
    // if not exists, throw an error
    if(!accinfo){
        return next(new AppError('Not a valid client to withdraw money', 404))
    }

    // check if client has enough money to withdraw
    if(accinfo.currentBalance < req.body.withdrawAmount){
        return next(new AppError('Not enough money left to withdraw', 404))
    }
    
    // add the deposited money to the currentAmount value
    accinfo.currentBalance -= req.body.withdrawAmount

    const tranX = await Transaction.create({
        tranxType: "withdraw",
        tranxAmount: req.body.withdrawAmount,
        clientId: req.user._id,
        // receiverId: undefined
    })
    
    const updatedAcc = await BankInfo.findOneAndUpdate({clientId: req.user._id}, accinfo, {
        new: true
    })

    res.status(200).json({
        status: 'success',
        clientInfo: updatedAcc,
        transactionInfo: tranX
    })
})

exports.sendMoney = catchAsync(async (req, res, next) => {
    console.log(req.body)
    const receiver = await User.findOne({phoneNumber: req.body.phoneNumber})
    if(!receiver.activeStatus){
        return next(new AppError('This receiver account is disabled', 403))
    }

    // find if the client account
    const senderAccinfo = await BankInfo.findOne({clientId: req.user._id})
    const receiverAccinfo = await BankInfo.findOne({clientId: receiver._id})

    // if sender not exists, throw an error
    if(!senderAccinfo){
        return next(new AppError('Not a valid sender', 404))
    }
    // if receiver not exists, throw an error
    if(!receiverAccinfo){
        return next(new AppError('Not a valid receiver', 404))
    }

    // check if client has enough money to withdraw
    if(senderAccinfo.currentBalance < req.body.sendAmount){
        return next(new AppError('Insufficient Balance', 404))
    }
    
    // add the deposited money to the currentAmount value
    senderAccinfo.currentBalance -= req.body.sendAmount
    receiverAccinfo.currentBalance += req.body.sendAmount

    const tranX = await Transaction.create({
        tranxType: "send",
        tranxAmount: req.body.sendAmount,
        clientId: req.user._id,
        receiverId: receiver._id
    })
    
    const updatedAccSender = await BankInfo.findOneAndUpdate({clientId: req.user._id}, senderAccinfo, {
        new: true
    })

    const updatedAccReceiver = await BankInfo.findOneAndUpdate({clientId: receiver._id}, receiverAccinfo, {
        new: true
    })

    res.status(200).json({
        status: 'success',
        clientInfo: updatedAccSender,
        receiverInfo: updatedAccReceiver,
        transactionInfo: tranX
    })
})

exports.loanPayBack = catchAsync(async( req, res, next ) => {
    const accinfo = await BankInfo.findOne({clientId: req.user._id})

    if(accinfo.loanAmount < req.body.returnAmount){
        return next(new AppError(`You need to pay ${accinfo.loanAmount} just.`, 404))
    }

    if(accinfo.currentBalance < req.body.returnAmount){
        return next(new AppError(`Your current balance is less then returned amount, please deposit first.`, 404))
    }


    // subtract the loan return money to the total LoanAmount
    accinfo.loanAmount -= req.body.returnAmount
    accinfo.currentBalance -= req.body.returnAmount


    const tranX = await Transaction.create({
        tranxType: "loan return",
        tranxAmount: req.body.returnAmount,
        clientId: req.user._id,
        // receiverId: undefined
    })
    let newC
    if(accinfo.loanAmount == 0){
        newC = await User.findOneAndUpdate( {_id: req.user._id}, {activeLoan: false}, {new: true})
    }else{
        newC = await User.findOne( {_id: req.user._id})
    }
    
    const updatedAcc = await BankInfo.findOneAndUpdate({clientId: req.user._id}, accinfo, {
        new: true
    })

    res.status(200).json({
        status: 'success',
        loanStatus: newC.activeLoan,
        clientInfo: updatedAcc,
        transactionInfo: tranX
    })
})