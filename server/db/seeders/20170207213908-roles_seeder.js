
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('Roles', [
      {
        id: 1,
        title: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: 'regular',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Roles', null, {})
};
