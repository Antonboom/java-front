define([
    'backbone',
    './user'
], function (
    Backbone,
    UserModel
) {

    var SessionModel = Backbone.Model.extend({   	
        USER_STORAGE_KEY: 'user',

        initialize: function() {
        	this._user = new UserModel();

            if (!localStorage.getItem(this.USER_STORAGE_KEY)) {
                localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this._user));
            } else {
                var localUser = JSON.parse(localStorage.getItem(this.USER_STORAGE_KEY));
                this._user.set(localUser);
            }
        },

        isSigned: function() {
            return this._user.get('id') ? true : false;
        },

        clearUser: function() {
            this._user.clear().set(this._user.defaults);
            localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this._user));
        },

        setUser: function(playerData) {
            this._user.set(playerData);
            localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this._user));
        },

        getUser: function() {
        	return this._user;
        },

        login: function(userLogin, userPassword) {
            return new Promise(function(resolve, reject) {       	
            	$.ajax({ 
                    url: "/api/session",
                    
                    type: "POST",
                    
                    dataType: "json",
                    
                    contentType: "application/json",

                    data: JSON.stringify({ 
                        login: userLogin,
            			password: userPassword
                    }),
                    
                    success: function(userData) {                      
                        console.log("...LOGIN SUCCESS!");
                        console.log(userData);

                        resolve(userData.id);
                    },

                    error: function(xhr, error_msg, error) {
                        var error = new Error(error_msg);
                        error.code = xhr.status;

                        console.log("...LOGIN ERROR!\n" + error.code + " " + error.message);

                        reject(error); 
                    }
                }); // ajax
            }); // Promise
        },  // login
        
        logout: function() {
            var session = this;

            return new Promise(function(resolve, reject) {          
                $.ajax({ 
                    url: "/api/session",
                    
                    type: "DELETE",

                    mimeType: "text/html",  // "No element found" fix
                    
                    success: function() {                      
                        console.log("...LOGOUT SUCCESS!");
                        session.clearUser();
                        resolve(session.trigger('logout'));
                    },

                    error: function(xhr, error_msg, error) {
                        var error = new Error(error_msg);
                        error.code = xhr.status;

                        console.log("...LOGOUT ERROR!\n" + error.code + " " + error.message);

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
