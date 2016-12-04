var mongoose = require('mongoose'),
    config = require('config');
console.log('env',process.env)
var dburl = config.OnlineObjectiveTest.dbUrl;
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    url = process.env.OPENSHIFT_MONGODB_DB_URL +
    process.env.OPENSHIFT_APP_NAME;
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
