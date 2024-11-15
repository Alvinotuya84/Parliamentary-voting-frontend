export interface User {
  id: string;
  name: string;
  constituency: string;
  role: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
