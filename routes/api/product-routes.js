const router = require("express").Router();
const sequelize = require("../../config/connection");
const { Product, Category, Tag, ProductTag } = require("../../models");

//=============== The `/api/products` endpoint ===============//

// Get all products. -  // be sure to include its associated Category and Tag data
router.get("/", async (req, res) => {
  try {
    // Store the productData in a variable once the promise is resolved.
    const productData = await Product.findAll({
      attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
        },
        {
          model: Tag,
          attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
          through: ProductTag,
          as: 'tags',
        }
      ]
    })
    productData.every((product) => product instanceof Product);
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
          as: 'category',
          attributes: [['id', 'CategoryId'], ['category_name', 'Category']],
        },
        {
          model: Tag,
          attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
          through: ProductTag,
          as: 'tags',
        }
      ]
    })
    if (!productData) {
      res.status(404).json({ message: "No products with this id!" });
      return;
    }
    res.status(200).json(productData);
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
      // tagIds: [1, 2, 3, 4, 5, 6],
      // category_id: req.body.category_id,
    })
      // Need to get name of the category and store it as id - tag name and store product_id inside product tag.
      .then((product) => {
        // if there's product tags, we need to create pairings to bulk create in the ProductTag model
        if (req.body.tagIds.length) {
          const productTagIdArr = req.body.tagIds.map((tag_id) => {
            return {
              product_id: product.id,
              tag_id,
            };
          });
          return ProductTag.bulkCreate(productTagIdArr);
        }
        // if no product tags, just respond
        if (!req.body.tagIds.length) {
          res.status(404).json({ message: "No product Tags found!" }); // Create?
          return;
        }
        res.status(200).json(product);
      })
      .then((productTagIds) => res.status(200).json(productTagIds))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
    await newProduct.save(); // Add it to the database.
    res.status(200).json(newProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Update product.
router.put("/:id", async (req, res) => {
  // update product data
  try {
    const updatedProduct = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then((product) => {
        // find all associated tags from ProductTag
        return ProductTag.findAll({ where: { product_id: req.params.id } });
      })
      .then((productTags) => {
        // get list of current tag_ids
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        // create filtered list of new tag_ids
        const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });
        // figure out which ones to remove
        const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);

        // run both actions
        return Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      })
      .then((updatedProductTags) => res.json(updatedProductTags))
      .catch((err) => {
        // console.log(err);
        res.status(400).json(err);
      })
    await updatedProduct.save(); //  Updated in the database.
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a product by its `id` value.
router.delete("/:id", async (req, res) => {
  try {
    // Looks for the product based on id given in the request parameters and deletes the instance from the database.
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(deletedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
