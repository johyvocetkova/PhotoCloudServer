const path = require("path");
const Ajv = require("ajv").default;

const PhotoDao = require("../../dao/photo-dao");
let dao = new PhotoDao();

let schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
};

async function DeleteAbl(req, res) 
{
  try 
  {
    const ajv = new Ajv();
    const body = req.query.id ? req.query : req.body;
    const valid = ajv.validate(schema, body);

    if (valid) 
    {
      const id = body.id;
      await dao.deletePhoto(id);
      res.json({});
    } 
    else 
    {
      res.status(400).send({
        errorMessage: "validation of input failed",
        params: req.body,
        reason: ajv.errors,
      });
    }
  }
  catch (e) 
  {
    res.status(500).send(e.message);
  }
}

module.exports = DeleteAbl;
