const userController = require('../controllers/user')

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
	  	.post(userController.post)
