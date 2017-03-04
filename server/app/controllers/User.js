import db from '../models/index';
import Auth from '../middlewares/Auth';
import dms from '../Helper';

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
        user = dms.userProfile(user);
        return res.status(201)
          .send({
            success: true,
            message: 'Your account has been created successfully',
            token,
            user
          });
      })
      .catch(error =>
        res.status(400)
          .send({
            success: false,
            errorArray: dms.errorArray(error)
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
          user = dms.getUserProfile(user);
          return res.status(200)
            .send({
              success: true,
              message: 'You have successfully logged in',
              token,
              user
            });
        }
        res.status(401)
          .send({
            success: false,
            message: 'Please enter a valid email or password to log in'
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
    db.User.findById(req.tokenDecode.userId)
      .then((user) => {
        user.update({ active: false });
        return res.status(200)
          .send({
            success: true,
            message: 'You have successfully logged out'
          });
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
    req.dmsFilter.attributes = dms.getUserAttribute();
    db.User
      .findAndCountAll(req.dmsFilter)
      .then((users) => {
        if (users) {
          const condition = {
            count: users.count,
            limit: req.dmsFilter.limit,
            offset: req.dmsFilter.offset
          };
          const pagnation = dms.pagnation(condition);
          res.status(200)
            .send({
              success: true,
              message: 'You have successfully retrived all users',
              users,
              pagnation
            });
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
      .findOne({
        where: { id: req.params.id },
        attributes: dms.getUserAttribute()
      })
      .then((user) => {
        if (user) {
          return res
            .status(200)
            .send({
              success: true,
              message: 'You have successfully retrived this user',
              user
            });
        }
        res.status(404)
          .send({
            success: false,
            message: 'This user does not exist'
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
    const errorArray = [];
    req.userInstance.update(req.body)
      .then((updatedUser) => {
        updatedUser = dms.getUserProfile(updatedUser);
        return res.status(200)
          .send({
            success: true,
            message: 'Your profile has been updated',
            updatedUser
          });
      })
      .catch((err) => {
        err.errors.forEach((error) => {
          errorArray.push({ path: error.path, message: error.message });
        });
        return res.status(400)
          .send({
            success: false,
            errorArray
          });
      });
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
            success: true,
            message: 'This account has bee successfully deleted'
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
              success: false,
              message: 'This user does not exist'
            });
        }
        userDocuments.user = dms.getUserProfile(user);
        req.dmsFilter.where.ownerId = req.params.id;
        req.dmsFilter.attributes = dms.getDocAttribute();
        db.Document.findAndCountAll(req.dmsFilter)
          .then((docs) => {
            const condition = {
              count: docs.count,
              limit: req.dmsFilter.limit,
              offset: req.dmsFilter.offset
            };
            const pagnation = dms.pagnation(condition);
            userDocuments.documents = docs;
            return res.status(200)
              .send({
                success: true,
                message: `This user's documents
                  was successfully retrieved`,
                userDocuments,
                pagnation
              });
          })
          .catch(err => res.status(500).send(err.errors));
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
    const request = req.dmsFilter;
    let condition = {};
    let pagnation;
    request.attributes = dms.getUserAttribute();
    db.User.findAndCountAll(request)
      .then((users) => {
        condition = {
          count: users.count,
          limit: request.limit,
          offset: request.offset
        };
        pagnation = dms.pagnation(condition);
        res.status(200)
          .send({
            success: true,
            message: 'Your search was successful',
            users,
            pagnation
          });
      });
  }

};

export default User;
