var Course = require('../models/course_model')
var User = require('../models/user_model');
var CommonController = require('./common_controller');
global.cookies= [];
var courseObj = {};

courseObj.create = function(req,res,next){
	if(req.user) req.body.user = req.user._id;
  else req.body.cookie = req.sessionID
  var exam = new Exam(req.body);
  Course.save(function(err,course){
   	if(err) return next(err)
   	else return res.json(course);
   })
}

courseObj.index = function(req,res,next){
  Course.find(req.query,function(err,courses){
    if(err) return next(err);
    else res.json(courses)
  })
}

courseObj.show = function(req,res,next){
	if(!CommonController.isOBjectId(req.params.id)) return next({code:404,message:'Note Found'})
  Course.findById(req.params.id,function(err,course){
  	if(err) return next(err)
  	else if(!exam) return next({code:404,message:'Note Found'})
  	else res.json(exam);
  })
}
courseObj.update = function(req,res,next){
	delete req.body._id;
  req.body.updated = new Date()
	if(!CommonController.isOBjectId(req.params.id)) return next({code:404,message:'Note Found'}) 
	Course.findByIdAndUpdate(req.params.id,req.body,function(err,course){
		if(err) return next(err)
		else if(!exam) return next({code:404,message:'Not Found'})
		else res.json(course);
	})
}

courseObj.destroy = function(req,res,next){
  console.log('req' ,req.body)
	if(!CommonController.isOBjectId(req.params.id)) return next({code:404,message:'Note Found'})
  var query = {_id:req.params.id};
  if(!CommonController.isOBjectId(req.params.id)) return next({code:404,message:'Note Found'})
  var query = {_id:req.params.id};
    Course.remove(query,function(err,status){
      if(err) return next(err)
      else if(!status) return next({code:404,message:'Note Found'})
      else res.json({status:'Ok'});
    })
  }
module.exports = courseObj;