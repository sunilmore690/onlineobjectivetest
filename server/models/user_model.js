var mongoose = require('../db');

var userSchema = mongoose.Schema({
  email :{type:String,required:true,unique:true},
  password:String,
  sex:String,
  name:{
  	first : String,
  	last : String
  },
  created:{type:Date,default:new Date()},
  updated:Date,
  verified:{type:Boolean,default:false},
  status:{type:String,default:'Active'},
  confirmationToken : String,
  resetPasswordToken :String,
  facebook : {
    id   : String,
    token : String,
    email : String,
    name  : String
  },
  google: {
    id   : String,
    token : String,
    email : String,
    name  : String
  },
  roles:[],//admin
  course_list:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'courses'
  }]
});
module.exports = mongoose.model('User', userSchema);