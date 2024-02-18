import crypto from 'crypto';
import mongoose from 'mongoose';
import config from './config';
import User from './models/User';
import Task from './models/Task';

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

  const collections = ['tasks', 'users'];

  for (const collectionName of collections) {
    await dropCollection(db, collectionName);
  }
  const user = await User.create({
    username: 'user',
    password: '$2b$10$Zs6SNP7Nfn4P7eE6son8E.ROHJhdqeqYjGBlGs7qeahWz8nJ53HFS',
    token: crypto.randomUUID(),
  });

  await Task.create({
    title: 'to do homework',
    description: 'Laboratory work',
    status: 'new',
    user: user._id,
  });

  await db.close();
};

void run();
