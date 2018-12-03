'use strict';
module.exports = (sequelize, DataTypes) => {
  const OutcomeDetail = sequelize.define('OutcomeDetail', {
    learnerEmail: DataTypes.STRING,
    courseNumber: DataTypes.STRING,
    outcomeDate: DataTypes.DATE,
    lineNumber: DataTypes.INTEGER,
    status: DataTypes.STRING,
    learnerResponse: DataTypes.STRING
  }, {});
  OutcomeDetail.associate = function(models) {
    // associations can be defined here
    OutcomeDetail.belongsTo(models.Outcome, { foreignKey: 'outcomeId' }); // a foreign key of the outcome model
  };
  return OutcomeDetail;
};