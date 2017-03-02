import db from '../models/index';

const roleCtrl = {

  /**
    * Create a new role
    * Route: POST: /roles/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  create(req, res) {
    db.Role
      .create(req.body)
      .then((role) => {
        res.status(200).send({ message: 'success', role });
      })
      .catch(error => res.status(500).send(error.errors));
  },

  /**
    * Get all roles
    * Route: GET: /roles/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getAll(req, res) {
    db.Role
      .findAll()
      .then((roles) => {
        res.status(200).send({ message: 'success', roles });
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * Update roles
    * Route: PUT: /roles/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  update(req, res) {
    db.Role
      .findById(req.params.id)
      .then((role) => {
        if (!role) { return res.status(404).send({ message: 'role not found' }); }
        role.update(req.body)
        .then((updatedRole) => {
          res.status(200).send({ message: 'success', updatedRole });
        });
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * Delete a Role
    * Route: DELETE: /roles/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  delete(req, res) {
    db.Role
      .findById(req.params.id)
      .then((role) => {
        if (!role) { return res.status(404).send({ message: 'role not found' }); }
        role.destroy()
        .then(() => {
          res.status(200).send({ message: 'role deleted' });
        });
      })
      .catch(err => res.status(500).send(err.errors));
  },

  /**
    * Get role by id
    * Route: GET: /roles/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getRole(req, res) {
    db.Role
      .findById(req.params.id)
      .then((role) => {
        if (!role) { return res.status(404).send({ message: 'role not found' }); }
        res.status(200).send({ message: 'success', role });
      })
      .catch(err => res.status(500).send(err.errors));
  }
};

export default roleCtrl;
