import jwt from 'jsonwebtoken';
import db from '../models/index';

const secretKey = process.env.SECRET || 'funmilayoomomowo';
const isAdmin = 1;
const attributes =
  [
    'id',
    'username',
    'firstname',
    'lastname',
    'email',
    'roleId',
    'createdAt',
    'updatedAt'
  ];

const userCtrl = {
  /**
    * Create a new user
    * Route: POST: /users
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  create(req, res) {
    db.User
      .create(req.body)
      .then((user) => {
        const token = jwt.sign({
          userId: user.id,
          roleId: user.roleId
        },
          secretKey, { expiresIn: '7d' }
        );
        user = user.getUserDetail();
        return res.status(201).send({ message: 'user created', token, user });
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * user login
    * Route: POST: /users/login
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  login(req, res) {
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
          user = user.getUserDetail();
          return res.status(200).send({
            message: 'logged in',
            token,
            user
          });
        }
        res.status(401).send({
          message: 'User varification failed'
        });
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * logout
    * Route: POST: /users/logout
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  logout(req, res) {
    res.status(200).send({
      message: 'logged out'
    })
    .catch(err => res.status(500).send(err.errors));
  },

  /**
    * Get all users
    * Route: GET: /users
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getAll(req, res) {
    db.User
      .findAll({ attributes })
      .then((users) => {
        if (users) {
          res.status(200).send({ message: 'success', users });
        }
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * Get user by id
    * Route: get: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getUser(req, res) {
    db.User
      .findOne({ where: { id: req.params.id }, attributes })
      .then((user) => {
        if (user) {
          return res.status(200).send({ message: 'success', user });
        }
        res.status(404).send({
          message: 'user not found'
        });
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * Update user attribute
    * Route: PUT: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  update(req, res) {
    db.User
      .findById(req.params.id)
      .then((user) => {
        if (user) {
          if (String(req.tokenDecode.userId) !== String(req.params.id) && req.tokenDecode.roleId !== isAdmin) {
            return res.status(401).send({ message: 'Permission denied' });
          }
          user.update(req.body)
            .then((updatedUser) => {
              updatedUser = updatedUser.getUserDetail();
              res.status(200).send({ message: 'success', updatedUser });
            });
        } else {
          res.status(404).send({
            message: 'user not found'
          });
        }
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * Delete a user by id
    * Route: DELETE: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  delete(req, res) {
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
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * Get all document by a user
    * Route: GET: /users/:id/documents
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  findUserDocuments(req, res) {
    let query;
    if (req.tokenDecode.roleId === 1) {
      query = {};
    } else {
      query = {
        $or: [
          { access: 'public' },
          { ownerId: req.tokenDecode.userId },
          {
            $and: [
              { access: 'role' },
              { ownerRoleId: req.tokenDecode.roleId }
            ]
          }
        ]
      };
    }
    db.User
      .findAll({
        where: { id: req.params.id },
        include: [{ model: db.Document, where: query }],
        attributes
      })
      .then((userDoc) => {
        if (userDoc.length === 0) { return res.status(404).send({ message: 'no document found' }); }
        res.status(200).send(userDoc[0]);
      })
      .catch(err => res.status(500).send(err.errors));
  }

};

export default userCtrl;
