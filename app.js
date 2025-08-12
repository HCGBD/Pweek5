const express = require("express")
const cors = require("cors")
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const paginate = require ("express-paginate")
const fs = require('fs');
const path = require('path');
require("dotenv").config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./configs/swagger');

const userRoutes = require("./routes/userRoutes")
const TaskRoutes = require("./routes/TaskRoutes")


const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet())

// Configuration de Morgan pour le logging
if (process.env.NODE_ENV === 'production') {
  const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}

app.use(paginate.middleware(10,100))

// Servir les fichiers statiques du dossier 'uploads'
app.use('/uploads', express.static('uploads'));

app.use(rateLimit({
    window: 15 * 60 * 1000,
    max:100
}));

// app.use("/",(req,res)=>{
//     res.send("Welcomme ")
// })

app.use("/api/users",userRoutes)
app.use("/task",TaskRoutes)

// Middleware pour la gestion des erreurs
const { errorHandler } = require('./middlewares/errorMiddleware');
app.use(errorHandler);

// Route pour la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


module.exports = app;