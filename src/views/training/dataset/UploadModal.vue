<template>
  <a-modal
    v-model:visible="visible"
    title="上传数据集"
    :width="600"
    :mask-closable="false"
    @before-ok="onSubmit"
    @cancel="onClose"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="数据集名称" field="name">
        <a-input v-model="form.name" placeholder="请输入数据集名称" />
      </a-form-item>

      <a-form-item label="数据类型" field="type">
        <a-radio-group v-model="form.type">
          <a-radio value="alpaca">
            <template #radio="{ checked }">
              <a-card :class="['type-card', { 'type-card-checked': checked }]" hoverable>
                <div class="type-card-content">
                  <div class="type-card-title">Alpaca 格式</div>
                  <div class="type-card-desc">instruction / input / output</div>
                </div>
              </a-card>
            </template>
          </a-radio>
          <a-radio value="sharegpt">
            <template #radio="{ checked }">
              <a-card :class="['type-card', { 'type-card-checked': checked }]" hoverable>
                <div class="type-card-content">
                  <div class="type-card-title">ShareGPT 格式</div>
                  <div class="type-card-desc">conversations 多轮对话</div>
                </div>
              </a-card>
            </template>
          </a-radio>
          <a-radio value="custom">
            <template #radio="{ checked }">
              <a-card :class="['type-card', { 'type-card-checked': checked }]" hoverable>
                <div class="type-card-content">
                  <div class="type-card-title">自定义格式</div>
                  <div class="type-card-desc">需配置字段映射</div>
                </div>
              </a-card>
            </template>
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="数据集描述" field="description">
        <a-textarea v-model="form.description" placeholder="请输入数据集描述" :max-length="200" show-word-limit />
      </a-form-item>

      <a-form-item label="上传文件" field="file" required>
        <a-upload
          :auto-upload="false"
          :limit="1"
          accept=".json,.jsonl,.csv"
          :file-list="fileList"
          @change="onFileChange"
        >
          <template #upload-button>
            <a-button type="outline" long>
              <template #icon><icon-upload /></template>
              选择文件
            </a-button>
          </template>
        </a-upload>
        <div class="upload-tip">支持 JSON、JSONL、CSV 格式，文件大小不超过 500MB</div>
      </a-form-item>

      <!-- 格式示例 -->
      <a-collapse :default-active-key="[]" :bordered="false">
        <a-collapse-item key="example" header="查看格式示例">
          <a-tabs>
            <a-tab-pane key="alpaca" title="Alpaca 格式">
              <pre class="code-block">{{ alpacaExample }}</pre>
            </a-tab-pane>
            <a-tab-pane key="sharegpt" title="ShareGPT 格式">
              <pre class="code-block">{{ sharegptExample }}</pre>
            </a-tab-pane>
          </a-tabs>
        </a-collapse-item>
      </a-collapse>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { type FormInstance, Message, type FileItem } from '@arco-design/web-vue'
import { uploadDataset } from '@/apis/training'

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const formRef = ref<FormInstance>()
const fileList = ref<FileItem[]>([])

const form = reactive({
  name: '',
  type: 'alpaca' as 'alpaca' | 'sharegpt' | 'custom',
  description: '',
})

const rules: FormInstance['rules'] = {
  name: [{ required: true, message: '请输入数据集名称' }],
  type: [{ required: true, message: '请选择数据类型' }],
}

const alpacaExample = `[
  {
    "instruction": "请解释什么是机器学习",
    "input": "",
    "output": "机器学习是人工智能的一个分支..."
  },
  {
    "instruction": "将以下文本翻译成英文",
    "input": "今天天气真好",
    "output": "The weather is really nice today."
  }
]`

const sharegptExample = `[
  {
    "conversations": [
      { "role": "user", "content": "你好" },
      { "role": "assistant", "content": "你好！有什么可以帮助你的吗？" },
      { "role": "user", "content": "请介绍一下自己" },
      { "role": "assistant", "content": "我是一个AI助手..." }
    ]
  }
]`

const onFileChange = (files: FileItem[]) => {
  fileList.value = files
}

const open = () => {
  form.name = ''
  form.type = 'alpaca'
  form.description = ''
  fileList.value = []
  visible.value = true
}

const onClose = () => {
  formRef.value?.resetFields()
  fileList.value = []
  visible.value = false
}

const onSubmit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return false

    if (fileList.value.length === 0) {
      Message.warning('请选择要上传的文件')
      return false
    }

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('type', form.type)
    formData.append('description', form.description)
    formData.append('file', fileList.value[0].file as File)

    await uploadDataset(formData)
    Message.success('上传成功')
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
:deep(.arco-radio-group) {
  display: flex;
  gap: 12px;

  .arco-radio {
    margin-right: 0;
    padding: 0;
  }
}

.type-card {
  width: 160px;
  cursor: pointer;
  transition: all 0.2s;

  &-checked {
    border-color: rgb(var(--primary-6));
    background: rgba(var(--primary-6), 0.05);
  }

  &-content {
    text-align: center;
  }

  &-title {
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 4px;
  }

  &-desc {
    font-size: 12px;
    color: var(--color-text-3);
  }
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-3);
}

.code-block {
  background: var(--color-fill-2);
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}
</style>

