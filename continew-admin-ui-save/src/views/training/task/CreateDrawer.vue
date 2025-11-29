<template>
  <a-drawer
    v-model:visible="visible"
    title="创建训练任务"
    :width="720"
    :mask-closable="false"
    @before-ok="onSubmit"
    @cancel="onClose"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <!-- 基本信息 -->
      <a-divider orientation="left">基本信息</a-divider>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="任务名称" field="name">
            <a-input v-model="form.name" placeholder="请输入任务名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="基座模型" field="baseModel">
            <a-select v-model="form.baseModel" placeholder="请选择基座模型" allow-search>
              <a-option v-for="model in baseModels" :key="model.id" :value="model.path">
                {{ model.displayName }} ({{ model.size }})
              </a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="任务描述" field="description">
        <a-textarea v-model="form.description" placeholder="请输入任务描述" :max-length="500" show-word-limit />
      </a-form-item>
      <a-form-item label="训练数据集" field="datasetIds">
        <a-select v-model="form.datasetIds" placeholder="请选择数据集" multiple allow-search>
          <a-option v-for="ds in datasets" :key="ds.id" :value="ds.id">
            {{ ds.name }} ({{ ds.sampleCount }} 条)
          </a-option>
        </a-select>
      </a-form-item>

      <!-- 训练配置 -->
      <a-divider orientation="left">训练配置</a-divider>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="训练方法" field="trainingMethod">
            <a-select v-model="form.trainingMethod" placeholder="请选择训练方法">
              <a-option value="sft">SFT (监督微调)</a-option>
              <a-option value="rm">RM (奖励模型)</a-option>
              <a-option value="ppo">PPO (强化学习)</a-option>
              <a-option value="dpo">DPO (直接偏好优化)</a-option>
              <a-option value="pretrain">预训练</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="微调方式" field="finetuneType">
            <a-select v-model="form.finetuneType" placeholder="请选择微调方式">
              <a-option value="lora">LoRA</a-option>
              <a-option value="qlora">QLoRA (4bit量化)</a-option>
              <a-option value="full">全量微调</a-option>
              <a-option value="freeze">冻结微调</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 超参数配置 -->
      <a-divider orientation="left">超参数配置</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="学习率" field="learningRate">
            <a-input-number
              v-model="form.learningRate"
              :min="0"
              :max="1"
              :precision="6"
              :step="0.00001"
              placeholder="如: 0.0001"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="训练轮数" field="numEpochs">
            <a-input-number v-model="form.numEpochs" :min="1" :max="100" placeholder="如: 3" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="批次大小" field="batchSize">
            <a-input-number v-model="form.batchSize" :min="1" :max="128" placeholder="如: 4" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="最大长度" field="maxLength">
            <a-input-number v-model="form.maxLength" :min="128" :max="8192" :step="128" placeholder="如: 2048" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="梯度累积步数" field="gradientAccumulationSteps">
            <a-input-number v-model="form.gradientAccumulationSteps" :min="1" :max="64" placeholder="如: 4" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="预热比例" field="warmupRatio">
            <a-input-number v-model="form.warmupRatio" :min="0" :max="1" :precision="2" :step="0.01" placeholder="如: 0.1" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- LoRA 参数 -->
      <template v-if="['lora', 'qlora'].includes(form.finetuneType)">
        <a-divider orientation="left">LoRA 参数</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="LoRA Rank" field="loraRank">
              <a-input-number v-model="form.loraRank" :min="1" :max="256" placeholder="如: 8" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="LoRA Alpha" field="loraAlpha">
              <a-input-number v-model="form.loraAlpha" :min="1" :max="512" placeholder="如: 16" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="LoRA Dropout" field="loraDropout">
              <a-input-number v-model="form.loraDropout" :min="0" :max="1" :precision="2" :step="0.05" placeholder="如: 0.05" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>

      <!-- 高级选项 -->
      <a-divider orientation="left">高级选项</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="混合精度">
            <a-radio-group v-model="precisionType">
              <a-radio value="fp32">FP32</a-radio>
              <a-radio value="fp16">FP16</a-radio>
              <a-radio value="bf16">BF16</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="权重衰减" field="weightDecay">
            <a-input-number v-model="form.weightDecay" :min="0" :max="1" :precision="4" :step="0.001" placeholder="如: 0.01" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { type FormInstance, Message } from '@arco-design/web-vue'
import { createTask, listDataset, listBaseModels, type DatasetResp, type BaseModel, type TaskReq } from '@/apis/training'

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const formRef = ref<FormInstance>()

const defaultForm: TaskReq = {
  name: '',
  description: '',
  baseModel: '',
  datasetIds: [],
  trainingMethod: 'sft',
  finetuneType: 'lora',
  learningRate: 0.0001,
  numEpochs: 3,
  batchSize: 4,
  maxLength: 2048,
  loraRank: 8,
  loraAlpha: 16,
  loraDropout: 0.05,
  warmupRatio: 0.1,
  weightDecay: 0.01,
  gradientAccumulationSteps: 4,
  fp16: false,
  bf16: true,
}

const form = reactive<TaskReq>({ ...defaultForm })
const precisionType = ref('bf16')

const rules: FormInstance['rules'] = {
  name: [{ required: true, message: '请输入任务名称' }],
  baseModel: [{ required: true, message: '请选择基座模型' }],
  datasetIds: [{ required: true, message: '请选择数据集' }],
  trainingMethod: [{ required: true, message: '请选择训练方法' }],
  finetuneType: [{ required: true, message: '请选择微调方式' }],
  learningRate: [{ required: true, message: '请输入学习率' }],
  numEpochs: [{ required: true, message: '请输入训练轮数' }],
  batchSize: [{ required: true, message: '请输入批次大小' }],
  maxLength: [{ required: true, message: '请输入最大长度' }],
}

// 基座模型列表
const baseModels = ref<BaseModel[]>([])
// 数据集列表
const datasets = ref<DatasetResp[]>([])

const loadBaseModels = async () => {
  try {
    const { data } = await listBaseModels()
    baseModels.value = data
  } catch {
    // 使用模拟数据
    baseModels.value = [
      { id: '1', name: 'llama-2-7b', displayName: 'LLaMA-2', size: '7B', path: 'meta-llama/Llama-2-7b-hf', description: '' },
      { id: '2', name: 'llama-2-13b', displayName: 'LLaMA-2', size: '13B', path: 'meta-llama/Llama-2-13b-hf', description: '' },
      { id: '3', name: 'qwen-7b', displayName: 'Qwen', size: '7B', path: 'Qwen/Qwen-7B', description: '' },
      { id: '4', name: 'qwen-14b', displayName: 'Qwen', size: '14B', path: 'Qwen/Qwen-14B', description: '' },
      { id: '5', name: 'chatglm3-6b', displayName: 'ChatGLM3', size: '6B', path: 'THUDM/chatglm3-6b', description: '' },
      { id: '6', name: 'baichuan2-7b', displayName: 'Baichuan2', size: '7B', path: 'baichuan-inc/Baichuan2-7B-Base', description: '' },
    ]
  }
}

const loadDatasets = async () => {
  try {
    const { data } = await listDataset({ page: 1, size: 100 })
    datasets.value = data.list || []
  } catch {
    // 使用模拟数据
    datasets.value = [
      { id: '1', name: 'alpaca_zh', description: '中文Alpaca数据集', type: 'alpaca', fileName: 'alpaca_zh.json', fileSize: 1024000, sampleCount: 52000, createTime: '2024-01-01', createUser: 'admin' },
      { id: '2', name: 'belle_1m', description: 'BELLE数据集', type: 'alpaca', fileName: 'belle_1m.json', fileSize: 5120000, sampleCount: 100000, createTime: '2024-01-02', createUser: 'admin' },
    ]
  }
}

const open = () => {
  Object.assign(form, defaultForm)
  precisionType.value = 'bf16'
  visible.value = true
  loadBaseModels()
  loadDatasets()
}

const onClose = () => {
  formRef.value?.resetFields()
  visible.value = false
}

const onSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return false

    // 设置精度类型
    form.fp16 = precisionType.value === 'fp16'
    form.bf16 = precisionType.value === 'bf16'

    await createTask(form)
    Message.success('创建成功，任务已加入队列')
    emit('success')
    onClose()
    return true
  } catch {
    return false
  }
}

defineExpose({ open })
</script>

<style scoped lang="scss">
:deep(.arco-divider-text) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.arco-form-item) {
  margin-bottom: 16px;
}
</style>

