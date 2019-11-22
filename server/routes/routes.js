const mysql = require('mysql');
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
		
		let userQuery = "SELECT a.id, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.username = '"+ username +"' AND a.password = '"+ password +"'";
		
		if (username && password) {
			db.query(userQuery, (error, results) => {
				if (results.length > 0) {
					request.session.loggedin = true;
					request.session.username = username;
					account = results;
					response.render('home', {account: results});
				} else {
					response.send('Incorrect Username and/or Password!');
				}
				//response.end();
			});
		} else {
			response.send('Please enter Username and Password!');
			response.end();
		}
	});
	
	app.post('/post', function(request, response) {
		let message = request.body.message;
		let id_user = account[0].id;
		
		let userQuery = "INSERT INTO publications values ('"+id_user+"', now(), '"+message+"')"
		db.query(userQuery, (error, results) => {
			response.render('home', {account: account});
		}		
	});
}
