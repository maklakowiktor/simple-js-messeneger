const moment = require('moment');
require('moment-timezone');
moment.locale('ru');

function formatMessage(username, text, linkImg) {
  return {
    username,
    text,
    time: moment.tz('Europe/Moscow').format('DD.MM.YYYY HH:mm'),
    linkImg
  };
}

function timeNow(){
  return {
    time: moment.tz('Europe/Moscow').format('DD.MM.YYYY HH:mm'),
  }
}
// moment().format('DD.MM.YYYY HH:mm'), // DD.MM.YYYY HH:mm

module.exports = {
   formatMessage, timeNow 
  };

// const moment = require('moment');
// moment.locale('ru');

// function formatMessage(username, text, linkImg) {
//   return {
//     username,
//     text,
//     time: moment().format('LLLL'), // DD.MM.YYYY HH:mm
//     linkImg
//   };
// }

// module.exports = formatMessage;
