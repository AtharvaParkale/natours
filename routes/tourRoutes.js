const express = require('express');
const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  //AUTH CONTROLLER RUNS BEFORE GETTING ALL TOURS
  //AUTH CONTROLLER CHECKS IF THE USER HAS THE ACCESS TO THE GETALL TOURS ROUTES

  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  //MIDDLEWARE USED FOR AUTHENTICATION
  //authController.protect middleware used to check if the user is logged in
  //authController.restrictTo used for authorization
  .delete(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
