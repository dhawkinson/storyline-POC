'use strict';
module.exports = (sequelize, DataTypes) => {
    const Learner = sequelize.define('Learner', {
        name: DataTypes.STRING,
        email: DataTypes.STRING
    }, {});
    Learner.associate = function(models) {
        // associations can be defined here
        Learner.hasMany(models.Outcome, { foreignKey: 'learnerId' });  // 1 learner.id has many instances in outcomes (1:many)
    };
    return Learner;
};