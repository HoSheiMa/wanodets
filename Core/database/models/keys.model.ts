const { DataTypes } = require("sequelize");
const Keys_table = (sequelize) => {
  const _Keys = sequelize.define("keys", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });
  return _Keys;
};

export default Keys_table;
