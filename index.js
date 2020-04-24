//jshint esversion:6
require('dotenv').config();

const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const app = express();
const digestRequest = require('request-digest')(process.env.THETA_ID, process.env.THETA_PASSWORD);

const CORS_ANYWHERE = "http://127.0.0.1:3000";

const config = require('./config');


// from https://stackoverflow.com/a/54098693/1363486
function getArgs () {
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach( arg => {
        // long arg
        if (arg.slice(0,2) === '--') {
            const longArg = arg.split('=');
            const longArgFlag = longArg[0].slice(2,longArg[0].length);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === '-') {
            const flags = arg.slice(1,arg.length).split('');
            flags.forEach(flag => {
            args[flag] = true;
            });
        }
    });
    return args;
}

function isTrue(value){
    if (typeof(value) === 'string'){
        value = value.trim().toLowerCase();
    }
    switch(value){
        case true:
        case "true":
        case "t":
        case 1:
        case "1":
        case "on":
        case "yes":
        case "y":
            return true;
        default: 
            return false;
    }
}

const args = getArgs();
console.log(args);

const currentThetaIP = args.thetaIp || args.ip || args.I || process.env.THETA_CURRENT_IP;

const clientMode = isTrue(args['client-mode'] || args.C);
const clientModeIP = currentThetaIP;
const clientModeURL = "http://" + clientModeIP;

console.log("client mode:", clientMode);
console.log("client mode url:", clientModeURL);

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
        "ipAddress": currentThetaIP,
        "subnetMask": config.subnetMask,
        "defaultGateway": config.defaultGateway
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