import jwt from 'jsonwebtoken';
import db from '../models/index';

const secretKey = process.env.SECRET || 'funmilayoomomowo';
const defaultValue = 2;

const displayUserAttributes = (user) => {
  const attributes = {
    id: user.id,
    username: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    RoleId: user.RoleId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return attributes;
};

const userCtrl = {
  /**
    * Create a new user
    * Route: POST: /users
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  createUser(req, res) {
    db.User
      .create({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        roleId: req.body.roleId || defaultValue
      })
      .then((user) => {
        const token = jwt.sign({
          userId: user.id,
          roleId: user.roleId
        },
          secretKey, { expiresIn: '7d' }
        );
        user = displayUserAttributes(user);
        return res.status(201).send({ message: 'user created', token, user });
      })
      .catch(err => res.status(400).send({ message: err.message }));
  },

  /**
    * user login
    * Route: POST: /users/login
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  userLogin(req, res) {
    db.User
      .findOne({
        where: {
          email: req.body.email
        }
      })
      .then((user) => {
        if (user && user.validPassword(req.body.password)) {
          const token = jwt.sign({
            userId: user.id,
            roleId: user.roleId
          },
            secretKey, { expiresIn: '7d' }
          );
          user = displayUserAttributes(user);
          return res.status(200).send({
            message: 'logged in',
            token,
            user
          });
        }
        res.status(401).send({
          message: 'failed to login'
        });
      });
  },

  /**
    * logout
    * Route: POST: /users/logout
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  userLogout(req, res) {
    res.status(200).send({
      message: 'logged out'
    });
  },

  /**
    * Get all users
    * Route: GET: /users
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getAllUser(req, res) {
    db.User
      .findAll({
        attributes: [
          'id',
          'username',
          'firstname',
          'lastname',
          'email',
          'roleId',
          'createdAt',
          'updatedAt'
        ]
      })
      .then((users) => {
        if (users) {
          res.status(200).send({ message: users });
        }
      });
  },

  /**
    * Get user by id
    * Route: get: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getUserById(req, res) {
    db.User
      .findById(req.params.id)
      .then((user) => {
        if (user) {
          user = displayUserAttributes(user);
          return res.status(200).send({ message: user });
        }
        res.status(404).send({
          message: `user with ${req.params.id} not found in the database`
        });
      });
  },

  /**
    * Uspdate user attribute
    * Route: PUT: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  updateUserAttribute(req, res) {
    db.User
      .findById(req.params.id)
      .then((result) => {
        if (result) {
          if (String(req.tokenDecode.userId) !== String(req.params.id)) {
            return res.send({ message: 'Permission denied' });
          }
          result.update({
            username: req.body.username || result.username,
            firstname: req.body.firstname || result.firstname,
            lastname: req.body.lastname || result.lastname,
            email: req.body.email || result.email,
            password: req.body.password || result.password
          })
            .then((updatedUser) => {
              updatedUser = displayUserAttributes(updatedUser);
              res.status(200).send({ message: updatedUser });
            });
        } else {
          res.status(404).send({
            message: 'user not found'
          });
        }
      });
  },

  /**
    * Delete a user by id
    * Route: DELETE: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  deleteUser(req, res) {
    db.User
      .findById(req.params.id)
      .then((user) => {
        if (user) {
          user.destroy()
            .then(() => {
              res.status(200).send({
                message: 'deleted successfully'
              });
            });
        } else {
          res.status(404).send({
            message: 'User not found'
          });
        }
      });
  },

  /**
    * Get all document by a user
    * Route: GET: /users/:id/documents
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  findUserDocuments(req, res) {
    db.User
      .findAll({ where: { id: req.params.id }, include: [{ model: db.Document }] })
      .then((user) => {
        if (!user) { return res.status(404).send({ message: 'user not found' }); }
        res.status(200).send({ message: user });
      });
  }

};

export default userCtrl;
