var async = require("async");

var hasSetupSockets = false;

module.exports = {

    index: function( req, res ) {
    	setupSockets( sails.io.sockets );

    	BuildMachine.find()
			.done(function( error, machines ) {

			// Make view
        	res.view( {"machines": machines} );
		});        
    },

    machine: function( req, res ) {
    	setupSockets( sails.io.sockets );

    	var machineName = req.params.name;

    	AllModels.find(function( error, data ) {
    		var machines = data.machines;

			for( var iMachine in machines ) {
				if( machines[iMachine].name == machineName ) {
					machine = machines[iMachine];
					break;
				}
			}

			var responseObj = {
				"machines": machines,
				"machine": machine,
				"builds": data.builds,
			}

    		res.view( responseObj );
		});

//    	BuildMachine.find()
//			.done(function( error, machines ) {
//
//			for( var iMachine in machines ) {
//				if( machines[iMachine].name == machineName ) {
//					machine = machines[iMachine];
//					break;
//				}
//			}
//
//			var responseObj = {
//				"machines": machines,
//				"machine": machine,
//				"builds": builds,
//			}
//
//    		res.view( responseObj );
//		});   
    },

    get: function( req, res ) {
    	setupSockets( sails.io.sockets );

    	BuildMachine.find()
			.done(function( error, machines ) {

			// Make view
        	res.json( {"machines": machines} );
		});
    },

    keepalive: function( req, res ) {
    	res.json( 200, {} );
    }
};


function setupSockets( sockets ) {
	if( hasSetupSockets )
		return;

	hasSetupSockets = true;

	function updateClientsOnChange() {
		AllModels.find( function(error, data) {
	    	sockets.emit( "update", data );
		});
	}

	var keepaliveTime = 2000;

	// We're going to setup a repeating check to make sure
	// machines that have signed up are still present.
	setInterval( function() {

		BuildMachine.find()
					.done(function( error, machines ) {

			async.eachSeries( machines, function( machine, callback ) {
			  	
			  	var timeSinceKeepalive = new Date() - new Date( machine.alive ),
			  		wasExpired = machine.expired;

			  	if( machine.alive == undefined || timeSinceKeepalive > keepaliveTime ) {
			  		
			  		BuildMachine.update({
				  		name: machine.name
					}, {
						expired: true
					}, function( err, machines ) {
						if( err ) {
					 	  	console.log( err );
					 	  	callback( err );
					 	} else {
					 		// If this machine wasn't expired, but now is, update the clients
					 		if( !wasExpired ) {
					 	  		updateClientsOnChange();
					 		}

						  	callback();
						}
					});
			  	} else {
			  		callback();
			  	}

			}, function( err ) {
			  	if( err ) { 
			  		console.log( err ); 
			  	}
			  	
			  	console.log( 'Finished removing expired machines' );
			});
		});

	}, keepaliveTime );


	sockets.on( "connection", function(socket) {

		socket.on( "alive", function( data ) {
			BuildMachine.find()
				.where({ name: data.name })
				.exec( function(err, machines) {

				console.log( "Finding user with name " + data.name );

				if( err != null ) {
					return console.log( "Error: " + err );
				} else {

					if( machines.length == 0 ) {

						var newMachine = {
							name: data.name,
							status: "stopped",
							alive: new Date(),
							expired: false,
						}

						// Create a new user with a fresh keepalive timestamp
						BuildMachine.create(newMachine).done( function(err, machine) {
							if( err ) {
								console.log( "Error: " + err );
							} else {
								console.log( "Created machine: " + machine );
							}
						});

						updateClientsOnChange();

					} else if( machines.length == 1 ) {

						var wasExpired = machines[0].expired;

						BuildMachine.update({
					  		name: data.name
						}, {
							alive: new Date(),
							expired: false
						}, function( err, machines ) {

							// Update the client if something changed
							if( wasExpired ) {
								updateClientsOnChange();
							}

							console.log( "Updated machine timestamp" );
						});

					} else {
						console.log( "Something went wrong, more than one user found" );
					}
					
				}
				
			});
		});
	});
}