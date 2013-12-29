var machines = {
	"studio-x107-b01": {
		name: "studio-x107-b01",
		status: "running",
	},
	"studio-x107-b02": {
		name: "studio-x107-b02",
		status: "running",
	},
	"studio-w7-b01": {
		name: "studio-w7-b01",
		status: "stopped",
	},
	"studio-w7-b02": {
		name: "studio-w7-b02",
		status: "running",
	},
	"creative-x107-b01": {
		name: "creative-x107-b01",
		status: "running",
	},
	"creative-w7-b01": {
		name: "creative-w7-b01",
		status: "running",
	},
};

var builds = [
	"first.exe",
	"second.exe",
];

module.exports = {

    index: function( req, res ) {

        // Make view
        res.view( {"machines": machines} );
    },

    machine: function( req, res ) {

    	var name = req.params.name,
    		machine = machines[name];

		var responseObj = {
			"machines": machines,
			"machine": machine,
			"builds": builds,
		}

    	res.view( responseObj );
    },

    keepalive: function( req, res ) {
    	res.json( 200, {} );
    }
};