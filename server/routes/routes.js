const userController = require('../controllers/user');
const mysql = require('mysql');
const multer = require('multer');

const db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'dalua123',
	database : 'tompero'
});

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/img/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

const upload = multer({ storage: storage })

module.exports = app => {
	
	let profile = {};
	let account = {};
	let feed = {};
	
	app.route('/')
		.get(userController.index)
	
	app.route('/new')
		.get(userController.newUser)
	
	app.route('/authnew')
		.post(userController.authNew)
	
	app.route('/home')
		.get(userController.home)

	app.route('/auth')
		.post(userController.auth)
	
	app.post('/post', upload.single('file'), (request, response) => {		
		let message = request.body.message;
		let id_user = request.session.id_user;

		let userQuery = "INSERT INTO publications (id_account, date_post, post) values ("+id_user+", NOW(), '"+message+"')";

		db.query(userQuery, (error, results) => {
			if (error){
				response.send('Erro: '+error +' '+ id_user +' '+ message +' '+ userQuery);
			}
			let id_publication = results.insertId;
			if (request.file){
				let file = request.file
				let userPhoto = "INSERT INTO photo_publications (id_publication, photo) values ("+id_publication+", '"+file.filename+"')";
				db.query(userPhoto, (error, results) => {
					if (error){
						response.send('Erro: '+error +' '+ id_publication +' '+ file.filename +' '+ userQuery);
					}
					let feedQuery = "SELECT c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";		
					db.query(feedQuery, (error, results) => {
						feed = results;
					});
					setTimeout(function() {
						response.render('home', {account: account, feed: feed});
					}, 2000);				
				});						
			}
			let feedQuery = "SELECT c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";		
			db.query(feedQuery, (error, results) => {
				feed = results;
			});
			setTimeout(function() {
				response.render('home', {account: account, feed: feed});
			}, 2000);
		});		
	});
}
