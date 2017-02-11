import express from 'express';
import userCtrl from './../../app/controllers/userController';
import auth from './../../app/middlewares/auth';

const userRouter = express.Router();

userRouter.route('/')
  .get(auth.verifyToken, auth.hasAdminPermission, userCtrl.getAllUser)
  .post(userCtrl.createUser);

userRouter.route('/login')
  .post(userCtrl.userLogin);

userRouter.route('/logout')
  .post(userCtrl.userLogout);

userRouter.route('/:id')
  .get(auth.verifyToken, userCtrl.getUserById)
  .put(auth.verifyToken, userCtrl.updateUserAttribute)
  .delete(auth.verifyToken, auth.hasAdminPermission, userCtrl.deleteUser);

userRouter.route('/:id/documents')
  .get(auth.verifyToken, userCtrl.findUserDocuments);


export default userRouter;
