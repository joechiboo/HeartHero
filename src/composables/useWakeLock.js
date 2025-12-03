import { ref, onUnmounted } from 'vue'

/**
 * Wake Lock Composable
 * 防止螢幕休眠，保持畫面常亮
 */
export function useWakeLock() {
  const wakeLock = ref(null)
  const isSupported = ref('wakeLock' in navigator)
  const isActive = ref(false)
  const error = ref(null)

  // 請求 Wake Lock
  async function requestWakeLock() {
    if (!isSupported.value) {
      error.value = '此瀏覽器不支援 Wake Lock API'
      console.warn('[WakeLock] 不支援 Wake Lock API')
      return false
    }

    try {
      wakeLock.value = await navigator.wakeLock.request('screen')
      isActive.value = true
      error.value = null
      console.log('[WakeLock] 已啟用螢幕常亮')

      // 監聽釋放事件
      wakeLock.value.addEventListener('release', () => {
        isActive.value = false
        console.log('[WakeLock] Wake Lock 已釋放')
      })

      return true
    } catch (err) {
      error.value = err.message
      isActive.value = false
      console.error('[WakeLock] 請求失敗:', err.message)
      return false
    }
  }

  // 釋放 Wake Lock
  async function releaseWakeLock() {
    if (wakeLock.value) {
      try {
        await wakeLock.value.release()
        wakeLock.value = null
        isActive.value = false
        console.log('[WakeLock] 已手動釋放')
      } catch (err) {
        console.error('[WakeLock] 釋放失敗:', err.message)
      }
    }
  }

  // 頁面可見性變化時重新請求 Wake Lock
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && isActive.value === false && wakeLock.value === null) {
      // 頁面重新可見時，嘗試重新請求
      console.log('[WakeLock] 頁面恢復可見，重新請求 Wake Lock')
      requestWakeLock()
    }
  }

  // 設置頁面可見性監聽
  function setupVisibilityListener() {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  // 移除監聽
  function removeVisibilityListener() {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  // 組件卸載時清理
  onUnmounted(() => {
    releaseWakeLock()
    removeVisibilityListener()
  })

  return {
    isSupported,
    isActive,
    error,
    requestWakeLock,
    releaseWakeLock,
    setupVisibilityListener,
    removeVisibilityListener
  }
}
