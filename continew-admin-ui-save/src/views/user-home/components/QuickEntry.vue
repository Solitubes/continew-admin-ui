<template>
  <a-card
    class="general-card"
    title="快捷操作"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '15px 10px 10px' }"
  >
    <a-row>
      <a-col v-for="item in entries" :key="item.path" :span="8">
        <div class="wrapper" @click="router.push(item.path)">
          <div class="icon">
            <component :is="item.icon" />
          </div>
          <div class="text">{{ item.title }}</div>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import {
  IconUser,
  IconMessage,
  IconNotification,
  IconLock,
  IconFile,
  IconSettings,
} from '@arco-design/web-vue/es/icon'

const router = useRouter()

const entries = [
  { title: '个人中心', path: '/user/profile', icon: IconUser },
  { title: '消息中心', path: '/user/message', icon: IconMessage },
  { title: '我的公告', path: '/user/message?tab=notice', icon: IconNotification },
  { title: '修改密码', path: '/user/profile', icon: IconLock },
  { title: '我的文件', path: '/system/file', icon: IconFile },
  { title: '账号设置', path: '/user/profile', icon: IconSettings },
]
</script>

<style scoped lang="scss">
.wrapper {
  margin-bottom: 8px;
  text-align: center;
  cursor: pointer;

  &:hover {
    .icon {
      color: rgb(var(--arcoblue-6));
      background-color: #e8f3ff;
    }

    .text {
      color: rgb(var(--arcoblue-6));
    }
  }
}

.icon {
  display: inline-block;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  color: rgb(var(--dark-gray-1));
  line-height: 32px;
  font-size: 16px;
  text-align: center;
  background-color: rgb(var(--gray-1));
  border-radius: 4px;
}

.text {
  font-size: 12px;
  text-align: center;
  color: rgb(var(--gray-8));
}
</style>

