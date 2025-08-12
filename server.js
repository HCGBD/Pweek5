const connectDb = require('./configs/database')
const app = require('./app')
const http = require("http");
// const { Server } = require("socket.io")
require("dotenv").config();

const serverApp = http.createServer(app);

connectDb.connectDb();


// const io = new Server(serverApp,{
//     cors:{origin:"*"}
// })

// io.on('connection',(socket)=>{
//     console.log("Nouvel connection");

//     socket.on("deconnexion",(socket)=>{
//         console.log("WebSocket deconnecte");
        
//     })
    
// })


const PORT = process.env.PORT || 5000

serverApp.listen(PORT,(err, res)=> {
    console.log(`Le serveur est lance sur le http://127.0.0.1:${PORT}`);
    
})


