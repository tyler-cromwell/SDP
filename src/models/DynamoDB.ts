export interface DynamoDB {
  tableName: string,
  readCapacityUnits: number,
  writeCapacityUnits: number,
  keySchema: object[],
  attributeDefinitions: object[]
}
