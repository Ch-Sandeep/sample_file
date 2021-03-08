const User = require("../models/userschema");
const Task = require("../models/tasks");

module.exports.createtask = async (req, res) => {
  try {
    const u = await User.findOne({ username: req.dbuser.username });
    const newtask = {
      description: req.body.des,
      completed: req.body.stat,
      owner: u._id,
    };
    const ctask = await Task.findOne({
      owner: u._id,
      description: newtask.description,
    });
    if (ctask != null) {
      return res.end("Task already exists.Please update if you want...");
    } else {
      const taskdata = new Task(newtask);

      await taskdata.save();

      res.send("Task added successfully...");
    }
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.listtasks = async (req, res) => {
  try {
    const ltasks = [];
    const u = await User.findOne({ username: req.dbuser.username });
    for await (const doc of Task.find({ owner: u._id })) {
      const d = {
        description: doc.description,
        status: doc.completed,
      };
      ltasks.push(d); // Prints documents one at a time
    }
    res.send(ltasks);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.gettask = async (req, res) => {
  try {
    const u = await User.findOne({ username: req.dbuser.username });
    const t = await Task.findOne({
      owner: u._id,
      description: req.params.desc,
    });
    if (t == null) {
      return res.send("No task exists with given description...");
    }
    const doc = {
      description: t.description,
      status: t.completed,
    };
    res.send(doc);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.updatetask = async (req, res) => {
  if (req.body.description.length == 0) {
    res.send("Description cannot be empty...");
  }
  if (req.body.status.length == 0) {
    res.send("Status cannot be empty...");
  }
  try {
    const u = await User.findOne({ username: req.dbuser.username });
    const t = await Task.findOne({
      owner: u._id,
      description: req.body.description,
    });
    if (t == null) {
      return res.send("No task exists with the given description...");
    }
    await Task.updateOne(
      { owner: u._id, description: req.body.description },
      { $set: { completed: req.body.status } }
    );
    res.send("Task updated successfully...");
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.deletetask = async (req, res) => {
  try {
    const u = await User.findOne({ username: req.dbuser.username });
    const rtask = await Task.findOne({
      owner: u._id,
      description: req.body.description,
    });
    if (rtask == null) {
      return res.send("No task exists with the given description...");
    }
    await Task.deleteOne({
      owner: u._id,
      description: req.body.description,
    });
    res.send("Task deleted successfully...");
  } catch (err) {
    res.send(err.message);
  }
};
