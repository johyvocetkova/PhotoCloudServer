"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const global= require("../global");

const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;
const df = fs.promises.rm;

const STORAGE_PATH = path.join( global.getStorageLocation(), "photos.json");

class PhotoDao 
{
  /**
   * Creates a new photo in the given album using the id
   * @param {*} album id of the album
   * @param {*} ext the file extension
   */
  async createPhoto(album, ext, title)
  {
    const photos = await this._loadAllPhotos();

    const id= crypto.randomBytes(8).toString("hex");
    const filename= `${id}.${ext}`;

    const newPhoto = 
    {
      id: id,
      filename: filename,
      url: global.getPhotoUrl( filename),
      iconUrl: global.getIconUrl( global.getIconFileName( filename)),
      album: album,
      title: title,
    }

    photos.push(newPhoto);
    await this._saveAllPhotos(photos);
    
    return newPhoto;
  }

  /**
   * Returns photo information
   * @param {*} id 
   * @returns the photo or null if not found
   */
  async getPhoto(id) 
  {
    let photos = await this._loadAllPhotos();
    const photo = photos.find((b) => b.id === id);
    return photo;
  }

    /**
   * Creates new album directory
   * @param {*} title as String
   * @returns 
   */
    async updatePhoto(updatedPhoto) 
    {
      let photos = await this._loadAllPhotos();
      const photoIndex = photos.findIndex((b) => b.id === updatedPhoto.id);
  
      if (photoIndex < 0) 
      {
        throw new Error(`Photo with given id ${updatedPhoto.id} does not exists.`);
      }
  
      // merge the changes into the album
      photos[photoIndex] = 
      {
        ...photos[photoIndex],
        ...updatedPhoto
      }
   
      await this._saveAllPhotos(photos);
      return photos[photoIndex];
    }
  
  /**
   * Deletes the photo from the storage
   * @param {*} id photo id
   * @returns 
   */
  async deletePhoto(id) 
  {
    // load the directory
    const photos = await this._loadAllPhotos();
    const photoIndex = photos.findIndex((b) => b.id === id);

    if (photoIndex === -1)
    {
      throw new Error("Photo '"+id+"' does not exist");
    }

    // get the photo and remove it from the list
    const photo = photos[photoIndex];
    photos.splice(photoIndex, 1);
    await this._saveAllPhotos(photos);

    try
    {
      // remove the file
      await df( global.getPhotoPath( photo.filename));
    }
    catch( e)
    {
      console.error( e);
    }

    try
    {
      // remove the icon file
      await df( global.getIconPath( photo.filename));
    }
    catch( e)
    {
      console.error( e);
    }

    return {};
  }

  /**
   * Delete photos from the album
   * @param {*} albumId id of the album
   */
  async deletePhotosFromAlbum(albumId)
  {
    const photos = await this._loadAllPhotos();

    photos.filter((photo) => photo.album === albumId)
          .forEach( async (photo) => await this.deletePhoto(photo.id));

    return {};
  }

  /**
   * @returns all photos from a given album
   */
  async getPhotosFromAlbum(album, sort = "asc") 
  {
    const photos = await this._loadAllPhotos();

    // return all photos with album id
    let albumPhotos = photos.filter((photo) => photo.album === album);
 
    if (sort === "asc") 
    {
      albumPhotos.sort((a, b) => new Date(a.date) - new Date(b.date));
    } 
    else if (sort === "desc") 
    {
      albumPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return albumPhotos;
  }

  async _loadAllPhotos() 
  {
    let photos= null;
  
    try 
    {
      photos = JSON.parse( await rf(STORAGE_PATH));

      // add dates to photos where missing
      let changed= false;
      
      photos.forEach( async photo => 
        {          
          if( photo.date == null) 
          {
            try
            {
              photo.date= global.getExifDate( global.getPhotoPath( photo.filename));
            }
            catch( e)
            {
              photo.date= "N/A";
            }

            changed= true;
          }
        });

      if( changed)
      {
        await this._saveAllPhotos( photos);
      }
    } 
    catch (e) 
    {
      console.error(e);

      // create a new storage
      photos= [];
      await this._saveAllPhotos( null);
    }
 
    return photos;
  }

  /**
   * Saves all photos to the storage
   * @param {*} photos as Object
   */
  async _saveAllPhotos(photos)
  {
    try
    {
      if( photos == null || photos.length == 0)
      {
        await wf(STORAGE_PATH, "[]");
      }
      else
      {
        await wf(STORAGE_PATH, JSON.stringify(photos, null, 2));
      }
    }
    catch (e)
    {
      console.error(e);
      throw new Error( `Unable to write to storage. ${STORAGE_PATH}` );
    }
  }
}

module.exports = PhotoDao;
