import express from 'express';
import userCtrl from './../../app/controllers/userController';
import auth from './../../app/middlewares/auth';

const userRouter = express.Router();

userRouter.route('/')
  .get(auth.varifyToken, auth.hasAdminPermission, userCtrl.getAllUser)
  .post(userCtrl.createUser);

userRouter.route('/login')
  .post(userCtrl.userLogin);

userRouter.route('/logout')
  .post(userCtrl.userLogout);

userRouter.route('/:id')
  .get(auth.varifyToken, userCtrl.getUserById)
  .put(auth.varifyToken, userCtrl.updateUserAttribute)
  .delete(auth.varifyToken, auth.hasAdminPermission, userCtrl.deleteUser);

userRouter.route('/:id/documents')
  .get(auth.varifyToken, userCtrl.findUserDocuments);


export default userRouter;
