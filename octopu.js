#!/usr/bin/env node
var argv = require("optimist").argv;

var action = "",
	actionArgs = [],
	argContents = {};

// Parse our arguments
for( var iArg in argv ) {

	switch( iArg ) {
	case "_":
		// Parse our action items
		for( var iActionArg in argv[iArg] ) {
			if( iActionArg == 0 )
				action = argv[iArg][iActionArg];
			else
				actionArgs.push( argv[iArg][iActionArg] );
		}

		break;

	case "$0":
		// This just holds the path to the node exe, do nothing
		break;

	default:
		// Grab contents that the user is trying to specify
		argContents[iArg] = argv[iArg];
	}
} // end for each argument

switch( action ) {
case "launch":
	launchApp( actionArgs, argContents );
  	break;

default:
  	console.log( "Action " + action + " is not recognized. Try 'launch'" );
}


function launchApp( args, contents ) {
	var strFakePath = "";

	if( args[0] == "starter" ) {
		process.chdir( __dirname + "/starter" );
		strFakePath = __dirname + "/starter.app.js";
	} else if( args[0] == "manager" ) {
		process.chdir( __dirname + "/manager" );
		strFakePath = __dirname + "/manager.app.js";
	}

	var fakeArgs = {
		"_": [],
		'$0': strFakePath
	}

	require('sails').lift( fakeArgs, function(error, sails) {

	});
}