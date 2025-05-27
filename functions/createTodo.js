const connectDB = require("../db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const db = await connectDB();
    const collection = db.collection("todos");

    const data = JSON.parse(event.body);

    if (!data.title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Title is required" }),
      };
    }

    let categoryObjectId = null;
    if (data.categoryId) {
      if (!ObjectId.isValid(data.categoryId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid categoryId" }),
        };
      }
      categoryObjectId = new ObjectId(data.categoryId);
    }

    const newTodo = {
      title: data.title,
      categoryId: categoryObjectId,
      done: data.done || false,
    };

    const result = await collection.insertOne(newTodo);

    return {
      statusCode: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ...newTodo, _id: result.insertedId }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
