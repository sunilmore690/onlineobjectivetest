var mongoose = require('mongoose'),
    config = require('config');

var dburl = config.OnlineObjectiveTest.dbUrl;
if(process.env.OPENSHIFT_NODEJS_IP){
   dburl = 'mongodb://admin:Auz5nSHRGAXV@'+process.env.OPENSHIFT_MONGODB_DB_HOST+':'+process.env.OPENSHIFT_MONGODB_DB_PORT+'/noteshareandstick'
}
console.log('dburl',dburl)
mongoose.connect(dburl);
mongoose.set('debug', process.env.MONGODB_USER ? false:true);
var db = mongoose.connection;


// db.on('error', console.error.bind(console, 'connection error: Cannot connect to '+CONFIG.dbName));
// db.once('open', function callback() {
//   console.log('Connected to '+ CONFIG.dbName);
// });

module.exports = mongoose;
