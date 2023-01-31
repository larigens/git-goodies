// Imports important parts of Sequelize library.
const { Model, DataTypes } = require("sequelize");
// Imports the database connection.
const sequelize = require("../config/connection");

// Initialize Product model (table) by extending off Sequelize's Model class.
class Product extends Model {}
Product.init(
  // Set up fields and rules for Product model.
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2).UNSIGNED,
      allowNull: false,
      validate: {
        isDecimal: true,
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
      },
      defaultValue: 10,
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "category",
        key: "id",
      },
    },
  },
  {
    sequelize, // Links to database connection.
    timestamps: false, // Set to false to remove `created_at` and `updated_at` fields.
    freezeTableName: true, // Prevents sequelize from renaming the table.
    underscored: true, // Makes all variables that have 2 names to be separated by an underscore.
    modelName: "product",
  }
);

module.exports = Product;
