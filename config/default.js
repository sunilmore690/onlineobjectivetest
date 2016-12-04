module.exports = {
	passportAuth :{
		'facebookAuth' : {
        'clientID'        : '1121125971314145', // your App ID
        'clientSecret'    : 'bd968bb43b5074839836eebf7246ebb7', // your App Secret
        'callbackURL'     : 'http://noteshareandstick-ushasoft.rhcloud.com/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:8000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '621123065163-uip3q3lbe7b0aqvd1l22khe4euupo9sb.apps.googleusercontent.com',
        'clientSecret'     : 'fdc51qZdJ-ELtk-paq80pdMO',
        'callbackURL'      : 'http://noteshareandstick-ushasoft.rhcloud.com/auth/google/callback'
    }
	},
     OnlineObjectiveTest: {
        dbUrl:'mongodb://localhost:27017/oot',
      debug:false
    }
   
}