define(function(require) {
	var THREE = require('three'),
        loadingManager = require('./loadmanager');

    var spacecraft = null;

	var Spacecraft = function(World, camera) {
        var loader = new THREE.JSONLoader(loadingManager),
            _this = this;

        this._loaded = false;

        loader.load(
           '/3D_models/spacecraft.json',
            function(geometry, materials) {
                var mesh = new THREE.Mesh(
                    geometry, 
                    new THREE.MeshFaceMaterial(materials)
                );

                mesh.position.set(0, -25, 0);
                mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
                mesh.rotateY(Math.PI); 
                mesh.tranlation = geometry.center();
                mesh.receiveShadow = true;
                
                camera.lookAt(mesh);
                World.add(mesh);

                _this._loaded = true;
                spacecraft = mesh;
                _this._mesh = spacecraft;
            }
        );

        this.isLoaded = function() {
            return this._loaded;
        }

        this.getMesh = function() {
            return this._mesh;
        }
    }

    return Spacecraft;
});