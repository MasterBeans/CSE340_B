const pool = require("../database")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
   
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.classification_id = $1`,
        [classification_id]
      )
      return data.rows
 
  }

async function getVehicleById(inv_id){
  try{
    const vehicle = await pool.query(`SELECT * FROM public.inventory WHERE inv_id = $1` , [inv_id])
    return vehicle.rows[0]
  }catch (error){
    console.error("getVehicleDetail error " + error)
  }
}

/* *****************************
*   Add new classification
* *************************** */
async function addClassification(classification_name){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

async function getSingleClassifications(){
  const result = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
  return result.rows;
}

async function getInventoryById(id) {
  const query = `
    SELECT 
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
        c.classification_name
    FROM 
        public.inventory i
    JOIN 
        public.classification c ON i.classification_id = c.classification_id
    WHERE 
        inv_id = $1`;

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching inventory item by ID ${id}:`, error);
    throw error;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingClassification(classification_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Add new inventory
* *************************** */
async function addInventory(inv_make,  inv_model,  inv_description,  inv_image,  inv_thumbnail,  price,  inv_year,  miles,  inv_color,  c_id){
  const inv_price = price ? parseFloat(price) : null;
  const inv_miles = miles ? parseInt(miles) : null;
  const classification_id = c_id ? parseInt(c_id) : null;
  
  try {
    const sql = "INSERT INTO inventory (inv_make,inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = {
  getClassifications, 
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  checkExistingClassification,
  addInventory,
  getInventoryById,
  getSingleClassifications,
  updateInventory
};