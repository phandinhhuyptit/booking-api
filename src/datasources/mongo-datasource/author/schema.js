import generateModel from "../../generates/generateModel";

const schema = {
  name: { type: String, required: true },
  age: Number,
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: Date,
};

export default generateModel({
  schema,
  modelName: "Author",
  collectionName: "author"
});
