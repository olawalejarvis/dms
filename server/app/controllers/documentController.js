import db from '../models/index';
import dms from '../middlewares/helper';
import auth from '../middlewares/auth';

const docCtrl = {

  /**
    * Create a new document
    * Route: POST: /documents/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  create(req, res) {
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
    * @returns {void} no returns
    */
  getAll(req, res) {
    let query;
    if (auth.isAdmin(req.tokenDecode.roleId)) {
      query = {
        where: {}
      };
    } else {
      query = {
        where: {
          $or: [
            { access: 'public' },
            { ownerId: req.tokenDecode.userId },
            {
              $and: [
                { access: 'role' },
                { ownerRoleId: req.tokenDecode.roleId }
              ]
            }
          ]
        },
      };
    }
    query.limit = req.query.limit || null;
    query.offset = req.query.offset || null;
    query.order = [['createdAt', 'DESC']];

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
    if (!req.query.query) {
      return res.send({ message: 'enter search query' });
    }

    const terms = [];
    let query;
    const searchArray = req.query.query.toLowerCase().match(/\w+/g);
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const publishedDate = req.query.publishedDate;

    const order = publishedDate && publishedDate === 'ASC' ? publishedDate : 'DESC';

    if (!Number(limit)) {
      return res.status(400).send({ message: 'only number is allowed' });
    }
    if (limit < 0 || offset < 0) {
      return res.status(400).send({ message: 'negative number not allowed' });
    }

    searchArray.forEach((word) => {
      terms.push(`%${word}%`);
    });

    if (auth.isAdmin(req.tokenDecode.roleId)) {
      query = {
        where: {
          $or: [
            { title: { $ilike: { $any: terms } } },
            { content: { $ilike: { $any: terms } } }
          ]
        }
      };
    } else {
      query = {
        where: {
          $and: [
            {
              $or: [
                { access: 'public' },
                { ownerId: req.tokenDecode.userId },
                { $and: [
                  { access: 'role' },
                  { ownerRoleId: req.tokenDecode.roleId }
                ] }
              ]
            },
            {
              $or: [
                { title: { $ilike: { $any: terms } } },
                { content: { $ilike: { $any: terms } } }
              ]
            }
          ]
        },
      };
    }

    query.limit = limit;
    query.offset = offset;
    query.order = [['createdAt', order]];

    db.Document
      .findAll(query)
      .then((docs) => {
        res.status(200).send({ message: 'success', docs });
      })
      .catch(error => res.status(500).send(error.errors));
  }

};

export default docCtrl;
