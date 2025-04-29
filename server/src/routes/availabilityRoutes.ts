import express from 'express';
import { 
  getAllAvailabilities, 
  createAvailability, 
  updateAvailability, 
  deleteAvailability, 
  getAllAvailabilitiesWithUser
} from '../controllers/availabilityController';

const router = express.Router();

// Get all availabilities for a specific user
router.get('/:userId', getAllAvailabilities);

router.get('/', getAllAvailabilitiesWithUser);


// Create a new availability for a user
router.post('/', createAvailability);

// Update availability for a user
router.put('/:id', updateAvailability);

// Delete availability for a user
router.delete('/:id', deleteAvailability);

export default router;
