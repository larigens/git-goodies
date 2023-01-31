// Imports important parts of Sequelize library.
const { Model, DataTypes } = require("sequelize");
// Imports the database connection.
const sequelize = require("../config/connection");

// Initialize ProductTag model (table) by extending off Sequelize's Model class.
class ProductTag extends Model {}
// Set up fields and rules for ProductTag model.
ProductTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "product",
        key: "id",
      },
    },
    tag_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "tag",
        key: "id",
      },
    },
  },
  {
    sequelize, // Links to database connection.
    timestamps: false, // Set to false to remove `created_at` and `updated_at` fields.
    freezeTableName: true, // Prevents sequelize from renaming the table.
    underscored: true, // Makes all variables that have 2 names to be separated by an underscore.
    modelName: "product_tag",
  }
);

module.exports = ProductTag;
