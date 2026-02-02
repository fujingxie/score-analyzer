import { app, BrowserWindow, ipcMain,Menu,shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Store from 'electron-store';
// 👇 手动定义 __dirname 和 __filename
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const store = new Store();

app.commandLine.appendSwitch('ignore-certificate-errors');

// ❌ 之前报错是这里：let win: BrowserWindow | null = null;
// ✅ 改成这样（去掉冒号和类型）：
let win = null;
// 👇 3. 监听渲染进程发来的存取请求
ipcMain.on('set-token', (event, token) => {
    store.set('user_token', token); // 把 token 写入硬盘
    console.log('Token 已保存:', token);
});

ipcMain.handle('get-token', () => {
    const token = store.get('user_token'); // 从硬盘读取
    console.log('读取 Token:', token);
    return token;
});

ipcMain.on('clear-token', () => {
    store.delete('user_token'); // 退出登录时删除
});

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        // icon: path.join(__dirname, '../public/favicon.ico'),
        webPreferences: {
            // 👇 再次提醒：如果还没生成 preload.js，请保持这行注释状态
            // preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        },
    })

    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

   if (process.env.VITE_DEV_SERVER_URL) {
           // [开发环境] 加载 Vite 提供的本地服务地址
           win.loadURL(process.env.VITE_DEV_SERVER_URL)
       } else {
           // [生产环境/打包后] 加载打包好的 index.html 文件
           // 注意：dist-electron/main.js 的上一级是根目录，再进去 dist/index.html
           win.loadFile(path.join(__dirname, '../dist/index.html'))
       }

   // win.webContents.openDevTools();
}
// 2. 定义中文菜单函数 (Mac/Win 通用版)
function setAppMenu() {
  const isMac = process.platform === 'darwin' // 判断是否为 Mac

  const template = [
    // 🔴 Mac 专属：第一个菜单是应用名称 (显示在左上角苹果图标旁)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { label: '关于系统', role: 'about' },
        { type: 'separator' },
        { label: '隐藏应用', role: 'hide' },
        { label: '隐藏其他', role: 'hideOthers' },
        { label: '显示全部', role: 'unhide' },
        { type: 'separator' },
        { label: '退出系统', role: 'quit' }
      ]
    }] : []),

    // 文件菜单
    {
      label: '文件',
      submenu: [
        // Mac 上通常把“关闭窗口”放在这里，而“退出”在第一个菜单
        isMac ? { label: '关闭窗口', role: 'close' } : { label: '退出系统', role: 'quit' }
      ]
    },

    // 编辑菜单 (Mac 必须保留这个，否则复制粘贴快捷键会失效！)
    {
      label: '编辑',
      submenu: [
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '全选', role: 'selectAll' }
      ]
    },

    // 视图菜单
    {
      label: '视图',
      submenu: [
        { label: '刷新页面', role: 'reload' },
        { label: '强制刷新', role: 'forceReload' },
        { label: '开发者工具', role: 'toggleDevTools' }, // 调试完可以注释掉
        { type: 'separator' },
        { label: '实际大小', role: 'resetZoom' },
        { label: '放大', role: 'zoomIn' },
        { label: '缩小', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', role: 'togglefullscreen' }
      ]
    },

    // 帮助菜单
    {
      label: '帮助',
      submenu: [
        {
          label: '了解更多',
          click: async () => {
            await shell.openExternal('https://xie-app.asia')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
app.whenReady().then(() => {
// 1. 设置应用名字 (这会让 Mac 左上角尽量显示中文，但在开发模式下可能还是 Electron)
  app.setName('成绩分析助手');

  // 2. 🔴 必须调用这个函数！
  setAppMenu();

  // 3. 创建窗口
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
