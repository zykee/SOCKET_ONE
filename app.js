var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http);
// var fs = require('fs');
app.use(express.static('public'))

http.listen(80, function () {
  console.log('listening on port:80')
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})
let NAME = {
  boy: {
    isOnline: false
  },
  girl: {
    isOnline: false
  }
}
let message = []
// io.on('connection', function (socket) {
//   socket.broadcast.emit('user connected', { data: 'user connnected'})
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });

io.on('connect', function (socket) {
  // socket.join("public")
  socket.on('identify', function (data) {
    //这里需要加判断
    if (NAME[data.name]) {
      if (NAME[data.name].isOnline) {
        socket.emit('online', {
          isOk: false,
          error: 'error_online'
        })
      } else {
        socket.emit('online', {
          isOk: true,
          message
        })
        NAME[data.name].isOnline = true

        socket.broadcast.emit('list', {
          ...data,
          message: '上线啦！'
        })
        console.log(data.name,':上线')
      }
    } else {
      socket.emit('online', {
        isOk: false,
        error: 'error_name'
      })
    }
  })
  socket.on('unline', function (data) {
    console.log(data.name, ':下线')
    NAME[data.name].isOnline = false
  })
  socket.on('chat message', function (data) {
    console.log(data.name, ':',data.message)
    if(message.length>=20){
      message.shift()
    }
    message.push(data)
    socket.broadcast.emit('list', data)
  })
  socket.on('focus',function(){
    socket.broadcast.emit('writing')
  })
  socket.on('blur',function(){
    socket.broadcast.emit('unwrite')
  })
})