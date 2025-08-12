const multer = require('multer');
const path = require('path');

// Configuration du stockage pour Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/'); // Le dossier où les fichiers seront sauvegardés
    },
    filename: function (req, file, cb) {
        // Génère un nom de fichier unique pour éviter les conflits
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour n'accepter que certains types de fichiers (images ici)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Erreur : Seuls les fichiers image (jpeg, jpg, png, gif,pdf) sont autorisés !'));
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite la taille du fichier à 5MB
    },
    fileFilter: fileFilter
});

module.exports = upload;