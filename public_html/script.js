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

function fetchProfilePic() { 
    document.getElementById("avatar").innerHTML = ""; ///html reference, html needed, also if we add funky avatar it should be modify
    let url = "/app/getProfilePic";
    fetch(url)
    .then( (response) => {
        return response.text();
    })
    .then( (response) => {
        if (response == "") {
            document.getElementById("avatar").innerHTML += "<img src='../img/default.jpg' alt='Your profile picture' width='450px' height='450px'>";
        }
        else {
            document.getElementById("avatar").innerHTML += "<img src='../img/" + response + "' alt='Your profile picture' width='450px;' height='450px'>";
        }
    })
}

function goHome() { //return to homepage
    window.location.href = window.location.origin + "/app/home.html";
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
    } else {
        chatArea.innerHTML = "<div class='dmDiv' >" + "<p class='dmChat' >" +
        "<p class='dmChatUser' >" + "337ChatBot" + ": " + "</p>" +
        "Welcome to direct messages!" + "</p>" + "</div>";
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

window.addEventListener('DOMContentLoaded', function() {
    // Use this as 'on new page load, if page is ___ do something
    let currentPath = window.location.pathname;

    if (currentPath == '/app/dm.html'){
        // Here is where you would call funct to change the values of the dropdown to names of friends
        console.log('refreshing dms');
        this.window.setInterval(getDms, 1000);
    }
});

/////////funky pixel avatar generate code based on gender and username ,we can try later
// function fetchFunkyAvatar() {
//     document.getElementById("avatar").innerHTML = "Loading avatar..."; // a loading message

//     fetch("/app/funkyAvatar")
//     .then(response => response.text())
//     .then(avatarUrl => {
//         if (avatarUrl) {
//             document.getElementById("avatar").innerHTML = `<img src="${avatarUrl}" alt="Your Funky Avatar" width="450px" height="450px">`;
//         } else {
//             document.getElementById("avatar").innerHTML = "<p>Failed to load Funky Avatar.</p>";
//         }
//     })
//     .catch(error => {
//         console.error("Error fetching Funky Avatar:", error);
//         document.getElementById("avatar").innerHTML = "<p>Error fetching avatar.</p>";
//     });
// }
