const express = require('express')

const userRouter = require('./routes/userRoutes')
const bankRouter = require('./routes/bankRoutes')
const adminRouter = require('./routes/adminRoutes')
const loanRouter = require('./routes/loanRoutes')
const tranxRouter = require('./routes/transactionRoutes')

const globalErrorHandler = require('./controller/errorController')

const app = express()
const morgan = require('morgan');


const cors = require('cors')
const CookieParser = require('cookie-parser');

app.use(express.json({limit: '10kb'}))

app.use(cors())
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true
// }))
// res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
app.use(CookieParser())
app.use(morgan('dev'))


app.use('/api/v1/users', userRouter)
app.use('/api/v1/bank', bankRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/loan', loanRouter)
app.use('/api/v1/transaction', tranxRouter)


app.all('*', (req, res, next) => {
    res.status(404).json({
    status: 'fail',
    message: `can't find the ${req.originalUrl} in the server`,
    });

    next(new AppError(`can't find the ${req.originalUrl} in the server`, 500));
});

// error handler
app.use(globalErrorHandler);

module.exports = app