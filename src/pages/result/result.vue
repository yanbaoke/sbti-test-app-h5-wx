<template>
  <view class="container">
    <!-- 单个结果模式 -->
    <view v-if="mode === 'result'" class="result-mode">
      <view class="result-header">
        <text class="mode-kicker">{{ result.modeKicker }}</text>
        <view class="type-badge">{{ result.badge }}</view>
      </view>

      <view class="type-info">
        <text class="type-code">{{ result.type.code }}</text>
        <text class="type-name">{{ result.type.cn }}</text>
      </view>

      <view class="poster-box" id="posterBox">
        <image
          v-if="personalityImages[result.type.code]"
          :src="personalityImages[result.type.code]"
          mode="widthFix"
          class="poster-image"
        />
        <view v-else class="no-poster">
          <text class="no-poster-text">{{ result.type.code }}</text>
        </view>
      </view>

      <view class="intro-section">
        <text class="intro-text">{{ result.type.intro }}</text>
      </view>

      <view class="desc-section">
        <text class="desc-text">{{ result.type.desc }}</text>
      </view>

      <view class="disclaimer">
        <text class="disclaimer-text">
          本测试仅供娱乐。隐藏人格和傻乐兜底都属于作者故意埋的损招，请勿把它当成医学、心理学、相学、命理学或灵异学依据。
        </text>
      </view>

      <view class="actions">
        <button class="action-btn primary" @tap="savePoster">保存人格卡</button>
        <button class="action-btn secondary" @tap="restartTest">重新测试</button>
        <button class="action-btn secondary" @tap="goToDownload">查看所有人格卡</button>
      </view>
    </view>

    <!-- 下载所有人格卡模式 -->
    <view v-else class="download-mode">
      <view class="download-header">
        <text class="download-title">所有人格卡</text>
        <text class="download-subtitle">共 {{ personalityList.length }} 种人格类型</text>
      </view>

      <view class="personality-list">
        <view
          v-for="item in personalityList"
          :key="item.code"
          class="personality-card"
          @tap="previewPersonality(item)"
        >
          <view class="card-preview">
            <image
              v-if="personalityImages[item.code]"
              :src="personalityImages[item.code]"
              mode="aspectFill"
              class="card-thumb"
            />
            <view v-else class="card-placeholder">
              <text class="placeholder-text">{{ item.code }}</text>
            </view>
          </view>
          <view class="card-info">
            <text class="card-code">{{ item.code }}</text>
            <text class="card-name">{{ item.cn }}</text>
          </view>
        </view>
      </view>

      <view class="download-actions">
        <button class="back-btn" @tap="goBack">返回首页</button>
      </view>
    </view>

    <!-- 预览弹窗 -->
    <view v-if="showPreview" class="preview-modal" @tap="closePreview">
      <view class="preview-content" @tap.stop>
        <image
          v-if="previewItem && personalityImages[previewItem.code]"
          :src="personalityImages[previewItem.code]"
          mode="widthFix"
          class="preview-image"
        />
        <view v-if="previewItem" class="preview-info">
          <text class="preview-code">{{ previewItem.code }}</text>
          <text class="preview-name">{{ previewItem.cn }}</text>
          <text class="preview-intro">{{ previewItem.intro }}</text>
        </view>
        <button class="save-single-btn" @tap="saveSinglePoster">保存此卡片</button>
      </view>
    </view>
  </view>
</template>

<script>
import { personalityTypes, personalityList } from '@/utils/personalities.js'

// 人格卡片图片
const personalityImages = {
  CTRL: '/static/personalities/CTRL.png',
  BOSS: '/static/personalities/BOSS.png',
  GOGO: '/static/personalities/GOGO.jpg',
  SEXY: '/static/personalities/SEXY.png',
  FAKE: '/static/personalities/FAKE.png',
  MALO: '/static/personalities/MALO.png',
  SHIT: '/static/personalities/SHIT.png',
  ZZZZ: '/static/personalities/ZZZZ.png',
  POOR: '/static/personalities/POOR.png',
  MONK: '/static/personalities/MONK.png',
  IMSB: '/static/personalities/IMSB.png',
  SOLO: '/static/personalities/SOLO.png',
  DEAD: '/static/personalities/DEAD.png',
  IMFW: '/static/personalities/IMFW.png',
  HHHH: '/static/personalities/HHHH.png',
  RUNK: '/static/personalities/RUNK.png'
}

export default {
  data() {
    return {
      mode: 'result', // 'result' 或 'download'
      result: {
        type: personalityTypes.IMSB,
        badge: '神秘人格',
        modeKicker: '测试结果',
        special: false
      },
      personalityList,
      personalityImages,
      showPreview: false,
      previewItem: null,
      downloadProgress: 0,
      isDownloading: false
    }
  },
  onLoad(options) {
    if (options.mode === 'download') {
      this.mode = 'download'
    } else {
      // 从存储中获取结果
      const savedResult = uni.getStorageSync('sbti_result')
      if (savedResult) {
        this.result = savedResult
      }
    }
  },
  methods: {
    savePoster() {
      const code = this.result.type.code
      this.saveImageToPhotos(code)
    },
    async saveImageToPhotos(code) {
      const imagePath = personalityImages[code]
      if (!imagePath) {
        uni.showToast({
          title: '暂无此人格卡片',
          icon: 'none'
        })
        return
      }

      try {
        // 小程序中保存本地图片到相册
        // #ifdef MP-WEIXIN
        // 先获取相册权限
        try {
          await uni.authorize({
            scope: 'scope.writePhotosAlbum'
          })
        } catch (authErr) {
          // 用户拒绝授权，引导用户开启权限
          uni.showModal({
            title: '需要相册权限',
            content: '请在设置中开启相册权限',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting()
              }
            }
          })
          return
        }

        // 保存图片到相册
        await uni.saveImageToPhotosAlbum({
          filePath: imagePath
        })

        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        // #endif

        // #ifdef H5
        // H5环境使用下载方式
        const link = document.createElement('a')
        link.href = imagePath
        link.download = `${code}.png`
        link.click()

        uni.showToast({
          title: '下载成功',
          icon: 'success'
        })
        // #endif
      } catch (err) {
        console.error('保存失败', err)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    restartTest() {
      uni.redirectTo({
        url: '/pages/test/test'
      })
    },
    goToDownload() {
      this.mode = 'download'
    },
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({
            url: '/pages/intro/intro'
          })
        }
      })
    },
    previewPersonality(item) {
      this.previewItem = item
      this.showPreview = true
    },
    closePreview() {
      this.showPreview = false
      this.previewItem = null
    },
    saveSinglePoster() {
      if (this.previewItem) {
        this.saveImageToPhotos(this.previewItem.code)
      }
    },
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 40rpx;
  box-sizing: border-box;
}

/* 结果模式样式 */
.result-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.mode-kicker {
  font-size: 28rpx;
  color: #a0a0a0;
  display: block;
  margin-bottom: 16rpx;
}

.type-badge {
  display: inline-block;
  background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
  color: #ffffff;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
}

.type-info {
  text-align: center;
  margin-bottom: 30rpx;
}

.type-code {
  font-size: 72rpx;
  font-weight: bold;
  color: #e94560;
  display: block;
  text-shadow: 0 0 30rpx rgba(233, 69, 96, 0.5);
}

.type-name {
  font-size: 36rpx;
  color: #ffffff;
  display: block;
  margin-top: 10rpx;
}

.poster-box {
  width: 100%;
  max-width: 600rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.poster-image {
  width: 100%;
}

.no-poster {
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.no-poster-text {
  font-size: 80rpx;
  color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.intro-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.intro-text {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1.8;
}

.desc-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.desc-text {
  font-size: 26rpx;
  color: #a0a0a0;
  line-height: 1.8;
}

.disclaimer {
  background: rgba(233, 69, 96, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(233, 69, 96, 0.3);
}

.disclaimer-text {
  font-size: 22rpx;
  color: #e94560;
  line-height: 1.6;
  text-align: center;
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
  color: #ffffff;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 下载模式样式 */
.download-mode {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80rpx);
}

.download-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.download-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
}

.download-subtitle {
  font-size: 26rpx;
  color: #a0a0a0;
  margin-top: 10rpx;
  display: block;
}

.personality-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  padding: 0 10rpx;
}

.personality-card {
  width: 50%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20rpx;
  padding: 10rpx;
  box-sizing: border-box;
}

.card-preview {
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.card-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(233, 69, 96, 0.3) 0%, rgba(255, 107, 107, 0.3) 100%);
}

.placeholder-text {
  font-size: 48rpx;
  color: rgba(255, 255, 255, 0.5);
  font-weight: bold;
}

.card-info {
  padding: 20rpx;
  text-align: center;
}

.card-code {
  font-size: 28rpx;
  font-weight: bold;
  color: #e94560;
  display: block;
}

.card-name {
  font-size: 24rpx;
  color: #a0a0a0;
  margin-top: 6rpx;
  display: block;
}

.download-actions {
  padding: 30rpx 0;
}

.download-all-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
  border-radius: 50rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.btn-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.btn-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}

.back-btn {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 预览弹窗样式 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  width: 90%;
  max-width: 600rpx;
  background: rgba(30, 30, 50, 0.95);
  border-radius: 20rpx;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-image {
  width: 100%;
}

.preview-info {
  padding: 30rpx;
  text-align: center;
}

.preview-code {
  font-size: 48rpx;
  font-weight: bold;
  color: #e94560;
  display: block;
}

.preview-name {
  font-size: 32rpx;
  color: #ffffff;
  margin-top: 10rpx;
  display: block;
}

.preview-intro {
  font-size: 24rpx;
  color: #a0a0a0;
  margin-top: 16rpx;
  line-height: 1.6;
  display: block;
}

.save-single-btn {
  width: calc(100% - 60rpx);
  height: 80rpx;
  background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
  border: none;
  margin: 20rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
