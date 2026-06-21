import Employee from '../models/employee.model.js';

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private
export const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name, email, phone, department, designation, salary, joiningDate, status } = req.body;

    // Check if required fields exist in request
    if (!employeeId || !name || !email || !phone || !department || !designation || salary === undefined) {
      return res.status(400).json({ message: 'Please provide all required employee fields' });
    }

    // Check if employee with same employeeId or email already exists
    const employeeExists = await Employee.findOne({ $or: [{ employeeId }, { email }] });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee with this ID or Email already exists' });
    }

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      salary,
      joiningDate,
      status,
    });

    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private
export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find and update employee, returning the updated document and running model validations
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedEmployee);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};
