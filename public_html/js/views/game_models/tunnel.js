define(function(require) {
	var THREE = require('three');

    var tunnel = new THREE.Mesh(
        new THREE.CylinderGeometry(100, 100, 5000, 24, 24, true),
        new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('../../../images/space.jpg', null, function(tex) {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping
                tex.repeat.set(5, 10)
                tex.needsUpdate = true
            }),
            side: THREE.BackSide
        })
    );
                
    tunnel.rotation.x = -Math.PI / 2;

    return tunnel;
});