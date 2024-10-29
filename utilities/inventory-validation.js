const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")

const validate = {}

  /*  **********************************
  *  Classification Name Validation Rules
  * ********************************* */
  validate.classificationNameRules = () => {
    return [
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid classification name.")
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage("Classification name must not contain spaces or special characters.")
        .custom(async (classification_name) => {
          const nameExist = await invModel.checkExistingClassification(classification_name)
          if (nameExist){
            throw new Error("Classification already exists.")
          }
        }), 
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add Classification",
        nav,
        classification_name
      })
      return
    }
    next()
  }


  /*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */
validate.inventoryNameRules = () => {
  return [
    body('inv_make')
      .isLength({ min: 3 }).withMessage('Make must be at least 3 characters long.')
      .matches(/^[A-Za-z0-9 ]+$/).withMessage('Make must contain only alphanumeric characters.'),
    
    body('inv_model')
      .isLength({ min: 3 }).withMessage('Model must be at least 3 characters long.')
      .matches(/^[A-Za-z0-9 ]+$/).withMessage('Model must contain only alphanumeric characters.'),

    body('inv_year')
      .isInt({ min: 1900, max: 2100 }).withMessage('Year must be a valid 4-digit year.'),

    body('inv_description')
      .notEmpty().withMessage('Description is required.'),

    body('inv_price')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),

    body('inv_miles')
      .isInt({ min: 0 }).withMessage('Miles must be a positive number.'),

    body('inv_color')
      .notEmpty().withMessage('Color is required.'),

    body('classification_id')
      .notEmpty().withMessage('Please choose a classification.'),

    body('inv_image')
      .notEmpty().withMessage('Image field cannot be empty.'),
      
    body('inv_thumbnail')
      .notEmpty().withMessage('Thumbnail field cannot be empty.')
  ]

}


 /* ******************************
 * Check data and return errors or continue to adding inventory
 * ***************************** */
 validate.checkInventoryData = async (req, res, next) => {
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
    classification_id 
  } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.getClassificationList();
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Inventory",
      nav,
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
      classificationList
    })
    return
  }
  next()
}
validate.checkUpdateData = async (req, res, next) => {
  const { 
    inv_make, 
    inv_model, 
    inv_year, 
    inv_description, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id,
    inv_image,
    inv_thumbnail,
    inv_id
  } = req.body;
  
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await invModel.getSingleClassifications();

    const selectedClassification = classificationList.find(c => c.classification_id === parseInt(classification_id));

    res.render("inventory/edit-inventory", {
      errors: errors.array(),
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationList,
      inventoryItem: {
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_price, 
        inv_miles, 
        inv_color, 
        classification_id,
        classification_name: selectedClassification ? selectedClassification.classification_name : '',
        inv_image,
        inv_thumbnail,
        inv_id
      } 
    });
    return;
  }

  next();
};



  module.exports = validate