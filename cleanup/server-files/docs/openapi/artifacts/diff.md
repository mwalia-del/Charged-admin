# OpenAPI Diff Report

**Generated:** 2025-09-15T03:06:42.377Z

## Summary

- **Total Endpoints:** 13
- **Added:** 13
- **Removed:** 0
- **Changed:** 0

## Added Endpoints

- **POST** `/auth/login`
  - Summary: User login
  - Operation ID: `authLogin`
  - Tags: Authentication

- **POST** `/auth/register`
  - Summary: User registration
  - Operation ID: `authRegister`
  - Tags: Authentication

- **POST** `/auth/refresh`
  - Summary: Refresh access token
  - Operation ID: `authRefresh`
  - Tags: Authentication

- **POST** `/auth/token/exchange`
  - Summary: Exchange token
  - Operation ID: `authTokenExchange`
  - Tags: Authentication

- **GET** `/drivers/me`
  - Summary: Get current driver profile
  - Operation ID: `getDriverProfile`
  - Tags: Drivers

- **GET** `/drivers/me/rides`
  - Summary: Get driver's rides
  - Operation ID: `getDriverRides`
  - Tags: Drivers

- **GET** `/riders/me`
  - Summary: Get current rider profile
  - Operation ID: `getRiderProfile`
  - Tags: Riders

- **GET** `/riders/me/rides`
  - Summary: Get rider's rides
  - Operation ID: `getRiderRides`
  - Tags: Riders

- **GET** `/riders/me/referrals/issuances`
  - Summary: Get rider's referral issuances
  - Operation ID: `getRiderReferralIssuances`
  - Tags: Riders

- **GET** `/riders/me/promotions/active`
  - Summary: Get active promotions for rider
  - Operation ID: `getRiderActivePromotions`
  - Tags: Riders

- **POST** `/rides`
  - Summary: Create a new ride
  - Operation ID: `createRide`
  - Tags: Rides

- **GET** `/rides/{rideId}`
  - Summary: Get ride details
  - Operation ID: `getRideDetails`
  - Tags: Rides

- **POST** `/rides/{rideId}/cancel`
  - Summary: Cancel ride
  - Operation ID: `cancelRide`
  - Tags: Rides

