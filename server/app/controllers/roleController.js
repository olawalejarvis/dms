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
      .create(req.body)
      .then((role) => {
        res.status(200).send({ message: 'role created successfully', role });
      })
      .catch(error => res.status(400).send({ message: 'error', error }));
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
        if (!role) { return res.status(404).send({ message: 'no role found with this id' }); }
        role.update({ title: req.body.title || role.title })
        .then((updatedRole) => {
          res.status(200).send({ message: updatedRole });
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
        if (!role) { return res.status(404).send({ message: 'no role found with this id' }); }
        role.destroy()
        .then(() => {
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
