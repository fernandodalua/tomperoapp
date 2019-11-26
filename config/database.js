const mysql = require('mysql');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/img/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

const upload = multer({ storage: storage })

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'dalua123',
    database : 'tompero'
});