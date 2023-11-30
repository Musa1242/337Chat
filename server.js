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
    hash: String,
    salt: Number,
    avatar: String, // change if needed
    gender: { type: String, default: 'male' },
    friends: [mongoose.Schema.Types.ObjectId],
    posts: [mongoose.Schema.Types.ObjectId]
    //age: Number, if needed
});
var User = mongoose.model('User', UserSchema);
const Comment = new mongoose.model("comment", new mongoose.Schema(
    {
        username: String,
        content: String,
    }
));


const Post = new mongoose.model("post", new mongoose.Schema( //user schema, will definitely add to this more as needed
    {
        poster: String,
        salt: Number,
        content: String,
        avatar: String,
        images: [String],
        //friends: [mongoose.Schema.Types.ObjectId],
        posts: [mongoose.Schema.Types.ObjectId]
    }
));
const DirectMessage = new mongoose.model("DM", new mongoose.Schema(
    {
        time: Number,
        user: String,
        recipient: String,
        message: String

    }
));

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
        if (last + 600000 < now) { // TODO - change - currently 1 minute
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
    if (c.login != undefined) {
        if (sessions[c.login.username] != undefined && 
        sessions[c.login.username].id == c.login.sessionID) {
            next();
        } else {
            res.redirect('/index.html');
        }
    }else {
        res.redirect('/index.html');
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

    let p = User.find({'username':usernameIn}).exec();
    p.then((documents) => {
        if (documents.length == 0){
            res.end('Login Failed');
        } else {
            let currentUser = documents[0];
            let toHash = passwordIn + currentUser.salt;
            let h = crypto.createHash('sha3-256');
            let data = h.update(toHash, 'utf-8');
            let result = data.digest('hex');

            if (result == currentUser.hash) {
                let sid = addSession(usernameIn);
            res.cookie("login", 
                {username: usernameIn, sessionID: sid},
                {maxAge: 60000 * 1}); // create a new cookie with 2 minutes life
            res.end('SUCCESS');
            console.log('Logged in');
            } else {
                res.end('Login Failed');
            }
        }
    });
    
});

app.post("/logout", (req, res) => {
    if (req.cookies.login != undefined) {
        delete sessions[req.cookies.login.username];
    }
    res.send("Successfully logged out");
})


app.post('/add/user/', function(req, res) {
    /* 
        Adds a new user to the User collection of the database.
    */
    let usernameIn = req.body.username;
    let passwordIn = req.body.password;

    let p1 = User.find({'username': usernameIn}).exec();
    p1.then( (results) => {
        if (results.length == 0){
            let newSalt = '' + Math.floor(Math.random()*1000000);
            let toHash = passwordIn + newSalt;
            let h = crypto.createHash('sha3-256');
            let data = h.update(toHash, 'utf-8');
            let result = data.digest('hex');

            let newUser = new User({username: usernameIn, hash: result, salt: newSalt});
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

app.post("/app/avatar", upload.single("img"), (req, res) => { ///needed to html reference
    if (req.file == undefined) {
        User.findOneAndUpdate(
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
        User.findOneAndUpdate(
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
});

app.get("/app/getProfilePic", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        if (response == null) {
            console.log("it's null");
            res.send(undefined);
        }
        else {
            res.send(response.avatar);
        }
    })
});

app.get('/app/userInfo', (req, res) => {
    let username = req.cookies.login?.username;
    if (!username) {
        console.log("No username in cookies");
        return res.status(401).send('User not logged in');
    }

    User.findOne({username: username}, 'username gender', (err, user) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Error fetching user info");
        }
        if (!user) {
            console.log("User not found for username:", username);
            return res.status(404).send("User not found");
        }
        console.log("User found:", user);
        res.json({username: user.username, gender: user.gender || 'Not set'});
    });
});


app.post('/app/updateProfile', function(req, res) {
    const { gender } = req.body; // Add other fields as needed
    const username = req.cookies.login?.username;

    if (!username) {
        return res.status(401).send('User not logged in');
    }

    User.findOneAndUpdate({ username }, { $set: { gender } }, { new: true }, (err, updatedUser) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error updating profile");
        }
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        res.send("Profile updated successfully");
    });
});

app.get("/app/getFriends", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        res.send(response.friends);
    })
})
app.get("/app/getInfo/:user", (req, res) => {
    User.findOne( {_id: req.params.user} )
    .then( (response) => {
        res.send(response);
    })
})

app.get('app/search/:type/:keyword', (req, res) => {
    if(req.params.type == "Users"){
        let p = User.find({ "username": { $regex: req.params.keyword, $options:"i"}}).exec();
        p.then((document) => {
            res.send(document);
        });
    }
    else if (req.params.type == "Posts") {
        let p = Post.find({ "content": { $regex: req.params.keyword, $options:"i"}}).exec();
        p.then((document) => {
            res.send(document);
        });
    }
})

app.get('/app/addFriend/:username/:id', function(req, res) {
    let p = User.find({"username": req.params.username}).exec();
    p.then((document) => {
        if(document.length == 0){
            res.send("User does not exist.");
        }
        else {
            let friend = User.findOne({_id: new mongoose.Types.ObjectId(req.params.id)});
            friend.then((response) => {
                response.friends.push(document);
                let i = response.save();
                i.then(() => {
                    document[0].friends.push(response);
                    document[0].save();
                    console.log("Done");
                }).catch((error) => {
                    console.log(error);
                });
            });
        }}).catch((error) => {
            console.log(error);
        });
        res.end();
});

app.get('/app/getDms/:RECIPIENT', function(req, res) {
    recipientIn = req.params.RECIPIENT;
    let userIn = req.cookies.login.username;

    let p = DirectMessage.find({
        $or: [ 
            {"user": userIn, "recipient": recipientIn},
            {"user": recipientIn, "recipient": userIn}
        ]
        }).exec();
    
    p.then((documents) => {
        res.end(JSON.stringify(documents, null, 2));
    })
});

app.post('/app/dms/post', function(req, res) {
    let userIn = req.cookies.login.username;
    let timeIn = req.body.time;
    let recipientIn = req.body.recipient;
    let messageIn = req.body.message;

    res.end('Got request to post the DM!');

    let newDM = new DirectMessage({time: timeIn, user: userIn, recipient: recipientIn, message: messageIn});
    return newDM.save();
})




// app.get("/app/funkyAvatar", async (req, res) => {
//     const uname = req.cookies.login.username;
//     // Modify as needed to get the gender or other parameters
//     const gender = 'male'; // Example, adjust as needed
//     const avatarUrl = `https://funky-pixel-avatars.p.rapidapi.com/api/v1/avatar/generate/user?g=${gender}&uname=${uname}&fe=gif`;

//     try {
//         const avatarResponse = await fetch(avatarUrl, {
//             method: 'GET',
//             headers: {
//                 'X-RapidAPI-Key': 'e597977b3amsh58f50df5ea831ddp18c578jsn7d9ca425de95',
//                 'X-RapidAPI-Host': 'funky-pixel-avatars.p.rapidapi.com'
//             }
//         });
//         const avatarResult = await avatarResponse.text();

//         User.findOneAndUpdate(
//             { username: uname },
//             { $set: { avatar: avatarResult } }
//         )
//         .then(() => {
//             res.send(avatarResult); // Send the avatar URL to the client
//         })
//         .catch(err => {
//             console.error("Error updating profile picture: " + err);
//             res.status(500).send(err);
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).send(error);
//     }
// });



app.listen(port, () =>
console.log(
    `Example app listening at http://127.0.0.1:${port}` // Change this ip address
));