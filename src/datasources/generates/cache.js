import DataLoader from "dataloader";
import sift from "sift";
import { getCollection } from "./helpers";

const handleCache = async ({ ttl, doc, key, cache }) => {
  if (doc && key && Number.isInteger(ttl)) {
    cache.set(key, JSON.stringify(doc), {
      ttl
    });
  }
};

const orderDocs = ids => docs => {
  const idMap = {};
  docs.forEach(doc => {
    idMap[doc._id] = doc;
  });
  return ids.map(id => idMap[id]);
};

export const createCachingMethods = ({
  collection,
  cache,
  allowFlushingCollectionCache = false,
  debug = false
}) => {
  const isRedis = typeof cache.store === "undefined";
  const isMongoose = typeof collection === "function";
  const loader = new DataLoader(ids =>
    isMongoose
      ? collection
          .find({ _id: { $in: ids } })
          .lean()
          .then(orderDocs(ids))
      : collection
          .find({ _id: { $in: ids } })
          .toArray()
          .then(orderDocs(ids))
  );
  const cachePrefix = `mongo:${getCollection(collection).collectionName}:`;

  const dataQuery = isMongoose
    ? ({ queries }) => {
        return collection
          .find({ $or: queries })
          .lean()
          .then(items => {
            return queries.map(query => items.filter(sift(query)));
          });
      }
    : ({ queries }) =>
        collection
          .find({ $or: queries })
          .toArray()
          .then(items => {
            return queries.map(query => items.filter(sift(query)));
          });

  const queryLoader = new DataLoader(queries => dataQuery({ queries }));

  // dataloader query with options
  const dataQueryWithOption = ({ queries }) => {
    console.log("dataQueryWithOption",queries)
    const filter = queries.map(query => {
      const { select, option, ...other } = query;
      return other.query;
    });
    const select = (queries && queries[0] && queries[0].select) || null;

    const option = (queries && queries[0] && queries[0].option) || null;

    return collection
      .find({ $or: filter }, select, option)
      .lean()
      .then(items =>
        queries.map(query => {
          const { select, option, ...other } = query;
          return items.filter(sift(other.query));
        })
      );
  };

  const queryWithOptionLoader = new DataLoader(queries =>
    dataQueryWithOption({ queries })
  );

  const methods = {
    findOneById: async (id, { ttl } = {}) => {
      const key = cachePrefix + id;

      const cacheDoc = await cache.get(key);
      console.log("key: ", key);
      console.log("cacheDoc: ", cacheDoc);

      if (debug) {
        console.log("KEY", key, cacheDoc ? "cache" : "miss");
      }
      if (cacheDoc) {
        return JSON.parse(cacheDoc);
      }

      const doc = await loader.load(id);
      await handleCache({
        ttl,
        doc,
        key,
        cache
      });

      return doc;
    },

    findManyByIds: (ids, { ttl } = {}) => {
      return Promise.all(ids.map(id => methods.findOneById(id, { ttl }))).then(
        result => {
          return result.filter(i => i);
        }
      );
    },

    findManyByQuery: async (query, { ttl } = {}) => {
      const key = cachePrefix + JSON.stringify(query);

      const cacheDocs = await cache.get(key);
      if (debug) {
        console.log("KEY", key, cacheDocs ? "cache" : "miss");
      }
      if (cacheDocs) {
        return JSON.parse(cacheDocs);
      }
      const docs = await queryLoader.load(query);
      await handleCache({
        ttl,
        doc: docs,
        key,
        cache
      });
      return docs;
    },

    // Find Many by query and option
    findManyByQueryAndOption: async (
      { query, select = null, option = {} },
      { ttl } = {}
    ) => {
      const key =
        cachePrefix +
        JSON.stringify({ query, select, option });

      const cacheDocs = await cache.get(key);
      if (debug) {
        console.log("KEY", key, cacheDocs ? "cache" : "miss");
      }
      if (cacheDocs) {
        return JSON.parse(cacheDocs);
      }
      const docs = await queryWithOptionLoader.load({
        query,
        select,
        option
      });
      await handleCache({
        ttl,
        doc: docs,
        key,
        cache
      });
      return docs;
    },
    // eslint-disable-next-line no-param-reassign
    deleteFromCacheById: async id => {
      const key = id && typeof id === "object" ? JSON.stringify(id) : id; // NEW
      await cache.delete(cachePrefix + key);
    }, // this works also for byQueries just passing a stringified query as the id

    deleteFromCacheByIds: async ids => {
      Promise.all(ids.map(id => methods.deleteFromCacheById(id)));
    },

    deleteFromCachedByQuery: async query => {
      const key = cachePrefix + JSON.stringify(query);
      await cache.delete(key);
    },
    // eslint-disable-next-line no-param-reassign
    flushCollectionCache: async () => {
      if (!allowFlushingCollectionCache) return null;
      if (isRedis) {
        const redis = cache.client;
        const stream = redis.scanStream({
          match: `${cachePrefix}*`
        });
        stream.on("data", keys => {
          // `keys` is an array of strings representing key names
          if (keys.length) {
            const pipeline = redis.pipeline();
            keys.forEach(key => {
              pipeline.del(key);
              if (debug) {
                console.log("KEY", key, "flushed");
              }
            });
            pipeline.exec();
          }
        });
        stream.on("end", () => {
          if (debug) {
            console.log(`Flushed ${cachePrefix}*`);
          }
        });
        return "ok";
      }
      return null;
    }
  };
  return methods;
};
