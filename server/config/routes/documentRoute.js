import express from 'express';
import docCtrl from './../../app/controllers/documentController';
import auth from '../../app/middlewares/auth';

const docRouter = express.Router();

docRouter.route('/')
  .post(auth.varifyToken, docCtrl.createDocument)
  .get(auth.varifyToken, docCtrl.getAllDocument);

docRouter.route('/:id')
  .get(auth.varifyToken, docCtrl.getDocumentById)
  .put(auth.varifyToken, docCtrl.updateDocumentById)
  .delete(docCtrl.deteleDocumentById);


export default docRouter;
