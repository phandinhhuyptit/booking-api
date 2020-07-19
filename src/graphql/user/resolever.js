export default {
    Query: {
      user: async (_, { _id }, { dataSources: { User } }) => {
        const doc = await User.getOneById(_id);
        return doc;
      },
      users: async (_, { input }, { dataSources: { User } }) => {
        const docs = await User.filterAndPaging(input);
        return docs;
      }  
    },
    Mutation: {
      createUser: async (_, { input }, { dataSources: { User } }) => {
        const docs = await User.create(input);
        return docs;
      },
      login: async (_, { input }, { dataSources: { User } }) => {
        const docs = await User.login(input);
        return docs;
      },
      // logout: async (_, { input },{ dataSources: { User } }) => {
      //   const docs = await User.logout(input);
      //   return docs;
      // }
    },
    // BookPayload: {
    //   author: async ({ authorId }, args, { dataSources: { Author } }) => {
    //     if (!authorId) return null;
    //     const data = await Author.findOneById(
    //       authorId,
    //       { ttl: 120 }
    //     );
    //     return data;
    //   }
    // }
  };
  