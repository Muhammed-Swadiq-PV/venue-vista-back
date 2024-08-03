import jwt from 'jsonwebtoken';
import { OrgEntity } from '../entity/models/OrgEntity';
import { UserEntity } from '../entity/models/UserEntity';
import { AdmEntity } from '../entity/models/AdmEntity';

type Secret = string;

// Function to generate access token for organizer
export const generateOrgAccessToken = (organizer: OrgEntity, secret: Secret, expiresIn = '1h'): string => {
  return jwt.sign(
    { id: organizer.id, email: organizer.email, name: organizer.name, isBlocked: organizer.isBlocked , role:'organizer'},
    secret,
    { expiresIn }
  );
};

// Function to generate refresh token for organizer
export const generateOrgRefreshToken = (organizer: OrgEntity, secret: Secret, expiresIn = '7d'): string => {
  return jwt.sign(
    { id: organizer.id, email: organizer.email, name: organizer.name, isBlocked: organizer.isBlocked , role:'organizer'},
    secret,
    { expiresIn }
  );
};

// Function to generate access token for user
export const generateUserAccessToken = (user: UserEntity, secret: Secret, expiresIn = '1h'): string => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, isBlocked: user.isBlocked , role:'user'},
    secret,
    { expiresIn }
  );
};

// Function to generate refresh token for user
export const generateUserRefreshToken = (user: UserEntity, secret: Secret, expiresIn = '7d'): string => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, isBlocked: user.isBlocked , role:'user' },
    secret,
    { expiresIn }
  );
};

// Function to generate access token for admin
export const generateAdmAccessToken = (admin: AdmEntity, secret: Secret, expiresIn = '1h'): string => {
  return jwt.sign(
    {  email: admin.email, role:'admin' },
    secret,
    { expiresIn }
  );
};

// Function to generate refresh token for admin
export const generateAdmRefreshToken = (admin: AdmEntity, secret: Secret, expiresIn = '7d'): string => {
  return jwt.sign(
    { email: admin.email, role: 'admin' },
    secret,
    { expiresIn }
  );
};
