import express from 'express';
import Document from './../../app/controllers/Document';
import Auth from '../../app/middlewares/Auth';

const docRouter = express.Router();

docRouter.route('/')
  .post(Auth.verifyToken,
    Auth.validateDocumentsInput,
    Document.create)
  .get(Auth.verifyToken,
    Auth.validateSearch,
    Document.getAll);

docRouter.get('/search',
  Auth.verifyToken,
  Auth.validateSearch,
  Document.search);

docRouter.route('/:id')
  .get(Auth.verifyToken,
    Auth.getSingleDocument,
    Document.getDocument)
  .put(Auth.verifyToken,
    Auth.hasDocumentPermission,
    Document.update)
  .delete(Auth.verifyToken,
    Auth.hasDocumentPermission,
    Document.detele);

export default docRouter;
