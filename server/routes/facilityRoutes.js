const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const uploadFiles  = require('../config/multer.config');
const {protect} = require('../middlewares/auth.middleware');

const facilityUpload = uploadFiles({
  folder: 'facility',
  fields: [
    { name: 'images', maxCount: 5 },
    { name: 'documents', maxCount: 3 }
  ]
});

router.post('/', protect, facilityUpload, facilityController.createFacility);
router.patch('/:id', protect, facilityUpload, facilityController.updateFacility);
router.get('/', facilityController.getAllFacilities);
router.get('/:id', facilityController.getFacilityWithDoctors);
router.delete('/:id', protect, facilityController.deleteFacility);

module.exports = router;
