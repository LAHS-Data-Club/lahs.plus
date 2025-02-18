const express = require('express');
const app = express();
const path = require("node:path");
// const { generateURl } = require('./classroom'); // refactor later
const { getCanvasData } = require('./canvas');
const url = require('url');
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// const session = require('express-session');
// app.use(session({
//   secret: 'your_secure_secret_key', // shhhh
//   resave: false,
//   saveUninitialized: false,
// }));

// REFACTOR LATERs
const { google } = require('googleapis');

// client id, client secret, redirect uri
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET, 
  "http://localhost:3000/oauth2callback" 
);
const SCOPES = ['https://www.googleapis.com/auth/classroom.courses.readonly'];

function generateURl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', 
    scope: SCOPES,
    include_granted_scopes: true, // what does this do
  });
  return authUrl;
}
// REFACTOR LATER

app.post('/authtest', async (req, res, next) => {
  // canvas stuff
  const token = req.body.token;
  const proxy = req.body.proxy || 'cors-anywhere.herokuapp.com'; 
  const canvasData = await getCanvasData(proxy, token); // how do i forward thisdata
  req.canvasData = canvasData; // not sure if this is how it works

  const authUrl = generateURl();
  res.redirect(authUrl); 
});

app.get('/oauth2callback', async (req, res, next) => {
  let q = url.parse(req.url, true).query; 
  if (q.error) { 
    console.log('Error:' + q.error);
  } else { // Get access and refresh tokens (if access_type is offline)
    let { tokens } = await oauth2Client.getToken(q.code); // this is the token; store this + canvas token local storage for now ig?
    oauth2Client.setCredentials(tokens);
    const classroom = google.classroom({version: 'v1'});
    const response = await classroom.courses.list({
      auth: oauth2Client,
      courseStates: ["ACTIVE"]
    });
    const courses = response.data.courses;
    console.log(courses);
    res.redirect('/');
  }
}); 

app.get('/authtest', (req, res) => res.render('authtest'));
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/courses', (req, res) => {
  res.render('courses');
});


// app.post('/', async (req, res, next) => {
  // const token = '10497~M86Rm7h2TtXxmfauTNPQ4HXJrmE8ZhufYuU2Qr3WcQR6xryxH7avzzGK8kr89nn2';
  // const proxy = req.body.proxy || 'cors-anywhere.herokuapp.com'; 

  // try {
  //   const classroomData = await getClassroomData();
  //   const canvasData = await getCanvasData(proxy, token);
  //   console.log(classroomData);
  //   console.log(canvasData);
  //   res.render('index', { classroomData, canvasData } );
  // } catch(err) {
  //   console.log(err);
  //   next(err);
  // }  
// });

const PORT = 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
