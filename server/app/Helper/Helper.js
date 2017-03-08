/**
  * Controller's' helper
  */
const Helper = {

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
      'createdAt',
    ];
  },
  /**
   * Pagination
   * @param {Object} condition pagination condition
   * @returns {Object} return an object
   */
  pagination(condition) {
    const next = Math.ceil(condition.count / condition.limit);
    const currentPage = Math.floor((condition.offset / condition.limit) + 1);
    return {
      page_count: next,
      page: currentPage,
      page_size: condition.limit,
      total_count: condition.count
    };
  },
  /**
   * Get user's profile'
   * @param {Object} data object containing user's details
   * @returns {Object} return user's data
   */
  getUserProfile(data) {
    return {
      id: data.id,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
    };
  },
  /**
   * Get document's attributes'
   * @returns {Array} return user's attributes
   */
  getDocAttribute() {
    return [
      'id',
      'title',
      'content',
      'access',
      'ownerId',
      'createdAt',
      'updatedAt'
    ];
  },
  /**
   * Get errors
   * @param {Array} error client side errors
   * @returns {Array} return user's attributes
   */
  errorArray(error) {
    const errorArray = [];
    error.errors.forEach((err) => {
      errorArray.push({ path: err.path, message: err.message });
    });
    return errorArray;
  },
  /**
   * @param {Object} data document response from the database
   * Get documents's attributes'
   * @returns {Object} return user's attributes
   */
  getDocument(data) {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      access: data.access,
      ownerId: data.ownerId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
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
        { title: { $iLike: { $any: terms } } },
        { content: { $iLike: { $any: terms } } }
      ]
    };
    return like;
  },
  /**
   * Check for admin permission
   * @param {String} roleId user role id
   * @returns {Boolean} true or false
   */
  isAdmin(roleId) {
    return roleId === 1;
  },
  /**
   * Check for regular permission
   * @param {String} roleId user role id
   * @returns {Boolean} true or false
   */
  isRegular(roleId) {
    return roleId === 2;
  },
  /**
   * Check for owner
   * @param {Object} req request object
   * @returns {Boolean} true or false
   */
  isOwner(req) {
    return String(req.tokenDecode.userId) === String(req.params.id);
  },
  /**
   * Check if document's access level is public
   * @param {Object} doc object
   * @returns {Boolean} true or false
   */
  isPublic(doc) {
    return doc.access === 'public';
  },
  /**
   * Check for document's owner
   * @param {Object} doc object
   * @param {Object} req request object
   * @returns {Boolean} true or false
   */
  isOwnerDoc(doc, req) {
    return doc.ownerId === req.tokenDecode.userId;
  },
  /**
   * Check for document's role permission
   * @param {Object} doc object
   * @param {Object} req request object
   * @returns {Boolean} true or false
   */
  hasRoleAccess(doc, req) {
    return (doc.access === 'role'
      && doc.ownerRoleId === req.tokenDecode.roleId);
  },

};

export default Helper;
