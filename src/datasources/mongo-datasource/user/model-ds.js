import { MongoDataSource } from "../../generates";
import {
  generatePasswordHash,
  validatePassword,
  createAccessToken,
  createRefreshToken,
} from "../../../external-libs/auth";
import { ApolloError } from "apollo-server-express";

export default class DataSource extends MongoDataSource {
  initialize(config) {
    super.initialize({
      ...config,
      debug: true,
    });
    this.ttl_for_query = 120;
    this.ttl_for_id = 480;
  }

  async getOneById(_id) {
    const result = {
      status: 200,
      message: "Success",
      data: null,
    };

    const doc = await this.findOneById(_id, { ttl: this.ttl_for_id });
    result.data = doc;
    return result;
  }

  async filterAndPaging({ pageNumber = 0, perPage = 20, ...input }) {
    const result = {
      status: 200,
      message: "Success",
      data: [],
      total: 0,
      perPage,
      pageNumber,
    };

    const filter = { ...input };
    const option = {
      skip: perPage * pageNumber,
      limit: perPage,
    };
    const docs = await this.findManyByQueryAndOption(
      { query: filter, option },
      { ttl: this.ttl_for_query }
    );
    const count = await this.collection.countDocuments(filter);
    result.data = docs;
    result.total = count;
    return result;
  }

  async create(input) {
    const result = {
      status: 200,
      message: "Created success",
      data: null,
    };

    try {
      let { username, password, ...info } = input;
      const existedDoc = await this.collection.findOne({ username });

      if (existedDoc) {
        throw new Error("User already used");
      }
      password = generatePasswordHash(password);

      const newDoc = new this.collection({
        username,
        password,
        ...info,
      });

      const saveDoc = await newDoc.save();
      if (saveDoc) {
        const cacheDoc = await this.findOneById(saveDoc._id, {
          ttl: this.ttl_for_id,
        });
        result.data = cacheDoc;
        return result;
      }
    } catch (error) {
      result.status = 400;
      result.message = error.message;
      return result;
    }
  }

  async login(input) {
    const result = {
      status: 200,
      message: "Success",
      data: null,
    };
    try {
      const { username, password } = input;
      const user = await this.collection.findOne({ username });
      if (!user) {
        throw new ApolloError("User not exist", 404);
      }
      const validated = validatePassword(password, username.password ?? "");
      if (!validated) {
        throw new ApolloError("Password not valid!", 400);
      }

      const newUser = this.collection.findOneAndUpdate(
        { _id: user._id },
        { status: 1 },
        { new: true } 
      );
      const accessToken = await createAccessToken(newUser);
      const refreshToken = await createRefreshToken(newUser);
      result.data = {
        newUser,
        accessToken,
        refreshToken
      }     
     return result      
    } catch (error) {
      throw new ApolloError(error.message, 500);
      
    }
  }

  async logout({ userId }) {
    try {
      return await this.collection.findOneAndUpdate(
        { _id: userId },
        { status: 0 },
        { new: true }
      );
    } catch (error) {
      throw new ApolloError(error.message, 500);
    }
  }
}
