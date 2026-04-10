<template>
  <view class="container">
    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
    </view>

    <!-- 问题区域 -->
    <scroll-view scroll-y class="question-scroll" v-if="currentQuestion">
      <view class="question-card">
        <text class="question-text" user-select>{{ currentQuestion.text }}</text>
      </view>

      <view class="options">
        <view
          v-for="(option, index) in currentQuestion.options"
          :key="index"
          class="option-item"
          :class="{ selected: selectedValue === option.value }"
          @tap="selectOption(option.value)"
        >
          <view class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}</view>
          <text class="option-text" user-select>{{ option.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer">
      <button
        class="nav-btn prev"
        :disabled="currentIndex === 0"
        @tap="prevQuestion"
      >
        上一题
      </button>
      <button
        class="nav-btn next"
        v-if="isShowNextBtn"
        :disabled="!selectedValue"
        @tap="nextQuestion"
      >
        下一题
      </button>
      <button
        class="nav-btn submit"
        v-if="isShowSubmitBtn"
        :disabled="!canSubmit"
        @tap="submitTest"
      >
        提交测试
      </button>
    </view>
  </view>
</template>

<script>
import { questions, specialQuestions } from '@/utils/questions.js'
import { calculatePersonality } from '@/utils/calculator.js'

export default {
  data() {
    return {
      currentIndex: 0,
      answers: {},
      questionList: [],
      totalCount: 0,
      answeredCount: 0,
      isShowNextBtn: false,
      isShowSubmitBtn: false,
      canSubmit: false,
      selectedValue: null
    }
  },
  computed: {
    currentQuestion() {
      return this.questionList[this.currentIndex] || null
    },
    progressPercent() {
      return this.totalCount ? (this.answeredCount / this.totalCount * 100) : 0
    }
  },
  onLoad() {
    this.initQuestions()
  },
  methods: {
    initQuestions() {
      this.questionList = [...questions]
      this.totalCount = this.questionList.length
      this.answeredCount = 0
      this.updateUI()
    },
    
    updateUI() {
      // 动态调整问题列表（先调整，因为会影响 currentQuestion）
      this.adjustQuestionList()
      
      // 更新当前选中的值
      const q = this.currentQuestion
      this.selectedValue = q ? (this.answers[q.id] || null) : null
      
      // 重新计算总数
      this.totalCount = this.questionList.length
      
      // 计算已回答数量（基于 questionList 而非 answers 的 keys）
      this.answeredCount = this.questionList.filter(q => this.answers[q.id] !== undefined).length
      
      // 判断按钮显示（最后计算）
      this.isShowNextBtn = this.currentIndex < this.questionList.length - 1
      this.isShowSubmitBtn = this.currentIndex === this.questionList.length - 1
      this.canSubmit = this.answeredCount >= this.totalCount && this.totalCount > 0
    },
    
    adjustQuestionList() {
      // 检查是否需要添加爱好问题
      const hasDrinkGate = this.questionList.some(q => q.id === 'drink_gate_q1')
      
      if (!hasDrinkGate) {
        // 添加爱好问题到末尾
        this.questionList = [...this.questionList, specialQuestions[0]]
      }
      
      // 检查是否需要添加饮酒态度问题
      if (this.answers.drink_gate_q1 === 3) {
        const hasDrinkQuestion = this.questionList.some(q => q.id === 'drink_gate_q2')
        if (!hasDrinkQuestion) {
          const idx = this.questionList.findIndex(q => q.id === 'drink_gate_q1')
          const newList = [...this.questionList]
          newList.splice(idx + 1, 0, specialQuestions[1])
          this.questionList = newList
        }
      } else {
        // 移除饮酒态度问题，同时清理对应的答案
        if (this.questionList.some(q => q.id === 'drink_gate_q2')) {
          this.questionList = this.questionList.filter(q => q.id !== 'drink_gate_q2')
          // 清理已删除问题的答案
          delete this.answers['drink_gate_q2']
        }
      }
      
      // 清理 answers 中不存在于 questionList 的条目
      const questionIds = this.questionList.map(q => q.id)
      Object.keys(this.answers).forEach(key => {
        if (!questionIds.includes(key)) {
          delete this.answers[key]
        }
      })
    },
    
    selectOption(value) {
      const q = this.currentQuestion
      if (!q) return
      
      this.answers[q.id] = value
      this.selectedValue = value
      
      // 爱好问题回答后：如果选择非饮酒，需要删除饮酒态度问题及其答案
      if (q.id === 'drink_gate_q1' && value !== 3) {
        // 删除饮酒态度问题
        this.questionList = this.questionList.filter(item => item.id !== 'drink_gate_q2')
        // 清理饮酒态度问题的答案
        delete this.answers['drink_gate_q2']
        // 修正 currentIndex 防止越界
        if (this.currentIndex >= this.questionList.length) {
          this.currentIndex = this.questionList.length - 1
        }
      }
      
      this.updateUI()
      
      // 不自动跳转，用户需要手动点击"下一题"按钮
    },
    
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.updateUI()
      }
    },
    
    nextQuestion() {
      if (this.currentIndex < this.questionList.length - 1) {
        this.currentIndex++
        this.updateUI()
      }
    },
    
    submitTest() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请完成所有题目',
          icon: 'none'
        })
        return
      }

      const result = calculatePersonality(this.answers, this.questionList)
      uni.setStorageSync('sbti_result', result)
      uni.navigateTo({
        url: '/pages/result/result'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

.progress-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e94560 0%, #ff6b6b 100%);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  font-size: 24rpx;
  color: #a0a0a0;
}

.question-scroll {
  flex: 1;
  width: 100%;
  padding: 40rpx;
  box-sizing: border-box;
}

.question-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.question-text {
  font-size: 32rpx;
  color: #ffffff;
  line-height: 1.8;
  word-break: break-all;
  word-wrap: break-word;
}

.options {
  margin-top: 20rpx;
}

.option-item {
  display: flex;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.option-item.selected {
  background: rgba(233, 69, 96, 0.2);
  border-color: #e94560;
}

.option-item:active {
  transform: scale(0.98);
}

.option-letter {
  width: 48rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #ffffff;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.option-item.selected .option-letter {
  background: #e94560;
}

.option-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.6;
  flex: 1;
  word-break: break-all;
  word-wrap: break-word;
}

.footer {
  padding: 30rpx 40rpx;
  display: flex;
  gap: 20rpx;
  background: rgba(0, 0, 0, 0.3);
}

.nav-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn.prev {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.nav-btn.next,
.nav-btn.submit {
  background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
  color: #ffffff;
}

.nav-btn[disabled] {
  opacity: 0.5;
}
</style>
