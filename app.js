const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const app = express()
const connectionString = "postgres://localhost:5432/blogdb"
const db = pgp(connectionString)


app.use(bodyParser.urlencoded({ extended: false }))
// tell express to use mustache templating engine
app.engine('mustache',mustacheExpress())
// the pages are located in views directory
app.set('views','./views')
// extension will be .mustache
app.set('view engine','mustache')

//Render view-posts and insert the data from the database
app.get('/view-posts',(req,res) => {
    db.any('SELECT postid,title,body FROM posts')
    //this promise returns the info in any()
    .then((posts) => {
    res.render('view-posts',{posts: posts})
    })
})

//Create new blog post
app.post('/create-post',(req,res) => {
    //Get the input variables from the create-post page
    let title = req.body.title
    let body = req.body.body
    //db none returns nothing, we don't need anything now. $1 and $2 are positions 0 and 1 in the array we can create right here
    db.none('INSERT INTO posts(title,body) VALUES($1,$2);',[title,body])
    //promise returns nothing, logs a success message
    .then(() => {
    res.redirect('view-posts')
      console.log("Ay pretty good")
    }).catch(error => console.log(error))
})

//Edit post
app.post('/edit-post',(req,res) => {
    let postID = req.body.postId
    let bodyupdate = req.body.bodyupdate
    db.none('UPDATE posts SET body = $2 WHERE postid = $1',[postID,bodyupdate])
    .then(() => {
        res.redirect('/view-posts')
      })
  })

//Delete post
app.post('/delete-post',(req,res) => {

    //Create variable of postid, after converting it to an int
    let postId = parseInt(req.body.postId)
    //No return, delete with SQL code using the postid, converted over to $1
    db.none('DELETE FROM posts WHERE postid = $1',[postId])
    //Return nothing with the promise, but redirect back to view-posts
    .then(() => {
      res.redirect('/view-posts')
    })
})
//db.any('SELECT * FROM posts WHERE postId = $1 AND isPublished = $2',[2,True])
// SELECT * FROM posts WHERE postId = 2 AND isPublished = True


//Render page to create post
app.get('/create-post',(req,res) => {
    res.render('create-post')
  })
  
//Set up server
app.listen(3000,() => {
    console.log("Server is humming!")
})