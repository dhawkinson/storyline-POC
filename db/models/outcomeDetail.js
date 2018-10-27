'use strict';
module.exports = (sequelize, DataTypes) => {
    const OutcomeDetail = sequelize.define('OutcomeDetail', {
        lineNumber: DataTypes.INTEGER,
        description: DataTypes.STRING,
        correctResponse: DataTypes.STRING,
        status: DataTypes.STRING,
        learnerResponse: DataTypes.STRING,
        weight: DataTypes.INTEGER,
        points: DataTypes.INTEGER
    }, {});
    OutcomeDetail.associate = function(models) {
        // associations can be defined here
        OutcomeDetail.belongsTo(Outcome);
    };
    return OutcomeDetail;
};