// todos
// Line 199-200 I need to make it so you can open a channel with another user with just their username
// Somewhere I need to open a websocket where the server sends updates to the account or just spam http
// Keep public group chats because peeople like that




var testing = true
var url = "https://pounce.lol"
var urlws = "wss://pounce.lol/"
var token = ""
// 
try {
let cookies = document.cookie.split(';')
cookies.forEach(cookie => {
    try {
        
        if (JSON.parse(cookie).token) {
            token = JSON.parse(cookie).token
            //alert(token)
        }
    } catch {}
})
} catch {}

//alert(token)
if (testing == true) {
    url = "http://localhost:7777"
    urlws = "ws://localhost:7777/"
} else {}

if (token) {
} else {
    window.open(`${url}/login`, "_self")
}

document.body.style = "display:none;"

//loading 

document.body.style = "display:block;"


//
var usernames = {}
//usernames["joshid123"] = "josh"

function rInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function clear() {
    let chats = document.getElementById('list')
    chats.innerHTML = ""
}

var localChannels = {
    "123":"a"
}



function updates(id) {
    const updateSocket = new WebSocket(urlws+id)
    //alert(urlws+id)

    updateSocket.onmessage = (event) => {
        try {
        if (JSON.parse(event.data).channelID) {
        //alert(JSON.parse(event.data).channelID[0])
        openRoom(JSON.parse(event.data).channelID[0], JSON.parse(event.data).username)
        } 
        } catch {}
    }
        // repeat every 15 seconds
    setInterval(function() {
        let mes = {
            ping: "ping",
            token: token
        }
        updateSocket.send(JSON.stringify(mes))
    }, 15000);
}

var choose = 0
function chooser(c) {
    choose = c
    if (c == 0) {
        document.getElementById('choose0').style.fontWeight = '900';
        document.getElementById('choose1').style.fontWeight = '500';
    } else {
        document.getElementById('choose0').style.fontWeight = '500';
        document.getElementById('choose1').style.fontWeight = '900';
    }
}

// open the Updates Channel
fetch(`${url}/get/id/`, {
    method: 'GET',
    headers: {
        'auth': `${token}`,
    },
})
.then((response) => response.text())
.then((text) => {
    //alert(text)
    updates(text)
})

function chatRequest(username) {
    fetch(`${url}/user/id/?name=${username}`, {
        method: 'GET',
        headers: {
            'auth': `${token}`,    
        },
    })
    .then((response) => response.text())
    .then((text) => {
            fetch(`${url}/channel/r/?u=${text}`, {
                method: 'GET',
                headers: {
                    'auth': `${token}`,    
                },
            })
            .then((response) => response.text())
            .then((text) => {
                let json = JSON.parse(text)
                let achannel = json[0].split(';')
                if (achannel[0] == json[1]) {
                    achannel.splice(0, 1)
                } else {
                    achannel.splice(1, 1)
                }
                let otherperson = achannel[0]
                let u = url+'/user/name/?id='+otherperson
                    fetch(u, {
                        method: 'GET',
                        headers: {
                            'auth': `${token}`,
                        },
                        })
                        .then((response) => response.text())
                        .then((text) => {
                            openRoom(json[0], text)
                        });
            })
    })
}

function serverChannel(id) {
    fetch(`${url}/channel/l/?id=${id}`, {
        method: 'GET',
        headers: {
            'auth': `${token}`,
        },
    })
    .then((response) => response.text())
    .then((text) => {
        document.getElementById('infoHeader').innerText = text
        let appended = document.createElement('div')
        appended.innerHTML = `
        <div class="channel" onclick="reconnect(localChannels['${id}']); loadC(localChannels['${id}'])"><i style="font-size: 4vh; float:left;" class="fa-solid fa-user"></i>
                    <span class="user">${text}</span>
                </div>
        `
        document.getElementById('select-channel').appendChild(appended)   
    }
)}

function openRoom(id, uname) {
    if (JSON.stringify(localChannels).includes(id)) {
    } else {
    let idr = 'c'+rInt(1, 1000000).toString()
    localChannels[idr] = id
    localChannels[idr]
        fetch(`${url}/channel/l/?id=${id}`, {
    method: 'GET',
    headers: {
        'auth': `${token}`,
    },
    })
    .then((response) => response.text())
    .then((text) => {
        document.getElementById('infoHeader').innerText = text
        let appended = document.createElement('div')
        if (uname) {
        appended.innerHTML = `
        <div class="channel" onclick="reconnect(localChannels['${idr}']); loadC(localChannels['${idr}'])"><i style="font-size: 4vh; float:left;" class="fa-solid fa-user"></i>
                    <span class="user">${uname}</span>
                </div>
        `
        document.getElementById('select-channel').appendChild(appended)
        }
    });
}
}

//  Open all rooms from user
function initRooms() {
    fetch(`${url}/init/channels/`, {
        method: 'GET',
        headers: {
            'auth': `${token}`,
        },
        })
        .then((response) => response.text())
        .then((text) => {
            let channels = JSON.parse(text)
            // get all of the user IDS we need
            let users = []
            for (i=0; i<channels.length; i++) {
                let channel = JSON.parse(channels[i])[0]
                let user = JSON.parse(channels[i])[1]
                let ids = channel.split(";")
                if (ids[0] == user) {
                    ids.splice(0, 1)
                } else {
                    ids.splice(1,1)
                }
                let otherperson = ids[0]
                let u = url+'/user/name/?id='+otherperson
                    fetch(u, {
                        method: 'GET',
                        headers: {
                            'auth': `${token}`,
                        },
                        })
                        .then((response) => response.text())
                        .then((text) => {
                            openRoom(channel, text)
                        });
                // ["74073046a", "66925528a"]
                // convert 2 user ids to the other persons name

            }
        });
} initRooms()

function getRooms() {
    fetch(`${url}/getRooms`, {
    method: 'GET',
    headers: {
        'auth': `${token}`,
    },
    })
    .then((response) => response.text())
    .then((text) => {
        let rooms = text.split(';')
        for (i=0; i<rooms.length; i++) {
            console.log(rooms[i])
            let room = `
            <div class="room-button" onclick='openRoom(${i})'><h1 class="room-title">
                ${i}
            </h1></div>
            `
            document.getElementById('selectRoom').innerHTML += room
        }
    });
} getRooms()


function loadRoom(id, auth) {
    //document.getElementById('list').style = "display:none;"
    req = `${url}/loadRoom/`//+id
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        let response = xhttp.responseText
        let chats = response.split(';')
        for (i=1; i<chats.length; i++) {
            newMessage(chats[i])
        }
        }
    };
    xhttp.open("GET", req, true);
    xhttp.send();
} loadRoom()
document.getElementById('chat-window').scrollBy(0, 1000);

var username = "default"
var keyinput = document.getElementById("chat-input");
var keyinput1 = document.getElementById('createinput');

// repeat every 15 seconds
setInterval(function() {
    let mes = {
        ping: "ping",
        token: token
    }
    sendMessage(JSON.stringify(mes))
    console.log("pinged server to prevent timeout")
}, 15000);




keyinput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); 
        let input = document.getElementById('chat-input')
        let content = input.value
        if (input.value == '') {return} 
        let mes = {
            messageContent: content,
            token: token
        }
        console.log(mes)
        input.value = ''
        sendMessage(JSON.stringify(mes))
    }
  });


  keyinput1.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
        let input = document.getElementById('createinput')
        let content = input.value
        // todo This needs to get the username, convert it to user id and ask the server to open the channel and add the clients id who requested it gotten from the auth header then 
        // be the response be the new channel name and then the server has to tell the other person they are in the chat and add it to their account
        chatRequest(content)
    }
  });
// {"token":"token1", "messageContent":"abc"}



// Create WebSocket connection.
var socket = new WebSocket(urlws);

socket.addEventListener('open', function (event) {
    //alert("done")
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
    //alert(event.data)
    // check if 
    let userId = JSON.parse(event.data).userId
    let time = JSON.parse(event.data).time
    let content = JSON.parse(event.data).content
    console.log(`${userId} HIUWDGHAWIGDHYUIAWGDYIWAGDYI`)
    getUserName(userId, time, content)
});

function sendMessage(message) {
    console.log('Sending message: '+message+'...')
    socket.send(message)
}

function addName(name, userid) {
    usernames[userid] = name;
    //alert(usernames[userid])
}

function loadC(id) {
    const xhr = new XMLHttpRequest();
    let req = url + '/sort1/?id='+id
    //alert(req)
    xhr.open('GET', req);
    xhr.send();

    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let response = JSON.parse(xhr.responseText)
        //alert(response)
        //let usernames = xhr.getResponseHeader('usernames')
        //alert(xhr.getResponseHeader('usernames'))
        //alert(response[0], response[1])
        multiusername(response[1], response[0])
    }
    };
}

async function loadA(array) {
    multiusername(array)
}

function multiusername(array, response) {
    let req = `${url}/multi/usernames/?data=${array}`
    // Create an XMLHttpRequest object
    const xhttp = new XMLHttpRequest();

    // Define a callback function
    xhttp.onload = function() {
        //alert(xhttp.responseText)
        let ar = JSON.parse(xhttp.responseText)
        //alert(ar[0], ar[1])
        let run = false
        for (i = 0; i < ar.length; i++) {
            //alert(ar[i])
            usernames[ar[i][1]] = ar[i][0]
        }
        run = true
        //alert(run)
        //if (run = true) {loadMessages('test8')}
        for (i = 0; i < response.length; i++) {
            newMessage(usernames[response[i].userId],response[i].time,response[i].messageContent)
        }
    }

    // Send a request
    xhttp.open("GET", req);
    xhttp.send();
}

function first(array) {
    let req = `${url}/multi/usernames/?data=${array}`
    return new Promise((resolve, reject) => {
        fetch(req)
          .then(response => {
            return Promise.all([response.text(), response.headers]);
          })
          .then(([text, headers]) => {
            alert(text, headers)
            resolve({ text, headers });
          })
          .catch(error => {
            alert('error')
            reject(error);
          });
    })
}

function getUserName(userId, time, content) {
    const xhr = new XMLHttpRequest();
    let req = url + '/user/name/?id='+userId
    //alert(req)
    xhr.open('GET', req);
    xhr.send();

    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
        let response = xhr.responseText
        newMessage(response, time, content)
    }
    };
}

function newMessage(username1, time, content) {
    //alert(data)
    //let obj = JSON.parse(data)
    //let userId = obj.userId
    if (username = undefined) {
        console.log("Username not found")
        return "Username not found"
    }

    //    Wed Mar 01 2023 20:57:22 GMT+1100 (Australian Eastern Daylight Time)

    //time conversion
    try {
        let nTime = new Date(time)
        nTime = nTime.toString()
        //alert(nTime)
        let month = nTime.split(' ')[1]
        let day = nTime.split(' ')[0]
        let nDay = nTime.split(' ')[2]
        nTime = nTime.split(' ')[4]
        time = nTime
        let hour = parseInt(nTime.split(':')[0])
        if (nTime.split(':')[0] > 13) {
            time = hour - 12 + ":" + nTime.split(':')[1] + "PM"
        } else {
            time = nTime.split(':')[0] + nTime.split(':')[1] + "AM"
        }
        // checking if it was yesterday TODO
        let today = Date(Date.now().toString()).split(' ')[2]
        if (today == nDay) {

        } else {
            time = nDay + " " + month + " " + time 
        }
    } catch {}

        let appendedMessage = document.createElement('li');
        appendedMessage.classList.add('chat-message');
        appendedMessage.innerHTML = `
        <li class="chat-message">
                <div class="chat-message-content-header">
                    <span class="chat-message-content-header-username">${username1}</span>
                    <span class="chat-message-content-header-time">${time}</span>
                </div>
                <div class="chat-message-content-body">
                    <span class="chat-message-content-body-message">${content}</span>
                </div>
        </li>
        `;
        document.getElementById('list').appendChild(appendedMessage);
        appendedMessage.scrollIntoView();
}
 

function addChannel(channelID) {
    let channels = document.getElementById('select-channel').innerHTML
    document.getElementById('select-channel').innerHTML = document.getElementById('select-channel').innerHTML + `<div class="channel" onclick="reconnect('${channelID}'); loadMessages('${channelID}')"><i class="fa-solid fa-list"></i>${channelID}</div>`
}

function loadMessages(channelID) {
    let requrl = url+"/sort/?id="+channelID
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
        let messageArray = JSON.parse(xhttp.responseText)
        for (i = 0; i < messageArray.length; i++) {
            console.log(messageArray)
            let tempmessage =  {content:messageArray[i].messageContent, userId:messageArray[i].userId, time:messageArray[i].time}
            if (usernames[tempmessage.userId] == undefined) {
                newMessage(JSON.stringify(tempmessage), "request")
            }
            newMessage(JSON.stringify(tempmessage), usernames[tempmessage.userId])  
            if (i < messageArray.length - 1) {
                //document.getElementById('list').style = "display:block;"
            }
        } 
        }
    };
    xhttp.open("GET", requrl, true);
    xhttp.send();
    //document.getElementById('list').style = "display:block;"
}

function test() {
    socket.close()
}

function reconnect(sId) {
    //document.getElementById('list').style = "display:none;"
    clear()
    socket.close()
    sId = urlws + sId
    socket = new WebSocket(sId);

    socket.addEventListener('open', function (event) {
    });
    
    // Listen for messages
    socket.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
        let userId = JSON.parse(event.data).userId
        let time = JSON.parse(event.data).time
        let content = JSON.parse(event.data).content
        getUserName(userId, time, content)
    });
}

// wait 2 seconds

async function add() {
    let nfill = 0;
    let nchat = 500;
    let win = document.getElementById('chat-window')
    //win.style.gridTemplateRows = '0px 500px 50px'
    // let fill = document.getElementById('filler');
    // fill.style.height = '0px';
    // repeat 20 times
    for (let i = 0; i < 40; i++) {
        // wait 1 second
        await new Promise(resolve => setTimeout(resolve, 50));
        // append to list
        let message = document.createElement('li');
        message.classList.add('chat-message');
        message.innerHTML = `
        <li class="chat-message">
                <div class="chat-message-content-header">
                    <span class="chat-message-content-header-username">Pounce8</span>
                    <span class="chat-message-content-header-time">9:43 AM</span>
                </div>
                <div class="chat-message-content-body">
                    <span class="chat-message-content-body-message">Message ${i}</span>
                </div>
        </li>
        `;
        document.getElementById('list').appendChild(message);
        message.scrollIntoView();
        //print chat-window height in pixels
        console.log(win.offsetHeight);
        // if chat-window height is less than 500px
    //     if (win.offsetHeight < 500) {
    //         win.style.overflowY = 'hidden';
    //     } else {
    //         win.style.overflowY = 'scroll';
    //     }
    }
}

function fill(a, b) {
    let x = 500 - b
    let y = 500 - a
    if (x == 0) {
        return
    } else {
        
    }
}

//add();

// get the current width of the screen
window.innerWidth

