import db from '../models/';
import Helper from '../Helper/Helper';

const Type = {

  /**
    * Create a new type
    * Route: POST: /types/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  create(req, res) {
    db.Type.create(req.body)
      .then((type) => {
        res.status(201)
          .send({
            message: 'Type successfully created',
            type
          });
      })
      .catch(error =>
        res.status(400)
          .send({
            errorArray: Helper.errorArray(error)
          }));
  },
  /**
    * Get all types
    * Route: GET: /types/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getAll(req, res) {
    db.Type.findAndCountAll()
      .then((types) => {
        res.status(200)
          .send({
            message: 'Type successfully retrieve',
            types
          });
      });
  },
  /**
    * Get a specific type
    * Route: GET: /types/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getType(req, res) {
    db.Type.findById(req.params.id)
      .then((type) => {
        if (!type) {
          return res.status(404)
            .send({
              message: 'Type not found'
            });
        }
        return res.status(200)
          .send({
            message: 'Type successfully retrieve',
            type
          });
      });
  },
  /**
    * Update a types
    * Route: PUT: /types/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  update(req, res) {
    db.Type.findById(req.params.id)
      .then((type) => {
        if (!type) {
          return res.status(400)
            .send({
              message: 'No type found',
            });
        }
        type.update(req.body)
          .then((newType) => {
            res.status(201)
              .send({
                message: 'Updated successfully',
                newType
              })
              .catch(error => res.status(500).send(error.errors));
          });
      });
  },
  /**
    * Delete a types
    * Route: DELETE: /types/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  delete(req, res) {
    db.Type.findById(req.params.id)
      .then((type) => {
        if (!type) {
          return res.status(404)
            .send({
              message: 'Type not found'
            });
        }
        type.destroy()
          .then(() => {
            res.status(200)
              .send({
                message: 'This type has been deleted successfully'
              });
          });
      })
      .catch(error => res.status(500).send(error.errors));
  },
  /**
    * Fecth all document that belong to a type
    * Route: GET: types/:title/documents
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  fetchTypeDocument(req, res) {
    req.dmsFilter.attributes = Helper.getDocAttribute();
    db.Document.findAndCountAll(req.dmsFilter)
      .then((documents) => {
        const condition = {
          count: documents.count,
          limit: req.dmsFilter.limit,
          offset: req.dmsFilter.offset
        };
        delete documents.count;
        const pagination = Helper.pagination(condition);
        res.status(200)
          .send({
            message: `${req.params.title}'s documents retrieved`,
            documents,
            pagination
          });
      });
  }
};

export default Type;
