<script>
export default {
  onLaunch: function() {
    // SBTI 人格测试启动
  },
  onShow: function() {
    // App Show
  },
  onHide: function() {
    // App Hide
  }
}
</script>

<style>
/* 全局样式 */
page {
  background: #1a1a2e;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 重置按钮样式 */
button {
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  line-height: normal;
}

button::after {
  border: none;
}

/* 文本样式 */
text {
  word-break: break-all;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}
</style>
