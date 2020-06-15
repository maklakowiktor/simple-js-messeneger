var crypto = require('crypto');
module.exports = function hash(text) {
	return crypto.createHash('sha1').update(text).digest('base64');
}; 
