import { Router } from 'express';
import { OrgController } from '../../Controller/Controllers/organizer/OrgController';
import { OrgUseCases } from '../../usecases/OrgUseCases';
import { MongoDBOrgRepository } from '../../frameworks/repository/MongoDBOrgRepository';
import { authenticateJWT } from '../middleware/orgJWTmiddle';
import OrgPostModel from '../../entity/models/OrgPostModel';
import organizerBlock from '../middleware/organizerBlock';
import OrgModel from '../../entity/models/organizerModel';
import BookingModel from '../../entity/models/weeklyBookingModel';

const router = Router();


const orgRepository = new MongoDBOrgRepository(OrgModel, OrgPostModel, BookingModel);
const orgUseCases = new OrgUseCases(orgRepository);
const orgController = new OrgController(orgUseCases);

router.post('/signup', orgController.createOrganizer); //signup through normal signup
router.post('/verify', orgController.verifyOrganizer); //otp verification
router.post('/google-auth', orgController.createGoogleOrganizer); //signup through google OAuth
router.post('/signin', organizerBlock, orgController.signInOrganizer); //signin through email and password
router.post('/signin-google', orgController.signInGoogle); // signin through google OAuth 
router.post('/create-profile', authenticateJWT, (req, res, next) => {
  orgController.createProfile(req, res);
});//for updating profile also checking middleware

router.post('/savelocation', orgController.saveLocation.bind(orgController));

router.get('/profile/:organizerId', organizerBlock, orgController.viewProfile.bind(orgController)); //checking organizer profile is that updated

router.get('/presigned-url', orgController.getPresignedUrl.bind(orgController));

router.post('/create-post', authenticateJWT, (req, res, next) => {
  orgController.createPost(req, res);
})//post details about hall

router.get('/post/:organizerId', organizerBlock, (req, res) => orgController.checkPostData(req, res));

router.get('/view-post/:organizerId', organizerBlock, authenticateJWT, (req, res, next) => {
  orgController.viewPost(req, res);
});

router.patch('/update-post/:organizerId', organizerBlock, authenticateJWT, (req, res, next) => {
  orgController.editPost(req, res).catch(next);
}); // updating details that already added.

// booking related routes
router.post('/rules-and-restrictions', organizerBlock, authenticateJWT,
  orgController.createRulesAndRestrictions.bind(orgController) // organizer adding rules and restrictions that show to user.
);

router.post('/cancellation-policy', organizerBlock, authenticateJWT,  orgController.cancellationPolicy.bind(orgController)); //organizer adding cancellation policy that show to user.
router.get('/cancellation-policy', organizerBlock, authenticateJWT, orgController.getCancellationPolicy.bind(orgController));
router.get('/rules-and-restrictions', organizerBlock, authenticateJWT, orgController.getRulesAndRestrictions.bind(orgController))

router.post('/events/prices',  orgController.addPriceBySelectDay.bind(orgController));
router.get('/events/prices', organizerBlock, authenticateJWT, orgController.getPriceBySelectDay.bind(orgController));
router.get('/events', orgController.getEventsDetails.bind(orgController)); /////////////////////////////////////########////////
router.post('/default-prices', orgController.createDefaultPrice.bind(orgController));



export default router;
