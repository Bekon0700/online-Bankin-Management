const dotenv = require('dotenv')
dotenv.config({path: './config.env'})

const app = require('./app')
const mongoose = require('mongoose');

mongoose
  .connect("mongodb+srv://Bekon0700:01856Be@cluster0.otfp7kl.mongodb.net/test",
  {

    useNewUrlParser: "true",
    useUnifiedTopology: "true"
  
  })
  .then((con) => {
    console.log('DB Connection Successful');
  });
// mongoose
//   .connect(process.env.DB_LOCAL)
//   .then((con) => {
//     console.log('DB Connection Successful');
//   });

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`App is running on ${port}`)
})