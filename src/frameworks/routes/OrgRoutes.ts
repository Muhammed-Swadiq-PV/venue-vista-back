import { Router } from 'express';
import { OrgController } from '../../Controller/Controllers/organizer/OrgController';
import { OrgUseCases } from '../../usecases/OrgUseCases';
import { MongoDBOrgRepository } from '../../frameworks/repository/MongoDBOrgRepository';
import multer from 'multer';

const router = Router();
const upload = multer(); //multer for image upload by the user||organizer||admin

const orgRepository = new MongoDBOrgRepository();
const orgUseCases = new OrgUseCases(orgRepository);
const orgController = new OrgController(orgUseCases);

router.post('/signup', orgController.createOrganizer); //signup through normal signup
router.post('/verify' , orgController.verifyOrganizer); //otp verification
router.post('/google-auth', orgController.createGoogleOrganizer); //signup through google OAuth
router.post('/signin', orgController.signInOrganizer); //signin through email and password
router.post('/signin-google', orgController.signInGoogle); // signin through google OAuth 
router.post('/create-profile', upload.fields([
    { name: 'ownerIdCard', maxCount: 1 },
    { name: 'eventHallLicense', maxCount: 1 }
]), orgController.createProfile); // create profile when signup
export default router;
