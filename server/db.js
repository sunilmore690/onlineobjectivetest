var mongoose = require('mongoose'),
    config = require('config');

var dburl = config.OnlineObjectiveTest.dbUrl;
if(process.env.MONGODB_USER){
 dburl = 'mongodb://'+process.env.MONGODB_USER+':'+process.env.MONGODB_PASSWORD+'@localhost:27017/'+process.env.MONGODB_DATABASE
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
