import db from '../models/index';

const roleCtrl = {

  /**
    * Create a new role
    * Route: POST: /roles/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  createRole(req, res) {
    db.Role
      .create({ title: req.body.title })
      .then((role) => {
        if (!role) { res.send({ message: 'error in creating role' }); }
        res.send({ message: 'role created successfully' });
      })
      .catch(error => res.send({ message: error }));
  },

  /**
    * Get all roles
    * Route: GET: /roles/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getAllRoles(req, res) {
    db.Role
      .findAll()
      .then((roles) => {
        if (!roles) { res.send({ message: 'error in getting roles' }); }
        res.send({ message: roles });
      });
  },

  /**
    * Update roles
    * Route: PUT: /roles/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  updateRole(req, res) {
    db.Role
      .findById(req.params.id)
      .then((role) => {
        if (!role) { res.send({ message: 'error' }); }
        role.update({ title: req.body.title || role.title })
        .then((upRole) => {
          if (!upRole) { res.send({ message: 'error in updating' }); }
          res.send({ message: upRole });
        });
      });
  },

  /**
    * Delete a Role
    * Route: DELETE: /roles/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  deleteRole(req, res) {
    db.Role
      .findById(req.params.id)
      .then((role) => {
        if (!role) { res.send({ message: 'error' }); }
        role.destroy()
        .then((del) => {
          if (!del) { res.send({ message: 'error deleting' }); }
          res.send({ message: 'role deleted' });
        });
      });
  },

  /**
    * Get role by id
    * Route: GET: /roles/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getRoleById(req, res) {
    db.Role
      .findById(req.params.id)
      .then((role) => {
        if (!role) { res.send({ message: 'no role found' }); }
        res.send({ message: role });
      });
  }
};

export default roleCtrl;
