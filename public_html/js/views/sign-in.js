define([
    'backbone',
    'tmpl/sign-in'
], function(
    Backbone,
    tmpl
) {
    var LoginView = Backbone.View.extend({

        template: tmpl,

        id: 'sign-in',

        events: {
            'submit .js-sign-in-form': 'signin',
        },

        initialize: function () {
            // TODO: listenTo
        },
        
        render: function() {
            this.$el.html(this.template());
            return this;
        },

        show: function () {
            this.trigger('show');
            this.$('.js-alert-error').hide();
            this.$el.show();
        },

        hide: function () {
            this.$el.hide();
        },

        showError: function() {
            this.$('.js-alert-error').fadeIn();
        },

        signin: function(event) {
            event.preventDefault();

            var session = window.activeSession;
                $login = this.$('input[name="login"]').val(),
                $password = this.$('input[name="password"]').val(),
                $remember = this.$('input[name="remember"]:checkbox:checked').val() ? true : false,
                view = this;

            this.$('.js-sign-in-form')[0].reset();
            
            session.signin($login, $password, $remember)
                .then(function(id) {
                    return session.getUserData(id);
                })
                .then(function(data) {
                    session.setUser(data);
                    session.trigger('login');
                })
                .catch(function(error) { 
                    console.log(error);
                    view.showError();
                });
        }
    });

    return LoginView;
});