const path = require("path");
const Ajv = require("ajv").default;

const PhotoDao = require("../../dao/photo-dao");
let dao = new PhotoDao();

let schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
  },
  required: ["id"]
};

/**
 * Updates an album 
 * @param {*} req 
 * @param {*} res 
 */
async function UpdateAbl(req, res) 
{
  try 
  {
    const ajv = new Ajv();
    const body = req.body;
    const valid = ajv.validate(schema, body);
    if (valid) 
    {
      const photo= await dao.updatePhoto(body);
      res.status(200).json(photo);
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
    if (e.message.startsWith("Photo with given id")) 
    {
        res.status(400).json({ error: e.message });
    }
    res.status(500).send(e);
  }
}

module.exports = UpdateAbl;
