'use strict';
module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    date: DataTypes.DATE,
    course: DataTypes.STRING,
    learner: DataTypes.STRING,
    seq: DataTypes.INTEGER,
    logMessage: DataTypes.STRING
  }, {});
  Log.associate = function(models) {
    // associations can be defined here
  };
  return Log;
};