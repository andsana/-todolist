import { Router } from 'express';
import mongoose from 'mongoose';

import { TaskMutation } from '../types';
import Task from '../models/Task';
import auth, { RequestWithUser } from '../middleware/auth';

const tasksRouter = Router();

tasksRouter.get('/', async (_req, res, next) => {
  try {
    const results = await Task.find().populate(
      'user',
      'username password token',
    );

    res.send(results);
  } catch (e) {
    return next(e);
  }
});

tasksRouter.post('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send({ error: 'User not authenticated' });
    }

    const taskData: TaskMutation = {
      user: loggedInUser._id.toString(),
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
    };

    const task = new Task(taskData);
    await task.save();

    res.send(task);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(422).send(e);
    }
    next(e);
  }
});

export default tasksRouter;
