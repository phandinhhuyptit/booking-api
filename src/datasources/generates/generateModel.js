import mongoose from "../../external-libs/mongoose";
require("dotenv").config();
const collectionPrefix = process.env.MONGO_COLLECTION_PREFIX;

export default ({ schema, modelName, collectionName }) =>
  mongoose.model(
    modelName,
    new mongoose.Schema(schema, {
      collection: `${collectionPrefix}_${collectionName}`,
      versionKey: false,
      strict: false
    })
  );
