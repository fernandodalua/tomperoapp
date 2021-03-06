const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const fs = require('fs');

module.exports = () => {
	const app = express();	

	app.use(session({
        secret: '1d2a3l4u5a',
        resave: true,
        saveUninitialized: true
	}));

	app.set('port', (process.env.PORT || 3000));

	app.use( express.static('public') );

	// view engine setup
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());

	consign({cwd: 'server'})
		.include('models')
		.include('controllers')
		.then('routes')

		.into(app);

	return app;
}
