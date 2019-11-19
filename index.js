//jshint esversion:6
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const app = express();


app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res)=> {
  res.sendFile(__dirname + "/index.html");
  console.log("get request")
});

app.post("/", (req, res)=> {
  request("http://192.168.1.1/osc/info", (error, response, body)=>{
    let data = JSON.parse(body);
    console.log(response);
    console.log("Bluetooth Mac Address: " + data._bluetoothMacAddress);
    res.send(response);

  });
 
});

app.listen(3000, ()=> {
  console.log("THETA Node Server running on port 3000.");
});