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
    //let errorText = document.getElementById('loginError');
    //errorText.innerText = "";

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
        window.location.href = './app/home.html'; // Should put home in app folder...
      } else {
        //errorText.innerText = "Issue logging in with that info";
        us.value = "";
        pw.value = "";
      }
    });
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
    document.getElementById("avatar").innerHTML = ""; ///html reference, html needed
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

function search() {
    window.location.href = '/app/search.html';
}
/////////funky pixel avatar generate code based on gender and username ,we can try later
// const fetch = require('node-fetch');

// const url = 'https://funky-pixel-avatars.p.rapidapi.com/api/v1/avatar/generate/user?g=male&uname=kusingh&fe=gif';
// const options = {
//   method: 'GET',
//   headers: {
//     'X-RapidAPI-Key': 'e597977b3amsh58f50df5ea831ddp18c578jsn7d9ca425de95',
//     'X-RapidAPI-Host': 'funky-pixel-avatars.p.rapidapi.com'
//   }
// };

// try {
// 	const response = await fetch(url, options);
// 	const result = await response.text();
// 	console.log(result);
// } catch (error) {
// 	console.error(error);
// }