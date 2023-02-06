const router = require("express").Router();
const sequelize = require("../../config/connection");
const { Category } = require("../../models"); // Imports the models.

// The `/api/categories` endpoint.

// Get all categories and changes the anonymous callback function to become Asynchronous with with try/catch for errors.
// along with HTTP status codes.
router.get("/", async (req, res) => {
  try {
    // Store the categoryData in a variable once the promise is resolved.
    const categoryData = await Category.findAll();
    categoryData.every((category) => category instanceof Category);
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
    const categoryData = await Category.findByPk(req.params.id);
    if (!categoryData) {
      res.status(404).json({ message: "No categories with this id!" });
      return;
    } else {
      categoryData instanceof Category;
      // Use plain SQL to include its associated Products.
      sequelize.literal(
        `(SELECT product_name AS Product FROM product WHERE product.category_id = ${req.params.id})`
      ),
        "Products",
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
    const newCategory = await Category.create({
      // Can also use .bulkCreate .post('/seed').
      category_name: req.body.category_name,
    });
    if (!newCategory) {
      res.status(404).json({ message: "Please enter the necessary data!" });
      return;
    }
    res.status(200).json(newCategory);
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
          id: req.params.id,
        },
      }
    );
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a category by its `id` value.
router.delete("/:id", async (req, res) => {
  try {
    // Looks for the categories based on id given in the request parameters and deletes the instance from the database.
    const deletedCategory = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(deletedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
