export interface Datasource {
  datasourceId: string;
  name: string;
  type: string;
  host: string;
  port: number;
  databaseName: string;
  username?: string;
  password?: string;
  charset?: string;
  extraOptions?: string;
  status: number;
  description?: string;
  createdUser?: string;
  updatedUser?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatasourceList {
  list: Datasource[];
  page: number;
  pageSize: number;
  count: number;
}

export interface DatasourceParams {
  name?: string;
  type?: string;
  status?: number | null;
  page: number;
  pageSize: number;
}

export interface TestConnectionParams {
  type: string;
  host: string;
  port: number;
  databaseName: string;
  username?: string;
  password?: string;
  charset?: string;
}
