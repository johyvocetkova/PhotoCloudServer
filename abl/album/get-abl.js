const path = require("path");
const Ajv = require("ajv").default;

const AlbumDao = require("../../dao/album-dao");
let dao = new AlbumDao();
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
 * Get album details
 * @param {*} req 
 * @param {*} res 
 */
async function GetAbl(req, res) 
{
  try 
  {
    const ajv = new Ajv();
    const body = req.query.id ? req.query : req.body;
    const valid = ajv.validate(schema, body);

    if (valid) 
    {
      const id = body.id;
      const album = await dao.getAlbum(id);

      if (!album) 
      {
        res.status(400).send({ error: `album with id '${id}' doesn't exist` });
        return;
      }

      // get photos for an album
      album.photos = await photoDao.getPhotosFromAlbum(id);

      res.json(album);
    } 
    else 
    {
      res.status(400).send({
        errorMessage: "validation of input failed",
        params: body,
        reason: ajv.errors,
      });
    }
  } 
  catch (e) 
  {
    res.status(500).send(e);
  }
}

module.exports = GetAbl;
