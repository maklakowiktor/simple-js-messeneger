const socket = io();
const submForm = document.querySelector('.login-form');
const login = document.getElementById('login');
const password = document.getElementById('password');
const errorLogin = document.getElementById('errorLogin');
const errorPass = document.getElementById('errorPass');
const buttons = document.querySelectorAll('button');
const checkInput = document.querySelectorAll('input');
const showPass = document.getElementById("showPass");

login.addEventListener('input', (el) => { 
  let val = el.target.value
  el.target.value = (val.replace(/[\s]/g, ''));
});

password.addEventListener('input', (el) => { 
  let val = el.target.value
  el.target.value = (val.replace(/[\s]/g, ''));
  
  
})



function ShoMePass(img) {
  if (password.type === "password") {
    password.type = "text";
    // console.log(img);
    img.src = "./img/off.svg"
  } else {
    password.type = "password";
    img.src = "./img/view.svg"
  }
}


checkInput.forEach(item => {
  item.addEventListener('mousedown', input);
});



buttons.forEach(item => {
 function someFunk (e) { 
   valid(e);
  };
  item.addEventListener('click', (e) => someFunk(e));

});

function input(){
  login.classList.remove('successReg');
  login.classList.remove("invalid");
  errorPass.style.opacity = '0';
  errorLogin.style.opacity = '0';
  password.classList.remove("invalid");
}

function valid(e) {
  
  e.preventDefault();
  if (!login.value && !password.value){
    errorLogin.innerHTML = "Авторизуйтесь!";
    errorLogin.style.opacity = '1';
    login.classList.add("invalid");
    setTimeout(function() {
    errorLogin.style.opacity = '0';
  }, 3000);
  }
  else if (!login.value) {
    errorLogin.innerHTML = "Введите логин!";
    errorLogin.style.opacity = '1';
    login.classList.add("invalid");
    setTimeout(function() {
    errorLogin.style.opacity = '0';
  }, 3000);

  } else if (!password.value){
    errorPass.innerHTML = "Введите пароль!";
    errorPass.style.opacity = '1';
    password.classList.add("invalid");
    setTimeout(function() {
    errorPass.style.opacity = '0';
  }, 3000);

  }else if (e.toElement.classList.contains("btn")) {
    e.toElement.classList.toggle("success");
    socket.emit('clickAuth', login.value, password.value);
  }else {
    socket.emit('clickReg', login.value, password.value);
  }
};


socket.on('DeniedReg', (log) => {

  errorLogin.innerHTML = `Логин ${log} уже зарегистрирован`;
  errorLogin.style.opacity = '1';
  login.classList.remove("success");
  login.classList.remove("successReg");
  login.classList.add("invalid");
  errorLogin.style = 'background-color: #900 ; opacity: 1; transition: .5s;';
  // login.value = '';
})


socket.on('invalidAuth', (log) => {
  errorLogin.innerHTML = `Неверный логин ${log} или пароль`;
  errorLogin.style = 'background-color: #900; opacity: 1;';
  errorLogin.style.opacity = '1';
  login.classList.remove("success");
  login.classList.add("invalid");
  // login.value = '';
  buttons[0].classList.toggle("success");
})

// Успешная идентификация пользователя
socket.on('successAuth', (enc, login) => {
  buttons[0].classList.toggle("success");
  document.location.href = "/rooms";
  localStorage.setItem('session', enc);
  localStorage.setItem('name', login);
  
})

socket.on('successReg', log => {

  errorLogin.innerHTML = `Логин ${log} успешно зарегистрирован`;
  errorLogin.style = 'background-color: rgb(46, 112, 33) ; color: #fff; opacity: 1; transition: .5s;';
  login.classList.remove("invalid");
  login.classList.add("successReg");
})





