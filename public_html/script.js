function addUser() {

    let username = document.getElementById('usernameCreate');
    let password = document.getElementById('passwordCreate');
    //let errorText = document.getElementById('loginError');
    //errorText.innerText = "";

    // CREATE AVATAR FUNCTION??

    // This will need to change to salt and hash, put in avatar, etc.
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

    let us = document.getElementById('usernameLogin');
    let pw = document.getElementById('passwordLogin');
    let errorText = document.getElementById('loginError');
    let gapText = document.getElementById('loginErrorGap');
    errorText.innerText = "";
    gapText.innerText = "";

    // change to implement hashing/salting
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
    let url = "/logout";
    fetch(url, 
        {
            method: "POST"
        })
    window.location.href = window.location.origin;
}

function getCurrUser() {
    console.log('getting curr user');
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
    document.getElementById("imgStatus").innerText = ""; ///html reference, html needed
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
    console.log('setting post picture');
    document.getElementById("imgStatus").innerText = "";
    let caption = document.getElementById("captionBox").value;
    console.log('caption: ', caption);
    let currTime = Date.now();

    if (document.getElementById("postImg").files.length == 0) {
        document.getElementById("imgStatus").innerText = "Cannot leave field empty";
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
    document.getElementById("img").value = ""; ///html reference, html needed
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
    let url = "/app/getFriends";
    fetch(url)
    .then( (response) => {
        return response.json(); //return the json and get the array of friends in the next block
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
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      
      if (name === cookieName) {
        let decodedValue = decodeURIComponent(value);
        
        // Handle the "j:" prefix
        if (decodedValue.startsWith('j:')) {
          decodedValue = decodedValue.substring(2);
        }
        try {
          const jsonValue = JSON.parse(decodedValue);
  
          if (jsonValue && jsonValue.username) {
            return jsonValue.username;
          } else {
            return null; // Username not found in the JSON or JSON is invalid
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
    console.log('called add comment');
    let commentArea = document.getElementById(postIdIn);
    let commentIn = "";
    if (commentIn == null){
        alert('comment can not be null');
        return;
    } else {
        commentIn = commentArea.value;
    }

    console.log('commentIn: ', commentIn);

    let inputObject = {username : usernameIn, comment: commentIn, postId: postIdIn};
    
    let p = fetch('/add/comment/', { // change ip address
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
                //let username = JSON.parse(decodeURIComponent(document.cookie).replace("login=j:", '')).username;
                for(let i = 0; i < information.length; i++){
                    console.log('username check: ');
                    console.log(information[i].username);
                    console.log(username);

                    if (information[i].username != username){
                        let avatar1 = information[i].avatar;
                        console.log(avatar1);
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
                            //console.log(information[i].comingRequests[j].username == username);
                            if(information[i].comingRequests[j].username == username) {
                                string += '<p class="statusP">Waiting For Response</p></div>';
                                console.log('1')
                                flag = 1;
                            }
                        }
                        for(let j = 0; j < information[i].outgoingRequests.length; j++){
                            if(information[i].outgoingRequests[j].username == username) {
                                string += '<p class="statusP" >Request Recieved</p></div>';
                                console.log('2')
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

                    console.log('info check: ', information[i]);

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

                    

                    // ready for similar implementation to putting in image as above,
                    // create a post html type thing and put it within the section,
                    // display all, and we are all set

                    // maybe check that the username does not equal the posts username

                    // eventually only show friends posts??
                }

            }
            
        }).catch((error) => {
            console.log("searching problem");
            console.log(error);
        })
}

function sendFriendRequest(username) {
    let url = '/app/friendRequest/' + username
    fetch(url).then((response) =>{
        return response.text();
    }).then((text) => {
        if(text == 'Success'){
            console.log("reached")
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
    let url = '/app/get/friends';
    console.log('1');
    fetch(url)
        .then((response) => {
            console.log('2');
            console.log(response)
            return response.json();
        })
        .then((information) => {
            console.log('3');
            let friends = document.getElementById('friends');
            let friendRequests = document.getElementById('friendRequests');
            console.log(information);
            
            let friendString = '';
            let requestString = '';

            for(let i = 0; i < information.friends.length; i++){
                console.log(information.friends[i].username);
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
                console.log(information.comingRequests[i]._id);

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

                requestString += '<div class="displayFriendReqOutConsole">'+ avatarPath +'<div class="displayFriendRequestText">' + information.comingRequests[i].username + '</div>' + `<div><input class="acceptFriendButton" type="button" id="${information.comingRequests[i]._id}" value="Add Friend" onclick="addFriend('${information.comingRequests[i].username}')"></div></div>`
                
                //'<div><input type="button" id="' + information[i]._id +'" value="Accept Friend" onclick="addFriend("'+ information[i].username+ '");></div>'
                //`</div><div><input type="button" id="${information[i]._id}" value="Accept Friend Request" onclick="addFriend('${information[i].username}')"></div>`;
            }

            friends.innerHTML = friendString
            friendRequests.innerHTML = requestString
            

        }).catch((error) => {
            console.log(error)
        })
}

function setDmDropdown() {
    let dropdown = document.getElementById('selectUserDm');
    let username = getCookieValue('login');
    let dropdownString = '';

    let url = "/app/getFriendsUsernames";

    let p = fetch(url)

    p.then((response) => {
        return response.json();
    })
    .then( (friendUsernames => {
        console.log('Friend Usernames: ', friendUsernames);
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

function search() {
    window.location.href = '/app/search.html';
}

function directMessagePage() {
    window.location.href = '/app/dm.html';
}

function goFriends() {
    window.location.href = '/app/friends.html';
}

function goPost() {
    window.location.href = '/app/post.html';
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




