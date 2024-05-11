const path = require("path");
const Ajv = require("ajv").default;

const PhotoDao = require("../../dao/photo-dao");
let dao = new PhotoDao();

let schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"]
};

/**
 * Return the photo from the album directory
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
      const photo= await dao.getPhoto(id);
      
      if (!photo) 
      {
        res
          .status(400)
          .send({ error: `photo with id '${id}' doesn't exist` });
      }
      res.json(photo);
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
