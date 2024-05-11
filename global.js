/**
 * Global definitions to be included into files as needed
 */
const fs= require("fs");  
const path= require("path");
const crypto= require("crypto");
const exifParser= require("exif-parser");

// important paths
const PHOTOS_DIR= path.join(__dirname, "photos");
const STORAGE_DIR= path.join(__dirname, "storage");

const BASE_PHOTO_URL= "/photos/";

/**
 * @returns the storage location (directory with data jsons)
 */
function getStorageLocation() {
  return STORAGE_DIR;
}

/**
 * @returns the photos location (directory with images)
 */
function getPhotosLocation() {
    return PHOTOS_DIR;
}

/**
 * 
 * @param {a} filename 
 * @returns a relative URL of the photo file
 */
function getPhotoUrl( filename) 
{
  return BASE_PHOTO_URL + filename;
}

function getIconUrl( iconFilename)
{
  return BASE_PHOTO_URL + iconFilename;
}

/**
 * @param {*} filename 
 * @returns returns the full path to the photo
 */
function getPhotoPath( filename) 
{
  return path.join( getPhotosLocation(), filename);
}

function getIconFileName( fileName)
{
  // split file name to name and extension
  const parts = fileName.split('.');
  const ext = parts.pop();
  const name = parts.join('.');

  return name+'.icon.'+ext;
}

/**
 * @param {*} filename 
 * @returns full path to the icon file
 */
function getIconPath( fileName)
{
  return path.join( getPhotosLocation(), getIconFileName( fileName)); 
}


/**
 * @param {*} filePath the file to read the EXIF data from 
 * @returns the EXIF date of the given file as our ISO string or N/A if DateTimeOriginal is not set
 * @throws Exception if not an image 
 */
function getExifDate( filePath)
{
  let result= null;

  try
  { 
    result= exifParser.create( fs.readFileSync( filePath)).parse();
  }
  catch(e)
  {
    throw new Error( `Unable to read EXIF data from file. ${filePath}`)
  }

  // do we have a DateTimeOriginal?
  if( result?.tags?.DateTimeOriginal == null) 
  {
    return "N/A";
  }

  // we assume numeric timeticks in seconds from 1.1.1970
  return toISOString( new Date( result.tags.DateTimeOriginal*1000));
}

/**
 * @returns Generated random id
 */
function getRandomId() 
{
  return crypto.randomBytes(8).toString("hex");
}

/**
 * @returns the date as string in shortened ISO format
 */
function toISOString( date)
{
  return date.toISOString().substring(0, 19);
}

/**
 * @returns the current date in shortened ISO format
 */
function now() 
{
  return toISOString( new Date());
}

module.exports= { getStorageLocation, getPhotosLocation, getPhotoPath, getPhotoUrl, now, toISOString, getRandomId, getExifDate, getIconFileName, getIconPath, getIconUrl };
