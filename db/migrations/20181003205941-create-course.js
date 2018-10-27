'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      number: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      source: {
        type: Sequelize.STRING
      },
      pubYear: {
        type: Sequelize.INTEGER
      },
      itemCount: {
        type: Sequelize.INTEGER
      },
      passScore: {
        type: Sequelize.INTEGER
      },
      maxScore: {
        type: Sequelize.INTEGER
      },
      minScore: {
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
    return queryInterface.dropTable('Courses');
  }
};