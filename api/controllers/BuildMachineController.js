/**
 * BuildMachineController
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

var machines = [
	{
		name: "studio-x107-b01",
		status: "running",
	},
	{
		name: "studio-x107-b02",
		status: "running",
	},
	{
		name: "studio-w7-b01",
		status: "stopped",
	},
	{
		name: "studio-w7-b02",
		status: "running",
	},
	{
		name: "creative-w7-b01",
		status: "running",
	},
];

module.exports = {
    /**
     * Taskboard main action.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    index: function( req, res ) {

        // Make view
        res.view( {"machines": machines} );
    },

    machine: function( req, res ) {
    	res.view( {"poop":"poop"} );
    }
};