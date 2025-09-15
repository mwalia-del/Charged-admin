# API Endpoints Inventory

**Generated:** 2025-09-15T00:35:12.230Z
**Source:** Charged application v1.0

## Summary

- **Total Endpoints:** 65
- **Methods:** GET: 35, PUT: 9, POST: 16, DELETE: 5
- **Tags:** Rider: 14, Ride: 4, Driver: 21, Admin: 25, Payment: 1
- **Deprecated:** 0

## Admin

| Method | Path | Operation ID | Summary | Deprecated | Security | Request Body | Responses |
|--------|------|--------------|---------|------------|----------|--------------|----------|
| DELETE | `/admin/deleteusers/{id}` | `adminDeleteUsers` | Delete Users from Admin Panel | No | bearerAuth | No | 200 |
| DELETE | `/admin/documenttypes/{id}` | `adminDeleteDocumentType` | Delete DocumentType from Admin Panel | No | bearerAuth | No | 200 |
| DELETE | `/admin/rewardpoints/{id}` | `adminDeleteUserRewardPoints` | Delete User reward points from Admin Panel | No | bearerAuth | No | 200 |
| DELETE | `/admin/rewards/{id}` | `adminDeleteRewards` | Delete rewards from Admin Panel | No | bearerAuth | No | 200 |
| GET | `/admin` | `adminLogin` | Returns Admin JSON | No | bearerAuth | No | 200 |
| GET | `/admin/create` | `adminCreate` | Returns Admin JSON | No | bearerAuth | No | 200 |
| GET | `/admin/dashboardstats` | `dashboardstats` | Returns Dashboard Stats | No | bearerAuth | No | 200 |
| GET | `/admin/documenttypes` | `adminDocumentTypesList` | Returns Document Types list | No | bearerAuth | No | 200 |
| GET | `/admin/getdriverdocs/{id}` | `driverDocsList` | Returns Drivers document | No | bearerAuth | No | 200 |
| GET | `/admin/getdrivers` | `driversList` | Returns Drivers list | No | bearerAuth | No | 200 |
| GET | `/admin/getriders` | `ridersList` | Returns Riders list | No | bearerAuth | No | 200 |
| GET | `/admin/rewardpoints/{id}` | `adminUserRewardPoints` | Return Users reward points for Admin Panel | No | bearerAuth | No | 200 |
| GET | `/admin/rewards` | `adminRewards` | Return All Rewards for Admin Panel | No | bearerAuth | No | 200 |
| GET | `/admin/ride/userrides/{id}` | `adminUserRides` | Return Users rides for Admin Panel | No | bearerAuth | No | 200 |
| GET | `/ride` | `getAllRides` | Returns Last 10 Rides for admin dashboard | No | bearerAuth | No | 200 |
| GET | `/ride/fetchride/{id}` | `getAdminRide` | Get Specific Ride | No | bearerAuth | No | 200 |
| POST | `/admin/documenttypes` | `adminCreateDocumentType` | Create Document Type | No | bearerAuth | Yes | 200 |
| POST | `/admin/rewardpoints/{id}` | `adminAddUserRewardPoints` | Add User reward points from Admin Panel | No | bearerAuth | Yes | 200 |
| POST | `/admin/rewards` | `adminAddRewards` | Add rewards from Admin Panel | No | bearerAuth | Yes | 200 |
| POST | `/admin/uploadfiles` | `uploadAdminFiles` | Upload Admin Files e.g. icon, docs etc | No | bearerAuth | Yes | 200 |
| POST | `/ride/ridetype` | `saveRideType` | Create Ride Type | No | bearerAuth | Yes | 200 |
| PUT | `/admin/documenttypes/{id}` | `adminUpdateDocumentType` | Update DocumentType from Admin Panel | No | bearerAuth | Yes | 200 |
| PUT | `/admin/updatestatus/{id}` | `driverDetailStatus` | Update Driver's status | No | bearerAuth | Yes | 200 |
| PUT | `/admin/verifydriverdoc/{id}/{id}` | `driverDocVerify` | Returns Drivers document | No | bearerAuth | Yes | 200 |
| PUT | `/ride/ridetype/{id}` | `updateRideTypeDetails` | Update Ride type details | No | bearerAuth | Yes | 200 |

## Driver

| Method | Path | Operation ID | Summary | Deprecated | Security | Request Body | Responses |
|--------|------|--------------|---------|------------|----------|--------------|----------|
| GET | `/driver` | `userLogin` | Returns User JSON | No | bearerAuth | No | 200 |
| GET | `/driver/documents` | `fetchDocuments` | Fetch Drivers Uploaded Documents | No | bearerAuth | No | 200 |
| GET | `/driver/documenttypes` | `fetchDocumentTypes` | Fetch Document Types available | No | bearerAuth | No | 200 |
| GET | `/driver/getmyrides` | `getDriverRides` | Get My Rides | No | bearerAuth | No | 200 |
| GET | `/driver/getride/{id}` | `getDriverRide` | Get Specific Ride | No | bearerAuth | No | 200 |
| GET | `/driver/myearnings` | `getDriverEarnings` | Get My Earnings | No | bearerAuth | No | 200 |
| GET | `/driver/payment/accountconfirmation` | `driverStripeAccountConfirmation` | Driver Stripe Connect account confirmation | No | public | No | 200 |
| GET | `/driver/payment/accountstatus` | `fetchDriverStripeAccountStatus` | Get Driver Stripe account status | No | bearerAuth | No | 200 |
| GET | `/driver/payment/complete/{id}` | `completePayment` | Complete Payment | No | bearerAuth | No | 200 |
| GET | `/driver/payment/createdriverstripeaccount` | `createDriverStripeAccount` | Create Driver Stripe Connect account | No | bearerAuth | No | 200 |
| GET | `/driver/payment/initiate/{id}` | `initiatePayment` | Initiate Payment | No | bearerAuth | No | 200 |
| GET | `/driver/payment/stripeloginlink` | `generateDriverStripeLogin` | Generate Driver Stripe Login link | No | bearerAuth | No | 200 |
| POST | `/driver/details` | `saveDriverDetails` | Save Driver Details | No | bearerAuth | Yes | 200 |
| POST | `/driver/ride/addrating/{id}` | `postRiderRideRating` | Add Ride rating | No | bearerAuth | Yes | 200 |
| POST | `/driver/saveridelocation/{id}` | `driverSaveRideLocation` | Save Ride location | No | bearerAuth | Yes | 200 |
| POST | `/driver/uploaddocument/{id}` | `uploadDriverDocuments` | Upload Driver Documents for verifiction from Admin | No | bearerAuth | Yes | 200 |
| POST | `/driver/uploadfiles` | `uploadDriverFiles` | Upload Driver Files e.g. profile image etc | No | bearerAuth | Yes | 200 |
| POST | `/ride/driver/sendchatnotification/{id}` | `sendRiderChatNotifications` | Send Ride Chat Notifications | No | bearerAuth | Yes | 200 |
| PUT | `/driver` | `userProfileUpdate` | Returns User JSON | No | bearerAuth | Yes | 200 |
| PUT | `/driver/changeridestatus/{id}` | `driverChangeRideStatus` | Change Ride status | No | bearerAuth | Yes | 200 |
| PUT | `/driver/details` | `updateDriverDetails` | Update Driver Details | No | bearerAuth | Yes | 200 |

## Payment

| Method | Path | Operation ID | Summary | Deprecated | Security | Request Body | Responses |
|--------|------|--------------|---------|------------|----------|--------------|----------|
| GET | `/payment/addpm` | `addPM` | ADD P M | No | bearerAuth | No | 200 |

## Ride

| Method | Path | Operation ID | Summary | Deprecated | Security | Request Body | Responses |
|--------|------|--------------|---------|------------|----------|--------------|----------|
| GET | `/ride/fetchdriver/{id}` | `riderFetchDriver` | fetch driver for a ride | No | bearerAuth | No | 200 |
| GET | `/ride/fetchrider/{id}` | `driverFetchRider` | fetch rider for a ride | No | bearerAuth | No | 200 |
| GET | `/ride/ridetype` | `getAllRideTypes` | Get All Ride Types | No | bearerAuth | No | 200 |
| POST | `/ride` | `saveRide` | Create Ride | No | bearerAuth | Yes | 200 |

## Rider

| Method | Path | Operation ID | Summary | Deprecated | Security | Request Body | Responses |
|--------|------|--------------|---------|------------|----------|--------------|----------|
| DELETE | `/rider/paymentmethods/{id}` | `deleteRiderPM` | Delete Rider Added Payment Method | No | bearerAuth | No | 200 |
| GET | `/rider` | `userLogin` | Returns User JSON | No | bearerAuth | No | 200 |
| GET | `/rider/getmyrides` | `getRiderRides` | Get My Rides | No | bearerAuth | No | 200 |
| GET | `/rider/getrewards` | `getRewards` | Get Rewards | No | bearerAuth | No | 200 |
| GET | `/rider/getride/{id}` | `getRiderRide` | Get Specific Ride | No | bearerAuth | No | 200 |
| GET | `/rider/myrewardpoints` | `getRiderRewardPoints` | Get My Reward Points | No | bearerAuth | No | 200 |
| GET | `/rider/paymentmethods` | `riderPM` | Returns Rider Payment Methods | No | bearerAuth | No | 200 |
| GET | `/rider/sendnotification` | `pushNotification` | Sends Push notification | No | public | No | 200 |
| POST | `/ride/rider/sendchatnotification/{id}` | `sendDriverChatNotifications` | Send Ride Chat Notifications | No | bearerAuth | Yes | 200 |
| POST | `/rider/payment/addmethod` | `addPaymentMethod` | Add Payment Method | No | bearerAuth | Yes | 200 |
| POST | `/rider/ride/addrating/{id}` | `postDriverRideRating` | Add Ride rating | No | bearerAuth | Yes | 200 |
| POST | `/rider/uploadfiles` | `uploadDriverFiles` | Upload Driver Files e.g. profile image etc | No | bearerAuth | Yes | 200 |
| PUT | `/rider` | `userProfileUpdate` | Returns User JSON | No | bearerAuth | Yes | 200 |
| PUT | `/rider/changeridestatus/{id}` | `riderChangeRideStatus` | Change Ride status | No | bearerAuth | Yes | 200 |

