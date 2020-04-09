export interface DynamoDB {
  tableName: string,
  readCapacityUnits: number,
  writeCapacityUnits: number,
  keySchema: [string, string][],
  attributeDefinitions: [string, string][]
}
