const { body } = require('express-validator');

module.exports = {
  addOwnerValidationRules: [
    body('name').notEmpty(),
    body('national_code').notEmpty().isInt(),
    body('age').notEmpty().isInt(),
    body('total_toll_paid').notEmpty().isInt(),
    body('ownerCar').isArray(),
    body('ownerCar.*.type').notEmpty(),
    body('ownerCar.*.color').notEmpty(),
    body('ownerCar.*.length').isNumeric(),
    body('ownerCar.*.load_valume').optional({ nullable: true }).isNumeric()
  ]
};
