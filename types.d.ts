import { Model } from 'mongoose';

export interface TaskMutation {
  user: string;
  title: string;
  description: string;
  status: string;
}

export interface UserFields {
  username: string;
  password: string;
  token: string;
}

interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
  generateToken(): void;
}

type UserModel = Model<UserFields, unknown, UserMethods>;
