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
      lineNumber: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING
      },
      correctResponse: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      learnerResponse: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.INTEGER
      },
      points: {
        type: Sequelize.INTEGER
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