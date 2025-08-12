const express = require("express")
const userController = require('../controllers/userController')
const { protect, adminOnly, managerOrAdmin } = require('../middlewares/userMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { inscriptionSchema, connexionSchema, updateUserSchema } = require('../validators/userValidator');

const Routes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs de l'API
 */

/**
 * @swagger
 * /api/users/connexion:
 *   post:
 *     summary: Connecte un utilisateur et retourne un token JWT
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe de l'utilisateur
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nom:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Email ou mot de passe incorrect
 *       500:
 *         description: Erreur serveur
 */
Routes.post("/connexion", validate(connexionSchema), userController.connexion)

/**
 * @swagger
 * /api/users/inscription:
 *   post:
 *     summary: Enregistre un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *               - password
 *               - role
 *             properties:
 *               nom:
 *                 type: string
 *                 description: Nom de l'utilisateur
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur (doit être unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe de l'utilisateur
 *               role:
 *                 type: string
 *                 enum: [admin, manager, member]
 *                 description: Rôle de l'utilisateur (admin, manager, member)
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nom:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Email déjà utilisé ou données invalides
 *       500:
 *         description: Erreur serveur
 */
Routes.post("/inscription", validate(inscriptionSchema), userController.inscription)

// Routes de gestion des utilisateurs (protégées et validées)
Routes.get("/list", [protect, managerOrAdmin], userController.getAllUsers);
Routes.put("/update/:_id", [protect, adminOnly, validate(updateUserSchema)], userController.updateUser);
Routes.delete("/delete/:_id", [protect, adminOnly], userController.deleteUser);


module.exports = Routes;