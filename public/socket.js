var socket
var name
var isIdendity = false
$(function () {
  socket = io('http://chat.zykee.net', { "autoConnect": false, "reconnection": false })
  function nameEnter() {
    name = $('#nameInput').val().trim()
    if (name == '') {
      alert('姓名不能为空')
      return
    }
    socket.connect()
  }
  function messageEnter() {
    if(!isIdendity) return
    var message = $('#m').val().trim()
    if (message == '') {
      alert('内容不能为空')
      return
    }
    socket.emit('chat message', {
      name,
      message
    })
    $('#messages').append($('<li>').text(`${name}: ${message}`))
    $('#m').val('')
  }
  $('#nameEnter').on('click', nameEnter)
  $('#nameInput').bind('keydown',function(e){
    if(e.keyCode=='13'){
      nameEnter()
    }
  })
  
  $('#btn').on('click', messageEnter)
  $('#m').bind('keydown',function(e){
    if(e.keyCode=='13'){
      messageEnter()
    }
  })
  $('#m').focus(function(){
    socket.emit('focus',{})
  })
  $('#m').blur(function(){
    socket.emit('blur',{})
  })

  socket.on('connect', function () {
    socket.emit('identify', {
      name
    })
  })
  socket.on('writing',function(){
    $('#title').text('对方正在输入…')
  })
  socket.on('unwrite',function(){
    $('#title').text('聊天室')
  })
  socket.on('online', function (data) {
    if (data.isOk) {
      isIdendity=true
      $('.enter-item').remove()
      data.message.map((elem)=>{
        $('#messages').append($('<li>').text(`${elem.name}: ${elem.message}`))
      })
      $('#messages').append($('<li>').text(`${name}: 上线啦！`))
    } else {
      if (data.error == 'error_name') {
        alert('身份验证未通过')
      } else {
        alert('身份信息被占用')
      }
      name = ''
      socket.close()
    }
  })
  socket.on('list', function (data) {
    $('#messages').append($('<li>').text(`${data.name}: ${data.message}`))
  })
  $(window).on('unload', function () {
    socket.emit('unline', { name })
    name = ''
  })
})
