import elasticsearch from "@elastic/elasticsearch";
require("dotenv").config();

elasticsearch.Promise = global.Promise;

export const connect = async ({ hosts = process.env.ES_HOST } = {}) => {
  const nodes = hosts.split(",");
  return new elasticsearch.Client({ nodes });
};

export default elasticsearch;
