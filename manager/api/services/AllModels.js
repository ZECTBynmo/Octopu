exports.find = function( callback ) {
	BuildMachine.find()
		.done(function( error, machines ) {

		if( error )
			callback( error );

		Build.find()
			.done(function( error, builds ) {

			all = {
				machines: machines,
				builds: builds,
			}

			callback( error, all );
		});  
	});  
}