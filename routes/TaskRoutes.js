const express = require("express")
const TaskController = require("../controllers/TaskController")
const authMiddleware = require("../middlewares/userMiddleware")
const validate = require('../middlewares/validationMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Importation du middleware d'upload
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidator');

const Routes = express.Router()

// Ajout de l'upload.single('illustration') pour gérer l'upload d'un seul fichier nommé 'illustration'
Routes.post("/create", [authMiddleware.protect, upload.single('illustration'), validate(createTaskSchema)], TaskController.createTask)
Routes.get("/list", authMiddleware.protect, TaskController.listTask)
Routes.put("/update/:_id", [authMiddleware.protect, authMiddleware.managerOrAdmin, upload.single('illustration'), validate(updateTaskSchema)], TaskController.updateTask)
Routes.delete("/delete/:_id", [authMiddleware.protect, authMiddleware.adminOnly], TaskController.deleteTask)



module.exports = Routes