const path = require("path");

const AlbumDao = require("../../dao/album-dao");
let dao = new AlbumDao();

async function ListAbl(req, res) 
{
  try 
  {
    const albumList = await dao.listAlbums();
    res.json(albumList);
  } 
  catch (e) 
  {
    console.log(e);
    res.status(500).send(e);
  }
}

module.exports = ListAbl;
