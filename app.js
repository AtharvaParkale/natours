const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//===================================================================
// 1.)MIDDLEWARE
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
//With this we will be able to access the static files on our browser
//justopen 127.0.0.1:3000/overview.html on your browser , you will get an html page
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 😁');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
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
