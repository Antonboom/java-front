QUnit.config.autostart = false;

require.config({
    urlArgs: "_=" + (new Date()).getTime(),
    baseUrl: "../js",
    paths: {
        jquery: "lib/jquery",
        underscore: "lib/underscore",
        backbone: "lib/backbone"
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    }
});

var tests = [
    'models/player.test',
    'views/main.test',
    'models/session.test'
];

require(tests, function () {
    QUnit.load();
    QUnit.start();
});
