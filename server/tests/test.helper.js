import faker from 'faker';

const helper = {
  testRoleA: {
    id: 1,
    title: 'admin'
  },
  testRoleR: {
    id: 2,
    title: 'regular'
  },
  testRoleG: {
    id: 3,
    title: 'guest'
  },
  testRoleG1: {
    id: 4,
    title: 'guest111'
  },
  testRoleG2: {
    id: 5,
    title: 'guest2'
  },
  testRoleSample: {
    id: 7,
    title: 'guestSample'
  },
  adminUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  adminUser1: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  regularUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  },
  regularUser2: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  firstUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  secondUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  },
  invalidEmailUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: 'kkkkk',
    password: faker.internet.password()
  },
  invalidPasswordUser: {
    username: faker.internet.userName(),
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    email: faker.internet.email(),
    password: 'ola'
  },
  publicDocument: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
    access: 'public'
  },
  privateDocument: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
    access: 'private'
  },
  roleDocument: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
    access: 'role'
  },
  testDocument4: {
    title: faker.company.catchPhrase(),
    content: faker.lorem.paragraph(),
  }
};
export default helper;
