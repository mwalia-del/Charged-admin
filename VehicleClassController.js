const VehicleClassModel = require('../models/VehicleClassModel');

// Get all vehicle classes (admin)
const getAllVehicleClasses = async (req, res) => {
  try {
    const vehicleClasses = await VehicleClassModel.getAll();
    res.json({
      success: true,
      vehicle_classes: vehicleClasses
    });
  } catch (error) {
    console.error('Error fetching vehicle classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle classes',
      error: error.message
    });
  }
};

// Get vehicle class by code (admin)
const getVehicleClassByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const vehicleClass = await VehicleClassModel.getByCode(code);
    
    if (!vehicleClass) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle class not found'
      });
    }

    res.json({
      success: true,
      vehicle_class: vehicleClass
    });
  } catch (error) {
    console.error('Error fetching vehicle class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle class',
      error: error.message
    });
  }
};

// Update vehicle class (admin)
const updateVehicleClass = async (req, res) => {
  try {
    const { code } = req.params;
    const updateData = req.body;

    // Validate that the vehicle class exists
    const existingClass = await VehicleClassModel.getByCode(code);
    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle class not found'
      });
    }

    // Validate update data
    const allowedFields = ['is_enabled', 'display_name'];
    const updateFields = Object.keys(updateData);
    const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(', ')}`,
        allowed_fields: allowedFields
      });
    }

    const updatedClass = await VehicleClassModel.update(code, updateData);
    
    res.json({
      success: true,
      message: 'Vehicle class updated successfully',
      vehicle_class: updatedClass
    });
  } catch (error) {
    console.error('Error updating vehicle class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle class',
      error: error.message
    });
  }
};

// Create vehicle class (admin)
const createVehicleClass = async (req, res) => {
  try {
    const { code, display_name, is_enabled } = req.body;

    // Validate required fields
    if (!code || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'code and display_name are required'
      });
    }

    // Validate code format (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'code must contain only alphanumeric characters and underscores'
      });
    }

    // Check if code already exists
    const existingClass = await VehicleClassModel.getByCode(code);
    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle class with this code already exists'
      });
    }

    const vehicleClassData = {
      code,
      display_name,
      is_enabled: is_enabled !== undefined ? is_enabled : true
    };

    const newClass = await VehicleClassModel.create(vehicleClassData);
    
    res.status(201).json({
      success: true,
      message: 'Vehicle class created successfully',
      vehicle_class: newClass
    });
  } catch (error) {
    console.error('Error creating vehicle class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle class',
      error: error.message
    });
  }
};

// Delete vehicle class (admin)
const deleteVehicleClass = async (req, res) => {
  try {
    const { code } = req.params;

    const deletedClass = await VehicleClassModel.delete(code);
    
    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle class not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle class:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle class',
      error: error.message
    });
  }
};

// Get enabled vehicle classes (public catalog)
const getCatalogVehicleClasses = async (req, res) => {
  try {
    const vehicleClasses = await VehicleClassModel.getEnabled();
    res.json({
      success: true,
      vehicle_classes: vehicleClasses
    });
  } catch (error) {
    console.error('Error fetching catalog vehicle classes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle classes',
      error: error.message
    });
  }
};

module.exports = {
  getAllVehicleClasses,
  getVehicleClassByCode,
  updateVehicleClass,
  createVehicleClass,
  deleteVehicleClass,
  getCatalogVehicleClasses
};
