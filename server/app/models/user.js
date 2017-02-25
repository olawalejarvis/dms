import bcrypt from 'bcrypt-nodejs';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Username already exist'
      },
      validate: {
        is: {
          args: /\w+/g,
          msg: 'Input a valid username'
        }
      }
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /\w+/g,
          msg: 'Input a valid username'
        },
        notEmpty: {
          msg: 'This field cannot be empty'
        }
      }
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /\w+/g,
          msg: 'Input a valid username'
        },
        notEmpty: {
          msg: 'This field cannot be empty'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Email already exist'
      },
      validate: {
        isEmail: {
          args: true,
          msg: 'input a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: {
        msg: 'This field cannot be empty'
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2
    }
  }, {
    validate: {
      validatePassword() {
        if (!(/\w+/g.test(this.password)) || (this.password.length < 8)) {
          throw new Error('Minimum of of 8 characters is required');
        }
      }
    },
    classMethods: {
      associate(models) {
        User.hasMany(models.Document, { foreignKey: 'ownerId' });
        User.belongsTo(models.Role, {
          foreignKey: 'roleId',
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      generateHash() {
        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
      },
      validPassword(password) {
        return bcrypt.compareSync(password, this.password);
      },
      getUserDetail() {
        return {
          id: this.id,
          username: this.username,
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          roleId: this.roleId,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        };
      }
    },
    hooks: {
      beforeCreate(user) {
        user.generateHash();
      },
      beforeUpdate(user) {
        if (user._changed.password) {
          user.generateHash();
        }
      }
    }
  });
  return User;
};
