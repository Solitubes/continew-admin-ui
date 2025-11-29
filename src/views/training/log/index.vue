<template>
  <div class="gi_page training-log-page">
    <!-- 顶部信息栏 -->
    <a-card :bordered="false" class="header-card">
      <a-row justify="space-between" align="center">
        <a-space size="large">
          <a-button @click="goBack">
            <template #icon><icon-left /></template>
            返回
          </a-button>
          <a-divider direction="vertical" />
          <span class="task-name">{{ taskName }}</span>
          <a-tag :color="getStatusColor(taskStatus)">{{ getStatusText(taskStatus) }}</a-tag>
        </a-space>
        <a-space>
          <a-switch v-model="autoRefresh" checked-text="自动刷新" unchecked-text="自动刷新" />
          <a-button type="outline" @click="loadLogs">
            <template #icon><icon-refresh /></template>
            刷新
          </a-button>
          <a-button type="outline" @click="downloadLogs">
            <template #icon><icon-download /></template>
            下载日志
          </a-button>
        </a-space>
      </a-row>
    </a-card>

    <a-row :gutter="16" style="margin-top: 16px; flex: 1; overflow: hidden;">
      <!-- 左侧：训练指标图表 -->
      <a-col :span="16" style="height: 100%; display: flex; flex-direction: column;">
        <a-card title="训练指标" :bordered="false" style="flex: 1; display: flex; flex-direction: column;">
          <template #extra>
            <a-radio-group v-model="chartType" type="button" size="small">
              <a-radio value="loss">Loss</a-radio>
              <a-radio value="lr">学习率</a-radio>
            </a-radio-group>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </a-card>
      </a-col>

      <!-- 右侧：实时日志 -->
      <a-col :span="8" style="height: 100%; display: flex; flex-direction: column;">
        <a-card title="实时日志" :bordered="false" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
          <template #extra>
            <a-select v-model="logLevel" size="small" style="width: 100px">
              <a-option value="all">全部</a-option>
              <a-option value="info">Info</a-option>
              <a-option value="warning">Warning</a-option>
              <a-option value="error">Error</a-option>
            </a-select>
          </template>
          <div ref="logContainerRef" class="log-container">
            <div
              v-for="log in filteredLogs"
              :key="log.id"
              :class="['log-item', `log-${log.level}`]"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span :class="['log-level', `level-${log.level}`]">[{{ log.level.toUpperCase() }}]</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <a-empty v-if="logs.length === 0" description="暂无日志" />
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getTaskLogs, getTaskMetrics, getTask, type TaskLog, type TaskMetrics, type TaskStatus } from '@/apis/training'

defineOptions({ name: 'TrainingLog' })

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.query.taskId as string)
const taskName = ref(route.query.taskName as string || '训练任务')
const taskStatus = ref<TaskStatus>('running')

const autoRefresh = ref(true)
const logLevel = ref('all')
const chartType = ref('loss')

const logs = ref<TaskLog[]>([])
const metrics = ref<TaskMetrics[]>([])

const chartRef = ref<HTMLElement>()
const logContainerRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

const filteredLogs = computed(() => {
  if (logLevel.value === 'all') return logs.value
  return logs.value.filter(log => log.level === logLevel.value)
})

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

const formatTime = (timestamp: string) => {
  return dayjs(timestamp).format('HH:mm:ss')
}

const goBack = () => {
  router.push('/training/task')
}

const loadTaskInfo = async () => {
  try {
    const { data } = await getTask(taskId.value)
    taskName.value = data.name
    taskStatus.value = data.status
  } catch {
    // ignore
  }
}

const loadLogs = async () => {
  try {
    const { data } = await getTaskLogs(taskId.value, { limit: 200 })
    logs.value = data
  } catch {
    // 模拟数据
    const mockLogs: TaskLog[] = []
    const levels: Array<'info' | 'warning' | 'error'> = ['info', 'info', 'info', 'info', 'warning', 'error']
    const messages = [
      '开始加载模型...',
      '模型加载完成，参数量: 7B',
      '开始加载数据集...',
      '数据集加载完成，样本数: 52000',
      '开始训练...',
      'Epoch 1/3, Step 100/3000, Loss: 2.3456, LR: 0.0001',
      'Epoch 1/3, Step 200/3000, Loss: 2.1234, LR: 0.0001',
      'Epoch 1/3, Step 300/3000, Loss: 1.9876, LR: 0.0001',
      '保存检查点: checkpoint-300',
      'Epoch 1/3, Step 400/3000, Loss: 1.8765, LR: 0.00009',
      'GPU 显存使用: 18.5GB / 24GB',
      'Epoch 1/3, Step 500/3000, Loss: 1.7654, LR: 0.00009',
    ]
    for (let i = 0; i < messages.length; i++) {
      mockLogs.push({
        id: String(i),
        taskId: taskId.value,
        level: levels[Math.floor(Math.random() * 4)] || 'info',
        message: messages[i],
        timestamp: dayjs().subtract(messages.length - i, 'minute').toISOString(),
      })
    }
    logs.value = mockLogs
  }
  // 滚动到底部
  nextTick(() => {
    if (logContainerRef.value) {
      logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
    }
  })
}

const loadMetrics = async () => {
  try {
    const { data } = await getTaskMetrics(taskId.value)
    metrics.value = data
  } catch {
    // 模拟数据
    const mockMetrics: TaskMetrics[] = []
    for (let i = 0; i < 50; i++) {
      mockMetrics.push({
        step: i * 100,
        epoch: Math.floor(i / 20) + 1,
        loss: 2.5 - i * 0.03 + Math.random() * 0.1,
        learningRate: 0.0001 * (1 - i * 0.01),
        timestamp: dayjs().subtract(50 - i, 'minute').toISOString(),
      })
    }
    metrics.value = mockMetrics
  }
  updateChart()
}

const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const xData = metrics.value.map(m => m.step)
  const yData = chartType.value === 'loss'
    ? metrics.value.map(m => m.loss)
    : metrics.value.map(m => m.learningRate)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: 'Step',
      data: xData,
    },
    yAxis: {
      type: 'value',
      name: chartType.value === 'loss' ? 'Loss' : 'Learning Rate',
    },
    series: [
      {
        name: chartType.value === 'loss' ? 'Loss' : 'Learning Rate',
        type: 'line',
        smooth: true,
        data: yData,
        itemStyle: {
          color: chartType.value === 'loss' ? '#165DFF' : '#00B42A',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: chartType.value === 'loss' ? 'rgba(22, 93, 255, 0.3)' : 'rgba(0, 180, 42, 0.3)' },
            { offset: 1, color: chartType.value === 'loss' ? 'rgba(22, 93, 255, 0.05)' : 'rgba(0, 180, 42, 0.05)' },
          ]),
        },
      },
    ],
  }
  chart.setOption(option)
}

const downloadLogs = () => {
  const content = logs.value.map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`).join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `training_log_${taskId.value}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = setInterval(() => {
    if (autoRefresh.value && taskStatus.value === 'running') {
      loadLogs()
      loadMetrics()
      loadTaskInfo()
    }
  }, 5000)
}

watch(chartType, () => {
  updateChart()
})

watch(autoRefresh, (val) => {
  if (val) {
    startAutoRefresh()
  } else if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

onMounted(() => {
  loadTaskInfo()
  loadLogs()
  loadMetrics()
  nextTick(() => {
    initChart()
  })
  startAutoRefresh()
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (chart) {
    chart.dispose()
    chart = null
  }
})

// 监听窗口大小变化
window.addEventListener('resize', () => {
  chart?.resize()
})
</script>

<style scoped lang="scss">
.training-log-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-card {
  flex-shrink: 0;

  .task-name {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-1);
  }
}

.chart-container {
  flex: 1;
  min-height: 300px;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  background: var(--color-fill-1);
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.8;
}

.log-item {
  padding: 2px 0;

  &.log-warning {
    background: rgba(var(--warning-6), 0.1);
  }

  &.log-error {
    background: rgba(var(--danger-6), 0.1);
  }

  .log-time {
    color: var(--color-text-3);
    margin-right: 8px;
  }

  .log-level {
    margin-right: 8px;
    font-weight: 500;

    &.level-info {
      color: rgb(var(--primary-6));
    }

    &.level-warning {
      color: rgb(var(--warning-6));
    }

    &.level-error {
      color: rgb(var(--danger-6));
    }
  }

  .log-message {
    color: var(--color-text-1);
  }
}
</style>

