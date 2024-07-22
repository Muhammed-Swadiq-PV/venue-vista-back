

import { Request } from 'express';
import { File } from 'multer';

interface MulterFiles {
    [fieldname: string]: File[] | undefined;
}

export interface CustomRequest extends Request {
    body: {
      eventHallName?: string;
      phoneNumber?: string;
      district?: string;
      city?: string;
      buildingFloor?: string;
      pincode?: string;
    };
    files?: MulterFiles;
  }

export interface CustomRequest extends Request {
    files?: MulterFiles;
}
