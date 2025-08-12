const mongo = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const taskSchema = new mongo.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  priorite: {
    type: String,
    enum: ['faible', 'moyen', 'haute'],  
    default: 'moyen'
  },
  statut: {
    type: String,
    enum: ['à faire', 'en cours', 'terminé'],  
    default: 'à faire'
  },
  assignedTo: [{
    type: mongo.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongo.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  illustration: { type: String } // Champ pour l'illustration
}, { timestamps: true });

// Ajout du plugin mongoose-paginate-v2
taskSchema.plugin(mongoosePaginate);

module.exports = mongo.model('Task', taskSchema);
