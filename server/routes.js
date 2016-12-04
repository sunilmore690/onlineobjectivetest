
var ExamController = require('./controller/exam_controller');
var UserController = require('./controller/user_controller');
var CommonController = require('./controller/common_controller');
var CourseController = require('./controller/course_controller');
var auth = function(req,res,next){
   if (req.isAuthenticated())
    return next();
  else return next({code:401,message:'Please Login to continue'})
}
module.exports = function(app,passport){
  //route for User
  app.get('/api/courses',CourseController.index);
  app.get('/api/courses/:id',CourseController.show)
  app.post('/api/courses',CourseController.create);
  app.put('/api/courses/:id',CourseController.update);
  app.delete('/api/courses/:id',CourseController.destroy)
  app.get('/api/exams',ExamController.index);
  app.get('/api/exams/:id',ExamController.show)
  app.post('/api/exams',ExamController.create);
  app.put('/api/exams/:id',ExamController.update);
  app.delete('/api/exams/:id',ExamController.destroy)
  // app.post('/api/restorenote/:id',NoteController.restore)
  // app.post('/api/movetotrash/:id',NoteController.moveToTrash)

  //route for Note
  app.get('/api/users',auth,UserController.index);
  app.get('/api/users/:id',auth,UserController.show)
  app.post('/api/users',UserController.create);
  app.put('/api/users/:id',auth,UserController.update);
  app.delete('/api/users/:id',auth,UserController.destroy)
  app.get('/api/verify',UserController.verify);
  app.post('/api/forgotpassword',UserController.forgotPassword)
  app.post('/api/resetpassword',UserController.resetPassword)
  app.post('/api/login',UserController.session.bind({passport:passport}))
  app.post('/api/logout',UserController.clearSession)
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
  app.get('/auth/google', passport.authenticate('google', { scope : 'email' }));
  // app.post('/api/sharenote',auth,ShareController.create);
  // app.get('/api/sharenote/:id',ShareController.index);
  // app.put('/api/sharenote/:id',auth,ShareController.update);
  // app.get('/sharenote/:id',function(req,res,next){
  //   res.redirect('/#sharenote?id='+req.params.id);
  // })
  app.post('/api/fileupload',auth,CommonController.fileUpload);

  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
      successRedirect : '/',
      failureRedirect : '/something-went-wrong'
  }));
  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
  app.get('/auth/google/callback',
      passport.authenticate('google', {
          successRedirect : '/',
          failureRedirect : '/something-went-wrong'
      }));
  // app.post('/api/login', passport.authenticate('local', {
  //       successRedirect : '/', // redirect to the secure profile section
  //       failureRedirect : '/', // redirect back to the signup page if there is an error
  //       failureFlash : true // allow flash messages
  //   }))
  // // app.post('/api/login', passport.authenticate('local', function(err, user) {
  //     if (err) next(err)
  //     else{
  //       res.json(user);
  //     }      
  //   })(this.req,this.res,this.next))
  
  app.get('/api/auth/logged_in',CommonController.isLoggedin)
}