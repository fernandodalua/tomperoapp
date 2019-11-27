let userController = {}
let profile = {};
let account = {};
let feed = {};
const database = require('../../config/database');
var db = database.db;

userController.index = (req, res) => {
	res.render('index')
}

userController.newUser = (req, res) => {
	let userQuery = "SELECT id as id_profile, profile FROM profile";
	db.query(userQuery, (error, results) => {
		profile = results;
	});
	res.render('new', {profile: profile})
}

userController.authNew = (request, response) => {
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
}

userController.home = (request, response) => {
	if (request.session.loggedin) {
		let id_user = request.session.id_user;
			
		let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.id = '"+ id_user +"'";
		let feedQuery = "SELECT c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";
		
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
	}else{
		res.render('index')
	}
}

userController.auth = (request, response) => {
	let username = request.body.username;
	let password = request.body.password;
	
	let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.username = '"+ username +"' AND a.password = '"+ password +"'";
	let feedQuery = "SELECT c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";
	
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
		response.send('Please enter Username and Password!');
		response.end();
	}
}

userController.post = (request, response) => {
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
			let feedQuery = "SELECT c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";
			db.query(feedQuery, (error, results) => {
				feed = results;
			});
			setTimeout(function() {				
				response.redirect('home', {account: account, feed: feed});
			}, 2000);
		});
	}else{
		res.render('index')
	}
}

module.exports = userController;