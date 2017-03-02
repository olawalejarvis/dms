import jwt from 'jsonwebtoken';
import db from '../models/index';

const secretKey = process.env.SECRET || 'funmilayoomomowo';

const auth = {

 /**
   * Varify user token
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Object} next move to next controller handler
   * @returns {void} no returns
   */
  verifyToken(req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          res.status(401).send({ message: 'invalid token' });
        } else {
          req.tokenDecode = decoded;
          next();
        }
      });
    } else {
      res.status(401).send({ message: 'verification failed' });
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
        } else { return res.status(403).send({ message: 'permission denied' }); }
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
    return (doc.access === 'role' && doc.ownerRoleId === req.tokenDecode.roleId);
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
  }
};

export default auth;
