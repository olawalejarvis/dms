import express from 'express';
import docCtrl from './../../app/controllers/documentController';
import auth from '../../app/middlewares/auth';

const docRouter = express.Router();

docRouter.route('/')
  .post(auth.verifyToken, docCtrl.create)
  .get(auth.verifyToken, docCtrl.getAll);

docRouter.get('/search', auth.verifyToken, docCtrl.search);

docRouter.route('/:id')
  .get(auth.verifyToken, docCtrl.getDocument)
  .put(auth.verifyToken, docCtrl.update)
  .delete(auth.verifyToken, docCtrl.detele);

export default docRouter;
