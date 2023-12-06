/*
Name: 337Chat Group: Seth, Mustafa, Musa, Kat
Final Project

This code is the client side JavaScript code for the pages
within the 337chat web app. The code contains 
a large variety of functions, that allow for interaction of
users with the social media app, mostly using fetch API
to make requests to the server.
*/

function addUser() {
    /*
        This function sends a post request to the server
        to create a new user with the information in specified
        username and password fields.
    */

    let username = document.getElementById('usernameCreate');
    let password = document.getElementById('passwordCreate');

    let inputObject = {username : username.value, password : password.value};
    
    let p = fetch('http://127.0.0.1/add/user/', { // change ip address
        method: 'POST',
        body: JSON.stringify(inputObject),
        headers: { 'Content-Type': 'application/json'}
    });
    p.then((response) => {
        return response.text();
      }).then((text) => {
        //alert(text);
        console.log(text);
      });
    
    username.value = "";
    password.value = "";
}

function login() {
    /*
        This function sends a post request to the server
        containing the username and password in the login fields,
        redirecting the page to home if the login is successful.
    */

    let us = document.getElementById('usernameLogin');
    let pw = document.getElementById('passwordLogin');
    let errorText = document.getElementById('loginError');
    let gapText = document.getElementById('loginErrorGap');
    errorText.innerText = "";
    gapText.innerText = "";

    let data = {username: us.value, password: pw.value};
    let p = fetch( '/account/login/', {
      method: 'POST', 
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"}
    });
    p.then((response) => {
      return response.text();
    }).then((text) => {
      console.log(text);
      if (text.startsWith('SUCCESS')) {
        window.location.href = './app/home.html';
      } else {
        errorText.innerText = "There was an issue logging in with that info...";
        gapText.innerText = ".";
        us.value = "";
        pw.value = "";
      }
    });
  }

function logout() {
    /*
        This function sends a post request to logout
        the current user.
    */
    let url = "/logout";
    fetch(url, 
        {
            method: "POST"
        })
    window.location.href = window.location.origin;
}

function getCurrUser() {
    /*
        This function sends a get
        request to the server to get the username
        of the current user.
    */
    let url = '/app/getUsername';
    let p = fetch(url);
    p.then((response) => {
        let p1 = response.text();
        p1.then((text) => {
            return text;
        })
    })
    .catch((error)=> {
        console.log(error);
    })
}

function fetchUserInfo() {
    /*
        This function sends a get request to the server to get the
        username and gender of the current user.
    */
    fetch('/app/userInfo')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(user => {
        document.getElementById('username').innerHTML = `<h3>Username: ${user.username}</h3>`;
        document.getElementById('gender').innerHTML = `<h3>Gender: ${user.gender || 'Not set'}</h3>`;
    })
    .catch(err => console.error("Error fetching user info:", err));
}

function setProfilePic() {
    /*
        This function uses a post request to the server to send
        a new form request object containing the specified avatar,
        setting this avatar as the users new avatar.
    */
    document.getElementById("imgStatus").innerText = "";
    if (document.getElementById("img").files.length == 0) {
        document.getElementById("imgStatus").innerText = "Cannot leave field empty";
    }
    else {
        let formData = new FormData();
        formData.append("img", document.getElementById("img").files[0]);
        let url = "/app/avatar";
        fetch(url,
            {
                method: "POST",
                body: formData
            })
        .then( (response) => {
            document.getElementById("img").value = "";
            setTimeout(fetchProfilePic, 200);
        })
    }
}


function displayPostPreview() {
    /*
        This function displays the image for a post in post.html
        before the post is uploaded as a post
        using a new filereader object.
    */
    let fileInput = document.getElementById('postImg');
    let imagePreview = document.getElementById('postImgArea');
    let imageStatus = document.getElementById('imgStatus');
  
    if (fileInput.files.length > 0) {
      imageStatus.innerText = '';
      const reader = new FileReader();
  
      reader.onload = function (e) {
        let postPrevHtml = `<img src="${e.target.result}" alt="Post Preview" width="300px" height="300px" id="postImgPreview">`;
  
        imagePreview.innerHTML = '';
        imagePreview.innerHTML = postPrevHtml;
      };

      reader.readAsDataURL(fileInput.files[0]);
    } else {
      imagePreview.innerHTML = '';
      imageStatus.innerText = 'No Image Selected';
    }
  }

function setPostPic() {
    /*
        This function uses a new form data object to send a new get
        request to the server, posting the time, caption, image, and user
        posting a new image, creating a new Post object in the server.
    */
    document.getElementById("imgStatus").innerText = "";
    let caption = document.getElementById("captionBox").value;
    let currTime = Date.now();

    if (document.getElementById("postImg").files.length == 0) {
        
        let formDataNoImg = new FormData();
        formDataNoImg.append("caption", caption);
        formDataNoImg.append("currTime", currTime);
        let url = "/app/addPostNoImage";
        fetch(url,
            {
                method: "POST",
                body: formDataNoImg
            })
        .then( (response) => {
            document.getElementById("postImg").value = "";
        })
    } else {
        let formData = new FormData();
        formData.append("image", document.getElementById("postImg").files[0]);
        formData.append("caption", caption);
        formData.append("currTime", currTime);
        let url = "/app/addPostImage";
        fetch(url,
            {
                method: "POST",
                body: formData
            })
        .then( (response) => {
            document.getElementById("postImg").value = "";
        })
    }
    setTimeout(function(){
        window.location.href = '/app/home.html';
    }, 500);
}

function removeProfilePic() {
    /*
        This function sends a get request to the server
        to remove the current users current profile picture.
    */
    document.getElementById("img").value = "";
    let formData = new FormData();
    formData.append("img", document.getElementById("img").files[0]);
    let url = "/app/avatar";
    fetch(url,
        {
            method: "POST",
            body: formData
        })
    .then( (response) => {
        setTimeout(fetchProfilePic, 200);
    })
}


function updateProfile() {
    /*
        This function sends a post request to the user to update
        the user's profile with new information from update_profile.html.
    */
    const gender = document.getElementById('gender').value;

    fetch('/app/updateProfile', {
        method: 'POST',
        body: JSON.stringify({ gender }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Profile update failed');
        return response.text();
    })
    .then(result => {
        console.log(result);
        alert("Profile updated successfully");
        window.location.href = '/app/home.html'; // Redirect to home page
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Error updating profile");
    });
}



function goHome() { //return to homepage
    window.location.href = window.location.origin + "/app/home.html";
}

function changeProfile() { //open update profile
    window.location.href = window.location.origin + "/app/update_profile.html";
}

function getFriends() {
    /*
        This function sends a get request to the server
        to get all friends of the current user.
    */
    let url = "/app/getFriends";
    fetch(url)
    .then( (response) => {
        return response.json();
    })
    .then( (response) => {
        for (i in response) {
            let url = "/app/getInfo/" + response[i];
            fetch(url)
            .then( (response) => {
                return response.json();
            })
            .then( (response) => {
                console.log(response);
            })
        }
    })
}

function getCookieValue(cookieName) {
    /*
        This function gets the value of a specified cookie
        name by searching through the current cookies that exist.
    */
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      
      if (name === cookieName) {
        let decodedValue = decodeURIComponent(value);
        
        if (decodedValue.startsWith('j:')) {
          decodedValue = decodedValue.substring(2);
        }
        try {
          const jsonValue = JSON.parse(decodedValue);
  
          if (jsonValue && jsonValue.username) {
            return jsonValue.username;
          } else {
            return null;
          }
        } catch (error) {
          console.error('Error parsing JSON from cookie:', error);
          return null;
        }
      }
    }
    return null;
}

function addComment(postIdIn, usernameIn){
    /*
        This function sends a post request to create a new comment on a specified
        post, sending this request to the server.
    */
    let commentArea = document.getElementById(postIdIn);
    let commentIn = "";
    if (commentIn == null){
        alert('comment can not be null');
        return;
    } else {
        commentIn = commentArea.value;
    }

    let inputObject = {username : usernameIn, comment: commentIn, postId: postIdIn};
    
    let p = fetch('/add/comment/', { 
        method: 'POST',
        body: JSON.stringify(inputObject),
        headers: { 'Content-Type': 'application/json'}
    });
    p.then((response) => {
        return response.text();
      }).then((text) => {
        console.log(text);
      });
    
    commentArea.value = "";
    alert('Comment Added!');
    location.reload();
}

function searchUsers() {  
    /* 
        This function can send two types of get requests to the user,
        one searching for users, another searching for posts, and displays
        the respective search results on the search.html page.
    */
    let username = document.getElementById('searchBox').value;
    let type = document.getElementById('searchType').value;
    let url = '/app/search/' + type + "/" + username;

    fetch(url)
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            let information = JSON.parse(text);
            let element = document.getElementById('searchResults');
            element.innerHTML = "";
            if (type == 'Users'){
                let string = '';
                let flag = 0;
                let username = getCookieValue('login');
                for(let i = 0; i < information.length; i++){

                    if (information[i].username != username){
                        let avatar1 = information[i].avatar;
                        let avatarPath = "";

                        if (typeof avatar1 == 'undefined') {
                            console.log('undefined');
                            avatarPath = `<div class="avatarDisplay"><img src='../img/default.jpg' alt='Default Profile Picture' width='45px' height='45px'></div>`;
                        } else if (avatar1.startsWith("http")) {
                            // If the path is a full URL, use it directly
                            avatarPath = `<div class="avatarDisplay"><img src="${avatar1}" alt="Profile Picture" width="45px" height="45px"></div>`;
                        } else if (avatar1 !== "") {
                            // If it's a local path, prepend the necessary directory
                            avatarPath = `<div class="avatarDisplay"><img src="../img/${avatar1}" alt="Profile Picture" width="45px" height="45px"></div>`;
                        } else {
                            // Default avatar if no path is provided
                            avatarPath = `<div class="avatarDisplay"><img src='../img/default.jpg' alt='Default Profile Picture' width='45px' height='45px'></div>`;
                        }

                        string += '<div class="outerUserSearchArea">'+ avatarPath +'<div class="usernameSearch">' + information[i].username + '</div>';

                        console.log(information[i].username, "USERNAME")
                        console.log(information[i].outgoingRequests, "OUTGOING")
                        console.log(information[i].comingRequests, "COMING")
                        console.log();

                        for(let j = 0; j < information[i].comingRequests.length; j++){
                            if(information[i].comingRequests[j].username == username) {
                                string += '<p class="statusP">Waiting For Response</p></div>';
                                flag = 1;
                            }
                        }
                        for(let j = 0; j < information[i].outgoingRequests.length; j++){
                            if(information[i].outgoingRequests[j].username == username) {
                                string += '<p class="statusP" >Request Recieved</p></div>';
                                flag = 1;
                            }
                        }
                        for(let j = 0; j < information[i].friends.length; j++){
                            if(information[i].friends[j].username == username) {
                                string += '<p class="statusP" >Already Friends</p></div>';
                                flag = 1;
                            }
                        } 
                        if(username == information[i].username){
                            flag = 1;
                        }
                        if(flag == 0) {
                            console.log("ADD")
                            string += `<div id="requestButton" class="friendReqButton"><input type="button" id="${information[i]._id}" value="Send Friend Request" onclick="sendFriendRequest('${information[i].username}')"></div></div>`
                        }
                        
                        element.innerHTML = string;
                        flag = 0;
                    }
                }
            } else {
                let string = '';
                let username = getCookieValue('login');

                for(let i = 0; i < information.length; i++){
                    let postUsername = information[i].username;
                    let comments = information[i].comments;
                    let caption = information[i].content;
                    let image = information[i].image;
                    let postId =information[i]._id;

                    if (username != postUsername){
                        let commentString = '';
                        for (let j = 0; j < comments.length; j++){
                            commentString += `<div class="indCommentDisplay">`+ `<div class="commentsUserDisplay">` + comments[j].username + ' ' +`</div>` + `<div class="commentsContentDisplay">` + comments[j].content + `</div></div>`;
                        }

                        let htmlString = '';


                        let addCommentSection = `<input type="text" class="commentText" id="`+ postId +`" name="commentText">`;

                        addCommentSection += `<input type="button" class="commentButton" value="Add Comment" onclick="addComment(\'` + postId + `\', \'` + username + `\');">`;
                        
                        if (typeof image == 'undefined') {
                            console.log('undefined');
                            htmlString += `<div class="postDisplay"><div class="postUsernameDisplay">`+ 
                            postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                            caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                            commentString +`</div>`+ addCommentSection +`</div>`;
                        } else if (image.startsWith("http")) {
                            // If the path is a full URL, use it directly
                            htmlString += `<div class="postDisplay"><div class="postImgDisplayDiv"><img src="${image}" alt="Post Picture" width="300px" height="300px" class="postSearchImage"></div><div class="postUsernameDisplay">`+ 
                            postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                            caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                            commentString +`</div>`+ addCommentSection +`</div>`;
                        } else if (image !== "") {
                            // If it's a local path, prepend the necessary directory
                            htmlString += `<div class="postDisplay"><div class="postImgDisplayDiv"><img src="../img/${image}" alt="Post Picture" width="300px" height="300px" class="postSearchImage"></div><div class="postUsernameDisplay">`+ 
                            postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                            caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                            commentString +`</div>`+ addCommentSection +`</div>`;
                        } else {
                            // Default avatar if no path is provided
                            htmlString += `<div class="postDisplay"><div class="postUsernameDisplay">`+ 
                            postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                            caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                            commentString +`</div>`+ addCommentSection +`</div>`;
                        }

                        element.innerHTML += htmlString;
                    }
                }
            }
            
        }).catch((error) => {
            console.log("searching problem");
            console.log(error);
        })
}

function sendFriendRequest(username) {
    /* 
        This function sends a get request to the server which
        sends a friend request to a specified user.
    */
    let url = '/app/friendRequest/' + username
    fetch(url).then((response) =>{
        return response.text();
    }).then((text) => {
        if(text == 'Success'){
            document.getElementById('requestButton').innerHTML = 'Sent'
            window.location.href = './friends.html'
        }
        else {
            alert(text)
        }
    }).catch((error) =>{
        console.log('client send request error');
        console.log(error)
    })
}

function addFriend(username) {
    /*
        This function sends a get request to the server that
        indicates the adding of a specified user.
    */
    let url = '/app/addFriend/' + username;

    fetch(url)
        .then((response) => {
            return response.text()
        })
        .then((text) => {
            window.location.href = './friends.html'
        }).catch((error) => {
            console.log(error)
        })
}

function displayFriends() {
    /*
        This function sends a get request to the server to get
        all friends and friend requests to the server, placing
        these in html of the friends.html page.
    */
    let url = '/app/get/friends';
    fetch(url)
        .then((response) => {
            console.log(response)
            return response.json();
        })
        .then((information) => {
            let friends = document.getElementById('friends');
            let friendRequests = document.getElementById('friendRequests');
            console.log(information);
            
            let friendString = '';
            let requestString = '';

            for(let i = 0; i < information.friends.length; i++){
                let avatar = information.friends[i].avatar;
                let avatarPath = "";

                if(typeof avatar == 'undefined'){
                    avatarPath = `<div class="avatarDisplay"><img src='../img/default.jpg' alt='Default Profile Picture' width='45px' height='45px'></div>`;
                } else if (avatar.startsWith("http")) {
                    // If the path is a full URL, use it directly
                    avatarPath = `<div class="avatarDisplay"><img src="${avatar}" alt="Profile Picture" width="45px" height="45px"></div>`;
                } else if (avatar !== "") {
                    // If it's a local path, prepend the necessary directory
                    avatarPath = `<div class="avatarDisplay"><img src="../img/${avatar}" alt="Profile Picture" width="45px" height="45px"></div>`;
                } else {
                    // Default avatar if no path is provided
                    avatarPath = `<div class="avatarDisplay"><img src='../img/default.jpg' alt='Default Profile Picture' width='45px' height='45px'></div>`;
                }

                friendString += '<div class="displayFriendsOutConsole">'+ avatarPath +'<div class="displayFriendsText">' + information.friends[i].username + '</div></div>';
            }
            for(let i= 0; i < information.comingRequests.length; i++) {

                let avatar = information.comingRequests[i].avatar;
                let avatarPath = "";

                if(typeof avatar == 'undefined'){
                    avatarPath = `<div class="avatarDisplay"><img src='../img/default.jpg' alt='Default Profile Picture' width='45px' height='45px'></div>`;
                } else if (avatar.startsWith("http")) {
                    // If the path is a full URL, use it directly
                    avatarPath = `<div class="avatarDisplay"><img src="${avatar}" alt="Profile Picture" width="45px" height="45px"></div>`;
                } else if (avatar !== "") {
                    // If it's a local path, prepend the necessary directory
                    avatarPath = `<div class="avatarDisplay"><img src="../img/${avatar}" alt="Profile Picture" width="45px" height="45px"></div>`;
                } else {
                    // Default avatar if no path is provided
                    avatarPath = `<div class="avatarDisplay"><img src='../img/default.jpg' alt='Default Profile Picture' width='45px' height='45px'></div>`;
                }

                requestString += '<div class="displayFriendReqOutConsole">'+ avatarPath +'<div class="displayFriendRequestText">' + information.comingRequests[i].username + '</div>' + `<div><input class="acceptFriendButton" type="button" id="${information.comingRequests[i]._id}" value="Add Friend" onclick="addFriend('${information.comingRequests[i].username}')"></div></div>`;
            }

            friends.innerHTML = friendString;
            friendRequests.innerHTML = requestString;

        }).catch((error) => {
            console.log(error)
        })
}

function setDmDropdown() {
    /*
        This function sends a get request to the server to get a list
        of the current user's friends, then places these in the dropdown
        of dm.html's user dropdown.
    */
    let dropdown = document.getElementById('selectUserDm');
    let username = getCookieValue('login');
    let dropdownString = '';

    let url = "/app/getFriendsUsernames";

    let p = fetch(url)

    p.then((response) => {
        return response.json();
    })
    .then( (friendUsernames => {
        dropdownString = '<option value="null" selected>Choose a Friend to Chat!</option>'
        for (let i=0; i<friendUsernames.length;i++){
            dropdownString += '<option value="' + friendUsernames[i] + '">' + friendUsernames[i] +'</option>';
        }
        dropdown.innerHTML = dropdownString;
    }))
    .catch(error => {
        console.error('Error fetching friend usernames:', error);
    });
}

function getDms() {
    /*
        This function sends a get request to the server to 
        get all dms of specified recipient and current user,
        and displays those DMS in html on dm.html.
    */
    let recipientIn = document.getElementById('selectUserDm');
    let chatArea = document.getElementById('chatAreaDm');

    if (recipientIn.value != "null"){
        let url = '/app/getDms/' + recipientIn.value;
        let p = fetch(url);
        p.then((response) => {
            if(response.redirected) {
                window.location.href = response.url;
            } else {
                let p1 = response.text();
                p1.then((text) => {
                    let jsonObj = JSON.parse(text);
                    let htmlString = "";

                    let sortedDocs = [];
                    let lastTime = 0
                    for (let i=0; i < jsonObj.length; i++) {
                        let item = jsonObj[i];
                        let time = item['time'];
                        let user = item['user'];
                        let message = item['message'];

                        if (time > lastTime){
                            lastTime = time;
                            sortedDocs.push(item);
                        } else {
                            sortedDocs = [item].concat(sortedDocs);
                        }
                    }

                    for (let j = 0; j < sortedDocs.length; j++) {
                        let item = sortedDocs[j];
                        let time = item['time'];
                        let user = item['user'];
                        let message = item['message'];

                        let addHtml = "<div class='dmDiv'>" + "<p class='dmChat' >" +
                                    "<p class='dmChatUser' >" + user + ": " + "</p>" +
                                    message + "</p>" + "</div>";
                        
                        htmlString += addHtml;
                    }

                    chatArea.innerHTML = htmlString;
                })
            }
        });
    }
    
}

function postDm() {
    /*
        This function sends a post request to the server to create
        a new DM between the current user and selected recipient.
    */
    let recipientIn = document.getElementById('selectUserDm');
    let messageIn = document.getElementById('messageBox');
    let currTime = Date.now();
    let chatArea = document.getElementById('chatAreaDm');

    if (recipientIn.value == "null"){
        let htmlString = "<div class='dmDiv' >" + "<p class='dmChat' >" +
        "<p class='dmChatUser' >" + "337ChatBot" + ": " + "</p>" +
        "Welcome to direct messages!" + "</p>" + "</div>" + "<div class='dmDiv' >" + "<p class='dmChat' >" +
        "<p class='dmChatUser' >" + "337ChatBot" + ": " + "</p>" +
        "Sorry, you cannot chat with me :) - switch who to DM above!" + "</p>" + "</div>";

        chatArea.innerHTML = htmlString;

    } else {
        let inputObject = {time: currTime, recipient: recipientIn.value, message: messageIn.value};

        let p = fetch('/app/dms/post', { // change localhost here
            method: 'POST',
            body: JSON.stringify(inputObject),
            headers: { 'Content-Type': 'application/json'}
        });
        p.then((response) => {
            return response.text();
        }).then((text) => {
            console.log(text);
        });
    }

    messageIn.value = "";
}

function search() { // change page to search.html
    window.location.href = '/app/search.html';
}

function directMessagePage() { // change page to dm.html
    window.location.href = '/app/dm.html';
}

function goFriends() { // change page to friends.html
    window.location.href = '/app/friends.html';
}

function goPost() { // change page to post.html
    window.location.href = '/app/post.html';
}

function goUpdate() { // change page to update_profile.html
    window.location.href = '/app/update_profile.html';
}

function goHelp() { // changes page to help.html
    window.location.href = '/app/help.html';
}

function updateUsernameHome() {
    /*
        This function updates the username displayed
        on home.html to the current user's username.
    */
    let userArea = document.getElementById("username");

    let username = getCookieValue('login');

    let htmlString = `<h3>Username:` + username + `</h3>`;

    userArea.innerHTML = htmlString;
}

let currUser = "";

window.addEventListener('DOMContentLoaded', function() {
    // Use this as 'on new page load, if page is ___ do something
    let currentPath = window.location.pathname;

    if (currentPath == '/app/dm.html'){
        // Here is where you would call funct to change the values of the dropdown to names of friends
        console.log('refreshing dms');
        this.window.setInterval(getDms, 1000);
    }
});

function fetchProfilePic() {
    /*
        This function sends a get request to the server,
        receiving the avatar image string, and displaying the
        image properly embedded within html.
    */
    document.getElementById("avatar").innerHTML = "";
    let url = "/app/getProfilePic";
    fetch(url)
    .then(response => response.text())
    .then(avatarPath => {
        if (avatarPath.startsWith("http")) {
            // If the path is a full URL, use it directly
            document.getElementById("avatar").innerHTML = `<img src="${avatarPath}" alt="Profile Picture" width="450px" height="450px">`;
        } else if (avatarPath !== "") {
            // If it's a local path, prepend the necessary directory
            document.getElementById("avatar").innerHTML = `<img src="../img/${avatarPath}" alt="Profile Picture" width="450px" height="450px">`;
        } else {
            // Default avatar if no path is provided
            document.getElementById("avatar").innerHTML = "<img src='../img/default.jpg' alt='Default Profile Picture' width='450px' height='450px'>";
        }
    })
    .catch(error => {
        console.error("Error fetching profile picture:", error);
        document.getElementById("avatar").innerHTML = "<p>Error fetching avatar. Please try again later.</p>";
    });
}



function createCustomBoringAvatar() {
    /*
        This function sends a get request to the server
        to create a custom 'boring avatar' through the API and specified
        variant and colors.
    */
    const variant = document.getElementById('avatarVariant').value;
    const colors = [
        document.getElementById('color1').value.substring(1),
        document.getElementById('color2').value.substring(1),
        document.getElementById('color3').value.substring(1),
        document.getElementById('color4').value.substring(1),
        document.getElementById('color5').value.substring(1)
    ].join(',');

    fetch(`/app/customBoringAvatar?variant=${variant}&colors=${colors}`)
    .then(response => response.json())
    .then(data => {
        if (data.avatarUrl) {
            document.getElementById("avatar").innerHTML = `<img src="${data.avatarUrl}" alt="Boring Avatar" width="450px" height="450px">`;
            alert("Custom Boring Avatar created successfully");
        } else {
            alert("Failed to create Custom Boring Avatar");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error creating Custom Boring Avatar");
    });
}

function displayMyPosts(){
    /*
        This function sends a get request to the server to
        get all posts of the current user and display them on
        home.html by creating html.
    */
    let username = getCookieValue('login');

    let url = '/app/getMyPosts/' + username

    let p = fetch(url)
    p.then((response) => {
        return response.text();
    })
    .then((text) => {
        let information = JSON.parse(text);
        let element = document.getElementById("myPostsInnerArea");
        element.innerHTML = "";

        for(let i = 0; i < information.length; i++){
            let postUsername = information[i].username;
            let image = information[i].image;
            let caption = information[i].content;
            let comments = information[i].comments;
            let postId = information[i]._id;
            let username = getCookieValue('login');


            let commentString = '';
            for (let j = 0; j < comments.length; j++){
                commentString += `<div class="indCommentDisplay">`+ `<div class="commentsUserDisplay">` + comments[j].username + ' ' +`</div>` + `<div class="commentsContentDisplay">` + comments[j].content + `</div></div>`;
            }

            let htmlString = '';

            let addCommentSection = `<input type="text" class="commentText" id="`+ postId +`" name="commentText">`;

            addCommentSection += `<input type="button" class="commentButton" value="Add Comment" onclick="addComment(\'` + postId + `\', \'` + username + `\');">`;
            
            if (typeof image == 'undefined') {
                console.log('undefined');
                htmlString += `<div class="postDisplay"><div class="postUsernameDisplay">`+ 
                postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                commentString +`</div>`+ addCommentSection +`</div>`;
            } else if (image.startsWith("http")) {
                // If the path is a full URL, use it directly
                htmlString += `<div class="postDisplay"><div class="postImgDisplayDiv"><img src="${image}" alt="Post Picture" width="300px" height="300px" class="postSearchImage"></div><div class="postUsernameDisplay">`+ 
                postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                commentString +`</div>`+ addCommentSection +`</div>`;
            } else if (image !== "") {
                // If it's a local path, prepend the necessary directory
                htmlString += `<div class="postDisplay"><div class="postImgDisplayDiv"><img src="../img/${image}" alt="Post Picture" width="300px" height="300px" class="postSearchImage"></div><div class="postUsernameDisplay">`+ 
                postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                commentString +`</div>`+ addCommentSection +`</div>`;
            } else {
                // Default avatar if no path is provided
                htmlString += `<div class="postDisplay"><div class="postUsernameDisplay">`+ 
                postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                commentString +`</div>`+ addCommentSection +`</div>`;
            }
            
            element.innerHTML += htmlString;
        }
    })
    .catch((error) => {
        console.log("error finding myPosts");
        console.log(error);
    })
}


function displayFriendsPosts(){
    /*
        This function sends a get request to the server to get
        all posts of friends of the current user and display them
        in home.html by building up html code.
    */

    let username = getCookieValue('login');

    let url = '/app/getFriendsPosts/' + username

    let p = fetch(url)
    p.then((response) => {
        return response.text();
    })
    .then((text) => {
        let information = JSON.parse(text);
        let element = document.getElementById("friendPostsInnerArea");
        element.innerHTML = "";

        for(let i = 0; i < information.length; i++){
            let postUsername = information[i].username;
            let image = information[i].image;
            let caption = information[i].content;
            let comments = information[i].comments;
            let postId = information[i]._id;
            let username = getCookieValue('login');

            let commentString = '';
            for (let j = 0; j < comments.length; j++){
                commentString += `<div class="indCommentDisplay">`+ `<div class="commentsUserDisplay">` + comments[j].username + ' ' +`</div>` + `<div class="commentsContentDisplay">` + comments[j].content + `</div></div>`;
            }

            let htmlString = '';

            let addCommentSection = `<input type="text" class="commentText" id="`+ postId +`" name="commentText">`;

            addCommentSection += `<input type="button" class="commentButton" value="Add Comment" onclick="addComment(\'` + postId + `\', \'` + username + `\');">`;
            
            if (typeof image == 'undefined') {
                console.log('undefined');
                htmlString += `<div class="postDisplay"><div class="postUsernameDisplay">`+ 
                postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                commentString +`</div>`+ addCommentSection +`</div>`;
            } else if (image.startsWith("http")) {
                // If the path is a full URL, use it directly
                htmlString += `<div class="postDisplay"><div class="postImgDisplayDiv"><img src="${image}" alt="Post Picture" width="300px" height="300px" class="postSearchImage"></div><div class="postUsernameDisplay">`+ 
                postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                commentString +`</div>`+ addCommentSection +`</div>`;
            } else if (image !== "") {
                // If it's a local path, prepend the necessary directory
                htmlString += `<div class="postDisplay"><div class="postImgDisplayDiv"><img src="../img/${image}" alt="Post Picture" width="300px" height="300px" class="postSearchImage"></div><div class="postUsernameDisplay">`+ 
                postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                commentString +`</div>`+ addCommentSection +`</div>`;
            } else {
                // Default avatar if no path is provided
                htmlString += `<div class="postDisplay"><div class="postUsernameDisplay">`+ 
                postUsername + ' ' +`</div><div class="postCaptionDisplay">`+ 
                caption +`</div><div class="commentsDisplayLabel">Comments: </div><div class="postCommentsDisplay">`+ 
                commentString +`</div>`+ addCommentSection +`</div>`;
            }
            
            element.innerHTML += htmlString;
        }
    })
    .catch((error) => {
        console.log("error finding myPosts");
        console.log(error);
    })
}

function updateUserInfo() {
    /*
        This function sends a get request to the server to get
        current user information, displaying this info in the
        profile section of the home.html page.
    */
    let username = getCookieValue('login');

    let url = '/app/getUserCounts/' + username;

    let p = fetch(url);
    p.then((response) => {
        return response.text();
    })
    .then((text) => {

        let information = JSON.parse(text);

        let genderIn = information.gender;
        let postCount = information.postsCount;
        let friendsCount = information.friendsCount;

        console.lo

        let genderArea = document.getElementById("gender");
        let postsArea = document.getElementById("postCount");
        let friendsArea = document.getElementById("friendCount");

        let genderString = `<h3>Gender: ` + genderIn + `</h3>`;
        let postsString = `<h3>Posts: ` + postCount + " " + `Post(s)</h3>`;
        let friendsString = `<h3>Friends: ` + friendsCount + " " + `Friend(s)</h3>`;

        genderArea.innerHTML = genderString;
        postsArea.innerHTML = postsString;
        friendsArea.innerHTML = friendsString;
    })
}

