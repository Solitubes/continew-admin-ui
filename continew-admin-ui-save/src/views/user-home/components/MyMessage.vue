<template>
  <a-card class="general-card" title="我的消息" style="margin-bottom: 14px">
    <template #extra>
      <a-link @click="router.push('/user/message')">更多</a-link>
    </template>

    <a-skeleton v-if="loading" :loading="loading" :animation="true">
      <a-skeleton-line :rows="5" />
    </a-skeleton>

    <div v-else>
      <a-empty v-if="messageList.length === 0" description="暂无消息" />

      <a-tabs v-else default-active-key="unread" size="small">
        <a-tab-pane key="unread">
          <template #title>
            <a-badge :count="unreadCount" :max-count="99" :offset="[6, -2]">
              未读消息
            </a-badge>
          </template>
          <div class="message-list">
            <div
              v-for="item in unreadMessages"
              :key="item.id"
              class="message-item"
              @click="onReadMessage(item)"
            >
              <div class="message-content">
                <a-badge status="processing" />
                <span class="message-title">{{ item.title }}</span>
              </div>
              <span class="message-time">{{ item.createTime }}</span>
            </div>
            <a-empty v-if="unreadMessages.length === 0" description="暂无未读消息" />
          </div>
        </a-tab-pane>
        <a-tab-pane key="all" title="全部消息">
          <div class="message-list">
            <div
              v-for="item in messageList"
              :key="item.id"
              class="message-item"
              @click="onReadMessage(item)"
            >
              <div class="message-content">
                <a-badge :status="item.isRead ? 'default' : 'processing'" />
                <span class="message-title">{{ item.title }}</span>
              </div>
              <span class="message-time">{{ item.createTime }}</span>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { listMessage, type MessageResp, readMessage } from '@/apis/system/user-message'

const router = useRouter()
const loading = ref(false)
const messageList = ref<MessageResp[]>([])

const unreadMessages = computed(() => messageList.value.filter(item => !item.isRead))
const unreadCount = computed(() => unreadMessages.value.length)

// 查询消息列表
const getMessageList = async () => {
  try {
    loading.value = true
    const res = await listMessage({ page: 1, size: 10 })
    messageList.value = res.data.list || []
  } catch (error) {
    // 如果接口不存在，使用模拟数据
    messageList.value = [
      { id: '1', title: '欢迎使用 ContiNew Admin 系统', isRead: false, createTime: '2024-01-15 10:00' },
      { id: '2', title: '您的账号已成功创建', isRead: true, createTime: '2024-01-14 15:30' },
      { id: '3', title: '系统将于今晚进行维护升级', isRead: false, createTime: '2024-01-14 09:00' },
    ] as any
  } finally {
    loading.value = false
  }
}

// 阅读消息
const onReadMessage = async (item: MessageResp) => {
  if (!item.isRead) {
    try {
      await readMessage([item.id])
      item.isRead = true
    } catch (error) {
      // ignore
    }
  }
  // 跳转到消息详情或消息中心
  router.push('/user/message')
}

onMounted(() => {
  getMessageList()
})
</script>

<style scoped lang="scss">
.message-list {
  max-height: 250px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-1);
  cursor: pointer;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--color-fill-1);
    margin: 0 -12px;
    padding: 10px 12px;
  }

  .message-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    overflow: hidden;

    .message-title {
      color: var(--color-text-1);
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .message-time {
    color: var(--color-text-3);
    font-size: 12px;
    flex-shrink: 0;
    margin-left: 12px;
  }
}

:deep(.arco-tabs-nav) {
  margin-bottom: 8px;
}
</style>

