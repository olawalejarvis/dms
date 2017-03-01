[![Coverage Status](https://coveralls.io/repos/github/andela-oaladeusi/dms/badge.svg?branch=staging)](https://coveralls.io/github/andela-oaladeusi/dms?branch=staging) [![Build Status](https://travis-ci.org/andela-oaladeusi/dms.svg?branch=master)](https://travis-ci.org/andela-oaladeusi/dms) [![Code Climate](https://codeclimate.com/repos/58ac1f917dc061005e007268/badges/aa2cf7e31c3bdcb34278/gpa.svg)](https://codeclimate.com/repos/58ac1f917dc061005e007268/feed)

# Document Management System
The Document management system provides REST API enpoints for a document management system. It allows create, retrieve, update and delete actions to be carried out.
It also ensures that users are authorized.

## Development
Document Management System API is built with the following technologies;
- JavaScript (ES6)
- [NodeJs](https://nodejs.org)
- [Express](http://expressjs.com/)
- [Postgresql](https://www.postgresql.org/)
- [Sequelize ORM](http://docs.sequelizejs.com/en/v3/)

## Installation
- Install [NodeJs](https://nodejs.org/en/) and [Postgres](https://www.postgresql.org/) on your machine
- Clone the repository `$ git clone https://github.com/andela-oaladeusi/dms.git`
- Change into the directory `$ cd /dms`
- Install all required dependencies with `$ npm install`
- Create a `.env` file in your root directory as described in `.env.sample` file

## Testing
- Run Test `npm test`

## Usage
- Start the app with `$ npm start`
- Use Postman collection
  [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/8d7dc3154fb4a75853f2)

**Users**:
A created user will have a role, either an admin or a regular.
- A Regular User can:
    - Create an account
    - Edit his profile.
    - Search users
    - Create a document
    - Edit a document
    - Retrieve a document
    - Delete a document
    - Limit access to a document by specifying an access group `i.e. public, private or role`.
    - View public documents created by other users.
    - View documents created by his access group with access level set as `role`.
    - Search a users public documents.
    - View `public` and `role` access level documents of other regular users.

- An Admin User can:
    - View all users
    - View all created documents
    - Delete any user
    - Update any user's record
    - Create a new role
    - View all created roles
    - Search for any user

**Documents**:
Documents can be created and must have:
- Published date
- Title
- Content
- Access (`private, public or role`)

**Roles**:
Roles can also be created, the default roles are `admin` and `regular`

**Authentication**:
Users are authenticated and validated using JSON web token (JWT).
By generating a token on registration and login, API endpoints and documents are protected from unauthorised access.
Requests to protected routes are validated using the generated token.

## Endpoints

**Users**

Request type | Endpoint | Action
------------ | -------- | ------
POST | [/users](#create-users) | Create a new user
GET | [/users](#get-users) | Get all users
GET | [/users/:id](#get-a-user) | Get details of a specific user
PUT | [/users/:id](#update-user) | Edit user details
DELETE | [/users/:id](#delete-user) | Remove a user from storage
GET | [/users/login](#login) | To log a user in
GET | [/users/logout](#logout) | To log a user out
GET | [/users/search](#search) | To search for a user
GET | [/users/:id/documents](#get-documents-by-user) | Retrieve all documents created by a user

**Roles**

Request type | Endpoint | Action
------------ | -------- | ------
POST | [/roles](#create-role) | Create a new role
GET | [/roles](#get-roles) | Get all created roles
GET | [/role/:id](#get-a-role) | Get a specific role
PUT | [/role/:id](#edit-a-role) | Edit a specific role
DELETE | [/role/:id](#delete-a-role) | Delete a specific role

**Documents**

Request type | Endpoint | Action
------------ | -------- | ------
POST | [/documents](#create-document) | Create a new document
GET | [/documents](#get-documents) | Retrieve all documents
GET | [/documents/:id](#get-a-document) | Retrieve a specific document
GET | [/documents?query=new](#search-document-by-key) | Search documents using key terms
GET | [/documents?limit=10](#get-documents) | Retrieve maximum of first 10 documents ordered by date of creation
PUT | [/documents/:id](#update-document) | Update a specific document
DELETE | [/documents/:id](#delete-document) | Remove a specific document from storage
