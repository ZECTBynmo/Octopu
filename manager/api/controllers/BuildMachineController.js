var hasSetupSockets = false;

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
    	setupSockets( sails.io.sockets );

        // Make view
        res.view( {"machines": machines} );
    },

    machine: function( req, res ) {
    	setupSockets( sails.io.sockets );

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


function setupSockets( sockets ) {
	if( hasSetupSockets )
		return;

	hasSetupSockets = true;

	sockets.on( "connection", function(socket) {
		socket.on( "alive", function( data ) {
			BuildMachine.find()
				.where({ name: data.name })
				.exec(function(err, users) {

				console.log( "Finding user with name " + data.name );

				if( err != null ) {
					return console.log( "Error: " + err );
				} else {
					if( users.length == 0 ) {
						BuildMachine.create({
							name: data.name,
							status: "stopped",
						}).done( function(err, machine) {
							if( err ) {
								console.log( "Error: " + err );
							} else {
								console.log( "Created machine: " + machine );
							}
						});
					} else {
						console.log( "Found this stuff: " );
						console.log( users );
					}
				}
				
			});
		});
	});
}