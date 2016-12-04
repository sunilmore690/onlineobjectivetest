var User = require('../models/user_model');
var CommonController = require('./common_controller');
var uuid = require('node-uuid');
LocalStrategy = require('passport-local').Strategy;
var userObj = {};

userObj.create = function(req, res, next) {
  User.findOne({
    email: req.body.email
  }, function(err, userObj) {
    if (err) return next(err)
    else if (userObj) return next({
      code: 401,
      message: 'An email is already registered with us'
    })
    else {
      var user = new User(req.body);
      user.confirmationToken = uuid.v4();
      user.save(function(err, user) {
        if (err) return next(err)
        else {

          var link = 'http://' + req.get('host') + '/api/verify?email=' + user.email + '&token=' + user.confirmationToken;
          var message = {
            from: "Online Objective Test <noreply@onlineobjectivetest.com>", // sender address
            to: user.email, // list of receivers
            subject: 'Thank you for registering with use.Please confirm your account', // Subject line
            html: 'Hi,<br> Please click on the below link to confirm your account. <br> <a href="' + link + '" >Verify</a> <br><br> <h4> NoteStickAndShare</h4>'
          };
          CommonController.sendMail(message, function(result) {
            console.log('email sent')
          })
          req.logIn(user, function(err) {
            res.json(req.user);
          })

        }
      })
    }
  })

}

userObj.index = function(req, res, next) {

  User.find({}, function(err, users) {
    if (err) return next(err)
    else res.json(users);
  })
}

userObj.show = function(req, res, next) {
  if (!CommonController.isOBjectId(req.params.id)) return next({
    code: 404,
    message: 'Not Found'
  })
  User.findById(req.params.id, function(err, user) {
    if (err) return next(err)
    else if (!user) return next({
      code: 404,
      message: 'Note Found'
    })
    else res.json(user);
  })
}
userObj.update = function(req, res, next) {
  delete req.body._id;
  if (!CommonController.isOBjectId(req.params.id)) return next({
    code: 404,
    message: 'Note Found'
  })
  User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
    if (err) return next(err)
    else if (!user) return next({
      code: 404,
      message: 'Not Found'
    })
    else res.json(user);
  })
}

userObj.destroy = function(req, res, next) {
  if (!CommonController.isOBjectId(req.params.id)) return next({
    code: 404,
    message: 'Note Found'
  })
  var query = {
    _id: req.params.id
  };
  User.remove(query, function(err, status) {
    if (err) return next(err)
    else if (!status) return next({
      code: 404,
      message: 'Note Found'
    })
    else res.json({
      status: 'Ok'
    });
  })
}
userObj.session = function(req, res, next) {
  this.passport.authenticate('local', function(err, user) {
    if (err) next(err)
    else {
      req.logIn(user, function(err) {
        res.json(req.user);
      })

    }
  })(req, res, next)
}
userObj.clearSession = function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) return nex(err)
    res.json({
      status: 'OK'
    }); //Inside a callback… bulletproof!
  });
}
userObj.verify = function(req, res, next) {
  console.log()
  User.findOne({
    email: req.query.email,
    confirmationToken: req.query.token
  }, function(err, user) {
    if (err) return next(err)
    else if (!user) return res.redirect('/#verify?type=error')
    else {
      console.log('user')
      user.verified = true;
      user.confirmationToken = '';
      user.save(function(err, user) {
        if (err) return next(err)
        else return res.redirect('/#verify?type=success')
      })
    }
  })
}
userObj.forgotPassword = function(req, res, next) {
  var email = req.body.email;
  User.findOne({
    email: email
  }, function(err, user) {
    if (err) return next(err)
    else if (!user) return next({
      code: 404,
      message: 'This email not registered with us'
    })
    else {
      user.resetPasswordToken = uuid.v4();
      user.save(function(err, user) {
        if (err) return next(err);
        else {
          var link = 'http://' + req.get('host') + '/#resetpassword?email=' + user.email + '&passwordtoken=' + user.resetPasswordToken;
          var message = {
            from: "NoteStickAndShare <noreply@notestickandshare.com>", // sender address
            to: user.email, // list of receivers
            subject: 'Please reset you password', // Subject line
            html: 'Hi,<br> Please click on the below link to reset your account. <br> <a href="' + link + '" >Reset</a> <br><br> <h4> NoteStickAndShare</h4>'
          };
          CommonController.sendMail(message, function(result) {
            console.log('email sent');
            res.json({
              status: 'ok'
            })
          })
        }
      })

    }
  })
}
userObj.resetPassword = function(req, res, next) {
  console.log('req .body', req.body)
  User.findOne({
    email: req.body.email,
    resetPasswordToken: req.body.passwordtoken
  }, function(err, user) {
    if (err) return next(err)
    else if (!user) return next({
      code: 404,
      message: 'Password token is expired or wrong. Please try to forgot password'
    })
    else {
      user.password = req.body.password;
      user.save(function(err, user) {
        if (err) return next(err)
        else res.json({
          status: 'Ok'
        });
      })
    }
  })
}



module.exports = userObj;