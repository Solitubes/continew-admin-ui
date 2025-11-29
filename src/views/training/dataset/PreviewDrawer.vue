<template>
  <a-drawer
    v-model:visible="visible"
    title="数据集预览"
    :width="800"
    :footer="false"
  >
    <template v-if="dataset">
      <!-- 数据集信息 -->
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="数据集名称">{{ dataset.name }}</a-descriptions-item>
        <a-descriptions-item label="数据类型">
          <a-tag :color="getTypeColor(dataset.type)">{{ getTypeText(dataset.type) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="文件名">{{ dataset.fileName }}</a-descriptions-item>
        <a-descriptions-item label="文件大小">{{ formatFileSize(dataset.fileSize) }}</a-descriptions-item>
        <a-descriptions-item label="样本数量">{{ dataset.sampleCount.toLocaleString() }} 条</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ dataset.createTime }}</a-descriptions-item>
        <a-descriptions-item label="描述" :span="2">{{ dataset.description || '-' }}</a-descriptions-item>
      </a-descriptions>

      <!-- 数据预览 -->
      <a-divider orientation="left">数据预览</a-divider>

      <a-skeleton v-if="loading" :loading="loading" :animation="true">
        <a-skeleton-line :rows="10" />
      </a-skeleton>

      <template v-else>
        <!-- Alpaca 格式 -->
        <template v-if="dataset.type === 'alpaca'">
          <a-collapse :default-active-key="[0]" accordion>
            <a-collapse-item v-for="(sample, index) in samples" :key="index" :header="`样本 ${index + 1}`">
              <div class="sample-item">
                <div class="sample-field">
                  <span class="field-label">Instruction:</span>
                  <div class="field-value">{{ sample.instruction }}</div>
                </div>
                <div v-if="sample.input" class="sample-field">
                  <span class="field-label">Input:</span>
                  <div class="field-value">{{ sample.input }}</div>
                </div>
                <div class="sample-field">
                  <span class="field-label">Output:</span>
                  <div class="field-value">{{ sample.output }}</div>
                </div>
              </div>
            </a-collapse-item>
          </a-collapse>
        </template>

        <!-- ShareGPT 格式 -->
        <template v-else-if="dataset.type === 'sharegpt'">
          <a-collapse :default-active-key="[0]" accordion>
            <a-collapse-item v-for="(sample, index) in samples" :key="index" :header="`对话 ${index + 1}`">
              <div class="conversation-list">
                <div
                  v-for="(msg, msgIndex) in sample.conversations"
                  :key="msgIndex"
                  :class="['conversation-item', `role-${msg.role}`]"
                >
                  <div class="role-tag">
                    <a-tag :color="msg.role === 'user' ? 'arcoblue' : 'green'">
                      {{ msg.role === 'user' ? '用户' : '助手' }}
                    </a-tag>
                  </div>
                  <div class="message-content">{{ msg.content }}</div>
                </div>
              </div>
            </a-collapse-item>
          </a-collapse>
        </template>

        <!-- 自定义格式 -->
        <template v-else>
          <a-table :data="samples" :columns="customColumns" :pagination="false" size="small" />
        </template>

        <!-- 分页 -->
        <div class="preview-pagination">
          <a-pagination
            v-model:current="currentPage"
            :total="dataset.sampleCount"
            :page-size="pageSize"
            show-total
            @change="loadSamples"
          />
        </div>
      </template>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { previewDataset, type DatasetResp, type DatasetSample, type DatasetType } from '@/apis/training'

const visible = ref(false)
const loading = ref(false)
const dataset = ref<DatasetResp | null>(null)
const samples = ref<DatasetSample[]>([])
const currentPage = ref(1)
const pageSize = 10

const customColumns = computed(() => {
  if (samples.value.length === 0) return []
  const firstSample = samples.value[0]
  return Object.keys(firstSample).map(key => ({
    title: key,
    dataIndex: key,
    ellipsis: true,
    tooltip: true,
  }))
})

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

const loadSamples = async () => {
  if (!dataset.value) return
  try {
    loading.value = true
    const { data } = await previewDataset(dataset.value.id, { page: currentPage.value, size: pageSize })
    samples.value = data.list || []
  } catch {
    // 模拟数据
    if (dataset.value.type === 'alpaca') {
      samples.value = [
        { instruction: '请解释什么是机器学习？', input: '', output: '机器学习是人工智能的一个分支，它使计算机系统能够从数据中学习并改进，而无需进行明确的编程。通过机器学习，计算机可以识别模式、做出决策，并随着时间的推移不断优化其性能。' },
        { instruction: '将以下中文翻译成英文', input: '今天天气真好，我想出去散步。', output: 'The weather is really nice today, I want to go for a walk.' },
        { instruction: '写一首关于春天的诗', input: '', output: '春风拂面暖阳照，\n柳絮飘飞燕归巢。\n花开满园香四溢，\n万物复苏乐逍遥。' },
      ]
    } else if (dataset.value.type === 'sharegpt') {
      samples.value = [
        {
          conversations: [
            { role: 'user', content: '你好，请介绍一下自己' },
            { role: 'assistant', content: '你好！我是一个AI助手，很高兴为你服务。我可以回答问题、提供信息、帮助完成各种任务。有什么我可以帮助你的吗？' },
            { role: 'user', content: '你能做什么？' },
            { role: 'assistant', content: '我可以帮你完成很多任务，比如：\n1. 回答各种知识问题\n2. 帮助写作和编辑文本\n3. 进行翻译\n4. 编程辅助\n5. 数学计算\n6. 提供建议和想法等' },
          ],
        },
        {
          conversations: [
            { role: 'user', content: '帮我写一段Python代码，计算斐波那契数列' },
            { role: 'assistant', content: '好的，这是一个计算斐波那契数列的Python函数：\n\n```python\ndef fibonacci(n):\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    elif n == 2:\n        return [0, 1]\n    else:\n        fib = [0, 1]\n        for i in range(2, n):\n            fib.append(fib[i-1] + fib[i-2])\n        return fib\n\n# 使用示例\nprint(fibonacci(10))\n```\n\n这个函数会返回前n个斐波那契数。' },
          ],
        },
      ]
    }
  } finally {
    loading.value = false
  }
}

const open = (data: DatasetResp) => {
  dataset.value = data
  currentPage.value = 1
  visible.value = true
  loadSamples()
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.sample-item {
  .sample-field {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .field-label {
      display: inline-block;
      font-weight: 500;
      color: rgb(var(--primary-6));
      margin-bottom: 4px;
    }

    .field-value {
      background: var(--color-fill-1);
      padding: 8px 12px;
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.6;
    }
  }
}

.conversation-list {
  .conversation-item {
    display: flex;
    margin-bottom: 12px;
    padding: 8px;
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    &.role-user {
      background: rgba(var(--primary-6), 0.05);
    }

    &.role-assistant {
      background: rgba(var(--green-6), 0.05);
    }

    .role-tag {
      flex-shrink: 0;
      margin-right: 12px;
    }

    .message-content {
      flex: 1;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.6;
    }
  }
}

.preview-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>

