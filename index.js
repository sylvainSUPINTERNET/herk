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




let server = http.createServer(app);

const wss = new WebSocketServer({server: server});
console.log("WSS server created");

wss.on("connection", function(ws) {
  let id = setInterval(function() {
    ws.send(JSON.stringify(new Date()), function() {  })
  }, 1000)

  console.log("websocket connection open")

  ws.on("close", function() {
    console.log("websocket connection close")
    clearInterval(id)
  });

})


server.listen(port, async () => {
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
