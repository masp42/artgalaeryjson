const express = require('express'); //Use express to manage routes
const fileUpload = require('express-fileupload'); //Use express-fileupload to allow receive form data

const app = express();


const paintingRoute  = require('./routes/painting-route');

app.use(
    express.json(), //Receive JSON data
    express.static("src/view"), //Allow static file path - src/view
    express.static('src/api/uploads'), //Allow static file path - src/api/uploads
    fileUpload(),
)

/* VIEW route - GET method */
app.get('/', (req, res) => {
    res.sendFile('src/view/index.html');
})


app.use('/api/paintings', paintingRoute);

module.exports = app; //export to use this file configuration in others files