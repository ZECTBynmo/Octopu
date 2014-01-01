/**
 * HistoryItem
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  	schema: true,

	attributes: {
		"machine": {
            type:       'string',
            required:   true,
        },

        "build": {
            type:       'string',
            required:   true,
        },

        "start": {
            type:       'date',
            required:   true,
        },

        "end": {
            type:       'date',
            required:   true,
        },
	}


};
