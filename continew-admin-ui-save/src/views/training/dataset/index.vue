<template>
  <GiPageLayout>
    <GiTable
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #top>
        <GiForm v-model="queryForm" search :columns="queryFormColumns" size="medium" @search="search" @reset="reset" />
      </template>
      <template #toolbar-left>
        <a-button type="primary" @click="onUpload">
          <template #icon><icon-upload /></template>
          <template #default>上传数据集</template>
        </a-button>
      </template>
      <template #type="{ record }">
        <a-tag :color="getTypeColor(record.type)">{{ getTypeText(record.type) }}</a-tag>
      </template>
      <template #fileSize="{ record }">
        {{ formatFileSize(record.fileSize) }}
      </template>
      <template #sampleCount="{ record }">
        <a-statistic :value="record.sampleCount" :value-style="{ fontSize: '14px' }" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link @click="onPreview(record)">预览</a-link>
          <a-link status="danger" @click="onDelete(record)">删除</a-link>
        </a-space>
      </template>
    </GiTable>

    <!-- 上传数据集弹窗 -->
    <UploadModal ref="UploadModalRef" @success="search" />
    <!-- 预览数据集抽屉 -->
    <PreviewDrawer ref="PreviewDrawerRef" />
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import UploadModal from './UploadModal.vue'
import PreviewDrawer from './PreviewDrawer.vue'
import { type DatasetResp, type DatasetType, listDataset, deleteDataset } from '@/apis/training'
import { useTable, useResetReactive } from '@/hooks'
import type { ColumnItem } from '@/components/GiForm'

defineOptions({ name: 'TrainingDataset' })

const [queryForm, resetForm] = useResetReactive({
  sort: ['createTime,desc'],
})

const queryFormColumns: ColumnItem[] = reactive([
  {
    type: 'input',
    label: '数据集名称',
    field: 'name',
    span: { xs: 24, sm: 8, xxl: 6 },
    props: {
      placeholder: '请输入数据集名称',
    },
  },
  {
    type: 'select',
    label: '数据类型',
    field: 'type',
    span: { xs: 24, sm: 8, xxl: 6 },
    props: {
      options: [
        { label: 'Alpaca 格式', value: 'alpaca' },
        { label: 'ShareGPT 格式', value: 'sharegpt' },
        { label: '自定义格式', value: 'custom' },
      ],
      placeholder: '请选择类型',
    },
  },
])

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listDataset({ ...queryForm, ...page }), { immediate: true })

const columns: TableInstance['columns'] = [
  { title: '数据集名称', dataIndex: 'name', width: 200, ellipsis: true, tooltip: true },
  { title: '描述', dataIndex: 'description', width: 250, ellipsis: true, tooltip: true },
  { title: '数据类型', dataIndex: 'type', slotName: 'type', width: 120, align: 'center' },
  { title: '文件名', dataIndex: 'fileName', width: 180, ellipsis: true, tooltip: true },
  { title: '文件大小', dataIndex: 'fileSize', slotName: 'fileSize', width: 100, align: 'right' },
  { title: '样本数量', dataIndex: 'sampleCount', slotName: 'sampleCount', width: 120, align: 'right' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', dataIndex: 'action', slotName: 'action', width: 120, align: 'center', fixed: 'right' },
]

const reset = () => {
  resetForm()
  search()
}

const getTypeColor = (type: DatasetType) => {
  const colors: Record<DatasetType, string> = {
    alpaca: 'arcoblue',
    sharegpt: 'green',
    custom: 'orange',
  }
  return colors[type]
}

const getTypeText = (type: DatasetType) => {
  const texts: Record<DatasetType, string> = {
    alpaca: 'Alpaca',
    sharegpt: 'ShareGPT',
    custom: '自定义',
  }
  return texts[type]
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

const UploadModalRef = ref<InstanceType<typeof UploadModal>>()
const onUpload = () => {
  UploadModalRef.value?.open()
}

const PreviewDrawerRef = ref<InstanceType<typeof PreviewDrawer>>()
const onPreview = (record: DatasetResp) => {
  PreviewDrawerRef.value?.open(record)
}

const onDelete = (record: DatasetResp) => {
  handleDelete(() => deleteDataset(record.id), {
    content: `确定要删除数据集「${record.name}」吗？`,
    showModal: true,
  })
}
</script>

