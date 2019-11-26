const userController = require('../controllers/user');

module.exports = app => {
	
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
	
	app.route('/post')
		.get(userController.post, function(req, res) {
    		res.send('Get a random book');
	  	})
	  	.post(userController.post, function(req, res) {
	    	res.send('Add a book');
	  	})
}
