export const content: Record<string, string> = {
  "installing-personas": `
## 安装 Personas

在你的电脑上安装 Personas 大约需要一分钟。从下载页面获取适合你操作系统的安装包 — Windows、macOS 或 Linux — 然后运行它。安装包是单个文件,没有设置向导;双击,批准安全提示,应用就会启动。更新会在后台自动交付,所以你始终拥有最新版本,无需任何操作。

第一次打开应用时,你会看到欢迎界面。从这里你可以直接开始构建 agent(Personas 会在需要时提示你配置 AI 提供商),或者如果你已经有了想要存储的 API key,可以先打开凭证 vault。两条路径都可以。

:::steps
1. **下载安装包** — 选择适合你操作系统的文件(Windows 上是 NSIS \`.exe\`,macOS 上是 \`.dmg\`,Linux 上是 \`.AppImage\` 或 \`.deb\`)
2. **运行安装包** — 在 Windows 上双击,在 macOS 上拖到应用程序文件夹,在 Linux 上执行
3. **批准安全提示** — 你的操作系统可能会要求确认;对于新桌面软件这是正常的
4. **启动 Personas** — 欢迎界面会打开,带有可选的引导教程
5. **可选:连接提供商** — 如果你想立即开始构建,可以在 Connections 页面粘贴 API key
:::

:::info
适用于 **Windows 10+**、**macOS 12+** 以及大多数现代 **Linux** 发行版。Windows 安装包是 53 MB 的 NSIS \`.exe\`;安装后的二进制文件约为 90 MB。自动更新仅传输增量,因此通常体积小得多。
:::

:::tip
如果遇到 Windows SmartScreen 或 macOS Gatekeeper 警告,这是你的操作系统对新软件的谨慎。批准后即可继续 — 安装包已经过代码签名。
:::
  `,

  "creating-your-first-agent": `
## 创建你的第一个 agent

从空白到工作助手,你的第一个 agent 大约需要五分钟。你有两条路径:**从模板开始**(推荐用于第一个 agent — 构建引擎会根据你的回答组装出可工作的配置),或**从零开始**(完全手动控制)。两者最终都会到达同一个目的地:一个可以运行的 agent。

如果你选择模板路径,构建引擎会启动一个交互式会话。它会分批提出澄清问题("你期望什么样的输入?","输出应该去哪里?","应该多久运行一次?"),根据你的答案提出参数建议,并实时预览即将构建的 agent。你在最后确认,然后 agent 就可以测试了。

如果你选择从零开始的路径,你自己编写 prompt、选择 AI 模型、附加工具,然后保存。

:::steps
1. **打开 Agents 页面** — 侧边栏 → Agents,或按 \`Ctrl+1\` 直接跳转
2. **点击 Create Agent** — 选择一条路径:选模板或从空白开始
3. **回答构建问题(模板路径)** — 构建引擎按能力分批提出澄清问题,并随着你的回答实时预览 agent 的形态
4. **调整 prompt 和工具** — 微调模板生成的指令(或从零开始编写)
5. **准备就绪后提升** — 将 agent 从草稿状态移到激活状态;在你可以提升之前,setup-status 检查会自动运行,标记任何未连接的凭证或未配置的触发器
:::

### 工作原理

模板路径是获得一个 *好* agent 最快的方式(模板由我们设计和测试),但你最终会超越它。一旦你部署过几个基于模板的 agent,你就会开始直接编写 prompt,并将模板视为起点而非完整解决方案。

:::tip
不必担心要把第一个 agent 做到完美。版本历史(后文会讲)意味着你可以自由实验 — 每次保存都是一个可以返回的检查点。
:::
  `,

  "understanding-the-interface": `
## 了解界面

Personas 界面有三个主要区域。左侧的**侧边栏**是你的顶层导航 — Home、Overview、Agents、Events、Connections、Templates、Plugins、Schedules、Pipeline、Deployment 和 Settings。点击一个顶层部分,会出现显示其子页面的二级导航(例如,点击 Agents 会显示 All Agents,以及当前选中 agent 的编辑器选项卡:Prompt、Connectors、Lab、Activity、Health、Settings)。

中央区域是**工作区**,所有事情实际上都在这里发生 — 编辑 prompt、观察执行、浏览凭证目录。顶部的**标题栏**包含通知铃铛(点击查看最新的执行详情)、cockpit 入口("Talk to Athena")以及全局搜索。**底部条**显示活跃的执行和任何紧急的系统事件。

| 区域 | 作用 |
|------|-------------|
| Sidebar Level 1 | 顶层部分 — Home、Overview、Agents、Events、Connections、Templates、Plugins、Schedules、Pipeline、Deployment、Settings |
| Sidebar Level 2 | 当前活跃部分的上下文敏感二级导航 |
| Workspace | 你所在部分的主要编辑器/浏览器/仪表盘 |
| Title bar | 通知铃铛、cockpit 快捷方式、全局搜索、应用控件 |
| Bottom strip | 活跃的执行、系统状态 |

### 工作原理

你的大部分操作都是通过点击侧边栏项目并在工作区中编辑来完成的。标题栏的通知铃铛是唯一值得记住的通用快捷方式 — 无论你在哪里,它总是打开最新的执行详情。Cockpit 快捷方式("Talk to Athena")在应用内打开一个与同伴的聊天,该同伴可以帮助你构建、调试,或者只是回答有关你设置的问题。

:::tip
将鼠标悬停在任何侧边栏图标上即可看到带有键盘快捷键的提示。\`Ctrl+1\` 到 \`Ctrl+9\` 直接跳转到顶层部分,\`Ctrl+K\` 打开全局搜索,这样你就可以按名称查找任何内容。
:::
  `,

  "what-is-an-ai-agent": `
## 什么是 AI agent?

AI agent 是一个有工作的配置好的 AI 模型。你给它指令("阅读我的未读邮件并总结重要的"),告诉它可以使用哪些工具,然后触发它 — 通过按钮手动触发、按计划、按事件,或作为 pipeline 中的一步。Agent 读取触发器的载荷,遵循你的指令,根据需要调用任何工具,并产生输出。与聊天机器人不同,agent 会采取行动:发送邮件、写入文件、发布到 Slack。

Personas 中的每个 agent 都是持久的 — 它会记住自己的设置、历史、凭证以及(可选)过去运行的 memory。你可以克隆它,对它的 prompt 进行版本控制,在 arena 中将它与替代 prompt 对比以查看哪个表现更好,并将它与其他 agent 链接起来构建多步骤工作流。

:::compare
**Chatbot**
你输入问题,它回复。每一轮都是一次性的。适用于快速查询、头脑风暴、起草。没有动作,会话间没有 memory,没有自动化。
---
**AI Agent** [recommended]
带有工作的持久化配置。手动或自动触发;使用工具采取行动;有版本控制的 prompt、附加的凭证、执行历史和健康指示器。模型是引擎,但 agent 是围绕模型的整个组合。
:::

### 工作原理

:::diagram
[Trigger fires] --> [Agent reads input] --> [Model + tools execute] --> [Output dispatched]
:::

触发器打包输入载荷(webhook 主体、剪贴板字符串、文件路径、来自另一个 agent 的事件……)。Agent 读取它的 prompt,连同输入一起喂给 AI 模型,让模型根据需要调用附加的工具。最终输出通过你配置的任何输出通道分发 — 返回到 UI、写入文件、发布到 Slack,或作为下一个 agent 的输入链入。

:::tip
理解 agent 最快的方法是审视你每周重复的任务,问自己:"这件事能否被触发、被指令、被自动化?"如果可以,那个任务就是一个 agent。
:::
  `,

  "running-your-first-automation": `
## 运行你的第一个自动化

创建 agent 后,你有多种方式启动它。最简单的是 agent 编辑器顶部的手动 **Run** 按钮 — 点击它,你会在 activity 面板中看到实时执行流。几秒钟内(对于较慢的提供商或较长的 prompt 可能需要几分钟),输出就会出现。

对于重复的工作,添加 schedule 触发器、webhook 触发器、file-watcher 触发器或 chain 触发器,让 agent 自动运行。你设置一次触发器,agent 处理其余的事情。

:::steps
1. **打开 agent** — 在 Agents 页面找到它;编辑器打开时聚焦在 Prompt 选项卡
2. **点击 Run** — 工作区自动切换到 Activity 选项卡;你会看到 prompt 被构造、模型调用发出,以及 token 流回
3. **观察实时流** — 每个 agent 都有自己的流,所以你可以并行运行多个而不会混淆
4. **审查输出** — activity 行展开以显示完整的 prompt、模型响应、任何工具调用、持续时间和成本
5. **迭代** — 更改 prompt 或设置,保存,再次运行;每次运行都会被检查点保存
:::

### 工作原理

一次运行是一次单独执行:trigger → prompt-construction → model-call → tool-calls → output。每一步都被捕获到执行追踪中,运行会出现在 Overview 页面的 Activity 选项卡(跨所有 agent 的全局视图)和 agent 自己的 Activity 选项卡中。从任一位置你都可以点击进入运行以查看完整的详情模态框。

如果运行失败(模型错误、凭证过期、网络故障),agent 的健康指示器会变黄或红色,失败会保留在追踪中以便你调试。

:::tip
你的第一次运行部分是为了了解你的 prompt 在实际中究竟做了什么。如果输出不是你想要的,追踪会准确显示模型收到了什么 — 通常修复方法是澄清或限制 prompt,而不是重试。
:::
  `,

  "choosing-your-ai-provider": `
## 选择你的 AI 提供商

Personas 支持主要的 AI 提供商 — **Anthropic**(Claude 系列)、**OpenAI**(GPT 系列)、**Google**(Gemini),以及通过 Ollama 或任何 OpenAI 兼容端点的**本地模型**。你也可以在 Settings → Custom Models 中配置自定义提供商。每个 agent 独立选择其提供商/模型,因此你可以在常规工作上运行便宜的模型,并将昂贵的模型保留给真正需要它们的任务。

在 Connections 页面连接一次提供商(你需要粘贴 API key — 在本地 vault 中加密 — 或对于支持 OAuth 的提供商运行 OAuth 流程)。之后,每个 agent 的模型选择器都会显示已配置的提供商及其模型。

:::compare
**Anthropic Claude** [recommended]
强大的指令遵循能力、长上下文推理、结构化输出。Sonnet 4.6 是新 agent 的默认选择。Opus 模型用于最困难的推理,Haiku 用于速度/成本。在工具使用循环方面表现出色。
---
**OpenAI GPT**
最广泛的生态系统,对许多用例经过最多测试。可靠的全能选手;GPT-4o 级别的模型在通用助手工作方面表现强劲。
---
**Google Gemini**
多模态、大上下文窗口、快速首 token 延迟。在研究/文档处理 agent 方面表现强劲。
---
**Local (Ollama / OpenAI-compatible)**
在你的机器上运行 — 零数据离开设备。模型更小,但对于低风险或私密工作,这种权衡通常是值得的。
:::

### 工作原理

一旦连接了多个提供商,Personas 可以在 agent 层级进行自动故障转移:如果你的主要提供商返回错误超过阈值,该 agent 的下一次运行将使用配置的备用提供商。当主要提供商恢复时,正常轮换继续。这在每个 agent 的 Editor → Settings 选项卡中配置。

对于成本跟踪,每次运行都标记了提供商、模型和 token 数量,因此 Overview → Usage 选项卡可以按提供商、模型或 agent 细分开支。

### 实战示例

:::usecases
**按 agent 选模型的策略**
你的 agent 有不同的需求
---
代码审查 agent 使用 Claude Opus(最佳推理);邮件摘要 agent 使用 Haiku(快速且便宜);个人/私密 agent 在本地的 Ollama 上运行。
===
**提供商中断故障转移**
某个提供商发生区域性中断
---
受影响的 agent 自动路由到配置的备用提供商;Health 选项卡显示哪些 agent 正在使用备用提供商运行,并在主要提供商恢复后呈现恢复信息。
===
**降低成本**
每月 AI 开支不断增长
---
Overview → Usage 显示哪些 agent 和模型在开支中占主导地位。将开支最高的 agent 切换到更便宜的层级(Sonnet → Haiku,GPT-4o → GPT-4o-mini);Lab 可以先对它们进行 A-B 测试以确认质量保持不变。
:::

:::info
新 agent 的默认提供商在 Settings → Engine 中设置。你可以在每个 agent 上覆盖。
:::

:::tip
大多数提供商提供免费试用额度。连接两三个,在 Lab arena 中对每个运行相同的 prompt — 你会感受到风格差异,并选择一个适合你风格的默认选项。
:::
  `,


  "system-requirements": `
## 系统要求

Personas 是一个 Tauri 桌面应用 — Rust 后端、React 前端、本地 SQLite 数据库 — 它有意保持轻量。大部分繁重的计算发生在 AI 提供商的服务器上,而不是你的机器上。应用在空闲时 CPU 接近零占用,使用几百兆字节的内存;只有在 agent 在本地活跃运行时才会扩展。

安装后的二进制文件约为 90 MB。如果你启用插件(用于图像生成的 Artist、用于向量搜索的 Obsidian Brain),可能会增加占用空间。

:::checklist
- Windows 10+、macOS 12+ 或 Ubuntu 20.04+(推荐最新版本)
- 最少 4 GB 内存(如果使用 embeddings/向量搜索插件,推荐 8 GB+)
- 1 GB 可用磁盘空间(启用 Artist 插件的本地模型时需要更多)
- 稳定的宽带 — agent 执行受 AI 提供商 API 延迟约束
- 任何现代双核 CPU;并行多 agent 运行推荐四核或更好
:::

### 工作原理

应用在你操作系统的应用数据目录中本地存储其数据库(\`personas.db\`)、凭证 vault、执行历史和配置。除非你明确启用云部署或使用云 AI 提供商,否则什么都不会上传。包含本地模型的插件(例如 Artist 插件的图像生成 + Gemini 视觉)会在首次使用时下载模型文件。

启用向量知识库功能时,Windows 构建使用 ONNX Runtime 进行 embedding;在这种情况下,这是最大的单个依赖。

:::tip
如果你在多 agent 运行期间感到应用变慢,打开 Health 选项卡 — 它会显示哪些 agent 和哪些依赖项(模型调用、工具调用、ONNX 推理)正在为负载做贡献。
:::
  `,

  "keyboard-shortcuts-and-tips": `
## 键盘快捷键和技巧

几个键盘快捷键可以覆盖应用中大部分的摩擦。\`Ctrl+K\` 打开全局搜索(按名称查找任何 agent、页面或设置)。\`Ctrl+1\`–\`Ctrl+9\` 跳转到顶层侧边栏部分。\`Ctrl+Enter\` 运行当前聚焦的 agent。\`Ctrl+N\` 打开 Create Agent 流程。

你可以在 Settings → Appearance → Keyboard Shortcuts 中自定义任何快捷键绑定;默认设置尽可能遵循操作系统约定。

### 必备快捷键

:::keys
Ctrl+K — 全局搜索(按名称查找任何内容)
Ctrl+N — 创建新 agent
Ctrl+Enter — 运行聚焦的 agent
Ctrl+S — 保存当前编辑器中的更改
Ctrl+/ — 切换侧边栏开/关
Ctrl+, — 打开 Settings
Ctrl+? — 显示键盘快捷键速查表
:::

### 导航快捷键

:::keys
Ctrl+1 — Home
Ctrl+2 — Overview
Ctrl+3 — Agents
Ctrl+4 — Events
Ctrl+5 — Connections
Ctrl+6 — Templates
Ctrl+7 — Plugins
Ctrl+Shift+P — 打开命令面板(按名称运行任何操作)
:::

### 工作原理

命令面板(\`Ctrl+Shift+P\`)是高级用户的界面。输入一个动词(\`run\`、\`clone\`、\`disable\`、\`open\`)加上目标名称,面板会显示整个工作区中匹配的操作。一旦你了解了事物的名称,这比手动导航更快。

:::tip
从 \`Ctrl+K\` 开始。输入 agent 名称的几个字母并按 Enter — 这一个快捷键覆盖了大约 60% 的日常导航。
:::
  `,

  "where-to-get-help": `
## 在哪里获取帮助

你永远不会被困住。**应用内帮助**是最快的途径:cockpit 聊天(标题栏中的 "Talk to Athena")是一个由 LLM 驱动的同伴,它了解你的设置、最近的执行和产品。用平实的语言向它提问,它还可以提出配置更改建议、链接你到正确的选项卡,或对失败的运行打开调试会话。

对于应用内同伴无法回答的问题,**指南**(本站)是长篇参考资料,**社区 Discord** 是你向其他用户和团队提问的地方,**电子邮件支持**用于账户或计费问题。

| 资源 | 最适合 | 响应时间 |
|----------|----------|---------------|
| Cockpit / Athena(应用内) | 设置问题、调试、"X 在哪里?" | 即时 |
| 本指南 | 功能参考和操作指南 | 即时 |
| 文档站点 | 架构、schema、高级集成 | 即时 |
| Discord 社区 | 技巧、配方、"还有人遇到……吗?" | 几分钟 |
| 支持邮箱 | 账户、计费、安全 | 几小时 |
| 视频教程 | 关键流程的可视化讲解 | 即时 |

### 工作原理

Cockpit 可以访问 doctrine — 关于产品的策划知识体 — 以及你的本地状态(匿名化)。它可以搜索你的执行记录、推荐更改,甚至构建内联 UI 卡片以引导你逐步修复。如果它无法回答,它会建议正确的外部资源。

:::tip
对于"我觉得某些东西坏了"的问题,先打开 Athena 并询问"诊断 agent X 的最后一次失败运行"。Cockpit 的调试流程就是为此而构建,通常胜过手动阅读日志。
:::
  `,
};
