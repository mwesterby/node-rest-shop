const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000; // process.env - accesses Node.js environment variables. Would be set on the server you deploy it on

const server = http.createServer(app) // first argument - listener (A function that gets run every time there is a new request, mostly responsible for returning a response)

server.listen(port); // starts the server - starts listening on this port