<template>
  <a-card class="general-card" title="我的待办">
    <template #extra>
      <a-space>
        <a-button type="text" size="small" @click="showAddModal = true">
          <template #icon><icon-plus /></template>
          添加
        </a-button>
      </a-space>
    </template>

    <a-empty v-if="todoList.length === 0" description="暂无待办事项" />

    <div v-else class="todo-list">
      <div
        v-for="(item, index) in todoList"
        :key="index"
        :class="['todo-item', { completed: item.completed }]"
      >
        <a-checkbox v-model="item.completed" @change="saveTodos">
          <span :class="{ 'line-through': item.completed }">{{ item.title }}</span>
        </a-checkbox>
        <div class="todo-actions">
          <a-tag v-if="item.priority === 'high'" color="red" size="small">紧急</a-tag>
          <a-tag v-else-if="item.priority === 'medium'" color="orange" size="small">重要</a-tag>
          <icon-delete class="delete-icon" @click="deleteTodo(index)" />
        </div>
      </div>
    </div>

    <!-- 添加待办弹窗 -->
    <a-modal v-model:visible="showAddModal" title="添加待办" @ok="addTodo" @cancel="resetForm">
      <a-form :model="newTodo" layout="vertical">
        <a-form-item label="待办内容" required>
          <a-input v-model="newTodo.title" placeholder="请输入待办内容" />
        </a-form-item>
        <a-form-item label="优先级">
          <a-radio-group v-model="newTodo.priority">
            <a-radio value="low">普通</a-radio>
            <a-radio value="medium">重要</a-radio>
            <a-radio value="high">紧急</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'

interface TodoItem {
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createTime: string
}

// 使用 localStorage 持久化待办列表
const todoList = useStorage<TodoItem[]>('user-todo-list', [
  { title: '完善个人信息', completed: false, priority: 'medium', createTime: new Date().toISOString() },
  { title: '查看系统公告', completed: false, priority: 'low', createTime: new Date().toISOString() },
  { title: '修改登录密码', completed: false, priority: 'high', createTime: new Date().toISOString() },
])

const showAddModal = ref(false)
const newTodo = reactive({
  title: '',
  priority: 'low' as 'low' | 'medium' | 'high',
})

const addTodo = () => {
  if (!newTodo.title.trim()) {
    return
  }
  todoList.value.unshift({
    title: newTodo.title,
    completed: false,
    priority: newTodo.priority,
    createTime: new Date().toISOString(),
  })
  resetForm()
  showAddModal.value = false
}

const deleteTodo = (index: number) => {
  todoList.value.splice(index, 1)
}

const resetForm = () => {
  newTodo.title = ''
  newTodo.priority = 'low'
}

const saveTodos = () => {
  // useStorage 会自动保存，这里可以添加额外逻辑
}
</script>

<style scoped lang="scss">
.todo-list {
  max-height: 300px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-1);

  &:last-child {
    border-bottom: none;
  }

  &.completed {
    opacity: 0.6;
  }

  .line-through {
    text-decoration: line-through;
    color: var(--color-text-3);
  }

  .todo-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .delete-icon {
      cursor: pointer;
      color: var(--color-text-3);
      transition: color 0.2s;

      &:hover {
        color: rgb(var(--danger-6));
      }
    }
  }
}
</style>

