import express from 'express';
import roleCtrl from './../../app/controllers/roleController';
import auth from '../../app/middlewares/auth';

const roleRouter = express.Router();

roleRouter.route('/')
  .post(auth.varifyToken, auth.hasAdminPermission, roleCtrl.createRole)
  .get(auth.varifyToken, auth.hasAdminPermission, roleCtrl.getAllRoles);

roleRouter.route('/:id')
  .put(auth.varifyToken, auth.hasAdminPermission, roleCtrl.updateRole)
  .delete(auth.varifyToken, auth.hasAdminPermission, roleCtrl.deleteRole)
  .get(auth.varifyToken, auth.hasAdminPermission, roleCtrl.getRoleById);

export default roleRouter;
