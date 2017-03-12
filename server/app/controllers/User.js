import db from '../models/index';
import Auth from '../middlewares/Auth';
import Helper from '../Helper/Helper';

const User = {
  /**
    * Create a new user
    * Route: POST: /users
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  create(req, res) {
    db.User
      .create(req.userInput)
      .then((user) => {
        const token = Auth.getToken(user);
        user = Helper.userProfile(user);
        return res.status(201)
          .send({
            message: 'Your account has been created successfully',
            token,
            user
          });
      })
      .catch(error =>
        res.status(400)
          .send({
            errorArray: Helper.errorArray(error)
          }));
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
      .findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (user && user.validPassword(req.body.password)) {
          user.update({ active: true });
          const token = Auth.getToken(user);
          user = Helper.getUserProfile(user);
          return res.status(200)
            .send({
              message: 'You have successfully logged in',
              token,
              user
            });
        }
        res.status(401)
          .send({
            message: 'Please enter a valid email or password to log in'
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
  logout(req, res) {
    db.User.findById(req.tokenDecode.userId)
      .then((user) => {
        user.update({ active: false })
          .then(() =>
            res.status(200)
              .send({
                message: 'You have successfully logged out'
              }));
      });
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
      .findAndCountAll(req.dmsFilter)
      .then((users) => {
        if (users) {
          const condition = {
            count: users.count,
            limit: req.dmsFilter.limit,
            offset: req.dmsFilter.offset
          };
          delete users.count;
          const pagination = Helper.pagination(condition);
          res.status(200)
            .send({
              message: 'You have successfully retrived all users',
              users,
              pagination
            });
        }
      });
  },

  /**
    * Get user by id
    * Route: get: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  getUser(req, res) {
    return res.status(200)
      .send({
        message: 'You have successfully retrived this user',
        user: Helper.getUserProfile(req.getUser)
      });
  },

  /**
    * Update user attribute
    * Route: PUT: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  update(req, res) {
    req.userInstance.update(req.body)
      .then((updatedUser) => {
        if (req.body.roleId) {
          db.Document.update({ ownerRoleId: req.body.roleId },
            { where: { ownerId: updatedUser.id } });
        }
        if (req.body.disable) {
          db.Document.update({ disable: req.body.disable },
          { where: { ownerId: updatedUser.id } });
        }
        res.status(200)
          .send({
            message: 'Your profile has been updated',
            updatedUser
          });
      })
      .catch(err =>
        res.status(400)
          .send({
            errorArray: Helper.errorArray(err)
          }));
  },

  /**
    * Delete a user by id
    * Route: DELETE: /users/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  delete(req, res) {
    req.userInstance.destroy()
      .then(() => {
        res.status(200)
          .send({
            message: 'This account has been successfully deleted'
          });
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
    const userDocuments = {};
    db.User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404)
            .send({
              message: 'This user does not exist'
            });
        }
        if (user.disable) {
          return res.status(400)
            .send({ message: 'This account has been disable' });
        }
        userDocuments.user = Helper.getUserProfile(user);
        req.dmsFilter.where.ownerId = req.params.id;
        req.dmsFilter.attributes = Helper.getDocAttribute();
        db.Document.findAndCountAll(req.dmsFilter)
          .then((docs) => {
            const condition = {
              count: docs.count,
              limit: req.dmsFilter.limit,
              offset: req.dmsFilter.offset
            };
            delete docs.count;
            const pagination = Helper.pagination(condition);
            userDocuments.documents = docs;
            return res.status(200)
              .send({
                message: 'This user\'s documents was successfully retrieved',
                userDocuments,
                pagination
              });
          });
      });
  },
  /**
    * Search users
    * Route: GET: /users/searchs?query=
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  search(req, res) {
    const request = req.dmsFilter;
    let condition = {};
    let pagination;
    request.attributes = Helper.getUserAttribute();
    db.User.findAndCountAll(request)
      .then((users) => {
        condition = {
          count: users.count,
          limit: request.limit,
          offset: request.offset
        };
        delete users.count;
        pagination = Helper.pagination(condition);
        res.status(200)
          .send({
            message: 'Your search was successful',
            users,
            pagination
          });
      });
  },
  /**
    * Get disable users
    * Route: GET: admin/users/disable
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  getDisableUser(req, res) {
    db.User.findAndCountAll({ where: { disable: true } })
      .then((user) => {
        const condition = {
          count: user.count,
          limit: req.dmsFilter.limit,
          offset: req.dmsFilter.offset
        };
        delete user.count;
        const pagination = Helper.pagination(condition);
        return res.status(200)
          .send({
            message: 'Disable users has been successfully retrieved',
            user,
            pagination
          });
      });
  }

};

export default User;
