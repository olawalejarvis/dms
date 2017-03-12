import express from 'express';
import { Type } from './../../app/controllers';
import Auth from './../../app/middlewares/Auth';

const typeRouter = express.Router();

typeRouter.route('/')
  .get(Auth.verifyToken, Type.getAll)
  .post(Auth.verifyToken, Auth.hasAdminPermission, Type.create);

typeRouter.route('/:id')
  .put(Auth.verifyToken, Auth.hasAdminPermission, Type.update)
  .delete(Auth.verifyToken, Auth.hasAdminPermission, Type.delete)
  .get(Auth.verifyToken, Type.getType);

typeRouter.get('/:title/documents',
  Auth.verifyToken,
  Auth.validateSearch,
  Type.fetchTypeDocument);

export default typeRouter;
