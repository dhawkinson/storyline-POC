'use strict';
module.exports = (sequelize, DataTypes) => {
  const Outcome = sequelize.define('Outcome', {
    date: DataTypes.DATE,
    status: DataTypes.STRING,
    pointScore: DataTypes.INTEGER,
    pointMax: DataTypes.INTEGER
  }, {});
  Outcome.associate = function(models) {
    // associations can be defined here
  };
  return Outcome;
};