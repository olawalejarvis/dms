import db from '../models/index';

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
        access: req.body.access || 'public'
      })
       .then(document => res.status(201).send({ message: 'created', document }))
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
          { ownerId: req.tokenDecode.userId }
        ]
      }
    };
    db.Document
      .findAll(query)
      .then((docs) => {
        if (!docs) { res.send({ message: 'can not get all docs' }); }
        res.send({ message: docs });
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
        if (!doc) { return res.send({ message: `no document with id ${req.params.id} found` }); }
        if (doc.access === 'public' || doc.ownerId === req.tokenDecode.userId) {
          return res.send({ message: doc });
        }
        if (doc.access === 'role') {
          db.User.findById(doc.ownerId)
            .then((user) => {
              if (!user) {
                return res.status(404).send({ message: 'no user found' });
              } else if (user.roleId === req.tokenDecode.roleId) {
                return res.send({ message: doc });
              } else { res.status(401).send({ message: 'permission denied' }); }
            });
        }
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
            if (!upDoc) { return res.send({ message: `Error in updating document with id ${req.params.id}` }); }
            return res.status(200).send({ message: 'successful', upDoc });
          });
        } else { res.status(401).send({ message: 'permission denied' }); }
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
  }

};

export default docCtrl;
