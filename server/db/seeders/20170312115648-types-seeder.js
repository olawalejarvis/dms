
module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert('Types', [
      {
        title: 'news',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'sport',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {}),
  down: queryInterface => queryInterface.bulkDelete('Types', null, {})
};
