const Joi = require('joi');

// Schéma pour l'inscription
const inscriptionSchema = Joi.object({
    nom: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'manager', 'member').optional()
});

// Schéma pour la connexion
const connexionSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Schéma pour la mise à jour d'un utilisateur
const updateUserSchema = Joi.object({
    nom: Joi.string().min(3).max(50).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('admin', 'manager', 'member').optional()
}).min(1); // Au moins un champ doit être fourni pour la mise à jour

module.exports = {
    inscriptionSchema,
    connexionSchema,
    updateUserSchema
};