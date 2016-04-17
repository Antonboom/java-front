define([
    'backbone',
    './user'
], function (
    Backbone,
    UserModel
) {

    var SessionModel = Backbone.Model.extend({   	
        initialize: function() {
        	this._user = new UserModel();

            var session = this;
            this.checkAuth()
                .then(function(id) {
                    return session.getUserData(id);
                })
                .then(function(data) {
                    session.setUser(data);
                })
                .catch(function() {
                    session.clearUser();
                });
        },

        checkAuth: function() {
            return new Promise(function(resolve, reject) {
                $.ajax({ 
                    url: "/api/session",
                    
                    type: "GET",
                    
                    success: function(userData) {                      
                        console.log("...SESSION ALIVE!");
                        console.log(userData);

                        resolve(userData.id);
                    },

                    error: function(xhr, error_msg, error) {
                        var error = new Error(error_msg);
                        error.code = xhr.status;

                        console.log("...DEAD SESSION!\n" + error.code + " " + error.message);

                        reject(error); 
                    }
                }); // ajax
            }); // Promise    
        },  // checkAuth

        isSigned: function() {
            return this._user.get('id') ? true : false;
        },

        clearUser: function() {
            this._user.clear().set(this._user.defaults);
            localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this._user));
        },

        setUser: function(userData) {
            this._user.set(userData);
            localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this._user));
        },

        setPlayer: function(playerData) {
            this._user.set({'player': playerData});
        },

        getUser: function() {
        	return this._user;
        },

        signin: function(userLogin, userPassword, remember) {
            return new Promise(function(resolve, reject) {       	
            	$.ajax({ 
                    url: "/api/session",
                    
                    type: "POST",
                    
                    dataType: "json",
                    
                    contentType: "application/json",

                    data: JSON.stringify({ 
                        login: userLogin,
            			password: userPassword,
                        remember: remember
                    }),
                    
                    success: function(userData) {                      
                        console.log("...SIGNIN SUCCESS!");
                        console.log(userData);

                        resolve(userData.id);
                    },

                    error: function(xhr, error_msg, error) {
                        var error = new Error(error_msg);
                        error.code = xhr.status;

                        console.log("...SIGNIN ERROR!\n" + error.code + " " + error.message);

                        reject(error); 
                    }
                }); // ajax
            }); // Promise
        },  // login
        
        signout: function() {
            var session = this;

            return new Promise(function(resolve, reject) {          
                $.ajax({ 
                    url: "/api/session",
                    
                    type: "DELETE",

                    mimeType: "text/html",  // "No element found" fix
                    
                    success: function() {                      
                        console.log("...SIGNOUT SUCCESS!");
                        session.clearUser();
                        resolve(session.trigger('logout'));
                    },

                    error: function(xhr, error_msg, error) {
                        var error = new Error(error_msg);
                        error.code = xhr.status;

                        console.log("...SIGNOUT ERROR!\n" + error.code + " " + error.message);

                        reject(error); 
                    }
                }); // ajax
            }); // Promise    
        },  // logout

        getUserData: function(id) {
            return new Promise(function(resolve, reject) {
                $.ajax({ 
                    url: "/api/user/" + id,
                    
                    type: "GET",
                    
                    contentType: "application/json",

                    success: function(userData) {                      
                        console.log("...USER DATA SUCCESS!");
                        console.log(userData);

                        resolve(userData);
                    },

                    error: function(xhr, error_msg, error) {
                        var error = new Error(error_msg);
                        error.code = xhr.status;

                        console.log("...USER DATA ERROR!\n" + error.code + " " + error.message);

                        reject(error);                        
                    }
                }); // ajax
            }); // Promise
        }   // getUserData
    }); // SessionModel

    return SessionModel;
});
