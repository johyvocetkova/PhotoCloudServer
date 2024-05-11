"use strict";
const fs = require("fs");
const path = require("path");
const global = require("../global");

const rf = fs.promises.readFile;

const STORAGE_PATH = path.join( global.getStorageLocation(), "users.json");

class UsersDao 
{
  async getUser(id) 
  {
    let userslist = await this._loadAllUsers();
    const result = userslist.find((b) => b.id === id);
    return result;
  }

  async listUsers() 
  {
    return await this._loadAllUsers();
  }

  async _loadAllUsers() 
  {
    let userslist;
  
    try 
    {
      userslist = JSON.parse( await rf(STORAGE_PATH));
    } 
    catch (e) 
    {
      console.error(e);
      throw new Error( `Unable to read from storage. Wrong data format. ${STORAGE_PATH}` );
    }

    return userslist;
  }
}

module.exports = UsersDao;
