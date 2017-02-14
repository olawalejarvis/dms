import db from '../models/index';

const documentAttributes = (doc) => {
  const attributes = {
    id: doc.id,
    title: doc.title,
    content: doc.content,
    access: doc.access,
    ownerId: doc.ownerId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };

  return attributes;
};
const docCtrl = {

  /**
    * Create a new document
    * Route: POST: /documents/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  createDocument(req, res) {
    db.Document
      .create({
        title: req.body.title,
        content: req.body.content,
        ownerId: req.tokenDecode.userId,
        access: req.body.access || 'public',
        ownerRoleId: req.tokenDecode.roleId
      })
       .then((document) => {
         document = documentAttributes(document);
         res.status(201).send({ message: 'created', document });
       })
       .catch(error => res.status(409).send({ message: 'error', error }));
  },

  /**
    * Get all document
    * Route: GET: /documents/
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getAllDocument(req, res) {
    const query = {
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
      attributes: [
        'id',
        'title',
        'content',
        'access',
        'ownerId',
        'createdAt',
        'updatedAt'
      ],
      limit: req.query.limit || null,
      offset: req.query.offset || null,
      order: [['createdAt', 'DESC']]
    };
    db.Document
      .findAll(query)
      .then((docs) => {
        res.status(200).send({ message: docs });
      });
  },

  /**
    * Get document by ID
    * Route: GET: /documents/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  getDocumentById(req, res) {
    db.Document
      .findById(req.params.id)
      .then((doc) => {
        if (!doc) {
          return res.send({ message: `no document with id ${req.params.id} found` });
        }
        if (doc.access === 'public' || doc.ownerId === req.tokenDecode.userId) {
          doc = documentAttributes(doc);
          return res.status(200).send({ message: doc });
        }
        if (doc.access === 'role' && doc.ownerRoleId === req.tokenDecode.roleId) {
          doc = documentAttributes(doc);
          return res.status(200).send({ message: doc });
        }
        res.status(401).send({ message: 'permission denied' });
      });
  },

  /**
    * Update document by id
    * Route: PUT: /documents/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  updateDocumentById(req, res) {
    db.Document
      .findById(req.params.id)
      .then((doc) => {
        if (!doc) { return res.send({ message: `no document with id ${req.params.id} found` }); }
        if (doc.ownerId === req.tokenDecode.userId) {
          doc.update({
            title: req.body.title || doc.title,
            content: req.body.content || doc.content,
            access: req.body.access || doc.access
          })
          .then((upDoc) => {
            if (!upDoc) {
              return res.send({ message: `Error in updating document with id ${req.params.id}` });
            }
            upDoc = documentAttributes(upDoc);
            return res.status(200).send({ message: 'successful', upDoc });
          });
        } else {
          res.status(401).send({ message: 'permission denied' });
        }
      });
  },

  /**
    * Delete document by id
    * Route: DELETE: /documents/:id
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  deteleDocumentById(req, res) {
    db.Document
      .findById(req.params.id)
      .then((doc) => {
        if (!doc) { return res.status(404).send({ message: 'no document found' }); }
        if (doc.ownerId === req.tokenDecode.userId) {
          doc.destroy()
          .then((result) => {
            if (!result) { res.send({ message: 'something went wrong' }); }
            return res.status(200).send({ message: 'document deleted' });
          });
        } else { res.status(401).send({ message: 'permission denied' }); }
      });
  },

  /**
    * Search document
    * Route: GET: /searchs?query={}
    * @param {Object} req request object
    * @param {Object} res response object
    * @returns {void} no returns
    */
  searchDocument(req, res) {
    if (!req.query.query) {
      return res.send({ message: 'enter search query' });
    }
    const query = {
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
              { title: { like: `%${req.query.query}%` } },
              { content: { like: `%${req.query.query}%` } }
            ]
          }
        ]
      },
      limit: req.query.limit || null,
      offset: req.query.offset || null,
      order: [['createdAt', 'DESC']]
    };
    db.Document
      .findAll(query)
      .then((docs) => {
        res.status(200).send({ message: docs });
      });
  }

};

export default docCtrl;
