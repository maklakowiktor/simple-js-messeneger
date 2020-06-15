const socket = io();
const submForm = document.querySelector('.login-form');
const login = document.getElementById('login');
const password = document.getElementById('password');
const errorLogin = document.getElementById('errorLogin');
const errorPass = document.getElementById('errorPass');
const buttons = document.querySelectorAll('button');
const checkInput = document.querySelectorAll('input');
const showPass = document.getElementById("showPass");
let timeoutCheckPass, timeoutCheckLogin;



function inputIntoFields(el){
  if (el.name == "login"){
    errorLogin.style.opacity = '0';
    login.classList.remove("successReg", "invalid");
  }else {
    errorPass.style.opacity = '0';
    password.classList.remove("invalid", "successReg");
  };
};

login.addEventListener('input', (el) => { 
  let val = el.target.value;
  el.target.value = (val.replace(/[\s]/g, ''));
});

password.addEventListener('input', (el) => { 
  let val = el.target.value;
  el.target.value = (val.replace(/[\s]/g, ''));
  checkPass(val);
});


function checkPass(passValue) {

  let re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[0-9a-zA-Z!@#$%^&*]{4,}$/g;
  let OK = re.exec(passValue);
  if ((!OK) && (passValue != "")) {
    clearTimeout(timeoutCheckPass);
    password.classList.remove("invalid", "successReg");
    // password.classList.add("invalid");
    errorPass.classList.remove("prevention", "good");
    errorPass.classList.add("prevention");
    errorPass.innerHTML = `Используйте цифры, строчн., прописные и спец. символы`;
    errorPass.style.opacity = '1';
    timeoutCheckPass = setTimeout(() => { 
    errorPass.innerHTML = '' ;
    errorPass.style.opacity = '0';
    }, 10000);
  } else if (OK) {
    clearTimeout(timeoutCheckPass);
    password.classList.remove("invalid", "successReg");
    password.classList.add("successReg");
    errorPass.classList.remove("prevention", "good");
    errorPass.classList.add("good");
    errorPass.innerHTML = "Пароль удовлетворяет требования"
    errorPass.style.opacity = '1';
    timeoutCheckPass = setTimeout(() => { 
      errorPass.innerHTML = '' ;
      errorPass.style.opacity = '0';
      }, 3000);
  } else {
      password.classList.remove("invalid", "successReg");
      errorPass.style.opacity = '0';
    }
}; 

function ShoMePass(img) {
  if (password.type === "password") {
    password.type = "text";
    img.src = "./img/off.svg";
  } else {
    password.type = "password";
    img.src = "./img/view.svg";
  }
};


buttons.forEach(item => {
 function someFunk (e) { 
   valid(e);
  };
  item.addEventListener('click', (e) => someFunk(e));
});



function valid(e) {
  e.preventDefault();
  if (!login.value && !password.value){
    clearTimeout(timeoutCheckLogin);
    login.classList.remove("invalid", "successReg");
    login.classList.add("invalid");
    errorLogin.classList.remove("prevention", "good");
    errorLogin.classList.add("prevention");
    errorLogin.innerHTML = "Авторизуйтесь!";
    errorLogin.style.opacity = '1';
    timeoutCheckLogin = setTimeout(() => { 
      errorLogin.innerHTML = '';
      errorLogin.style.opacity = '0';
      }, 8000);
  }
  else if (!login.value) {
    clearTimeout(timeoutCheckLogin);
    login.classList.remove("invalid", "successReg");
    login.classList.add("invalid");
    errorLogin.classList.remove("prevention", "good");
    errorLogin.classList.add("prevention");
    errorLogin.innerHTML = "Введите логин!";
    errorLogin.style.opacity = '1';
    timeoutCheckLogin = setTimeout(() => { 
      errorLogin.innerHTML = '';
      errorLogin.style.opacity = '0';
      }, 8000);

  } else if (!password.value){

    clearTimeout(timeoutCheckPass);
    password.classList.remove("invalid", "successReg");
    password.classList.add("invalid");
    errorPass.classList.remove("prevention", "good");
    errorPass.classList.add("prevention");
    errorPass.innerHTML = "Введите пароль!";
    errorPass.style.opacity = '1';
    timeoutCheckPass = setTimeout(() => { 
      errorPass.innerHTML = '' ;
      errorPass.style.opacity = '0';
      }, 8000);
  }else if (e.toElement.classList.contains("btn")) {
    socket.emit('clickAuth', login.value, password.value);
  }else {
    socket.emit('clickReg', login.value, password.value);
  }
};

socket.on('DeniedReg', (log) => {
  clearTimeout(timeoutCheckLogin);
  login.classList.remove("invalid", "successReg");
  login.classList.add("invalid");
  password.classList.remove("invalid", "successReg");
  errorLogin.classList.remove("prevention", "good");
  errorLogin.classList.add("prevention");
  errorLogin.innerHTML = `Логин ${log} уже зарегистрирован`;
  errorLogin.style.opacity = '1';
  timeoutCheckLogin = setTimeout(() => { 
    errorLogin.innerHTML = '';
    errorLogin.style.opacity = '0';
    }, 8000);
});

socket.on('invalidAuth', (log) => {
  clearTimeout(timeoutCheckLogin);
  login.classList.remove("invalid", "successReg");
  login.classList.add("invalid");
  password.classList.remove("invalid", "successReg");
  password.classList.add("invalid");
  errorLogin.classList.remove("prevention", "good");
  errorLogin.classList.add("prevention");
  errorLogin.innerHTML = `Неверный логин ${log} или пароль`;
  errorLogin.style.opacity = '1';
  timeoutCheckLogin = setTimeout(() => { 
    errorLogin.innerHTML = '';
    errorLogin.style.opacity = '0';
    }, 8000);
});

// Успешная идентификация пользователя
socket.on('successAuth', (enc, login) => {
  buttons[0].classList.add("success");
  document.location.href = "/rooms";
  localStorage.setItem('session', enc);
  localStorage.setItem('name', login);
});

socket.on('successReg', log => {
  clearTimeout(timeoutCheckLogin);
  login.classList.remove("invalid", "successReg");
  login.classList.add("successReg");
  errorLogin.classList.remove("prevention", "good");
  errorLogin.classList.add("good");
  errorLogin.innerHTML = `Логин ${log} успешно зарегистрирован`;
  errorLogin.style.opacity = '1';
  timeoutCheckLogin = setTimeout(() => { 
    errorLogin.innerHTML = '';
    errorLogin.style.opacity = '0';
    }, 8000);
});
