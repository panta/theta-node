//jshint esversion: 6

// var digestRequest = require('request-digest')('THETAYL00105377', '00105377');
// digestRequest.requestAsync({
//   host: 'http://192.168.2.101',
//   path: '/osc/info',
//   port: 80,
//   method: 'GET',
//   json: true,
//   body: {
//   },
//   headers: {
//         'Content-Type': 'application/json'
//       }
// })
// .then(function (response) {
//   console.log(response.body);
// })
// .catch(function (error) {
//   console.log(error.statusCode);
//   console.log(error.body);
// });


const digestRequest = require('request-digest')('THETAYL00105377', '00105377');

digestRequest.requestAsync({
  host: 'http://192.168.2.101',
  path: '/osc/state',
  port: 80,
  method: 'POST',
  json: true,
  body: {
  },
  headers: { 'Content-Type': 'application/json' },
})
  .then((response) => {
    console.log(response.body);
  })
  .catch((error) => {
    console.log(error.statusCode);
    console.log(error.body);
  });
