# Admin Dashboard Endpoint Analysis

## Overview
- **Total Admin API calls**: 85
- **Total Server routes**: 84
- **Total OpenAPI paths**: 64
- **Missing endpoints**: 0
- **Mismatched endpoints**: 29
- **Deprecated endpoints**: 0
- **Coverage**: 100%

## Mismatched Endpoints (29)

These endpoints exist but have configuration mismatches:

1. **GET /admin**
   - File: `src/API/axios.ts:61`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

2. **GET /admin/getdrivers**
   - File: `src/API/axios.ts:72`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

3. **GET /admin/documenttypes**
   - File: `src/API/axios.ts:110`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

4. **POST /admin/documenttypes**
   - File: `src/API/axios.ts:119`
   - Issues:
     - Method POST not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

5. **GET /admin/getriders**
   - File: `src/API/axios.ts:143`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

6. **GET /admin/dashboardstats**
   - File: `src/API/axios.ts:180`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

7. **GET /admin/rewards**
   - File: `src/API/axios.ts:187`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

8. **POST /admin/rewards**
   - File: `src/API/axios.ts:196`
   - Issues:
     - Method POST not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

9. **GET /businesses**
   - File: `src/API/business.ts:45`
   - Issues:
     - Method GET not found in OpenAPI

10. **GET /businesses/{orgId}**
   - File: `src/API/business.ts:57`
   - Issues:
     - Method GET not found in OpenAPI

11. **GET /invoices/{invoiceId}**
   - File: `src/API/business.ts:240`
   - Issues:
     - Method GET not found in OpenAPI

12. **POST /admin/promotions**
   - File: `src/API/promotions.ts:61`
   - Issues:
     - Method POST not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

13. **GET /riders/me/promotions/active?${params.toString()}**
   - File: `src/API/promotions.ts:113`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

14. **GET /drivers/me/promotions/active?${params.toString()}**
   - File: `src/API/promotions.ts:123`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

15. **POST /referrals/claim**
   - File: `src/API/referrals.ts:120`
   - Issues:
     - Method POST not found in OpenAPI

16. **GET /drivers/me/referrals/issuances?${params.toString()}**
   - File: `src/API/referrals.ts:147`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

17. **GET /drivers/me/referrals/summary?${params.toString()}**
   - File: `src/API/referrals.ts:179`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

18. **GET /riders/me/referrals/issuances?${params.toString()}**
   - File: `src/API/referrals.ts:199`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

19. **GET /riders/me/referrals/summary?${params.toString()}**
   - File: `src/API/referrals.ts:231`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

20. **GET /admin/referral-wallets**
   - File: `src/API/referrals.ts:368`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

21. **GET /admin/scheduled-rides?${params.toString()}**
   - File: `src/API/scheduled.ts:54`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

22. **GET /admin/scheduled-rides/summary?${params.toString()}**
   - File: `src/API/scheduled.ts:82`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

23. **GET /admin/scheduled-rides/export?${params.toString()}**
   - File: `src/API/scheduled.ts:128`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

24. **POST /riders/me/scheduled-rides**
   - File: `src/API/scheduled.ts:142`
   - Issues:
     - Method POST not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

25. **GET /riders/me/scheduled-rides?${params.toString()}**
   - File: `src/API/scheduled.ts:160`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

26. **POST /rides/{rideId}/tip**
   - File: `src/API/tips.ts:158`
   - Issues:
     - Method POST not found in OpenAPI

27. **GET /admin/vehicle-classes**
   - File: `src/API/vehicleClasses.ts:36`
   - Issues:
     - Method GET not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

28. **PATCH /admin/vehicle-classes/{code}**
   - File: `src/API/vehicleClasses.ts:49`
   - Issues:
     - Method PATCH not found in OpenAPI
     - OpenAPI requires auth but admin call has no auth

29. **GET /catalog/vehicle-classes**
   - File: `src/API/vehicleClasses.ts:60`
   - Issues:
     - Method GET not found in OpenAPI

