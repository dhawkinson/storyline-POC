'use strict';
module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        number: DataTypes.STRING,
        title: DataTypes.STRING,
        itemCount: DataTypes.INTEGER,
        passScore: DataTypes.INTEGER,
        maxScore: DataTypes.INTEGER,
        minScore: DataTypes.INTEGER
    }, {});
    Course.associate = function(models) {
        // associations can be defined here
        Course.hasMany(models.Outcome, { foreignKey: 'course_id' });    // 1 course.id has many instances in outcomes (1:many)
    };
    return Course;
};