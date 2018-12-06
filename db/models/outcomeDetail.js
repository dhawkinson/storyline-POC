'use strict';
module.exports = (sequelize, DataTypes) => {
  const OutcomeDetail = sequelize.define('OutcomeDetail', {
    courseNumber: DataTypes.STRING,
    learnerEmail: DataTypes.STRING,
    outcomeDate: DataTypes.DATE,
    lineNumber: DataTypes.INTEGER,
    status: DataTypes.STRING,
    learnerResponse: DataTypes.STRING
  }, {});
  OutcomeDetail.associate = function(models) {
    // associations can be defined here
  };
  return OutcomeDetail;
};