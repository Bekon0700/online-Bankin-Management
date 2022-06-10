const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please provide a user name']
    },
    phoneNumber:{
        type: String,
        required: [true, 'Please provide a Phone number'],
        unique: [true, 'Please provide a Phone number'],
        lowercase: true,
        validate: [validator.isMobilePhone, 'Please provide a Valid Phone Number']
    },
    password:{
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['client', 'officer', 'admin'],
        default: 'client'
    },
    activeStatus:{
        type: Boolean,
        default: true
    },
    activeLoan:{
        type: Boolean,
        default: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password'))
        return next()
    
    this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined

    next()
})


userSchema.methods.checkPassword = async function(providedPassword, originalPassword){
    return await bcrypt.compare(providedPassword, originalPassword)
}


userSchema.methods.passwordChangedAfter = function(issuedTimeStamp){
    // console.log(this.passwordChangedAt, issuedTimeStamp)
    const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    // console.log(changeTimestamp, issuedTimeStamp)
    return changeTimestamp > issuedTimeStamp

    return false;
}

userSchema.methods.generateResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000 // 10 minutes after the lind has been hitted
    console.log(resetToken, this.passwordResetToken)
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User;