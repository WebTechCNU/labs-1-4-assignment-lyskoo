const connectDB = require("../db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "PATCH") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const todoId = event.path.split("/").pop();
    if (!ObjectId.isValid(todoId)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid todo id" }) };
    }

    const data = JSON.parse(event.body);
    const updateDoc = {};

    if (data.title !== undefined) updateDoc.title = data.title;
    if (data.done !== undefined) updateDoc.done = data.done;
    if (data.categoryId !== undefined) {
      if (data.categoryId && !ObjectId.isValid(data.categoryId)) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid categoryId" }) };
      }
      updateDoc.categoryId = data.categoryId ? new ObjectId(data.categoryId) : null;
    }

    if (Object.keys(updateDoc).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "No valid fields to update" }) };
    }

    const db = await connectDB();
    const collection = db.collection("todos");

    const result = await collection.updateOne(
      { _id: new ObjectId(todoId) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "Todo not found" }) };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Todo updated" }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
