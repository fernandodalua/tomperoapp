const mysql = require('mysql');
const multer = require('multer');

module.exports.storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/img/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

module.exports.upload = multer({ storage: storage })

module.exports.db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'dalua123',
    database : 'tompero'
});