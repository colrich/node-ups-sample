var redis = require("redis")
var express = require('express')
var app = express()




function getUserProvidedService() {
  var vcstr = process.env.VCAP_SERVICES;
  if (vcstr != null && vcstr.length > 0 && vcstr != '{}') {
    console.log("found VCAP_SERVICES: " + vcstr)

    var vcap = JSON.parse(vcstr);
    if (vcap != null) {
      if (vcap.hasOwnProperty("user-provided")) {
        console.log("found user-provided service instance: " + vcap["user-provided"][0].credentials);
        return vcap["user-provided"][0].credentials;
      }
    }
  }
}

// set the port to listen on; for apps in PCF it's important to listen on $PORT (usually 8000)
app.set('port', (process.env.PORT || 8080))


// this method looks in VCAP_SERVICES for a redis service instance and outputs the 
// host / port / password info to the response
app.get('/', function(request, response) {
  console.log("Getting Redis connection info from the environment...")

  var ups = getUserProvidedService()
  if (ups != null) {
    console.log("UPS URI: " + ups["uri"] + " / user: " + ups["user"] + " / pass: " + ups["password"])
    response.send("UPS URI: " + ups["uri"] + " / user: " + ups["user"] + " / pass: " + ups["password"])
  }
  else {
    console.log("ERROR: VCAP_SERVICES does not contain a user-provided service block or no UPS bound")
    response.send("ERROR: VCAP_SERVICES does not contain a user-provided service block or no UPS bound")
  }

})

// start listening for connections
app.listen(app.get('port'), function() {
  console.log("Node app is running on port:" + app.get('port'))
})
