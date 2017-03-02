import db from '../models/index';
import dms from '../controllers/Helper';
import auth from '../middlewares/Auth';

const docCtrl = {

  /**
    * Create a new document
    * Route: POST: /documents/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void|Object} response object or void
    */
  create(req, res) {
    const { title, content } = dms.validateDocumentsInput(req);
    if (!title) {
      return res.status(400).send({ message: 'Title field cannot be empty' });
    }
    if (!content) {
      return res.status(400).send({ message: 'Content field cannot be empty' });
    }
    db.Document
      .create(dms.getDocumentData(req))
       .then((document) => {
         res.status(201).send({ message: 'success', document });
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
    let query = {};
    if (auth.isAdmin(req.tokenDecode.roleId)) {
      query.where = {};
    } else {
      query.where = dms.docAccess(req);
    }
    const { limit, offset, order } = dms.validateQueries(req.query);

    if (!Number(limit) || Number(offset) === 'NaN') {
      return res.status(400).send({ message: 'only number is allowed' });
    }
    if (limit < 0 || offset < 0) {
      return res.status(400).send({ message: 'negative number not allowed' });
    }

    query = dms.setLimitOffsetOrder(limit, offset, order, query);

    db.Document
      .findAll(query)
      .then((docs) => {
        res.status(200).send({ message: 'success', docs });
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
      .then((doc) => {
        if (!doc) {
          return res.status(404).send({ message: 'document not found' });
        }
        if (auth.isPublic(doc) || auth.isOwnerDoc(doc, req)
          || auth.isAdmin(req.tokenDecode.roleId)) {
          return res.status(200).send({ message: 'success', doc });
        }
        if (auth.hasRoleAccess(doc, req)) {
          return res.status(200).send({ message: 'success', doc });
        }
        res.status(401).send({ message: 'permission denied' });
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
    db.Document
      .findById(req.params.id)
      .then((doc) => {
        if (!doc) { return res.status(404).send({ message: 'document not found' }); }
        if (auth.isOwnerDoc(doc, req) || auth.isAdmin(req.tokenDecode.roleId)) {
          doc.update(req.body)
          .then(updatedDocument => res.status(200).send({ message: 'success', updatedDocument }));
        } else {
          res.status(401).send({ message: 'permission denied' });
        }
      })
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
    db.Document
      .findById(req.params.id)
      .then((doc) => {
        if (!doc) { return res.status(404).send({ message: 'no document found' }); }
        if (auth.isOwnerDoc(doc, req) || auth.isAdmin(req.tokenDecode.roleId)) {
          doc.destroy()
          .then(() => res.status(200).send({ message: 'document deleted' }));
        } else { res.status(401).send({ message: 'permission denied' }); }
      })
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
    const terms = [];
    let query = {};
    const { limit, offset, order, searchArray } = dms.validateQueries(req.query);

    if (!searchArray) {
      return res.send({ message: 'enter search query' });
    }

    if (!Number(limit) || Number(offset) === 'NaN') {
      return res.status(400).send({ message: 'only number is allowed' });
    }
    if (limit < 0 || offset < 0) {
      return res.status(400).send({ message: 'negative number not allowed' });
    }

    searchArray.forEach((word) => {
      terms.push(`%${word}%`);
    });

    if (auth.isAdmin(req.tokenDecode.roleId)) {
      query.where = dms.likeSearch(terms);
    } else {
      query.where = {
        $and: [dms.docAccess(req), dms.likeSearch(terms)]
      };
    }
    query = dms.setLimitOffsetOrder(limit, offset, order, query);

    db.Document
      .findAndCountAll(query)
      .then((docs) => {
        const { next, currentPage } = dms.nextAndCurrentPage(docs.count, limit, offset);
        res.status(200).send({ message: 'success', docs, next, currentPage });
      })
      .catch(error => res.status(500).send(error.errors));
  }

};

export default docCtrl;
