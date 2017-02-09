
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert('Roles', [
      {
        title: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'regular',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {}),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Roles', null, {})
};
