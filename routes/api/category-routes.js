const router = require("express").Router();
const sequelize = require("../../config/connection");
const { Category, Product } = require("../../models"); // Imports the models.

//=============== The `/api/categories` endpoint ===============//

// Get all categories and changes the anonymous callback function to become Asynchronous with with try/catch for errors.
// along with HTTP status codes.
router.get("/", async (req, res) => {
  try {
    // Store the categoryData in a variable once the promise is resolved.
    const categoryData = await Category.findAll({
      attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
      // Includes its associated Product data.
      include: [{
        model: Product,
        attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
      }]
    });
    // Find all categories from the table and returns the categoryData promise inside of the JSON response.
    res.status(200).json(categoryData); // 200 status code means the request is successful.
  } catch (err) {
    // 500 status code means internal server error.
    res.status(500).json(err);
  }
});

// Find one category by its `id` value.
router.get("/:id", async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
      include: [{
        model: Product,
        attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
      }]
    });
    // Response if no data is found for the entered id.
    if (!categoryData) {
      res.status(404).json({ message: "No categories with this id!" });
      return;
    }
    else {
      res.status(200).json(categoryData);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Creates a new category.
router.post("/", async (req, res) => {
  try {
    // Use Sequelize's `create()` method to add a row to the table.
    const newCategory = await Category.create({ category_name: req.body.category_name });
    if (!newCategory) {
      res.status(404).json({ message: "Please enter the necessary data!" });
      return;
    }
    else {
      // Collect all data from the new category to display it on Insomnia.
      const newCategoryData = await Category.findByPk(newCategory.id, {
        attributes: [['id', 'CategoryId'], ['category_name', 'Category']]
      })
      res.status(200).json(newCategoryData);
    }
  } catch (err) {
    res.status(400).json(err); // 400 status code means the server could not understand the request.
  }
});

// Updates a category by its `id` value.
router.put("/:id", async (req, res) => {
  try {
    // Calls the update method on the Category model.
    const updatedCategory = await Category.update(
      {
        // All the fields you can update and the data attached to the request body.
        category_name: req.body.category_name,
      },
      {
        // Gets the category based on the id given in the request parameters.
        where: {
          id: req.params.id
        },
      }
    );
    if (!updatedCategory[0]) {
      res.status(404).json({ message: 'No category with this id was found!' });
      return;
    }
    else {
      // Collect all data from the updated category to display it on Insomnia.
      const updatedCategoryData = await Category.findByPk(req.params.id, {
        attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
        include: [{
          model: Product,
          attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
        }]
      })
      res.status(200).json(updatedCategoryData);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a category by its `id` value.
router.delete("/:id", async (req, res) => {
  try {
    // Looks for the categories based on id given in the request parameters and deletes the instance from the database.
    const deletedCategory = await Category.destroy({ where: { id: req.params.id } });
    if (!deletedCategory) {
      res.status(404).json({ message: 'No category with this id was found!' });
      return;
    }
    else {
      res.status(200).json({ message: 'Category successfully deleted!' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
