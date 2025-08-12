const Joi = require('joi');

// Schéma pour la création d'une tâche
const createTaskSchema = Joi.object({
    titre: Joi.string().min(3).max(100).required(),
    description: Joi.string().optional().allow(''),
    priorite: Joi.string().valid('faible', 'moyen', 'haute').required(),
    statut: Joi.string().valid('à faire', 'en cours', 'terminé').optional(),
    // assignedTo peut être un seul ObjectId ou un tableau d'ObjectIds
    assignedTo: Joi.array().items(Joi.string()).optional()
});

// Schéma pour la mise à jour d'une tâche
const updateTaskSchema = Joi.object({
    titre: Joi.string().min(3).max(100).optional(),
    description: Joi.string().optional().allow(''),
    priorite: Joi.string().valid('faible', 'moyen', 'haute').optional(),
    statut: Joi.string().valid('à faire', 'en cours', 'terminé').optional(),
    // assignedTo peut être un seul ObjectId ou un tableau d'ObjectIds
    assignedTo: Joi.array().items(Joi.string()).optional()
}).min(1); // Au moins un champ doit être fourni pour la mise à jour

module.exports = {
    createTaskSchema,
    updateTaskSchema
};