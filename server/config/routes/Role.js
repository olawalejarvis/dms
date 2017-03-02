import express from 'express';
import Role from './../../app/controllers/Role';
import Auth from '../../app/middlewares/Auth';

const roleRouter = express.Router();

roleRouter.route('/')
  .post(Auth.verifyToken, Auth.hasAdminPermission, Role.create)
  .get(Auth.verifyToken, Auth.hasAdminPermission, Role.getAll);

roleRouter.route('/:id')
  .put(Auth.verifyToken, Auth.hasAdminPermission, Role.update)
  .delete(Auth.verifyToken, Auth.hasAdminPermission, Role.delete)
  .get(Auth.verifyToken, Auth.hasAdminPermission, Role.getRole);

export default roleRouter;
