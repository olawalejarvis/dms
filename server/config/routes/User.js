import express from 'express';
import User from './../../app/controllers/User';
import Auth from './../../app/middlewares/Auth';

const userRouter = express.Router();

userRouter.route('/')
  .get(Auth.verifyToken,
    Auth.validateSearch,
    User.getAll)
  .post(Auth.validateUserInput,
    User.create);

userRouter.route('/login')
  .post(Auth.validateLoginInput, User.login);

userRouter.route('/logout')
  .post(Auth.verifyToken, User.logout);

userRouter.get('/search',
  Auth.verifyToken,
  Auth.validateSearch,
  User.search);

userRouter.route('/:id')
  .get(Auth.verifyToken, Auth.getSingleUser, User.getUser)
  .put(Auth.verifyToken, Auth.validateUserUpdate, User.update)
  .delete(Auth.verifyToken,
    Auth.hasAdminPermission,
    Auth.validateDeleteUser,
    User.delete);

userRouter.route('/:id/documents')
  .get(Auth.verifyToken, Auth.validateSearch, User.findUserDocuments);

export default userRouter;
