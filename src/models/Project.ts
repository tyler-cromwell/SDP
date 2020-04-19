export interface Project {
  id: string,
  name: string,
  owner: string
  description: string,
  version: string,
  template: object,
  dynamoTables: string[]
}
