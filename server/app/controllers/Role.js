import db from '../models/index';
import Helper from '../Helper/Helper';

const Role = {

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
        res.status(201)
          .send({
            success: true,
            message: 'Role has been created',
            role
          });
      })
      .catch(error =>
        res.status(400)
          .send({
            success: false,
            errorArray: Helper.errorArray(error)
          }));
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
        res.status(200)
        .send({
          success: true,
          message: 'You have successfully retrived all roles',
          roles
        });
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
    req.roleInstance.update(req.body)
      .then((updatedRole) => {
        res.status(200)
          .send({
            success: true,
            message: 'This role has been updated',
            updatedRole
          });
      })
      .catch(error =>
        res.status(400)
          .send({
            success: false,
            errorArray: Helper.errorArray(error)
          }));
  },

  /**
    * Delete a Role
    * Route: DELETE: /roles/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  delete(req, res) {
    req.roleInstance.destroy()
      .then(() => {
        res.status(200)
          .send({
            success: true,
            message: 'This role has been deleted'
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
        if (!role) {
          return res.status(404)
            .send({
              success: false,
              message: 'This role does not exist'
            });
        }
        res.status(200)
         .send({
           success: true,
           message: 'This role has been retrieved successfully',
           role
         });
      })
      .catch(err => res.status(500).send(err.errors));
  }
};

export default Role;
