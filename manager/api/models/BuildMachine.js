/**
 * BuildMachine
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	schema: true,

	attributes: {
		"name": {
            type:       'string',
            required:   true,
        },

        "status": {
            type:       'string',
            required:   true,
        },

        "alive": {
            type:       'date',
            required:   false,
        },

        "expired": {
            type:       'boolean',
            defaultsTo: false,
            required:   true,
        },
	}

};
