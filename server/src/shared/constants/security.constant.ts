export enum USER_ROLES {
  SUPER_ADMIN = "super_admin",
  CLIENT_ADMIN = "client_admin",
  CLINET_VIWER = "client_viwer",
}

export const WEAK_PASSWORDS = [
  "password",
  "123456",
  "qwerty",
  "admin",
  "letmein",
  "password123",
  "admin123",
  "12345678",
  "welcome",
];

export enum APP_ENVIRONMENT {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
  TESTING = "testing",
}

export enum HTTP_VERB {
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
}
