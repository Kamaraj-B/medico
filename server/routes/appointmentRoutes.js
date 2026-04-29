
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const {protect} = require('../middlewares/auth.middleware');

router.post('/',protect,appointmentController.createAppointment);
router.get('/',protect,appointmentController.getAppointments);
router.get('/:id',protect,appointmentController.getAppointmentById);
router.put('/:id',protect,appointmentController.updateAppointment);
router.delete('/:id', protect,appointmentController.deleteAppointment);

module.exports = router;
