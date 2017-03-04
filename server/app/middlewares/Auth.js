import jwt from 'jsonwebtoken';
import db from '../models/index';

const secretKey = process.env.SECRET || 'funmilayoomomowo';

const Auth = {

 /**
   * Varify user token
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Object} next move to next controller handler
   * @returns {void} no returns
   */
  verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(401)
            .send({
              success: false,
              message: 'The token you supplied has expired'
            });
        }
        db.User.findById(decoded.userId)
          .then((user) => {
            if (!user) {
              return res.status(404)
                .send({
                  success: false,
                  message: 'Account not found, Sign Up or sign in to get access'
                });
            }
            if (!user.active) {
              return res.status(401)
                .send({
                  success: false,
                  message: 'Please sign in to access your account'
                });
            }
            req.tokenDecode = decoded;
            req.tokenDecode.roleId = user.roleId;
            next();
          });
      });
    } else {
      res.status(400)
        .send({
          success: false,
          message: 'Please sign in or register to get a token'
        });
    }
  },

   /**
   * Check for admin permission
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Object} next move to next controller handler
   * @returns {Object} Object
   */
  hasAdminPermission(req, res, next) {
    db.Role
      .findById(req.tokenDecode.roleId)
      .then((role) => {
        if (role.title === 'admin') {
          next();
        } else {
          return res.status(403)
            .send({
              success: false,
              message: 'You are not permitted to perform this action'
            });
        }
      });
  },
  /**
   * Check for admin permission
   * @param {String} roleId user role id
   * @returns {Boolean} true or false
   */
  isAdmin(roleId) {
    return roleId === 1;
  },
  /**
   * Check for regular permission
   * @param {String} roleId user role id
   * @returns {Boolean} true or false
   */
  isRegular(roleId) {
    return roleId === 2;
  },
  /**
   * Check for owner
   * @param {Object} req request object
   * @returns {Boolean} true or false
   */
  isOwner(req) {
    return String(req.tokenDecode.userId) === String(req.params.id);
  },
  /**
   * Check if document's access level is public
   * @param {Object} doc object
   * @returns {Boolean} true or false
   */
  isPublic(doc) {
    return doc.access === 'public';
  },
  /**
   * Check for document's owner
   * @param {Object} doc object
   * @param {Object} req request object
   * @returns {Boolean} true or false
   */
  isOwnerDoc(doc, req) {
    return doc.ownerId === req.tokenDecode.userId;
  },
  /**
   * Check for document's role permission
   * @param {Object} doc object
   * @param {Object} req request object
   * @returns {Boolean} true or false
   */
  hasRoleAccess(doc, req) {
    return (doc.access === 'role'
      && doc.ownerRoleId === req.tokenDecode.roleId);
  },
  /**
   * Get token
   * @param {Object} user user's object
   * @returns {Boolean} true or false
   */
  getToken(user) {
    const userToken = jwt.sign({
      userId: user.id
    },
      secretKey, { expiresIn: '7d' }
    );
    return userToken;
  },
  /**
   * Validate user's input
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   * */
  validateUserInput(req, res, next) {
    if (req.body.roleId && req.body.roleId === 1) {
      return res.status(403)
        .send({
          success: false,
          message: 'Permission denied, You cannot sign up as an admin user'
        });
    }
    let username = /\w+/g.test(req.body.username);
    let firstname = /\w+/g.test(req.body.firstname);
    let lastname = /\w+/g.test(req.body.lastname);
    let email = /\S+@\S+\.\S+/.test(req.body.email);
    let password = /\w+/g.test(req.body.password);

    if (!username) {
      return res.status(400)
        .send({
          success: false,
          message: 'Enter a valid username'
        });
    }
    if (!firstname) {
      return res.status(400)
        .send({
          success: false,
          message: 'Enter a valid firstname'
        });
    }
    if (!lastname) {
      return res.status(400)
        .send({
          success: false,
          message: 'Enter a valid lastname'
        });
    }
    if (!email) {
      return res.status(400)
        .send({
          success: false,
          message: 'Enter a valid email'
        });
    }
    if (!password) {
      return res.status(400)
        .send({
          success: false,
          message: 'Enter a valid password'
        });
    }
    if (req.body.password && req.body.password.length < 8) {
      return res.status(400)
        .send({
          success: false,
          message: 'Minimum of 8 characters is allowed for password'
        });
    }

    db.User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (user) {
          return res.status(409)
            .send({
              success: false,
              message: 'email already exist'
            });
        }
        db.User.findOne({ where: { username: req.body.username } })
          .then((newUser) => {
            if (newUser) {
              return res.status(409)
                .send({
                  success: false,
                  message: 'username already exist'
                });
            }
            username = req.body.username;
            firstname = req.body.firstname;
            lastname = req.body.lastname;
            email = req.body.email;
            password = req.body.password;
            const roleId = req.body.roleId || 2;
            req.userInput =
            { username, firstname, lastname, roleId, email, password };
            next();
          });
      });
  },
  /**
   * Validate user's login datas
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   * */
  validateLoginInput(req, res, next) {
    if (!req.body.password || !req.body.email) {
      return res.status(400)
        .send({
          success: false,
          message: 'Please provide your email and password to login'
        });
    }

    const email = /\S+@\S+\.\S+/.test(req.body.email);
    const password = /\w+/g.test(req.body.password);

    if (!email || !password) {
      return res.status(400)
        .send({
          success: false,
          message: 'Please enter a valid email and password'
        });
    }
    next();
  },
  /**
   * Validate user's input
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   * */
  validateUserUpdate(req, res, next) {
    if (!(Auth.isAdmin(req.tokenDecode.roleId) || Auth.isOwner(req))) {
      return res.status(401)
        .send({
          success: false,
          message: 'You are not permitted to update this profile'
        });
    }
    if (!!req.body.roleId && req.body.roleId === '1') {
      if (!Auth.isAdmin(req.tokenDecode.roleId)) {
        return res.status(403)
          .send({
            success: false,
            message: 'You are not permitted to update role to admin'
          });
      }
    }
    db.User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404)
            .send({
              success: false,
              message: 'This user does not exist'
            });
        }
        req.userInstance = user;
        next();
      });
  },
  /**
   * Validate user to delete, make sure it not admin user
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   *
   */
  validateDeleteUser(req, res, next) {
    db.User.findById(req.params.id)
      .then((user) => {
        if (!user) {
          return res.status(404)
            .send({
              success: false,
              message: 'This user does not exist'
            });
        }
        if (Auth.isAdmin(user.roleId) && user.id === 1) {
          return res.status(403)
            .send({
              success: false,
              message: 'You can not delete the default admin user'
            });
        }
        if (Auth.isRegular(user.roleId) && user.id === 2) {
          return res.status(403)
            .send({ message: 'You can not delete the default regular user' });
        }
        req.userInstance = user;
        next();
      });
  },
  /**
   * Validate search
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   *
   */
  validateSearch(req, res, next) {
    const query = {};
    const terms = [];
    const userQuery = req.query.query;
    const searchArray =
      userQuery ? userQuery.toLowerCase().match(/\w+/g) : null;
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const publishedDate = req.query.publishedDate;
    const order =
      publishedDate && publishedDate === 'ASC' ? publishedDate : 'DESC';

    if (limit < 0 || !/^([1-9]\d*|0)$/.test(limit)) {
      return res.status(400)
        .send({
          success: false,
          message: 'Only positive number is allowed for limit value'
        });
    }
    if (offset < 0 || !/^([1-9]\d*|0)$/.test(offset)) {
      return res.status(400)
        .send({
          success: false,
          message: 'Only positive number is allowed for offset value'
        });
    }

    if (searchArray) {
      searchArray.forEach((word) => {
        terms.push(`%${word}%`);
      });
    }
    query.limit = limit;
    query.offset = offset;
    query.order = [['createdAt', order]];

    if (`${req.baseUrl}${req.route.path}` === '/users/search') {
      if (!req.query.query) {
        return res.status(400)
          .send({
            success: false,
            message: 'Please enter a search query'
          });
      }
      query.where = {
        $or: [
          { username: { $ilike: { $any: terms } } },
          { firstname: { $ilike: { $any: terms } } },
          { lastname: { $ilike: { $any: terms } } },
          { email: { $ilike: { $any: terms } } }
        ]
      };
    }
    if (`${req.baseUrl}${req.route.path}` === '/users/') {
      query.where = Auth.isAdmin(req.tokenDecode.roleId)
        ? {}
        : { id: req.tokenDecode.userId };
    }
    if (`${req.baseUrl}${req.route.path}` === '/documents/search') {
      if (!req.query.query) {
        return res.status(400)
          .send({
            success: false,
            message: 'Please enter a search query'
          });
      }
      if (Auth.isAdmin(req.tokenDecode.roleId)) {
        query.where = Auth.likeSearch(terms);
      } else {
        query.where = {
          $and: [Auth.docAccess(req), Auth.likeSearch(terms)]
        };
      }
    }
    if (`${req.baseUrl}${req.route.path}` === '/documents/') {
      if (Auth.isAdmin(req.tokenDecode.roleId)) {
        query.where = {};
      } else {
        query.where = Auth.docAccess(req);
      }
    }
    if (`${req.baseUrl}${req.route.path}` === '/users/:id/documents') {
      if (Auth.isAdmin(req.tokenDecode.roleId)) {
        query.where = {};
      } else {
        query.where = Auth.docAccess(req);
      }
    }
    req.dmsFilter = query;
    next();
  },
  /**
   * Validate documents input
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   */
  validateDocumentsInput(req, res, next) {
    const title = /\w+/g.test(req.body.title);
    const content = /\w+/g.test(req.body.content);
    if (!req.body.title) {
      return res.status(400)
        .send({
          success: false,
          message: 'Title field is required'
        });
    }
    if (!req.body.content) {
      return res.status(400)
        .send({
          success: false,
          message: 'Content field is required'
        });
    }
    if (!title) {
      return res.status(400)
        .send({
          success: false,
          message: 'Please enter a valid title'
        });
    }
    if (!content) {
      return res.status(400)
        .send({
          success: false,
          message: 'Please enter a valid content'
        });
    }
    if (req.body.access
      && !['public', 'private', 'role'].includes(req.body.access)) {
      return res.status(400)
        .send({
          success: false,
          message: 'Access type can only be public, private or role'
        });
    }
    req.docInput = {
      title: req.body.title,
      content: req.body.content,
      ownerId: req.tokenDecode.userId,
      access: req.body.access,
      ownerRoleId: req.tokenDecode.roleId
    };
    next();
  },
 /**
   * Check for document edit and delete permission
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   */
  hasDocumentPermission(req, res, next) {
    db.Document.findById(req.params.id)
      .then((doc) => {
        if (!doc) {
          return res.status(404)
            .send({
              success: false,
              message: 'This document does not exist'
            });
        }
        if (!Auth.isOwnerDoc(doc, req)
          && !Auth.isAdmin(req.tokenDecode.roleId)) {
          return res.status(401)
            .send({
              success: false,
              message: 'You are not permitted to modify this document'
            });
        }
        req.docInstance = doc;
        next();
      });
  },
 /**
   * Check for role edit and delete permission
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   */
  modifyRolePermission(req, res, next) {
    db.Role.findById(req.params.id)
      .then((role) => {
        if (!role) {
          return res.status(404)
            .send({
              success: false,
              message: 'This role does not exist'
            });
        }
        if (Auth.isAdmin(role.id) || Auth.isRegular(role.id)) {
          return res.status(403)
            .send({
              success: false,
              message: 'You are not permitted to modify this role'
            });
        }
        req.roleInstance = role;
        next();
      });
  },
  /**
   * Query for document's access
   * @param {Object} req request object
   * @returns {Object} return access query
   */
  docAccess(req) {
    const access = {
      $or:
      [
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
    return access;
  },
  /**
   * Query for search terms
   * @param {Array} terms array of search terms
   * @returns {Object} return user's data
   */
  likeSearch(terms) {
    const like = {
      $or:
      [
        { title: { $ilike: { $any: terms } } },
        { content: { $ilike: { $any: terms } } }
      ]
    };
    return like;
  },
};

export default Auth;
