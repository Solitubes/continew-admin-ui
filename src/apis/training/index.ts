import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const TASK_URL = '/training/task'
const DATASET_URL = '/training/dataset'

// ==================== 训练任务 API ====================

/** @desc 查询训练任务列表 */
export function listTask(query: T.TaskQuery) {
  return http.get<PageRes<T.TaskResp[]>>(`${TASK_URL}`, query)
}

/** @desc 获取训练任务详情 */
export function getTask(id: string) {
  return http.get<T.TaskResp>(`${TASK_URL}/${id}`)
}

/** @desc 创建训练任务 */
export function createTask(data: T.TaskReq) {
  return http.post(`${TASK_URL}`, data)
}

/** @desc 取消训练任务 */
export function cancelTask(id: string) {
  return http.post(`${TASK_URL}/${id}/cancel`)
}

/** @desc 删除训练任务 */
export function deleteTask(id: string) {
  return http.del(`${TASK_URL}/${id}`)
}

/** @desc 获取训练日志 */
export function getTaskLogs(id: string, params?: { lastId?: string; limit?: number }) {
  return http.get<T.TaskLog[]>(`${TASK_URL}/${id}/logs`, params)
}

/** @desc 获取训练指标 */
export function getTaskMetrics(id: string) {
  return http.get<T.TaskMetrics[]>(`${TASK_URL}/${id}/metrics`)
}

// ==================== 数据集 API ====================

/** @desc 查询数据集列表 */
export function listDataset(query: T.DatasetQuery) {
  return http.get<PageRes<T.DatasetResp[]>>(`${DATASET_URL}`, query)
}

/** @desc 获取数据集详情 */
export function getDataset(id: string) {
  return http.get<T.DatasetResp>(`${DATASET_URL}/${id}`)
}

/** @desc 上传数据集 */
export function uploadDataset(data: FormData) {
  return http.post(`${DATASET_URL}/upload`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** @desc 删除数据集 */
export function deleteDataset(id: string) {
  return http.del(`${DATASET_URL}/${id}`)
}

/** @desc 预览数据集 */
export function previewDataset(id: string, params?: { page?: number; size?: number }) {
  return http.get<PageRes<T.DatasetSample[]>>(`${DATASET_URL}/${id}/preview`, params)
}

// ==================== 基座模型 API ====================

/** @desc 获取可用的基座模型列表 */
export function listBaseModels() {
  return http.get<T.BaseModel[]>(`/training/models`)
}

