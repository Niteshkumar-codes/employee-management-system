import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes within this router
router.use(protect);

// Routes
router
  .route('/')
  .get(getEmployees) // All authenticated users can view all employees
  .post(authorizeRoles('admin', 'hr'), createEmployee); // Only admin/hr can create employees

router
  .route('/:id')
  .get(getEmployeeById) // All authenticated users can view single employee details
  .put(authorizeRoles('admin', 'hr'), updateEmployee) // Only admin/hr can update employees
  .delete(authorizeRoles('admin', 'hr'), deleteEmployee); // Only admin/hr can delete employees

export default router;
