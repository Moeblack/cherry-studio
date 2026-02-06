/**
 * Cherry Studio 性能诊断脚本
 * 使用方法：在 Cherry Studio 的 DevTools Console 中粘贴运行
 */
(function runDiagnostic() {
  console.clear()
  console.log('%c🔍 Cherry Studio 性能诊断报告', 'font-size:18px;font-weight:bold;color:#ff6b6b')
  console.log('='.repeat(60))

  // 1. JS Heap 内存
  if (performance.memory) {
    const heap = performance.memory
    const used = (heap.usedJSHeapSize / 1024 / 1024).toFixed(1)
    const total = (heap.totalJSHeapSize / 1024 / 1024).toFixed(1)
    const limit = (heap.jsHeapSizeLimit / 1024 / 1024).toFixed(1)
    const pct = ((heap.usedJSHeapSize / heap.jsHeapSizeLimit) * 100).toFixed(1)
    console.log(`\n%c📊 JS Heap 内存`, 'font-size:14px;font-weight:bold')
    console.log(`  已用: ${used} MB / 上限: ${limit} MB (${pct}%)`)
    if (parseFloat(used) > 500) {
      console.log(`  %c⚠️ 内存使用超过 500MB，存在严重内存问题`, 'color:red;font-weight:bold')
    }
  }

  // 2. DOM 中的 base64 图片
  const base64Imgs = document.querySelectorAll('img[src^="data:"]')
  let base64TotalBytes = 0
  const base64Details = []
  base64Imgs.forEach((img, i) => {
    const size = img.src.length
    base64TotalBytes += size
    base64Details.push({
      index: i,
      sizeMB: (size / 1024 / 1024).toFixed(2) + ' MB',
      sizeRaw: size,
      dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
      visible: img.getBoundingClientRect().top < window.innerHeight && img.getBoundingClientRect().bottom > 0
    })
  })
  console.log(`\n%c🖼️ DOM 中的 Base64 图片`, 'font-size:14px;font-weight:bold')
  console.log(`  数量: ${base64Imgs.length} 张`)
  console.log(`  总大小: ${(base64TotalBytes / 1024 / 1024).toFixed(2)} MB`)
  if (base64Details.length > 0) {
    console.table(base64Details)
  }
  if (base64TotalBytes > 10 * 1024 * 1024) {
    console.log(`  %c⚠️ Base64 图片总量 >10MB，这是卡顿的主要来源之一`, 'color:red;font-weight:bold')
  }

  // 3. DOM 复杂度
  const allElements = document.querySelectorAll('*')
  const messageContainer = document.querySelector('#messages') || document.querySelector('.messages-container')
  let messageChildCount = 0
  if (messageContainer) {
    messageChildCount = messageContainer.querySelectorAll('*').length
  }
  console.log(`\n%c🏗️ DOM 复杂度`, 'font-size:14px;font-weight:bold')
  console.log(`  总元素数: ${allElements.length}`)
  console.log(`  消息区域元素数: ${messageChildCount}`)
  if (allElements.length > 5000) {
    console.log(`  %c⚠️ DOM 节点过多 (>5000)，缺少虚拟化可能导致卡顿`, 'color:orange;font-weight:bold')
  }

  // 4. 检测 file:// 引用的图片（正常的高效方式）
  const fileImgs = document.querySelectorAll('img[src^="file://"]')
  console.log(`\n%c📁 文件引用图片`, 'font-size:14px;font-weight:bold')
  console.log(`  file:// 图片数量: ${fileImgs.length} 张（这种方式不占 JS 内存）`)

  // 5. 检测 URL 引用的图片
  const urlImgs = document.querySelectorAll('img[src^="http"]')
  console.log(`  http(s):// 图片数量: ${urlImgs.length} 张`)

  // 6. 尝试检测 Redux store 大小
  console.log(`\n%c💾 Redux State 检测`, 'font-size:14px;font-weight:bold')
  // 尝试多种方式获取 store
  let store = null
  try {
    // 方法1: React DevTools fiber 遍历
    const rootEl = document.getElementById('root') || document.getElementById('app')
    if (rootEl && rootEl._reactRootContainer) {
      console.log(`  找到 React root，但无法直接访问 store`)
    }
  } catch (e) {}

  // 方法2: 检查 localStorage 中 redux-persist 的大小
  let persistSize = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('cherry') || key.includes('persist'))) {
      const val = localStorage.getItem(key)
      if (val) {
        persistSize += val.length
        if (val.length > 100 * 1024) {
          console.log(`  localStorage["${key}"]: ${(val.length / 1024 / 1024).toFixed(2)} MB`)
        }
      }
    }
  }
  if (persistSize > 0) {
    console.log(`  Redux Persist (localStorage) 总大小: ${(persistSize / 1024 / 1024).toFixed(2)} MB`)
  } else {
    console.log(`  localStorage 中未找到明显的 Redux Persist 数据`)
  }

  // 7. IndexedDB 检测
  console.log(`\n%c🗄️ IndexedDB 数据库`, 'font-size:14px;font-weight:bold')
  if (indexedDB.databases) {
    indexedDB.databases().then(dbs => {
      dbs.forEach(db => {
        console.log(`  数据库: ${db.name} (版本 ${db.version})`)
      })
    })
  }

  // 8. 总结
  console.log(`\n%c📋 诊断总结`, 'font-size:14px;font-weight:bold')
  console.log('='.repeat(60))

  const issues = []
  if (performance.memory && performance.memory.usedJSHeapSize > 500 * 1024 * 1024) {
    issues.push('🔴 JS Heap 超过 500MB — 内存严重膨胀')
  }
  if (base64TotalBytes > 10 * 1024 * 1024) {
    issues.push(`🔴 DOM 中 ${base64Imgs.length} 张 base64 图片，共 ${(base64TotalBytes / 1024 / 1024).toFixed(1)}MB — 应改为 file:// 引用`)
  }
  if (base64TotalBytes > 0 && base64TotalBytes <= 10 * 1024 * 1024) {
    issues.push(`🟡 DOM 中 ${base64Imgs.length} 张 base64 图片，共 ${(base64TotalBytes / 1024 / 1024).toFixed(1)}MB`)
  }
  if (allElements.length > 5000) {
    issues.push(`🟡 DOM 节点 ${allElements.length} 个 — 消息列表缺少虚拟化`)
  }

  if (issues.length === 0) {
    console.log('%c  ✅ 未发现明显性能问题', 'color:green')
  } else {
    issues.forEach(issue => console.log(`  ${issue}`))
  }

  console.log('\n' + '='.repeat(60))
  console.log('%c💡 提示：出图后再运行一次本脚本对比变化', 'color:#888')
  console.log('%c💡 提示：在 Memory 快照中点击 (string) 展开，按 Retained Size 排序，找最大的字符串就是 base64', 'color:#888')
})()
