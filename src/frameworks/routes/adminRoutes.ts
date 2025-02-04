import { Router } from "express";
import { AdmController } from '../../Controller/Controllers/admin/AdmController';
import { AdmUseCases } from '../../usecases/AdmUseCases';
import { MongoDBAdmRepository } from '../repository/MongoDBAdmRepository';
import { MongoDBUserRepository } from '../repository/MongoDBUserRepository';
import { MongoDBOrgRepository } from "../repository/MongoDBOrgRepository";
import OrgModel from "../../entity/models/organizerModel";
import OrgPostModel from "../../entity/models/OrgPostModel";
import BookingPriceModel from "../../entity/models/weeklyBookingModel";
const router = Router();

const admRepository = new MongoDBAdmRepository();
const userRepository = new MongoDBUserRepository();
const orgRepository = new MongoDBOrgRepository(
    OrgModel,
    OrgPostModel,
    BookingPriceModel
);
const admUseCases = new AdmUseCases(admRepository, userRepository, orgRepository);
const admController = new AdmController(admUseCases);

router.post('/signin', admController.signinAdmin.bind(admController));

router.get('/users', admController.fetchUsers.bind(admController));

router.patch('/users/:id', admController.blockUsers.bind(admController));

router.get('/organizer', admController.fetchOrganizers.bind(admController));

router.patch('/organizer/:id', admController.blockOrganizers.bind(admController));

router.get('/pending-requests', admController.fetchPendingOrganizers.bind(admController));
router.get('/pending-request/:id', admController.fetchPendingOrganizerWithId.bind(admController));
router.patch('/organizer/:id/approve', admController.approveOrganizer.bind(admController));
router.patch('/organizer/:id/disapprove', admController.disapproveOrganizer.bind(admController));

//get booking data for graphs
router.get('/bookings/monthly', admController.getMonthlyBookings.bind(admController));



export default router;