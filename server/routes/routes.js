const mysql = require('mysql');
const multer = require('multer');

const db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'dalua123',
	database : 'tompero'
});

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/img/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

const upload = multer({ storage: storage })

module.exports = app => {
	
	let profile = {};
	let account = {};
    let feed = {};    
    let news = {};

	app.get('/', (req, res) => {
		res.render('index')
	});
	
	app.get('/new', (req, res) => {
		let userQuery = "SELECT id as id_profile, profile FROM profile";
		db.query(userQuery, (error, results) => {
			profile = results;
		});
		setTimeout(function() {
			res.render('new', {profile: profile});
		}, 1000);		
	});
	
	app.post('/authnew', function(request, response) {
		let fullname = request.body.fullname;
		let email = request.body.email;		
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
	});
	
	app.get('/home', function(request, response) {		
		let id_user = request.session.id_user;

		let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.id = '"+ id_user +"'";
        let feedQuery = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";
        let feedNews = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication where c.id != " + id_user + " order by p.id desc limit 1";

        db.query(feedQuery, (error, results) => {            
            feed = results;
        });

        db.query(feedNews, (error, results) => {
            //results[0].post = results[0].post.substring(0, 50);
            news = results;
        });

		db.query(userQuery, (error, results) => {
            if (results.length > 0) {
                account = results;
                response.render('home', { account: results, feed: feed, news: news});
			} else {
                response.render('index');
			}
		});
	});

	app.post('/auth', function(request, response) {
		let username = request.body.username;
		let password = request.body.password;

		let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.username = '"+ username +"' AND a.password = '"+ password +"'";
        let feedQuery = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";        

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
                    let feedNews = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication where c.id != " + results[0].id_user + " order by p.id desc limit 1";
                    console.log(feedNews);
                    db.query(feedNews, (error, result) => {                        
                        news = result;
                        response.render('home', { account: results, feed: feed, news: result });
                    });
                    
                } else {
                    //response.send('Senha incorreta');
                    response.render('index');
                }                
			});
		} else {
            response.render('index');
		}
	});
	
	app.post('/post', upload.single('file'), (request, response) => {
        if (request.session.loggedin) {
            var message = request.body.message;
            var title = request.body.title;
            var portion = request.body.portion;
            var preparation_time = request.body.preparation_time;
            message = String(message).replace(/'/g, '"');
            let id_user = request.session.id_user;

            if (!portion) {
                portion = 0;
            }

            if (!preparation_time) {
                preparation_time = 0;
            }

            let userQuery = "INSERT INTO publications (id_account, date_post, post, title, portion, preparation_time) values (" + id_user + ", NOW(), '" + message + "', '" + title + "', " + portion + ", " + preparation_time + ")";            
            
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
                let feedQuery = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";		
                db.query(feedQuery, (error, results) => {
                    for (var i = 0; i < results.length; i++) {
                        //var converter = new QuillDeltaToHtmlConverter(results[i].post);
                        //var html = converter.convert();
                        //results[i].post = html;                        
                    }
                    feed = results;
                });
				setTimeout(function() {
					response.redirect('/post');
				}, 1000);
			});
		} else {
			response.render('index');
		}
	});
	
    app.get('/post', (request, response) => {
        let id_user = request.session.id_user;

        let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.id = '" + id_user + "'";
        let feedQuery = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";

        db.query(feedQuery, (error, results) => {
            for (var i = 0; i < results.length; i++) {
                /*let converter = convertDeltaToHtml(results[i].post);
                console.log(converter);
                results[i].post = converter;*/
            }
            feed = results;
        });

        db.query(userQuery, (error, results) => {
            if (results.length > 0) {
                account = results;
                response.render('home', { account: results, feed: feed, news: news });
            } else {
                response.render('index');
            }
        });
	});
	
    app.get('/profile', (request, response) => {		
        let id_user = request.session.id_user;

        let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.id = '" + id_user + "'";
        let feedQuery = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication order by p.date_post desc";

        db.query(feedQuery, (error, results) => {
            for (var i = 0; i < results.length; i++) {
                /*let converter = convertDeltaToHtml(results[i].post);
                console.log(converter);
                results[i].post = converter;*/
            }
            feed = results;
        });

        db.query(userQuery, (error, results) => {
            if (results.length > 0) {
                account = results;
                response.render('profile', { account: results, feed: feed });
            } else {
                response.render('index');
            }
        });
    });

    app.get('/profile/:id_account', (req, res) => {
        var id_account = req.params.id_account;
        let profileUserQuery = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication where c.id = "+id_account+" order by p.date_post desc"
        db.query(profileUserQuery, (error, results) => {
            if (error) {
                res.send('Erro: ' + error + ' ' + id_account + ' ' + profileUserQuery);
            } else {
                let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.id = '" + id_account + "'";
                db.query(userQuery, (error, resultUser) => {
                    res.render('profileUsers', { feedUser: results, accountUser: resultUser, news: news });    
                });
            }                        
        });        
    });

    app.post('/savenew', (request, response) => {
        if (request.session.loggedin) {
            let id_user = request.session.id_user;
            let fullname = request.body.fullname;
            let email = request.body.email;
            let description = request.body.description;
            description = String(description).replace(/'/g, '"');
            let username = request.body.username;
            let password = request.body.password;

            let updateQuery = "UPDATE accounts set fullname = '" + fullname + "', email = '" + email + "', description = '" + description + "', username = '" + username + "', password = '" + password + "' where id = " + id_user;
            db.query(updateQuery, (error, results) => {
                if (error) {
                    response.send('Erro: ' + error + ' ' + id_user + ' ' + updateQuery);
                } else {
                    setTimeout(function () {
                        response.redirect('/home');
                    }, 1000);
                }
            });
        } else {
            response.render('index');
        }
    });

    app.post('/updatephoto', upload.single('file'), (request, response) => {
        if (request.session.loggedin) {
            let id_user = request.session.id_user;
            if (request.file) {
                let file = request.file
                let updatePhoto = "UPDATE accounts set photo = '" + file.filename + "' where id = " + id_user;
                db.query(updatePhoto, (error, results) => {
                    if (error) {
                        response.send('Erro: ' + error + ' ' + id_user + ' ' + file.filename + ' ' + updatePhoto);
                    }
                    let userQuery = "SELECT a.id as id_user, a.username, a.password, a.email, a.fullname, a.sex, YEAR(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(a.birthday))) AS idade, a.description, p.profile, a.photo FROM accounts a inner join profile p on a.id_profile = p.id WHERE a.id = '" + id_user + "'";
                    db.query(userQuery, (error, results) => {
                        if (results.length > 0) {
                            account = results;
                        }
                    });
                    response.redirect('/profile');
                });

            } else {
                response.redirect('/profile');
            }
        } else {
            response.render('index');
        }
    });

    app.get('/recipe', (request, response) => {
        let id_user = request.session.id_user;
        
        let feedQuery = "SELECT p.id as id_publication, c.id as id_account, c.fullname, date_format(p.date_post, '%d/%m/%Y %H:%m:%s') as date_post, p.post, f.photo, p.title, p.portion, p.preparation_time FROM publications p inner join accounts c on p.id_account = c.id left join photo_publications f on p.id = f.id_publication where p.id in (select id_publications from likes where id_account = " + id_user + ") order by p.date_post desc";

        db.query(feedQuery, (error, results) => {
            if (error) {
                response.send('Erro: ' + error + ' ' + feedQuery);
            } else {
                response.render('recipe', { feed: results });
            }            
        });        
    });

    app.get('/recipe/:id_publication', (request, response) => {
        var id_publication = request.params.id_publication;
        let id_user = request.session.id_user;

        let newLike = "INSERT INTO likes (id_account, id_publications) values (" + id_user + ", " + id_publication + ")";
        db.query(newLike, (error, results) => {
            if (error) {
                response.send('Erro: ' + error + ' ' + id_user + ' ' + id_publication + ' ' + newLike);
            } else {
                response.render('index');
            }
        });

        response.redirect('/recipe');
    });
}
