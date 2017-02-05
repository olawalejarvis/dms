import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import userRouter from './routes/userRoute';
import docRouter from './routes/documentRoute';

// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data, this will happen on every request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/users', userRouter);
app.use('/documents', docRouter);

export default app;
