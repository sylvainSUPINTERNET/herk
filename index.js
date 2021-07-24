'use strict';

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;


// npm run build in react project
const buildFrontPath = path.join(__dirname, 'dpm', 'build');
app.use(express.static(buildFrontPath));



app.get('/api', (req, res) => {
    res.status(200).json({
        "hello" : "bonjour"
    })
})



app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});