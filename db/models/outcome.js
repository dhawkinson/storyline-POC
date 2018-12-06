'use strict';
module.exports = (sequelize, DataTypes) => {
  const Outcome = sequelize.define('Outcome', {
    course: DataTypes.STRING,
    learnerEmail: DataTypes.STRING,
    date: DataTypes.DATE,
    status: DataTypes.STRING,
    pointScore: DataTypes.INTEGER,
    pointMax: DataTypes.INTEGER,
    pointMin: DataTypes.INTEGER
  }, {});
  Outcome.associate = function(models) {
    // associations can be defined here
  };
  return Outcome;
};