/**
 * BuildController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  	index: function( req, res ) {

  		BuildMachine.find()
			.done(function( error, machines ) {

			Build.find()
				.done(function( error, builds ) {

				var responseData = {
					"machines": machines,
					"builds": builds
				}
			
				res.view( responseData );
			})        	
		});  

	},  

	create: function( req, res ) {

		AllModels.find( function(error, data) {

			res.view( "build/create", data );
		});
	},


	delete: function( req, res ) {
		console.log( "Deleting" );

		Build.destroy({
		  	name: req.params.name
		}).done(function(err) {

		  	if( err ) {
		  	 	return console.log( err );
		  	} else {
		  	  	console.log("Build deleted");

		  	  	AllModels.find( function(error, data) {
		  	  		console.log( "Updated with data and stuff" );
		  	  		console.log( data );
		  	  		
		  	  		sails.io.sockets.emit( "update". data );
		  	  		res.json( "index", data );
		  	  	});		  	  	
		  	}
		});
	},

	post: function( req, res ) {

		var newBuild = {
			name: req.body.name,
			type: req.body.type,
			data: req.body.data,
		}

		console.log( newBuild );

		Build.create(newBuild).done( function(err, machine) {
			if( err ) {
				console.log( "Error: " + JSON.stringify(err) );
			} else {
				console.log( "Created machine: " + machine );
			}

			AllModels.find( function(error, data) {
				sails.io.sockets.emit( "update". data );
				res.view( "build/create", data );
			});
		});
	},

	build: function( req, res ) {
		res.json( 200, {} );
	}
};
