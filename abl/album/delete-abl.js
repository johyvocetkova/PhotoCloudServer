const path = require("path");
const Ajv = require("ajv").default;

const AlbumDao = require("../../dao/album-dao");
let albumDao = new AlbumDao();
const PhotoDao = require("../../dao/photo-dao");
let photoDao = new PhotoDao();


let schema = {
  type: "object",
  properties: {
    id: { type: "string" }
  },
  required: ["id"]
};

/**
 * Creates an album
 * @param {*} req 
 * @param {*} res 
 */
async function DeleteAbl(req, res) 
{
  try 
  {
    const ajv = new Ajv();
    const body = req.query.id ? req.query : req.body;
    const valid = ajv.validate(schema, body);
    if (valid) 
    {
      let id = body.id;

      await photoDao.deletePhotosFromAlbum(id);
      await albumDao.deleteAlbum(id);

      res.status(204).send();
    } 
    else 
    {
      res.status(400).send(
      {
        errorMessage: "validation of input failed",
        params: req.body,
        reason: ajv.errors,
      });
    }
  } 
  catch (e) 
  {
    console.log(e);
    res.status(500).send(e);
  }
}

module.exports = DeleteAbl;
