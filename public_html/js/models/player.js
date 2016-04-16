define([
	'backbone'
], function(
	Backbone
) {    
    var PlayerModel = Backbone.Model.extend({
    	defaults: {
    		id: 0,
    		score: 0,
    		healph: 0
    	}
    });
    
    return PlayerModel;
});