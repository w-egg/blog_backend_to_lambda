import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from 'aws-sdk'

import * as jwt from 'jsonwebtoken'

import { authenticate } from './middleware'

const SECRET_KEY = process.env.SECRET_KEY

const dynamoDb = new DynamoDB.DocumentClient()
const BlogTable = "BlogPosts"

const listPosts: APIGatewayProxyHandler = async (event) => {
  const params = {
    TableName: BlogTable
  }

  try {
    const result = await dynamoDb.scan(params).promise()
    return {
      statsuCode: 200,
      body: JSON.stringify(result.Items)
    }
  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: JSON.stringify({ error: error }) }
  }
}

const createPost: APIGatewayProxyHandler = async (event) => {
  const data = JSON.parse(event.body)
  const params = {
    TableName: BlogTable,
    Item: {
      id: data.id,
      title: data.title,
      content: data.content,
      createdAt: Date.now()
    }
  }

  try {
    await dynamoDb.put(params).promise()
    return { statusCode: 201, body: JSON.stringify(params.Item) }
  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: JSON.stringify({ error: error }) }
  }
}

const getPost: APIGatewayProxyHandler = async (event) => {
  const params = {
    TableName: BlogTable,
    Key: {
      id: event.pathParameters.id
    }
  }

  try {
    const result = await dynamoDb.get(params).promise()
    if (result.Item) {
      return { statusCode: 201, body: JSON.stringify(result.Item) }
    }
  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: JSON.stringify({ error: error }) }
  }
}

const updatePost: APIGatewayProxyHandler = async (event) => {
  const data = JSON.parse(event.body)
  const params = {
    TableName: BlogTable,
    Key: {
      id: event.pathParameters.id
    },
    UpdateExpression: 'set title = :title, content = :content',
    ExpressionAttributeValues: {
      ':title': data.title,
      ':content': data.content,
    },
    ReturnValues: 'UPDATED_NEW'
  }

  try {
    const result = await dynamoDb.update(params).promise()
    return { statusCode: 200, body: JSON.stringify(result.Attributes) }
  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: JSON.stringify({ error: error }) }
  }
}

const deletePost: APIGatewayProxyHandler = async (event) => {
  const params = {
    TableName: BlogTable,
    Key: {
      id: event.pathParameters.id
    }
  }

  try {
    const result = await dynamoDb.delete(params).promise()
    return { statusCode: 200, body: JSON.stringify({ message: "削除完了" }) }
  } catch (error) {
    console.error(error)
    return { statusCode: 500, body: JSON.stringify({ error: error }) }
  }
}

// TODO: いったんこれで置いとくがmiddlewareの持ち方は要調整
export const listPostsWithAuth = authenticate(listPosts)
export const getPostWithAuth = authenticate(getPost)
export const updatePostWithAuth = authenticate(updatePost)
export const deletePostWithAuth = authenticate(deletePost)
export const createPostWithAuth = authenticate(createPost)
