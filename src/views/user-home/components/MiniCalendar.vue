<template>
  <a-card
    class="general-card"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '10px' }"
  >
    <template #title>
      <div class="calendar-header">
        <span>{{ currentMonth }}</span>
        <a-space>
          <a-button size="mini" @click="prevMonth">
            <icon-left />
          </a-button>
          <a-button size="mini" @click="today">今天</a-button>
          <a-button size="mini" @click="nextMonth">
            <icon-right />
          </a-button>
        </a-space>
      </div>
    </template>

    <div class="mini-calendar">
      <div class="weekdays">
        <span v-for="day in weekdays" :key="day" class="weekday">{{ day }}</span>
      </div>
      <div class="days">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'day',
            { 'other-month': !day.currentMonth },
            { 'today': day.isToday },
            { 'selected': day.isSelected },
          ]"
          @click="selectDate(day)"
        >
          {{ day.date }}
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const currentDate = ref(dayjs())
const selectedDate = ref(dayjs())

const currentMonth = computed(() => currentDate.value.format('YYYY年MM月'))

interface CalendarDay {
  date: number
  fullDate: string
  currentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const startOfMonth = currentDate.value.startOf('month')
  const endOfMonth = currentDate.value.endOf('month')
  const startDay = startOfMonth.day()
  const daysInMonth = endOfMonth.date()

  // 上个月的天数
  const prevMonth = currentDate.value.subtract(1, 'month')
  const daysInPrevMonth = prevMonth.endOf('month').date()

  // 填充上个月的日期
  for (let i = startDay - 1; i >= 0; i--) {
    const date = daysInPrevMonth - i
    days.push({
      date,
      fullDate: prevMonth.date(date).format('YYYY-MM-DD'),
      currentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }

  // 填充当前月的日期
  const today = dayjs().format('YYYY-MM-DD')
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = currentDate.value.date(i).format('YYYY-MM-DD')
    days.push({
      date: i,
      fullDate,
      currentMonth: true,
      isToday: fullDate === today,
      isSelected: fullDate === selectedDate.value.format('YYYY-MM-DD'),
    })
  }

  // 填充下个月的日期
  const nextMonth = currentDate.value.add(1, 'month')
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      fullDate: nextMonth.date(i).format('YYYY-MM-DD'),
      currentMonth: false,
      isToday: false,
      isSelected: false,
    })
  }

  return days
})

const prevMonth = () => {
  currentDate.value = currentDate.value.subtract(1, 'month')
}

const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, 'month')
}

const today = () => {
  currentDate.value = dayjs()
  selectedDate.value = dayjs()
}

const selectDate = (day: CalendarDay) => {
  selectedDate.value = dayjs(day.fullDate)
  if (!day.currentMonth) {
    currentDate.value = dayjs(day.fullDate)
  }
}
</script>

<style scoped lang="scss">
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.mini-calendar {
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 8px;

    .weekday {
      text-align: center;
      font-size: 12px;
      color: var(--color-text-3);
      padding: 4px 0;
    }
  }

  .days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;

    .day {
      text-align: center;
      font-size: 12px;
      padding: 6px 0;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: var(--color-fill-2);
      }

      &.other-month {
        color: var(--color-text-4);
      }

      &.today {
        color: rgb(var(--primary-6));
        font-weight: 600;
      }

      &.selected {
        background-color: rgb(var(--primary-6));
        color: #fff;

        &:hover {
          background-color: rgb(var(--primary-5));
        }
      }
    }
  }
}
</style>

