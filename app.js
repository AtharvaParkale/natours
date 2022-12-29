const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//===================================================================
// 1.) GLOBAL MIDDLEWARE

//SET SECURITY HTTP HEADERS
app.use(helmet());
console.log(process.env.NODE_ENV);

//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after one hour',
});

app.use('/api', limiter);

//BODY PARSER, READING DATA FROM THE BODY INTO REQ.BODY
app.use(
  express.json({
    limit: '10kb',
  })
);

//DATA SANITIZATION AGAINST NO SQL QUERY INJECTION

app.use(mongoSanitize());

//DATA SANITIZE AGAINST XSS
app.use(xss());

//PREVENT parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//SERVING STATIC FILES
//With this we will be able to access the static files on our browser
//justopen 127.0.0.1:3000/overview.html on your browser , you will get an html page
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 😁');
//   next();
// });

//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
//==================================================================
// 3.)ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//4.) HANDLING ALL THE UNDEFINED ROUTES
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Failed',
  //   message: `Can't find ${req.originalUrl} on this server !`,
  // });

  // const err = new Error(`Cant find ${req.originalUrl} on this server !`);
  // err.status = 'Fail';
  // err.statusCode = 404;

  //Send the next with a err. so that err middleware understands it

  //THIS IS THE BEST WAY TO HANDLE ERRORS
  //CREATE A ERROR CLASSS NAMED AppError AND IMPORT IT WHENEVER ITS NEEDED
  next(new AppError(`Cant find ${req.originalUrl} on this server !`, 404));
});

//5.) GLOBAL CENTRAL MIDDLEWARE TO HANDLE ALL THE ERRORS IN THE EXPRESS APP

app.use(globalErrorHandler);

module.exports = app;
