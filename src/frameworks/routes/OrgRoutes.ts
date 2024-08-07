import { Router } from 'express';
import { OrgController } from '../../Controller/Controllers/organizer/OrgController';
import { OrgUseCases } from '../../usecases/OrgUseCases';
import { MongoDBOrgRepository } from '../../frameworks/repository/MongoDBOrgRepository';
import { authenticateJWT } from '../middleware/orgJWTmiddle';
import OrgPostModel from '../../entity/models/OrgPostModel';
import { auth } from 'firebase-admin';
import organizerBlock from '../middleware/organizerBlock';

const router = Router();


const orgRepository = new MongoDBOrgRepository(OrgPostModel);
const orgUseCases = new OrgUseCases(orgRepository);
const orgController = new OrgController(orgUseCases);

router.post('/signup', orgController.createOrganizer); //signup through normal signup
router.post('/verify', orgController.verifyOrganizer); //otp verification
router.post('/google-auth', orgController.createGoogleOrganizer); //signup through google OAuth
router.post('/signin',organizerBlock, orgController.signInOrganizer); //signin through email and password
router.post('/signin-google', orgController.signInGoogle); // signin through google OAuth 
router.post('/create-profile', authenticateJWT, (req, res, next) => {
  orgController.createProfile(req, res);
});//for updating profile also checking middleware

router.get('/presigned-url', orgController.getPresignedUrl.bind(orgController));

router.post('/create-post', authenticateJWT, (req, res, next) => {
  orgController.createPost(req, res);
})//post details about hall

router.get('/post/:organizerId', organizerBlock, (req, res) => orgController.checkPostData(req, res));


export default router;
