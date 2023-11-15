export const authenticate = (handler: APIGatewayProxyHandler): APIGatewayProxyHandler => {
  return async (event) => {
    try {
      const token = event.headers.Authorization;
      if (!token) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
      }

      await jwt.verify(token, SECRET_KEY)

      return handler(event)
    } catch (error) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) }
    }
  }
}
