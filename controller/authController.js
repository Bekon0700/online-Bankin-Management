const {promisify} = require('util')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const AppError = require('../utils/appError')
const BankInfo = require('../models/bankModel')

const createToken = (id) => {
    const token = jwt.sign(
        {
            id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES
        }
    )
    return token
}

const sendCreateToken = (user, statusCode, res) => {
    const token = createToken(user._id);

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
    };

    if (process.env.NODE_ENV === 'production') cookieOptions[secure] = true;
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(201).json({
        status: 'success',
        token,
        data: {
        user,
        },
    });
};

exports.sendToken = catchAsync(async (req, res, next) => {
    if(!req.cookies.jwt){
        res.status(201).json({
            token: false
            }
        )
    }
    res.status(201).json({
        token: true,
        role: req.user.role,
        loanStatus: req.user.activeLoan
        }
    )
    
})

exports.deleteToken = catchAsync(async (req, res, next) => {
    res.clearCookie('jwt')

    res.status(201).json({
        message: 'success'
        }
    )
    
})

exports.sendUser = catchAsync(async (req, res, next) => {
    console.log(req.user)

    res.status(201).json({
        message: 'success',
        user: req.user
        }
    )
})


exports.userSignUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.username,
        phoneNumber: req.body.phone,
        password: req.body.password,
    })
    
    const newBank = await BankInfo.create({
        currentBalance: 2000,
        clientId: newUser._id
    })
    
    res.status(201).json({
        status: 'success'
    })
})

exports.userLogin = catchAsync(async (req, res, next) => {
    const {phoneNumber, password} = req.body
    // console.log(phoneNumber, password)

    // 1) check if phoneNumber and password is exist
    if(!phoneNumber || !password)
        return next(new AppError('Please provide phoneNumber and password', 400))

    // find user
    const user = await User.findOne({ phoneNumber }).select('+password')
    // console.log(user)
    
    // 2) if user exists and password match
    if(!user || !(await user.checkPassword(password, user.password))){
        return next(new AppError('Invalid phoneNumber or Password', 400))
    }


    // 3) if everything okay send a JWT token to client
    
    sendCreateToken(user, 201, res)

    
})

exports.protectedRoute = catchAsync(async (req, res, next) => {
    let token;
    // console.log(req.headers.authorization)
    // check if there are jwt token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    }

    if(!token){
        return next(new AppError('please Log in', 401))
    }

    //verify if the token is valid 
    const decodedPayload = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decodedPayload)

    // check if the user exist, (what if user has been deleted after the jwt token was issued)
    const freshUser = await User.findById(decodedPayload.id)
    if(!freshUser){
        return next(new AppError('Please login!', 401))
    }
    // check if the user has been changed the password after issued the token
    // if(freshUser.passwordChangedAfter(decodedPayload.iat)){
    //     return next(new AppError('Password has been changed, Please login again', 401))
    // }
    req.user = freshUser
    next()
})

exports.restrictedTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You dont have the permission to perform this operation', 403))
        }
        next()
    }
}

exports.checkDepositDisability = catchAsync(async(req, res, next) => {
    const client = await User.findOne({phoneNumber: req.body.phoneNumber})
    if(!req.user.activeStatus){
        return next(new AppError('This officer account is disabled', 403))
    }
    if(!client.activeStatus){
        return next(new AppError('This client account is disabled', 403))
    }
    req.client = client
    next()
})

exports.checkWithdrawDisability = catchAsync(async(req, res, next) => {
    if(!req.user.activeStatus){
        return next(new AppError('This Account is disabled', 403))
    }
    next()
})

exports.checkLoanDisability = catchAsync(async(req, res, next) => {
    const client = await User.findOne({phoneNumber: req.body.phoneNumber})
    if(!req.user.activeStatus ){
        return next(new AppError('This officer account is disabled', 403))
    }
    if(!client.activeStatus){
        return next(new AppError('This client account is disabled', 403))
    }
    if(client.activeLoan){
        return next(new AppError('This client has already taken a loan', 403))
    }
    req.client = client
    next()
})


exports.forgotPassword = catchAsync(async (req,res, next) => {
    // find the user by email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('Wrong email address', 400))
    }
    // generate a token, set a expire time and saved the hashed token in DB using methods in model
    const resetToken = user.generateResetPasswordToken()

    // generateResetPasswordToken() this method just create a resetToken and a hashed token that would be save in the database
    // but this save process has not been done yet. Because we didnt call the save() and 
    // the method doesnt call the save() functionality directly. so to save the document we have to call user.save()
    // but there will be a error for validating purpose. So we have to stop the validating process for this save.

    // await user.save() // this will cause an validationError
    await user.save({validateBeforeSave: false})
    
    res.status(200).json({
        message: 'success',
    })
    // send an email with the reset token to the user email address 
})