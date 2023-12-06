/*
Name: 337Chat Group: Seth, Mustafa, Musa, Kat
Final Project

This code is the server side JavaScript code for the
337Chat web app. Using AJAX, the code specifies responses
to both get requests and post requests. The code establishes
a connection to a MongoDB database, and 4 new schemas. The code
serves the public_html directory. There are a variety of get
requests and post requests that handle a variety functions
and operations throughout the web app, described further below.
*/

// Imports + uses
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const port = 80;
const app = express()
app.use(express.json());
app.use(cookieParser());
const multer = require("multer");
const upload = multer( {dest: __dirname + '/public_html/img'} );
//const boringAvatar = require('boring-avatars') // upload the library
// Connect to DB, establish Schemas
const db = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/337chat';
mongoose.connect(mongoDBURL, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

var Schema = mongoose.Schema;
var UserSchema = new Schema({
    username: String,
    hash: String,
    salt: Number,
    avatar: String,
    gender: String,
    outgoingRequests: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    comingRequests: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    posts: [mongoose.Schema.Types.ObjectId]
});

var User = mongoose.model('User', UserSchema);

var CommentSchema = new Schema({
    username: String,
    content: String
});

var Comment = mongoose.model('Comment', CommentSchema);


const Post = new mongoose.model("post", new mongoose.Schema(
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

// Establish sessions - remove old sessions - check every 2 seconds
let sessions = {};

function addSession(username) {
    /*
        This function first creates a session ID. 
        It then gets current date & time and saves this 
        session into the global sessions dict.
        The function returns the sessionID (sid) 
        to be given the login handler.
    */
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = {id: sid, time: now};
    return sid;
}

function removeSessions() {
    /*
        This function gets the current date & time.
        It then gets all usernames that have open sessions,
        and delete all sessions that are older than 1 minute.
    */
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

// call remove sessions every 2 seconds
    // checking if any sessions need to be removed...
setInterval(removeSessions, 2000);

function authenticate(req, res, next) {
    /*
        This function is used to ensure that the specific
        user is allowed to access the specific page.
        It checks that the user has a current session open
        and that session username matches the session ID.
        Otherwise, the user is redirected to the index.html
        page. This is called for all paths beginning with
        /app/.
    */
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
    /*
        This function receives a post request, searching
        for a user and checking the hashed and salted
        password, logging in the user if the password is
        correct through this process.
    */
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
                {maxAge: 600000 * 1}); // create a new cookie
            res.end('SUCCESS');
            console.log('Logged in');
            } else {
                res.end('Login Failed');
            }
        }
    });
    
});

app.post("/logout", (req, res) => {
    /*
        Handles a simple post request to remove the current
        session and thus log the user out.
    */
    if (req.cookies.login != undefined) {
        delete sessions[req.cookies.login.username];
    }
    res.send("Successfully logged out");
})


app.post('/add/user/', function(req, res) {
    /*
        Handles the post request to create a new user,
        setting username and password, gender and avatar to
        default, and creating a hash and salt for the user
        to ensure security of future logins.
    */
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


app.post("/app/avatar", upload.single("img"), (req, res) => { 
    /*
        This function handles two different types of post requests,
        the first being to remove the avatar of the user
        specified, and the second being to upload the avatar image
        and make that the new avatar for the user. Note, this
        uses 'multer'.
    */
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



app.post("/app/addPostImage", upload.single("image"), (req, res) => { 
    /*
        This function handles a post request to create a new post
        for the user when the post contains an image.
    */
    let newPost = new Post({
        username: req.cookies.login.username, 
        content: req.body.caption, 
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

app.post("/app/addPostNoImage", upload.none(), (req, res) => {
    /*
        This function handles a post request to create a new post
        for the user when the post does not contain an image.
    */
    let newPost = new Post({
        username: req.cookies.login.username, 
        content: req.body.caption, 
        time: req.body.currTime,
        image: undefined
    });
    
    let p = newPost.save();
    p.then(() => {
        res.end('POST CREATED!');
    }).catch(() => {
        res.end('DATABASE SAVE ISSUE');
    });
});

app.get("/app/getProfilePic", (req, res) => {
    /*
        This function handles a get request that sends
        the avatar of the current user.
    */
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
    /*
        This function handles a get request to send username
        and gender back to the client of the current user.
    */
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
    /*
        This function handles a post request to update
        the profile, specifically updating the gender
        of the user from the update profile page.
    */
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
    /*
        This function handles a simple get request to 
        get the friends of the current user.
    */
    User.findOne( {username: req.cookies.login.username} )
    .then( (response) => {
        console.log(response.friends);
        res.send(response.friends);
    })
});

app.get("/app/getInfo/:user", (req, res) => {
    /*
        This function handles the simple get request
        to get all info about a specific user
        specified within req params.
    */
    User.findOne( {_id: req.params.user} )
    .then( (response) => {
        res.send(response);
    })
});

app.get('/app/search/:type/:keyword', (req, res) => {
    /*
        This function handles two different types of get request.
        Each request is a search, either a substring seach of users
        or of posts (by username or by caption). The function
        sends back all results to the client.
    */
    if(req.params.type == "Users"){
        let p = User.find({ "username": { $regex: req.params.keyword, $options:"i"}}).select('username gender avatar').populate('comingRequests').populate('outgoingRequests').populate('friends').exec();
        p.then((document) => {
            console.log(document);
            res.json(document);
        });
    }
    else if (req.params.type == "Posts") {
        let p = Post.find({
            $or: [
                {"content": { $regex: req.params.keyword, $options:"i"}},
                {"username": { $regex: req.params.keyword, $options:"i"}}
            ] 
        }).select('username content image').populate('comments').exec();
        p.then((document) => {
            res.json(document);
        });
    }
});

app.get('/app/getMyPosts/:USERNAME', (req, res) => {
    /*
        This function handles a simple get request to get
        all posts of a specified user name in req params.
    */
    let usernameIn = req.params.USERNAME;

    let p = Post.find({"username": usernameIn}).select('username content image').populate('comments').exec();
    p.then((document) => {
        res.json(document);
    });
});

app.get('/app/getFriendsPosts/:USERNAME', async (req, res) => {
    /*
        This asynchronous function handles a get requests to get all posts of
        a specified users friends and order them by time, sending back all posts
        in this order to the client.
    */
    let usernameIn = req.params.USERNAME;

    try {
        let usernameIn = req.params.USERNAME;
    
        const user = await User.findOne({ username: usernameIn }).populate('friends');


        let friendsList = [];

        for (let i = 0; i<user.friends.length; i++){
            friendsList.push(user.friends[i].username);
        }
    
        const friendsPosts = await Post.find({ username: { $in: friendsList } }).sort({ time: 'asc' }).select('username content image').populate('comments').exec();
    
        res.json(friendsPosts);
      } catch (error) {

        console.error(error);
      }
});

app.get('/app/addFriend/:username/', function(req, res) {
    /*
        This function responds to a get request to add a friend
        to the current User's friend list.
    */
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
    /*
        This function responds to a get request to send a friend
        request to a specific username from the current users
        profile.
    */
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
});

app.get('/app/get/friends', function(req, res) {
    /*
        This function responds to a get request to
        get all friends and incoming friend requests
        for a specific user.
    */
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

            console.log(document[0].friends.length)
            for(let i = 0; i < document[0].friends.length; i++){
                User.findOne({_id: new mongoose.Types.ObjectId(document[0].friends[i])}).select('username gender avatar').exec()
                
                .then((response) => {
                    if(response) {
                        information.friends.push(response);
                    }
                    if(i == document[0].friends.length-1 && max == 'f'){
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
    /*
        This function gets the usernames of all
        of the current user's friends and sends them
        to the client.
    */
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
    /*
        This function responds to a get request to get
        all direct messages by a specified recipient
        parameter in req params.
    */
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
    /*
        This function responds to the post request to
        create a new direct message.
    */
    let userIn = req.cookies.login.username;
    let timeIn = req.body.time;
    let recipientIn = req.body.recipient;
    let messageIn = req.body.message;

    res.end('Got request to post the DM!');

    let newDM = new DirectMessage({time: timeIn, user: userIn, recipient: recipientIn, message: messageIn});
    return newDM.save();
});


app.get("/app/customBoringAvatar", async (req, res) => {
    /*
        This function responds to a get request using the source.boringavatars API
        to create an avatar based on specified type and colors in the
        create avatar section of update profile, and sends the avatar url.
    */
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

app.post('/add/comment', function(req, res) {
    /*
        This function responds to a post request to add
        a comment to the post specified in the body of the request.
    */

    let postId = req.body.postId;
    let userCommenting = req.body.username;
    let commentIn = req.body.comment;

    let p1 = Post.findById(postId).exec();
    p1.then((post) => {
        if (!post){
            res.status(404).end('No post exists');
            return;
        }

        let newComment = new Comment({
            username: userCommenting, 
            content: commentIn
        })

        return newComment.save().then((savedComment) => {
            post.comments.push(savedComment._id);

            return post.save();
        });
    })
    .then(() => {
        res.status(200).end('Comment added successfully!');
    })
    .catch((error) => {
        console.error(error);
        res.status(500).end('Error adding comment');
    });
});

app.get('/app/getUserCounts/:USERNAME', async (req, res) => {
    /*
        This function responds to a get request to send to the
        client the number of friends, number of posts, and gender
        of the current user for the home page.
    */
    try {
        let username = req.params.USERNAME;
    
        const user = await User.findOne({'username': username }).populate('friends').exec();
        const postsCount = await Post.countDocuments({ username }).exec();
    
        const userDetails = {
          postsCount,
          friendsCount: user.friends.length,
          gender: user.gender,
        };
    
        res.json(userDetails);
    } catch (error) {
        console.error(error);
    }
})


app.listen(port, () =>
console.log(
    `Example app listening at http://127.0.0.1:${port}` // Change this ip address
));