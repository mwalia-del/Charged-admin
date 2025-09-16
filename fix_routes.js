const fs = require('fs');

// Read the admin routes file
let content = fs.readFileSync('admin_routes_update.js', 'utf8');

// Fix route paths - remove template literals and fix parameter syntax
const routeFixes = [
  // Promotions routes
  { from: '/admin/promotions?\\${params.toString()}', to: '/admin/promotions' },
  { from: '/admin/promotions/{id}', to: '/admin/promotions/:id' },
  { from: '/admin/promotions/{id}/activate', to: '/admin/promotions/:id/activate' },
  { from: '/admin/promotions/{id}/deactivate', to: '/admin/promotions/:id/deactivate' },
  { from: '/admin/promotions/{id}/redemptions?page={page}&page_size={pageSize}', to: '/admin/promotions/:id/redemptions' },
  { from: '/admin/promotions/{id}/preview', to: '/admin/promotions/:id/preview' },
  { from: '/admin/promotions/summary?\\${params.toString()}', to: '/admin/promotions/summary' },
  
  // Referrals routes
  { from: '/admin/referrals/issuances?\\${params.toString()}', to: '/admin/referrals/issuances' },
  { from: '/admin/referrals/summary?\\${params.toString()}', to: '/admin/referrals/summary' },
  { from: '/admin/referrals/issuances/{issuanceId}/void', to: '/admin/referrals/issuances/:issuanceId/void' },
  { from: '/admin/referrals/issuances/export?\\${params.toString()}', to: '/admin/referrals/issuances/export' },
  
  // Scheduled rides routes
  { from: '/admin/scheduled-rides?\\${params.toString()}', to: '/admin/scheduled-rides' },
  { from: '/admin/scheduled-rides/{scheduledRideId}/assign-driver', to: '/admin/scheduled-rides/:scheduledRideId/assign-driver' },
  { from: '/admin/scheduled-rides/{scheduledRideId}/cancel', to: '/admin/scheduled-rides/:scheduledRideId/cancel' },
  { from: '/admin/scheduled-rides/export?\\${params.toString()}', to: '/admin/scheduled-rides/export' },
  
  // Other routes
  { from: '/rides/{rideId}/apply-promotion', to: '/rides/:rideId/apply-promotion' },
  { from: '/admin/rewards/{rewardId}', to: '/admin/rewards/:rewardId' },
  { from: '/admin/rewardpoints/{userId}', to: '/admin/rewardpoints/:userId' },
  { from: '/admin/rewardpoints/{rewardPointId}', to: '/admin/rewardpoints/:rewardPointId' },
  { from: '/admin/deleteusers/{userId}', to: '/admin/deleteusers/:userId' },
];

// Apply route fixes
routeFixes.forEach(fix => {
  content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
});

// Fix function names - remove template literals and invalid characters
const functionFixes = [
  { from: 'getPromotions?\\${params.toString()}', to: 'getPromotions' },
  { from: 'getPromotions{id}', to: 'getPromotionsById' },
  { from: 'patchPromotions{id}', to: 'patchPromotionsById' },
  { from: 'postPromotions{id}Activate', to: 'postPromotionsByIdActivate' },
  { from: 'postPromotions{id}Deactivate', to: 'postPromotionsByIdDeactivate' },
  { from: 'deletePromotions{id}', to: 'deletePromotionsById' },
  { from: 'getPromotions{id}Redemptions?page={page}&pageSize={pageSize}', to: 'getPromotionsByIdRedemptions' },
  { from: 'postPromotions{id}Preview', to: 'postPromotionsByIdPreview' },
  { from: 'getPromotionsSummary?\\${params.toString()}', to: 'getPromotionsSummary' },
  { from: 'getReferralsIssuances?\\${params.toString()}', to: 'getReferralsIssuances' },
  { from: 'getReferralsSummary?\\${params.toString()}', to: 'getReferralsSummary' },
  { from: 'postReferralsIssuances{issuanceId}Void', to: 'postReferralsIssuancesByIdVoid' },
  { from: 'getReferralsIssuancesExport?\\${params.toString()}', to: 'getReferralsIssuancesExport' },
  { from: 'postRides{rideId}Apply-promotion', to: 'postRidesByIdApplyPromotion' },
  { from: 'deleteRewards{rewardId}', to: 'deleteRewardsById' },
  { from: 'getRewardpoints{userId}', to: 'getRewardpointsByUserId' },
  { from: 'postRewardpoints{userId}', to: 'postRewardpointsByUserId' },
  { from: 'deleteRewardpoints{rewardPointId}', to: 'deleteRewardpointsById' },
  { from: 'deleteDeleteusers{userId}', to: 'deleteUsersById' },
];

// Apply function name fixes
functionFixes.forEach(fix => {
  content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
});

// Write the fixed content back
fs.writeFileSync('admin_routes_update.js', content);
console.log('✅ Fixed malformed routes in admin_routes_update.js');

