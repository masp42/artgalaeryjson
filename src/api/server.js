const http = require('http'); //native NodeJs module to work with protocol http
const app = require('./app');
const port = 3000; 
const server = http.createServer(app); //create server to work in port 3000
server.listen(port);
console.log('Server working at port '+ port)