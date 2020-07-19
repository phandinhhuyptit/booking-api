import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    user(_ids: [ID!]): ResultListUserPayload!
    users(input: FilterUserInput): PagingListUserPayload!
  }

  extend type Mutation {
    """
    Create a user
    """
    createUser(input: CreateUserInput!): ResultUserPayload!
    """
    Login  
    """
    login(input: LoginUserInput!): ResultLoginUserPayload!
  }

  type UserPayload {
    _id: ID!
    username: String!
    email: String!
    firstName: String
    lastName: String
    phone: String,
    avatar: String,
    status: Int,
    role: String!,
    createdAt: Date
    updatedAt: Date
  }


  type UserLoginPayload {
    _id: ID!
    username: String!
    email: String!
    firstName: String
    lastName: String
    phone: String,
    avatar: String,
    status: Int,
    role: String!,
    createdAt: Date,
    updatedAt: Date,
    accessToken: String!
    refreshToken: String!
  }

  type ResultUserPayload {
    """
    Message log request
    """
    message: String
    """
    Data result
    """
    data: UserPayload
  }

  type ResultLoginUserPayload {
    """
    Message log request
    """
    message: String
    """
    Data result
    """
    data: UserLoginPayload
  }

  type ResultListUserPayload {
    """
    Status request
    """
    status: Int
    """
    Message log request
    """
    message: String
    """
    List data result
    """
    data: [UserPayload]
  }


  type PagingListUserPayload {
    """
    Message log request
    """
    message: String
    """
    List data result
    """
    data: [UserPayload]
    """
    Total docs response
    """
    total: Int
    """
    Number of page current (default: 0)
    """
    pageNumber: Int
    """
    Size count each page (default: 20)
    """
    perPage: Int
  }

  input FilterUserInput {
    username: String
    email: String
    firstName: String
    lastName: String
    phone: String
    status: String
    perPage: Int
    pageNumber: Int
  }

  input CreateUserInput {
     username : String!
     password: String!
     email: String! 
     firstName: String
     lastName: String
     phone: String
     avatar: String
     status: Int
     role: String!
  }

  input LoginUserInput {
    username : String!
    password: String!
 }

`;
