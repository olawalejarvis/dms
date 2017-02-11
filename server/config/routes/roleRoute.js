import express from 'express';
import roleCtrl from './../../app/controllers/roleController';
import auth from '../../app/middlewares/auth';

const roleRouter = express.Router();

roleRouter.route('/')
  .post(auth.verifyToken, auth.hasAdminPermission, roleCtrl.createRole)
  .get(auth.verifyToken, auth.hasAdminPermission, roleCtrl.getAllRoles);

roleRouter.route('/:id')
  .put(auth.verifyToken, auth.hasAdminPermission, roleCtrl.updateRole)
  .delete(auth.verifyToken, auth.hasAdminPermission, roleCtrl.deleteRole)
  .get(auth.verifyToken, auth.hasAdminPermission, roleCtrl.getRoleById);

export default roleRouter;
