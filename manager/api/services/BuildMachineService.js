var async = require("async");

var keepaliveTime = 2000;

// We're going to setup a repeating check to make sure
// machines that have signed up are still present.
setInterval( function() {

	BuildMachine.find()
				.done(function( error, machines ) {

		console.log( "Found machines" );
		console.log( error );
		console.log( machines );

		async.eachSeries( machines, function( machine, callback ) {
		  	
		  	if( machine.alive == undefined || new Date() - machine.alive > keepaliveTime ) {
				BuildMachine.destroy({
				 	name: machine.name,
				 	status: machine.status
				}).done(function(err) {

				 	if( err ) {
				 	  	console.log( err );
				 	  	callback( err );
				 	} else {
				 	  	console.log( "machine deleted" );
					  	callback();
					}
				  	
				});
		  	} else {
		  		callback();
		  	}

		}, function( err ) {
		  	if( err ) { 
		  		throw err; 
		  	}
		  	
		  	console.log( 'Finished removing expired machines' );
		});
	});

}, keepaliveTime );