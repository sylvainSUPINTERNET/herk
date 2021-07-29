'use strict';

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const { Sequelize, DataTypes } = require('sequelize');
const WebSocketServer = require("ws").Server
const http = require("http");

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded());


// npm run build in react project
const buildFrontPath = path.join(__dirname, 'dpm', 'build');
app.use(express.static(buildFrontPath));




app.get('/api', (req, res) => {
    res.status(200).json({
        "hello" : "bonjour"
    })
})


app.get('/*', (req,res) => {
  res.sendFile(path.join(__dirname, 'dpm', 'build','index.html'));
})



let server = http.createServer(app);


// Should be replaced later with a database entries instead
// Currently, kind of multimap structure in mem such as :
// const clients = {
//   hash1: [ws1, ws2 ...],
//   hash2: [....]
// };

const clients = {};
const uploads = {};

const wss = new WebSocketServer({server: server});
console.log("WSS server created");

wss.on("connection", function(ws) {
  ws.send(JSON.stringify(new Date()), function() {  })
  console.log("websocket connection open")



  ws.on("close", function() {
    console.log("websocket connection close")
  });


  ws.on('message', msg => {
    let data = JSON.parse(msg);
    const {hash, topic} = data;

    if ( topic === "join" ) {

      // TODO : Make difference between new user AND existing just spamming F5 ...
      if ( clients[hash] ) {
        clients[hash].push(ws);
      } else {
        clients[hash] = new Array(ws);
      }

      // Init "hub" for the uploaded files in room 
      if ( !uploads[hash] ) {
        uploads[hash] = new Array();
      }

    }

    if ( topic === "uploadFiles" ) {
      const { blobFiles } = data;

      if ( blobFiles.length > 0 ) {
        blobFiles.map( blob => {
          uploads[hash].push(blob);
        });

        // notify clients in room
        clients[hash].map( socket => socket.send(JSON.stringify({
          "topic": "downloadable",
          "payload": uploads[hash]
        })));

      }

    } 

    console.log("clients", clients[hash].length);
    console.log("upload", uploads[hash].length);
    console.log("detail", uploads[hash]);


  })


});

//   ws.on('message', msg => {
//     let data = JSON.parse(msg);
//     if ( data.hash && data.hash !== "" && data.topic && data.topic === "join"){
//       console.log(`New socket claims ${data.hash}`);

//       if (  Object.keys(clients).filter(el => data.hash).length === 0 ) {
//         // first user for this hash
//         console.log("first user for this hash")
//         clients[data.hash] = [ws];
//       } else {
//         // join "room" / push new ws for this hash
//         console.log("join room for this hash");
//         if ( clients[data.hash] ) {
//           clients[data.hash].push(ws);
//           clients[data.hash].map( socket => socket.send(JSON.stringify({
//             "topic": "newUser",
//             "payload": "new user has joined the room !",
//             "currentFiles": uploads[data.hash] ? uploads[data.hash] : []
//           })));
//         }
//       }
      

//     }
//     if ( data.hash && data.hash !== "" && data.topic && data.topic === "uploadFiles" ) {
//       console.log("Sending files to " + data.hash)
      
//       // Push blob URL in mem
//       if (  Object.keys(uploads).filter(el => data.hash).length === 0 ) {
//         console.log("new entry for hash / upload")
//         uploads[data.hash] = data.blobFiles;
//       } else {
//         // join "room" / push new ws for this hash
//         console.log("add files for hash");
//         console.log(data.blobFiles);
//         data.blobFiles.map( blob => {
//           uploads[data.hash].push(blob);
//         })
//       }

//       // Notify the room
//       if (clients[data.hash]) {
//         clients[data.hash].map( socket => socket.send(JSON.stringify({
//           "topic": "downloadable",
//           "payload": data.blobFiles
//         })));
//       }

//     }

//   })

// })


// DEV
server.listen(5000)


// server.listen(PORT, async () => {
//     // heroku config:set PGSSLMODE=no-verify
//     try {
//       const sequelize = new Sequelize(`${process.env.DATABASE_URL}`, {
//           dialectOptions: {
//               ssl: {      /* <----- Add SSL option */
//                 require: true,
//                 rejectUnauthorized: false 
//               }
//             }
//       });
//       await sequelize.authenticate();
//       // DIRTY TEST
//       const User = sequelize.define('User', {
//         // Model attributes are defined here
//         firstName: {
//           type: DataTypes.STRING,
//           allowNull: false
//         },
//         lastName: {
//           type: DataTypes.STRING
//           // allowNull defaults to true
//         }
//       }, {
//         // Other model options go here
//       });
//       await sequelize.sync({force: true});


//       console.log('Connection has been established successfully.');
//     } catch (error) {
//       console.error('Unable to connect to the database:', error);
//     }

//     console.log(`server started on port ${PORT}`);
// })
