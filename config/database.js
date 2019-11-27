const mysql = require('mysql');
const multer = require('multer');

module.exports = () => {
	const db = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'dalua123',
		database : 'tompero'
	});
	
	return db;
}