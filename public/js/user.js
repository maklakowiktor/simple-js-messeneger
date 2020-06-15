const mongoose  = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
        pass: String
 });

const UserMongo =  mongoose.model('users', UserSchema);
module.exports = UserMongo;




