const mysql = require('mysql');
var connection = mysql.createConnection({
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
		var username = request.body.username;
		var password = request.body.password;
		if (username && password) {
			connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
				if (results.length > 0) {
					request.session.loggedin = true;
					request.session.username = username;
					response.render('home');
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
