var mongoose = require('../db');
 /*var bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10;*/

var examSchema = mongoose.Schema({
  name:String,
  code :{type:String,unique:true},
  duration:{type:Number,default:3600},//in seconds
  questions:[{
  	question:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'questions'
    },
  	mark:{type:Number,default:1}
  }],
  negativeratio:{type:Number,default:3}

});
// noteSchema.index({ subject: 'text', content: 'text',label:'text'});
module.exports = mongoose.model('exams', examSchema);