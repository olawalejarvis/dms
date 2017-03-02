import express from 'express';
import Document from './../../app/controllers/Document';
import Auth from '../../app/middlewares/Auth';

const docRouter = express.Router();

docRouter.route('/')
  .post(Auth.verifyToken, Document.create)
  .get(Auth.verifyToken, Document.getAll);

docRouter.get('/search', Auth.verifyToken, Document.search);

docRouter.route('/:id')
  .get(Auth.verifyToken, Document.getDocument)
  .put(Auth.verifyToken, Document.update)
  .delete(Auth.verifyToken, Document.detele);

export default docRouter;
