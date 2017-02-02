// This will be our application entry. We'll setup our server here.
const http = require('http');
const app = require('./server/config/app'); // The express app we just created

require('dotenv').config({
  silent: true
});

const port = parseInt(process.env.PORT, 10);
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
