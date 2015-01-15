(function(module) {
    "use strict";

    var User = module.parent.require('./user'),
        db = module.parent.require('../src/database'),
        meta = module.parent.require('./meta'),
        passport = module.parent.require('passport'),
        passportQQ = require('passport-qq').Strategy,
        fs = module.parent.require('fs'),
        path = module.parent.require('path');

    var constants = Object.freeze({
        'name': "qq",
        'admin': {
            'icon': 'fa-qq',
            'route': '/qq'
        }
    });

    var QQ = {};

    QQ.getStrategy = function(strategies, callback) {
        if (meta.config['social:qq:id'] && meta.config['social:qq:secret']) {
            passport.use(new passportQQ({
                clientID: meta.config['social:qq:id'],
                clientSecret: meta.config['social:qq:secret'],
                callbackURL: module.parent.require('nconf').get('url') + '/auth/qq/callback'
            },function(token, tokenSecret, profile, done) {

                    console.log(token);
                    console.log(tokenSecret);
                    console.log(profile);

                var email = ''
                if(profile.emails && profile.emails.length){
                    email = profile.emails[0].value
                }
                var picture = profile.avatarUrl;
                if(profile._json.figureurl_qq_1){
                    picture = profile._json.figureurl_qq_1;
                }
                /*if(profile._json.figureurl_qq_2){
                    picture = profile._json.figureurl_qq_2;
                }*/
                QQ.login(profile.id, profile.nickname, email, picture, function(err, user) {
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
                icon: 'qq',
                scope: 'user:email'
            });
        }

        callback(null, strategies);
    };

    QQ.login = function(qqID, username, email, picture, callback) {
        console.log("qqID=" + qqID + ", username=" + username);
        if (!email) {
            email = username + '@users.noreply.qq.com';
        }

        QQ.getUidByqqID(qqID, function(err, uid) {
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
                    User.setUserField(uid, 'picture', picture);
                    User.setUserField(uid, 'gravatarpicture', picture);
                    User.setUserField(uid, 'uploadedpicture', picture);
                    db.setObjectField('qqid:openid', qqID, uid);
                    callback(null, {
                        uid: uid
                    });
                };

                User.getUidByEmail(email, function(err, uid) {
                    if (!uid) {
                        User.create({username: username, email: email, picture:picture, uploadedpicture:picture}, function(err, uid) {
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

    QQ.getUidByqqID = function(qqID, callback) {
        db.getObjectField('qqid:openid', qqID, function(err, uid) {
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

    function renderAdmin(req, res, callback) {
        res.render('sso/qq/admin', {});
    }

   QQ.init = function(data, callback) {
      	data.router.get('/admin/qq', data.middleware.admin.buildHeader, renderAdmin);
      	data.router.get('/api/qq', renderAdmin);
        callback();
    };

    module.exports = QQ;
}(module));
