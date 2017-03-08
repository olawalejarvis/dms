[![Coverage Status](https://coveralls.io/repos/github/andela-oaladeusi/dms/badge.svg?branch=feedback)](https://coveralls.io/github/andela-oaladeusi/dms?branch=feedback) [![Build Status](https://travis-ci.org/andela-oaladeusi/dms.svg?branch=feedback)](https://travis-ci.org/andela-oaladeusi/dms) [![Code Climate](https://codeclimate.com/repos/58ac1f917dc061005e007268/badges/aa2cf7e31c3bdcb34278/gpa.svg)](https://codeclimate.com/repos/58ac1f917dc061005e007268/feed)

# Document Management System
The Document management system provides REST API enpoints for a document management system. It allows create, retrieve, update and delete actions to be carried out.
It also ensures that users are authorized.

## Usage
- Use Postman collection
  [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/8d7dc3154fb4a75853f2)

## Installation
- Install [NodeJs](https://nodejs.org/en/) and [Postgres](https://www.postgresql.org/) on your machine
- Clone the repository `$ git clone https://github.com/andela-oaladeusi/dms.git`
- Change into the directory `$ cd /dms`
- Install all required dependencies with `$ npm install`
- Create a `.env` file in your root directory as described in `.env.sample` file
- Start the app with `npm start`
- Run Test `npm test`

# API Documentation
The API has predictable, resource-oriented URLs, and uses HTTP response codes to indicate API status and errors.

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
    - Search documents.
    - View `public` and `role` access level documents of other regular users.

- An Admin User can:
    - View all users
    - View all created documents
    - Delete any user
    - Update any user's record
    - Create a new role
    - View all created roles
    - Search for any user
    - Search for any document

**Documents**:
Documents can be created and must have:
- Published date
- Title
- Content
- Access (`private, public or role`)

**Roles**:
Roles can also be created, the default roles are `admin` and `regular`
Only an admin user can create and manage role(s)

**Authentication**:
Users are authenticated and validated using JSON web token (JWT).
By generating a token on registration and login, API endpoints and documents are protected from unauthorised access.
Requests to protected routes are validated using the generated token.

## Endpoints

**Users**

Request type | Endpoint | Action
------------ | -------- | ------
POST | [/users](#create-user) | Create a new user
GET | [/users](#get-all-users) | Get all users
GET | [/users/:id](#get-user) | Get details of a specific user
PUT | [/users/:id](#edit-user) | Edit user details
DELETE | [/users/:id](#delete-user) | Remove a user from storage
GET | [/users/login](#login) | To log a user in
GET | [/users/logout](#logout) | To log a user out
GET | [/users/search](#search-user) | To search for a user
GET | [/users/:id/documents](#user-documents) | Retrieve all documents created by a user

**Roles**

Request type | Endpoint | Action
------------ | -------- | ------
POST | [/roles](#create-role) | Create a new role
GET | [/roles](#get-all-roles) | Get all created roles
GET | [/role/:id](#get-role) | Get a specific role
PUT | [/role/:id](#edit-role) | Edit a specific role
DELETE | [/role/:id](#delete-role) | Delete a specific role

**Documents**

Request type | Endpoint | Action
------------ | -------- | ------
POST | [/documents](#create-document) | Create a new document
GET | [/documents](#get-all-documents) | Retrieve all documents
GET | [/documents/:id](#get-document) | Retrieve a specific document
GET | [/documents?query=new](#search-document) | Search documents using key terms
PUT | [/documents/:id](#edit-document) | Update a specific document
DELETE | [/documents/:id](#delete-document) | Remove a specific document from storage

The following are some sample request and response from the API.

## Roles
Endpoint for Roles resource.

### Get All Roles

#### Request
- Endpoint: GET: `/roles`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "You have successfully retrived all roles",
  "roles": [
    {
      "id": 1,
      "title": "admin",
      "createdAt": "2017-03-06T21:35:05.840Z",
      "updatedAt": "2017-03-06T21:35:05.840Z"
    },
    {
      "id": 2,
      "title": "regular",
      "createdAt": "2017-03-06T21:35:05.840Z",
      "updatedAt": "2017-03-06T21:35:05.840Z"
    }
  ]
}
```

### Create Role

#### Request
- Endpoint: POST: `/roles`
- Requires: Authentication and Admin role.
- Body `(application/json)`
```json
{
  "title": "fellow"
}
```

#### Response
- Status: `201: Created`
- Body `(application/json)`
```json
{
  "message": "Role has been created",
  "role": {
    "id": 3,
    "title": "fellow",
    "updatedAt": "2017-03-07T16:49:15.507Z",
    "createdAt": "2017-03-07T16:49:15.507Z"
  }
}
```

### Edit Role

#### Request
- Endpoint: PUT: `/roles/3`
- Requires: Authentication and Admin role.
- Body `(application/json)`
```json
{
  "title": "fellow-d0"
}
```

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "This role has been updated",
  "updatedRole": {
    "id": 3,
    "title": "fellow-d0",
    "createdAt": "2017-03-07T16:49:15.507Z",
    "updatedAt": "2017-03-07T16:52:35.408Z"
  }
}
```

### Get Role

#### Request
- Endpoint: GET: `/roles/3`
- Requires: Authentication and Admin role.

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "This role has been retrieved successfully",
  "role": {
    "id": 3,
    "title": "fellow-d0",
    "createdAt": "2017-03-07T16:49:15.507Z",
    "updatedAt": "2017-03-07T16:52:35.408Z"
  }
}
```

### Delete Role

#### Request
- Endpoint: DELETE: `/roles/3`
- Requires: Authentication and Admin role.

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "This role has been deleted"
}
```


## Users
Endpoint for Users resource.

### Get All Users

#### Request
- Endpoint: GET: `/users`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "You have successfully retrived all users",
  "users": {
    "rows": [
      {
        "id": 2,
        "username": "pleroonigeria",
        "firstname": "pleroo",
        "lastname": "nigeria",
        "email": "pleroonigeria@gmail.com",
        "createdAt": "2017-03-06T21:35:06.038Z"
      },
      {
        "id": 1,
        "username": "olawalequest",
        "firstname": "Olawale",
        "lastname": "Aladeusi",
        "email": "olawalequest@gmail.com",
        "createdAt": "2017-03-06T21:35:05.971Z"
      }
    ]
  },
  "pagination": {
    "page_count": 1,
    "page": 1,
    "page_size": 10,
    "total_count": 2
  }
}
```

### Create User

#### Request
- Endpoint: POST: `/users`
- Body `(application/json)`
```json
{
  "username": "fecit",
  "firstname": "fecit",
  "lastname": "fecit",
  "email": "fecit@mail.com",
  "password": "password",
}
```

#### Response
- Status: `201: Created`
- Body `(application/json)`
```json
{
  "message": "Your account has been created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTQ4ODkwNTg3OCwiZXhwIjoxNDg5NTEwNjc4fQ.3cJlim3wV60kA2LjskSXm5633EcK56A3AayCLceEuLo",
  "user": {
    "id": 4,
    "username": "fecit",
    "firstname": "fecit",
    "lastname": "fecit",
    "email": "fecit@mail.com",
    "roleId": 2,
    "createAt": "2017-03-07T16:57:58.444Z",
    "updatedAt": "2017-03-07T16:57:58.444Z"
  }
}
```

### Login

#### Request
- Endpoint: POST: `/users`
- Body `(application/json)`
```json
{
  "email": "olawalequest@gmail.com",
  "password": "password",
}
```

#### Response
- Status: `200: Ok`
- Body `(application/json)`
```json
{
  "message": "You have successfully logged in",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTQ4ODkwOTA0OCwiZXhwIjoxNDg5NTEzODQ4fQ.YKsL2EfuLDmhHDySTQjWHA5qbkN77m76-DpLtFKFF-8",
  "user": {
    "id": 1,
    "username": "olawalequest",
    "firstname": "Olawale",
    "lastname": "Aladeusi",
    "email": "olawalequest@gmail.com"
  }
}
```

### Logout

#### Request
- Endpoint: POST: `/users`
- Requires: Authentication

#### Response
- Status: `200: Ok`
- Body `(application/json)`
```json
{
  "message": "You have successfully logged out"
}
```


### Get User

#### Request
- Endpoint: GET: `/users/:id`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "You have successfully retrived this user",
  "user": {
    "id": 4,
    "username": "fecit",
    "firstname": "fecit",
    "lastname": "fecit",
    "email": "fecit@mail.com"
  }
}
```

### Edit User

#### Request
- Endpoint: PUT: `/users/:id`
- Requires: Authentication
- Body `(application/json)`:
```json
{
  "firstname": "fecitandela",
  "lastname": "fecitandela"
}
```

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "Your profile has been updated",
  "updatedUser": {
    "id": 4,
    "username": "fecitandela",
    "firstname": "fecitandela",
    "lastname": "fecit",
    "email": "fecit@mail.com"
  }
}
```

### Delete User

#### Request
- Endpoint: DELETE: `/users/:id`
- Requires: Authentication and Admin role

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "This account has been successfully deleted"
}
```

### Search User

#### Request
- Endpoint: GET: `/users/search?query=olaw`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "Your search was successful",
  "users": {
    "rows": [
      {
        "id": 3,
        "username": "pleroooo",
        "firstname": "Olawale",
        "lastname": "Aladeusi",
        "email": "plerooggggg@gmail.com",
        "createdAt": "2017-03-07T14:25:19.942Z"
      },
      {
        "id": 1,
        "username": "olawalequest",
        "firstname": "Olawale",
        "lastname": "Aladeusi",
        "email": "olawalequest@gmail.com",
        "createdAt": "2017-03-06T09:42:31.763Z"
      }
    ]
  },
  "pagination": {
    "page_count": 1,
    "Page": 1,
    "page_size": 10,
    "total_count": 2
  }
}
```

## Documents
Endpoint for document resource.

### Get All Documents

#### Request
- Endpoint: GET: `/documents`
- Requires: Authentication
- Optional parameters for limiting and pagination:
  - `limit=5` Number of items to return.
  - `offset=5` Number of items to skip.

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "You have successfully retrieved all documents",
  "documents": {
    "rows": [
      {
        "id": 2,
        "title": "Andela",
        "content": "Andela is an American talent accelerator that recruits and trains software developers and connects them with employers globally",
        "access": "public",
        "createdAt": "2017-03-07T17:19:19.651Z",
        "updatedAt": "2017-03-07T17:19:19.651Z"
      },
      {
        "id": 1,
        "title": "new andela",
        "content": "new new new new new ",
        "access": "public",
        "createdAt": "2017-03-07T14:26:48.940Z",
        "updatedAt": "2017-03-07T14:26:48.940Z"
      }
    ]
  },
  "pagination": {
    "page_count": 1,
    "Page": 1,
    "page_size": 5,
    "total_count": 2
  }
}
```

### Search Documents

#### Request
- Endpoint: GET: `/documents/search?query=andela&limit=5&offset=5&publishedDate=ASC`
- Requires: Authentication
- Optional parameters
  - `query` Search query string
  - `limit` Number of items to return.
  - `offset` Number of items to skip.
  - `publishedDate` Order to return document `DESC|ASC`.

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "This search was successfull",
  "documents": {
    "rows": [
      {
        "id": 2,
        "title": "Andela",
        "content": "Andela is an American talent accelerator that recruits and trains software developers and connects them with employers globally",
        "access": "public",
        "createdAt": "2017-03-07T17:19:19.651Z",
        "updatedAt": "2017-03-07T17:19:19.651Z"
      },
      {
        "id": 1,
        "title": "new andela",
        "content": "new new new new new ",
        "access": "public",
        "createdAt": "2017-03-07T14:26:48.940Z",
        "updatedAt": "2017-03-07T14:26:48.940Z"
      }
    ]
  },
  "pagination": {
    "page_count": 1,
    "Page": 1,
    "page_size": 5,
    "total_count": 2
  }
}
```

### User Documents

#### Request
- Endpoint: GET: `/users/:id/documents`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "This user's documents was successfully retrieved",
  "userDocuments": {
    "user": {
      "id": 1,
      "username": "olawalequest",
      "firstname": "Olawale",
      "lastname": "Aladeusi",
      "email": "olawalequest@gmail.com"
    },
    "documents": {
      "count": 1,
      "rows": [
        {
          "id": 2,
          "title": "Andela",
          "content": "Andela is an American talent accelerator that recruits and trains software developers and connects them with employers globally",
          "access": "public",
          "createdAt": "2017-03-07T17:19:19.651Z",
          "updatedAt": "2017-03-07T17:19:19.651Z"
        }
      ]
    }
  },
  "pagination": {
    "page_count": 1,
    "Page": 1,
    "page_size": 10,
    "total_count": 1
  }
}
```

### Create Document

#### Request
- Endpoint: POST: `/documents`
- Requires: Authentication
- Body `(application/json)`
```json
{
  "title": "Andela",
  "content": "Andela is an American talent accelerator that recruits and trains software developers and connects them with employers globally",
}
```

#### Response
- Status: `201: Created`
- Body `(application/json)`
```json
{
  "message": "Your document has been successfully created",
  "document": {
    "id": 3,
    "title": "Andela",
    "content": "Andela is an American talent accelerator that recruits and trains software developers and connects them with employers globally",
    "access": "public",
    "createdAt": "2017-03-07T17:23:23.113Z",
    "updatedAt": "2017-03-07T17:23:23.113Z"
  }
}
```


### Get Document

#### Request
- Endpoint: GET: `/documents/:id`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "You have successfully retrived this document",
  "document": {
    "id": 3,
    "title": "Andela",
    "content": "Andela is an American talent accelerator that recruits and trains software developers and connects them with employers globally",
    "access": "public",
    "createdAt": "2017-03-07T17:23:23.113Z",
    "updatedAt": "2017-03-07T17:23:23.113Z"
  }
}
```

### Edit Document

#### Request
- Endpoint: PUT: `/documents/:id`
- Requires: Authentication
- Body `(application/json)`:
```json
{
  "title": "Overview",
  "content": "Andela's training and education program unites qualified African students, regardless of age or income, with leading developers who teach them to code.[5] The four-year training program, which pays its students, is highly selective"
}
```

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "This document has been updated successfully",
  "updatedDocument": {
    "id": 3,
    "ownerId": 1,
    "title": "Overview",
    "content": "Andela's training and education program unites qualified African students, regardless of age or income, with leading developers who teach them to code.[5] The four-year training program, which pays its students, is highly selective",
    "access": "public",
    "ownerRoleId": 1,
    "createdAt": "2017-03-07T17:23:23.113Z",
    "updatedAt": "2017-03-07T17:26:18.297Z"
  }
}
```

### Delete Document

#### Request
- Endpoint: DELETE: `/documents/:id`
- Requires: Authentication

#### Response
- Status: `200: OK`
- Body `(application/json)`
```json
{
  "message": "This document has been deleted successfully"
}
```

## Development
Document Management System API is built with the following technologies;
- JavaScript (ES6)
- [NodeJs](https://nodejs.org)
- [Express](http://expressjs.com/)
- [Postgresql](https://www.postgresql.org/)
- [Sequelize ORM](http://docs.sequelizejs.com/en/v3/)

## Contributing
- Fork this repository to your GitHub account
- Clone the forked repository
- Create your feature branch
- Commit your changes
- Push to the remote branch
- Open a Pull Request

## Limitations
The limitations of the API are:
- Users cannot delete themselves using the API
- Documents are not unique (A user can create a document with the same title)
- User can only logs in on one system
   
## LICENSE
 © [Olawalequest](https://github.com/andela-oaladeusi)