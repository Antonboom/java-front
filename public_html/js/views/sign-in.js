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
            'submit .js-sign-in-form': 'loginPLayer',
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

        loginPLayer: function(event) {
            event.preventDefault();

            var session = window.activeSession;
                $login = this.$('input[name="login"]').val(),
                $password = this.$('input[name="password"]').val();

            session.login($login, $password)
                .then(id => {
                    return session.getUserData(id);
                })
                .then(data => {
                    session.setUser(data);
                    session.trigger('login');
                    this.$('.js-sign-in-form')[0].reset();
                })
                .catch(error => { 
                    console.log(error);
                });
        }
    });

    return LoginView;
});