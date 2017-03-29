(function(module) {
    "use strict";

    var User = module.parent.require('./user'),
        db = module.parent.require('../src/database'),
        meta = module.parent.require('./meta'),
        async = module.parent.require('async'),
        nconf = module.parent.require('nconf'),
        passport = module.parent.require('passport'),
        QQStrategy = require('passport-qq2015-fix').Strategy,
        fs = module.parent.require('fs'),
		path = module.parent.require('path');
/* QQ new
var User = module.parent.require('./user'),
		db = module.parent.require('./database'),
		meta = module.parent.require('./meta'),
		passport = module.parent.require('passport'),
		nconf = module.parent.require('nconf'),
		QQStrategy = require('passport-qq').Strategy;
*/
/*
gihtub
var User = module.parent.require('./user'),
		db = module.parent.require('./database'),
		meta = module.parent.require('./meta'),
		nconf = module.parent.require('nconf'),
		async = module.parent.require('async'),
		passport = module.parent.require('passport'),
		GithubStrategy = require('passport-github2').Strategy;

*/
    var constants = Object.freeze({
        'name': "QQ 社会化登陆",
        'admin': {
            'icon': 'fa-qq',
            'route': '/plugins/sso-qq'
        }
    });

    var QQ = {};
      
    



    QQ.getStrategy = function(strategies, callback) {
        meta.settings.get('sso-qq', function(err, settings) {
            if (!err && settings['id'] && settings['secret']) {
                console.log(settings);
                passport.use('qq-token', new QQStrategy({
                    clientID: settings['id'],
                    clientSecret: settings['secret'],
                    callbackURL: nconf.get('url') + '/auth/qq/callback'
                }, function(accessToken, refreshToken, profile, done) {
                    console.log("[SSO-QQ]accessToken:"+accessToken);
                    console.log("[SSO-QQ]refreshToken:"+refreshToken);
                    console.log("[SSO-QQ]profile:")
                    console.log(profile);
                    profile = JSON.parse(profile);
                    //console.log("[SSO-QQ]profile.id:"+profile.id);
                    
                    //console.log("[SSO-QQ]profile.nickname:"+profile.nickname);
                    
                    if (!profile) {
                            return done(null, false);
                        }else{
                        
                        if (profile.ret == -1){ // Try Catch Error
                            console.log("[SSO-QQ]The Profile return -1,skipped.");
                            return done(null,false);
                        }
                        
                        var avatar;
                        
                        (profile.figureurl_qq_2 == null) ? avatar == profile.figureurl_qq_1 : avatar == profile.figureurl_qq_2; // Set avatar image
                        
                        
                        //var users = QQ.getUser(); //Try get user
                        
                        
                        console.log("[SSO-QQ]Username:"+profile.nickname);
                        console.log("[SSO-QQ]qqID:"+profile.id);
                        console.log("[SSO-QQ]avatar_url:"+avatar);
                    QQ.login(profile.id, profile.nickname,avatar, function(err, user) { //3.29 add avatar
                        if (err) {
                            done(err);
                        }
                        authenticationController.onSuccessfulLogin(req, user.uid);
						done(null, user);
                    });
                        
                        
                        }
                }));

                strategies.push({
                    name: 'qq-token',
                    url: '/auth/qq',
                    callbackURL: '/auth/qq/callback',
                    icon: 'fa-qq',
                    scope: 'get_user_info'
                    
                });
            }

            callback(null, strategies);
        });
    };
    
    
    QQ.getAssociation = function(data, callback) {
		User.getUserField(data.uid, 'qqid', function(err, qqid) {
			if (err) {
				return callback(err, data);
			}

			if (qqid) {
				data.associations.push({
					associated: true,
					name: constants.name,
					icon: constants.admin.icon
				});
			} else {
				data.associations.push({
					associated: false,
					url: nconf.get('url') + '/auth/qq',
					name: constants.name,
					icon: constants.admin.icon
				});
			}

			callback(null, data);
		})
	};
    QQ.login = function(qqID, handle ,callback) {
        QQ.getUidByQQID(qqID, function(err, uid) {
            if (err) {
                return callback(err);
            }
            
            console.log("[SSO-QQ]uid is:"+uid);
            if (uid !== null) {
                // Existing User
                console.log("[SSO-QQ]User is Exist.Try to Bind.");
                callback(null, {
                    uid: uid
                });
            } else {
                console.log("[SSO-QQ]User isn't Exist.Try to Creat a new account.");
                console.log("[SSO-QQ]account username is ：" + username);
                // New User
                /*
                var success = function(uid) {
                    User.setUserField(uid, 'qqid', qqID);
                    db.setObjectField('qqid:uid', qqID, uid);
                    callback(null, {
                        uid: uid
                    });
                };
                User.getUidByEmail(email, function(err, uid) {
					if (!uid) {
					    
						User.create(username, undefined, email, function(err, uid) {
							if (err !== null) {
								callback(err);
							} else success(uid);
						});
					} else success(uid); // Existing account -- merge
				});
				*/
				
				// New User 
				//From SSO-Twitter
				user.create({username: handle}, function (err, uid) {
					if (err) {
						return callback(err);
					}

					// Save qq-specific information to the user
					user.setUserField(uid, 'qqid', twid);
					db.setObjectField('qqid:uid', twid, uid);
					
					// Save their photo, if present
					if (avatar && avatar.length > 0) {
						var photoUrl = avatar[0].value;
						photoUrl = path.dirname(photoUrl) + '/' + path.basename(photoUrl, path.extname(photoUrl)).slice(0, -6) + 'bigger' + path.extname(photoUrl);
						user.setUserField(uid, 'uploadedpicture', photoUrl);
						user.setUserField(uid, 'picture', photoUrl);
					}

					callback(null, {
						uid: uid
					});
				});
				
			}
                
        });
    };

    QQ.getUidByQQID = function(qqID, callback) {
		db.getObjectField('qqid:uid', qqID, function(err, uid) {
			if (err) {
				callback(err);
			} else {
				callback(null, uid);
			}
		});
	};

    QQ.addMenuItem = function(custom_header, callback) {
        custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		callback(null, custom_header);
    };

   QQ.init = function(data, callback) {
        function renderAdmin(req, res) {
            res.render('admin/plugins/sso-qq', {
                callbackURL: nconf.get('url') + '/auth/qq/callback'
            });
        }

        data.router.get('/admin/plugins/sso-qq', data.middleware.admin.buildHeader, renderAdmin);
        data.router.get('/api/admin/plugins/sso-qq', renderAdmin);

        callback();
        
        /*
        function renderAdmin(req, res) {
			res.render('admin/plugins/sso-github', {
				callbackURL: nconf.get('url') + '/auth/github/callback'
			});
		}

		data.router.get('/admin/plugins/sso-github', data.middleware.admin.buildHeader, renderAdmin);
		data.router.get('/api/admin/plugins/sso-github', renderAdmin);

		callback();
		*/
    };
    QQ.deleteUserData = function (uid, callback) {
		async.waterfall([
			async.apply(user.getUserField, uid, 'qqid'),
			function (oAuthIdToDelete, next) {
				db.deleteObjectField('qqid:uid', oAuthIdToDelete, next);
			}
		], function (err) {
			if (err) {
				winston.error('[sso-qq] Could not remove OAuthId data for uid ' + uid + '. Error: ' + err);
				return callback(err);
			}
			callback(null, uid);
		});
	};

    module.exports = QQ;
}(module));
