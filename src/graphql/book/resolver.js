export default {
  Query: {
    author: async (_, { _id }, { dataSources: { Author } }) => {
      const doc = await Author.getOneById(_id);
      return doc;
    },
    authors: async (_, { input }, { dataSources: { Author } }) => {
      const docs = await Author.filterAndPaging(input);
      return docs;
    }
  },
  Mutation: {
    createAuthor: async (_, { input }, { dataSources: { Author } }) => {
      const docs = await Author.create(input);
      return docs;
    }
  }
};
