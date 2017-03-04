import db from '../models/index';
import Auth from '../middlewares/Auth';
import dms from '../Helper';

const Document = {

  /**
    * Create a new document
    * Route: POST: /documents/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Object} response object or void
    */
  create(req, res) {
    db.Document
      .create(req.docInput)
       .then((document) => {
         res.status(201)
          .send({
            success: true,
            message: 'Your document has been successfully created',
            document
          });
       })
       .catch(error => res.status(500).send(error.errors));
  },

  /**
    * Get all document
    * Route: GET: /documents/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} response object or void
    */
  getAll(req, res) {
    db.Document
      .findAndCountAll(req.dmsFilter)
      .then((documents) => {
        const condition = {
          count: documents.count,
          limit: req.dmsFilter.limit,
          offset: req.dmsFilter.offset
        };
        const pagnation = dms.pagnation(condition);
        res.status(200)
          .send({
            success: true,
            message: 'You have successfully retrieved all documents',
            documents,
            pagnation
          });
      })
      .catch(error => res.status(500).send(error.errors));
  },

  /**
    * Get document by ID
    * Route: GET: /documents/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  getDocument(req, res) {
    db.Document
      .findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404)
            .send({
              success: false,
              message: 'This document cannot be found'
            });
        }
        if (Auth.isPublic(document) || Auth.isOwnerDoc(document, req)
          || Auth.isAdmin(req.tokenDecode.roleId)) {
          return res.status(200)
            .send({
              success: true,
              message: 'You have successfully retrived this document',
              document
            });
        }
        if (Auth.hasRoleAccess(document, req)) {
          return res.status(200)
            .send({
              success: true,
              message: 'You have successfully retrived this document',
              document
            });
        }
        res.status(401)
          .send({
            success: false,
            message: 'You are not permitted to view this document'
          });
      })
      .catch(error => res.status(500).send(error.errors));
  },

  /**
    * Update document by id
    * Route: PUT: /documents/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  update(req, res) {
    req.docInstance.update(req.body)
      .then(updatedDocument => res.status(200)
        .send({
          success: true,
          message: 'This document has been updated successfully',
          updatedDocument
        }))
      .catch(error => res.status(500).send(error.errors));
  },

  /**
    * Delete document by id
    * Route: DELETE: /documents/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  detele(req, res) {
    req.docInstance.destroy()
      .then(() => res.status(200)
         .send({
           success: true,
           message: 'This document has been deleted successfully'
         })
      )
      .catch(error => res.status(500).send(error.errors));
  },

  /**
    * Search document
    * Route: GET: /searchs?query={}
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Response} response object or void
    */
  search(req, res) {
    db.Document
      .findAndCountAll(req.dmsFilter)
      .then((documents) => {
        const condition = {
          count: documents.count,
          limit: req.dmsFilter.limit,
          offset: req.dmsFilter.offset
        };
        const pagnation = dms.pagnation(condition);
        res.status(200)
          .send({
            success: true,
            message: 'This search was successfull',
            documents,
            pagnation
          });
      })
      .catch(error => res.status(500).send(error.errors));
  }

};

export default Document;
