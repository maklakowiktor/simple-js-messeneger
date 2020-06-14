const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const preloader = document.querySelector('.square-spin');
const sound = document.querySelector('.new-message');
const volume = document.querySelector('.volume');
const inpMsg = document.getElementById('msg');
const btn = document.getElementById('SendBtn');
const downHere = document.getElementById('arrow');

var session = localStorage.getItem('session');
var sessName = localStorage.getItem('name');
let notification = null;
let timeout, 
    attaches = false,
    userChat = { username: null, room: null };
let scrTop, innHeight, scrHeight, scrollBottom, upThere;

inpMsg.onfocus = () =>{
  if ( (scrTop + innHeight) < scrHeight ){
    upThere = true;
    downHere.style.opacity = '1';
  }
}



btn.setAttribute("disabled", "disabled");
const socket = io();

socket.on('goAway', () => {
  btn.setAttribute("disabled", "disabled");
  window.location.href = '/';
  

})

window.onload = () => {

  Notification.requestPermission().then( permission => {
    if (permission === "granted") {
      notification = true;
      volume.firstElementChild.className = 'far fa-bell';
    } else {
      volume.firstElementChild.className = 'far fa-bell-slash';
    }
  });
}

volume.onclick = (e) => {
  if (notification) {
    notification = false;
    volume.firstElementChild.className = 'far fa-bell-slash';
  } else {
    notification = true;
    volume.firstElementChild.className = 'far fa-bell';
  }
}


// Проверка пользователя
socket.emit('loadClient', session, sessName );


//Получение пользователя и комнаты
socket.on('joinToChat', async(username, room, messages) => {
  userChat = {
    username,
    room
  }
  if (!messages.length) {btn.removeAttribute("disabled")};
 
 
  await Promise.all(messages.map(async (item) => {
    outputOldMessage(item);
    if (messages[messages.length-1] === item){
        btn.removeAttribute("disabled");
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
  }));
  
  // Скрываем прелоадер
  preloader.remove();
  if(userChat.username) {
    socket.emit('joinRoom', userChat.username, userChat.room );
  } else {
    window.location.href = '/rooms'
  }

})

// Получить комнату и пользователя
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
});


// Сообщение от сервера 
socket.on('message', message => {
  outputMessage(message);
  btn.removeAttribute("disabled");
  if (upThere === false){
    chatMessages.scrollTop = chatMessages.scrollHeight; // Скролл вниз
  }
  if (notification === true && message.username !== userChat.username && message.username !== 'Чат') {
    playAudio();
    let purpose = new Notification(`Новое сообщение от ${message.username}`, {
      icon: '../img/twitter.png',
      body: `${message.text}`
    })
   
    purpose.onclick = x => { window.focus(); this.close() }
    purpose.show();
  }
});

function playAudio() { 
  sound.play();
} 

// Показываем/скрываем typing
socket.on('serverTyping', (name) => {
  clearTimeout(timeout);
  let tps = document.querySelector('.span-typing');
  let typingUsers = [];
  typingUsers.push(name);
  tps.innerHTML = `${typingUsers} пишет...`;
  timeout = setTimeout(() => { tps.innerHTML = '' }, 3000);
})

// Отправка сообщения/формы
chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  chatMessages.scrollTop = chatMessages.scrollHeight;
  // Скролл вниз при отправке
  btn.setAttribute("disabled", "disabled");
  let linkImg;
  const msg = e.target.elements.msg.value;
  const images = e.target.elements.photo.files[0];
  if (images !== undefined) {
    linkImg = await fetchImage(e);
  }

  socket.emit('chatMessage', msg, userChat.username, userChat.room, linkImg);

  document.querySelector('form').reset();
  document.getElementById('countFiles').innerText = '';
  e.target.elements.msg.focus();

});

async function fetchImage(e) {
  // const msg = e.target.elements.msg.value;
  const image = e.target.elements.photo.files[0];
  const formData = new FormData();
  formData.set('img', image);

  try {
    const response = await fetch('/chat/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    return result.filePath;
  } catch (error) {
    console.error('Ошибка:', error);
  }
  
}


function countFiles(those) {
  let outCf = document.getElementById('countFiles');
  let cf = those.files.length;

  if(cf == 0) {
    outCf.innerText = '';
  } else {
    outCf.innerText = cf;
  }
}

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div'); // Создаём контейнер для одного сообщения
  div.classList.add('wow');
  div.classList.add('animate__fadeIn');
  div.classList.add('message');
  if(userChat.username == message.username) {
    div.classList.add('my-message');
  }
  const p = document.createElement('p'); // Тег p, содержащий имя и дату письма
  p.classList.add('meta');
  const divt = document.createElement('div');// Создаём второй контейнер, для содержимого сообщения
  divt.classList.add('text');
  // Добавляем содержимое внутрь созданных элементов
  p.innerHTML = `<span class='sender'>${message.username}</span><span class='send-time'> ${message.time}</span>`;
  divt.innerText = message.text;
  if(message.linkImg) {
    divt.innerHTML = divt.innerHTML + `<div class="img-inner-message"><img class="myImg" src="${message.linkImg}" onclick="openImg(this)"></div>`
  }
  
  // Соединяем всё элементы
  div.appendChild(p);
  div.appendChild(divt);
  
  // Присоединяем готовое сообщение ко всему диалогу
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}
// Add users to DOM
function outputUsers(users) {

let onlyname = users.map(a => a.username);
let $withoutDbl =  Array.from(new Set(onlyname));

  userList.innerHTML = `
    ${$withoutDbl.map(user => userChat.username == user ? `<li><b>${user}</b> (Вы)</li>` : `<li>${user}</li>`).join('')}
  `;

}

function typing() {
  socket.emit('serverTyping', userChat.username, userChat.room);
}

const script = document.createElement('script');
script.src = 'js/modal.js';
document.querySelector('body').appendChild(script);


function mobileResolution(x) {
  if (x.matches) {
    document.querySelector('.btn-send').innerText = '';
    document.querySelector('.chat-header>h1').innerHTML = '<img src="../img/icon.svg" id="icon">';
  } else {
    document.querySelector('.btn-send').innerText = ' Отправить';
    document.querySelector('.chat-header>h1').innerHTML = '<img src="../img/icon.svg" id="icon"><span id="headerText">Чат</span>';
  }
}
const x = window.matchMedia("(max-width: 475px)");
mobileResolution(x); // Call listener function at run time
x.addListener(mobileResolution); // Attach listener function on state changes
 
  // Output messages history
  function outputOldMessage(message) {
  const div = document.createElement('div');
  div.classList.add('wow');
  div.classList.add('animate__animated');
  div.classList.add('animate__fadeIn');
  div.classList.add('message');
  if(userChat.username == message.sender) {
    div.classList.add('my-message');
  }
  const p = document.createElement('p');
  p.classList.add('meta');
  const divt = document.createElement('div');
  divt.classList.add('text');
  p.innerHTML = `<span class='sender'>${message.sender}</span><span class='send-time'> ${message.send_time}</span>`;
  divt.innerText = message.message;
  if(message.img) {
    divt.innerHTML = divt.innerHTML + `<div class="img-inner-message"><img class="myImg" src="${message.img}" onclick="openImg(this)"></div>`
  }
  div.appendChild(p);
  div.appendChild(divt);
  document.querySelector('.chat-messages').appendChild(div);
}
// Реакция на скролл
chatMessages.addEventListener('scroll', function(e) {
  scrTop = chatMessages.scrollTop;
  innHeight = chatMessages.offsetHeight;
  scrHeight = chatMessages.scrollHeight;
  if ( (scrTop + innHeight) >= scrHeight ){
    upThere = false;
    downHere.style.opacity = '0';
    // console.log('Внизу!');
  }else {
    upThere = true;
    downHere.style.opacity = '1';
    // console.log('ВВЕРХУ!');
  }
  // scrollBottom = scrHeight - (scrTop + innHeight);
});
// Реакция на кнопку скрола
downHere.addEventListener('click', () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
    downHere.style.opacity = '0';
    upThere = false;
     // console.log('Внизу!');
})


