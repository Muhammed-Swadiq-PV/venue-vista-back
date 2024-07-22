import { CustomRequest } from '../Controller/types/orgProfille'; 
// import { CustomJwtRequest } from '../frameworks/middleware/orgJWTmiddle'; 

export interface CustomRequestWithJwt extends CustomRequest {
    user?: { id: string; [key: string]: any }; 
}
