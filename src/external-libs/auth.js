import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import store from "../datasources/mongo-datasource";
require("dotenv").config();

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_EXPIRESIN,
  JWT_EXPIRESIN_REFRESH,
} = process.env;


const generatePasswordHash = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hashSync(password, saltRounds);
  } catch (error) {
    throw new Error("Have an error. Please try again!");
  }
};

const createAccessToken = async (user) => {
  const { id, username, email, role } = user;
  return sign({ userId: id, username, email, role }, ACCESS_TOKEN_SECRET, {
    expiresIn: parseInt(JWT_EXPIRESIN),
  });
};

const createRefreshToken = async (user) => {
  const { id, username, email, role } = user;
  return sign({ userId: id, username, email, role }, REFRESH_TOKEN_SECRET, {
    expiresIn: parseInt(JWT_EXPIRESIN_REFRESH),
  });
};

const validatePassword = async (password, hashPassword) => {
  return await bcrypt.compareSync(password, hashPassword);
};

const findUserValid = async (token, secret) => {
  try {
    const payLoad = await verify(token, secret);
    const { userId } = payLoad;
    const user = await store.User.findById(userId);
    if (!user || !Object.entries(user).length) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
};

const authMiddleware = async (req, res, next) => {
  const accessToken = req.headers["x-token"];
  let user = null;
  user = await findUserValid(accessToken, ACCESS_TOKEN_SECRET);

  if (user) {
    const {
      _id: userId,
      username,
      email,
      firstName,
      lastName,
      phone,
      avatar,
      role,
      status,
      createdAt,
      updatedAt,
    } = user;

    if (status && Number(status) === 0) {
      setHeader(res, "", "");
      return next();
    }

    req.user = {
      userId,
      username,
      email,
      firstName,
      lastName,
      phone,
      avatar,
      role,
      status,
      createdAt,
      updatedAt,
    };
    return next();
  }

  const refreshToken = req.headers["x-refresh-token"];
  user = await findUserValid(refreshToken, REFRESH_TOKEN_SECRET);

  if (!user) {
    setHeader(res, "", "");
    return next();
  }

  if (user.status && Number(user.status) === 0) {
    setHeader(res, "", "");
    return next();
  }

  const [newAccessToken, newRefreshToken] = await Promise.all([
    createAccessToken(user),
    createRefreshToken(user),
  ]);

  setHeader(res, newAccessToken, newRefreshToken);

  const {
    _id: userId,
    username,
    email,
    firstName,
    lastName,
    phone,
    avatar,
    role,
    createdAt,
    updatedAt,
    status,
  } = user;

  if (status && Number(status) === 0) {
    setHeader(res, "", "");
    return next();
  }

  req.user = {
    userId,
    username,
    email,
    firstName,
    lastName,
    phone,
    avatar,
    role,
    createdAt,
    updatedAt,
    status,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
  return next();
};

const setHeader = (res, accessToken, refreshToken) => {
  res.set("Access-Control-Expose-Headers", "x-token, x-refresh-token");
  res.set("x-token", accessToken);
  res.set("x-refresh-token", refreshToken);
};

export {
  generatePasswordHash,
  validatePassword,
  createAccessToken,
  createRefreshToken,
  authMiddleware,
};