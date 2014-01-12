var async = require("async");

var hasSetupSockets = false,
	machineSockets = {},
	runningBuilds = {};

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

        	res.json( {"machines": machines} );
		});
    },

    getMachine: function( req, res ) {
    	setupSockets( sails.io.sockets );

    	BuildMachine.find()
			.where({ name: req.params.name })
			.exec( function(err, machines) {

        	res.json( {"machine": machines[0]} );
		});
    },

    launch: function( req, res ) {
    	var machineName = req.params.name;

    	console.log( "launching on " + machineName );

    	Build.find()
			.where({ name: req.params.build })
			.exec( function(err, builds) {

			var launchData = {
	    		command: builds[0].data,
	    		name: machineName + "." + req.params.build,
	    	}

	    	runningBuilds[machineName + "." + req.params.build] = true;


	    	BuildMachine.find()
				.where({ name: machineName })
				.exec( function(err, machines) {

				var newHistory = machines[0].history;

				var newHistoryItem = {
					start: new Date(),
					build: req.params.build
				}

				if( newHistory === undefined )
					newHistory = [];

				newHistory.unshift( newHistoryItem );

				BuildMachine.update({
			  		name: machineName
				}, {
					history: newHistory,
					status: "running"
				}, function( err, machines ) {
				
					AllModels.find( function(error, data) {
				    	sails.io.sockets.emit( "update", data );
					});

					machineSockets[machineName].emit( "launch", launchData, function(data) {
						res.json( 200, {name: machineName} );
					}); 
				});
			}); 

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
			});
		});

	}, keepaliveTime );

	sockets.on( "connection", function(socket) {

		socket.on( "finished", function(data) {
			console.log( "Build finished" );

			var machineName = data.name.split(".")[0]

			runningBuilds[data.name] = false;

			BuildMachine.find()
				.where({ name: machineName })
				.exec( function(err, machines) {

				var newHistory = machines[0].history;

				if( newHistory === undefined ) {
					console.log( "Something went wrong, this machine has no history" );
				} else {
					newHistory[0].end = new Date();

					BuildMachine.update({
				  		name: machineName,
					}, {
						history: newHistory,
						status: "stopped"
					}, function( err, machines ) {
					
						updateClientsOnChange();
					});
				}
				
			});
			
		});

		socket.on( "alive", function( data ) {

			machineSockets[data.name] = socket;

			BuildMachine.find()
				.where({ name: data.name })
				.exec( function(err, machines) {

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
						});

					} else {
						console.log( "Something went wrong, more than one user found" );
					}
					
				}
				
			});
		});
	});
}