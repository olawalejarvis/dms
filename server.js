// This will be our application entry. We'll setup our server here.
import http from 'http';
import * as dotenv from 'dotenv';
import app from './server/config/app'; // The express app we just created

dotenv.config({
  silent: true
});

const port = parseInt(process.env.PORT, 10);
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
console.log(`App is running at: ${process.env.HOST}:${port}/`);