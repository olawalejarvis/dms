const bcrypt = require('bcrypt-nodejs');

module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert('Users', [
      {
        username: 'olawalequest',
        firstname: 'Olawale',
        lastname: 'Aladeusi',
        email: 'olawalequest@gmail.com',
        password: bcrypt.hashSync('password', bcrypt.genSaltSync(8)),
        roleId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'pleroonigeria',
        firstname: 'pleroo',
        lastname: 'nigeria',
        email: 'pleroonigeria@gmail.com',
        password: bcrypt.hashSync('password', bcrypt.genSaltSync(8)),
        roleId: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {}),
  down: queryInterface => queryInterface.bulkDelete('Users', null, {})
};

