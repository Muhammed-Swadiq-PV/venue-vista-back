import { Router } from 'express';
import { OrgController } from '../../Controller/Controllers/organizer/OrgController';
import { OrgUseCases } from '../../usecases/OrgUseCases';
import { MongoDBOrgRepository } from '../../frameworks/repository/MongoDBOrgRepository';

const router = Router();

const orgRepository = new MongoDBOrgRepository();
const orgUseCases = new OrgUseCases(orgRepository);
const orgController = new OrgController(orgUseCases);

router.post('/signup', orgController.createOrganizer);
router.post('/verify' , orgController.verifyOrganizer);
router.post('/google-auth', orgController.createGoogleOrganizer);
router.post('/signin', orgController.signInOrganizer);
router.post('/signin-google', orgController.signInGoogle);

export default router;
