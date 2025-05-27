const connectDB = require("../db");
const { ObjectId } = require("mongodb");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const db = await connectDB();
    const collection = db.collection("todos");

    const {
      categoryId,
      completed,
      skip = "0",
      take = "20",
    } = event.queryStringParameters || {};

    const matchStage = {};

    if (categoryId) {
      if (!ObjectId.isValid(categoryId)) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid categoryId" }) };
      }
      matchStage.categoryId = new ObjectId(categoryId);
    }

    if (completed === "true") matchStage.done = true;
    else if (completed === "false") matchStage.done = false;

    const todos = await collection.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $sort: { title: 1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(take) },
      {
        $project: {
          title: 1,
          done: 1,
          categoryId: 1,
          "category.name": 1,
        },
      },
    ]).toArray();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(todos),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
