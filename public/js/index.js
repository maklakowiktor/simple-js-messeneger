const btn = document.querySelector('.btn');
let session = localStorage.getItem('session');
let sessName = localStorage.getItem('name');
const socket = io();

socket.emit('loadClient', session, sessName );
socket.on('goAway', () => {
window.location.href = '/';
});

document.querySelector('input').addEventListener('input', (el) => { 
let val = el.target.value;
el.target.value = (val.replace(/[\s]/g, ''));
});

btn.addEventListener("click", function(){
    btn.classList.toggle("roomBtn");
});

