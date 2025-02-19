const express = require('express');
const app = express();
const path = require("node:path");
const url = require('url');
require("dotenv").config();
const { getCanvasData } = require('./canvas');

app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

/// bad code below lol
const { google } = require('googleapis');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET, 
  "http://localhost:3000/oauth2callback" 
);
const SCOPES = ['https://www.googleapis.com/auth/classroom.courses.readonly'];

app.post('/authtest', async (req, res, next) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log(authUrl);
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  let q = url.parse(req.url, true).query; 
  if (q.error) { 
    console.log('Error:' + q.error);
  } else { 
    let { tokens } = await oauth2Client.getToken(q.code);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24, // figure out expiration // how to deal with this
    }); 
    oauth2Client.setCredentials(tokens);
    const classroom = google.classroom({version: 'v1'}); // again, turn this into a function
    const response = await classroom.courses.list({
      auth: oauth2Client,
      courseStates: ["ACTIVE"]
    });
    const courses = response.data.courses;
    console.log(courses)
    res.redirect('/');
  }
}); 

app.get('/', async (req, res) => {
  let classroomAuth = !!req.cookies.refresh_token;
  let canvasAuth = !!req.cookies.canvas_token;
  res.render('index', { classroomAuth, canvasAuth });
});

app.get('/courses', async (req, res) => {
  try {
    // add something in case bad token so it doesnt jsut error
    // idk deal with this later lol
    // classroom data
    oauth2Client.setCredentials({
      refresh_token: req.cookies.refresh_token,
    });
    const classroom = google.classroom({version: 'v1'}); // should turn this into a function
    const response = await classroom.courses.list({
      auth: oauth2Client,
      courseStates: ["ACTIVE"]
    });
    const classroomData = response.data.courses;
    // canvas data
    const canvasData = await getCanvasData(req.cookies.canvas_proxy, req.cookies.canvas_token);

    console.log(canvasData);
    console.log(classroomData);

    res.render('courses', { canvasData, classroomData });
  } catch(err) {
    console.log(err);
    next(err);
  }  
});

app.post('/canvas', (req, res, next) => {
  const token = req.body.token; 
  const proxy = req.body.proxy || 'cors-anywhere.herokuapp.com'; 
  // ig can take out as cookieoptions uhhh
  res.cookie('canvas_token', token, {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24, // figure out expiration // how to deal with this
  }); 
  res.cookie('canvas_proxy', proxy, {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24, // figure out expiration // how to deal with this
  }); 
  res.redirect('/');
});

app.post('/canvas_unauth', (req, res, next) => {
  res.clearCookie('canvas_proxy');
  res.clearCookie('canvas_token');
  res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
