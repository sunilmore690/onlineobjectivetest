var mongoose = require('../db');
 /*var bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10;*/

var questionSchema = mongoose.Schema({
  question: String,
  optionA : String,
  optionB : String,
  optionC : String,
  optionD : String,
  optionE : String
  answer  : [],
  multiple:{type:Boolean,default:false},
  course:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'courses'
  }
});
// noteSchema.index({ subject: 'text', content: 'text',label:'text'});
module.exports = mongoose.model('questions', questionSchema);