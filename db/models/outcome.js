'use strict';
module.exports = (sequelize, DataTypes) => {
    const Outcome = sequelize.define('Outcome', {
        course: DataTypes.STRING,
        learner: DataTypes.STRING,
        date: DataTypes.DATE,
        status: DataTypes.STRING,
        pointScore: DataTypes.INTEGER
    }, {});
    Outcome.associate = function(models) {
        // associations can be defined here
        Outcome.hasMany(OutcomeDetails);
    };
    return Outcome;
};