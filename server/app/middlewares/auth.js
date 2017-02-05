import jwt from 'jsonwebtoken';
import db from '../models/index';

const auth = {

 /**
   * Varify user token
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Object} next move to next controller handler
   * @returns {void} no returns
   */
  varifyToken(req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, 'funmilayoomomowo', (err, decoded) => {
        if (err) {
          res.send({ success: false });
        } else {
          // if everything is good, save to request for use in other routes
          req.tokenDecode = decoded;
          next();
        }
      });
    } else {
      // if there is no token
      res.status(403).send({ success: 'verification failed' });
    }
  },

   /**
   * Check for admin permission
   * @param {Object} req request object
   * @param {Object} res response object
   * @param {Object} next move to next controller handler
   * @returns {void} no returns
   */
  hasAdminPermission(req, res, next) {
    db.Role
      .findById(req.tokenDecode.roleId)
      .then((role) => {
        if (!role) {
          return res.send({ Message: 'error' });
        }
        if (role.title === 'Admin') {
          next();
        } else { return res.send({ Message: 'permission denied' }); }
      });
  }
};

export default auth;
