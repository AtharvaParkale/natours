//Convention that all the express config in app.js
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
//===================================================================================================================================
//This is a middleware
//This is used to add the data directly on req object
//Important in every express code
const app = express();
//==================================================================================================================================
//this is a middleware
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  //This will be printed whenever the request is made
  console.log('Hello from the middleware 😁');
  next();
});

app.use((req, res, next) => {
  //This will something to the request, in our case its the date that is been added
  req.requestTime = new Date().toISOString();
  // console.log('Hello from the middleware 😁');
  next();
});
//===================================================================================================================================
//Get API for the NATOURS app
//Use v1 so that if there any changes in future in the api ypu do not have to change the entire api
//Before sending the data first read it
//get json format from the file
//===================================================================================================================================
//Lecture 52
const toursjson = fs.readFileSync(
  `${__dirname}/dev-data/data/tours-simple.json`
);
//convert this json to javascript object
const tours = JSON.parse(toursjson);
// app.get('/api/v1/tours', (req, res) => {
//   //Send this to client
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });

//===================================================================================================================================
//Lecture 53
//ROUTE HANDLER FOR POST REQUEST
//Send data from client to the server
//Here req object holds all the data that is sent from the client to the server
//Hence we need middleware to get all the data from the req object
// app.post('/api/v1/tours', (req, res) => {
//   //for this to work we need a middleware
//   console.log(req.body);
//   const newId = tours[tours.length - 1].id + 1;
//   //Merges two objects into one
//   const newTour = Object.assign({ id: newId }, req.body);
//   //Currently tours have 9 tours
//   //Push one into it
//   tours.push(newTour);
//   //Now whatever the updated tour is we have to write it in the file
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours), //Convert object into string
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// });
//===================================================================================================================================
//Lecture 54
//Defining the parameters of a url and later using them in our website
//Specify an ID to get a single tour

// :id declares a variable
// It can be anything like :x :y etc
// app.get('/api/v1/tours/:id', (req, res) => {
//   //Send this to client

//   //This is like declaring two more parameters
//   //'/api/v1/tours/:id/:x/:y'
//   //'/api/v1/tours/:id/:x/:y?' here ? means y is a optional parameter (No need to specify y while making an api call)

//   console.log(req.params);

//   //Findding the specific tour
//   //Find method creates an array which satisfies the given condition

//   // This converts string to number in javascript
//   const id = req.params.id * 1;

//   const tour = tours.find((el) => el.id === id);
//   console.log(tour);

//   res.status(200).json({
//     status: 'success',
//     // results: tours.length,
//     data: {
//       tour: tour,
//     },
//   });
// });

//===================================================================================================================================
//Lecture 55 (PATCH REQUEST)
// app.patch('/api/v1/tours/:id', (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'Fail',
//       message: 'Invalid ID',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<Updated tour here>',
//     },
//   });
// });

//===================================================================================================================================
//Lecture 56 (DELETE REQUEST)

// app.delete('/api/v1/tours/:id', (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'Fail',
//       message: 'Invalid ID',
//     });
//   }

//   //204 is no content just send null data
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

//===================================================================================================================================
//LECTURE 57 (REFACTORING ROUTES)
//Lets make out code a bit nicer and make it less messy

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};
const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  console.log(tour);
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
};

const createTour = (req, res) => {
  //for this to work we need a middleware
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  //Merges two objects into one
  const newTour = Object.assign({ id: newId }, req.body);
  //Currently tours have 9 tours
  //Push one into it
  tours.push(newTour);
  //Now whatever the updated tour is we have to write it in the file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours), //Convert object into string
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid ID',
    });
  }

  //204 is no content just send null data
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);
//===================================================================================================================================
//LECTURE 58
//A REQUEST RESPONSE CYCLE
//===================================================================================================================================
//LECTURE 59

//===================================================================================================================================
//LECTURE 60
//USING A THIRD PARTY MIDDLEWARE

//===================================================================================================================================
//LECTURE 61
//IMPLEMENTING USER ROUTES

const getAllUsers=(reeq,res)=>{
  res.status(500).json({
    status:'error',
    msg:'This route is note implemented yet !!'
  })
}
const createUser=(req,res)=>{
  res.status(500).json({
    status:'error',
    msg:'This route is note implemented yet !!'
  })
}
const getUser=(req,res)=>{
  res.status(500).json({
    status:'error',
    msg:'This route is note implemented yet !!'
  })
}
const updateUser=(req,res)=>{
  res.status(500).json({
    status:'error',
    msg:'This route is note implemented yet !!'
  })
}
const deleteUser=(req,res)=>{
  res.status(500).json({
    status:'error',
    msg:'This route is note implemented yet !!'
  })
}

app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
//===================================================================================================================================

//Create a variable for port
const port = 3000;
//===================================================================================================================================

//create a callback function which will be called as soon as the server starts listening
//this will be printed in the terminal (vscode)

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//Lets define routes now (How an application responds to a certain client requests)
//===================================================================================================================================
