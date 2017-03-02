import jwt from 'jsonwebtoken';
import db from '../models/index';
import dms from '../controllers/Helper';

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
      // verifies secret and checks exp
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(401)
            .send({ message: 'invalid token' });
        } else {
          req.tokenDecode = decoded;
          next();
        }
      });
    } else {
      res.status(401)
        .send({ message: 'verification failed' });
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
            .send({ message: 'permission denied' });
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
      userId: user.id,
      roleId: user.roleId
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
        .send({ message: 'Permission denied, You cannot sign up as admin' });
    }

    if (!req.body.username && !req.body.firstname
      && !req.body.lastname && !req.body.email && req.body.password) {
      return res.status(406)
        .send({ message: 'Incomplete users parameters' });
    }

    const username = /\w+/g.test(req.body.username);
    const firstname = /\w+/g.test(req.body.firstname);
    const lastname = /\w+/g.test(req.body.lastname);
    const email = /\S+@\S+\.\S+/.test(req.body.email);
    const password = /\w+/g.test(req.body.password);

    if (!username && !firstname && !lastname && !email && !password) {
      return res.status(400)
        .send({ message: 'Enter a valid username, firstname or lastname' });
    }
    if (password.length < 8) {
      return res.status(406)
        .send({ message: 'Minimum of 8 characters is allowed' });
    }

    db.User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (user) {
          return res.status(409)
            .send({ message: 'Email already exist' });
        }
        db.User.findOne({ where: { username: req.body.username } })
          .then((newUser) => {
            if (newUser) {
              return res.status(409)
                .send({ message: 'Username already exist' });
            }
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
    if (!req.body.password && !req.body.email) {
      return res.status(406)
        .send({ message: 'Some fields are missing' });
    }

    const email = /\S+@\S+\.\S+/.test(req.body.email);
    const password = /\w+/g.test(req.body.password);

    if (!email && !password) {
      return res.status(400)
        .send({ message: 'Please enter a valid email and password' });
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
    if (!(this.isAdmin(req.tokenDecode.roleId) || this.isOwner(req))) {
      return res.status(401)
        .send({ message: 'You are not permitted to update this profile' });
    }

    const username = /\w+/g.test(req.body.username);
    const firstname = /\w+/g.test(req.body.firstname);
    const lastname = /\w+/g.test(req.body.lastname);
    const email = /\S+@\S+\.\S+/.test(req.body.email);
    const password = /\w+/g.test(req.body.password);

    if (req.body.username && !username) {
      return res.status(400)
        .send({ message: 'Please enter a valid username' });
    }
    if (req.body.firstname && !firstname) {
      return res.status(400)
        .send({ message: 'Please enter a valid firstname' });
    }
    if (req.body.lastname && !lastname) {
      return res.status(400)
        .send({ message: 'Please enter a valid lastname' });
    }
    if (req.body.email && !email) {
      return res.status(400)
        .send({ message: 'Please enter a valid email' });
    }
    if (req.body.password && !password) {
      return res.status(400)
        .send({ message: 'Please enter a valid password' });
    }
    next();
  },
  /**
   * Find User's Document Query
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   * */
  findUsersDocument(req, res, next) {
    let query = {};
    if (!this.isAdmin(req.tokenDecode.roleId)) {
      query = dms.docAccess(req);
    }
    req.findUserQuery = query;
    next();
  },
  /**
   * Validate user to delete, make sure it not admin user
   * @param {Object} req req object
   * @param {Object} res response object
   * @param {Object} next Move to next controller handler
   * @returns {void|Object} response object or void
   * */
  validateDeleteUser(req, res, next) {
    db.User.findById(req.params.id)
      .then((user) => {
        if (user) {
          if (this.isAdmin(user.roleId)) {
            res.status(403)
              .send({ message: 'You can not delete an admin user' });
          }
          next();
        }
        res.status(404)
          .send({ message: 'User not found' });
      });
  },
  validateSearch(req, res, next) {
    const query = {};
    const terms = [];
    const userQuery = req.query.query;
    const searchArray =
      userQuery ? userQuery.toLowerCase().match(/\w+/g) : null;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const publishedDate = req.query.publishedDate;
    const order =
      publishedDate && publishedDate === 'ASC' ? publishedDate : 'DESC';

    if (limit <= 0) {
      return res.status(400)
        .send({ message: 'Limit cannot be a negative number' });
    }
    if (offset <= 0) {
      return res.status(400)
        .send({ message: 'Offset cannot be a negative number' });
    }
    if (!Number(limit)) {
      return res.status(400)
        .send({ message: 'Limit only accept number is allowed' });
    }
    if (!Number(offset)) {
      return res.status(400)
        .send({ message: 'Offset only accept number is allowed' });
    }
    if (searchArray) {
      searchArray.forEach((word) => {
        terms.push(`%${word}%`);
      });
    }
    query.limit = limit;
    query.offset = offset;
    query.order = [['createdAt', order]];

    req.dmsFilter = { query, terms };
    next();
  }
};

export default Auth;
