<template>
  <GiPageLayout>
    <GiTable
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #top>
        <GiForm v-model="queryForm" search :columns="queryFormColumns" size="medium" @search="search" @reset="reset" />
      </template>
      <template #toolbar-left>
        <a-button type="primary" @click="onCreate">
          <template #icon><icon-plus /></template>
          <template #default>创建任务</template>
        </a-button>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          <template #icon>
            <icon-loading v-if="record.status === 'running'" spin />
            <icon-clock-circle v-else-if="record.status === 'pending'" />
            <icon-check-circle v-else-if="record.status === 'completed'" />
            <icon-close-circle v-else-if="record.status === 'failed'" />
            <icon-minus-circle v-else-if="record.status === 'cancelled'" />
          </template>
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #progress="{ record }">
        <a-progress
          v-if="record.status === 'running'"
          :percent="record.progress / 100"
          :status="record.status === 'failed' ? 'danger' : 'normal'"
          size="small"
        />
        <span v-else-if="record.status === 'completed'" style="color: rgb(var(--green-6))">100%</span>
        <span v-else>-</span>
      </template>
      <template #trainingMethod="{ record }">
        <a-tag>{{ getMethodText(record.trainingMethod) }}</a-tag>
      </template>
      <template #finetuneType="{ record }">
        <a-tag color="arcoblue">{{ getFinetuneText(record.finetuneType) }}</a-tag>
      </template>
      <template #loss="{ record }">
        <span v-if="record.loss">{{ record.loss.toFixed(4) }}</span>
        <span v-else>-</span>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link @click="onDetail(record)">详情</a-link>
          <a-link @click="onViewLog(record)">日志</a-link>
          <a-link
            v-if="record.status === 'running'"
            status="warning"
            @click="onCancel(record)"
          >取消</a-link>
          <a-link
            v-if="['completed', 'failed', 'cancelled'].includes(record.status)"
            status="danger"
            @click="onDelete(record)"
          >删除</a-link>
        </a-space>
      </template>
    </GiTable>

    <!-- 创建任务抽屉 -->
    <CreateDrawer ref="CreateDrawerRef" @success="search" />
    <!-- 任务详情抽屉 -->
    <DetailDrawer ref="DetailDrawerRef" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import CreateDrawer from './CreateDrawer.vue'
import DetailDrawer from './DetailDrawer.vue'
import { type TaskResp, type TaskStatus, listTask, cancelTask, deleteTask } from '@/apis/training'
import { useTable, useResetReactive } from '@/hooks'
import { Modal, Message } from '@arco-design/web-vue'
import type { ColumnItem } from '@/components/GiForm'

defineOptions({ name: 'TrainingTask' })

const router = useRouter()

const [queryForm, resetForm] = useResetReactive({
  sort: ['createTime,desc'],
})

const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '任务名称',
    field: 'name',
    span: { xs: 24, sm: 8, xxl: 6 },
    props: {
      placeholder: '请输入任务名称',
    },
  },
  {
    type: 'select',
    label: '状态',
    field: 'status',
    span: { xs: 24, sm: 8, xxl: 6 },
    props: {
      options: [
        { label: '排队中', value: 'pending' },
        { label: '运行中', value: 'running' },
        { label: '已完成', value: 'completed' },
        { label: '已失败', value: 'failed' },
        { label: '已取消', value: 'cancelled' },
      ],
      placeholder: '请选择状态',
    },
  },
])

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listTask({ ...queryForm, ...page }), { immediate: true })

const columns: TableInstance['columns'] = [
  { title: '任务名称', dataIndex: 'name', width: 200, ellipsis: true, tooltip: true },
  { title: '基座模型', dataIndex: 'baseModel', width: 180, ellipsis: true, tooltip: true },
  { title: '训练方法', dataIndex: 'trainingMethod', slotName: 'trainingMethod', width: 100, align: 'center' },
  { title: '微调方式', dataIndex: 'finetuneType', slotName: 'finetuneType', width: 100, align: 'center' },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 120, align: 'center' },
  { title: '进度', dataIndex: 'progress', slotName: 'progress', width: 150 },
  { title: 'Loss', dataIndex: 'loss', slotName: 'loss', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', dataIndex: 'action', slotName: 'action', width: 160, align: 'center', fixed: 'right' },
]

const reset = () => {
  resetForm()
  search()
}

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
    sft: 'SFT',
    rm: 'RM',
    ppo: 'PPO',
    dpo: 'DPO',
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

const CreateDrawerRef = ref<InstanceType<typeof CreateDrawer>>()
const onCreate = () => {
  CreateDrawerRef.value?.open()
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
const onDetail = (record: TaskResp) => {
  DetailDrawerRef.value?.open(record.id)
}

const onViewLog = (record: TaskResp) => {
  router.push({ path: '/training/log', query: { taskId: record.id, taskName: record.name } })
}

const onCancel = (record: TaskResp) => {
  Modal.warning({
    title: '确认取消',
    content: `确定要取消训练任务「${record.name}」吗？`,
    hideCancel: false,
    onOk: async () => {
      await cancelTask(record.id)
      Message.success('取消成功')
      search()
    },
  })
}

const onDelete = (record: TaskResp) => {
  handleDelete(() => deleteTask(record.id), {
    content: `确定要删除训练任务「${record.name}」吗？`,
    showModal: true,
  })
}
</script>

