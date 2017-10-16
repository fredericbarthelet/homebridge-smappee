var Service, Characteristic;
const request = require('request');

// "accessories": [
//   {
//     "accessory": "HomebridgeSmappee",
//     "name": "Smappee Switch",
//     "password": "admin",
//     "ip": "ip",
//     "switch_id": "2"
//   }
// ]

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-smappee", "HomebridgeSmappee", HomebridgeSmappee);
};

function HomebridgeSmappee(log, config) {
  this.currentState = false;
  this.log = log;
  this.name = config["name"];
  this.switch_id = config["switch_id"];
  this.postData = {'on': 'control,controlId=1|' + this.switch_id, 'off': 'control,controlId=0|' + this.switch_id};
  this.urlSet = 'http://' + config["ip"] + '/gateway/apipublic/commandControlPublic';
  this.urlAuth = 'http://' + config["ip"] + '/gateway/apipublic/logon';

  if (config.hasOwnProperty("password")) {
    this.password = config["password"];
  } else {
    this.password = "admin";
  }
}

HomebridgeSmappee.prototype = {

  makeHttpRequest: function(url, postData, next) {
    var me = this;
    request({
        url: url,
        body: postData,
        method: 'POST',
        headers: {'Content-type': 'application/json'}
      },
      function(error, response, body) {
        if (200 != response.statusCode) {
          me.log('STATUS: ' + response.statusCode);
          me.log('HEADERS: ' + JSON.stringify(response.headers));
          me.log('BODY: ' + body);
        }
        return next(error, response, body);
      });
  },

  getPowerState: function (next) {
    return next(null, this.currentState);
  },

  setPowerState: function(powerOn, next) {
    var me = this;
    this.authenticate(function (error) {
      if (error) {
        return next(error);
      } else {
        me.makeHttpRequest(me.urlSet, powerOn ? me.postData.on : me.postData.off, function (error) {
          if (error) {
            return next(error);
          } else {
            me.currentState = !me.currentState;
            return next();
          }
        });
      }
    });
  },

  authenticate: function(next) {
    var me = this;
    this.makeHttpRequest(me.urlAuth, me.password, function (error) {
      if (error) {
        return next(error);
      } else {
        return next();
      }
    });
  },

  getServices: function () {
    var me = this;
    var informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Smappee Manufacturer")
      .setCharacteristic(Characteristic.Model, "Smappee Model")
      .setCharacteristic(Characteristic.SerialNumber, "Smappee Serial Number");

    var switchService = new Service.Switch(me.name);
    switchService.getCharacteristic(Characteristic.On)
      .on('get', this.getPowerState.bind(this))
      .on('set', this.setPowerState.bind(this));

    this.informationService = informationService;
    this.switchService = switchService;
    return [informationService, switchService];
  }
};


