import jwt from 'jsonwebtoken';
import db from '../models/index';

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
      })
      .then((user) => {
        const token = jwt.sign({
          userId: user.id,
          roleId: user.roleId
        },
          process.env.SECRET, { expiresIn: '365d' }
        );
        res.status(201).send({ message: 'user created', token });
      })
      .catch(() => res.status(400).send({
        message: 'error in creating user'
      }));
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
      .then((result) => {
        if (result && result.validPassword(req.body.password)) {
          const token = jwt.sign({
            userId: result.id,
            roleId: result.roleId
          },
            process.env.SECRET, { expiresIn: '365d' }
          );
          res.send({
            message: 'login',
            token
          });
        }
        res.send({
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
    res.send({
      message: 'hello logout'
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
      .then((result) => {
        if (result) {
          res.send({
            message: result
          });
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
          res.status(200).send({
            message: user
          });
        }
        res.send({
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
    if (String(req.tokenDecode.userId) !== String(req.params.id)) {
      return res.send({ message: 'Permission denied' });
    }
    db.User
      .findById(req.params.id)
      .then((result) => {
        if (result) {
          result.update({
            username: req.body.username || result.username,
            firstname: req.body.firstname || result.firstname,
            lastname: req.body.lastname || result.lastname,
            email: req.body.email || result.email,
            password: req.body.password || result.password
          })
            .then((upUser) => {
              if (upUser) {
                res.send({
                  message: upUser
                });
              } else {
                res.send({
                  message: 'unable to update'
                });
              }
            });
        } else {
          res.send({
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
            .then((delUser) => {
              if (delUser) {
                res.send({
                  message: 'deleted successfully'
                });
              } else {
                res.send({
                  message: 'unable to delete user'
                });
              }
            });
        } else {
          res.send({
            message: 'id not found'
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
        if (!user) { res.send({ message: 'user not found' }); }
        res.send({ message: user });
      });
  }

};

export default userCtrl;
