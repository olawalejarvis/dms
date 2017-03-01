import express from 'express';
import userCtrl from './../../app/controllers/userController';
import auth from './../../app/middlewares/auth';

const userRouter = express.Router();

userRouter.route('/')
  .get(auth.verifyToken, auth.hasAdminPermission, userCtrl.getAll)
  .post(userCtrl.create);

userRouter.route('/login')
  .post(userCtrl.login);

userRouter.route('/logout')
  .post(auth.verifyToken, userCtrl.logout);

userRouter.get('/search', auth.verifyToken, userCtrl.search);

userRouter.route('/:id')
  .get(auth.verifyToken, userCtrl.getUser)
  .put(auth.verifyToken, userCtrl.update)
  .delete(auth.verifyToken, auth.hasAdminPermission, userCtrl.delete);

userRouter.route('/:id/documents')
  .get(auth.verifyToken, userCtrl.findUserDocuments);

export default userRouter;
