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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList: classificationSelect,
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

invCont.getEditInventoryView = utilities.handleErrors(async (req, res) => {
  const inventoryId = req.params.inventory_id;
  const inventoryItem = await invModel.getInventoryById(inventoryId);
  const classificationList = await invModel.getSingleClassifications();
  const nav = await utilities.getNav();

  if (!inventoryItem) {
    req.flash("notice", "Inventory item not found.");
    return res.redirect("/inv");
  }
  const errors = req.flash("errors") || [];

  res.render('inventory/edit-inventory', {
    title: `Edit ${inventoryItem.inv_make} ${inventoryItem.inv_model}`,
    nav,
    inventoryId,
    inventoryItem,
    classificationList,
    errors,
  });
});

invCont.updateInventory = utilities.handleErrors(async (req, res) => {
  let nav = await utilities.getNav()
  const {
    inv_id,
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
  const updateResult = await invModel.updateInventory(
    inv_id,  
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

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
})

invCont.getDeleteView = async (req, res) => {
  const inventoryId = req.params.inv_id;
  const inventoryItem = await invModel.getInventoryById(inventoryId);
  const nav = await utilities.getNav();
  
  if (!inventoryItem) {
    req.flash("notice", "Inventory item not found.");
    return res.redirect("/inv");
  }

  res.render('inventory/delete-confirm', {
    title: `Delete ${inventoryItem.inv_make} ${inventoryItem.inv_model}`,
    nav,
    inventoryItem,
    errors: null
  });
};

invCont.deleteInventoryItem = async (req, res) => {
  const inv_id = parseInt(req.body.inv_id);
  const deleteResult = await invModel.deleteInventoryItem(inv_id);
  
  if (deleteResult.rowCount) {
    req.flash("notice", "Inventory item successfully deleted.");
    res.redirect("/inv");
  } else {
    req.flash("notice", "Error: Unable to delete inventory item.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};
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
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = utilities.handleErrors(async function(req, res, next) {
  try{
    const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)//findit
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
  }catch(error){
    console.error("Error in buildInvetoryView", error.message)
    next(error)
  }
})


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
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
  const updateResult = await invModel.updateInventory(
    inv_id,  
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

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
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