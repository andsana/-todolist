import { Router } from 'express';
import mongoose, { Types } from 'mongoose';

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

tasksRouter.put('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    let _id: Types.ObjectId;
    const loggedInUser = req.user;

    try {
      _id = new Types.ObjectId(req.params.id);
    } catch {
      return res.status(400).send({ error: 'Wrong ObjectId!' });
    }

    const task = await Task.findById(_id);

    if (!task) {
      return res.status(404).send({ error: 'Not found!' });
    }

    if (task.user.toString() !== loggedInUser?._id.toString()) {
      return res
        .status(403)
        .send({ error: "Forbidden: You cannot edit other user's task" });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;

    await task.save();

    res.send(task);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(422).send(e);
    }
    next(e);
  }
});

tasksRouter.delete('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    const taskId = req.params.id;
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send({ error: 'User not authenticated' });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    if (task.user.toString() !== loggedInUser._id.toString()) {
      return res
        .status(403)
        .send({ error: "Forbidden: You cannot delete other user's task" });
    }

    await task.deleteOne();

    res.send({ message: 'Task deleted successfully' });
  } catch (e) {
    next(e);
  }
});

export default tasksRouter;
