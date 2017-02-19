import express from 'express';
import docCtrl from './../../app/controllers/documentController';
import auth from '../../app/middlewares/auth';

const docRouter = express.Router();

docRouter.route('/')
  .post(auth.verifyToken, docCtrl.createDocument)
  .get(auth.verifyToken, docCtrl.getAllDocument);

docRouter.get('/search', auth.verifyToken, docCtrl.searchDocument);

docRouter.route('/:id')
  .get(auth.verifyToken, docCtrl.getDocumentById)
  .put(auth.verifyToken, docCtrl.updateDocumentById)
  .delete(auth.verifyToken, docCtrl.deteleDocumentById);

export default docRouter;
