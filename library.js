(function(module) {
    "use strict";

    var User = module.parent.require('./user'),
        db = module.parent.require('./database'),
        meta = module.parent.require('./meta'),
        nconf = module.parent.require('nconf'),
        passport = module.parent.require('passport'),
        QQStrategy = require('passport-qq').Strategy;
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
        'name': "QQ",
        'admin': {
            'icon': 'fa-qq',
            'route': '/plugins/sso-qq'
        }
    });

    var QQ = {};

    QQ.getStrategy = function(strategies, callback) {
        meta.settings.get('sso-qq', function(err, settings) {
            if (!err && settings.id && settings.secret) {
                passport.use(new QQStrategy({
                    clientID: settings.id,
                    clientSecret: settings.secret,
                    callbackURL: nconf.get('url') + '/auth/qq/callback'
                }, function(token, tokenSecret, profile, done) {
                    QQ.login(profile.id, profile.nickname, function(err, user) {
                        if (err) {
                            return done(err);
                        }
                        done(null, user);
                    });
                }));

                strategies.push({
                    name: 'qq',
                    url: '/auth/qq',
                    callbackURL: '/auth/qq/callback',
                    icon: 'fa-qq',
                    scope: 'user:info'
                    
                });
            }

            callback(null, strategies);
        });
    };
    
    
    QQ.getAssociation = function(data, callback) {
		User.getUserField(data.uid, 'qqid', function(err, githubid) {
			if (err) {
				return callback(err, data);
			}

			if (githubid) {
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
    QQ.login = function(qqID, username,email, callback) {
        //生成新用户
        if(!email){
            email = username + '@users.noreply.qq.com';
        }    
        QQ.getUidByQQID(qqID, function(err, uid) {
            if (err) {
				return callback(err);
			}

			if (uid) {
				// Existing User
				callback(null, {
					uid: uid
				});
            } else {
                // New User
                var success = function(uid) {
                    User.setUserField(uid, 'qqid', qqID);
                    db.setObjectField('qqid:uid', qqID, uid);
                    callback(null, {
                        uid: uid
                    });
                };

                User.getUidByEmail(email, function(err, uid) {
                    if (!uid) {
                        User.create({username: username, email: email}, function(err, uid) {
                            if (err !== null) {
                                callback(err);
                            } else {
                                success(uid);
                            }
                        });
                    } else {
                        success(uid); // Existing account -- merge
                    }
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
    GitHub.deleteUserData = function(uid, callback) {
		async.waterfall([
			async.apply(User.getUserField, uid, 'qqid'),
			function(oAuthIdToDelete, next) {
				db.deleteObjectField('qqid:uid', oAuthIdToDelete, next);
			}
		], function(err) {
			if (err) {
				winston.error('[sso-qq] Could not remove OAuthId data for uid ' + uid + '. Error: ' + err);
				return callback(err);
			}
			callback(null, uid);
		});
	};

    module.exports = QQ;
}(module));
