const app = document.querySelector('#app');

const STORAGE_KEY = 'gpt_academic_settings';
const HISTORY_KEY = 'gpt_academic_history';

const defaultSettings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  systemPrompt: '你是一个专业的学术研究助手，擅长论文阅读、翻译、综述撰写和代码分析。请用清晰、准确、专业的语言回答问题。'
};

const pluginTemplates = {
  '论文翻译': {
    label: '论文翻译',
    icon: '🌐',
    prompt: '请将以下学术论文内容翻译成中文。要求：\n1. 保持专业术语的准确性\n2. 保留原文的段落结构\n3. 对关键术语在括号中保留英文原文\n4. 公式和引用标记保持不变\n\n论文内容如下：\n\n'
  },
  '论文总结': {
    label: '论文总结',
    icon: '📝',
    prompt: '请对以下学术论文进行总结，包含以下部分：\n\n## 研究背景与问题\n（研究的动机和要解决的核心问题）\n\n## 核心方法与贡献\n（论文提出的主要方法和创新点）\n\n## 实验设计与结果\n（实验设置、关键结果和对比分析）\n\n## 局限性与未来方向\n（论文的不足和可改进的地方）\n\n论文内容如下：\n\n'
  },
  '文献综述': {
    label: '文献综述',
    icon: '📚',
    prompt: '请基于以下论文内容，撰写一段结构化的文献综述：\n1. 先概述该领域的研究脉络\n2. 总结主要的技术路线和代表工作\n3. 分析当前的研究热点和争议点\n4. 指出未来的发展方向\n\n要求用学术化的语言，逻辑清晰，层次分明。\n\n论文内容如下：\n\n'
  },
  '代码解释': {
    label: '代码解释',
    icon: '💻',
    prompt: '请详细解释以下代码的功能和逻辑：\n1. 代码整体做了什么\n2. 核心数据结构和算法\n3. 关键函数的作用\n4. 可能的优化点\n\n代码如下：\n\n'
  },
  '学术润色': {
    label: '学术润色',
    icon: '✨',
    prompt: '请对以下学术文本进行润色，使其更加专业、流畅、符合学术写作规范。\n要求：\n1. 保持原意不变\n2. 优化句子结构和逻辑连接\n3. 修正语法和用词问题\n4. 用 Markdown 表格列出修改前后的对比（主要修改点）\n\n原文如下：\n\n'
  },
  '审稿意见': {
    label: '审稿意见',
    icon: '🔍',
    prompt: '请以审稿人的角度，对以下论文给出详细的评审意见：\n\n## 总体评价\n（论文的整体质量和贡献程度）\n\n## 主要优点\n（至少3点）\n\n## 主要问题\n（至少3点，需要具体且可操作）\n\n## 小问题\n（格式、引用、文字等）\n\n## 建议\n（接收/大修/小修/拒稿，附理由）\n\n论文内容如下：\n\n'
  }
};

let settings = { ...defaultSettings };
let chatHistory = [];
let pdfText = '';
let pdfFileName = '';
let isGenerating = false;

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) settings = { ...defaultSettings, ...JSON.parse(saved) };
  } catch (e) {}
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) chatHistory = JSON.parse(saved);
  } catch (e) {}
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory.slice(-50)));
  } catch (e) {}
}

function mdToHtml(text) {
  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
    let html = marked.parse(text);
    if (typeof DOMPurify !== 'undefined') {
      html = DOMPurify.sanitize(html);
    }
    return html;
  }
  return text.replace(/\n/g, '<br>');
}

async function callChatAPI(messages, onChunk) {
  const url = `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: messages,
      stream: true,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API 错误 (${response.status}): ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          if (onChunk) onChunk(fullText);
        }
      } catch (e) {}
    }
  }
  return fullText;
}

function buildMessages(userContent) {
  const messages = [{ role: 'system', content: settings.systemPrompt }];
  const recentHistory = chatHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.role === 'error' || msg.role === 'system') continue;
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: 'user', content: userContent });
  return messages;
}

function renderApp() {
  loadSettings();
  loadHistory();

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="GPT Academic Next home">
          <span class="brand-mark" aria-hidden="true">GA</span>
          <span><strong>GPT Academic</strong><small>Next Workspace</small></span>
        </a>
        <nav class="nav-links" aria-label="Main navigation">
          <a href="#workspace">工作台</a>
          <a href="#reader">论文阅读</a>
          <a href="#plugins">插件</a>
        </nav>
        <div class="topbar-actions">
          <button class="icon-button" type="button" data-panel-toggle aria-label="Toggle control panel">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <button class="ghost-button" type="button" data-open-settings>⚙️ 设置</button>
          <button class="ghost-button" type="button" data-clear-chat>🗑 清空</button>
          <button class="primary-button" type="button" data-export>📥 导出</button>
        </div>
      </header>

      <main>
        <section class="workspace-section" id="workspace">
          <div class="workspace-card" aria-label="Research workspace">
            <div class="workspace-toolbar">
              <div class="traffic" aria-hidden="true"><span></span><span></span><span></span></div>
              <span class="toolbar-title">Research Session</span>
              <div class="toolbar-actions">
                <button class="icon-btn-small" data-export title="导出对话">📥</button>
                <button class="icon-btn-small" data-clear-chat title="清空对话">🗑</button>
              </div>
            </div>
            <div class="workspace-grid">
              <aside class="side-panel" data-control-panel>
                <div class="panel-section">
                  <h2>模型设置</h2>
                  <div class="segmented" aria-label="Model selector">
                    <button class="${settings.model.includes('gpt') ? 'active' : ''}" type="button" data-model="gpt-4o">GPT-4o</button>
                    <button class="${settings.model.includes('claude') ? 'active' : ''}" type="button" data-model="claude-3-5-sonnet-20240620">Claude</button>
                    <button class="${settings.model.includes('deepseek') ? 'active' : ''}" type="button" data-model="deepseek-v4-pro">DeepSeek</button>
                  </div>
                  <p class="form-hint" style="margin-top:8px;">
                    当前模型：<code>${settings.model}</code>
                  </p>
                  <p class="form-hint">提示：根据你的 API 地址选择对应的模型。DeepSeek 仅支持 deepseek-v4-pro / deepseek-v4-flash。</p>
                </div>

                <div class="panel-section">
                  <h2>PDF 文献</h2>
                  ${pdfFileName ? `
                    <div class="pdf-info">
                      <span>📄 ${pdfFileName}</span>
                      <button data-remove-pdf>移除</button>
                    </div>
                    <p class="form-hint" style="margin-top:6px;">${(pdfText.length / 1000).toFixed(1)}k 字符已提取</p>
                  ` : `
                    <div class="pdf-upload-area" data-pdf-upload>
                      <div style="font-size:28px;margin-bottom:8px;">📄</div>
                      <div style="font-size:13px;">点击或拖拽上传 PDF</div>
                      <div style="font-size:11px;color:var(--muted);margin-top:4px;">纯前端解析，不上传服务器</div>
                    </div>
                    <input type="file" accept=".pdf" data-pdf-input style="display:none;" />
                  `}
                </div>

                <div class="panel-section compact">
                  <h2>连接状态</h2>
                  <p>
                    <span class="status-dot" style="background:${settings.apiKey ? 'var(--teal)' : '#e7b84b'};"></span>
                    <span>${settings.apiKey ? 'API 已配置' : '请先配置 API Key'}</span>
                  </p>
                </div>
              </aside>

              <section class="chat-panel" aria-label="Chat area">
                <div class="chat-messages" data-chat-messages>
                  ${chatHistory.length === 0 ? `
                    <div style="text-align:center;padding:60px 20px;color:var(--muted);">
                      <div style="font-size:48px;margin-bottom:16px;">🎓</div>
                      <h3 style="margin:0 0 8px;color:var(--ink);">开始你的学术研究</h3>
                      <p style="margin:0;font-size:14px;line-height:1.8;">
                        上传 PDF 论文，选择插件功能，<br>或直接输入问题开始对话。
                      </p>
                      ${!settings.apiKey ? `
                        <p style="margin-top:16px;font-size:13px;color:var(--orange);">
                          ⚠️ 请先点击右上角"设置"配置 API Key
                        </p>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>

                <div class="input-area">
                  <div class="plugin-bar" data-plugin-bar>
                    ${Object.values(pluginTemplates).map(p =>
                      `<button class="plugin-chip" data-plugin="${p.label}">${p.icon} ${p.label}</button>`
                    ).join('')}
                  </div>
                  <div class="input-row">
                    <textarea data-input placeholder="输入你的问题... (Enter 发送，Shift+Enter 换行)" rows="2"></textarea>
                    <button class="send-button" data-send>发送</button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section class="plugin-section" id="plugins">
          <div class="section-copy narrow">
            <h2>学术插件，即点即用</h2>
            <p>点击下方插件卡片可直接启动对应功能。上传 PDF 后，插件会自动将论文内容注入上下文。</p>
          </div>
          <div class="plugin-grid">
            ${Object.values(pluginTemplates).map((p, i) => `
              <article>
                <span>0${i+1}</span>
                <h3>${p.icon} ${p.label}</h3>
                <p>${getPluginDescription(p.label)}</p>
                <button class="ghost-button" style="margin-top:12px;width:100%;" data-plugin-card="${p.label}">立即使用</button>
              </article>
            `).join('')}
          </div>
        </section>

        <section class="reader-section" id="reader">
          <div class="section-copy">
            <h2>论文阅读流：上传 → 解析 → 分析</h2>
            <p>上传 PDF 后自动提取文本，配合插件一键完成翻译、总结、综述等任务。所有解析在本地浏览器完成，保护隐私。</p>
          </div>
          <div class="reader-grid">
            <article class="paper-view">
              <div class="paper-meta"><span>PDF 解析</span><span>本地完成</span></div>
              <h3>基于 pdf.js 的纯前端解析</h3>
              <p>使用 Mozilla 的 pdf.js 库，在浏览器本地解析 PDF 文件，提取文本内容。整个过程不上传任何数据到服务器，确保论文隐私安全。</p>
              <mark>支持多语言 PDF：英文、中文、日文等。扫描版 PDF 需先 OCR。</mark>
            </article>
            <article class="analysis-view">
              <h3>使用说明</h3>
              <ul>
                <li>在左侧栏上传 PDF，等待解析完成</li>
                <li>选择一个学术插件（如论文总结、翻译等）</li>
                <li>AI 自动读取论文内容并生成结果</li>
                <li>可以继续追问，支持多轮对话</li>
                <li>结果可导出为 Markdown 文件</li>
              </ul>
              <button class="ghost-button" type="button" data-scroll-to-workspace>📂 前往工作台</button>
            </article>
          </div>
        </section>
      </main>
    </div>

    <div data-settings-modal style="display:none;"></div>
  `;

  renderMessages();
  bindEvents();
}

function getPluginDescription(label) {
  const desc = {
    '论文翻译': '段落对照、术语保留、Markdown 导出。',
    '论文总结': '结构化总结：问题、方法、实验、局限。',
    '文献综述': '按主题整合文献，生成可续写的章节。',
    '代码解释': '读取仓库结构，解析函数调用与实验脚本。',
    '学术润色': '优化语言表达，提升学术写作规范。',
    '审稿意见': '模拟审稿人视角，给出专业评审意见。'
  };
  return desc[label] || '';
}

function renderMessages() {
  const container = document.querySelector('[data-chat-messages]');
  if (!container) return;
  if (chatHistory.length === 0) return;

  container.innerHTML = chatHistory.map(msg => {
    if (msg.role === 'system') {
      return `<div class="msg system">${msg.content}</div>`;
    }
    if (msg.role === 'error') {
      return `<div class="msg error">❌ ${msg.content}</div>`;
    }
    const contentHtml = msg.role === 'assistant' ? mdToHtml(msg.content) : escapeHtml(msg.content);
    return `<div class="msg ${msg.role}">${contentHtml}</div>`;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function bindEvents() {
  const sendBtn = document.querySelector('[data-send]');
  const input = document.querySelector('[data-input]');

  sendBtn?.addEventListener('click', () => sendMessage());

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  document.querySelectorAll('[data-plugin]').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.plugin;
      applyPlugin(label);
    });
  });

  document.querySelectorAll('[data-plugin-card]').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.dataset.pluginCard;
      document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => applyPlugin(label), 300);
    });
  });

  document.querySelector('[data-scroll-to-workspace]')?.addEventListener('click', () => {
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('[data-model]').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.model = btn.dataset.model;
      saveSettings();
      document.querySelectorAll('[data-model]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const codeEl = document.querySelector('.panel-section code');
      if (codeEl) codeEl.textContent = settings.model;
    });
  });

  document.querySelector('.settings-model-custom')?.addEventListener('click', () => {
    const name = prompt('输入模型名称：', settings.model);
    if (name && name.trim()) {
      settings.model = name.trim();
      saveSettings();
      document.querySelectorAll('[data-model]').forEach(b => b.classList.remove('active'));
      const codeEl = document.querySelector('.panel-section code');
      if (codeEl) codeEl.textContent = settings.model;
    }
  });

  document.querySelector('[data-open-settings]')?.addEventListener('click', openSettingsModal);
  document.querySelector('[data-clear-chat]')?.addEventListener('click', clearChat);
  document.querySelector('[data-export]')?.addEventListener('click', exportChat);

  document.querySelector('[data-panel-toggle]')?.addEventListener('click', () => {
    document.querySelector('[data-control-panel]')?.classList.toggle('is-open');
  });

  const pdfUpload = document.querySelector('[data-pdf-upload]');
  const pdfInput = document.querySelector('[data-pdf-input]');

  pdfUpload?.addEventListener('click', () => pdfInput?.click());
  pdfInput?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) handlePdfFile(e.target.files[0]);
  });

  pdfUpload?.addEventListener('dragover', (e) => {
    e.preventDefault();
    pdfUpload.classList.add('dragover');
  });
  pdfUpload?.addEventListener('dragleave', () => {
    pdfUpload.classList.remove('dragover');
  });
  pdfUpload?.addEventListener('drop', (e) => {
    e.preventDefault();
    pdfUpload.classList.remove('dragover');
    if (e.dataTransfer.files?.[0]) handlePdfFile(e.dataTransfer.files[0]);
  });

  document.querySelector('[data-remove-pdf]')?.addEventListener('click', () => {
    pdfText = '';
    pdfFileName = '';
    renderApp();
  });
}

async function handlePdfFile(file) {
  if (!file.name.endsWith('.pdf')) {
    alert('请上传 PDF 文件');
    return;
  }

  const statusEl = document.querySelector('[data-chat-messages]');
  if (statusEl && chatHistory.length === 0) {
    statusEl.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--muted);">
        <div style="font-size:48px;margin-bottom:16px;">⏳</div>
        <p>正在解析 PDF：${escapeHtml(file.name)}</p>
      </div>
    `;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += `\n\n--- Page ${i} ---\n\n${pageText}`;
    }

    pdfText = text;
    pdfFileName = file.name;

    chatHistory.push({
      role: 'system',
      content: `已上传论文：${file.name}（${pdf.numPages} 页，${(text.length / 1000).toFixed(1)}k 字符）。选择插件或直接提问，我会结合论文内容回答。`
    });
    saveHistory();
    renderApp();
  } catch (err) {
    chatHistory.push({ role: 'error', content: `PDF 解析失败：${err.message}` });
    saveHistory();
    renderApp();
  }
}

function applyPlugin(label) {
  const template = pluginTemplates[label];
  if (!template) return;

  const input = document.querySelector('[data-input]');
  if (!input) return;

  let content = template.prompt;
  if (pdfText) {
    content += `\n${pdfText.slice(0, 15000)}`;
    if (pdfText.length > 15000) {
      content += `\n\n... (论文过长，已截取前 15k 字符，共 ${(pdfText.length/1000).toFixed(0)}k)`;
    }
  } else {
    content += '\n（请先上传 PDF 论文，或粘贴论文内容到此处）';
  }

  input.value = content;
  input.focus();
  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function sendMessage() {
  const input = document.querySelector('[data-input]');
  const text = input?.value.trim();
  if (!text || isGenerating) return;
  if (!settings.apiKey) {
    alert('请先配置 API Key！点击右上角"设置"按钮。');
    openSettingsModal();
    return;
  }

  chatHistory.push({ role: 'user', content: text });
  saveHistory();
  input.value = '';
  isGenerating = true;

  renderMessages();

  const messagesContainer = document.querySelector('[data-chat-messages]');
  const assistantMsg = document.createElement('div');
  assistantMsg.className = 'msg assistant';
  assistantMsg.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  messagesContainer?.appendChild(assistantMsg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const messages = buildMessages(text);
    let fullText = '';
    await callChatAPI(messages, (chunk) => {
      fullText = chunk;
      assistantMsg.innerHTML = mdToHtml(fullText);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    chatHistory.push({ role: 'assistant', content: fullText });
    saveHistory();
  } catch (err) {
    assistantMsg.remove();
    chatHistory.push({ role: 'error', content: err.message });
    saveHistory();
    renderMessages();
  } finally {
    isGenerating = false;
  }
}

function clearChat() {
  if (!confirm('确定清空所有对话记录吗？')) return;
  chatHistory = [];
  saveHistory();
  renderApp();
}

function exportChat() {
  if (chatHistory.length === 0) {
    alert('没有可导出的对话');
    return;
  }
  let md = '# GPT Academic 对话记录\n\n';
  md += `导出时间：${new Date().toLocaleString()}\n\n`;
  md += `模型：${settings.model}\n\n---\n\n`;
  for (const msg of chatHistory) {
    if (msg.role === 'user') md += `## 🧑‍💻 用户\n\n${msg.content}\n\n`;
    else if (msg.role === 'assistant') md += `## 🤖 AI\n\n${msg.content}\n\n`;
    else if (msg.role === 'system') md += `> ℹ️ ${msg.content}\n\n`;
    else if (msg.role === 'error') md += `> ❌ ${msg.content}\n\n`;
  }
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gpt-academic-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function openSettingsModal() {
  const modal = document.querySelector('[data-settings-modal]');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-overlay" data-modal-overlay>
      <div class="modal-card">
        <div class="modal-header">
          <h3>⚙️ API 设置</h3>
          <button class="modal-close" data-modal-close>×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>API Key</label>
            <input type="password" data-setting-key value="${settings.apiKey}" placeholder="sk-..." />
            <p class="form-hint">密钥只保存在你浏览器的 localStorage，不会上传到任何服务器。</p>
          </div>
          <div class="form-row">
            <label>API Base URL</label>
            <input type="text" data-setting-url value="${settings.baseUrl}" placeholder="https://api.openai.com/v1" />
            <p class="form-hint">支持 OpenAI 兼容接口（如 Azure OpenAI、OneAPI、DeepSeek、通义等）。</p>
          </div>
          <div class="form-row">
            <label>模型名称</label>
            <input type="text" data-setting-model value="${settings.model}" />
            <p class="form-hint">例如 gpt-4o、gpt-3.5-turbo、claude-3-5-sonnet-20240620 等。</p>
          </div>
          <div class="form-row">
            <label>系统提示词</label>
            <textarea data-setting-system rows="3" style="width:100%;min-height:80px;padding:10px;border:1px solid var(--line);border-radius:8px;background:#fbfdff;">${settings.systemPrompt}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="ghost-button" data-modal-close>取消</button>
          <button class="primary-button" data-save-settings>保存</button>
        </div>
      </div>
    </div>
  `;
  modal.style.display = 'block';

  modal.querySelector('[data-modal-close]').addEventListener('click', closeSettingsModal);
  modal.querySelector('[data-modal-overlay]').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSettingsModal();
  });

  modal.querySelector('[data-save-settings]').addEventListener('click', () => {
    settings.apiKey = modal.querySelector('[data-setting-key]').value.trim();
    settings.baseUrl = modal.querySelector('[data-setting-url]').value.trim();
    settings.model = modal.querySelector('[data-setting-model]').value.trim();
    settings.systemPrompt = modal.querySelector('[data-setting-system]').value.trim();
    saveSettings();
    closeSettingsModal();
    renderApp();
  });
}

function closeSettingsModal() {
  const modal = document.querySelector('[data-settings-modal]');
  if (modal) {
    modal.style.display = 'none';
    modal.innerHTML = '';
  }
}

renderApp();
