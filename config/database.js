const mysql = require('mysql');
const multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/img/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage })

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'dalua123',
    database : 'tompero'
});