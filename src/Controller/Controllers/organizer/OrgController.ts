import { Request, Response } from 'express';
import { OrgUseCases } from '../../../usecases/OrgUseCases';
import { OrgEntity } from '../../../entity/models/OrgEntity';

export class OrgController {
  constructor(private orgUseCases: OrgUseCases) {}

  registerOrganizer = async (req: Request, res: Response) => {
    const organizerData: OrgEntity = req.body;
    // console.log('orgController', organizerData)
    try {
      const organizer = await this.orgUseCases.registerOrganizer(organizerData);
      res.status(201).json(organizer);
    } catch (error) {
      res.status(400).json({ error: 'Failed to register organizer' });
    }
  };
}
