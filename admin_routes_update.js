var express = require('express');
var router = express.Router();
const {fetchUserDetails, createAdmin, fetchDrivers, fetchRiders, fetchDocuments, verifyDoc, updateDriverStatus, deleteUser, updateDocumentType, deleteDocumentType, createDocumentType} = require('../controllers/AdminController')                                           
const {documentTypes, uploadFiles} = require("../controllers/DriversController");         
const {fetchAllRides, fetchAdminDashboardCounts} = require("../controllers/RidesController");                                          
const {addRewardPoints, addRewards, deleteRewardPoints, deleteRewards, fetchAllRewards, fetchUserRewardPoints} = require("../controllers/RewardsController");                       
const {loginAuth, checkAdmin} = require('../middlewares/auth')                            
const { upload } = require('../helpers/fileUploadHelper')                                 

// Import vehicle class controller
const {
  getAllVehicleClasses,
  getVehicleClassByCode,
  updateVehicleClass,
  createVehicleClass,
  deleteVehicleClass
} = require('../controllers/VehicleClassController');

// Existing routes
router.get('/', loginAuth, checkAdmin, fetchUserDetails)                                  

router.get('/getdrivers', loginAuth, checkAdmin, fetchDrivers)                            

router.get('/getdriverdocs/:driver', loginAuth, checkAdmin, fetchDocuments)               

router.put('/verifydriverdoc/:driver/:document', loginAuth, checkAdmin, verifyDoc)        

router.put('/updatestatus/:driver', loginAuth, checkAdmin, updateDriverStatus)            

router.get('/getriders', loginAuth, checkAdmin, fetchRiders)                              

router.delete('/deleteusers/:id', loginAuth, checkAdmin, deleteUser)                      

router.get('/create', loginAuth, createAdmin)

router.post('/documenttypes', loginAuth, checkAdmin, createDocumentType)                  

router.get('/documenttypes', loginAuth, checkAdmin, documentTypes)                        

router.put('/documenttypes/:id', loginAuth, checkAdmin, updateDocumentType)               

router.delete('/documenttypes/:id', loginAuth, checkAdmin, deleteDocumentType)            

router.post('/uploadfiles', loginAuth, checkAdmin, upload.single("file"), uploadFiles)    

router.get('/ride/fetchlatest', loginAuth, checkAdmin, fetchAllRides)                     

router.get('/ride/userrides/:user', loginAuth, checkAdmin, fetchAllRides)                 

router.get('/dashboardstats', loginAuth, checkAdmin, fetchAdminDashboardCounts)           

router.post('/rewards', loginAuth, checkAdmin, addRewards)                                

router.post('/rewardpoints/:id', loginAuth, checkAdmin, addRewardPoints)                  

router.get('/rewards', loginAuth, checkAdmin, fetchAllRewards)                            

router.get('/rewardpoints/:id', loginAuth, checkAdmin, fetchUserRewardPoints)             

router.delete('/rewards/:id', loginAuth, checkAdmin, deleteRewards)                       

router.delete('/rewardpoints/:id', loginAuth, checkAdmin, deleteRewardPoints)             

// Vehicle Classes routes
router.get('/vehicle-classes', loginAuth, checkAdmin, getAllVehicleClasses);
router.get('/vehicle-classes/:code', loginAuth, checkAdmin, getVehicleClassByCode);
router.patch('/vehicle-classes/:code', loginAuth, checkAdmin, updateVehicleClass);
router.post('/vehicle-classes', loginAuth, checkAdmin, createVehicleClass);
router.delete('/vehicle-classes/:code', loginAuth, checkAdmin, deleteVehicleClass);

module.exports = router;
