const connectDB = require("../db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "DELETE") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const id = event.queryStringParameters?.id;
    if (!id || !ObjectId.isValid(id)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid todo id" }) };
    }

    const db = await connectDB();
    const collection = db.collection("todos");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "Todo not found" }) };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Todo deleted" }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
