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
          res.status(401).send({ success: false });
        } else {
          // if everything is good, save to request for use in other routes
          req.tokenDecode = decoded;
          next();
        }
      });
    } else {
      // if there is no token
      res.status(401).send({ message: 'verification failed' });
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
          return res.status(403).send({ message: 'error new error' });
        }
        if (role.title === 'admin') {
          next();
        } else { return res.status(403).send({ message: 'permission denied' }); }
      });
  }
};

export default auth;
