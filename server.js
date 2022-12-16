//For application we use this file server.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

//CONNECTING TO THE MONGO DB DATABASE
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful !');
});

//SETTING UP THE PORT SETTINGS
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//SERVER->ROUTES->CONTROLLERS->MODELS->RESPONSE

//HANDLING UNHANDLED REJECTIONS
//FOR EXAMPLE IF THE ERROR IS CAUSED BY THE DATABASE AND NOT EXPRESS

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION ! SHUTTING DOWN');
  server.close(() => {
    process.exit(1);
  });
});

//HANDLING THE UNCAUGHT EXCEPTIONS

process.on('uncaughtException',err=>{
  console.log('UNCAUGHT EXCEPTION ! SHUTTING DOWN');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
})

//This is uncaught exception
// console.log(x);