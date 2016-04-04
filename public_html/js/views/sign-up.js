window.FileAPI = {
    debug: false,  
    media: true,
    staticPath: '../lib/file_api/'
};   

define(function(require) {   
    var FileAPI = require('fileAPI');

    var Backbone = require('backbone');
        PlayerModel = require('models/player'),
        players = require('collections/players'),
        tmpl  = require('tmpl/sign-up');

    var RegistrationView = Backbone.View.extend({
        newPlayer: new PlayerModel(),   // TODO: _newPlayer

        collection: players,

        template: tmpl,

        id: 'sign-up',

        events: {
            'submit .js-sign-up-form': 'addPlayer',
            'click .js-webcamera-btn': 'cameraPublish',
            'change .js-choose': 'fileUpload'
        },

        initialize: function () {
            this._avatar = null;

            this.listenTo(this.newPlayer, 'invalid', this.errorRegMsg);
            this.listenTo(this.collection, 'add', this.successRegMsg);
        },

        render: function() {
            this.$el.html(this.template());            
            return this;
        },

        show: function () {
            this.trigger('show');            
            this.$el.show();
        },

        hide: function () {
            this.$('.js-alert').hide();
            this.$el.hide();
        },

        showMessage: function(type /* error or success */, text, link, textLink) {
            this.$('.js-alert').hide();

            var $alert = this.$('.js-alert-' + type),
                $alertText = this.$('.js-alert-' + type + '-text'),
                $alertLink = this.$('.js-alert-' + type + '-link');

            $alertText.text(text);            
            if (typeof textLink !== undefined) {
                $alertLink.attr("href", link)
                $alertLink.text(textLink);
            }

            $alert.fadeIn();            
       
            // setTimeout(function() {
            //     $alert.fadeOut();
            // }, 5000);
        },

        errorRegMsg: function(model, error) {
            this.showMessage('error', error);
        },

        successRegMsg: function(player) {
            var text = 'Вы успешно зарегистрированы как',
                link = '/#signin',
                linkText = player.get('nickname');

            this.showMessage('success', text, link, linkText);
        },

        cameraPublish: function() {
            var $preview = this.$('.js-preview'),
                $webcameraBtn = this.$('.js-webcamera-btn'),
                $shotBtn = this.$('.js-shot-btn'),
                $fileUploadInput = this.$('.js-choose'),
                $defaultImg = this.$('.js-default-img');

            $defaultImg.hide();
            $webcameraBtn.hide();
            $shotBtn.show();

            this._avatar = null;

            var regView = this;

            FileAPI.Camera.publish($preview, { width: 170, height: 170 }, function (err, cam) {
                if (err) {
                    alert('WebCam or Flash not supported!');
                    
                    $preview.children('video').remove();
                    $preview.css('width','0').css('height','0');                      
                    $defaultImg.show();

                    $shotBtn.hide();
                    $webcameraBtn.show();

                    return;
                } 

                $shotBtn.on('click', function() {
                    if(cam.isActive()) {
                        var shot = cam.shot();

                        regView._avatar = shot.file;    // canvas

                        shot.preview(170).get(function (err, img){                            
                            $preview.children('video').remove();
                            $preview.children('canvas').remove();
                            $preview.append(img);
                        });
                        
                    } else {
                        alert('Web camera is turned off!');
                        
                        $preview.children('video').remove();
                        $preview.children('canvas').remove();                        
                        $defaultImg.show();
                    }

                    $shotBtn.hide();
                    $webcameraBtn.show();
                });

                $fileUploadInput.on('change', function() {
                    $shotBtn.hide();
                    $webcameraBtn.show();
                });                
            }); // FileAPI.Camera.publish()
        },

        fileUpload: function(event) {
            this._avatar = null;

            var regView = this,
                $preview = this.$('.js-preview'),                    
                $defaultImg = this.$('.js-default-img');
                
            var files = FileAPI.getFiles(event);

            FileAPI.filterFiles(files, function(file, info) {
                if (!(/^image\//i.test(file.type))) {
                    alert('Invalid file type!');
                    return false;
                }

                if (!((info.width > 160) && (info.height > 160))) {
                    alert('The size is too small!');
                    return false;
                }

                if (file.size && (file.size > 2 * FileAPI.MB)) {
                    alert('The weight is too large!');
                    return false;
                }

                return true;

            }, function(files, rejected) {
                if (files.length) {
                    var file = files[0];

                    regView._avatar = file; 
                    
                    FileAPI.Image(file).preview(170).get(function(err, img) {           
                        $defaultImg.hide();
                        $preview.children('video').remove();
                        $preview.children('canvas').remove();
                        $preview.append(img); 
                    });
                }
            });
            
        },   // fileUploadInit
        
        addPlayer: function(event) {                   
            event.preventDefault();

            var $preview = this.$('.js-preview'),
                $webcameraBtn = this.$('.js-webcamera-btn'),
                $shotBtn = this.$('.js-shot-btn'),
                $defaultImg = this.$('.js-default-img');

            var newPlayer = {
                email: this.$('input[name="email"]').val(),
                password: this.$('input[name="password"]').val(),
                nickname: this.$('input[name="nickname"]').val()
            }   

            this.newPlayer.set(newPlayer);

            if (this.newPlayer.isValid()) {
                var regView = this,
                    file = this._avatar;
                
                if (this._avatar !== null) {
                    FileAPI.readAsDataURL(file, function(event) {
                        if (event.type == 'load') {
                            newPlayer.avatar = event.result;
                            regView.sendNewPlayer(newPlayer);
                        } else if (event.type =='progress') {
                            console.log(event.loaded / event.total * 100 + '% parsing to base64');
                        } else {
                            console.log('Error parse to base64');
                        }
                    })               
                } else {
                    newPlayer.avatar = null;
                    regView.sendNewPlayer(newPlayer);
                } 

                this.$('.app-form')[0].reset();

                $preview.children('video').remove();
                $preview.children('canvas').remove();   
                $preview.removeAttr('style');
                $shotBtn.hide();
                $webcameraBtn.show();

                $defaultImg.show();
            }   // isValid()
        },

        sendNewPlayer: function(newPlayer){
            var regView = this;

            $.ajax({ 
                url: "/api/user",
                
                type: "PUT",
                
                dataType: "json",
                
                contentType: "application/json",

                data: JSON.stringify({ 
                    login: newPlayer.nickname,
                    password: newPlayer.password,
                    email: newPlayer.email,
                    avatar: newPlayer.avatar
                }),
                
                success: function(json) {                      
                    console.log("...SUCCESS!");
                    console.log(json); 
                },

                error: function(xhr, error_msg, error) {
                    console.log("...ERROR!\n" + xhr.status + " " + error_msg); 
                    regView.showMessage('error', 'Пользователь с таким email уже существует!');
                }
            });
        }

    }); // RegistrationView

    return RegistrationView;
});
