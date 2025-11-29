/** 训练任务状态 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/** 训练方法 */
export type TrainingMethod = 'sft' | 'rm' | 'ppo' | 'dpo' | 'pretrain'

/** 微调方式 */
export type FinetuneType = 'full' | 'freeze' | 'lora' | 'qlora'

/** 训练任务查询参数 */
export interface TaskQuery {
  page?: number
  size?: number
  name?: string
  status?: TaskStatus
  createTime?: string[]
}

/** 训练任务请求参数 */
export interface TaskReq {
  name: string
  description?: string
  baseModel: string
  datasetIds: string[]
  trainingMethod: TrainingMethod
  finetuneType: FinetuneType
  // 训练参数
  learningRate: number
  numEpochs: number
  batchSize: number
  maxLength: number
  // LoRA 参数
  loraRank?: number
  loraAlpha?: number
  loraDropout?: number
  // 其他参数
  warmupRatio?: number
  weightDecay?: number
  gradientAccumulationSteps?: number
  fp16?: boolean
  bf16?: boolean
}

/** 训练任务响应 */
export interface TaskResp {
  id: string
  name: string
  description?: string
  baseModel: string
  datasetNames: string[]
  trainingMethod: TrainingMethod
  finetuneType: FinetuneType
  status: TaskStatus
  progress: number
  currentEpoch?: number
  totalEpochs?: number
  currentStep?: number
  totalSteps?: number
  loss?: number
  learningRate: number
  batchSize: number
  outputDir?: string
  errorMessage?: string
  startTime?: string
  endTime?: string
  createTime: string
  createUser: string
}

/** 训练日志 */
export interface TaskLog {
  id: string
  taskId: string
  level: 'info' | 'warning' | 'error'
  message: string
  timestamp: string
}

/** 训练指标 */
export interface TaskMetrics {
  step: number
  epoch: number
  loss: number
  learningRate: number
  timestamp: string
}

/** 数据集类型 */
export type DatasetType = 'alpaca' | 'sharegpt' | 'custom'

/** 数据集查询参数 */
export interface DatasetQuery {
  page?: number
  size?: number
  name?: string
  type?: DatasetType
}

/** 数据集请求参数 */
export interface DatasetReq {
  name: string
  description?: string
  type: DatasetType
  file?: File
}

/** 数据集响应 */
export interface DatasetResp {
  id: string
  name: string
  description?: string
  type: DatasetType
  fileName: string
  fileSize: number
  sampleCount: number
  columns?: string[]
  createTime: string
  createUser: string
}

/** 数据集样本 */
export interface DatasetSample {
  instruction?: string
  input?: string
  output?: string
  conversations?: Array<{
    role: string
    content: string
  }>
}

/** 基座模型 */
export interface BaseModel {
  id: string
  name: string
  displayName: string
  size: string
  description?: string
  path: string
}

