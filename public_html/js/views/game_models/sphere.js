define(function(require) {
	var THREE = require('three');

    var Sphere = function(radius) {
        this._mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('../../../images/space.jpg', null, function(tex) {
                    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
                    tex.repeat.set(5, 10)
                    tex.needsUpdate = true
                }),
                side: THREE.BackSide
            })
        );
        
        this.getMesh = function() {
            return this._mesh;
        }
    }
                
    return Sphere;
});