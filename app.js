var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');

var app = express();

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

//local connection
//var driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j','joel@123'));

//online connection
var driver = neo4j.driver('neo4j+s://e20c507b.databases.neo4j.io', neo4j.auth.basic('neo4j','xVYlHm02bYOTUl8uX9x13mbFuyupOH4mQzqlc7R7FFY'));

//online connection
// # Wait 60 seconds before connecting using these details, or login to https://console.neo4j.io to validate the Aura Instance is available
// NEO4J_URI=neo4j+s://e20c507b.databases.neo4j.io
// NEO4J_USERNAME=neo4j
// NEO4J_PASSWORD=xVYlHm02bYOTUl8uX9x13mbFuyupOH4mQzqlc7R7FFY
// AURA_INSTANCEID=e20c507b
// AURA_INSTANCENAME=Instance01

var session = driver.session();

var multer = require('multer');

var storage =  multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/assets/images/avatarx/')
    },
    filename: (req, file, cb) =>{
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({storage: storage});


var multerEvents = require('multer');

var storageEvent =  multerEvents.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/assets/images/events/')
    },
    filename: (req, file, cb) =>{
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

var uploadEvent = multerEvents({storage: storageEvent});


var multerNews = require('multer');

var storageNews =  multerNews.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/assets/images/news/')
    },
    filename: (req, file, cb) =>{
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

var uploadNews = multerNews({storage: storageNews});


app.get('/admin', function(req, res){
    
    session
    .run('MATCH(n:Course) return n LIMIT 25')
    .then(function(result){
     var courseArr = [];
        result.records.forEach(function(record) {
         courseArr.push({
               id: record._fields[0].identity.low,
               name:  record._fields[0].properties.cname
           });
        });


       session
          .run('MATCH(n:Users WHERE n.user_type = "Admin") return n LIMIT 25')
          .then(function(result){
            var userArr = [];
            result.records.forEach(function(record) {
                userArr .push({
                   id: record._fields[0].identity.low,
                   fn:  record._fields[0].properties.fn,
                   uname:  record._fields[0].properties.uname,
                   utype:  record._fields[0].properties.user_type
               });
            });


            session
              .run('MATCH(n:Users WHERE n.user_type = "Alumnus/Alumna") return n LIMIT 25')
              .then(function(result){
                var userArr2 = [];
                result.records.forEach(function(record) {
                    userArr2.push({
                       id: record._fields[0].identity.low,
                       fn:  record._fields[0].properties.fn,
                       uname:  record._fields[0].properties.uname,
                       cgrad:  record._fields[0].properties.course,
                       ygrad:  record._fields[0].properties.year_graduated,
                       ipath:  record._fields[0].properties.img_path
                   });
                });





                session
                .run('MATCH(n:Events) return n ORDER BY keys(n) DESC')
                .then(function(result){
                  var eventsArr = [];
                  result.records.forEach(function(record) {
                    eventsArr.push({
                         id: record._fields[0].identity.low,
                         eventTitle:  record._fields[0].properties.eventTitle,
                         dte:  record._fields[0].properties.dte,
                         sched:  record._fields[0].properties.sched,
                         descp:  record._fields[0].properties.descp,
                         eventImg:  record._fields[0].properties.eventImg
                     });
                  });




                  session
                  .run('MATCH(n:News) return n ORDER BY keys(n) DESC LIMIT 25')
                  .then(function(result){
                    var newsArr = [];
                    result.records.forEach(function(record) {
                        newsArr.push({
                           id: record._fields[0].identity.low,
                           newsTitle:  record._fields[0].properties.newsTitle,
                           dte:  record._fields[0].properties.dte,
                           descp:  record._fields[0].properties.descp,
                           newsImg:  record._fields[0].properties.newsImg
                       });
                    });





    
    
                    // res.render('admin',{
                    //     courses: courseArr,
                    //     users: userArr,
                    //     users2: userArr2,
                    //     events: eventsArr,
                    //     news: newsArr
                    //  });


                     //add job post start
                     
                  session
                  .run('MATCH (n:JobPosts) return n')
                  .then(function(result){
                    var jobPostArray = [];
                    result.records.forEach(function(record) {
                        jobPostArray.push({
                           id: record._fields[0].identity.low,
                           cat:  record._fields[0].properties.cat,
                           company:  record._fields[0].properties.company,
                           jobtitle:  record._fields[0].properties.jobtitle,
                           postedby:  record._fields[0].properties.postedby,
                           jpdte:  record._fields[0].properties.jpdtey,
                           location: record._fields[0].properties.location,
                           description: record._fields[0].properties.description,
                           jtyp: record._fields[0].properties.jtyp,
                           idx: record._fields[0].properties.idx
                       });
                    });


    
                    res.render('admin',{
                        jobPostArray: jobPostArray,
                        courses: courseArr,
                        users: userArr,
                        users2: userArr2,
                        events: eventsArr,
                        news: newsArr
                     });

                     
    

                  })
                  .catch(function(err){
                       console.log(err);
                  });
                     //add job post end

                  })
                  .catch(function(err){
                       console.log(err);
                  });

  
                })
                .catch(function(err){
                     console.log(err);
                });

              })
              .catch(function(err){
                   console.log(err);
              });

          })


          .catch(function(err){
            console.log(err);
          });
        
    })
    
    .catch(function(err){
     console.log(err);
    });

});






app.post('/addUser', upload.single('img_path') ,function(req, res){
    var fn = req.body.aname
    var gender = req.body.gender
    var course = req.body.course
    var year_graduated = req.body.year_graduated
    var uname = req.body.uname
    var upass = req.body.upass
    var current_job = req.body.current_job
    var user_type = req.body.user_type
    var img_path = req.file.filename // req.body.img_path

    session
       .run('create(n:Users{fn: $fn, gender: $gender, course: $course, year_graduated: $year_graduated, uname: $uname, upass: $upass, current_job: $current_job, user_type: $user_type, img_path: $img_path}) return n.fn', {fn: fn, gender: gender, course: course, year_graduated: year_graduated, uname: uname, upass: upass, current_job: current_job, user_type: user_type, img_path: img_path})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});

//addEvents
app.post('/addEvents', uploadEvent.single('eventImg') ,function(req, res){
    var eventTitle = req.body.eventTitle
    var sched = req.body.sched
    var descp = req.body.descp
    var  eventImg = req.file.filename// req.body.img_path

    let ts = Date.now();
    let date_time = new Date(ts);
    let date = date_time.getDate();
    let month = date_time.getMonth() + 1;
    let year = date_time.getFullYear();

    var dte = 'Posted by: Admin | ' + month + "-" + date + "-" + year


    session
       .run('create(n:Events {eventTitle: $eventTitle, sched: $sched, descp: $descp, eventImg: $eventImg, dte: $dte}) return n.eventTitle', {eventTitle: eventTitle, sched: sched, descp: descp, eventImg: eventImg, dte: dte})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});

//addNews addNews
app.post('/addNews', uploadNews.single('newsImg') ,function(req, res){
    var newsTitle = req.body.newsTitle
    var descp = req.body.descp
    var  newsImg = req.file.filename// req.body.img_path

    let ts = Date.now();
    let date_time = new Date(ts);
    let date = date_time.getDate();
    let month = date_time.getMonth() + 1;
    let year = date_time.getFullYear();

    var dte = 'Posted by: Admin | ' + month + "-" + date + "-" + year


    session
       .run('create(n:News {newsTitle: $newsTitle,  descp: $descp, newsImg: $newsImg, dte: $dte}) return n.eventTitle', {newsTitle: newsTitle,  descp: descp, newsImg: newsImg, dte: dte})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});



app.post('/editCourse',function(req, res){
    var courseName = req.body.cname
    var courseID = req.body.cid
    session
       .run('MATCH (p:Course {cname: $courseID}) SET p.cname = $courseName RETURN p', {courseID: courseID, courseName: courseName})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});



app.post('/deleteCourse',function(req, res){
    var courseID = req.body.cid
    session
       .run('MATCH (n:Course {cname: $courseID}) DETACH DELETE n', {courseID: courseID})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});

//deleteEvent
app.post('/deleteEvent',function(req, res){
    var title = req.body.title
    session
       .run('MATCH (n:Events {eventTitle: $eventTitle}) DETACH DELETE n', {eventTitle: title})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});


//deleteNews
app.post('/deleteNews',function(req, res){
    var title = req.body.title
    session
       .run('MATCH (n:News {newsTitle: $newsTitle}) DETACH DELETE n', {newsTitle: title})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});

//deleteJobPost
app.post('/deleteJobPost',function(req, res){
    var idx = req.body.idx;
    console.log('id kuno ::' + idx);
    session
       .run(`MATCH (n:JobPosts) where n.idx = '${idx}' DELETE n`)
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});




app.post('/deleteUser',function(req, res){
    var fn = req.body.fn
    session
       .run('MATCH (n:Users {fn: $fn}) DETACH DELETE n', {fn: fn})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});

app.post('/deleteAlumna',function(req, res){
    var fn = req.body.fn
    session
       .run('MATCH (n:Users {fn: $fn}) DETACH DELETE n', {fn: fn})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});



app.post('/addJobPosts',function(req, res){
    var cat = req.body.cat
    var company = req.body.company
    var jobtitle = req.body.jobtitle
    var postedby = req.body.postedby
   

    let ts = Date.now();
    let date_time = new Date(ts);
    let date = date_time.getDate();
    let month = date_time.getMonth() + 1;
    let year = date_time.getFullYear();
  

    var jpdte = 'Posted by: Admin | ' + month + "-" + date + "-" + year
    var location = req.body.location
    var description = req.body.description
    var jtyp= req.body.jtyp

    var idx = jobtitle;

    session
       .run(`create (j:JobPosts {cat: '${cat}', company: '${company}', jobtitle: '${jobtitle}', postedby: '${postedby}', jpdte: '${jpdte}', location: '${location}', description: '${description}', jtyp: '${jtyp}', idx: '${idx}'}) return j`)
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});



app.post('/add',function(req, res){
    var courseName = req.body.cname
    session
       .run('create(n:Course{cname: $courseName}) return n.cname', {courseName: courseName})
       .then(function(result){
            res.redirect('/admin');
       })
       .catch(function(err){
          console.log(err);
       });
});

app.get('/orders/', function(req, res){
    res.render('orders',{})
});

app.get('/', function(req, res){
    session
       .run('MATCH(n:Events) return n ORDER BY id(n) DESC  limit 1')
       .then(function(result){
        var eventsArr = [];
           result.records.forEach(function(record) {
            eventsArr .push({
                  id: record._fields[0].identity.low,
                  dte:  record._fields[0].properties.dte,
                  eventTitle:  record._fields[0].properties.eventTitle,
                  descp:  record._fields[0].properties.descp,
                  eventImg:  record._fields[0].properties.eventImg
              });
           });


           session
       .run('MATCH(n:News) return n ORDER BY elementId(n) DESC  limit 4')
       .then(function(result){
        var newsArr = [];
           result.records.forEach(function(record) {
            newsArr .push({
                  id: record._fields[0].identity.low,
                  dte:  record._fields[0].properties.dte,
                  newsTitle:  record._fields[0].properties.newsTitle,
                  descp:  record._fields[0].properties.descp,
                  newsImg:  record._fields[0].properties.newsImg
              });
           });
           res.render('index',{
              events: eventsArr,
              news: newsArr
           });
       })
       .catch(function(err){
        console.log(err);
       });
     

       })
       .catch(function(err){
        console.log(err);
       });
});

app.get('/my_network', function(req, res){
    res.render('my_network',{})
});

app.get('/job_opportunities', function(req, res){

     //add job post start
                     
     session
     .run('MATCH (n:JobPosts) return n')
     .then(function(result){
       var jobPostArray = [];
       result.records.forEach(function(record) {
           jobPostArray.push({
              id: record._fields[0].identity.low,
              cat:  record._fields[0].properties.cat,
              company:  record._fields[0].properties.company,
              jobtitle:  record._fields[0].properties.jobtitle,
              postedby:  record._fields[0].properties.postedby,
              jpdte:  record._fields[0].properties.jpdtey,
              location: record._fields[0].properties.location,
              description: record._fields[0].properties.description,
              jtyp: record._fields[0].properties.jtyp,
              idx: record._fields[0].properties.idx
          });
       });


       res.render('job_opportunities',{
           jobPostArray: jobPostArray
        });

        


     })
     .catch(function(err){
          console.log(err);
     });
        //add job post end

});

app.get('/forums', function(req, res){
    res.render('forums',{})
});


app.get('/events', function(req, res){
   
    session
    .run('MATCH(n:Events) return n LIMIT 25')
    .then(function(result){
      var eventsArr = [];
      result.records.forEach(function(record) {
        eventsArr.push({
             id: record._fields[0].identity.low,
             eventTitle:  record._fields[0].properties.eventTitle,
             dte:  record._fields[0].properties.dte,
             sched:  record._fields[0].properties.sched,
             descp:  record._fields[0].properties.descp,
             eventImg:  record._fields[0].properties.eventImg
         });
      });


      res.render('events',{
          events: eventsArr,
       });

    })
    .catch(function(err){
         console.log(err);
    });

});


app.get('/about', function(req, res){
    res.render('about',{})

});

app.get('/contact', function(req, res){
   res.render('contact',{})

});

app.get('/news', function(req, res){
    
    session
    .run('MATCH(n:News) return n LIMIT 25')
    .then(function(result){
      var newsArr = [];
      result.records.forEach(function(record) {
        newsArr.push({
             id: record._fields[0].identity.low,
             newsTitle:  record._fields[0].properties.newsTitle,
             dte:  record._fields[0].properties.dte,
             descp:  record._fields[0].properties.descp,
             newsImg:  record._fields[0].properties.newsImg
         });
      });


      res.render('news',{
          news: newsArr,
       });

    })
    .catch(function(err){
         console.log(err);
    });

});



app.listen(4100);
console.log('Server started on port 4100');

module.exports = app;



//online connection
// # Wait 60 seconds before connecting using these details, or login to https://console.neo4j.io to validate the Aura Instance is available
// NEO4J_URI=neo4j+s://e20c507b.databases.neo4j.io
// NEO4J_USERNAME=neo4j
// NEO4J_PASSWORD=xVYlHm02bYOTUl8uX9x13mbFuyupOH4mQzqlc7R7FFY
// AURA_INSTANCEID=e20c507b
// AURA_INSTANCENAME=Instance01


//https://console.neo4j.io/?product=aura-db#databases
//email: mitc02sys@gmail.com
//password: pass@123
