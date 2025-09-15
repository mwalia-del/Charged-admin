var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { specs, swaggerUi } = require('./swagger');                                        
const swaggerDocument = require('./swagger.json')                                         
var cors = require('cors')
//const mongoose = require('mongoose');
var admin = require("firebase-admin");
const AWS = require("aws-sdk");
require('dotenv').config()
//require('./helpers/cronHelper');


AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,      // Replace with your key                   
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,  // Replace with your secret         
  region: process.env.S3_BUCKET_REGION,                    // Replace with your S3 region 
});


console.log("process.env.SERVICE_KEY_FILE==>", process.env.SERVICE_KEY_FILE);             

var serviceAccount = require(process.env.SERVICE_KEY_FILE);                               


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)                                       
});



/*mongoose.connect('mongodb+srv://geriatric:geriatricUser@geriatricapp.9qgto.mongodb.net/geriatric')                                   
  .then(() => console.log('Connected!'));
*/
var userRouter = require('./routes/users');
var driverRouter = require('./routes/drivers');                                           
var adminRouter = require('./routes/admin');
var ridesRouter = require('./routes/rides');
var paymentRouter = require('./routes/payments');
var catalogRouter = require('./routes/catalog');  // Add catalog routes
/*var sosRouter = require('./routes/sos');
var todoRouter = require('./routes/todo');
var medicineRouter = require('./routes/medicine');                                        
*/
var options = {
  explorer: true
};

var app = express();

app.use(cors())

// view engine setup
// Set up view engine
app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));                                          

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));                                         
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));                                  
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));         

app.use('/', userRouter);
app.use('/driver', driverRouter);
app.use('/admin', adminRouter);
app.use('/ride', ridesRouter);
app.use('/payment', paymentRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes
/*app.use('/sos', sosRouter);
app.use('/todo', todoRouter);
app.use('/medicine', medicineRouter);*/



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development                                      
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};                     

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
