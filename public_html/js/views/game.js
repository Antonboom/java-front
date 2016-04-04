define(function(require) {
    
    /****** WORLD ****/
    var World = require('three_world'),
        camera = null,
        tunnel = require('./game_models/tunnel'),
        Spacecraft = require('./game_models/spacecraft');      

    function initWorld() {
        World.init({ 
            renderCallback: renderWorld,
            clearColor: 0x000022
        });

        World.getScene().fog = new THREE.FogExp2(0x0000022, 0.00125);       
        World.add(tunnel);   
        camera = World.getCamera();
        player = new Spacecraft(World, camera);;     
    }

    function startGame() {
        initWorld();   
        World.start();
    }

    function renderWorld() {
       
    }
    /****** WORLD ****/


    var Backbone = require('backbone'),
        tmpl  = require('tmpl/game');

    var GameView = Backbone.View.extend({
        template: tmpl,

        id: 'game',

        initialize: function () {          
            // TODO: listenTo()
            startGame();
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
        }       
    });

    return GameView;
});
