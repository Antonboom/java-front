require.config({
    urlArgs: "_=" + (new Date()).getTime(),
    baseUrl: "js",
    paths: {
        jquery: "lib/jquery",
        underscore: "lib/underscore",
        backbone: "lib/backbone",
        bootstrap: "lib/bootstrap",        
        fileAPI: "lib/file_api/FileAPI",
        // 3D - world
        three: "lib/3D/three.min",  // TODO: delete three.js
        threex: "lib/3D/threex.keyboardstate",
        three_world: "lib/3D/world", 
        ddsloader: "lib/3D/ddsloader",
        mtlloader: "lib/3D/mtlloader",
        objloader: "lib/3D/objloader",
        objmtlloader: "lib/3D/objmtlloader"
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'fileAPI': {
            exports: 'FileAPI'
        },
        // 3D - world
        'three': {
            exports: 'THREE'
        },
        'ddsloader': {
            deps: ['three'],
            exports: 'DDSLoader',
        },
        'mtlloader': {
            deps: ['three'],
            exports: 'MTLLoader'
        },
        'objloader': {
            deps: ['three'],
            exports: 'OBJLoader',
        },
        'objmtlloader': {
            deps: ['three', 'ddsloader', 'mtlloader', 'objloader'],
            exports: 'OBJMTLLoader'
        },
        'three_world': {
            deps: ['three', 'threex', 'objmtlloader'],
            exports: 'World'
        },
    }
});

require([
    'backbone',
	'router',
    'bootstrap'
], function(
	Backbone,
	router
) {

    Backbone.history.start();

});
