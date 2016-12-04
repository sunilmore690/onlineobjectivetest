

var CronJob = require('cron').CronJob;
var Note = require('./models/note_model')
var CommonController = require('./controller/common_controller');
var async = require('async');
module.exports = function(app) {
 var reminderCron = new CronJob({
    cronTime: '20 0 * * *',//12 3 am
    onTick: function() {
      console.log('CALLING SET reminder')
     sendReminder();
    },
    start: true,
    timeZone: "Asia/Calcutta"
  });
  reminderCron.start()
}
function sendReminder(){
  var start = new Date();
  start.setHours(0,0,0,0);

  var end = new Date();
  end.setHours(23,59,59,999);
  Note.find({reminder:{$exists:true},reminder:{$gte: start, $lt: end}}).populate('user').exec(function(err,notes){
  	if(err){

  	}else{
  		if(notes.length){
        console.log('having reminder')
  			 // async.eachSeries(notes, function iteratee(note, callback) {
      //      var date = Date(note.reminder).toLocaleString('en-US')
      //      var message = {
      //        from: "NoteStickAndShare <noreply@notestickandshare.com>", // sender address
      //        to: note.user.email, // list of receivers
      //        subject:'Notification: '+note.subject+'@ '+date , // Subject line
      //        html: 'Hi,<br> You have set reminder for '+note.subject+'<br> <h4> NoteStickAndShare</h4>'
      //      };
      //      CommonController.sendMail(message, function (result){
      //        callback()
      //      }.bind({note:note}))
      //  });


        notes.forEach(function(note){
          if(note.user){
            var date = Date(note.reminder).toLocaleString('en-US')
           var message = {
             from: "NoteStickAndShare <noreply@notestickandshare.com>", // sender address
             to: note.user.email, // list of receivers
             subject:'Notification: '+note.subject+'@ '+date , // Subject line
             html: 'Hi,<br> You have set reminder for '+note.subject+'<br> <h4> NoteStickAndShare</h4>'
           };
           CommonController.sendMail(message, function (result){
           
           }.bind({note:note}))
          }
          
        })
  		}
  	}
  })
}