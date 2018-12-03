'use strict';
module.exports = (sequelize, DataTypes) => {
  const CourseDetail = sequelize.define('CourseDetail', {
    courseNumber: DataTypes.STRING,
    lineNumber: DataTypes.INTEGER,
    description: DataTypes.STRING,
    correctResponse: DataTypes.STRING,
    weight: DataTypes.INTEGER,
    points: DataTypes.INTEGER
  }, {});
  CourseDetail.associate = function(models) {
    // associations can be defined here
  };
  return CourseDetail;
};