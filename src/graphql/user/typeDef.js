import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    """
    Find one by id
    """
    book(_ids: [ID!]): ResultListBookPayload
    """
    Filter and paging
    """
    books(input: FilterBookInput): PagingListBookPayload
  }

  extend type Mutation {
    """
    Create a book
    """
    createBook(input: CreateBookInput!): ResultBookPayload
  }

  type BookPayload {
    """
    Book ID
    """
    _id: ID!
    """
    Book's Title
    """
    title: String!
    """
    Year of publication
    """
    yearOfPublication: Date
    """
    Book's Author
    """
    author: AuthorPayload
    """
    Create Date
    """
    createdAt: Date
    """
    Update Date
    """
    updatedAt: Date
  }

  type ResultBookPayload {
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
    data: BookPayload
  }

  type ResultListBookPayload {
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
    data: [BookPayload]
  }

  type PagingListBookPayload {
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
    data: [BookPayload]
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

  input FilterBookInput {
    """
    Book's Title
    """
    title: String
    """
    Year of publication
    """
    yearOfPublication: Date
    """
    Year of publication
    """
    perPage: Int
    """
    Year of publication
    """
    pageNumber: Int
  }

  input CreateBookInput {
    """
    Book's Title
    """
    title: String!
    """
    Year of publication
    """
    yearOfPublication: Date
    """
    Book's Author Id
    """
    authorId: ID
  }

`;
