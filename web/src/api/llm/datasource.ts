import { Datasource, DatasourceList, DatasourceParams, TestConnectionParams } from '@/models/datasource';
import { Method } from '@/utils/http/axiosplus';
import http, { Result } from '@/utils/http';

export const getDatasourceList = (data: DatasourceParams) =>
  http.request<Result<DatasourceList>>('datasource/list', Method.POST, data);

export const getDatasourceActiveList = () =>
  http.request<Result<Datasource[]>>('datasource/active-list', Method.POST, {});

export const addDatasource = (data: Datasource) =>
  http.request<Result<Datasource>>('datasource/add', Method.POST, data);

export const editDatasource = (data: Datasource) =>
  http.request<Result<Datasource>>('datasource/edit', Method.POST, data);

export const changeDatasourceStatus = (data: Datasource) =>
  http.request<Result<Datasource>>('datasource/change-status', Method.POST, data);

export const testDatasourceConnection = (data: TestConnectionParams) =>
  http.request<Result<boolean>>('datasource/test-connection', Method.POST, data);
