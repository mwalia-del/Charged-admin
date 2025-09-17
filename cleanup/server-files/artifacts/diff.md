# API Endpoints Diff Report

**Generated:** 2025-09-15T00:35:26.187Z
**Source:** Charged application v1.0

## Summary

- **Missing in Code:** 65 endpoints
- **Stale in Code:** 73 endpoints
- **Files with API Calls:** 12

## ⚠️ Stale Endpoints in Code

These endpoints are used in the code but not found in the OpenAPI schema:

| Method | Path | File | Line | Context |
|--------|------|------|------|----------|
| PATCH | `/admin/vehicle-classes/${id}` | `src/API/vehicleClasses.ts` | 49 | `const response = await instance.patch(`/admin/vehi...` |
| GET | `/businesses/${id}` | `src/API/business.ts` | 57 | `const response = await instance.get(`/businesses/$...` |
| GET | `/businesses/${id}` | `src/pages/business/BusinessListPage.tsx` | 86 | `navigate(`/businesses/${orgId}`);...` |
| POST | `/businesses/${id}/enrollment` | `src/API/business.ts` | 70 | `const response = await instance.post(`/businesses/...` |
| GET | `/businesses/${id}/rides?${id}` | `src/API/business.ts` | 90 | `const response = await instance.get(`/businesses/$...` |
| GET | `/businesses/${id}/rides/summary?${id}` | `src/API/business.ts` | 122 | `const response = await instance.get(`/businesses/$...` |
| POST | `/businesses/${id}/wallet/credit-purchase` | `src/API/business.ts` | 149 | `const response = await instance.post(`/businesses/...` |
| GET | `/businesses/${id}/wallet/transactions?page=${id}&page_size=${id}` | `src/API/business.ts` | 171 | `const response = await instance.get(`/businesses/$...` |
| POST | `/businesses/${id}/invoices/generate` | `src/API/business.ts` | 195 | `const response = await instance.post(`/businesses/...` |
| GET | `/businesses/${id}/invoices?page=${id}&page_size=${id}` | `src/API/business.ts` | 216 | `const response = await instance.get(`/businesses/$...` |
| GET | `/invoices/${id}` | `src/API/business.ts` | 240 | `const response = await instance.get(`/invoices/${i...` |
| GET | `/businesses/${id}/rewards/summary` | `src/API/business.ts` | 261 | `const response = await instance.get(`/businesses/$...` |
| GET | `/businesses/${id}/rewards/ledger?page=${id}&page_size=${id}` | `src/API/business.ts` | 277 | `const response = await instance.get(`/businesses/$...` |
| POST | `/businesses/${id}/rewards/adjust` | `src/API/business.ts` | 301 | `const response = await instance.post(`/businesses/...` |
| GET | `/admin/scheduled-rides?${id}` | `src/API/scheduled.ts` | 54 | `const response = await instance.get(`/admin/schedu...` |
| GET | `/admin/scheduled-rides/summary?${id}` | `src/API/scheduled.ts` | 82 | `const response = await instance.get(`/admin/schedu...` |
| POST | `/admin/scheduled-rides/${id}/assign-driver` | `src/API/scheduled.ts` | 93 | `await instance.post(`/admin/scheduled-rides/${sche...` |
| POST | `/admin/scheduled-rides/${id}/cancel` | `src/API/scheduled.ts` | 106 | `await instance.post(`/admin/scheduled-rides/${sche...` |
| GET | `/admin/scheduled-rides/export?${id}` | `src/API/scheduled.ts` | 128 | `const response = await instance.get(`/admin/schedu...` |
| GET | `/riders/me/scheduled-rides?${id}` | `src/API/scheduled.ts` | 160 | `const response = await instance.get(`/riders/me/sc...` |
| PATCH | `/riders/me/scheduled-rides/${id}` | `src/API/scheduled.ts` | 179 | `const response = await instance.patch(`/riders/me/...` |
| DELETE | `/riders/me/scheduled-rides/${id}` | `src/API/scheduled.ts` | 189 | `await instance.delete(`/riders/me/scheduled-rides/...` |
| POST | `/businesses/${id}/scheduled-rides` | `src/API/scheduled.ts` | 204 | `const response = await instance.post(`/businesses/...` |
| GET | `/businesses/${id}/scheduled-rides?${id}` | `src/API/scheduled.ts` | 222 | `const response = await instance.get(`/businesses/$...` |
| PATCH | `/businesses/${id}/scheduled-rides/${id}` | `src/API/scheduled.ts` | 241 | `const response = await instance.patch(`/businesses...` |
| DELETE | `/businesses/${id}/scheduled-rides/${id}` | `src/API/scheduled.ts` | 251 | `await instance.delete(`/businesses/${orgId}/schedu...` |
| GET | `/analytics/tips?${id}` | `src/API/tips.ts` | 44 | `const response = await instance.get(`/analytics/ti...` |
| GET | `/analytics/tips/summary?${id}` | `src/API/tips.ts` | 78 | `const response = await instance.get(`/analytics/ti...` |
| GET | `/drivers/${id}/tips?${id}` | `src/API/tips.ts` | 99 | `const response = await instance.get(`/drivers/${dr...` |
| GET | `/riders/${id}/tips?${id}` | `src/API/tips.ts` | 133 | `const response = await instance.get(`/riders/${rid...` |
| POST | `/rides/${id}/tip` | `src/API/tips.ts` | 158 | `const response = await instance.post(`/rides/${rid...` |
| GET | `/analytics/tips/export?${id}` | `src/API/tips.ts` | 179 | `const response = await instance.get(`/analytics/ti...` |
| GET | `/admin/getdriverdocs/${id}` | `src/API/axios.ts` | 80 | `instance.get(`/admin/getdriverdocs/${id}`);...` |
| PUT | `/admin/verifydriverdoc/${id}/${id}` | `src/API/axios.ts` | 93 | `) => instance.put(`/admin/verifydriverdoc/${driver...` |
| PUT | `/admin/updatestatus/${id}` | `src/API/axios.ts` | 102 | `return instance.put(`/admin/updatestatus/${driverI...` |
| PUT | `/admin/documenttypes/${id}` | `src/API/axios.ts` | 127 | `instance.put(`/admin/documenttypes/${id}`, body);...` |
| DELETE | `/admin/documenttypes/${id}` | `src/API/axios.ts` | 136 | `instance.delete(`/admin/documenttypes/${documentId...` |
| PUT | `/ride/ridetype/${id}` | `src/API/axios.ts` | 158 | `instance.put(`/ride/ridetype/${id}`, body);...` |
| DELETE | `/admin/rewards/${id}` | `src/API/axios.ts` | 205 | `instance.delete(`/admin/rewards/${rewardId}`);...` |
| GET | `/admin/rewardpoints/${id}` | `src/API/axios.ts` | 214 | `instance.get(`/admin/rewardpoints/${userId}`);...` |
| POST | `/admin/rewardpoints/${id}` | `src/API/axios.ts` | 225 | `) => instance.post(`/admin/rewardpoints/${userId}`...` |
| DELETE | `/admin/rewardpoints/${id}` | `src/API/axios.ts` | 234 | `instance.delete(`/admin/rewardpoints/${rewardPoint...` |
| DELETE | `/admin/deleteusers/${id}` | `src/API/axios.ts` | 243 | `instance.delete(`/admin/deleteusers/${userId}`);...` |
| GET | `/admin/referrals/issuances?${id}` | `src/API/referrals.ts` | 60 | `const response = await instance.get(`/admin/referr...` |
| GET | `/admin/referrals/summary?${id}` | `src/API/referrals.ts` | 94 | `const response = await instance.get(`/admin/referr...` |
| POST | `/admin/referrals/issuances/${id}/void` | `src/API/referrals.ts` | 106 | `const response = await instance.post(`/admin/refer...` |
| GET | `/drivers/me/referrals/issuances?${id}` | `src/API/referrals.ts` | 147 | `const response = await instance.get(`/drivers/me/r...` |
| GET | `/drivers/me/referrals/summary?${id}` | `src/API/referrals.ts` | 179 | `const response = await instance.get(`/drivers/me/r...` |
| GET | `/riders/me/referrals/issuances?${id}` | `src/API/referrals.ts` | 199 | `const response = await instance.get(`/riders/me/re...` |
| GET | `/riders/me/referrals/summary?${id}` | `src/API/referrals.ts` | 231 | `const response = await instance.get(`/riders/me/re...` |
| GET | `/admin/referrals/issuances/export?${id}` | `src/API/referrals.ts` | 251 | `const response = await instance.get(`/admin/referr...` |
| GET | `/drivers/${id}/referral-wallet` | `src/API/referrals.ts` | 275 | `const response = await instance.get(`/drivers/${dr...` |
| GET | `/riders/${id}/referral-wallet` | `src/API/referrals.ts` | 286 | `const response = await instance.get(`/riders/${rid...` |
| GET | `/drivers/${id}/referral-wallet/transactions?page=${id}&page_size=${id}` | `src/API/referrals.ts` | 301 | `const response = await instance.get(`/drivers/${dr...` |
| GET | `/riders/${id}/referral-wallet/transactions?page=${id}&page_size=${id}` | `src/API/referrals.ts` | 328 | `const response = await instance.get(`/riders/${rid...` |
| POST | `/drivers/${id}/referral-wallet/payout` | `src/API/referrals.ts` | 351 | `const response = await instance.post(`/drivers/${d...` |
| GET | `/admin/promotions?${id}` | `src/API/promotions.ts` | 51 | `const response = await instance.get(`/admin/promot...` |
| GET | `/admin/promotions/${id}` | `src/API/promotions.ts` | 56 | `const response = await instance.get(`/admin/promot...` |
| PATCH | `/admin/promotions/${id}` | `src/API/promotions.ts` | 66 | `const response = await instance.patch(`/admin/prom...` |
| POST | `/admin/promotions/${id}/activate` | `src/API/promotions.ts` | 71 | `const response = await instance.post(`/admin/promo...` |
| POST | `/admin/promotions/${id}/deactivate` | `src/API/promotions.ts` | 76 | `const response = await instance.post(`/admin/promo...` |
| DELETE | `/admin/promotions/${id}` | `src/API/promotions.ts` | 81 | `await instance.delete(`/admin/promotions/${id}`);...` |
| GET | `/admin/promotions/${id}/redemptions?page=${id}&page_size=${id}` | `src/API/promotions.ts` | 85 | `const response = await instance.get(`/admin/promot...` |
| POST | `/admin/promotions/${id}/preview` | `src/API/promotions.ts` | 90 | `const response = await instance.post(`/admin/promo...` |
| GET | `/admin/promotions/summary?${id}` | `src/API/promotions.ts` | 102 | `const response = await instance.get(`/admin/promot...` |
| GET | `/riders/me/promotions/active?${id}` | `src/API/promotions.ts` | 113 | `const response = await instance.get(`/riders/me/pr...` |
| GET | `/drivers/me/promotions/active?${id}` | `src/API/promotions.ts` | 123 | `const response = await instance.get(`/drivers/me/p...` |
| GET | `/businesses/${id}/promotions/active?${id}` | `src/API/promotions.ts` | 133 | `const response = await instance.get(`/businesses/$...` |
| POST | `/rides/${id}/apply-promotion` | `src/API/promotions.ts` | 139 | `const response = await instance.post(`/rides/${rid...` |
| GET | `/rides/${id}` | `src/pages/referrals/ReferralsPage.tsx` | 118 | `window.open(`/rides/${rideId}`, '_blank');...` |
| GET | `/rides/${id}` | `src/pages/business/BusinessDetailPage.tsx` | 141 | `navigate(`/rides/${rideId}`);...` |
| GET | `/rides/${id}` | `src/pages/tips/TipsPage.tsx` | 119 | `window.open(`/rides/${rideId}`, '_blank');...` |
| GET | `/riders?id=${id}` | `src/pages/RideDetails.tsx` | 656 | `onClick={() => navigate(`/riders?id=${rider.id}`)}...` |

## 📋 Missing Endpoints in Code

These endpoints are in the OpenAPI schema but not used in the code:

| Method | Path | Tag |
|--------|------|-----|
| DELETE | `/admin/deleteusers/{id}` | Admin |
| DELETE | `/admin/documenttypes/{id}` | Admin |
| DELETE | `/admin/rewardpoints/{id}` | Admin |
| DELETE | `/admin/rewards/{id}` | Admin |
| GET | `/admin` | Admin |
| GET | `/admin/create` | Admin |
| GET | `/admin/dashboardstats` | Admin |
| GET | `/admin/documenttypes` | Admin |
| GET | `/admin/getdriverdocs/{id}` | Admin |
| GET | `/admin/getdrivers` | Admin |
| GET | `/admin/getriders` | Admin |
| GET | `/admin/rewardpoints/{id}` | Admin |
| GET | `/admin/rewards` | Admin |
| GET | `/admin/ride/userrides/{id}` | Admin |
| GET | `/ride` | Admin |
| GET | `/ride/fetchride/{id}` | Admin |
| POST | `/admin/documenttypes` | Admin |
| POST | `/admin/rewardpoints/{id}` | Admin |
| POST | `/admin/rewards` | Admin |
| POST | `/admin/uploadfiles` | Admin |
| POST | `/ride/ridetype` | Admin |
| PUT | `/admin/documenttypes/{id}` | Admin |
| PUT | `/admin/updatestatus/{id}` | Admin |
| PUT | `/admin/verifydriverdoc/{id}/{id}` | Admin |
| PUT | `/ride/ridetype/{id}` | Admin |
| GET | `/driver` | Driver |
| GET | `/driver/documents` | Driver |
| GET | `/driver/documenttypes` | Driver |
| GET | `/driver/getmyrides` | Driver |
| GET | `/driver/getride/{id}` | Driver |
| GET | `/driver/myearnings` | Driver |
| GET | `/driver/payment/accountconfirmation` | Driver |
| GET | `/driver/payment/accountstatus` | Driver |
| GET | `/driver/payment/complete/{id}` | Driver |
| GET | `/driver/payment/createdriverstripeaccount` | Driver |
| GET | `/driver/payment/initiate/{id}` | Driver |
| GET | `/driver/payment/stripeloginlink` | Driver |
| POST | `/driver/details` | Driver |
| POST | `/driver/ride/addrating/{id}` | Driver |
| POST | `/driver/saveridelocation/{id}` | Driver |
| POST | `/driver/uploaddocument/{id}` | Driver |
| POST | `/driver/uploadfiles` | Driver |
| POST | `/ride/driver/sendchatnotification/{id}` | Driver |
| PUT | `/driver` | Driver |
| PUT | `/driver/changeridestatus/{id}` | Driver |
| PUT | `/driver/details` | Driver |
| GET | `/payment/addpm` | Payment |
| GET | `/ride/fetchdriver/{id}` | Ride |
| GET | `/ride/fetchrider/{id}` | Ride |
| GET | `/ride/ridetype` | Ride |
| POST | `/ride` | Ride |
| DELETE | `/rider/paymentmethods/{id}` | Rider |
| GET | `/rider` | Rider |
| GET | `/rider/getmyrides` | Rider |
| GET | `/rider/getrewards` | Rider |
| GET | `/rider/getride/{id}` | Rider |
| GET | `/rider/myrewardpoints` | Rider |
| GET | `/rider/paymentmethods` | Rider |
| GET | `/rider/sendnotification` | Rider |
| POST | `/ride/rider/sendchatnotification/{id}` | Rider |
| POST | `/rider/payment/addmethod` | Rider |
| POST | `/rider/ride/addrating/{id}` | Rider |
| POST | `/rider/uploadfiles` | Rider |
| PUT | `/rider` | Rider |
| PUT | `/rider/changeridestatus/{id}` | Rider |

## 📁 API Usage by File

### src/API/vehicleClasses.ts

| Method | Path |
|--------|------|
| PATCH | `/admin/vehicle-classes/${id}` |

### src/API/business.ts

| Method | Path |
|--------|------|
| GET | `/businesses/${id}` |
| POST | `/businesses/${id}/enrollment` |
| GET | `/businesses/${id}/rides?${id}` |
| GET | `/businesses/${id}/rides/summary?${id}` |
| POST | `/businesses/${id}/wallet/credit-purchase` |
| GET | `/businesses/${id}/wallet/transactions?page=${id}&page_size=${id}` |
| POST | `/businesses/${id}/invoices/generate` |
| GET | `/businesses/${id}/invoices?page=${id}&page_size=${id}` |
| GET | `/invoices/${id}` |
| GET | `/businesses/${id}/rewards/summary` |
| GET | `/businesses/${id}/rewards/ledger?page=${id}&page_size=${id}` |
| POST | `/businesses/${id}/rewards/adjust` |

### src/API/scheduled.ts

| Method | Path |
|--------|------|
| GET | `/admin/scheduled-rides?${id}` |
| GET | `/admin/scheduled-rides/summary?${id}` |
| POST | `/admin/scheduled-rides/${id}/assign-driver` |
| POST | `/admin/scheduled-rides/${id}/cancel` |
| GET | `/admin/scheduled-rides/export?${id}` |
| GET | `/riders/me/scheduled-rides?${id}` |
| PATCH | `/riders/me/scheduled-rides/${id}` |
| DELETE | `/riders/me/scheduled-rides/${id}` |
| POST | `/businesses/${id}/scheduled-rides` |
| GET | `/businesses/${id}/scheduled-rides?${id}` |
| PATCH | `/businesses/${id}/scheduled-rides/${id}` |
| DELETE | `/businesses/${id}/scheduled-rides/${id}` |

### src/API/tips.ts

| Method | Path |
|--------|------|
| GET | `/analytics/tips?${id}` |
| GET | `/analytics/tips/summary?${id}` |
| GET | `/drivers/${id}/tips?${id}` |
| GET | `/riders/${id}/tips?${id}` |
| POST | `/rides/${id}/tip` |
| GET | `/analytics/tips/export?${id}` |

### src/API/axios.ts

| Method | Path |
|--------|------|
| GET | `/admin/getdriverdocs/${id}` |
| PUT | `/admin/verifydriverdoc/${id}/${id}` |
| PUT | `/admin/updatestatus/${id}` |
| PUT | `/admin/documenttypes/${id}` |
| DELETE | `/admin/documenttypes/${id}` |
| PUT | `/ride/ridetype/${id}` |
| DELETE | `/admin/rewards/${id}` |
| GET | `/admin/rewardpoints/${id}` |
| POST | `/admin/rewardpoints/${id}` |
| DELETE | `/admin/rewardpoints/${id}` |
| DELETE | `/admin/deleteusers/${id}` |

### src/API/referrals.ts

| Method | Path |
|--------|------|
| GET | `/admin/referrals/issuances?${id}` |
| GET | `/admin/referrals/summary?${id}` |
| POST | `/admin/referrals/issuances/${id}/void` |
| GET | `/drivers/me/referrals/issuances?${id}` |
| GET | `/drivers/me/referrals/summary?${id}` |
| GET | `/riders/me/referrals/issuances?${id}` |
| GET | `/riders/me/referrals/summary?${id}` |
| GET | `/admin/referrals/issuances/export?${id}` |
| GET | `/drivers/${id}/referral-wallet` |
| GET | `/riders/${id}/referral-wallet` |
| GET | `/drivers/${id}/referral-wallet/transactions?page=${id}&page_size=${id}` |
| GET | `/riders/${id}/referral-wallet/transactions?page=${id}&page_size=${id}` |
| POST | `/drivers/${id}/referral-wallet/payout` |

### src/API/promotions.ts

| Method | Path |
|--------|------|
| GET | `/admin/promotions?${id}` |
| GET | `/admin/promotions/${id}` |
| PATCH | `/admin/promotions/${id}` |
| POST | `/admin/promotions/${id}/activate` |
| POST | `/admin/promotions/${id}/deactivate` |
| DELETE | `/admin/promotions/${id}` |
| GET | `/admin/promotions/${id}/redemptions?page=${id}&page_size=${id}` |
| POST | `/admin/promotions/${id}/preview` |
| GET | `/admin/promotions/summary?${id}` |
| GET | `/riders/me/promotions/active?${id}` |
| GET | `/drivers/me/promotions/active?${id}` |
| GET | `/businesses/${id}/promotions/active?${id}` |
| POST | `/rides/${id}/apply-promotion` |

### src/pages/referrals/ReferralsPage.tsx

| Method | Path |
|--------|------|
| GET | `/rides/${id}` |

### src/pages/RideDetails.tsx

| Method | Path |
|--------|------|
| GET | `/riders?id=${id}` |

### src/pages/business/BusinessDetailPage.tsx

| Method | Path |
|--------|------|
| GET | `/rides/${id}` |

### src/pages/business/BusinessListPage.tsx

| Method | Path |
|--------|------|
| GET | `/businesses/${id}` |

### src/pages/tips/TipsPage.tsx

| Method | Path |
|--------|------|
| GET | `/rides/${id}` |

