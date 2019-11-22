const mysql = require('mysql');
var db = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'dalua123',
        database : 'tompero'
});

module.exports = app => {
	app.get('/', (req, res) => {
  		//res.json({ status: 'Server is running!' })
		res.render('index')
	});

	app.post('/auth', function(request, response) {
		let username = request.body.username;
		let password = request.body.password;
		
		let userQuery = "SELECT * FROM accounts WHERE username = '"+ username +"' AND password = '"+ password +"'";
		
		if (username && password) {
			db.query(userQuery, (error, results) => {
				if (results.length > 0) {
					request.session.loggedin = true;
					request.session.username = username;
					response.render('home.ejs', {texto: "teste", account: results});
				} else {
					response.send('Incorrect Username and/or Password!');
				}
				response.end();
			});
		} else {
			response.send('Please enter Username and Password!');
			response.end();
		}
	});
}
