const Task = require("../models/Task");
const User = require("../models/User");
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const { sendAssignmentEmail } = require('../utils/emailService');

const createTask = asyncHandler(async (req, res) => {
  let { titre, description, priorite, statut, assignedTo } = req.body;
  const illustration = req.file ? req.file.path : null;

  if (assignedTo && !Array.isArray(assignedTo)) {
    assignedTo = [assignedTo];
  }

  const task = new Task({
    titre,
    description,
    priorite,
    statut,
    assignedTo,
    createdBy: req.user._id,
    illustration,
  });

  const createdTask = await task.save();

  if (assignedTo && assignedTo.length > 0) {
    const assignedUsers = await User.find({ _id: { $in: assignedTo } });
    const assignedBy = req.user ? req.user.nom : 'Utilisateur inconnu';
    assignedUsers.forEach(user => {
      sendAssignmentEmail(user.email, titre, assignedBy);
    });
  }

  res.status(201).json(createdTask);
});

const listTask = asyncHandler(async (req, res) => {
  const { statut, sort = "-createdAt", priorite, myTasks } = req.query;
  const { page, limit } = req.query;
  const query = {};

  if (statut) query.statut = statut;
  if (priorite) query.priorite = priorite;
  if (myTasks === 'true' && req.user) query.assignedTo = req.user._id;

  const options = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
    sort,
    populate: [
      { path: "assignedTo", select: "nom email role" },
      { path: "createdBy", select: "nom email" },
    ],
    lean: true,
  };

  const result = await Task.paginate(query, options);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;
  const generatePageLink = (p) => {
    const url = new URL(baseUrl);
    url.searchParams.set("page", p);
    url.searchParams.set("limit", options.limit);
    if (statut) url.searchParams.set("status", statut);
    if (priorite) url.searchParams.set("priorite", priorite);
    if (myTasks) url.searchParams.set("myTasks", myTasks);
    if (req.query.sort) url.searchParams.set("sort", req.query.sort);
    return url.toString();
  };

  const links = {
    self: generatePageLink(result.page),
    first: generatePageLink(1),
    last: generatePageLink(result.totalPages),
    prev: result.hasPrevPage ? generatePageLink(result.prevPage) : null,
    next: result.hasNextPage ? generatePageLink(result.nextPage) : null,
  };

  res.status(200).json({ ...result, links });
});

const updateTask = asyncHandler(async (req, res) => {
  let { titre, description, priorite, statut, assignedTo } = req.body;
  const task = await Task.findById(req.params._id);

  if (!task) {
    res.status(404);
    throw new Error("Tâche non trouvée");
  }

  if (req.file && task.illustration) {
    fs.unlink(task.illustration, (err) => {
      if (err) console.error("Erreur lors de la suppression de l'ancien fichier : ", err);
    });
  }

  if (assignedTo && !Array.isArray(assignedTo)) {
    assignedTo = [assignedTo];
  }

  const previousAssignedTo = task.assignedTo.map(id => id.toString());

  task.titre = titre || task.titre;
  task.description = description || task.description;
  task.priorite = priorite || task.priorite;
  task.statut = statut || task.statut;
  task.assignedTo = assignedTo || task.assignedTo;
  task.illustration = req.file ? req.file.path : task.illustration;

  const updatedTask = await task.save();

  if (assignedTo) {
    const newlyAssignedIds = assignedTo.filter(id => !previousAssignedTo.includes(id.toString()));
    if (newlyAssignedIds.length > 0) {
      const assignedUsers = await User.find({ _id: { $in: newlyAssignedIds } });
      const assignedBy = req.user ? req.user.nom : 'Utilisateur inconnu';
      assignedUsers.forEach(user => {
        sendAssignmentEmail(user.email, updatedTask.titre, assignedBy);
      });
    }
  }

  res.status(200).json(updatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params._id);

  if (!task) {
    res.status(404);
    throw new Error("Tâche non trouvée");
  }

  if (task.illustration) {
    fs.unlink(task.illustration, (err) => {
      if (err) console.error("Erreur lors de la suppression de l'illustration : ", err);
    });
  }

  await task.deleteOne();

  res.status(200).json({ message: "Tâche supprimée" });
});

module.exports = {
  createTask,
  listTask,
  updateTask,
  deleteTask,
};
