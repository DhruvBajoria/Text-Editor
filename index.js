import {Server} from "socket.io";
import express from "express";
import { createServer } from "http";
import Connection from "./database/db.js";
import { getDocument, updateDocument } from "./controller/documentController.js";
import * as path from "path"

const PORT = process.env.PORT || 9000;
const MONGODB_URL = process.env.MONGODB_URL;

await Connection(MONGODB_URL);

console.log("server is running on port ", PORT);

const app = express()

// if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'));
// }

const httpServer = createServer(app);
httpServer.listen(PORT);
const io = new Server(httpServer)
const __dirname = path.resolve();
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname,'/client/build/index.html'));
});

io.on('connection',(socket)=>{
    console.log("new connection is added");
    socket.on("get-document",async(documentId)=>{
        const document = await getDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document",document.data);
    
        socket.on("send-changes",(delta)=>{
            socket.broadcast.to(documentId).emit("receive-changes",delta);
        })

        socket.on("save-changes",async(data)=>{
            await updateDocument(documentId,data);
        })
    })
})
