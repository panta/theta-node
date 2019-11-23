//jshint esversion:6
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const app = express();

var config = require('./config');


app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
  console.log("get request");
});

app.post("/", (req, res) => {
  request("http://192.168.1.1/osc/info", (error, response, body) => {
    let data = JSON.parse(body);
    console.log(response);
    console.log("Bluetooth Mac Address: " + data._bluetoothMacAddress);
    res.send(response);
  });
});

// example of POST with no parameters

app.post("/state", (req, res) => {
  request.post({
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    url: "http://192.168.1.1/osc/state"
  }, (error, response, body) => {
    console.log(response);
    res.send(response);
  });
});

// example of POST with simple payload

app.post("/takePicture", (req, res) => {
  request({
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    url: "http://192.168.1.1/osc/commands/execute",
    method: "POST",
    json: {
      name: "camera.takePicture"
    }
  }, (error, response, body) => {
    console.log(response);
    res.send(response);
  });
});

// example of POST with payload and parameters

app.post("/listFiles", (req, res) => {
  request({
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    url: "http://192.168.1.1/osc/commands/execute",
    method: "POST",
    json: {
      name: "camera.listFiles",
      parameters: {
        "fileType": "image",
        "entryCount": 2,
        "maxThumbSize": 0        
      }

    }
  }, (error, response, body) => {
    
    let secondImageUri = body.results.entries[1].fileUrl;
    console.log("first image uri = " + secondImageUri);
    let webPage = "<h1>Body of response</h1>" + "<pre>" +
      JSON.stringify(body, null, 2) + "</pre> + <hr>" ;
    webPage = webPage + "<img width='500' src='" + secondImageUri + "'>";
    
    res.send(webPage);
  });
});

// The next example uses access point mode to configure client mode.
// After you configure the camera for client mode, 
// you may need to reboot the camera.
app.post("/setIpAddress", (req, res) => {
  request({
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    url: "http://192.168.1.1/osc/commands/execute",
    method: "POST",
    json: {
      name: "camera._setAccessPoint",
      parameters: {
        "ssid": config.ssid,  // change to string for your ssid
        "security": "WPA/WPA2 PSK",
        "password": config.password,  // set string to the password of your router
        "connectionPriority": 1,
        "ipAddressAllocation": "static",
        "ipAddress": "192.168.2.123",
        "subnetMask": "255.255.255.0",
        "defaultGateway": "192.168.2.1"
      }
    }
  }, (error, response, body) => {
    console.log(response);
    res.send(response);
  });
});


app.listen(3000, () => {
  console.log("THETA Node Server running on port 3000.");
});