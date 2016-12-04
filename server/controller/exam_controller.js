var Exam = require('../models/exam_model')
var User = require('../models/user_model');
var CommonController = require('./common_controller');
global.cookies= [];
var examObj = {};

examObj.create = function(req,res,next){
	if(req.user) req.body.user = req.user._id;
  else req.body.cookie = req.sessionID
  var exam = new Exam(req.body);
  Exam.save(function(err,exam){
   	if(err) return next(err)
   	else return res.json(exam);
   })
}

examObj.index = function(req,res,next){
  Exam.find(req.query,function(err,exams){
    if(err) return next(err);
    else res.json(exams)
  })
}

examObj.show = function(req,res,next){
	if(!CommonController.isOBjectId(req.params.id)) return next({code:404,message:'Note Found'})
  Exam.findById(req.params.id,function(err,exam){
  	if(err) return next(err)
  	else if(!exam) return next({code:404,message:'Note Found'})
  	else res.json(exam);
  })
}
examObj.update = function(req,res,next){
	delete req.body._id;
  req.body.updated = new Date()
	if(!CommonController.isOBjectId(req.params.id)) return next({code:404,message:'Note Found'}) 
	Exam.findByIdAndUpdate(req.params.id,req.body,function(err,exam){
		if(err) return next(err)
		else if(!exam) return next({code:404,message:'Not Found'})
		else res.json(exam);
	})
}

examObj.destroy = function(req,res,next){
  console.log('req' ,req.body)
	if(!CommonController.isOBjectId(req.params.id)) return next({code:404,message:'Note Found'})
  var query = {_id:req.params.id};
  if(!CommonController.isOBjectId(req.params.id)) return next({code:404,message:'Note Found'})
  var query = {_id:req.params.id};
    Exam.remove(query,function(err,status){
      if(err) return next(err)
      else if(!status) return next({code:404,message:'Note Found'})
      else res.json({status:'Ok'});
    })
  }
module.exports = examObj;