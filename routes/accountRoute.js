// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const loginValidate = require('../utilities/account-validation')


router.get('/login', utilities.handleErrors(accountController.buildLogin)) // GET route for login view
router.get('/register', utilities.handleErrors(accountController.buildRegister) )// GET route for registration view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildLoginDashboard))


// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

  // Process the login attempt
router.post(
  "/login",
  loginValidate.loginRules(),
  loginValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
  
module.exports = router;