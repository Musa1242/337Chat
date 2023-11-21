const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');
const port = 80;
const app = express()
app.use(express.json());
app.use(cookieParser());
const multer = require("multer");
const upload = multer( {dest: __dirname + '/public_html/img'} );

const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/337chat';
mongoose.connect(mongoDBURL, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

var Schema = mongoose.Schema;
var UserSchema = new Schema({
    username: String,
    password: String, // temporary
    hash: Number,
    salt: Number,
    avatar: String // change if needed
});
var User = mongoose.model('User', UserSchema);

let sessions = {};

function addSession(username) {

    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = {id: sid, time: now};
    return sid;
}

function removeSessions() {

    let now = Date.now();
    let usernames = Object.keys(sessions);
    for (let i = 0; i < usernames.length; i++) {
        let last = sessions[usernames[i]].time;
        if (last + 60000 < now) { // TODO - change - currently 1 minute
            delete sessions[usernames[i]];
            console.log("" + usernames[i] + " session deleted");
        }
    }
}

setInterval(removeSessions, 2000);



function authenticate(req, res, next) {

    let c = req.cookies;
    console.log('auth request:');
    console.log(req.cookies);
    if (c != undefined) {
        if (sessions[c.login.username] != undefined && 
        sessions[c.login.username].id == c.login.sessionID) {
            next();
        } else {
            res.redirect('./public_html/index.html');
        }
    }else {
        res.redirect('./public_html/index.html');
    }
}

app.use('/app/*', authenticate);
app.get('/app/*', (req, res, next) => {
    console.log('another');
    next();
});

app.use(express.static('public_html'));

app.post('/account/login/', function(req, res) {
    let usernameIn = req.body.username;
    let passwordIn = req.body.password;

    let p = User.find({'username':usernameIn, 'password':passwordIn}).exec();
    p.then((documents) => {
        if (documents.length == 0){
            res.end('Login Failed');
        } else {
            let sid = addSession(usernameIn);
            res.cookie("login", 
                {username: usernameIn, sessionID: sid},
                {maxAge: 60000 * 2}); // create a new cookie with 2 minutes life
            res.end('SUCCESS');
        }
    });
    console.log('Logged in');
});

app.post('/add/user/', function(req, res) {
    /* 
        Adds a new user to the User collection of the database.
    */
    let usernameIn = req.body.username;
    let passwordIn = req.body.password;
    let listingsIn = [];
    let purchasesIn = [];

    let p1 = User.find({'username': usernameIn}).exec();
    p1.then( (results) => {
        if (results.length == 0){
            let newUser = new User({username: usernameIn, password: passwordIn, listings: listingsIn, purchases: purchasesIn});
            let p = newUser.save();
            p.then(() => {
                res.end('USER CREATED!');
            });
            p.catch(() => {
                res.end('DATABASE SAVE ISSUE');
            });
        } else {
            res.end('USERNAME ALREADY TAKEN')
        }
    })
});

app.post("/app/avatar", upload.single("img"), (req, res) => {
    if (req.file == undefined) {
        UserSchema.findOneAndUpdate(
            {username: req.cookies.login.username},
            {$unset: {avatar: ""} }
        )
        .then( (response) => {
            res.send("Successfully removed profile picture");
        })
        .catch( (err) => {
            console.log("Error removing profile picture: " + err);
        })
    }
    else {
        UserSchema.findOneAndUpdate(
            {username: req.cookies.login.username},
            {$set: {avatar: req.file.filename} }
        )
        .then( (response) => {
            res.send("Successfully set profile picture for user");
        })
        .catch( (err) => {
            console.log("Error uploading profile picture: " + err);
        })
    }
})

app.get("/app/getProfilePic", (req, res) => {
    UserSchema.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        if (response == null) {
            console.log("it's null");
            res.send(undefined);
        }
        else {
            res.send(response.avatar);
        }
    })
})

