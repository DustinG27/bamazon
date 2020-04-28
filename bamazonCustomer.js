// connecting the required instalations
const mysql = require("mysql");
const inquirer = require("inquirer");
// connecting to mysql
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Weezer#123",
  database: "bamazon",
});
// running the connection before running the program
connection.connect(function (err) {
  if (err) throw err;

  // bringing up all the available products one initail load
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      console.log(
        res[i].item_id +
          ". " +
          "Product: " +
          res[i].product_name +
          " | " +
          "Department: " +
          res[i].department_name +
          " | " +
          "Price: " +
          res[i].price
      );
      console.log(
        "--------------------------------------------------------------------------------------------------"
      );
    }
    console.log(" ");
    start();
  });
});

// once products are loaded then the inquirer will pop up
function start() {
  inquirer
    .prompt({
      name: "id",
      type: "input",
      message: "Please enter the Product ID of the item you want to purchase.",
    })

    // select products from mysql connection
    .then(function (answer) {
      let selection = answer.id;
      connection.query(
        "SELECT * FROM products WHERE item_id=?",
        selection,
        function (err, res) {
          if (err) throw err;
          if (res.length === 0) {
            console.log("Select a number from the list");
            start();
          } else {
            inquirer
              .prompt({
                name: "quantity",
                type: "input",
                message: "How many would you like to purchase?",
              })
              .then(function (qtyAnswer) {
                let quantity = qtyAnswer.quantity;
                if (quantity > res[0].stock_quantity) {
                  console.log(
                    "We only have " + res[0].stock_quantity + " units in stock"
                  );
                  start();
                } else {
                  console.log(" ");
                  console.log(res[0].product_name + " purchased");
                  console.log(quantity + " units @ $" + res[0].price);
                  
                  let newQuantity = res[0].stock_quantity - quantity;
                  connection.query(
                    "UPDATE products SET stock_quantity = " +
                      newQuantity +
                      " WHERE id = " +
                      res[0].item_id,
                    function (err, resUpdate) {
                      if (err) throw err;
                      console.log(" ");
                      console.log("Your oder has been processed.\n Thank you for shopping" )
                      connection.end();
                    
                    }
                  );
                }
              });
          }
        }
      );
    });
}
