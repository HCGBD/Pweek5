const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendAssignmentEmail = async (recipientEmail, taskTitle, assignedBy) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Adresse de l'expéditeur
            to: recipientEmail, // Adresse du destinataire
            subject: `Nouvelle tâche assignée : ${taskTitle}`,
            html: `
                <p>Bonjour,</p>
                <p>Vous avez été assigné à une nouvelle tâche : <strong>${taskTitle}</strong>.</p>
                <p>Assignée par : ${assignedBy}</p>
                <p>Veuillez consulter l'application pour plus de détails.</p>
                <p>Cordialement,</p>
                <p>Votre équipe de gestion des tâches</p>
            `,
        });
        console.log(`Email d'assignation envoyé à ${recipientEmail} pour la tâche ${taskTitle}`);
    } catch (error) {
        console.error(`Erreur lors de l'envoi de l'email à ${recipientEmail} :`, error);
    }
};

module.exports = { sendAssignmentEmail };