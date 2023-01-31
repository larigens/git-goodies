const router = require("express").Router();
const { Category, Product } = require("../../models"); // Imports the models

// The `/api/categories` endpoint

// Get all categories and changes the anonymous callback function to become Asynchronous with with try/catch for errors
// along with HTTP status codes
router.get("/", async (req, res) => {
  try {
    // Store the categoryData in a variable once the promise is resolved.
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
      attributes: {
        include: [
          [
            // Use plain SQL to include its associated Products
            sequelize.literal(
              "(SELECT product.product_name AS Product FROM product WHERE product.category_id = category.id)"
            ),
            "totalProducts",
          ],
        ],
      },
    });
    // 200 status code means the request is successful
    // Find all categories from the table and returns the categoryData promise inside of the JSON response.
    res.status(200).json(categoryData);
  } catch {
    // 500 status code means internal server error.
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  const categoryData = await Category.findByPk(req.params.id);
  // find one category by its `id` value
  return res.json(categoryData);
});
// be sure to include its associated Products
// Get one book from the book table
//  Book.findOne(
//   {
//     // Gets the book based on the isbn given in the request parameters
//     where: {
//       isbn: req.params.isbn
//     },
//   }
// )

// Creates a new category
router.post("/", async (req, res) => {
  // Use Sequelize's `create()` method to add a row to the table
  const newCategory = await Category.creat({
    // Can also use .bulkCreate .post('/seed')
    title: req.body.title,
    author: req.body.author,
    is_paperback: true,
  });
  // Send the newly created row as a JSON object
  return res.json(newCategory);
  // 400 status code means the server could not understand the request
});

// Updates a category by its `id` value
router.put("/:id", async (req, res) => {
  // Calls the update method on the Category model
  const updatedCategory = await Category.update(
    {
      // All the fields you can update and the data attached to the request body.
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      pages: req.body.pages,
      edition: req.body.edition,
      is_paperback: req.body.is_paperback,
    },
    {
      // Gets the category based on the id given in the request parameters
      where: {
        id: req.params.id,
      },
    }
  );
  // Sends the updated book as a json response
  return res.json(updatedCategory);
  // 500 code
});

// Delete a category by its `id` value.
router.delete("/:id", async (req, res) => {
  // Looks for the categories based on id given in the request parameters and deletes the instance from the database
  const deletedCategory = await Category.destroy({
    where: {
      id: req.params.id,
    },
  });
  return res.json(deletedCategory);
  // 500 code
});

module.exports = router;
