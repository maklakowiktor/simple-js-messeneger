const UserMongo = require('./user');
const MsgsMongo = require('./msgs');
const hash = require('./crypto.js');
const { timeNow } = require('../../utils/messages');

async function regUser(login, password){
try {
let saveUser = await UserMongo({ name: login, pass: hash(password) })
.save();
return saveUser;
}catch(err){
return false;
}
}

async function findUser(login, password){
const user = await UserMongo.
findOne({ name: login, pass: hash(password)}).exec();
return user;
}


async function findMsgs(room){
let msgs = await MsgsMongo
.find({ room }).exec();
return msgs;
}

async function msgsSendNow(msg, sender, room, linkImg){
await MsgsMongo({message: msg, sender, send_time: timeNow().time, room: room, img: linkImg })
.save((err) => {
    if (err) return console.error(err);
    console.log(`New message in DB ${msg}`);
});
} 



module.exports = {
regUser,    
findUser,
findMsgs,
msgsSendNow
};      