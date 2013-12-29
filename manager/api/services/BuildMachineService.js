var keepaliveTime = 20000;

// We're going to setup a repeating check to make sure
// machines that have signed up are still present.
setInterval( function() {

	BuildMachine.find()
				.done(function( error, data ) {

		console.log( "Found machine" );
		console.log( error );
		console.log( data );
	});

}, keepaliveTime );

