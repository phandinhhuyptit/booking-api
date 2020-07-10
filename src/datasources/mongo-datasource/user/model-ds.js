import { MongoDataSource } from "../../generates";

export default class DataSource extends MongoDataSource {
  initialize(config) {
    super.initialize({
      ...config,
      debug: true
    });
    this.ttl_for_query = 120;
    this.ttl_for_id = 480;
  }

  async getOneById(_id) {
    const result = {
      status: 200,
      message: "Success",
      data: null
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
      pageNumber
    };

    const filter = { ...input };
    const option = {
      skip: perPage * pageNumber,
      limit: perPage
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
      data: null
    };

    try {
      const { name, ...info } = input;
      const existedDoc = await this.collection.findOne({ name });

      if (existedDoc) {
        throw new Error("Name already used");
      }

      const newDoc = new this.collection({
        name,
        ...info
      });

      const saveDoc = await newDoc.save();
      if (saveDoc) {
        const cacheDoc = await this.findOneById(saveDoc._id, {
          ttl: this.ttl_for_id
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

}
