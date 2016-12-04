var mongoose = require('../db');
 /*var bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 10;*/

var courseSchema = mongoose.Schema({
  name:String,
  code :{type:String,unique:true},
  course_logo:{type:String}
});
// noteSchema.index({ subject: 'text', content: 'text',label:'text'});
module.exports = mongoose.model('courses', courseSchema);