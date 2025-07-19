import { User } from 'lib/drizzle/schema';

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
