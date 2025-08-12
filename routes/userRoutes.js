const express = require("express")
const userController = require('../controllers/userController')
const { protect, adminOnly, managerOrAdmin } = require('../middlewares/userMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { inscriptionSchema, connexionSchema, updateUserSchema } = require('../validators/userValidator');

const Routes = express.Router();

// Routes d'authentification publiques avec validation
Routes.post("/connexion", validate(connexionSchema), userController.connexion)
Routes.post("/inscription", validate(inscriptionSchema), userController.inscription)

// Routes de gestion des utilisateurs (protégées et validées)
Routes.get("/list", [protect, managerOrAdmin], userController.getAllUsers);
Routes.put("/update/:_id", [protect, adminOnly, validate(updateUserSchema)], userController.updateUser);
Routes.delete("/delete/:_id", [protect, adminOnly], userController.deleteUser);


module.exports = Routes;