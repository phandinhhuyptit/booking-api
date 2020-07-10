import mongoose from "mongoose";
require("dotenv").config();

mongoose.Promise = global.Promise;

export const connect = async ({
  host = process.env.MONGO_DEFAULT_HOST,
  port = process.env.MONGO_DEFAULT_PORT,
  dbName = process.env.MONGO_DEFAULT_DB_NAME
} = {}) => {
  const mongoURL = `mongodb://${host}:${port}/${dbName}`;

  await mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    keepAlive: true,
    connectTimeoutMS: 10000
  });
  return mongoose;
};

export default mongoose;
