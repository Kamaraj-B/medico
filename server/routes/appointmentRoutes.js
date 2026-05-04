
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const {protect} = require('../middlewares/auth.middleware');

router.post('/',protect,appointmentController.createAppointment);
router.get('/booked-slots', appointmentController.getBookedSlots);
router.get('/',protect,appointmentController.getAppointments);
router.get('/admin/summary', protect, appointmentController.getAdminSummary);
router.get('/:id',protect,appointmentController.getAppointmentById);
router.put('/:id',protect,appointmentController.updateAppointment);
router.delete('/:id', protect,appointmentController.deleteAppointment);

module.exports = router;
