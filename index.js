
const app = require('./config/express')();
const config = require('./config/database');


app.listen(app.get('port'), () => {
	console.log('Express started at http://localhost:3000');
});
