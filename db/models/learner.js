'use strict';
module.exports = (sequelize, DataTypes) => {
    const Learner = sequelize.define('Learner', {
        name: DataTypes.STRING,
        email: DataTypes.STRING
    }, {});
    Learner.associate = function(models) {
        // associations can be defined here
    };
    return Learner;
};