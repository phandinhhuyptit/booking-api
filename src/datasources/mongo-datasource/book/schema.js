import generateModel from "../../generates/generateModel";

const schema = {
  title: { type: String, required: true },
  authorId: String,
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: Date,
};

export default generateModel({
  schema,
  modelName: "Book",
  collectionName: "book"
});
