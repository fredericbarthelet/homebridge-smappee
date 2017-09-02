[Smappee](https://www.smappee.com/) plugin for Homebridge

Currently, this plugin switches on and off the Comfort Plugs delivered with the Smappee energy monitor. Each of those plug
can be defined in Home application as being either a switch, a fan or a lightbulb.

## Installation

Install physically your smart plugs on desired locations and link them using your Smappee application. 

Install homebridge using: `npm install -g homebridge`

Install this plugin using: `npm install -g homebridge-smappee`

Update your configuration file. See sample `config.json` snippet below.

## Configuration

Configuration sample:

```
accessories : [ 
  {
    "accessory": "HomebridgeSmappee",
    "name": "Smappee Switch",
    "password": "admin",
    "ip": "192.168.0.10",
    "switch_id": "2"
  }
]
```

Fields:
* "accessory": Must always be "HomebridgeSmappee" (required)
* "name": Can be anything (required)
* "password": Password used to logon to smappee hub. **admin** is the default password.
* "ip" : IP Address of your smappee energy monitor. In your Smappee application, go to Main menu > Smappee and click on
the `SN XXXXXXXXXXXX`.
* "switch_id": ID of your switch. This information can be found using your browser on `http://<IP-SMAPPEE>/smappee.html`. Login
using `admin` password and go to the 'Home control' tab to find out your Comfort Plug ID.
