'use strict';

const { v4: uuidv4 } = require('uuid');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
          id: uuidv4(),
          name: 'Admin',
          permissions: [
              'manage_users',
              'manage_pharmacies',
              'manage_doctors',
              'manage_articles',
              'manage_roles',
              'view_analytics'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
          id: uuidv4(),
          name: 'User',
          permissions: [
              'search_pharmacies',
              'view_products',
              'read_articles',
              'manage_own_profile'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
          id: uuidv4(),
          name: 'Pharmacy',
          permissions: [
              'manage_products',
              'update_schedule',
              'manage_inventory',
              'view_notifications',
              'manage_own_profile',
              'manage_helpers',
              'view_analytics',
              'manage_pharmacy_settings'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
          id: uuidv4(),
          name: 'Pharmacy_Helper',
          permissions: [
              'view_products',
              'update_inventory',
              'view_schedule',
              'manage_own_profile',
              'view_notifications'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
      },
      {
          id: uuidv4(),
          name: 'Doctor',
          permissions: [
              'publish_articles',
              'manage_own_profile',
              'view_patient_info'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
      }
  ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
