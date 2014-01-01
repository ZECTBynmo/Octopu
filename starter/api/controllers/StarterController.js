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
	spawnCommand = require('spawn-command'),
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


function tryRequire( path ) {
	try { 
		var obj = require( path );
	} catch( err ) {
		var obj = {};
	}

	return obj;
}


function launchBuild( command, name ) {
	var config = tryRequire( __dirname + "/config.js" );

	// Change the working directory to the config directory if there is one
	if( config.dir != undefined && config.dir != "" )
		process.chdir( config.dir );

	// Create a child process
	console.log( "Starting build" );
	console.log( "node " + __dirname + "/test.js" );
	runningBuilds[name] = spawnCommand( "node " + __dirname + "/test.js" );

	// Catch exit events
	runningBuilds[name].on( "exit", function(code) {
		console.log( "Build finished" );
		if( managerSocket != undefined ) {
			managerSocket.emit( "finished", {name:name} );
		}
	});
}


var runningBuilds = {},
	managerSocket;

module.exports = {
    
 	index: function( req, res ) {
    	res.json( 200, {} );
    },

    launch: function( req, res ) {

    	var command = req.body.command,
    		name = req.body.name;

		launchBuild( command, name );

    	res.json( 200, {} );
    },

    setConfig: function( req, res ) {
    	var config = {
    		url: req.body.url,
    		dir: req.body.dir,
    	}

    	try {
    		fs.writeFileSync( __dirname + "/config.json", JSON.stringify(config) );
    	} catch( error ) {
    		console.log( error );
    	}

		connectToManager( config.url );

    	var responseObj = {
    		"error": undefined,
    		"url": req.body.url,
    		"dir": req.body.dir,
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

		var socket = io.connect( url, {reconnect: true} );

		managerSocket = socket;

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

		socket.on('launch', function(data) {
			launchBuild( data.command, data.name );
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


try { 
	var config = require( __dirname + "/config.json");
	connectToManager( config.url );
} catch( error ) {

}