var crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secret = '42b6979811021f16134d2d02894f1f101ac969c826630f7e325904eba4e31f7e47361ab28a205380f2c6faab646c5f58c2637794174a75cc6328b6ef085428e9';
const iv = crypto.randomBytes(16); //генерация вектора инициализации
const key = crypto.scryptSync(secret, 'salt', 32); //генерация ключа

function encrypt(text){
  var cipher = crypto.createCipheriv(algorithm, key, iv);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};


function decrypt(text){
    try {
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
    var decrypted = decipher.update(text,'hex','utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
      return false;
  }
};
module.exports = { encrypt, decrypt };
  



