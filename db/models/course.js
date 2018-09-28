'use strict';
const Op = Sequelize.Op;
const currentYear = (new Date()).getFullYear();
module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        courseNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                  msg: 'Course Number is required.'
                },
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                  msg: 'Course Title is required.'
                },
            }
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Type is required.'
                },
            }
        },
        source: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
                notEmpty: {
                    msg: 'Source is required'
                },
            }
        },
        pubYear: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                not: {
                  [Op.between]: ['1900', ${currentYear}],
                  msg: 'Year First Published must be in the format: "YYYY" and not greater than current year'
                }
            }
        },
        itemCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        passScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        maxScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        minScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {});
    Course.associate = function(models) {
      // associations can be defined here
    };
    return Course;
};