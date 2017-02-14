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
        if (!role) { return res.send({ message: 'error in creating role' }); }
        res.send({ message: 'role created successfully', role });
      })
      .catch(error => res.status(409).send({ message: 'error', error }));
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
        if (!roles) { return res.send({ message: 'error in getting roles' }); }
        res.status(200).send({ message: roles });
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
        if (!role) { return res.status(404).send({ message: 'error' }); }
        role.update({ title: req.body.title || role.title })
        .then((upRole) => {
          if (!upRole) { return res.send({ message: 'error in updating' }); }
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
        if (!role) { return res.status(404).send({ message: 'error' }); }
        role.destroy()
        .then((del) => {
          if (!del) { return res.send({ message: 'error deleting' }); }
          res.status(200).send({ message: 'role deleted' });
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
        if (!role) { return res.status(404).send({ message: 'no role found' }); }
        res.status(200).send({ message: role });
      });
  }
};

export default roleCtrl;
