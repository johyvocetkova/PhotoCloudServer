"use strict";
const fs = require("fs");
const path = require("path");
const global= require("../global");

const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;

const STORAGE_PATH = path.join( global.getStorageLocation(), "albums.json");

class AlbumDao 
{
  /**
   * 
   * @param {*} id 
   * @returns album object or null
   */
  async getAlbum(id) 
  {
    if( !id || id.length==0 )
      return null;

    let albumList = await this._loadAllAlbums();
    const result = albumList.find((b) => b.id === id);

    if (!result )
      return null;
    else
      return result;
  }

  /**
   * Creates new album
   * @param {*} title as String
   * @returns 
   */
  async createAlbum(title) 
  {
    // shall be unique and not case sensitive
    let albumList = await this._loadAllAlbums();

    const newAlbum = 
    {
      id: global.getRandomId(),
      title: title,
      date: global.now()
    }
   
    albumList.push(newAlbum);
    await this._saveAllAlbums(albumList);

    return newAlbum;
  }

  /**
   * Creates new album directory
   * @param {*} title as String
   * @returns 
   */
  async updateAlbum(updatedAlbum) 
  {
    let albumList = await this._loadAllAlbums();
    const albumIndex = albumList.findIndex((b) => b.id === updatedAlbum.id);

    if (albumIndex < 0) 
    {
      throw new Error(`Album with given id ${updatedAlbum.id} does not exists.`);
    }

    // merge the changes into the album
    albumList[albumIndex] = 
    {
      ...albumList[albumIndex],
      ...updatedAlbum
    }
 
    // save the changes
    await this._saveAllAlbums(albumList);

    return albumList[albumIndex];
  }

  /**
   * Deletes the album directory
   * @param {*} id 
   * @returns 
   */
  async deleteAlbum(id) 
  {
    let albumList = await this._loadAllAlbums();
    const albumIndex = albumList.findIndex((b) => b.id === id);

    if (albumIndex === -1)
    {
      throw new Error("Album '"+id+"' does not exist");
    }

    albumList.splice(albumIndex, 1);
    
    await this._saveAllAlbums(albumList);

    return {};
  }

  /**
   * @returns all albums in storage
   */
  async listAlbums() 
  {
    return await this._loadAllAlbums();
  }

  async _loadAllAlbums() 
  {
    let albumList;
  
    try 
    {
      albumList = JSON.parse( await rf(STORAGE_PATH));
    } 
    catch (e) 
    {
      console.error(e);

      // reinitiaize the storage
      albumList = [];
      await this._saveAllAlbums(null);
    }

    return albumList;
  }

  async _saveAllAlbums(albumList)
  {
    try 
    {
      if( albumList == null || albumList.length == 0)
      {
        await wf(STORAGE_PATH, "[]");
      }
      else
      {
        await wf(STORAGE_PATH, JSON.stringify(albumList, null, 2));
      }
    } 
    catch (e) 
    {
      console.error(e);
      throw new Error( `Unable to write to storage. ${STORAGE_PATH}` );
    }
  }
}

module.exports = AlbumDao;
