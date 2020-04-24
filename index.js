//jshint esversion:6
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const app = express();
const digestRequest = require('request-digest')('THETAYL00105377', '00105377');
const clientModeURL = "http://192.168.2.101";

const CORS_ANYWHERE = "http://127.0.0.1:3000";

const config = require('./config');



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

app.post('/takePicture', (req, res) => {
  request({
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    url: "http://192.168.1.1/osc/commands/execute",
    method: 'POST',
    json: {
      name: 'camera.takePicture',
    },
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
        "ipAddress": config.ipAddress || "192.168.2.123",
        "subnetMask": config.subnetMask || "255.255.255.0",
        "defaultGateway": config.defaultGateway || "192.168.2.1"
      }
    }
  }, (error, response, body) => {
    console.log(response);
    res.send(response);
  });
});

app.post("/setDynamicClient", (req, res) => {
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
        "ipAddressAllocation": "dynamic"
      }
    }
  }, (error, response, body) => {
    console.log(response);
    res.send(response);
  });
});

app.post("/disableSleep", (req, res) => {
  request({
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    url: "http://192.168.1.1/osc/commands/execute",
    method: "POST",
    json: {
      name: "camera.setOptions",
      parameters: {
        "options": {
          "sleepDelay": 65535,
          "offDelay": 65535
        }
      }
    }
  }, (error, response, body) => {
    console.log(response);
    res.send(response);
  });
});

app.post("/checkSleep", (req, res) => {
  request({
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    url: "http://192.168.1.1/osc/commands/execute",
    method: "POST",
    json: {
      name: "camera.getOptions",
      parameters: {
        "optionNames": [
          "sleepDelay",
          "offDelay"
        ]
      }
    }
  }, (error, response, body) => {
    console.log(response);
    res.send(response);
  });
});

app.post("/livePreview", (req, res) => {
  request({
    headers: {
      'content-type': 'application/json;charset=utf-8'
    },
    url: CORS_ANYWHERE + "http://192.168.1.1/osc/commands/execute",
    method: "POST",
    json: {
      name: "camera.getLivePreview"
    }
  }, (error, response, body) => {
  
  });
});


// not working
// https://github.com/dirtshell/amelia_viewer/blob/master/assets/js/ricoh_api.js
// getting CORS problem
// https://github.com/Rob--W/cors-anywhere
app.post("/showPreview", (req, res)=> {
  res.sendFile(__dirname + "/mjpeg.html");
});

// Digest Auth Tests

app.post('/digestState', (req, res) => {
  digestRequest.requestAsync({
    host: clientModeURL,
    path: '/osc/state',
    method: 'POST',
    json: true,
    body: {
    },
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      console.log(response.body);
      res.send(response.body);
    })
    .catch((error) => {
      console.log(error.statusCode);
      console.log(error.body);
    });
});

app.post('/clientTakePicture', (req, res) => {
  digestRequest.requestAsync({
    host: clientModeURL,
    path: '/osc/commands/execute',
    method: 'POST',
    json: true,
    body: {
      name: 'camera.takePicture',
    },
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  })
    .then((response) => {
      console.log(response.body);
      res.send(response.body);
    })
    .catch((error) => {
      console.log(error.statusCode);
      console.log(error.body);
    });
});


app.listen(3000, () => {
  console.log('THETA Node Server running on port 3000.');
});