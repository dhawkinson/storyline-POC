'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    number: DataTypes.STRING,
    title: DataTypes.STRING,
    type: DataTypes.STRING,
    source: DataTypes.STRING,
    pubYear: DataTypes.STRING,
    itemCount: DataTypes.INTEGER,
    passScore: DataTypes.INTEGER,
    maxScore: DataTypes.INTEGER,
    minScore: DataTypes.INTEGER
  }, {});
  Course.associate = function(models) {
    // associations can be defined here
  };
  return Course;
};