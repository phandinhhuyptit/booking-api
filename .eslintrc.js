module.exports = {
  parser: "babel-eslint",
  extends: ["standard", "prettier"],
  plugins: ["prettier"],
  env: {
    jest: true
  },
  rules: {
    camelcase: 0
  }
};
