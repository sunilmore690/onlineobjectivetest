// var passport = require('passport'),
   var LocalStrategy = require('passport-local').Strategy,
      User = require('./models/user_model'),
      // Note = require('./models/note_model'),
      FacebookStrategy = require('passport-facebook').Strategy,
      GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy,
      configAuth = require('config').passportAuth;
console.log('configAuth',configAuth)
module.exports = function(app,passport){
  passport.use( new LocalStrategy({ usernameField: 'email', passwordField: 'password'},function(email, password, done) {
    console.log('password LocalStrategy');
    User.findOne({ email: email,status:"Active",password:password}, function(err, user) {
      if (err) return done(err); 
      if (!user) return done({code:404,message:'Email or password Wrong'})
      else if(!user.verified) return done({code:403,message:'User not Verified'})
      else return done(null,user)
    });
  }));

  passport.serializeUser(function(user, done) {
    console.log('user',user);
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
  console.log('configAuth.facebookAuth.clientID',configAuth.facebookAuth.clientID)
  passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['id', 'name', 'email'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {
               
                User.findOne({ email: (profile.emails[0].value || '').toLowerCase() }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            // user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                            user.email = (profile.emails[0].value || '').toLowerCase();
                            user.name = {
                                first:profile.name.givenName,
                                last:profile.name.familyName
                            }

                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser            = new User();

                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        // newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        // newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                        newUser.email = (profile.emails[0].value || '').toLowerCase();
                         newUser.name = {
                            first:profile.name.givenName,
                            last:profile.name.familyName
                        }
                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                            // Note.update({cookie:req.sessionID},{$set:{user:newUser._id}},{multi:true},function(err,status){

                            // })
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.email = (profile.emails[0].value || '').toLowerCase();
                user.name = {
                    first:profile.name.givenName,
                    last:profile.name.familyName
                }

                user.save(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });

            }
        });

    }));

    // =========================================================================
    // TWITTER =================================================================
    // // =========================================================================
    // passport.use(new TwitterStrategy({

    //     consumerKey     : configAuth.twitterAuth.consumerKey,
    //     consumerSecret  : configAuth.twitterAuth.consumerSecret,
    //     callbackURL     : configAuth.twitterAuth.callbackURL,
    //     passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    // },
    // function(req, token, tokenSecret, profile, done) {

    //     // asynchronous
    //     process.nextTick(function() {

    //         // check if the user is already logged in
    //         if (!req.user) {

    //             User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
    //                 if (err)
    //                     return done(err);

    //                 if (user) {
    //                     // if there is a user id already but no token (user was linked at one point and then removed)
    //                     if (!user.twitter.token) {
    //                         user.twitter.token       = token;
    //                         user.twitter.username    = profile.username;
    //                         user.twitter.displayName = profile.displayName;

    //                         user.save(function(err) {
    //                             if (err)
    //                                 return done(err);
                                    
    //                             return done(null, user);
    //                         });
    //                     }

    //                     return done(null, user); // user found, return that user
    //                 } else {
    //                     // if there is no user, create them
    //                     var newUser                 = new User();

    //                     newUser.twitter.id          = profile.id;
    //                     newUser.twitter.token       = token;
    //                     newUser.twitter.username    = profile.username;
    //                     newUser.twitter.displayName = profile.displayName;

    //                     newUser.save(function(err) {
    //                         if (err)
    //                             return done(err);
                                
    //                         return done(null, newUser);
    //                     });
    //                 }
    //             });

    //         } else {
    //             // user already exists and is logged in, we have to link accounts
    //             var user                 = req.user; // pull the user out of the session

    //             user.twitter.id          = profile.id;
    //             user.twitter.token       = token;
    //             user.twitter.username    = profile.username;
    //             user.twitter.displayName = profile.displayName;

    //             user.save(function(err) {
    //                 if (err)
    //                     return done(err);
                        
    //                 return done(null, user);
    //             });
    //         }

    //     });

    // }));

    // // =========================================================================
    // // GOOGLE ==================================================================
    // // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        returnURL       : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {
            console.log('profile')
            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ email : profile.emails[0].value}, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = token;
                            // user.google.name  = profile.displayName;
                            // user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                            user.email = (profile.emails[0].value || '').toLowerCase();
                            var name = profile.displayName;
                            name  = name.split(' ');
                            user.name = {
                                first:name[0],
                                last: name[1] ? name[1] : ''
                            }
                            user.save(function(err) {
                                if (err)
                                    return done(err);
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                        newUser.email = (profile.emails[0].value || '').toLowerCase();
                        var name = profile.displayName;
                        name  = name.split(' ');
                        newUser.name = {
                            first:name[0],
                            last: name[1] ? name[1] : ''
                        }
                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                            //  Note.update({cookie:req.sessionID},{$set:{user:newUser._id}},{multi:true},function(err,status){

                            // })
                            // return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user  = req.user; // pull the user out of the session

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                user.email = (profile.emails[0].value || '').toLowerCase();
                var name = profile.displayName;
                if(name) name = name.split(' ')
                user.name = {
                    first: name ? name[0] :'',
                    last: nae ? name[1] :''
                }
                user.save(function(err) {
                    if (err)
                        return done(err);
                        
                    return done(null, user);
                });

            }

        });

    }));
}