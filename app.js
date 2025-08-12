const express = require("express")
const cors = require("cors")
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const paginate = require ("express-paginate")
require("dotenv").config();

const userRoutes = require("./routes/userRoutes")
const TaskRoutes = require("./routes/TaskRoutes")


const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet())
app.use(morgan('dev'));
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


module.exports = app;