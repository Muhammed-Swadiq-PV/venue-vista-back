import jwt from 'jsonwebtoken';
import { OrgEntity } from '../entity/models/OrgEntity';

// Define an interface for the organizer object


// Type for the secret (JWT secret)
type Secret = string;

// Function to generate access token
export const generateOrgAccessToken = (organizer: OrgEntity, secret: Secret, expiresIn = '1h'): string => {
    return jwt.sign(
        { id: organizer.id, email: organizer.email, name: organizer.name, isBlocked: organizer.isBlocked },
        secret,
        { expiresIn }
    );
};

// Function to generate refresh token
export const generateOrgRefreshToken = (organizer: OrgEntity, secret: Secret, expiresIn = '7d'): string => {
    return jwt.sign(
        { id: organizer.id, email: organizer.email, name: organizer.name, isBlocked: organizer.isBlocked }, 
        secret,
        { expiresIn }
    );
};
