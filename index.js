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
  res.sendFile(path.join(__dirname, 'dpm', 'build', 'public', 'index.html'));
})



let server = http.createServer(app);


// Should be replaced later with a database entries instead
// Currently, kind of multimap structure in mem such as :
// const clients = {
//   hash1: [ws1, ws2 ...],
//   hash2: [....]
// };

const clients = {};

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
    if ( data.hash && data.hash !== "" && data.topic && data.topic === "join"){
      console.log(`New socket claims ${data.hash}`);

      if (  Object.keys(clients).filter(el => data.hash).length === 0 ) {
        // first user for this hash
        console.log("first user for this hash")
        clients[data.hash] = [ws];
      } else {
        // join "room" / push new ws for this hash
        console.log("join room for this hash")
        clients[data.hash] = [...clients[data.hash], ws];
      }
      
      clients[data.hash].map( socket => socket.send(JSON.stringify({
        "topic": "newUser",
        "payload": "new user has joined the room !"
      })));
    }
    
    if ( data.hash && data.hash !== "" && data.topic && data.topic === "uploadFiles" ) {
      console.log("Sending files to " + data.hash)
      clients[data.hash].map( socket => socket.send(JSON.stringify({
        "topic": "downloadable",
        "payload": data.blobFiles
      })));
    }

  })

})


// DEV
//server.listen(5000)


server.listen(PORT, async () => {
    // heroku config:set PGSSLMODE=no-verify
    try {
      const sequelize = new Sequelize(`${process.env.DATABASE_URL}`, {
          dialectOptions: {
              ssl: {      /* <----- Add SSL option */
                require: true,
                rejectUnauthorized: false 
              }
            }
      });
      await sequelize.authenticate();
      // DIRTY TEST
      const User = sequelize.define('User', {
        // Model attributes are defined here
        firstName: {
          type: DataTypes.STRING,
          allowNull: false
        },
        lastName: {
          type: DataTypes.STRING
          // allowNull defaults to true
        }
      }, {
        // Other model options go here
      });
      await sequelize.sync({force: true});


      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }

    console.log(`server started on port ${PORT}`);
})
