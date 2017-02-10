import faker from 'faker';

const helper = {
  testRoleA: {
    title: 'admin'
  },
  testRoleR: {
    title: 'regular'
  },
  testUser1: {
    username: faker.internet.userName(),
    firstname: faker.name.firstname(),
    lastname: faker.name.lastname(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  testUser2: {
    username: faker.internet.userName(),
    firstname: faker.name.firstname(),
    lastname: faker.name.lastname(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  testUser3: {
    username: faker.internet.userName(),
    firstname: faker.name.firstname(),
    lastname: faker.name.lastname(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  testDocument1: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
    access: 'public'
  },
  testDocument2: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
    access: 'private'
  },
  testDocument3: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
    access: 'role'
  },
  testDocument4: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
  },
  documentArray() {
    const documentData = [];
    for (let i = 0; i <= 15; i += 1) {
      documentData.push({
        title: faker.company.catchPhrase(),
        content: faker.lorem.paragraph(),
        OwnerId: 1
      });
    }
    return documentData;
  }

};

export default helper;
