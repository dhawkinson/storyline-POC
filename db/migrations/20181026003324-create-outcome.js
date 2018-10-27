'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Outcomes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      course: {
        type: Sequelize.STRING
      },
      learner: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      pointScore: {
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
    return queryInterface.dropTable('Outcomes');
  }
};