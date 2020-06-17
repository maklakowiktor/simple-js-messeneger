const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const hash = require('./public/js/crypto.js');
const UserMongo = require('./public/js/user');
const { findUser, findUserDouble, findMsgs, msgsSendNow } = require('./public/js/mongo');
const { formatMessage } = require('./utils/messages');
const { encrypt } = require('./public/js/auth');
const urlencodedParser = bodyParser.urlencoded({extended: false});

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  UserMatch,
  connUserPush
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) =>{
      cb(null, "public/uploads");
  },
  filename: (req, file, cb) =>{
      cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  }
  else{
    cb(null, false);
  }
};

let upload = multer({ storage: storageConfig, fileFilter: fileFilter });
var cpUpload = upload.fields([{ name: 'img' }]);

// Укажем роуты                   
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/public/login.html');
});

app.get("/rooms", function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Задаем параметры статических папок
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Чат';
let room;
// Запуск при подключении клиентов
io.on('connection', socket => {

  app.post("/chat", urlencodedParser, function(req, res) {
    // username = req.body.username
    room =  req.body.room;
    res.sendFile(__dirname + '/public/chat.html');
  });

  app.post("/chat/upload", cpUpload, function (req, res, next) {
    // let sender = req.body.username;
    // let msg = req.body.msg;
    let file = req.files['img'][0];
    let imgMessage = { filePath: 'uploads/' + file.filename };
    res.send(imgMessage);
  });

  // Проверка подлиности при загрузке чата
  socket.on('loadClient', async( sess, name ) => {
    let messages = [];
    console.log('Сессия и имя: ',name, sess);
    if (sess && name){
      const match = UserMatch(name, sess);
        if (!match) {
          console.log('Неподлиный: ', name);
          socket.emit('goAway');  
        }else{
          console.log('Подлиный: ', match);
          // console.log(res.length);
          let res = await findMsgs(room);
          messages.push(...res);
          socket.emit('joinToChat', name, room, messages);
          console.log(`Произошло извлечение ${messages.length} записей в комнату ${room}`);
        };
    } else {
      console.log('Обманщик!');
      socket.emit('goAway');
    }
  });

  //------------------Регистрация пользователя-------------
  socket.on('clickReg', async(login, password) => {
        let user = await findUserDouble(login);
        if(!user) {
        await UserMongo({name: login, pass: hash(password)}).save(); 
        console.log(`Пользователь ${login} был сохранён`);
        socket.emit('successReg', login);
        } else {
        console.log('Отмена регистрации: ', login);
        socket.emit('DeniedReg', login); 
        }
  });
//------------------Авторизация пользователя-------------
  socket.on('clickAuth', async(login, password) => {
    let user = await findUser(login, password);
    if(!user) { 
            socket.emit('invalidAuth', login);
          } else {
            let enc = encrypt(login);
            const match = UserMatch(login, enc);
              if (!match){
                  const pushUser = connUserPush(login, enc);
                  socket.emit('successAuth', enc, login);
                  console.log('Пушим!: ', pushUser);
                }else {
                  console.log('не пушим!', login);
                  socket.emit('successAuth', enc, login);
                }
          }
  });
// Присоединение пользователя в комнату

  socket.on('joinRoom', (username, room) => {
    // Добавление пользователя в массив 'Users'
    const user = userJoin(socket.id, username, room);
      socket.join(user.room);

    // Приветствие пользователя
    socket.emit('message', formatMessage(botName, 'Добро пожаловать в чат!'));

    // Броадкаст приветствия при подключении пользователя
      socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} присоединился к чату`)
      );
    
    // Отправляем пользователей и комнату
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room) 
      });
  });


  // Прослушивание сообщения чата
  socket.on('chatMessage', async(msg, sender, room, linkImg) => {
     const user = getCurrentUser(socket.id);
      io.to(user.room).emit('message', formatMessage(user.username, msg, linkImg));
      await msgsSendNow(msg, sender, room, linkImg);
  });

  // Запуск когда пользователь отключается
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      console.log(`Вышел: `, user);
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} покинул чат`)
      );

      // Отправить в комнату и информацию об отсоединенном клиенте
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });

  socket.on('serverTyping', (name, room) => {  
    socket.to(room).emit('serverTyping', name);
  });


});


const PORT = process.env.PORT || 5000;

app.get("/*", function(req, res) {
  res.redirect('/');
});
// mongodb+srv://lincoln:1@cluster0-bwlcs.mongodb.net/login
async function start() {
  try {
    await mongoose.connect('mongodb+srv://lincoln:1@cluster0-bwlcs.mongodb.net/login', { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      useCreateIndex: true 
    });
    server.listen(PORT, () => console.log(`Сервер был запущен. Порт: ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
