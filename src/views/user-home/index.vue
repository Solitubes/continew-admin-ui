<template>
  <div class="gi_page container">
    <div class="left-side">
      <!-- 欢迎区域 -->
      <div class="panel">
        <Welcome />
      </div>

      <div style="margin-top: 14px">
        <a-grid :cols="24" :col-gap="14" :row-gap="14">
          <!-- 我的待办 -->
          <a-grid-item :span="24">
            <MyTodo />
          </a-grid-item>

          <!-- 我的消息 -->
          <a-grid-item :span="24">
            <MyMessage />
          </a-grid-item>
        </a-grid>
      </div>
    </div>

    <div class="right-side">
      <a-grid :cols="24" :row-gap="14">
        <!-- 快捷入口 -->
        <a-grid-item :span="24">
          <div class="panel moduler-wrap">
            <QuickEntry />
          </div>
        </a-grid-item>

        <!-- 个人信息卡片 -->
        <a-grid-item class="panel" :span="24">
          <ProfileCard />
        </a-grid-item>

        <!-- 公告 -->
        <a-grid-item class="panel" :span="24">
          <Notice />
        </a-grid-item>

        <!-- 日历 -->
        <a-grid-item class="panel" :span="24">
          <MiniCalendar />
        </a-grid-item>
      </a-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import Welcome from '@/views/dashboard/workplace/components/Welcome.vue'
import Notice from '@/views/dashboard/workplace/components/Notice.vue'
import QuickEntry from './components/QuickEntry.vue'
import ProfileCard from './components/ProfileCard.vue'
import MyTodo from './components/MyTodo.vue'
import MyMessage from './components/MyMessage.vue'
import MiniCalendar from './components/MiniCalendar.vue'

defineOptions({ name: 'UserHome' })
</script>

<style scoped lang="scss">
.container {
  display: flex;
}

.left-side {
  flex: 1;
}

.right-side {
  width: 280px;
  margin-left: 14px;
}

.panel {
  background-color: var(--color-bg-2);
  border-radius: 4px;
  overflow: auto;
}

:deep(.panel-border) {
  margin-bottom: 0;
  border-bottom: 1px solid rgb(var(--gray-2));
}

.moduler-wrap {
  border-radius: 4px;
  background-color: var(--color-bg-2);

  :deep(.text) {
    font-size: 12px;
    text-align: center;
    color: rgb(var(--gray-8));
  }

  :deep(.wrapper) {
    margin-bottom: 8px;
    text-align: center;
    cursor: pointer;

    &:last-child {
      .text {
        margin-bottom: 0;
      }
    }

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

  :deep(.icon) {
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
}
</style>

<style lang="less" scoped>
// responsive
.mobile {
  .container {
    display: block;
  }

  .right-side {
    width: 100%;
    margin-left: 0;
    margin-top: 16px;
  }
}
</style>
