
const dms = {

  /**
   * Get document's data
   * @param {Object} req request object
   * @returns {Object} return an object
   */
  getDocumentData(req) {
    return {
      title: req.body.title,
      content: req.body.content,
      ownerId: req.tokenDecode.userId,
      access: req.body.access,
      ownerRoleId: req.tokenDecode.roleId
    };
  },
  /**
   * Get user's data'
   * @param {Object} data object containing user's details
   * @returns {Object} user's object
   */
  getUserData(data) {
    return {
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password,
      roleId: data.roleId
    };
  },
  /**
   * Get user's profile'
   * @param {Object} data object containing user's details
   * @returns {Object} return user's data
   */
  userProfile(data) {
    return {
      id: data.id,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      roleId: data.roleId,
      createAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  },
  /**
   * Get user's attributes'
   * @returns {Array} return user's attributes
   */
  getUserAttribute() {
    return [
      'id',
      'username',
      'firstname',
      'lastname',
      'email',
      'roleId',
      'createdAt',
      'updatedAt'
    ];
  },
  /**
   * Query for document's access
   * @param {Object} req request object
   * @returns {Object} return access query
   */
  docAccess(req) {
    const access = {
      $or:
      [
        { access: 'public' },
        { ownerId: req.tokenDecode.userId },
        {
          $and: [
            { access: 'role' },
            { ownerRoleId: req.tokenDecode.roleId }
          ]
        }
      ]
    };
    return access;
  },
  /**
   * Query for search terms
   * @param {Array} terms array of search terms
   * @returns {Object} return user's data
   */
  likeSearch(terms) {
    const like = {
      $or:
      [
        { title: { $ilike: { $any: terms } } },
        { content: { $ilike: { $any: terms } } }
      ]
    };
    return like;
  },
  /**
   * Get and validate queries
   * @param {Object} query query object
   * @returns {Object} return an object
   */
  validateQueries(query) {
    const searchArray = query.query ? query.query.toLowerCase().match(/\w+/g) : null;
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    const publishedDate = query.publishedDate;
    const order = publishedDate && publishedDate === 'ASC' ? publishedDate : 'DESC';
    return { limit, offset, order, searchArray };
  },
  /**
   * Set limit, offset and order
   * @param {Number} limit limit
   * @param {Number} offset
   * @param {String} order ASC or DESC
   * @param {Object} query query object
   * @returns {Object} return query
   */
  setLimitOffsetOrder(limit, offset, order, query) {
    query.limit = limit;
    query.offset = offset;
    query.order = [['createdAt', order]];
    return query;
  },
  /**
   * Set limit, offset and order
   * @param {Number} count array's count
   * @param {Number} limit
   * @param {Number} offset
   * @returns {Object} return an object
   */
  nextAndCurrentPage(count, limit, offset) {
    const next = Math.ceil(count / limit);
    const currentPage = Math.floor((offset / limit) + 1);
    return { next, currentPage };
  },
  /**
   * Validate documents input
   * @param {Object} req request object
   * @returns {Object} return an object
   */
  validateDocumentsInput(req) {
    const title = /\w+/g.test(req.body.title);
    const content = /\w+/g.test(req.body.content);
    return { title, content };
  }
};

export default dms;
