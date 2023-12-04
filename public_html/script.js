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
            let string = '';
            let flag = 0;
            let username = getCookieValue('login');
            //let username = JSON.parse(decodeURIComponent(document.cookie).replace("login=j:", '')).username;
            for(let i = 0; i < information.length; i++){
                console.log('username check: ');
                console.log(information[i].username);
                console.log(username);

                if (information[i].username != username){
                    string += '<div class="outerUserSearchArea"><div class="usernameSearch">' + information[i].username + '</div>';

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
            let friendString = '';
            let requestString = '';
            for(let i = 0; i < information.friends.length; i++){
                console.log(information.friends[i].username)
                friendString += '<div class="displayFriendsOutConsole"><div class="displayFriendsText">' + information.friends[i].username + '</div></div>';
            }
            for(let i= 0; i < information.comingRequests.length; i++) {
                console.log(information.comingRequests[i]._id)
                requestString += '<div class="displayFriendReqOutConsole"><div class="displayFriendRequestText">' + information.comingRequests[i].username + '</div>' + `<div><input class="acceptFriendButton" type="button" id="${information.comingRequests[i]._id}" value="Add Friend" onclick="addFriend('${information.comingRequests[i].username}')"></div></div>`
                
                //'<div><input type="button" id="' + information[i]._id +'" value="Accept Friend" onclick="addFriend("'+ information[i].username+ '");></div>'
                //`</div><div><input type="button" id="${information[i]._id}" value="Accept Friend Request" onclick="addFriend('${information[i].username}')"></div>`;
            }

            friends.innerHTML = friendString
            friendRequests.innerHTML = requestString
            

        }).catch((error) => {
            console.log(error)
        })
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




