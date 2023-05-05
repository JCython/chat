
var testing = true
var url = "https://pounce.lol"
var urlws = "wss://pounce.lol"
// if (testing == true) {
//     var token = "joshtoken"
// } else {
//     var token = document.cookie.split('=')[1]
// }

if (testing == true) {
    url = "http://localhost:7777"
    urlws = "ws://localhost:7777"
} else {}




function login() {
    let user = String(document.getElementById('username').value)
    let pass = String(document.getElementById('password').value)

    let req = {
        username: user,
        password: pass
    }

    req = url+"/load/?request="+JSON.stringify(req)
    console.log(req)

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        let token = xhttp.responseText
        //alert(token)
        if (token == "false") {
            return
        }
        let cookieobj = {token:token}
        cookieobj = JSON.stringify(cookieobj)
        document.cookie = cookieobj
        window.open(url+"/", "_self")
        }
    };
    xhttp.open("GET", req, true);
    xhttp.send();
}

// Get the input field
var input = document.getElementById("username");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function(event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    var target = document.getElementById("password");
    target.focus();
    target.select();
  }
});


// Get the input field
var input = document.getElementById("password");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function(event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("submit").click();
  }
});

function signup() {
    let username = document.getElementById('username').value
    let password = document.getElementById('password').value

    let req = {
        username: username,
        password: password
    }

    req = url+"/account/create/?data="+JSON.stringify(req)
    console.log(req)

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        let token = xhttp.responseText
        //alert(token)
        if (token == "false") {
            return
        }
        let cookieobj = {token:token}
        cookieobj = JSON.stringify(cookieobj)
        document.cookie = cookieobj
        window.open(url+"/", "_self")
        }
    };
    xhttp.open("GET", req, true);
    xhttp.send();
}
