<template>
  <a-drawer
    v-model:visible="visible"
    title="任务详情"
    :width="640"
    :footer="false"
  >
    <a-skeleton v-if="loading" :loading="loading" :animation="true">
      <a-skeleton-line :rows="15" />
    </a-skeleton>

    <template v-else-if="detail">
      <!-- 状态卡片 -->
      <a-card class="status-card" :bordered="false">
        <a-row align="center" justify="space-between">
          <a-space size="large">
            <a-tag :color="getStatusColor(detail.status)" size="large">
              <template #icon>
                <icon-loading v-if="detail.status === 'running'" spin />
                <icon-check-circle v-else-if="detail.status === 'completed'" />
                <icon-close-circle v-else-if="detail.status === 'failed'" />
              </template>
              {{ getStatusText(detail.status) }}
            </a-tag>
            <template v-if="detail.status === 'running'">
              <a-statistic title="当前进度" :value="detail.progress" suffix="%" />
              <a-statistic title="当前轮次" :value="`${detail.currentEpoch || 0}/${detail.totalEpochs || 0}`" />
            </template>
          </a-space>
          <a-space v-if="detail.status === 'running'">
            <a-button type="outline" status="warning" @click="onCancel">取消任务</a-button>
          </a-space>
        </a-row>
        <a-progress
          v-if="detail.status === 'running'"
          :percent="detail.progress / 100"
          :stroke-width="8"
          style="margin-top: 16px"
        />
      </a-card>

      <!-- 基本信息 -->
      <a-descriptions title="基本信息" :column="2" bordered style="margin-top: 16px">
        <a-descriptions-item label="任务名称">{{ detail.name }}</a-descriptions-item>
        <a-descriptions-item label="基座模型">{{ detail.baseModel }}</a-descriptions-item>
        <a-descriptions-item label="训练方法">{{ getMethodText(detail.trainingMethod) }}</a-descriptions-item>
        <a-descriptions-item label="微调方式">{{ getFinetuneText(detail.finetuneType) }}</a-descriptions-item>
        <a-descriptions-item label="数据集" :span="2">
          <a-tag v-for="name in detail.datasetNames" :key="name" style="margin-right: 4px">{{ name }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ detail.description || '-' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 训练参数 -->
      <a-descriptions title="训练参数" :column="3" bordered style="margin-top: 16px">
        <a-descriptions-item label="学习率">{{ detail.learningRate }}</a-descriptions-item>
        <a-descriptions-item label="批次大小">{{ detail.batchSize }}</a-descriptions-item>
        <a-descriptions-item label="当前 Loss">{{ detail.loss?.toFixed(4) || '-' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 时间信息 -->
      <a-descriptions title="时间信息" :column="2" bordered style="margin-top: 16px">
        <a-descriptions-item label="创建时间">{{ detail.createTime }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ detail.createUser }}</a-descriptions-item>
        <a-descriptions-item label="开始时间">{{ detail.startTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="结束时间">{{ detail.endTime || '-' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 错误信息 -->
      <a-alert
        v-if="detail.status === 'failed' && detail.errorMessage"
        type="error"
        title="错误信息"
        style="margin-top: 16px"
      >
        {{ detail.errorMessage }}
      </a-alert>

      <!-- 输出目录 -->
      <a-descriptions v-if="detail.outputDir" title="输出信息" :column="1" bordered style="margin-top: 16px">
        <a-descriptions-item label="输出目录">
          <a-typography-text copyable>{{ detail.outputDir }}</a-typography-text>
        </a-descriptions-item>
      </a-descriptions>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import { getTask, cancelTask, type TaskResp, type TaskStatus } from '@/apis/training'

const visible = ref(false)
const loading = ref(false)
const detail = ref<TaskResp | null>(null)
const taskId = ref('')

const getStatusColor = (status: TaskStatus) => {
  const colors: Record<TaskStatus, string> = {
    pending: 'orange',
    running: 'arcoblue',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
  }
  return colors[status]
}

const getStatusText = (status: TaskStatus) => {
  const texts: Record<TaskStatus, string> = {
    pending: '排队中',
    running: '运行中',
    completed: '已完成',
    failed: '已失败',
    cancelled: '已取消',
  }
  return texts[status]
}

const getMethodText = (method: string) => {
  const texts: Record<string, string> = {
    sft: 'SFT (监督微调)',
    rm: 'RM (奖励模型)',
    ppo: 'PPO (强化学习)',
    dpo: 'DPO (直接偏好优化)',
    pretrain: '预训练',
  }
  return texts[method] || method
}

const getFinetuneText = (type: string) => {
  const texts: Record<string, string> = {
    full: '全量微调',
    freeze: '冻结微调',
    lora: 'LoRA',
    qlora: 'QLoRA',
  }
  return texts[type] || type
}

const loadDetail = async () => {
  try {
    loading.value = true
    const { data } = await getTask(taskId.value)
    detail.value = data
  } catch {
    // 使用模拟数据
    detail.value = {
      id: taskId.value,
      name: '测试训练任务',
      description: '这是一个测试任务',
      baseModel: 'Qwen/Qwen-7B',
      datasetNames: ['alpaca_zh', 'belle_1m'],
      trainingMethod: 'sft',
      finetuneType: 'lora',
      status: 'running',
      progress: 45,
      currentEpoch: 2,
      totalEpochs: 3,
      currentStep: 1500,
      totalSteps: 3000,
      loss: 1.2345,
      learningRate: 0.0001,
      batchSize: 4,
      createTime: '2024-01-15 10:00:00',
      createUser: 'admin',
      startTime: '2024-01-15 10:01:00',
    }
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  Modal.warning({
    title: '确认取消',
    content: `确定要取消训练任务「${detail.value?.name}」吗？`,
    hideCancel: false,
    onOk: async () => {
      await cancelTask(taskId.value)
      Message.success('取消成功')
      loadDetail()
    },
  })
}

const open = (id: string) => {
  taskId.value = id
  visible.value = true
  loadDetail()
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.status-card {
  background: linear-gradient(135deg, var(--color-fill-1) 0%, var(--color-fill-2) 100%);
  border-radius: 8px;
}

:deep(.arco-descriptions-title) {
  font-size: 14px;
  font-weight: 500;
}
</style>

