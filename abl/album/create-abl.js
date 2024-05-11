const path = require("path");
const Ajv = require("ajv").default;
const AlbumDao = require("../../dao/album-dao");

let dao = new AlbumDao();

let schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    date: { type: "string" }
  },
  required: ["title"]
};

/**
 * Creates an album
 * @param {*} req 
 * @param {*} res 
 */
async function CreateAbl(req, res) 
{
  try 
  {
    const ajv = new Ajv();
    const body = req.query.title ? req.query : req.body;
    const valid = ajv.validate(schema, body);
    if (valid) 
    {
      let title = body.title;
      const album= await dao.createAlbum(title);
      res.status(201).json(album) ;
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

module.exports = CreateAbl;
