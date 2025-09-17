const fs = require('fs');

// Read the admin routes file
let content = fs.readFileSync('admin_routes_update.js', 'utf8');

// Fix all malformed function names
const functionFixes = [
  // Fix function declarations
  { from: 'const getPromotions?\\${params.toString()}', to: 'const getPromotions' },
  { from: 'const getPromotions{id}', to: 'const getPromotionsById' },
  { from: 'const patchPromotions{id}', to: 'const patchPromotionsById' },
  { from: 'const postPromotions{id}Activate', to: 'const postPromotionsByIdActivate' },
  { from: 'const postPromotions{id}Deactivate', to: 'const postPromotionsByIdDeactivate' },
  { from: 'const deletePromotions{id}', to: 'const deletePromotionsById' },
  { from: 'const getPromotions{id}Redemptions?page={page}&pageSize={pageSize}', to: 'const getPromotionsByIdRedemptions' },
  { from: 'const postPromotions{id}Preview', to: 'const postPromotionsByIdPreview' },
  { from: 'const getPromotionsSummary?\\${params.toString()}', to: 'const getPromotionsSummary' },
  { from: 'const getReferralsIssuances?\\${params.toString()}', to: 'const getReferralsIssuances' },
  { from: 'const getReferralsSummary?\\${params.toString()}', to: 'const getReferralsSummary' },
  { from: 'const postReferralsIssuances{issuanceId}Void', to: 'const postReferralsIssuancesByIdVoid' },
  { from: 'const getReferralsIssuancesExport?\\${params.toString()}', to: 'const getReferralsIssuancesExport' },
  { from: 'const postRides{rideId}Apply-promotion', to: 'const postRidesByIdApplyPromotion' },
  { from: 'const deleteRewards{rewardId}', to: 'const deleteRewardsById' },
  { from: 'const getRewardpoints{userId}', to: 'const getRewardpointsByUserId' },
  { from: 'const postRewardpoints{userId}', to: 'const postRewardpointsByUserId' },
  { from: 'const deleteRewardpoints{rewardPointId}', to: 'const deleteRewardpointsById' },
  { from: 'const deleteDeleteusers{userId}', to: 'const deleteUsersById' },
  { from: 'const getGetdriverdocs{id}', to: 'const getDriverDocsById' },
  { from: 'const putVerifydriverdoc{driverId}{documentId}', to: 'const putVerifyDriverDoc' },
  { from: 'const putUpdatestatus{driverId}', to: 'const putUpdateStatus' },
  { from: 'const putDocumenttypes{id}', to: 'const putDocumentTypes' },
  { from: 'const deleteDocumenttypes{documentId}', to: 'const deleteDocumentTypes' },
];

// Apply function name fixes
functionFixes.forEach(fix => {
  content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
});

// Write the fixed content back
fs.writeFileSync('admin_routes_update.js', content);
console.log('✅ Fixed malformed function names in admin_routes_update.js');

