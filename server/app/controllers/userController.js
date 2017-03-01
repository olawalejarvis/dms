import db from '../models/index';
import auth from '../middlewares/auth';
import dms from '../controllers/helper';

const userCtrl = {
  /**
    * Create a new user
    * Route: POST: /users
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  create(req, res) {
    if (req.body.roleId && req.body.roleId === 1) {
      return res.status(403).send({ message: 'permission denied' });
    }
    const data = dms.getUserData(req.body);
    db.User
      .create(data)
      .then((user) => {
        const token = auth.getToken(user);
        user = dms.userProfile(user);
        return res.status(201).send({ message: 'user created', token, user });
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * user login
    * Route: POST: /users/login
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
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
          const token = auth.getToken(user);
          user = dms.userProfile(user);
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
    res.status(200).send({ message: 'logged out' });
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
      .findAll({ attributes: dms.getUserAttribute() })
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
    * @returns {void|Response} response object or void
    */
  getUser(req, res) {
    db.User
      .findOne({ where: { id: req.params.id }, attributes: dms.getUserAttribute() })
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
    * @returns {void|Response} response object or void
    */
  update(req, res) {
    if (!(auth.isAdmin(req.tokenDecode.roleId) || auth.isOwner(req))) {
      return res.status(401).send({ message: 'Permission denied' });
    }
    db.User
      .findById(req.params.id)
      .then((user) => {
        if (user) {
          user.update(req.body)
            .then((updatedUser) => {
              updatedUser = dms.userProfile(updatedUser);
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
          if (!auth.isAdmin(user.roleId)) {
            user.destroy()
            .then(() => {
              res.status(200).send({
                message: 'deleted successfully'
              });
            });
          } else {
            res.status(403).send({ message: 'can not delete an admin user' });
          }
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
    if (auth.isAdmin(req.tokenDecode.roleId)) {
      query = {};
    } else {
      query = dms.docAccess(req);
    }
    db.User
      .findAll({
        where: { id: req.params.id },
        include: [{ model: db.Document, where: query }],
        attributes: dms.getUserAttribute()
      })
      .then((userDoc) => {
        if (userDoc.length === 0) { return res.status(404).send({ message: 'no document found' }); }
        res.status(200).send(userDoc[0]);
      })
      .catch(err => res.status(500).send(err.errors));
  },
  /**
    * Search users
    * Route: GET: /users/searchs?query=
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  search(req, res) {
    const terms = [];
    let query = {};
    const { limit, offset, order, searchArray } = dms.validateQueries(req.query);

    if (!searchArray) {
      return res.send({ message: 'enter search query' });
    }
    if (!Number(limit) || Number(offset) === 'NaN') {
      return res.status(400).send({ message: 'only number is allowed' });
    }
    if (limit < 0 || offset < 0) {
      return res.status(400).send({ message: 'negative number not allowed' });
    }
    searchArray.forEach((word) => {
      terms.push(`%${word}%`);
    });

    query.where = {
      $or: [
        { username: { $ilike: { $any: terms } } },
        { firstname: { $ilike: { $any: terms } } },
        { lastname: { $ilike: { $any: terms } } },
        { email: { $ilike: { $any: terms } } }
      ]
    };
    query = dms.setLimitOffsetOrder(limit, offset, order, query);
    query.attributes = dms.getUserAttribute();

    db.User.findAndCountAll(query)
      .then((users) => {
        const { next, currentPage } = dms.nextAndCurrentPage(users.count, limit, offset);
        res.status(200).send({ message: 'success', users, next, currentPage });
      });
  }

};

export default userCtrl;
