const path = require('path')
const express = require('express')
const http = require("http")
const socketio = require('socket.io');
const Filter =require('bad-words');
const { time } = require('console');
const { create } = require('domain');
const {generateMessage} = require('./src/utils/messages');
const { generateLocation } = require('./src/utils/location-message');
const {addUser , removeUser , getUser ,getUsersInRoom} =  require('./src/utils/users');
const { Socket } = require('dgram');
const app = express()
const server = http.createServer(app)
const io = socketio(server)

//let count=0;
const port = process.env.PORT || 5000
const publicDirectoryPath = path.join(__dirname, './public')

app.use(express.static(publicDirectoryPath))
io.on('connection',(socket) =>{
    console.log("new webscoket connection");
    

//    socket.emit("countUpdated" ,count)
//    socket.on('increment',()=>{
//     count++;
//     //socket.emit("countUpdated" ,count)
//     io.emit("countUpdated" ,count)
//})

socket.on('join',({username , room} ,cb)=>{

   const {error ,user}= addUser({id: socket.id ,username,room})
    if(error){
       return cb(error)
    }  


   socket.join(user.room)
socket.emit("message" ,generateMessage("Admin","Welcome") )
socket.broadcast.to(room).emit("message" ,generateMessage("Admin",`${user.username} has joined ` ))
io.to(user.room).emit('roomData',{
    room: user.room,
    users: getUsersInRoom(user.room)
})
cb()

})


socket.on('sendMessage',(message , cb )=>{
    const user =getUser(socket.id)
    const filter = new Filter()
    if (filter.isProfane(message)) {
        return cb('profanit not alowed ')
    }
    io.to(user.room).emit('message',generateMessage( user.username,message))
    cb()
})

socket.on('sendLocation',(position ,cb)=>{
    const user =getUser(socket.id)
io.to(user.room).emit("locationMessage", generateLocation(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
cb()
})


socket.on('disconnect',()=>{
    const user =removeUser(socket.id)
       if(user){
        io.to(user.room).emit('message', generateMessage("Admin",`${user.username} has left`))
       io.to(user.room).emit("roomData",{
        room: user.room,
        users :getUsersInRoom(user.room)
       })  
    
    }

   
})

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})     