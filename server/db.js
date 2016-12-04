var mongoose = require('mongoose'),
    config = require('config');

var dburl = config.OnlineObjectiveTest.dbUrl;
if(process.env.NODE_ENV == 'production'){
 dburl = 'mongodb://user18Q:GBmM6Qpd0fdJnET2@172.30.246.214:27017/sampledb'
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
