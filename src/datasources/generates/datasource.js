import { DataSource } from "apollo-datasource";
import { ApolloError } from "apollo-server-errors";
import { InMemoryLRUCache } from "apollo-server-caching";

import { createCachingMethods } from "./cache";
import { isCollectionOrModel } from "./helpers";

class MongoDataSource extends DataSource {
  constructor(collection) {
    super();

    if (!isCollectionOrModel(collection)) {
      throw new ApolloError(
        "MongoDataSource constructor must be given an object with a single collection"
      );
    }
    this.collection = collection;
  }

  initialize({ context, cache, debug, allowFlushingCollectionCache } = {}) {
    this.context = context;
    const methods = createCachingMethods({
      collection: this.collection,
      cache: cache || new InMemoryLRUCache(),
      debug,
      allowFlushingCollectionCache
    });
    Object.assign(this, methods);
  }
}
export { MongoDataSource };
