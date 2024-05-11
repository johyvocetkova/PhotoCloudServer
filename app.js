/**
 * This is the main entry point of the application.
 */
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const serveIndex= require("serve-index");
const dotenv = require("dotenv");
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sharp = require('sharp');

const global= require("./global");

/**
 * For a given image file shrink it down to 128x128 pixel icon file 
 * @param {*} image file name
 */
function generateIconFile( fileName )
{
  sharp( global.getPhotoPath( fileName)) 
    .resize(128, 128)
      .toFile( global.getIconPath( fileName), (err, info) => 
      { 
        if(err) console.log(err);
        else console.log(info);
      });  
}

/**
 * Setup Multer o handle file uploads
 * @param {*} app express instance
 */
async function setupMulter(app)
{
  // daos for the upload functionality
  const AlbumDao = require("./dao/album-dao");
  let albumDao = new AlbumDao();
  const PhotoDao = require("./dao/photo-dao");
  let photoDao = new PhotoDao();

  // Configure Multer storage - use opaque file names for images, keep extensions
  const storage = multer.diskStorage(
    {
      destination: function (req, file, cb) 
                   {
                    cb(null, global.getPhotosLocation()); // make sure this directory exists
                   },
      filename: async function (req, file, cb) 
                {
                  // album?
                  const albumId= req.body.album;
                  const title= req.body.title;
                  const album= await albumDao.getAlbum(albumId);

                  // check if album exists
                  if (!album)
                  {
                    cb(new Error("Album does not exist"));
                    return;
                  } 

                  const parts = file.originalname.split('.');
                  const ext = parts.pop();

                  // create a new photo including the file name
                  const photo= await photoDao.createPhoto( album.id, ext, title);

                  // pass the id on
                  req.body.photoId= photo.id

                  cb(null, photo.filename); 
                }
    });

// create multer instance
const upload = multer({ storage: storage });

// POST endpoint to handle file upload
app.post('/album/upload', upload.single('file'), async (req, res) => 
  {
    if (req.file) 
    {
      try
      {
        global.getExifDate( global.getPhotoPath( req.file.filename));
        generateIconFile( req.file.filename);
      }
      catch( e)
      {
        // remove the file
        try
        {
          await photoDao.deletePhoto( req.body.photoId);
        }
        catch( e)
        {
          console.error( "Cannot delete file "+req.file.filename, e );
        }

        // and report error
        res.status(400).send('Not an image file. No file uploaded.');
        return;
      }

      res.status(200).json({
        message: 'File uploaded successfully'
      });
    } 
    else 
    {
        res.status(400).send('No file uploaded');
    }
  });
}

/** Application code starts here */
const applicationName= "Photo Cloud";

// Load environment variables from .env file
require('dotenv').config();
const sessionSecret = process.env.SESSION_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const userRouter = require("./controller/user-controller");
const albumRouter = require("./controller/album-controller");
const photoRouter = require("./controller/photo-controller");

//initializing the new Express.js server
const app = express();
//defining the port on which the application should run on localhost
const port = process.env.PORT || 8000;

// Parsing
app.use(express.json()); // support for application/json
app.use(express.urlencoded({ extended: true })); // support for application/x-www-form-urlencoded
app.use(cors())

//a simple route definition with an HTTP GET method that only returns text
app.get("/", (req, res) => {
  res.send(`<html><body><title>${applicationName}</title><h1>${applicationName}</h1></body></html>`);
});

app.use("/user", userRouter);
app.use("/album", albumRouter);
app.use("/photo", photoRouter);

app.use("/photos", express.static( global.getPhotosLocation()), serveIndex(global.getPhotosLocation(), {'icons': true}));

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: `http://localhost:${port}/auth/google/callback`
},
(accessToken, refreshToken, profile, cb) => {
    // Here you find or create a user in your database
    console.log(profile);
    return cb(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res, next) {
    // Create a new session during successful authentication
    req.session.regenerate(function(err) {
      if (err) {
        return next(err);
      }
      // Redirect home
      res.redirect('/');
    });
  });
  
setupMulter(app);

app.get("/*", (req, res) => {
  res.send("Unknown path!");
});

//setting the port on which the HTTP server should run
app.listen(port, () => 
  {
    console.log(`${applicationName} is listening at http://localhost:${port}`);
  });
