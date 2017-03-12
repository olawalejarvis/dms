module.exports = (sequelize, DataTypes) => {
  const Type = sequelize.define('Type', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'role already exist'
      },
      validate: {
        is: {
          args: /\w+/g,
          msg: 'Input a valid title'
        },
        notEmpty: {
          msg: 'This field cannot be empty'
        }
      }
    }
  }, {
    classMethods: {
      associate: (models) => {
        Type.hasMany(models.Document, { foreignKey: 'type' });
      }
    }
  });
  return Type;
};
