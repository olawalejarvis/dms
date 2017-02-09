module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('Users', [
      {
        username: 'olawalequest',
        firstname: 'olawale',
        lastname: 'aladeusi',
        email: 'olawalequest@gmail.com',
        password: 'test123',
        roleId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'pleroonigeria',
        firstname: 'pleroo',
        lastname: 'nigeria',
        email: 'pleroonigeria@gmail.com',
        password: 'test123',
        roleId: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {})
};

