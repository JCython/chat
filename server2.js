const local = true

var port = 80
if (local == true) {
    port = 7777
}

const express = require ('express')
const app = express()
const request = require('request');
const path = require('path');
const EventEmitter = require('events');

const emit = new EventEmitter();

const cors = require ('cors')
var fs = require('fs')
const { stringify } = require('querystring')
const e = require('express')

var expressWs = require('express-ws')(app);
//var wsInstance = expressWs(app)


// var expressWs = require('express-ws');
// var expressWs = expressWs(express());
var wss = expressWs.getWss('/');

//const WebSocketServer = require('ws')
//const wss = new WebSocketServer.Server({ port: 3000 })
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017";

var history = ''

var channels = []
const dir = path.join(path.resolve(''), '..', 'sitefiles') + '/'
//const dir = "C:/Users/Joshua/Documents/Website/sitefiles/"



app.use(cors())

app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(`${dir}index.html`)
})

app.get('/login/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(`${dir}login.html`)
})

app.get('/signup', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(`${dir}signup.html`)
})

app.get('/file/', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    f = req.query.f
    let file = dir+f
    res.sendFile(file)
})

app.get('/give/', (req, res) => {
  console.log(req.query.d)
})

app.get('/t1/', (req, res) => {
    nChannel("t1", "1")
})

app.get('/t2/', (req, res) => {
    nChannel("t2", "2")
})

app.get('/update/', (req, res) => {
  
})

app.get('/channel/r/', (req, res) => {
  let userID = req.query.u
  let token = req.headers.auth
  try {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chat");
    var query = { token: token };
    dbo.collection("Users").find(query).toArray(function(err, result) {
      if (err) throw err;
      
      let id = result[0].id
      let username = result[0].username
      // determine the order of the id
      // 66925528a is 8 numbers
      let nuserID = parseInt(userID.slice(0, -1))
      let nid = parseInt(id.slice(0, -1))
      if (nuserID>nid) {
        var channelID = `${userID};${id}`
      } else {
        var channelID = `${id};${userID}`
      }
      let send = [channelID, id]
      console.log(channelID)
      nChannel(channelID)
      res.send(send)
      update(userID, {
        type: "chatRequest",
        channelID: send,
        requester: id,
        username: username
      })

      db.close();
    });
  
  })
} catch {}
})

app.get('/channel/l/', (req, res) => {
  if (req.query.id.includes(";")) {
  res.send('No Semicolons')
  } else {
  nChannel(req.query.id, req.query.id)
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Channels");
    dbo.collection(req.query.id).findOne({}, function(err, result) {
      if (err) throw err;
      console.log(result.name);
      db.close();
    });
  });
  }
})

app.get('/room/', (req, res) => {
    let r = req.query.r
    console.log(JSON.stringify(req.headers.auth));
    try {
        // let data = JSON.parse(request)
        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat");
        var query = { id: `${r}` };
        dbo.collection("Rooms").find(query).toArray(function(err, result) {
            if (err) throw err;
            result = result[0]
            try {
                res.send(result.name)
            } catch {}
            db.close();
        });
        });
    } catch {}
})

app.get('/getRooms/', (req, res) => {
    let token = req.headers.auth
    console.log(JSON.stringify(req.headers.auth));
    try {
        // let data = JSON.parse(request)
        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat")
        var query = { token: `${token}` };
        dbo.collection("Users").find(query).toArray(function(err, result) {
            if (err) throw err;
            result = result[0]
            try {
                res.send(result.rooms)
            } catch {}
            db.close();
        });
        });
    } catch {}
})

app.get('/get/id/', (req, res) => {
    let token = req.headers.auth
    console.log(JSON.stringify(req.headers.auth));
    try {
        // let data = JSON.parse(request)
        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat")
        var query = { token: `${token}` };
        dbo.collection("Users").find(query).toArray(function(err, result) {
            if (err) throw err;
            result = result[0]
            try {
                updateChannel(result.id)
                res.send(result.id)
            } catch {}
            db.close();
        });
        });
    } catch {}
})

app.get('/init/channels/', (req, res) => {
  let token = req.headers.auth
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat");
        var query = { token: token };
        dbo.collection("Users").find(query).toArray(function(err, result) {
          if (err) throw err;
          try {
            let user = result[0].id
            //res.send(result[0].channels)
            let channels = JSON.parse(result[0].channels)
            let send = []
            for (i=0;i<channels.length;i++) {
              let ar = [channels[i], user]
              ar = JSON.stringify(ar)
              send.push(ar)
            }
            res.send(send)
            console.log(send)
          } catch {
            res.send('Failed')
          }
          db.close();
        });
      });
})

app.get('/init/user/', (req, res) => {
  let token = req.headers.auth;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Chat");
    var query = { token: token };
    dbo.collection("Users").find(query).toArray(function(err, result) {
      if (err) throw err;
      res.send(result[0]);
      db.close();
    });
  });
})

//  Get token from password and username
app.get('/load/', (req, res) => {
    let request = req.query.request

    let data = JSON.parse(request)
    let username = data.username
    let password = data.password

    // let username = req.query.username
    // let password = req.query.password

    //console.log(data)

    var send = 'false'

    try {
        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat");
        var query = { username: username };
        dbo.collection("Users").find(query).toArray(function(err, result) {
            if (err) throw err;
            console.log(result)
            try {
            if (result[0].password == password) {
                send = result[0].token
                res.send(send)
            db.close();
            
        }
        } catch {}
        });
        });
    } catch {}
})


// Create channel
app.get('/create/c/', (req, res) => {
    let cId = req.query.c
    let collName = "test1"
    
    MongoClient.connect(url, function(err, db) {
    var dbo = db.db("Channels");
    dbo.listCollections({name: cId})
    .next(function(err, collinfo) {
        if (collinfo) {
          console.log(collinfo)
            console.log('it exists dont make the collection')
        } else {
                if (err) throw err;
                var dbo = db.db("Chat");
                dbo.createCollection(cId, function(err, res) {
                  if (err) throw err;
                  console.log("Collection created!");
                  db.close();
                });
        }
    })
    })
})


// Get username from user id
app.get('/user/name/', (req, res) => {
    let id = req.query.id
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat");
        var query = { id: id };
        dbo.collection("Users").find(query).toArray(function(err, result) {
          if (err) throw err;
          try {
          res.send(result[0].username)
          } catch {}
          db.close();
        });
      });
})

app.get('/user/id/', (req, res) => {
  try {
  let name = req.query.name
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat");
        var query = { username: name };
        dbo.collection("Users").find(query).toArray(function(err, result) {
          if (err) throw err;
          try {
          res.send(result[0].id)
          } catch {}
          db.close();
        });
      });
    } catch {}
})


// Get multiple usernames from ids
app.get('/multi/usernames/', (req, res) => {
    let data = req.query.data
    names = JSON.parse(data)
    for (i = 0; i < data.length; i++) {

    }


    MongoClient.connect(url, function(err, client) {
      if (err) throw err;
      
      const db = client.db('Chat');
      
      const collection = db.collection('Users');
      
      collection.find({ id: { $in: names } }).limit(names.length).toArray(function(err, docs) {
        let buffer = []
        for (i = 0; i < docs.length; i++) {
          buffer.push([docs[i].username,docs[i].id])
        }
        res.send(buffer)
        client.close();
      });
    });
})

// MODERATION ENDPOINTS
app.get('/mod/', (req, res) => {
  res.sendFile(dir+'/mod.html')
})
app.get('/mod/delete/user/', (req, res) => {
  let auth = req.headers.auth
  let user = req.headers.user
  if (auth == '0d812hd0821hdubwedy97238ygdeeg28qedy82qdye82g2y8dqwhygs8y182g1321bwnsabcjhwecg7328743824') {
    let id = user
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Chat");
      var query = { id: id };
      dbo.collection("Users").deleteOne(query, function(err, obj) {
        if (err) throw err;
        res.send('Deleted'+' '+id)
        db.close();
      });
    });
  }
})

app.get('/mod/delete/message/', (req, res) => {
  let auth = req.headers.auth
  let channel = req.headers.channel
  let user = req.headers.user
  let message = req.headers.message
  // yes i know its not a good idea to store this here
  if (auth == '0d812hd0821hdubwedy97238ygdeeg28qedy82qdye82g2y8dqwhygs8y182g1321bwnsabcjhwecg7328743824') {
    let id = user
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("Channels");
      var query = { userId: id, messageContent: message };
      dbo.collection(channel).deleteOne(query, function(err, obj) {
        if (err) throw err;
        res.send('Deleted'+' '+id)
        db.close();
      });
    });
  }
})

var sockets = []

function update(id, data) {
  if (sockets[id]) {
  sockets[id].send(JSON.stringify(data))
  } else {
    // socket not opened
    console.log('no socket for '+id)
  }
}

app.get('/f/', (req, res) => {
  sockets['28973363a'].send('test')
  res.send('a')
})

// Create a new updates websocket channel to send updates to the client
function updateChannel(id) {
  console.log(`Update channel opened from user with id of ${id}`)
  app.ws(`/${id}`, (ws, req) => {
    sockets[id] = ws

    ws.on('message', (msg) => {
      
      ws.send('recieved: ' + msg);

      emit.on(`${id}`, (update) => {
        console.log('working')
        ws.send(update)
      })
    });
  });
}
updateChannel('updates')

// Create a new channel
function nChannel(id) {
    console.log(`Channel with id of ${id} opened`)
    let channelID = id
    id = '/'+id

      app.ws(id, function(ws, request) {
          console.log('Socket Connected');
          //console.log(ip)
          ws.route = id;  /* <- Your path */
        
          ws.on("message", (msg) => {
            let mes = JSON.parse(msg)
            console.log(mes)
            if (mes.messageContent) {
            let content = mes.messageContent
            content = content.replace("<", "&#60;");
            content = content.replace(">", "&#62;");
            mes.messageContent = content
            }
            var time = new Date();
            var intTime = Date.now()
            //console.log(intTime)
            mes.time = intTime
            insertMessage1(mes, channelID)
            var time = new Date();
            time = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            if (mes.token == undefined) {
                //console.log(`${ip} does not have a token`)
            } else {
    
            try {
                MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("Chat");
                var query = { token: mes.token };
                dbo.collection("Users").find(query).toArray(function(err, result) {
                    if (err) throw err;
                    try {
                    var userId = result[0].id
                    
                      // remove html tags
                      

                    msg = {
                        userId: userId,
                        time: time,
                        content: mes.messageContent
                    }
                    
                    } catch {}
                    msg = JSON.stringify(msg)
                    
                    //console.log(expressWs.clients)
                    if (mes.token == undefined || mes.ping == "ping") {
    
                    } else {
                    //console.log(result[0].username + " has sent a message with the ip address of: "+ip)
                    //history = history + ';' + msg
                    //console.log(history)
                    Array.from(
                        wss.clients
                      ).filter((sock)=>{
                        return sock.route == id /* <- Your path */
                      }).forEach(function (client) {
                        client.send(msg);
                      });

                }
                    db.close();
                });
                });
            } catch {
        
            }
        }
      });
    })
    }


function insertMessage1(msg, channelID) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat");
        var query = { token: msg.token };
        dbo.collection("Users").find(query).toArray(function(err, result) {
          if (err) throw err;
          //console.log(result[0].id);
            try {
            msg.userId = result[0].id
            insertMessage(msg, channelID)
            } catch {}

          db.close();
        });
      });
}

function insertMessage(msg, channelID) {
    if (msg.ping == null) { 
    // insert message
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Channels");
        delete msg.token;
        dbo.collection(channelID).insertOne(msg, function(err, res) {
          if (err) throw err;
          //console.log("1 document inserted to a database");
          db.close();
        });
      });
    }
}


// Load messages from server
app.get('/room/load/', (req, res) => {
    let id = req.query.id
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Channels");
        var mysort = { time: 1 };
        dbo.collection(id).find().sort(mysort).toArray(function(err, result) {
          if (err) throw err;
        //   console.log(result);
          // pack messages
          for (let i = 0; i < result.length; i++) {
            let mTime = new Date();
            mTime = mTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

            //console.log(result[i].token)
          }

          db.close();
        });
      });
})

function pack(item) {
    
}



app.get('/sort/', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    let collectionID = req.query.id
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Channels");
        var mysort = { time: 1 };
        dbo.collection(collectionID).find().sort(mysort).toArray(function(err, result) {
          if (err) throw err;
            let send = result
            
            res.send(result)

          db.close();
        });
        
      });
})

app.get('/sort1/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    let collectionID = req.query.id
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Channels");
        var mysort = { time: 1 };
        dbo.collection(collectionID).find().sort(mysort).toArray(function(err, result) {
          let messages = result
            if (err) throw err;
            // gather usernames
            var response = []
            for (i = 0; i < result.length; i++) {
              response.push(result[i].userId)
            }
            response = Array.from(new Set(response))
            response = JSON.stringify(response)
            res.setHeader('usernames', response)
            res.send([messages, response])
        });
        
      });
})

function sortMessages(collectionID) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err; 
        var dbo = db.db("Channels");
        var mysort = { time: 1 };
        var test12 = dbo.collection(collectionID).find().sort(mysort)
      });
}


// Create account
app.get('/account/create/', (req, res) => {
    // let username = req.query.username
    // let password = req.query.password
    let data = req.query.data
    data = JSON.parse(data)
    console.log(data)
    let username = data.username
    console.log(username)
    let password = data.password
    let ip = req.socket.remoteAddress
    // check if username is taken

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat");
        var query = { username: username };
        dbo.collection("Users").find(query).toArray(function(err, result) {
          if (err) throw err;
          console.log(result)
          // username taken
          try {
          if (result[0]) {
            console.log("Username is taken")
          } else {
          //res.send('Username Not Taken')

          MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("Chat");
            var query = { id: userid };
            dbo.collection("Users").find(query).toArray(function(err, result) {
              if (err) throw err;
              console.log(result)
              // userID taken
              if (result[0]) {
                console.log('The user id is taken this is so rare that I will not code a fix yet')
              } else {
                console.log("UserID not taken")

                let chars = '0123456789abcdefghijklmnopqrstuvwxyz';

                let token = '';
                for (let i = 0; i < 100; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);
                token += chars[randomIndex];
                }
                console.log(userid)

                let account = {username:username, password:password, id:userid, token:token}

                let securitycheck = true

                if (securitycheck == true) {
                    createAccount(account)
                    res.send(token)
                }
              }
    
              db.close();
            });
          });
          }} catch {}

          db.close();
        });
      });

      let userid = Math.floor(Math.random() * 100000000) + "a";
      

      // generate token
        let chars = '0123456789abcdefghijklmnopqrstuvwxyz';

        let token = '';
        for (let i = 0; i < 100; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        token += chars[randomIndex];
        }
        console.log(userid)
        //res.send(token)
        //userid = "joshid123"
})

function createAccount(ao) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Chat");
        var myobj = ao;
        dbo.collection("Users").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
      });
}

app.get('/test4', (req, res) => {
    sortMessages('test7')
})

app.listen(port,"0.0.0.0");

// newChannel("t2", "2")
// newChannel("t1", "1")
nChannel('test8')
nChannel('channelone')
nChannel('info')
