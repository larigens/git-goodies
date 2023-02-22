const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

//=============== The `/api/tags` endpoint ===============//

// Get all tags and changes the anonymous callback function to become Asynchronous with with try/catch for errors.
// along with HTTP status codes.
router.get("/", async (req, res) => {
  try {
    // Store the tagData in a variable once the promise is resolved.
    const tagData = await Tag.findAll({
      attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
      // Includes its associated Product data.
      include: [
        {
          model: Product,
          attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
        }
      ]
    })
    // Find all tags from the table and returns the tagData promise inside of the JSON response.
    res.status(200).json(tagData); // 200 status code means the request is successful.
  } catch (err) {
    // 500 status code means internal server error.
    res.status(500).json(err);
  }
});

// Find one tag by its `id` value.
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
    // Response if no data is found for the entered id.
    if (!tagData) {
      res.status(404).json({ message: "No tags with this id!" });
      return;
    }
    else {
      res.status(200).json(tagData);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Creates a new tag.
router.post("/", async (req, res) => {
  try {
    // Use Sequelize's `create()` method to add a row to the table.
    const newTag = await Tag.create({ tag_name: req.body.tag_name })
    if (!newTag) {
      res.status(404).json({ message: "Please enter the necessary data!" });
      return;
    }
    else {
      // Collect all data from the new tag to display it on Insomnia.
      const newTagData = await Tag.findByPk(newTag.id, { attributes: [['id', 'TagId'], ['tag_name', 'Tag']] })
      res.status(200).json(newTagData);
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
    if (!updatedTag[0]) {
      res.status(404).json({ message: 'No tag with this id was found!' });
      return;
    }
    else {
      // Collect all data from the updated tag to display it on Insomnia.
      const updatedTagData = await Tag.findByPk(req.params.id, {
        attributes: [['id', 'TagId'], ['tag_name', 'Tag']],
        include: [
          {
            model: Product,
            attributes: [['id', 'ProductId'], ['product_name', 'Product'], ['price', 'Price'], ['stock', 'Stock'], ['category_id', 'CategoryId']],
          }
        ]
      })
      res.status(200).json(updatedTagData);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a tag by its `id` value.
router.delete("/:id", async (req, res) => {
  try {
    // Looks for the tags based on id given in the request parameters and deletes the instance from the database.
    const deletedTag = await Tag.destroy({ where: { id: req.params.id } });
    if (!deletedTag) {
      res.status(404).json({ message: 'No tag with this id was found!' });
      return;
    }
    else {
      res.status(200).json({ message: 'Tag successfully deleted!' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
