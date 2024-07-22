import { Router } from "express";
import { AdmController } from '../../Controller/Controllers/admin/AdmController';
import { AdmUseCases } from '../../usecases/AdmUseCases' ;
import { MongoDBAdmRepository } from '../repository/MongoDBAdmRepository' ;

const router = Router();

const admRepository = new MongoDBAdmRepository();
const admUseCases = new AdmUseCases(admRepository);
const admController = new AdmController(admUseCases);

router.post('/signin' , admController.signinAdmin.bind(admController));

export default router;