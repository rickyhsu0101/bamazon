const inquirer = require("inquirer");
require("dotenv").config();
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});
connection.connect(function (err) {
  if (err) {
    throw err;
  }
  console.log('connected as id ' + connection.threadId);
});
init();
function init(){
  connection.query('SELECT * FROM products', function(err, res){
    res.forEach(element => {
      console.log(`ID:\t\t${element.item_id}`);
      console.log(`Name:\t\t${element.product_name}`);
      console.log(`Department:\t${element.department_name}`);
      console.log(`Price:\t\t$${element.price}`);
      console.log(`Quantity:\t${element.stock_quantity}`);
      console.log();
    });
    prompts();
  });
}
function prompts(){
  inquirer.prompt([
    {
      name: "productID",
      message: "Please Enter the Product ID",
      default: "None"
    },
    {
      name: "units",
      message: "Enter the Amount of Units",
      default: "None"
    }
  ]).then(answers =>{
    if(answers.productID != "None" && answers.units != "None"){
      connection.query(`SELECT * FROM products WHERE item_id=${answers.productID}`, function(err, res){
        if(res.length > 0){
          const price = res[0].price;
          let quantity = res[0].stock_quantity;
          if(parseInt(answers.units) <= quantity){
            quantity-= answers.units;
            connection.query(`UPDATE products SET stock_quantity=${quantity} WHERE item_id=${res[0].item_id}`, function(err, res){
              console.log(`Total cost is\t\t${price*parseInt(answers.units)}`);
            });
          }else{
            console.log("Insufficient Quantity");
          }
        }else{
          console.log("Wrong Info");
        }
      });
    }
  });
}