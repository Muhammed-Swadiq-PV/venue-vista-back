import { Router } from 'express';
import { OrgController } from '../../Controller/Controllers/organizer/OrgController';
import { OrgUseCases } from '../../usecases/OrgUseCases';
import { MongoDBOrgRepository } from '../../frameworks/repository/MongoDBOrgRepository';
import { authenticateJWT } from '../middleware/orgJWTmiddle';

const router = Router();

const orgRepository = new MongoDBOrgRepository();
const orgUseCases = new OrgUseCases(orgRepository);
const orgController = new OrgController(orgUseCases);

router.post('/signup', orgController.createOrganizer); //signup through normal signup
router.post('/verify' , orgController.verifyOrganizer); //otp verification
router.post('/google-auth', orgController.createGoogleOrganizer); //signup through google OAuth
router.post('/signin', orgController.signInOrganizer); //signin through email and password
router.post('/signin-google', orgController.signInGoogle); // signin through google OAuth 
router.post('/create-profile', authenticateJWT, (req, res, next) => {
    console.log('Before calling controller');
    orgController.createProfile(req, res);
    console.log('After calling controller'); //for updating profile also checking middleware
  });


export default router;
