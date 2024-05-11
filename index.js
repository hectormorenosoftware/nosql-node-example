const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");

app.use(express.static("build"));
app.use(bodyParser.json());

app.get("/get-user", (req, res) => {
  const { userName } = req.body;
  const rawdata = fs.readFileSync("./database/users.json");
  const jsondata = JSON.parse(rawdata);

  res.send(jsondata[userName]);
});

app.get("/get-users", (req, res) => {
  const rawData = fs.readFileSync("./database/users.json");
  const jsonData = JSON.parse(rawData);
  const arrayData = Object.values(jsonData);

  res.send(arrayData);
});

app.post("/create-user/:userName/:name/:lastName", (req, res) => {
  const { userName, name, lastName } = req.params;
  const rawData = fs.readFileSync("./database/users.json");
  const jsonDataToModify = JSON.parse(rawData);

  jsonDataToModify[userName] = {
    name,
    lastName,
    userName: userName,
  };

  const jsonDataToWrite = JSON.stringify(jsonDataToModify);
  fs.writeFileSync("./database/users.json", jsonDataToWrite);

  res.send("Successfully created user");
});

app.put("/update-user", (req, res) => {
  const { userName, name, lastName } = req.body;
  const rawData = fs.readFileSync("./database/users.json");
  const jsonDataToModify = JSON.parse(rawData);

  jsonDataToModify[userName] = {
    name,
    lastName,
    userName,
  };

  const jsonDataToWrite = JSON.stringify(jsonDataToModify);
  fs.writeFileSync("./database/users.json", jsonDataToWrite);

  res.send("Successfully Updated User");
});

app.delete("/delete-user", (req, res) => {
  const { userName } = req.body;
  const rawData = fs.readFileSync("./database/users.json");
  const jsonDataToModify = JSON.parse(rawData);
  delete jsonDataToModify[userName];

  const jsonDataToWrite = JSON.stringify(jsonDataToModify);
  fs.writeFileSync("./database/users.json", jsonDataToWrite);

  res.send("Successfully Deleted User");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("listenting");
});
