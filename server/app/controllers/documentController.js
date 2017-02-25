import db from '../models/index';

const isAdmin = 1;

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
      .create({
        title: req.body.title,
        content: req.body.content,
        ownerId: req.tokenDecode.userId,
        access: req.body.access,
        ownerRoleId: req.tokenDecode.roleId
      })
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
    if (req.tokenDecode.roleId === isAdmin) {
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
    * @returns {void} no returns
    */
  getDocument(req, res) {
    db.Document
      .findById(req.params.id)
      .then((doc) => {
        if (!doc) {
          return res.status(404).send({ message: 'document not found' });
        }
        if (doc.access === 'public' || doc.ownerId === req.tokenDecode.userId || req.tokenDecode.roleId === isAdmin) {
          return res.status(200).send({ message: 'success', doc });
        }
        if (doc.access === 'role' && doc.ownerRoleId === req.tokenDecode.roleId) {
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
        if (doc.ownerId === req.tokenDecode.userId || req.tokenDecode.roleId === isAdmin) {
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
        if (doc.ownerId === req.tokenDecode.userId || req.tokenDecode.roleId === isAdmin) {
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
    * @returns {void} no returns
    */
  search(req, res) {
    if (!req.query.query) {
      return res.send({ message: 'enter search query' });
    }

    const terms = [];
    let query;
    const searchArray = req.query.query.toLowerCase().match(/\w+/g);
    const limit = req.query.limit || 20;
    const offset = req.query.offset || null;
    const order = [['createdAt', 'DESC']];

    searchArray.forEach((word) => {
      terms.push(`%${word}%`);
    });

    if (req.tokenDecode.roleId === isAdmin) {
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
    query.order = order;

    db.Document
      .findAll(query)
      .then((docs) => {
        res.status(200).send({ message: 'success', docs });
      })
      .catch(error => res.status(500).send(error.errors));
  }

};

export default docCtrl;
