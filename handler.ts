import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()
const BlogTable = "BlogPosts"

export const createPost: APIGatewayProxyHandler = async (event) => {
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
    return { statusCode: 500, body: JSON.stringify({ error: error }) }
  }
}

export const getPost: APIGatewayProxyHandler = async (event) => {
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
    } catch (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error }) }
    }
  }
}

export const updatePost: APIGatewayProxyHandler = async (event) => {
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
    return { statusCode: 500, body: JSON.stringify({ error: error }) }
  }
}

export const deletePost: APIGatewayProxyHandler = async (event) => {
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
    return { statusCode: 500, body: JSON.stringify({ error: error }) }
  }
}
