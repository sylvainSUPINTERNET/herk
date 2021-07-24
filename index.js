'use strict';

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const { Sequelize } = require('sequelize');

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



app.listen(PORT, async () => {

    try {
        const sequelize = new Sequelize(process.env.DATABASE_URL);
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
    
    console.log(`server started on port ${PORT}`);
});