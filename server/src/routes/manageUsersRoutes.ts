import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { manageUsersController } from '../controllers/manageUsersController';

const router = express.Router();

// Super Admin and Managers can create users
router.post('/', 
  authMiddleware(['super_admin', 'manager']), 
  manageUsersController.createUser
);

// Get all users (filtered based on role)
router.get('/', 
  authMiddleware(['super_admin', 'manager', 'user']), 
  manageUsersController.getAllUsers
);

// Get single user
router.get('/:id', 
  authMiddleware(['super_admin', 'manager', 'user']), 
  manageUsersController.getUserById
);

// Update user
router.put('/:id', 
  authMiddleware(['super_admin', 'manager']), 
  manageUsersController.updateUser
);

// Delete user
router.delete('/:id', 
  authMiddleware(['super_admin', 'manager']), 
  manageUsersController.deleteUser
);

export default router;