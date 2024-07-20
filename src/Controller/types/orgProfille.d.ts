

import { Request } from 'express';
import { File } from 'multer';

interface MulterFiles {
    [fieldname: string]: File[] | undefined;
}

export interface CustomRequest extends Request {
    files?: MulterFiles;
}
