
export interface UserEntity {
  id?: string;
  name: string;
  email: string;
  password?: string;
  otp?: string;
  isVerified?: boolean;
  token?: string;
  isGoogle?: boolean;
  isBlocked?: boolean;
  address?: string;
  city?: string;
  pin?: string;
  district?: string;
  mobileNumber?: string;
}
