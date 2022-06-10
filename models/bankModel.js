const mongoose = require('mongoose')

const bankSchema = new mongoose.Schema({
    currentBalance: Number,
    loanAmount: {
        type: Number,
        default: 0
    },
    loanInfo:
    {
        loanBacked: Number,
        loanExpire: Date
    },
    clientId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
})

const BankInfo = mongoose.model('BankInfo', bankSchema)

module.exports = BankInfo