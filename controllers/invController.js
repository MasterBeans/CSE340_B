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
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassificationView = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ****************************************
*  Process Adding CLassification
* *************************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  
  if (result) {
    const msg = req.flash(
      "success",
      `New classification added.`
    )
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("invalid", "Sorry, adding classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New CLassification",
      nav,
      errors: null,
    })
  }
}


/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventoryView = async function(req, res, next) {
  try{
    let nav = await utilities.getNav();
    let classificationList = await utilities.getClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
    })
  }catch(error){
    console.error("Error in buildInvetoryView", error.message)
    next(error)
  }
}

/* ****************************************
*  Process Adding CLassification
* *************************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  
  let classificationList = await utilities.getClassificationList();
  console.log(classificationList)
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id, 
   } = req.body
  
  const result = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )
  console.log(result)
  if (result) {
    const msg = req.flash("success",`New inventory added.`)
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("invalid", "Sorry, adding inventory failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      errors: null,
      
    })
  }
}

/* ***************************
 *  Trigger an intentional 500 error
 * ************************** */
invCont.triggerError = utilities.handleErrors(async function (req, res, next) {
  // This will intentionally throw an error and pass it to the error middleware
  throw new Error("Intentional 500 Error");
});



module.exports = invCont