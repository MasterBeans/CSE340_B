// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const invController = require("../controllers/invController")
const classificationValidate = require('../utilities/inventory-validation')
const inventoryValidate = require('../utilities/inventory-validation')


// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to deliver a specific inventory item detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.getVehicleDetail))

// Route to deliver the inventory management view
router.get("/management", utilities.handleErrors(invController.buildManagementView))

// Route to add classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassificationView))

// Route add inventory form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventoryView));

// Process classification form submission
router.post(
    "/add-classification",
    classificationValidate.classificationNameRules(),
    classificationValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
  )
// Process inventory form submission
router.post(
  "/add-inventory",
  inventoryValidate.inventoryNameRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
 )


// Route to intentionally trigger a 500 error
router.get("/trigger-error", invController.triggerError)
module.exports = router;