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
//const fetch = require('node-fetch');

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
    gender: String,
    outgoingRequests: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    comingRequests: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
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
        username: String,
        time: Number,
        image: String,
        content: String,
        comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
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
        if (last + 600000000 < now) { // TODO - change - currently 1 minute
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

app.get('/app/getUsername', function(req, res) {
    /* 
        This function serves as a helper function to 
        get the username of the current user from
        the cookies.
    */
    let c = req.cookies;
    console.log(c.login.username);
    res.end(c.login.username);
})

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
                {maxAge: 600000 * 1}); // create a new cookie with 2 minutes life
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
    let usernameIn = req.body.username;
    let passwordIn = req.body.password;
    let genderIn = req.body.gender || 'male'; // Set default gender to 'male'

    let p1 = User.find({'username': usernameIn}).exec();
    p1.then( (results) => {
        if (results.length == 0){
            let newSalt = '' + Math.floor(Math.random()*1000000);
            let toHash = passwordIn + newSalt;
            let h = crypto.createHash('sha3-256');
            let data = h.update(toHash, 'utf-8');
            let result = data.digest('hex');

            let newUser = new User({
                username: usernameIn, 
                hash: result, 
                salt: newSalt,
                gender: genderIn // Using the default or provided gender
            });

            let p = newUser.save();
            p.then(() => {
                res.end('USER CREATED!');
            }).catch(() => {
                res.end('DATABASE SAVE ISSUE');
            });
        } else {
            res.end('USERNAME ALREADY TAKEN');
        }
    });
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



app.post("/app/addPostImage", upload.single("image"), (req, res) => { ///needed to html reference
    
    let newPost = new Post({
        username: req.cookies.login.username, 
        caption: req.body.caption, 
        time: req.body.currTime,
        image: req.file.filename
    });
    
    let p = newPost.save();
    p.then(() => {
        res.end('POST CREATED!');
    }).catch(() => {
        res.end('DATABASE SAVE ISSUE');
    });
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

    User.findOne({ username: username }, 'username gender')
        .then(user => {
            if (!user) {
                console.log("User not found for username:", username);
                return res.status(404).send("User not found");
            }
            console.log("User found:", user);
            res.json({ username: user.username, gender: user.gender || 'Not set' });
        })
        .catch(err => {
            console.error("Database error:", err);
            return res.status(500).send("Error fetching user info");
        });
});



app.post('/app/updateProfile', function(req, res) {
    const { gender } = req.body; 
    const username = req.cookies.login?.username;

    if (!username) {
        return res.status(401).send('User not logged in');
    }

    User.findOneAndUpdate({ username }, { $set: { gender } }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).send("User not found");
            }
            res.send("Profile updated successfully");
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send("Error updating profile");
        });
});


app.get("/app/getFriends", (req, res) => {
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        console.log(response.friends);
        res.send(response.friends);
    })
})
app.get("/app/getInfo/:user", (req, res) => {
    User.findOne( {_id: req.params.user} )
    .then( (response) => {
        res.send(response);
    })
})

app.get('/app/search/:type/:keyword', (req, res) => {
    if(req.params.type == "Users"){
        let p = User.find({ "username": { $regex: req.params.keyword, $options:"i"}}).select('username gender avatar').populate('comingRequests').populate('outgoingRequests').populate('friends').exec();
        p.then((document) => {
            console.log(document);
            res.json(document);
        });
    }
    else if (req.params.type == "Posts") {
        let p = Post.find({ "content": { $regex: req.params.keyword, $options:"i"}}).exec();
        p.then((document) => {
            res.json(document);
        });
    }
})

app.get('/app/addFriend/:username/', function(req, res) {
    let p = User.find({"username": req.params.username}).exec();
    p.then((document) => {
        if(document.length == 0){
            res.send("User does not exist.");
        }
        else {
            let friend = User.findOne({'username': req.cookies.login.username});
            friend.then((response) => {
                response.friends.push(document[0]._id);
                response.comingRequests.splice(response.comingRequests.indexOf(new mongoose.Types.ObjectId(document[0]._id)), 1);
                let i = response.save();
                i.then(() => {
                    document[0].friends.push(response._id);
                    document[0].outgoingRequests.splice(document[0].outgoingRequests.indexOf(new mongoose.Types.ObjectId(response._id)), 1);
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

app.get('/app/friendRequest/:username', function(req, res){
    let loggedUser = req.cookies.login.username;
    let p = User.find({"username": req.params.username}).exec();
    p.then((document) => {
        console.log(document)
        if(document.length == 0){
            res.send("User does not exist.");
        }
        else {
            let currentUser = User.findOne({username: loggedUser});
            currentUser.then((response) => {
                response.outgoingRequests.push(document[0]._id);
                let i = response.save();
                i.then(() => {
                    document[0].comingRequests.push(response._id);
                    document[0].save();
                    console.log("Done");
                }).catch((error) => {
                    console.log(error);
                });
            });
            res.send('Success');
        }}).catch((error) => {
            console.log(error);
        });
})

app.get('/app/get/friends', function(req, res) {
    console.log('22')
    let information = {};
    information.friends = [];
    information.comingRequests = [];
    information.avatar = "";
    let p = User.find({'username': req.cookies.login.username}).exec();
    p.then((document) => {
        if(document[0].friends.length == 0 && document[0].comingRequests.length == 0){
            res.json(information);
        }
        else {
            let max = '';
            if(document[0].friends.length > document[0].comingRequests.length){
                max = 'f';
            }
            else {
                max = 'c';
            }

            console.log("1 server")
            console.log(document[0].friends.length)
            for(let i = 0; i < document[0].friends.length; i++){
                console.log('4 servrer')
                User.findOne({_id: new mongoose.Types.ObjectId(document[0].friends[i])}).select('username gender avatar').exec()
                
                .then((response) => {
                    if(response) {
                        console.log("2 server")
                        information.friends.push(response);
                    }
                    if(i == document[0].friends.length-1 && max == 'f'){
                        console.log("3 server")
                        res.json(information)
                        
                    }   
                })
            }
            for(let i = 0; i < document[0].comingRequests.length; i++){
                User.findOne({_id: new mongoose.Types.ObjectId(document[0].comingRequests[i])}).select('username gender avatar').exec()
                .then((response) => {
                    if(response){
                        information.comingRequests.push(response);
                    }
                    if(i == document[0].comingRequests.length-1 && max == 'c'){
                        res.json(information);
                    }
                })
            }
        }
    }).catch((error) => {
        console.log(error)
    })
});



app.get('/app/getFriendsUsernames', function(req, res) {
    let p = User.findOne({ username: req.cookies.login.username })
    p.then((response) => {
        let friendIds = response.friends;

        //array of promises
        let promises = friendIds.map(friendId => {
            return User.findOne({ _id: friendId })
                .then((friend) => {
                    return friend.username;
                });
        });

        // Wait for all promises to be resolved
        return Promise.all(promises)
            .then((friendUsernames) => {
                console.log('Friends:')
                console.log(friendUsernames);
                res.send(friendUsernames);
            });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
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





app.get("/app/customBoringAvatar", async (req, res) => {
    const uname = req.cookies.login.username;
    const variant = req.query.variant || "marble";
    const colors = req.query.colors || "264653,2a9d8f,e9c46a,f4a261,e76f51";
    const avatarUrl = `https://source.boringavatars.com/${variant}/120/${encodeURIComponent(uname)}?colors=${colors}&square`;

    try {
        await User.findOneAndUpdate({ username: uname }, { $set: { avatar: avatarUrl } });
        res.send({ avatarUrl: avatarUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error setting custom avatar");
    }
});



app.listen(port, () =>
console.log(
    `Example app listening at http://127.0.0.1:${port}` // Change this ip address
));