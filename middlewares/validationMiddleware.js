const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: 'Erreur de validation',
            details: error.details.map(detail => detail.message).join(', ')
        });
    }

    next();
};

module.exports = validate;