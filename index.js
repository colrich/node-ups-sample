var redis = require("redis")
var express = require('express')
var app = express()



/**
 * this is what our VCAP_SERVICES block will look like -
{
 "VCAP_SERVICES": {
  "user-provided": [
   {
    "binding_name": null,
    "credentials": {
     "password": "aoeuaoeu",
     "uri": "mongodb://whatever.com:5555/mydb",
     "user": "craig"
    },
    "instance_name": "dev-mongo",
    "label": "user-provided",
    "name": "dev-mongo",
    "syslog_drain_url": "",
    "tags": [],
    "volume_mounts": []
   }
  ]
 }
}
 */

function getUserProvidedServices() {
  var vcstr = process.env.VCAP_SERVICES;
  if (vcstr != null && vcstr.length > 0 && vcstr != '{}') {
    console.log("found VCAP_SERVICES: " + vcstr)

    var vcap = JSON.parse(vcstr);
    if (vcap != null) {
      if (vcap.hasOwnProperty("user-provided")) {
        console.log("found user-provided service instance: " + vcap["user-provided"]);
        return vcap["user-provided"];
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

  var ups = getUserProvidedServices()
  if (ups != null) {
    var respbuf = "";
    for (var i = 0; i < ups.length; i++) {
      console.log("UPS name: " + ups[i].instance_name + " / URI: " + ups[i].credentials["uri"] + " / user: " + ups[i].credentials["user"] + " / pass: " + ups[i].credentials["password"])
      respbuf += ("UPS name: " + ups[i].instance_name + " / URI: " + ups[i].credentials["uri"] + " / user: " + ups[i].credentials["user"] + " / pass: " + ups[i].credentials["password"] + "<br />")
    }
    response.send(respbuf)
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
