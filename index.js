
const app = require('./config/express')();

app.listen(app.get('port'), () => {
	console.log('Express started at http://localhost:3000');
});
