define(function(require) {
	var THREE = require('three');

	var loadingManager = new THREE.LoadingManager();
    
    loadingManager.onProgress = function(item, loaded, total) {
        console.log(item + ' '+ loaded / total * 100 + '% loading');
    };
        
    loadingManager.onError = function(item) {
        console.log(item + ' loading error');
    };

    return loadingManager;
});