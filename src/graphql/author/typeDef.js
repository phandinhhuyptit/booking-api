import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    """
    Find one by id
    """
    author(_ids: [ID!]): ResultListAuthorPayload
    """
    Filter and paging
    """
    authors(input: FilterAuthorInput): PagingListAuthorPayload
  }

  extend type Mutation {
    """
    Create a author
    """
    createAuthor(input: CreateAuthorInput!): ResultAuthorPayload
  }

  type AuthorPayload {
    """
    author ID
    """
    _id: ID!
    """
    author's Title
    """
    name: String
    """
    Year of publication
    """
    age: Int
    """
    Create Date
    """
    createdAt: Date
    """
    Update Date
    """
    updatedAt: Date
  }

  type ResultAuthorPayload {
    """
    Status request
    """
    status: Int
    """
    Message log request
    """
    message: String
    """
    Data result
    """
    data: AuthorPayload
  }

  type ResultListAuthorPayload {
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
    data: [AuthorPayload]
  }

  type PagingListAuthorPayload {
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
    data: [AuthorPayload]
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

  input FilterAuthorInput {
    """
    author's Title
    """
    name: String
    """
    Year of publication
    """
    age: Int
    """
    Year of publication
    """
    perPage: Int
    """
    Year of publication
    """
    pageNumber: Int
  }

  input CreateAuthorInput {
    """
    author's Title
    """
    name: String!
    """
    Year of publication
    """
    age: Int
  }

`;
