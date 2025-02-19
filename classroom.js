// const { google } = require('googleapis');

// // client id, client secret, redirect uri
// const oauth2Client = new google.auth.OAuth2(
//   "553081256190-4qbcbmrk85huo0iem1osl4uork7ik5gm.apps.googleusercontent.com", 
//   "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", 
//   "http://localhost:3000/oauth2callback" 
// );
// const SCOPES = ['https://www.googleapis.com/auth/classroom.courses.readonly'];

// function generateURl() {
//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline', 
//     scope: SCOPES,
//     include_granted_scopes: true, // what does this do
//   });
//   return authUrl;
// }

// module.exports = {
//   generateURl
// }