import express from 'express';
import { User, Document } from './../../app/controllers/';
import Auth from '../../app/middlewares/Auth';

const adminRouter = express.Router();

// admin create/get users route
adminRouter.route('/users')
  .get(Auth.verifyToken, // to get user
  Auth.hasAdminPermission,
  Auth.validateSearch,
  User.getAll)
  .post(Auth.verifyToken,  // to create user
  Auth.hasAdminPermission,
  Auth.validateUserInput,
  User.create);

// to get disable users
adminRouter.get('/users/disable',
  Auth.verifyToken,
  Auth.hasAdminPermission,
  Auth.validateSearch,
  User.getDisableUser);

// to get disable documents
adminRouter.get('/documents/disable',
  Auth.verifyToken,
  Auth.hasAdminPermission,
  Auth.validateSearch,
  Document.getDisableDocument);

export default adminRouter;
