const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

// find all tags
// be sure to include its associated Product data
router.get("/", async (req, res) => {
  try {
    // Store the tagData in a variable once the promise is resolved.
    const tagData = await Tag.findAll({
      attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
      include: [
        {
          model: Product,
          attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
        }
      ]
    })
    tagData.every((tag) => tag instanceof Tag);
    // Find all tags from the table and returns the tagData promise inside of the JSON response.
    res.status(200).json(tagData); // 200 status code means the request is successful.
  } catch (err) {
    // 500 status code means internal server error.
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
      include: [
        {
          model: Product,
          attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
        }
      ]
    })
    if (!tagData) {
      res.status(404).json({ message: "No tags with this id!" });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  try {
    // Use Sequelize's `create()` method to add a row to the table.
    const newTag = await Tag.create({ tag_name: req.body.tag_name })
    // if no product tags, just respond
    if (!newTag) {
      res.status(404).json({ message: "Please enter the necessary data!" }); // Create?
      return;
    }
    else {
      res.status(200).json(newTag);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// Updates a tag by its `id` value.
router.put("/:id", async (req, res) => {
  try {
    // Calls the update method on the Tag model.
    const updatedTag = await Tag.update(
      {
        // All the fields you can update and the data attached to the request body.
        tag_name: req.body.tag_name,
      },
      {
        // Gets the tag based on the id given in the request parameters.
        where: {
          id: req.params.id
        },
      }
    );
    if (!updatedTag) {
      res.status(404).json({ message: 'No tag with this id was found!' });
      return;
    }
    else {
      await updatedTag.save(); //  Updated in the database.
      res.status(200).json(updatedTag);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// Delete a tag by its `id` value.
router.delete("/:id", async (req, res) => {
  try {
    // Looks for the tags based on id given in the request parameters and deletes the instance from the database.
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedTag) {
      res.status(404).json({ message: 'No tag with this id was found!' });
      return;
    }
    res.status(200).json(deletedTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
