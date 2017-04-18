import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as Route from './routes/';

// Set up the express app
const app = express();

app.use(cors());
// Log requests to the console.
app.use(logger('dev'));

// Parse incoming requests data, this will happen on every request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.status(200).send({ message: 'Welcome to Document Management System' });
});

app.use('/users', Route.userRouter);
app.use('/documents', Route.docRouter);
app.use('/roles', Route.roleRouter);
app.use('/admin', Route.adminRouter);
app.use('/types', Route.typeRouter);

app.get('*', (req, res) => {
  res.status(404).send({ message: 'REQUEST PAGE NOT FOUND' });
});

export default app;
