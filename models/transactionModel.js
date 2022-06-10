const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    tranxId:{
        type: String,
    },
    tranxType:{
        type: String,
        enum: ['deposit', 'withdraw', 'send', 'loan return']
    },
    officerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    clientId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    tranxAmount: Number,
    tranxAt: {
        type: Date,
        default: Date.now(),
    },
})

TransactionSchema.pre('save', async function(next){
    if(!this.isModified('password'))
        return next()
    
    this.password = await bcrypt.hash(this.password, 12)

    this.receiverId = undefined

    next()
})

const Transaction = mongoose.model('Transaction', TransactionSchema)

module.exports = Transaction