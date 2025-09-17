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
const businessRouter = require('./business_routes');
const analyticsRouter = require('./analytics_routes');
const referralsRouter = require('./referral_routes');
const promotionsRouter = require('./promotions_routes');
const scheduledRouter = require('./scheduled_routes');
const tipsRouter = require('./tips_routes');
const invoicesRouter = require('./invoices_routes');
const rewardsRouter = require('./rewards_routes');
const walletRouter = require('./wallet_routes');
const riderRouter = require('./routes/riders');
const googleMapsRouter = require('./routes/google-maps');
const locationRouter = require('./routes/location');
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
app.use('/businesses', businessRouter);
app.use('/analytics', analyticsRouter);
app.use('/rider', riderRouter);
app.use('/referral', referralsRouter);
app.use('/promotions', promotionsRouter);
app.use('/scheduled', scheduledRouter);
app.use('/tips', tipsRouter);
app.use('/invoices', invoicesRouter);
app.use('/rewards', rewardsRouter);
app.use('/wallet', walletRouter);
app.use('/maps', googleMapsRouter);
app.use('/location', locationRouter);



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
