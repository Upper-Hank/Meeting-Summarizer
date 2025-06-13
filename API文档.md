# 会议总结系统技术文档

## 1. 系统架构概述

会议总结系统采用前后端分离架构，由以下部分组成：

- **前端**：基于HTML、CSS和JavaScript开发的Web应用
- **后端**：基于Flask的Python API服务

系统运行方式：
- 前端服务运行在端口8000（HTTP服务器）
- 后端服务运行在端口9000（Flask应用）

## 2. 后端API接口

### 2.1 状态检查

```
GET /api/status
```
- **功能**：检查后端服务状态
- **返回**：服务状态信息

### 2.2 文件上传与处理

```
POST /api/upload
```
- **功能**：上传音频文件并开始转录
- **参数**：FormData格式，包含音频文件
- **返回**：上传状态和文件信息

### 2.3 Zoom会议处理

```
POST /api/join_meeting
```
- **功能**：处理Zoom会议链接
- **参数**：
  - `meeting_link`: Zoom会议链接
  - `recording_mode`: 录制模式
- **返回**：会议加入状态

### 2.4 实时录音控制

```
POST /api/start-recording
```
- **功能**：开始实时录音转录
- **返回**：录音开始状态

```
POST /api/stop-recording
```
- **功能**：停止实时录音转录
- **返回**：录音停止状态

### 2.5 转录状态与内容

```
GET /api/transcription/status
```
- **功能**：获取转录状态
- **返回**：转录完成状态和进度

```
GET /api/transcription/text
```
- **功能**：获取转录文本
- **返回**：转录文本和元数据

### 2.6 总结生成与获取

```
POST /api/generate_summary
```
- **功能**：生成会议总结
- **参数**：
  - `transcript`: 可选，转录文本
- **返回**：总结生成状态

```
GET /api/summary/text
```
- **功能**：获取总结文本
- **返回**：总结文本

### 2.7 音频播放与文件下载

```
POST /api/play_transcript
```
- **功能**：播放转录文件的语音
- **返回**：播放状态

```
POST /api/download_transcript
```
- **功能**：下载转录文件
- **返回**：转录文件下载

```
POST /api/play_summary
```
- **功能**：播放总结文件的语音
- **返回**：播放状态

```
POST /api/download_summary
```
- **功能**：下载总结文件
- **返回**：总结文件下载

## 3. 前端页面架构与工作逻辑

前端通过JavaScript的Fetch API调用后端接口，所有API调用使用绝对URL（`http://127.0.0.1:9000/api/...`）。

### 3.1 页面模块架构

前端由四个主要页面模块组成，每个页面都有独立的状态管理和控制器：

#### 第1页：欢迎页面 (welcome-page.js)
**功能**：系统入口和欢迎界面
**工作逻辑**：
- 显示欢迎信息和系统介绍
- 提供"开始"按钮，点击后跳转到上传页面
- 包含页面进入动画效果
- 状态管理：`WelcomePageState`（初始化状态、可见性状态）

#### 第2页：上传页面 (upload-page.js)
**功能**：处理三种输入方式的数据收集和处理
**工作逻辑**：
- **文件上传功能**：
  - 支持拖拽和点击上传音频文件
  - 文件类型验证（支持 .mp3, .wav, .m4a, .flac, .ogg）
  - 调用 `/api/upload` 接口上传文件并开始转录
- **Zoom链接处理**：
  - 验证Zoom会议链接格式
  - 选择录制模式（仅音频/音频+视频）
  - 调用 `/api/join_meeting` 接口处理会议链接
- **实时录制功能**：
  - 开始录制：调用 `/api/start-recording` 接口
  - 停止录制：调用 `/api/stop-recording` 接口
  - 录制状态管理：'idle' | 'recording' | 'completed'
- **导航控制**：
  - Back按钮：返回欢迎页面
  - Next按钮：根据选择的功能调用相应API后跳转到转录页面
- 状态管理：`UploadPageState`（文件选择状态、Zoom链接验证、录制状态等）

#### 第3页：转录页面 (transcription-page.js)
**功能**：显示转录进度和结果
**工作逻辑**：
- **转录状态轮询**：
  - 定期调用 `/api/transcription/status` 检查转录进度
  - 轮询间隔：500ms，最大轮询次数：120次（60秒超时）
  - 实时录制模式下无超时限制
- **进度显示**：
  - 动态更新进度条和状态文本
  - 显示转录过程中的各个阶段
- **结果获取**：
  - 转录完成后调用 `/api/transcription/text` 获取转录文本
  - 支持模拟数据作为fallback
- **音频控制**：
  - 播放转录音频：调用 `/api/play_transcript`
  - 下载转录文件：调用 `/api/download_transcript`
- **导航控制**：
  - Back按钮：返回上传页面
  - Next按钮：跳转到总结页面
- 状态管理：`TranscriptionPageState`（转录状态、文本内容、渲染状态等）

#### 第4页：总结页面 (summary-page.js)
**功能**：生成和显示会议总结
**工作逻辑**：
- **总结生成**：
  - 调用 `/api/generate_summary` 接口生成总结
  - 支持基于转录文本的智能总结
- **进度显示**：
  - 显示总结生成进度和状态
  - 包含分析、生成、格式化等阶段
- **结果展示**：
  - 调用 `/api/summary/text` 获取总结文本
  - 支持Markdown格式的总结内容
  - 包含关键指标、产品亮点、目标、行动项等结构化信息
- **音频控制**：
  - 播放总结音频：调用 `/api/play_summary`
  - 下载总结文件：调用 `/api/download_summary`
- **导航控制**：
  - Back按钮：返回转录页面
  - Finish按钮：完成流程，返回欢迎页面
- 状态管理：`SummaryPageState`（总结状态、文本内容、渲染状态等）

### 3.2 API调用示例

#### 文件上传
```javascript
const formData = new FormData();
formData.append('file', selectedFile);

const response = await fetch('http://127.0.0.1:9000/api/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('文件上传成功:', result.data);
} else {
  throw new Error(result.error || '文件上传失败');
}
```

#### Zoom链接处理
```javascript
const response = await fetch('http://127.0.0.1:9000/api/join_meeting', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    meeting_link: zoomLink,
    recording_mode: recordingMode
  })
});

const result = await response.json();
if (result.success) {
  console.log('会议链接处理成功');
} else {
  throw new Error(result.error || '会议链接处理失败');
}
```

#### 实时录制控制
```javascript
// 开始录制
const startResponse = await fetch('http://127.0.0.1:9000/api/start-recording', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});

// 停止录制
const stopResponse = await fetch('http://127.0.0.1:9000/api/stop-recording', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});
```

#### 获取转录状态（轮询）
```javascript
const pollTranscriptionStatus = async () => {
  const response = await fetch('http://127.0.0.1:9000/api/transcription/status');
  const result = await response.json();
  
  if (result.success) {
    if (result.data.status === 'completed') {
      // 转录完成，获取转录文本
      const textResponse = await fetch('http://127.0.0.1:9000/api/transcription/text');
      const textResult = await textResponse.json();
      return textResult.data.text;
    } else {
      // 继续轮询
      setTimeout(pollTranscriptionStatus, 500);
    }
  }
};
```

#### 生成总结
```javascript
const response = await fetch('http://127.0.0.1:9000/api/generate_summary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});

const result = await response.json();
if (result.success) {
  // 获取总结文本
  const summaryResponse = await fetch('http://127.0.0.1:9000/api/summary/text');
  const summaryResult = await summaryResponse.json();
  console.log('总结生成成功:', summaryResult.data.text);
} else {
  throw new Error(result.error || '总结生成失败');
}
```

## 4. 系统运行方式

### 4.1 启动系统

1. **启动后端服务**：
   ```
   python3 /Users/upper/Web/Meeting\ Summarizer/v3.0-main/app.py
   ```
   后端服务将在 http://localhost:9000 运行

2. **启动前端服务**：
   ```
   python3 -m http.server 8000 --directory "/Users/upper/Web/Meeting Summarizer"
   ```
   前端服务将在 http://localhost:8000 运行

### 4.2 用户流程

1. 用户访问 http://localhost:8000
2. 选择输入方式：上传音频文件、输入Zoom链接或实时录音
3. 系统处理输入并生成转录文本
4. 系统基于转录文本生成会议总结
5. 用户可以查看、播放或下载转录和总结

### 4.3 跨域处理

系统使用以下方式处理跨域问题：

1. 后端启用CORS支持
2. 前端HTML文件中添加Content-Security-Policy头，允许连接到后端服务
3. 所有API调用使用绝对URL

## 5. 注意事项

1. 系统依赖于两个服务同时运行（前端8000端口和后端9000端口）
2. 实时录音和Zoom会议功能为模拟实现
3. 总结生成使用LLM处理器，需要有效的API密钥