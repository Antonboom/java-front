define(function(require) {
    QUnit.module("models/");

    QUnit.test("PlayerModel - instance of Backbone.Model", function () {
        var PlayerModel = require('./player'),
            player = new PlayerModel();

        QUnit.ok(player instanceof Backbone.Model);
    });
});
