const connectDB = require("../db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  try {
    const collection = await connectDB();

    const id = event.queryStringParameters?.id;
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "ID is required" }) };
    }

    const item = await collection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return { statusCode: 404, body: JSON.stringify({ error: "Item not found" }) };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(item),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
