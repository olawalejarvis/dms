import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import userRouter from './routes/userRoute';
import docRouter from './routes/documentRoute';
import roleRouter from './routes/roleRoute';

// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data, this will happen on every request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to Document Management System' });
});

app.use('/users', userRouter);
app.use('/documents', docRouter);
app.use('/roles', roleRouter);

export default app;
