const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
      })  
})

/* ***************************
 *  Deliver specific vehicle detail view
 * ************************** */
invCont.getVehicleDetail = utilities.handleErrors(async function (req, res, next) {
  const inventoryId = req.params.inventoryId
  const vehicleData = await invModel.getVehicleById(inventoryId)

  const vehicleDetailHtml = utilities.formatVehicleDetailHtml(vehicleData); // Format vehicle detail using utility
  let nav = await utilities.getNav(); 

  if(!vehicleData){
    return res.render('errors/error', {
      status: '404',
      title: '404',
      notice: 'Vehicle not found.'
    })
  }

  res.render("./inventory/vehicleDetail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleDetailHtml,
  })
})

/* ***************************
 *  Trigger an intentional 500 error
 * ************************** */
invCont.triggerError = utilities.handleErrors(async function (req, res, next) {
  // This will intentionally throw an error and pass it to the error middleware
  throw new Error("Intentional 500 Error");
});



module.exports = invCont