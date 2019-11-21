// importando os pacotes para uso no arquivo index.js
//const express = require('express');
//const morgan = require('morgan');
//const cors = require('cors');
//const bodyParser = require('body-parser');
const app = require('./config/express')();

// crio um servidor express
//const app = express();

// aplico configurações para dentro do servidor express, adicionando middlewares (body-parser, morgan, cors)
//app.use(morgan('dev'));
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
//app.use(cors());

// o servidor irá rodar dentro da porta 9000
app.listen(app.get('port'), () => {
	console.log('Express started at http://localhost:3000');
});
