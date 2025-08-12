const Task = require("../models/Task");
const User = require("../models/User"); // Importation du modèle User
const fs = require('fs');
const path = require('path');
const { sendAssignmentEmail } = require('../utils/emailService'); // Importation du service d'email

const createTask = async (req, res) => {
  try {
    // assignedTo peut être un tableau d'IDs ou un seul ID
    let { titre,  description,priorite , statut, assignedTo } = req.body;
    const illustration = req.file ? req.file.path : null; // Récupère le chemin du fichier uploadé

    // Assurez-vous que assignedTo est un tableau
    if (assignedTo && !Array.isArray(assignedTo)) {
      assignedTo = [assignedTo];
    }

    const TaskCreate = new Task({
      titre,
      description,
      priorite,
      statut,
      assignedTo,
      createdBy: req.user._id,
      illustration, // Ajout de l'illustration
    });

    await TaskCreate.save();

    // Envoyer des emails aux utilisateurs assignés
    if (assignedTo && assignedTo.length > 0) {
      const assignedUsers = await User.find({ _id: { $in: assignedTo } });
      const assignedBy = req.user ? req.user.nom : 'Unknow User';
      assignedUsers.forEach(user => {
        sendAssignmentEmail(user.email, titre, assignedBy);
      });
    }

    res.status(201).json(TaskCreate);
  } catch (error) {
    // Si une erreur survient et qu'un fichier a été uploadé, le supprimer
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erreur lors de la suppression du fichier uploadé : ', err);
      });
    }
    res.status(500).json({ message: "Erreur ", error });
  }
};

const listTask = async (req, res) => {
  try {
    const { statut, sort = "-createdAt" ,priorite, myTasks } = req.query;
    const { page, limit } = req.query;
    const query = {};

    if (statut) {
      query.statut = statut;
    }
    if (priorite) {
      query.priorite = priorite;
    }
    // Filtrer les tâches assignées à l'utilisateur actuel
    if (myTasks === 'true' && req.user) {
      query.assignedTo = req.user._id;
    }

    const option = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      sort,
      populate: [
        { path: "assignedTo", select: "nom email role" },
        { path: "createdBy", select: "nom email" },
      ],
      lean: true,
    };

    const result = await Task.paginate(query, option);

    const pageCount = result.totalPages;
    const itemCount = result.totalDocs;
    const currentPage = result.page;

    const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;
    const generatePageLink = (page) => {
      const url = new URL(baseUrl);
      url.searchParams.set("page", page);
      url.searchParams.set("limit", option.limit);
      if (statut) url.searchParams.set("status", statut);
      if (priorite) url.searchParams.set("priorite", priorite);
      if (myTasks) url.searchParams.set("myTasks", myTasks);
      if (req.query.sort) url.searchParams.set("sort", req.query.sort);
      return url.toString();
    };

    const links = {
      self: generatePageLink(currentPage),
      first: generatePageLink(1),
      last: generatePageLink(pageCount),
      prev: currentPage > 1 ? generatePageLink(currentPage - 1) : null,
      next: currentPage < pageCount ? generatePageLink(currentPage + 1) : null,
    };

    res.status(200).json({
      docs: result.docs,
      totalDocs: itemCount,
      limit: option.limit,
      totalPages: pageCount,
      page: currentPage,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      links,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur : ", error });
  }
};

const updateTask = async (req, res) => {
  try {
    // assignedTo peut être un tableau d'IDs ou un seul ID
    let { titre, description,priorite , statut, assignedTo } = req.body;
    const _id = req.params._id;
    const TaskExits = await Task.findById({ _id });
    if (!TaskExits) {
      // Si une nouvelle illustration a été uploadée mais la tâche n'existe pas, la supprimer
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Erreur lors de la suppression du fichier uploadé : ', err);
        });
      }
      return res.status(404).json({ message: "Tache non trouve" });
    }

    // Si un nouveau fichier est uploadé, supprimer l'ancien s'il existe
    if (req.file && TaskExits.illustration) {
      fs.unlink(TaskExits.illustration, (err) => {
        if (err) console.error("Erreur lors de la suppression de l'ancien fichier : ", err);
      });
    }

    // Assurez-vous que assignedTo est un tableau
    if (assignedTo && !Array.isArray(assignedTo)) {
      assignedTo = [assignedTo];
    }

    const TaskUpdate = {
      titre: titre,
      description: description,
      priorite: priorite,
      statut: statut,
      assignedTo: assignedTo,
      createdBy: req.user._id,
      illustration: req.file ? req.file.path : TaskExits.illustration, // Met à jour l'illustration
    };

    const result = await Task.findOneAndUpdate({ _id }, TaskUpdate, {
      new: true,
      runValidators: true,
    });

    // Envoyer des emails aux utilisateurs assignés (si assignedTo a changé ou si c'est une nouvelle assignation)
    if (assignedTo && assignedTo.length > 0) {
        // Récupérer les IDs des utilisateurs précédemment assignés
        const previousAssignedTo = TaskExits.assignedTo.map(id => id.toString());
        // Filtrer les nouveaux IDs qui n'étaient pas présents avant
        const newlyAssignedIds = assignedTo.filter(id => !previousAssignedTo.includes(id.toString()));

        if (newlyAssignedIds.length > 0) {
            const assignedUsers = await User.find({ _id: { $in: newlyAssignedIds } });
            const assignedBy = req.user ? req.user.nom : 'Unknow User';
            assignedUsers.forEach(user => {
                sendAssignmentEmail(user.email, titre, assignedBy);
            });
        }
    }

    res.status(200).json(result);
  } catch (error) {
    // Si une erreur survient et qu'un fichier a été uploadé, le supprimer
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Erreur lors de la suppression du fichier uploadé : ', err);
      });
    }
    res.status(500).json({ message: "Erreur ", error });
  }
};

const deleteTask = async (req, res) => {
  try {
    const _id = req.params._id;
    const TaskExits = await Task.findById({ _id });
    if (!TaskExits) {
      return res.status(404).json({ message: "Tache non trouve" });
    }

    // Supprimer l'illustration associée si elle existe
    if (TaskExits.illustration) {
      fs.unlink(TaskExits.illustration, (err) => {
        if (err) console.error("Erreur lors de la suppression de l'illustration : ", err);
      });
    }

    const taskdelete = await Task.findOneAndDelete({ _id });

    res.status(200).json(taskdelete);
  } catch (error) {
    res.status(500).json({ message: "Erreur ", error });
  }
};

module.exports = {
  createTask,
  listTask,
  updateTask,
  deleteTask,
};
