import express from 'express';
import docCtrl from './../../app/controllers/documentController';
import auth from '../../app/middlewares/auth';

const docRouter = express.Router();

docRouter.route('/')
  .post(auth.verifyToken, docCtrl.createDocument)
  .get(auth.verifyToken, docCtrl.getAllDocument);

docRouter.route('/:id')
  .get(auth.verifyToken, docCtrl.getDocumentById)
  .put(auth.verifyToken, docCtrl.updateDocumentById)
  .delete(docCtrl.deteleDocumentById);


export default docRouter;
