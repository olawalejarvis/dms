
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
   * @param {Object} data request object
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
   * @param {Object} data request object
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
  }
};

export default dms;
