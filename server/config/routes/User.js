import express from 'express';
import User from './../../app/controllers/User';
import Auth from './../../app/middlewares/Auth';

const userRouter = express.Router();

userRouter.route('/')
  .get(Auth.verifyToken, Auth.hasAdminPermission, User.getAll)
  .post(User.create);

userRouter.route('/login')
  .post(User.login);

userRouter.route('/logout')
  .post(Auth.verifyToken, User.logout);

userRouter.get('/search', Auth.verifyToken, User.search);

userRouter.route('/:id')
  .get(Auth.verifyToken, User.getUser)
  .put(Auth.verifyToken, User.update)
  .delete(Auth.verifyToken, Auth.hasAdminPermission, User.delete);

userRouter.route('/:id/documents')
  .get(Auth.verifyToken, User.findUserDocuments);

export default userRouter;
