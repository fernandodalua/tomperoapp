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

	app.get('/', (req, res) => {
		res.render('index')
	});
	
	app.get('/new', (req, res) => {
		let userQuery = "SELECT id as id_profile, profile FROM profile";
		db.query(userQuery, (error, results) => {
			profile = results;
		});
		setTimeout(function() {
			res.render('new', {profile: profile});
		}, 1000);		
	});
	
	app.post('/authnew', function(request, response) {
		let fullname = request.body.fullname;
		let email = request.body.email;
		let telefone = request.body.telefone;
		let profile = request.body.profile;
		let password = request.body.password;
		let username = request.body.username;

		let newUser = "INSERT INTO accounts (username, password, email, fullname, id_profile) values ('"+username+"', '"+password+"', '"+email+"', '"+fullname+"', "+profile+")";
		db.query(newUser, (error, results) => {
			if (error){
				response.send('Erro: '+error +' '+ profile +' '+ username +' '+ newUser);
			}else{
				response.render('index');
			}			
		});
	});
	
	app.get('/home', function(request, response) {		
		let id_user = request.session.id_user;

		let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.id = '"+ id_user +"'";
        let feedQuery = "SELECT c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";

		db.query(feedQuery, (error, results) => {
			feed = results;
		});

		db.query(userQuery, (error, results) => {
			if (results.length > 0) {					
				response.render('home', {account: results, feed: feed});
			} else {
				response.send('Incorrect Username and/or Password!');
			}
		});
	});

	app.post('/auth', function(request, response) {
		let username = request.body.username;
		let password = request.body.password;

		let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.username = '"+ username +"' AND a.password = '"+ password +"'";
        let feedQuery = "SELECT c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";

		db.query(feedQuery, (error, results) => {
			feed = results;
		});

		if (username && password) {
			db.query(userQuery, (error, results) => {
				if (results.length > 0) {
					request.session.loggedin = true;
					request.session.username = username;
					request.session.id_user = results[0].id_user;
					account = results;
					response.render('home', {account: results, feed: feed});
				} else {
					response.send('Incorrect Username and/or Password!');
				}				
			});
		} else {
            response.render('index');
		}
	});
	
	app.post('/post', upload.single('file'), (request, response) => {
		if (request.session.loggedin) {
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
					});
				}
                let feedQuery = "SELECT c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";		
				db.query(feedQuery, (error, results) => {
					feed = results;
				});
				setTimeout(function() {
					response.redirect('/post');
				}, 1000);
			});
		} else {
			response.render('index');
		}
	});
	
	app.get('/post', (req, res) => {
		res.render('home', {account: account, feed: feed});
	});
	
	app.get('/profile', (req, res) => {
		res.render('profile', {account: account, feed: feed});
    });

    app.get('/profile/:id_account', (req, res) => {
        var id_account = req.params.id_account;
        let profileUserQuery = "SELECT c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication where c.id = "+id_account+" order by p.date_post desc"
        db.query(profileUserQuery, (error, results) => {
            if (error) {
                res.send('Erro: ' + error + ' ' + id_account + ' ' + profileUserQuery);
            } else {
                let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.id = '" + id_account + "'";
                db.query(userQuery, (error, resultUser) => {
                    res.render('profileUsers', { feedUser: results, accountUser: resultUser });    
                });
            }                        
        });        
    });
}
