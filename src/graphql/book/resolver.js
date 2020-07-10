export default {
  Query: {
    book: async (_, { _id }, { dataSources: { Book } }) => {
      const doc = await Book.getOneById(_id);
      return doc;
    },
    books: async (_, { input }, { dataSources: { Book } }) => {
      const docs = await Book.filterAndPaging(input);
      return docs;
    }
  },
  Mutation: {
    createBook: async (_, { input }, { dataSources: { Book } }) => {
      const docs = await Book.create(input);
      return docs;
    }
  },
  BookPayload: {
    author: async ({ authorId }, args, { dataSources: { Author } }) => {
      if (!authorId) return null;
      const data = await Author.findOneById(
        authorId,
        { ttl: 120 }
      );
      return data;
    }
  }
};
