import generateModel from "../../generates/generateModel";

const schema = {
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: String,
  lastName: String,
  phone: String,
  avatar: String,
  status: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum : ['user','admin','manager','author'],
    default: 2,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: Date,
};

export default generateModel({
  schema,
  modelName: "user",
  collectionName: "user",
});
