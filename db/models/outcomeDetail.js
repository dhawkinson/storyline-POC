'use strict';
module.exports = (sequelize, DataTypes) => {
  const OutcomeDetail = sequelize.define('OutcomeDetail', {
    line_number: DataTypes.INTEGER,
    description: DataTypes.STRING,
    correctResponse: DataTypes.STRING,
    status: DataTypes.STRING,
    learnerResponse: DataTypes.STRING,
    weight: DataTypes.INTEGER,
    points: DataTypes.INTEGER
  }, {});
  OutcomeDetail.associate = function(models) {
    // associations can be defined here
  };
  return OutcomeDetail;
};