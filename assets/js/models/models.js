window.Machine = Backbone.Model.extend({
	urlRoot: "/templates",

	url: function() {
		return document.location.hash.slice(1);
	},

	defaults: {
		status: {
			running: {
				"TestScriptName": "running",
				"OtherTestScript": "failed",
			},
		},

		scripts: []
	}
});

window.MachineCollection = Backbone.Collection.extend({
	model: Machine,
	url: function() {
		return "/machines";
	}
});