import { Router } from "express";
import { AdmController } from '../../Controller/Controllers/admin/AdmController';
import { AdmUseCases } from '../../usecases/AdmUseCases' ;
import { MongoDBAdmRepository } from '../repository/MongoDBAdmRepository' ;
import { MongoDBUserRepository } from '../repository/MongoDBUserRepository';

const router = Router();

const admRepository = new MongoDBAdmRepository();
const userRepository = new MongoDBUserRepository();
const admUseCases = new AdmUseCases(admRepository , userRepository);
const admController = new AdmController(admUseCases);

router.post('/signin' , admController.signinAdmin.bind(admController));
// I added this router chaining or nexted routes because the this context difference of the admController
router.get('/users', (req, res, next) => {
    next();
  }, admController.fetchUsers.bind(admController));

export default router;