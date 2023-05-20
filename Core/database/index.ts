import Keys_table from "./models/keys.model";
import chalk from "chalk";
const ora = require("ora");
const Sequelize = require("sequelize");

const Database = () => {
  const sequelize = new Sequelize("whatsapp", "root", "", {
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false,
  });
  sequelize
    .authenticate()
    .then(() => {
      console.log(
        chalk.green("✅ Database connection has been established successfully.")
      );
    })
    .catch((error) => {
      console.error("Unable to connect to the database: ", error);
    });

  const Keys = Keys_table(sequelize); // add keys table to the database
  sequelize
    .sync()
    .then(() => {
      // console.log("Book table created successfully!");
    })
    .catch((error) => {
      console.error("Unable to create table : ", error);
    });

  return { Keys: Keys };
};

export default Database;
