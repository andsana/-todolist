import crypto from 'crypto';
import mongoose from 'mongoose';
import config from './config';
import User from './models/User';

const dropCollection = async (
  db: mongoose.Connection,
  collectionName: string,
) => {
  try {
    await db.dropCollection(collectionName);
  } catch (e) {
    console.log(`Collection ${collectionName} was missing, skipping drop...`);
  }
};

const run = async () => {
  await mongoose.connect(config.mongoose.db);
  const db = mongoose.connection;

  const collections = ['categories', 'products', 'users'];

  for (const collectionName of collections) {
    await dropCollection(db, collectionName);
  }
  await User.create({
    username: 'user',
    password: '23fGr4725@F',
    token: crypto.randomUUID(),
  });

  await db.close();
};

void run();
