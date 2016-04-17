define([
    'backbone',
    'tmpl/main'
], function(
    Backbone,
    tmpl
) {
    var MainView = Backbone.View.extend({
        template: tmpl,

        id: 'main',

        events: {
            'click .js-sign-out-btn': 'signout'
        },

        initialize: function () {
            // TODO: this.listenTo(...)
        },

        render: function() {
            this.$el.html(this.template());
            return this;
        },

        show: function () {
            this.trigger('show');
            this.$el.show();
        },

        hide: function () {
            this.$el.hide();
        },

        signout: function() {
            var session = window.activeSession;

            session.signout()
                .then(function() {
                    $(location).attr('href', '/')
                })
                .catch(function(error) {
                    console.log(error);
                })
        }
    });

    return MainView;
});