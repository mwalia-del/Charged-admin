const axios = require('axios');

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address: address,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          success: true,
          data: {
            address: result.formatted_address,
            coordinates: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            },
            placeId: result.place_id,
            components: result.address_components
          }
        };
      } else {
        return {
          success: false,
          error: response.data.status || 'Geocoding failed'
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          success: true,
          data: {
            address: result.formatted_address,
            placeId: result.place_id,
            components: result.address_components
          }
        };
      } else {
        return {
          success: false,
          error: response.data.status || 'Reverse geocoding failed'
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(origin, destination, options = {}) {
    try {
      const params = {
        origin: origin,
        destination: destination,
        key: this.apiKey,
        ...options
      };

      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params: params
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        
        return {
          success: true,
          data: {
            distance: {
              text: leg.distance.text,
              value: leg.distance.value // in meters
            },
            duration: {
              text: leg.duration.text,
              value: leg.duration.value // in seconds
            },
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps.map(step => ({
              instruction: step.html_instructions,
              distance: step.distance,
              duration: step.duration,
              coordinates: {
                lat: step.start_location.lat,
                lng: step.start_location.lng
              }
            })),
            polyline: route.overview_polyline.points
          }
        };
      } else {
        return {
          success: false,
          error: response.data.status || 'Directions failed'
        };
      }
    } catch (error) {
      console.error('Directions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search for places near a location
   */
  async searchPlaces(query, location, radius = 5000) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/textsearch/json`, {
        params: {
          query: query,
          location: `${location.lat},${location.lng}`,
          radius: radius,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return {
          success: true,
          data: response.data.results.map(place => ({
            name: place.name,
            address: place.formatted_address,
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            placeId: place.place_id,
            rating: place.rating,
            types: place.types
          }))
        };
      } else {
        return {
          success: false,
          error: response.data.status || 'Places search failed'
        };
      }
    } catch (error) {
      console.error('Places search error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get place details by place ID
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,place_id,rating,types,formatted_phone_number,website,opening_hours',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        const place = response.data.result;
        return {
          success: true,
          data: {
            name: place.name,
            address: place.formatted_address,
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            placeId: place.place_id,
            rating: place.rating,
            types: place.types,
            phone: place.formatted_phone_number,
            website: place.website,
            openingHours: place.opening_hours
          }
        };
      } else {
        return {
          success: false,
          error: response.data.status || 'Place details failed'
        };
      }
    } catch (error) {
      console.error('Place details error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate distance between two points
   */
  async calculateDistance(origin, destination) {
    try {
      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          units: 'metric',
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.rows.length > 0) {
        const element = response.data.rows[0].elements[0];
        if (element.status === 'OK') {
          return {
            success: true,
            data: {
              distance: {
                text: element.distance.text,
                value: element.distance.value // in meters
              },
              duration: {
                text: element.duration.text,
                value: element.duration.value // in seconds
              }
            }
          };
        } else {
          return {
            success: false,
            error: element.status || 'Distance calculation failed'
          };
        }
      } else {
        return {
          success: false,
          error: response.data.status || 'Distance calculation failed'
        };
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Controller methods
const googleMapsService = new GoogleMapsService();

exports.geocodeAddress = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        status: false,
        message: "Address is required"
      });
    }

    const result = await googleMapsService.geocodeAddress(address);
    
    if (result.success) {
      res.json({
        status: true,
        message: "Address geocoded successfully",
        data: result.data
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Geocoding failed",
        error: result.error
      });
    }
  } catch (error) {
    console.error('Geocode controller error:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({
        status: false,
        message: "Latitude and longitude are required"
      });
    }

    const result = await googleMapsService.reverseGeocode(lat, lng);
    
    if (result.success) {
      res.json({
        status: true,
        message: "Reverse geocoding successful",
        data: result.data
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Reverse geocoding failed",
        error: result.error
      });
    }
  } catch (error) {
    console.error('Reverse geocode controller error:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getDirections = async (req, res) => {
  try {
    const { origin, destination, mode = 'driving', avoid = [], waypoints = [] } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({
        status: false,
        message: "Origin and destination are required"
      });
    }

    const options = {
      mode: mode,
      avoid: avoid,
      waypoints: waypoints
    };

    const result = await googleMapsService.getDirections(origin, destination, options);
    
    if (result.success) {
      res.json({
        status: true,
        message: "Directions retrieved successfully",
        data: result.data
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Directions failed",
        error: result.error
      });
    }
  } catch (error) {
    console.error('Directions controller error:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.searchPlaces = async (req, res) => {
  try {
    const { query, lat, lng, radius = 5000 } = req.body;
    
    if (!query || !lat || !lng) {
      return res.status(400).json({
        status: false,
        message: "Query, latitude, and longitude are required"
      });
    }

    const result = await googleMapsService.searchPlaces(query, { lat, lng }, radius);
    
    if (result.success) {
      res.json({
        status: true,
        message: "Places search successful",
        data: result.data
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Places search failed",
        error: result.error
      });
    }
  } catch (error) {
    console.error('Places search controller error:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;
    
    if (!placeId) {
      return res.status(400).json({
        status: false,
        message: "Place ID is required"
      });
    }

    const result = await googleMapsService.getPlaceDetails(placeId);
    
    if (result.success) {
      res.json({
        status: true,
        message: "Place details retrieved successfully",
        data: result.data
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Place details failed",
        error: result.error
      });
    }
  } catch (error) {
    console.error('Place details controller error:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.calculateDistance = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({
        status: false,
        message: "Origin and destination coordinates are required"
      });
    }

    const result = await googleMapsService.calculateDistance(origin, destination);
    
    if (result.success) {
      res.json({
        status: true,
        message: "Distance calculated successfully",
        data: result.data
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Distance calculation failed",
        error: result.error
      });
    }
  } catch (error) {
    console.error('Distance calculation controller error:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = googleMapsService;
