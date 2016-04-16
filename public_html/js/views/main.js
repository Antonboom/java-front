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
            'click .js-sign-out-btn': 'logoutPlayer'
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

        logoutPlayer: function() {
            var session = window.activeSession;

            session.logout()
                .then(() => $(location).attr('href', '/'));
        }
    });

    return MainView;
});