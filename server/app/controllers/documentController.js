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
       .then(document => res.send({ message: 'created', document }))
       .catch(error => res.send({ message: 'error', error }));
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
        if (!doc) { res.send({ message: `no document with id ${req.params.id} found` }); }
        if (doc.access === 'public' || doc.ownerId === req.tokenDecode.userId) {
          res.send({ message: doc });
        }
        if (doc.access === 'role') {
          db.User.findById(doc.ownerId)
            .then((user) => {
              if (!user) {
                res.send({ message: 'no user found' });
              } else if (user.roleId === req.tokenDecode.roleId) {
                res.send({ message: doc });
              } else { res.send({ message: 'permission denied' }); }
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
        if (!doc) { res.send({ message: `no document with id ${req.params.id} found` }); }
        if (doc.ownerId === req.tokenDecode.userId) {
          doc.update({
            title: req.body.title || doc.title,
            content: req.body.content || doc.content,
            access: req.body.access || doc.access
          })
          .then((upDoc) => {
            if (!upDoc) { res.send({ message: `Error in updating document with id ${req.params.id}` }); }
            res.send({ message: 'successful' });
          });
        } else { res.send({ message: 'permission denied' }); }
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
        if (!doc) { res.send({ message: 'no file found' }); }
        doc.destroy()
        .then((result) => {
          if (!result) { res.send({ message: 'something went wrong' }); }
          res.send({ message: 'document deleted' });
        });
      });
  }

};


export default docCtrl;
