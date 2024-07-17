export interface UserEntity {
    id ?: String;
    name: string;
    email: string;
    password?: string;
    otp?: String;
    isVerified?: boolean;
    token?: string;
  }

  export interface UserGoogleEntity {
    id ?: String;
    name: string;
    email: string;
  }
  