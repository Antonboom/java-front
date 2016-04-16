define(function(require) {
    
    /****** WORLD ****/
    var World = require('three_world'),
        clock = new THREE.Clock(),
        keyboard = new THREEx.KeyboardState(),
        camera = null,
        Sphere = require('./game_models/sphere'),
        Spacecraft = require('./game_models/spacecraft'),
        Shot = require('./game_models/shot'),
        shots = [];      

    var KEY_ONE = 49;

    function initWorld() {
        World.init({ 
            renderCallback: renderWorld,
            clearColor: 0x000022
        });

        World.getScene().fog = new THREE.FogExp2(0x0000022, 0.00125);       
        
        worldSphere = new Sphere(1000);     // sphere radius
        World.add(worldSphere.getMesh());   
        
        camera = World.getCamera();
        player = new Spacecraft(World, camera);;     
    }

    function startGame() {
        initWorld();   
        World.start();
    }

    function renderWorld() {
        if (!player.isLoaded()) {
            return;
        }

        keyboardListener();   

        for (var i = 0; i < shots.length; i++) {
            if (!shots[i].update(camera.position.z)) {
                World.getScene().remove(shots[i].getMesh());
                shots.splice(i, 1);
            }
        }    
    }

    function keyboardListener() {
        var delta = clock.getDelta(),
            moveDistance = 5,
            rotateAngle = Math.PI / 3 * 0.01;   

        var spacecraft = player.getMesh();

        if (keyboard.pressed("W")) {
            spacecraft.translateZ( moveDistance );
        }

        if (keyboard.pressed("S")){
            spacecraft.translateZ(  -moveDistance );
        }

        if (keyboard.pressed("q")) {
            spacecraft.translateX( moveDistance );
        }

        if (keyboard.pressed("E")) {
            spacecraft.translateX( - moveDistance );
        }

        var rotation_matrix = new THREE.Matrix4().identity();

        if (keyboard.pressed("A")) {
            spacecraft.rotateOnAxis( new THREE.Vector3(0, 1, 0), rotateAngle);
        }

        if (keyboard.pressed("D")) {
            spacecraft.rotateOnAxis( new THREE.Vector3(0, 1, 0), -rotateAngle);
        }

        if (keyboard.pressed("R")) {
           spacecraft.rotateOnAxis( new THREE.Vector3(1, 0, 0), -rotateAngle);
        }

        if (keyboard.pressed("F")) {
            spacecraft.rotateOnAxis( new THREE.Vector3(1, 0, 0), +rotateAngle);
        }
     
        if (keyboard.pressed("Z")) {
            spacecraft.position.set(0, -25, 0);
            spacecraft.rotateX(Math.PI);
        }
     
        var relativeCameraOffset = new THREE.Vector3(0, 2, -10);
     
        var cameraOffset = relativeCameraOffset.applyMatrix4( spacecraft.matrixWorld );
     
        camera.position.x = cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraOffset.z;
        camera.lookAt(spacecraft.position);
    }

    window.addEventListener('keyup', function(e) {
        switch(e.keyCode) {
            case KEY_ONE: {  // Клавиша "1"
                var spacecraft = player.getMesh();
                var shot = new Shot(spacecraft.position);

                shots.push(shot);
                World.add(shot.getMesh());
            } break;
        }
    });
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
            // $('canvas').remove();
            this.$el.hide();
        }       
    });

    return GameView;
});
