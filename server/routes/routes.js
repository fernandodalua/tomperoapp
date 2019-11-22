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
//const upload = multer({ dest: 'public/img/'});
var upload = multer({ storage: storage })

var db = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'dalua123',
        database : 'tompero'
});

module.exports = app => {
	
	var account = [];
	
	app.get('/', (req, res) => {
  		//res.json({ status: 'Server is running!' })
		res.render('index')
	});

	app.post('/auth', function(request, response) {
		let username = request.body.username;
		let password = request.body.password;
		
		let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.username = '"+ username +"' AND a.password = '"+ password +"'";
		
		if (username && password) {
			db.query(userQuery, (error, results) => {
				if (results.length > 0) {
					request.session.loggedin = true;
					request.session.username = username;
					request.session.id_user = results[0].id_user;
					account = results;
					response.render('home', {account: results});
				} else {
					response.send('Incorrect Username and/or Password!');
				}				
			});
		} else {
			response.send('Please enter Username and Password!');
			response.end();
		}
	});
	
	app.post('/post', upload.single('file'), (request, response) => {
		const file = req.file
		let message = request.body.message;
		let id_user = request.session.id_user;
		
		let userQuery = "INSERT INTO publications (id_account, date_post, post) values ("+id_user+", NOW(), '"+message+"')";
		
		db.query(userQuery, (error, results) => {
			if (error){
				response.send('Erro: '+error +' '+ id_user +' '+ message +' '+ userQuery);
			}
			let id_publication = results.insertId;
			let userPhoto = "INSERT INTO photo_publications (id_publication, photo) values ("+id_publication+", '"+file.filename+"')";
			db.query(userPhoto, (error, results) => {
				if (error){
					response.send('Erro: '+error +' '+ id_publication +' '+ file.filename +' '+ userQuery);
				}
				response.render('home', {account: account});
			}
		});		
	});
}
