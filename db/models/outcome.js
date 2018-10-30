'use strict';
module.exports = (sequelize, DataTypes) => {
  const Outcome = sequelize.define('Outcome', {
    course: DataTypes.STRING,
    learner: DataTypes.STRING,
    learnerEmail: DataTypes.STRING,
    date: DataTypes.DATE,
    status: DataTypes.STRING,
    pointScore: DataTypes.INTEGER,
    pointMax: DataTypes.INTEGER
  }, {});
  Outcome.associate = function(models) {
    // associations can be defined here
    Outcome.belongsTo(models.Course, { foreignKey: 'course_id' }); // a foreign key of the course model
    Outcome.belongsTo(models.Learner, { foreignKey: 'learner_id' }); // a foreign key of the learner model
    Outcome.hasMany(models.OutcomeDetails, { foreignKey: 'outcome_id' }); // 1 outcome.id has many instances in outcomesDetails (1:many)
  };
  return Outcome;
};