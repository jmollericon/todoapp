import express from 'express';
import { Server as WebSocketServer } from 'socket.io';
import http from 'http';
import { v4 as uuid } from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server);

let notes = [];

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log('nueva conexión', socket.id);

  socket.emit('server:loadnotes', notes);

  socket.on('client:newnote', ({ title, description }) => {
    const new_note = {
      title,
      description,
      id: uuid()
    };
    notes.push(new_note);
    io.emit('server:newnote', new_note);
  });
  socket.on('client:deletenote', (id) => {
    notes = notes.filter(note => note.id !== id);
    io.emit('server:loadnotes', notes);
  });
  socket.on('client:getnote', (id) => {
    const note = notes.find(note => note.id === id);
    socket.emit('server:selectednote', note);
  });
  socket.on('client:updatenote', (updatedNote) => {
    notes = notes.map(note => {
      if(note.id === updatedNote.id) {
        note.title = updatedNote.title;
        note.description = updatedNote.description;
      }
      return note;
    });
    io.emit('server:loadnotes', notes);
  })
});

server.listen(3000);
console.log('Server on port 3000');
