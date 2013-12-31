/**
 * StarterController
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

var fs = require("fs"),
	request = require("request"),
	io = require("socket.io-client"),
	xhrOriginal = require("xmlhttprequest"),
	xhr = require("socket.io-client/node_modules/xmlhttprequest");

var myUrl = 'http://localhost:1337',
	cookieJar = request.jar(),
	isRunning = false;

xhr.XMLHttpRequest = function() {
	this.XMLHttpRequest = xhrOriginal.XMLHttpRequest;
	xhrOriginal.XMLHttpRequest.apply(this, arguments);
	this.setDisableHeaderCheck(true); // Allow header modifications.
	
	// Rewrite the 'open' function.
	var openOriginal = this.open;
	this.open = function(method, url, async, user, password) {
		openOriginal.apply(this, arguments);
		var header = cookieJar.get({url: myUrl}).map(function(cookie) {
			return cookie.name + '=' + cookie.value;
		}).join('; ');
		this.setRequestHeader('cookie', header);
	};
};


try { 
	var config = require( __dirname + "/config.json");
	connectToManager( config.url );
} catch( error ) {

}


module.exports = {
    
 	index: function( req, res ) {
    	res.json( 200, {} );
    },

    setConfig: function( req, res ) {
    	var config = {
    		url: req.body.url
    	}

    	try {
    		fs.writeFileSync( __dirname + "/config.json", JSON.stringify(config) );
    	} catch( error ) {
    		console.log( error );
    	}

		connectToManager( config.url );

    	var responseObj = {
    		"error": undefined,
    		"url": req.body.url
    	};

    	res.view( responseObj );
    }
  
};


function connectToManager( url ) {

	if( isRunning || url === undefined )
		return;

	isRunning = true;

	console.log( "Connecting to manager at: " + url );

	// Send the cookie first before attempting to connect via socket-io,
	// thus, avoiding the handshake error.
	request.post({jar: cookieJar, url: url}, function(err, resp, body) {

		var socket = io.connect( myUrl, {reconnect: true} );
		socket.on('connecting', function() {
			console.log('(II) Connecting to server');
		});

		socket.on('connect', function() {
			console.log('(II) Successfully connected to server');

			setInterval( function() {
				socket.emit( "alive", {name: require("os").hostname()} );
			}, 1000 );
		});

		socket.on('error', function(reason) {
			console.log('(EE) Error connecting to server: ' + reason);
			isRunning = false;
		});

		socket.on('disconnect', function(reason) {
			console.log('(II) Disconnected from server\n');
			isRunning = false;
		});

	});
}


setInterval( function() {
	try { 
		var config = require("./config.json");
		connectToManager( config.url );
	} catch( error ) {
		console.log( error );
	}
}, 1000 );