const express = require("express");
const bodyParser = require("body-parser");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const fs = require("fs");

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    // Create a worker
    console.log(`cluster forked for server at cpu number ${i}`);
    cluster.fork();
  }
} else {
  // Workers share the TCP connection in this server
  const app = express();

  app.use(express.static("build"));
  app.use(bodyParser.json());

  app.get("/get-account", (req, res) => {
    const { userName } = req.body;
    const rawdata = fs.readFileSync("./database/accounts.json");
    const jsondata = JSON.parse(rawdata);

    res.send(jsondata[userName]);
  });

  app.get("/get-accounts", (req, res) => {
    const rawData = fs.readFileSync("./database/accounts.json");
    const jsonData = JSON.parse(rawData);
    const arrayData = Object.values(jsonData);

    res.send(arrayData);
  });

  app.post(
    "/create-account/:userName/:name/:lastName/:balance/:accountType/:currencyType",
    (req, res) => {
      const { userName, name, lastName, balance, accountType, currencyType } =
        req.params;
      const rawData = fs.readFileSync("./database/accounts.json");
      const jsonDataToModify = JSON.parse(rawData);

      jsonDataToModify[userName] = {
        name,
        lastName,
        userName,
        balance: Number(balance),
        accountType,
        currencyType,
      };

      const jsonDataToWrite = JSON.stringify(jsonDataToModify);
      fs.writeFileSync("./database/accounts.json", jsonDataToWrite);

      res.send(`Successfully created ${accountType} account`);
    }
  );

  app.put("/add-money", (req, res) => {
    const { userName, amount } = req.body;
    const rawData = fs.readFileSync("./database/accounts.json");
    const jsonDataToModify = JSON.parse(rawData);
    const jsonAccountData = jsonDataToModify[userName];
    const { name, lastName, balance, accountType, currencyType } =
      jsonAccountData;

    jsonDataToModify[userName] = {
      name,
      lastName,
      userName,
      balance: Number(balance) + Number(amount),
      accountType,
      currencyType,
    };

    const jsonDataToWrite = JSON.stringify(jsonDataToModify);
    fs.writeFileSync("./database/accounts.json", jsonDataToWrite);

    res.send(`Added money successfully to ${accountType} account`);
  });

  app.delete("/delete-account", (req, res) => {
    const { userName } = req.body;
    const rawData = fs.readFileSync("./database/accounts.json");
    const jsonDataToModify = JSON.parse(rawData);
    delete jsonDataToModify[userName];

    const jsonDataToWrite = JSON.stringify(jsonDataToModify);
    fs.writeFileSync("./database/accounts.json", jsonDataToWrite);

    res.send("Successfully deleted account");
  });

  // All workers use this port
  app.listen(process.env.PORT || 5000, () => {
    console.log(`server listenting in port ${process.env.PORT || 5000}`);
  });
}
