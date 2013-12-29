window.MachineView = Backbone.View.extend({

    initialize: function (options) {
        var _this = this;

        // Start up our socket communications
        this.comm = new window.Comm( function(status) {
            console.log( status );
            _this.model.status = status;
            _this.render();
        });

        options.model.bind('error', this.onError, this);

        this.render();
    },

    onError: function(model, error) {
        alert( model );
        alert( error );
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));

        return this;
    },

});