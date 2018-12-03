'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('OutcomeDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      learnerEmail: {
        type: Sequelize.STRING
      },
      courseNumber: {
        type: Sequelize.STRING
      },
      lineNumber: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      learnerResponse: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('OutcomeDetails');
  }
};