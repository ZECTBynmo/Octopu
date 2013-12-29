var AppRouter = Backbone.Router.extend({

    routes: { // leto-marker-main-route-list
        'machines': 'machines',
        'machines/:name': 'machine',
        "": "home",
        "about": "about"
    },

    initialize: function () {
        this.headerView = new HeaderView();
        $('.header').html(this.headerView.el);
    },

    // leto-marker-router-functions
    machine: function (id) {
        var machine = new Machine({});
        machine.fetch({success: function(){
            $("#content").html(new MachineView({model: machine}).el);
        },
        error: function(m,r) {
          console.log("error");
          console.log(r.responseText);
        }});
        this.headerView.selectMenuItem();
    },

	machines: function (id) {
        var machineList = new MachineCollection();
        machineList.fetch({success: function(){
            $("#content").html(new MachineListView({model: machineList}).el);
        }});
		this.headerView.selectMenuItem('home-menu');
	},

    home: function (id) {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },

    about: function () {
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#content').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
    }

});

var templateFiles = [
    'MachineView',
    'MachineListItemView',
    'HomeView',
    'HeaderView',
    'AboutView',
];

utils.loadTemplate( templateFiles, function() {
    app = new AppRouter();
    Backbone.history.start();
});
