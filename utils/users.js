const users = [];
const AllConn = [];
let curUser, matchUsers, index;

// Присоединение пользователя к чату
function userJoin(id, username, room) {
  curUser = { id, username, room };
  if(!users.length) {
      users.push(curUser);
      return curUser;
      
    }else if(users.length){
      matchUsers = users.find(item =>
      (item.username === curUser.username) && (item.room === curUser.room));
      if (matchUsers === undefined){
        users.push(curUser);
        return curUser;
      } else if(matchUsers){
        users.push(curUser);
        console.log('Все пользователи: ',users);
        return curUser;
      }
    }
}

// Получить комнату текущего пользователя
function getCurrentUser(id) {
  console.log(id);
  return users.find(item => item.id === id);
  // return AllConn.find(item => item.id === id);
}

// Пользователь покинул чат
function userLeave(id) {
  index = users.findIndex(item => item.id === id);
  if (index !== -1) {
    let x = users.splice(index, 1)[0];
    console.log('Остались: ',users);
    return x;
  }
}

// Получить всех пользователей в комнате
function getRoomUsers(room) {
  let filter = users.filter(item => item.room === room);
  console.log('Что отправляется: ',filter)
  return filter;
}

function UserMatch(name, sess){
  matchUsers = AllConn.find(item =>
    (item.name === name) && (item.sess === sess));
    return matchUsers;
}
function connUserPush(name, sess){
  let cUp = {name, sess}
  AllConn.push(cUp);
  console.log('Users: ',AllConn);
  return cUp;
}
module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  UserMatch,
  connUserPush
};
