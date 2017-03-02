import express from 'express';
import roleCtrl from './../../app/controllers/RoleController';
import auth from '../../app/middlewares/Auth';

const roleRouter = express.Router();

roleRouter.route('/')
  .post(auth.verifyToken, auth.hasAdminPermission, roleCtrl.create)
  .get(auth.verifyToken, auth.hasAdminPermission, roleCtrl.getAll);

roleRouter.route('/:id')
  .put(auth.verifyToken, auth.hasAdminPermission, roleCtrl.update)
  .delete(auth.verifyToken, auth.hasAdminPermission, roleCtrl.delete)
  .get(auth.verifyToken, auth.hasAdminPermission, roleCtrl.getRole);

export default roleRouter;
