<template>
  <view class="container">
    <view class="header">
      <text class="title">SBTI 人格测试</text>
      <text class="subtitle">来自蛆肉儿串儿的 SBTI 人格测试</text>
    </view>

    <view class="content">
      <view class="intro-card">
        <text class="intro-text">
          欢迎来到 SBTI 人格测试！
        </text>
        <text class="intro-text">
          这是一个仅供娱乐的心理测试，通过一系列问题来分析你的人格类型。
        </text>
        <text class="intro-text">
          请放松心情，诚实地回答每一个问题。
        </text>
      </view>

      <view class="features">
        <view class="feature-item">
          <text class="feature-icon">🎯</text>
          <text class="feature-title">30道精选题目</text>
          <text class="feature-desc">深度剖析你的人格特质</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🎭</text>
          <text class="feature-title">16种人格类型</text>
          <text class="feature-desc">发现真实的自己</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📸</text>
          <text class="feature-title">人格卡片</text>
          <text class="feature-desc">保存分享你的结果</text>
        </view>
      </view>

      <view class="disclaimer">
        <text class="disclaimer-text">
          本测试仅供娱乐，别拿它当诊断、面试、相亲、分手、招魂、算命或人生判决书。你可以笑，但别太当真。
        </text>
      </view>
    </view>

    <view class="footer">
      <button class="start-btn" @tap="startTest">
        开始测试
      </button>
      <button class="download-btn" @tap="goToDownload">
        所有人格卡
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    startTest() {
      uni.navigateTo({
        url: '/pages/test/test'
      })
    },
    goToDownload() {
      uni.navigateTo({
        url: '/pages/result/result?mode=download'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  padding: 60rpx 0;
}

.title {
  font-size: 64rpx;
  font-weight: bold;
  color: #e94560;
  display: block;
  text-shadow: 0 0 20rpx rgba(233, 69, 96, 0.5);
}

.subtitle {
  font-size: 28rpx;
  color: #a0a0a0;
  margin-top: 16rpx;
  display: block;
}

.content {
  flex: 1;
}

.intro-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.intro-text {
  display: block;
  font-size: 30rpx;
  color: #ffffff;
  line-height: 1.8;
  margin-bottom: 16rpx;
}

.intro-text:last-child {
  margin-bottom: 0;
}

.features {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.feature-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  margin: 0 10rpx;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-item:first-child {
  margin-left: 0;
}

.feature-item:last-child {
  margin-right: 0;
}

.feature-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 16rpx;
}

.feature-title {
  font-size: 26rpx;
  color: #ffffff;
  display: block;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 22rpx;
  color: #a0a0a0;
  display: block;
}

.disclaimer {
  background: rgba(233, 69, 96, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1px solid rgba(233, 69, 96, 0.3);
}

.disclaimer-text {
  font-size: 24rpx;
  color: #e94560;
  line-height: 1.6;
  text-align: center;
}

.footer {
  padding: 40rpx 0;
}

.start-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
  border-radius: 50rpx;
  font-size: 36rpx;
  color: #ffffff;
  font-weight: bold;
  border: none;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.download-btn {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #a0a0a0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn:active {
  opacity: 0.8;
}
</style>
