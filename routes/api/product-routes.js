const router = require("express").Router();
const sequelize = require("../../config/connection");
const { Product, Category, Tag, ProductTag } = require("../../models");

//=============== The `/api/products` endpoint ===============//

// Get all products and changes the anonymous callback function to become Asynchronous with with try/catch for errors.
// along with HTTP status codes.
router.get("/", async (req, res) => {
  try {
    // Store the productData in a variable once the promise is resolved.
    const productData = await Product.findAll({
      attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
      // Includes its associated Category and Tag data.
      include: [
        {
          model: Category,
          attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
        },
        {
          model: Tag,
          attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
        }
      ]
    })
    // Find all products from the table and returns the productData promise inside of the JSON response.
    res.status(200).json(productData); // 200 status code means the request is successful.
  } catch (err) {
    // 500 status code means internal server error.
    res.status(500).json(err);
  }
});

// Find one product by its `id` value.
router.get("/:id", async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
      include: [
        {
          model: Category,
          attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
        },
        {
          model: Tag,
          attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
        }
      ]
    })
    // Response if no data is found for the entered id.
    if (!productData) {
      res.status(404).json({ message: "No products with this id!" });
      return;
    }
    else {
      res.status(200).json(productData);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Creates a new product.
router.post("/", async (req, res) => {
  try {
    // Use Sequelize's `create()` method to add a row to the table.
    const newProduct = await Product.create({
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id,
      tagIds: [1, 2, 3, 4, 5, 6],
    })
    if (!newProduct) {
      res.status(404).json({ message: "Please enter the necessary data!" });
      return;
    }
    else {
      // If there's product tags, creates pairings to bulk create in the ProductTag model.
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: newProduct.id,
            tag_id,
          };
        });
        await ProductTag.bulkCreate(productTagIdArr)
        // Collect all data from the new product to display it on Insomnia.
        const newProductData = await Product.findByPk(newProduct.id, {
          attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
          include: [
            {
              model: Category,
              attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
            },
            {
              model: Tag,
              attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
            }
          ]
        })
        res.status(200).json(newProductData)
      }
      // if no product tags, just respond.
      else {
        res.status(200).json(newProduct)
      }
    }
  } catch (err) {
    res.status(400).json(err); // 400 status code means the server could not understand the request.
  }
});

// Updates a product by its `id` value.
router.put('/:id', async (req, res) => {
  // Calls the update method on the Product model.
  try {
    const updatedProduct = await Product.update(
      {
        // All the fields you can update and the data attached to the request body.
        product_name: req.body.product_name,
        price: req.body.price,
        stock: req.body.stock,
        category_id: req.body.category_id,
        tag_id: [],
      },
      // Gets the product based on the id given in the request parameters.
      {
        where: { id: req.params.id }
      });
    if (!updatedProduct[0]) {
      res.status(404).json({ message: "Please enter the necessary data!" });
      return;
    }
    else {
      // Find all associated tags from ProductTag.
      const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
      // Get list of current tag_ids.
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // Create filtered list of new tag_ids.
      const newProductTags = productTagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // Figure out which ones to remove.
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !productTagIds.includes(tag_id))
        .map(({ id }) => id);
      // Run all actions.
      const updatedProductTags = await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }).then((destroyed) => { if (destroyed === 0) { let destroyed = 'No Tags were removed!'; return destroyed } }),
        ProductTag.bulkCreate(newProductTags).then((newTags) => { if (newTags.length === 0) { let newTags = 'No new Tags were created!'; return newTags } }),
        // Collect all data from the updated product to display it on Insomnia.
        Product.findByPk(req.params.id, {
          attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
          include: [
            {
              model: Category,
              attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
            },
            {
              model: Tag,
              attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
            }
          ]
        })
      ]);
      res.status(200).json(updatedProductTags);
    }
  } catch (err) {
    res.status(500).json(err);
  }
})

// Delete a product by its `id` value.
router.delete("/:id", async (req, res) => {
  try {
    // Looks for the product based on id given in the request parameters and deletes the instance from the database.
    const deletedProduct = await Product.destroy({ where: { id: req.params.id } });
    if (!deletedProduct) {
      res.status(404).json({ message: 'No product with this id was found!' });
      return;
    }
    else {
      res.status(200).json({ message: 'Product successfully deleted!' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
