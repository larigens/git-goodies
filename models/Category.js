// Imports important parts of Sequelize library.
const { Model, DataTypes } = require("sequelize");
// Imports the database connection.
const sequelize = require("../config/connection");

// Initialize Category model (table) by extending off Sequelize's Model class.
class Category extends Model {}
Category.init(
  // Set up fields and rules for Category model.
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize, // Links to database connection.
    timestamps: false, // Set to false to remove `created_at` and `updated_at` fields.
    freezeTableName: true, // Prevents sequelize from renaming the table.
    underscored: true, // Makes all variables that have 2 names to be separated by an underscore.
    modelName: "category",
  }
);

module.exports = Category;
