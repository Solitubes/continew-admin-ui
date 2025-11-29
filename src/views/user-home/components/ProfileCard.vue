<template>
  <a-card
    class="general-card"
    title="个人信息"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '15px 20px' }"
  >
    <template #extra>
      <a-link @click="router.push('/user/profile')">编辑</a-link>
    </template>
    <div class="profile-info">
      <div class="info-item">
        <span class="label">用户名</span>
        <span class="value">{{ userStore.username }}</span>
      </div>
      <div class="info-item">
        <span class="label">昵称</span>
        <span class="value">{{ userStore.nickname }}</span>
      </div>
      <div class="info-item">
        <span class="label">部门</span>
        <span class="value">{{ userStore.userInfo.deptName || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">邮箱</span>
        <span class="value">{{ userStore.userInfo.email || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">手机</span>
        <span class="value">{{ userStore.userInfo.phone || '-' }}</span>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
</script>

<style scoped lang="scss">
.profile-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border-1);

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: var(--color-text-3);
      font-size: 13px;
    }

    .value {
      color: var(--color-text-1);
      font-size: 13px;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>

