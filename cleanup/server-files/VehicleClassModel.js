const pool = require('../db');

class VehicleClassModel {
  // Get all vehicle classes
  static async getAll() {
    try {
      const query = `
        SELECT 
          id,
          code,
          display_name,
          is_enabled,
          created_at,
          updated_at
        FROM vehicle_classes 
        ORDER BY code ASC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching vehicle classes:', error);
      throw error;
    }
  }

  // Get vehicle class by code
  static async getByCode(code) {
    try {
      const query = `
        SELECT 
          id,
          code,
          display_name,
          is_enabled,
          created_at,
          updated_at
        FROM vehicle_classes 
        WHERE code = $1
      `;
      const result = await pool.query(query, [code]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching vehicle class by code:', error);
      throw error;
    }
  }

  // Update vehicle class
  static async update(code, updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic query based on provided fields
      if (updateData.is_enabled !== undefined) {
        fields.push(`is_enabled = $${paramCount}`);
        values.push(updateData.is_enabled);
        paramCount++;
      }
      if (updateData.display_name !== undefined) {
        fields.push(`display_name = $${paramCount}`);
        values.push(updateData.display_name);
        paramCount++;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      // Add updated_at timestamp
      fields.push(`updated_at = CURRENT_TIMESTAMP`);

      // Add code parameter
      values.push(code);

      const query = `
        UPDATE vehicle_classes 
        SET ${fields.join(', ')}
        WHERE code = $${paramCount}
        RETURNING 
          id,
          code,
          display_name,
          is_enabled,
          created_at,
          updated_at
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating vehicle class:', error);
      throw error;
    }
  }

  // Create new vehicle class
  static async create(vehicleClassData) {
    try {
      const query = `
        INSERT INTO vehicle_classes (
          code, 
          display_name, 
          is_enabled
        ) VALUES ($1, $2, $3)
        RETURNING 
          id,
          code,
          display_name,
          is_enabled,
          created_at,
          updated_at
      `;
      
      const values = [
        vehicleClassData.code,
        vehicleClassData.display_name,
        vehicleClassData.is_enabled !== undefined ? vehicleClassData.is_enabled : true
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating vehicle class:', error);
      throw error;
    }
  }

  // Delete vehicle class
  static async delete(code) {
    try {
      const query = 'DELETE FROM vehicle_classes WHERE code = $1 RETURNING code';
      const result = await pool.query(query, [code]);
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting vehicle class:', error);
      throw error;
    }
  }

  // Get enabled vehicle classes (for public catalog)
  static async getEnabled() {
    try {
      const query = `
        SELECT 
          id,
          code,
          display_name,
          is_enabled,
          created_at,
          updated_at
        FROM vehicle_classes 
        WHERE is_enabled = true
        ORDER BY code ASC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching enabled vehicle classes:', error);
      throw error;
    }
  }
}

module.exports = VehicleClassModel;
