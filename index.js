var Service, Characteristic;
const request = require('request');
const url = require('url');

// "accessories": [
//   {
//     "accessory": "HomebridgeSmappee",
//     "name": "Smappee Switch",
//     "url": "http://<IP of Smappee>/gateway/apipublic/commandControlPublic",
//     "switch_id": "2"
//   }
// ]

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-smappee", "HomebridgeSmappee", HomebridgeSmappee);
};

function HomebridgeSmappee(log, config) {
  this.log = log;
  this.urlData = url.parse(config["url"]);
  this.switch_id = config["switch_id"];
  this.name = config["name"];
  this.currentState = false;
  this.postData = {'on': 'control,controlId=1|' + this.switch_id, 'off': 'control,controlId=0|' + this.switch_id};
}

HomebridgeSmappee.prototype = {

  makeHttpRequest: function(postData, next) {
    var me = this;
    request({
        url: me.urlData,
        body: postData,
        method: 'POST',
        headers: {'Content-type': 'application/json'}
      },
      function(error, response, body) {
        me.log('STATUS: ' + response.statusCode);
        me.log('HEADERS: ' + JSON.stringify(response.headers));
        me.log('BODY: ' + body);
        next(error, response, body);
      });
  },

  getPowerState: function (next) {
    next(null, this.currentState);
  },

  setPowerState: function(powerOn, next) {
    var me = this;
    this.makeHttpRequest(powerOn ? me.postData.on : me.postData.off, function (error) {
      if (error) {
        next(error);
      } else {
        me.currentState = !me.currentState;
        next();
      }
    });
  },

  identify: function (callback) {
    this.log("Identify requested!");
    callback(); // success
  },

  getServices: function () {
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Smappee Manufacturer")
      .setCharacteristic(Characteristic.Model, "Smappee Model")
      .setCharacteristic(Characteristic.SerialNumber, "Smappee Serial Number");

    var switchService = new Service.Switch(this.name);
    switchService.getCharacteristic(Characteristic.On)
      .on('get', this.getPowerState.bind(this))
      .on('set', this.setPowerState.bind(this));

    this.switchService = switchService;
    return [switchService];
  }
};


