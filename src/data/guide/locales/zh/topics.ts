export const topics: Record<string, { title: string; description: string }> = {
  "installing-personas": {
    title: "安装 Personas",
    description: "如何在 Windows、macOS 或 Linux 上下载和安装。安装包是单个文件 — 下载它,运行它,你在一分钟内就准备好了。",
  },
  "creating-your-first-agent": {
    title: "你的第一个 agent",
    description: "构建你第一个 AI agent 的分步演练。你将在大约五分钟内从空白状态到一个可工作的 agent。最后,你将拥有一个可以为你执行真实任务的个人助手。",
  },
  "understanding-the-interface": {
    title: "应用界面",
    description: "主屏幕、侧边栏和导航的浏览。了解一切的位置,这样你就可以自信地在应用中移动。把它想象成在开始构建之前的快速定向。",
  },
  "what-is-an-ai-agent": {
    title: "什么是 AI agent?",
    description: "用平实的英语解释什么是 agent 以及它们能为你做什么。Agent 就像一个智能助手,它按照你的指令自动完成任务。理解或使用它们不需要编程知识。",
  },
  "running-your-first-automation": {
    title: "运行你的第一个自动化",
    description: "如何执行 agent 并看它工作。你将按下按钮,观察 agent 执行任务,然后审查结果。它就像在食谱上按下播放 — 你的 agent 做烹饪。",
  },
  "choosing-your-ai-provider": {
    title: "选择你的 AI 提供商",
    description: "如何连接 Claude、OpenAI 或其他 AI 服务来为你的 agent 提供动力。每个提供商都有不同的优势,你可以随时切换。我们将帮助你选择最适合你需求和预算的提供商。",
  },
  "system-requirements": {
    title: "系统要求",
    description: "你的电脑流畅运行 Personas 需要什么。该应用轻量且适用于大多数现代计算机。我们会告诉你最低规格以及获得最佳体验所推荐的配置。",
  },
  "keyboard-shortcuts-and-tips": {
    title: "键盘快捷键和技巧",
    description: "使用内置快捷键加速你的工作流。一旦你了解几个关键组合,常见任务就会几乎瞬间完成。本指南按你最常做的事情组织最有用的快捷键。",
  },
  "where-to-get-help": {
    title: "在哪里获取帮助",
    description: "Discord 社区、文档和支持资源都集中在一处。无论你喜欢与其他用户聊天、阅读指南还是提交支持请求,我们都为你提供。你永远不会一个人被困住。",
  },
  "creating-a-new-agent": {
    title: "创建新 agent",
    description: "如何设置一个带有名称、图标和目的的 agent。给 agent 一个清晰的身份有助于你在集合增长时保持组织。你还将选择哪个 AI 模型为它提供动力以及它可以使用哪些工具。",
  },
  "writing-effective-prompts": {
    title: "编写有效的 prompt",
    description: "编写 agent 将精确遵循的指令的技巧。好的 prompt 就像好的食谱 — 清晰、具体、按正确顺序。微小的措辞变化可以显著改善你 agent 的结果。",
  },
  "simple-vs-structured-prompt-mode": {
    title: "Simple 模式与 Structured 模式对比",
    description: "何时使用纯文本与高级多部分编辑器。Simple 模式非常适合快速任务 — 只需输入你想要的内容。Structured 模式为你提供身份、指令和示例的单独部分,这有助于处理更复杂的 agent。",
  },
  "structured-prompt-sections-explained": {
    title: "结构化 prompt 各部分详解",
    description: "每个部分 — 身份、指令、工具、示例和错误处理 — 对你的 agent 起什么作用。把这些部分想象成你为新员工编写的手册中的章节。每一个都给你的 agent 不同类型的指导。",
  },
  "agent-settings-and-limits": {
    title: "Agent 设置与限制",
    description: "配置超时、并发、预算上限和最大回合数。这些设置就像护栏 — 它们防止 agent 运行太长时间或花费太多。设置一次,你的 agent 就保持良好行为。",
  },
  "assigning-tools-to-agents": {
    title: "为 agent 分配工具",
    description: "授予 agent 访问特定能力的权限,比如发送邮件、读取文件或搜索网页。工具就像手机上的应用 — 你的 agent 只能使用你安装的那些。这保持事情安全和专注。",
  },
  "prompt-version-history": {
    title: "Prompt 版本历史",
    description: "你的 prompt 的每次更改都被跟踪,这样你总是可以回去。每次保存时,都会自动创建快照。如果更改使事情变得更糟,你可以一键恢复任何先前的版本。",
  },
  "comparing-prompt-versions": {
    title: "对比 prompt 版本",
    description: "并排差异以准确查看你的 prompt 两个版本之间发生了什么变化。新增内容以绿色突出显示,删除以红色突出显示 — 就像跟踪文档中的更改一样。这使得理解什么改善或破坏了你的 agent 变得容易。",
  },
  "cloning-and-duplicating-agents": {
    title: "克隆和复制 agent",
    description: "创建 agent 的副本以无风险地实验。克隆让你在副本上尝试新想法,而原始 agent 保持不变。这是改进已经工作良好的 agent 最安全的方式。",
  },
  "agent-groups-and-organization": {
    title: "Agent 分组与组织",
    description: "使用文件夹和标签保持你的 agent 有组织。随着你的 agent 集合增长,组帮助你快速找到所需的内容。你可以在组之间拖放 agent,折叠你不使用的部分。",
  },
  "disabling-and-archiving-agents": {
    title: "禁用和归档 agent",
    description: "安全地暂停或删除你不再需要的 agent。禁用 agent 阻止它运行,但保持所有设置完整。归档将它收起,这样你的工作区保持干净,而不会丢失任何东西。",
  },
  "agent-health-indicators": {
    title: "Agent 健康指示器",
    description: "了解状态点及其含义。绿色表示一切运行顺畅,黄色表示需要注意,红色表示有问题要修复。这些指示器让你一目了然地发现问题,而无需深入查看日志。",
  },
  "how-triggers-work": {
    title: "触发器如何工作",
    description: "了解自动启动 agent 的不同方式。触发器就像 agent 的闹钟 — 当满足正确条件时,它们会醒来并完成工作。你可以混合搭配触发器类型以获得最大灵活性。",
  },
  "manual-triggers": {
    title: "手动触发器",
    description: "用一次点击按需运行 agent。有时你只想按下按钮让 agent 做事。手动触发器是在你需要时启动 agent 的最简单方式。",
  },
  "schedule-triggers": {
    title: "计划触发器",
    description: "设置 agent 在特定时间运行 — 每小时、每天或按自定义计划。它就像设置一个重复闹钟,告诉 agent 何时醒来工作。非常适合你希望自动处理的常规任务。",
  },
  "webhook-triggers": {
    title: "Webhook 触发器",
    description: "从外部服务接收数据以启动你的 agent。Webhook 就像门铃 — 当另一个应用按响它时,你的 agent 会回应。这让 Stripe、GitHub 或 Shopify 等服务自动启动你的 agent。",
  },
  "clipboard-monitor": {
    title: "剪贴板监视器",
    description: "当你复制特定文本到剪贴板时激活的 agent。想象一下复制客户邮件后 agent 立即起草回复。剪贴板监视器观察你复制的内容,在匹配你的规则时立即采取行动。",
  },
  "file-watcher-triggers": {
    title: "文件监视触发器",
    description: "在你指定的文件夹中创建或更改文件时响应的 agent。将电子表格拖入文件夹,你的 agent 自动处理它。它就像有一个助手观察你的收件箱托盘并处理每个新文档。",
  },
  "chain-triggers": {
    title: "链触发器",
    description: "一个 agent 的输出自动启动队列中的下一个 agent。链让你构建装配线,每个 agent 处理一个步骤并将结果传递下去。这就是你如何将简单的 agent 转化为强大的多步骤工作流。",
  },
  "event-based-triggers": {
    title: "基于事件的触发器",
    description: "监听系统中发生的自定义事件的 agent。事件就像公告 — 当值得注意的事情发生时,感兴趣的 agent 听到并做出反应。这非常适合构建响应式、实时的自动化。",
  },
  "combining-multiple-triggers": {
    title: "组合多个触发器",
    description: "为复杂的工作流一起使用多种触发器类型。单个 agent 可以同时具有计划、webhook 和手动按钮。这意味着无论需求如何出现,你的 agent 都准备好工作。",
  },
  "testing-and-debugging-triggers": {
    title: "测试和调试触发器",
    description: "在你依赖触发器之前确保它们正确触发。触发器测试器让你模拟事件并查看会发生什么。及早捕获问题可以让你免于错过自动化和意外行为。",
  },
  "how-personas-keeps-your-data-safe": {
    title: "Personas 如何保护你的数据安全",
    description: "保护你信息的加密和安全模型概述。你的密码和密钥锁定在你自己电脑上的加密 vault 中 — 它们永远不会离开你的设备。你始终完全控制你的数据。",
  },
  "adding-a-new-credential": {
    title: "添加新凭证",
    description: "存储 API key 和密码以便你的 agent 可以使用它们的分步指南。该过程大约需要 30 秒 — 粘贴你的密钥,给它一个名称,完成。你的凭证立即加密,并准备好供你的 agent 使用。",
  },
  "oauth-setup-walkthrough": {
    title: "OAuth 设置演练",
    description: "一键连接 Google、GitHub 和 Slack 等服务。OAuth 让你登录服务并授予访问权限,而无需共享密码。这是你在网站上点击 \"Sign in with Google\" 时使用的相同安全登录流程。",
  },
  "understanding-the-credential-vault": {
    title: "了解凭证 vault",
    description: "AES-256 加密如何在你的设备上保护你的密钥。把 vault 想象成银行保险箱 — 即使有人获得了你的电脑,他们也不能在没有你的主密码的情况下读取你存储的密钥。你的密钥使用银行所用的相同标准加扰。",
  },
  "credential-health-checks": {
    title: "凭证健康检查",
    description: "确保你存储的凭证仍然有效。随着时间推移,API key 可能过期或权限可能更改。健康检查自动测试每个凭证,并在它们引起问题之前标记任何需要你注意的凭证。",
  },
  "auto-credential-browser": {
    title: "自动凭证浏览器",
    description: "让 AI 帮助你自动查找和配置凭证。不必在文档中查找正确的设置,自动浏览器会引导你完成每个服务的设置。它就像有一个精通技术的朋友在你身后观察。",
  },
  "which-agents-use-which-credentials": {
    title: "哪些 agent 使用哪些凭证",
    description: "跟踪 agent 之间的凭证使用情况。清晰的映射显示哪些 agent 依赖哪些凭证。在你删除或轮换密钥之前这特别有用 — 你会确切知道可能会受到什么影响。",
  },
  "refreshing-expired-tokens": {
    title: "刷新过期的令牌",
    description: "当凭证过期时会发生什么以及如何修复。某些服务要求你定期续订访问,就像续订借书证一样。Personas 在过期前警告你,并通过点击按钮使刷新变得容易。",
  },
  "deleting-credentials-safely": {
    title: "安全删除凭证",
    description: "在不破坏 agent 的情况下删除存储的密钥。在删除之前,Personas 会显示哪些 agent 依赖该凭证。你可以先重新分配它们,这样在删除旧凭证时不会停止工作。",
  },
  "connector-catalog": {
    title: "连接器目录",
    description: "浏览 40+ 个内置服务集成,可以立即使用。从邮件提供商到云存储,每个连接器都预配置好了,所以你不必弄清楚技术细节。只需选择服务,登录,你的 agent 就可以开始使用它。",
  },
  "what-are-pipelines": {
    title: "什么是 pipeline?",
    description: "多个 agent 如何协同处理复杂任务。Pipeline 就像装配线 — 每个 agent 做一个工作并将结果传递给下一个。这让你将大问题分解为小的、可管理的步骤。",
  },
  "the-team-canvas": {
    title: "Team Canvas",
    description: "使用可视化拖放编辑器构建 pipeline。画布是你安排 agent 并在它们之间绘制连接的工作区。它和在白板上排列便签一样直观。",
  },
  "adding-agents-to-a-pipeline": {
    title: "向 pipeline 添加 agent",
    description: "在画布上放置和配置 agent。从你的库中将 agent 拖到画布上,将它放在你想要的位置,并为此特定 pipeline 调整其设置。根据它的使用位置,每个 agent 的行为可能不同。",
  },
  "connecting-agents-with-data-flow": {
    title: "用数据流连接 agent",
    description: "绘制连接,这样一个 agent 的输出馈送下一个。从一个 agent 单击并拖动到另一个以创建连接。数据沿这些线流动,就像水通过管道 — 一个步骤的输出成为下一个步骤的输入。",
  },
  "pipeline-execution": {
    title: "Pipeline 执行",
    description: "运行完整的多 agent 工作流并观看它工作。当你点击运行时,每个 agent 在处理其步骤时点亮。你可以实时观察数据通过 pipeline 流动,就像观看多米诺骨牌按顺序倒下。",
  },
  "conditional-routing": {
    title: "条件路由",
    description: "根据条件将数据发送到不同的 agent。有时你需要 pipeline 根据情况采取不同的路径 — 就像将邮件分类到不同的盒子。条件路由让 pipeline 智能决定下一步该做什么。",
  },
  "team-members-and-roles": {
    title: "团队成员和角色",
    description: "为团队中的 agent 分配特定职责。你团队中的每个 agent 都有一个角色 — 研究员、写作者、审稿人等。明确的角色帮助 agent 一起工作,而不会互相干扰。",
  },
  "pipeline-run-history": {
    title: "Pipeline 运行历史",
    description: "审查过去的执行及其结果。每次 pipeline 运行都记录了每个步骤的时间戳、输入、输出和状态。这使得理解发生了什么以及排查任何问题变得容易。",
  },
  "pipeline-templates": {
    title: "Pipeline 模板",
    description: "从预构建的多 agent 工作流开始,而不是从头构建。模板为你提供一个可工作的 pipeline,你可以自定义以适应你的需求。它就像使用食谱作为起点并根据你的口味调整成分。",
  },
  "debugging-pipeline-issues": {
    title: "调试 pipeline 问题",
    description: "查找和修复多 agent 流中的问题。当 pipeline 不按预期工作时,调试器会准确突出显示出错的地方。你可以检查每个步骤的数据以查明问题,而无需猜测。",
  },
  "why-test-your-agents": {
    title: "为什么要测试你的 agent?",
    description: "测试如何帮助你构建更可靠的自动化。测试就像彩排 — 它让你在错误重要之前发现它们。几分钟的测试可以为你节省数小时修复问题。",
  },
  "the-testing-lab-overview": {
    title: "测试实验室概览",
    description: "了解 Arena、A/B、Matrix 和 Eval — 你可以使用的四种测试模式。每种模式回答关于 agent 性能的不同问题。本概述帮助你选择适合你想了解内容的正确测试。",
  },
  "arena-testing": {
    title: "Arena 测试",
    description: "一次跨多个 AI 模型比较你的 agent。将相同的任务发送到 Claude、GPT、Gemini 和其他模型,然后看看哪个模型产生最佳结果。它就像 AI 模型竞争的才艺表演,你选择获胜者。",
  },
  "ab-testing-prompts": {
    title: "A/B 测试 prompt",
    description: "并排运行两个 prompt 版本以找到获胜者。在 prompt 中更改一件事,看看新版本是否表现更好。这种科学方法消除了 prompt 改进的猜测。",
  },
  "matrix-testing": {
    title: "Matrix 测试",
    description: "自动生成多个 prompt 变体以探索什么效果最好。矩阵从你的构建块创建数十种组合并测试它们全部。它就像尝试锁上的每种组合,而不是猜测代码。",
  },
  "eval-testing": {
    title: "Eval 测试",
    description: "在网格中针对多个模型测试多个 prompt。Eval 模式为你提供完整图景 — 每个 prompt 版本针对每个模型测试。结果出现在清晰的表格中,这样你可以立即发现最佳组合。",
  },
  "rating-and-scoring-results": {
    title: "评分和打分结果",
    description: "如何评估和投票测试输出。测试运行后,你可以用赞、踩或星级评分对每个结果评分。你的反馈教系统哪些输出符合你的标准。",
  },
  "genome-evolution-basics": {
    title: "Genome Evolution 基础",
    description: "Personas 如何随时间自动繁殖更好的 prompt。把它想象成植物育种 — 表现最好的 prompt 被组合以创建更好的 prompt。每一代都更接近你任务的完美指令。",
  },
  "running-a-breeding-cycle": {
    title: "运行繁殖周期",
    description: "启动进化运行并了解代数。你选择起始 prompt,设置目标,让系统自动创建和测试新变体。每个周期产生新一代改进的候选者。",
  },
  "adopting-evolved-prompts": {
    title: "采用进化的 prompt",
    description: "将表现最佳的变体提升到生产。当进化找到一个胜过你当前 prompt 的 prompt 时,你可以一键采用它。你的 agent 立即开始使用改进的指令。",
  },
  "fitness-scoring-explained": {
    title: "适应性评分解释",
    description: "系统如何衡量哪些 prompt 表现最好。适应性分数将你的评分、速度、成本和输出质量组合成一个易于阅读的数字。分数越高,prompt 越好 — 你不需要复杂的数学。",
  },
  "test-history-and-trends": {
    title: "测试历史和趋势",
    description: "通过图表和比较跟踪随时间的改进。每个测试结果都被保存,这样你可以看到你的 agent 一周又一周变得多好。趋势线显示你的更改是否朝正确的方向移动。",
  },
  "how-agent-memory-works": {
    title: "Agent memory 如何工作",
    description: "你的 agent 记住过去的任务并从经验中学习。每次 agent 运行,它都可以为下次存储有用的信息 — 就像它从任务到任务携带的笔记本。这意味着你使用 agent 越多,它们就越聪明。",
  },
  "memory-categories": {
    title: "Memory 类别",
    description: "了解你的 agent 存储的知识类型 — 事实、决策、洞察、学习和警告。每个类别有不同的目的,就像参考书中的章节。这帮助你的 agent 在正确的时间回忆正确的知识。",
  },
  "importance-levels": {
    title: "重要性级别",
    description: "memory 如何在 1 到 5 的范围内从常规到关键排名。重要的 memory 保留更长时间,被更频繁地回忆,就像你比每天的时刻更好地记住重大事件一样。这让你的 agent 专注于最重要的事情。",
  },
  "searching-agent-memories": {
    title: "搜索 agent memory",
    description: "找到你的 agent 学到的特定知识。输入关键字或短语,立即看到跨所有 agent 的每个相关 memory。它就像搜索你的邮件 — 快速、简单,你可以按类别或日期过滤。",
  },
  "creating-memories-manually": {
    title: "手动创建 memory",
    description: "亲手教 agent 特定的事实或偏好。有时你想让 agent 在自己学习之前知道某些事 — 就像简报新员工。手动 memory 让你给 agent 一个头开始。",
  },
  "memory-tiers-explained": {
    title: "Memory 层级解释",
    description: "Core、active、working 和 archive — 知识住在哪里以及它如何在层级之间移动。把它想象成一个归档系统:经常使用的 memory 放在桌面上,较旧的放在柜子里,最重要的锁在保险箱里。这保持你的 agent 高效而不会丢失任何东西。",
  },
  "memory-and-execution": {
    title: "Memory 与执行",
    description: "过去的 memory 如何影响当前的 agent 决策。当你的 agent 开始新任务时,它自动从先前的运行中回忆相关 memory。此上下文帮助它做出更好的决策并避免重复过去的错误。",
  },
  "reviewing-and-cleaning-memories": {
    title: "审查和清理 memory",
    description: "保持 agent 的知识库准确和最新。随时间推移,某些 memory 变得过时或不正确。定期审查确保 agent 不基于旧信息做出决策 — 就像为 agent 的大脑做春季大扫除。",
  },
  "exporting-and-importing-memories": {
    title: "导出和导入 memory",
    description: "在设备或 agent 之间备份或传输 agent 知识。导出创建一个你可以保存、共享或在其他地方导入的文件。这非常适合迁移到新计算机或给新 agent 另一个 agent 经验的好处。",
  },
  "memory-best-practices": {
    title: "Memory 最佳实践",
    description: "帮助你的 agent 随时间有效学习的技巧。就像良好的学习习惯一样,你构建和维护 memory 的方式产生很大不同。遵循这些指导原则以充分利用 agent 的学习能力。",
  },
  "the-monitoring-dashboard": {
    title: "监控仪表盘",
    description: "你一目了然跟踪所有 agent 活动的指挥中心。仪表盘在一个屏幕上显示运行中的 agent、最近的结果和关键指标。它就像一个航空管制塔 — 你需要知道的一切,就在你需要的地方。",
  },
  "execution-logs": {
    title: "执行日志",
    description: "查看每个 agent 运行的详细记录。每个日志显示你的 agent 做了什么、它产生了什么以及花了多长时间。当出现问题时,日志是首先寻找答案的地方。",
  },
  "real-time-activity-feed": {
    title: "实时活动 feed",
    description: "观察你的 agent 工作。活动 feed 显示每个 agent 处理其任务时的实时更新。它就像观看实时记分牌 — 你在结果发生的那一刻就看到它们。",
  },
  "cost-tracking-per-agent": {
    title: "每 agent 成本跟踪",
    description: "了解每个 agent 的运行成本。每个 AI 调用都有少量成本,此视图按 agent 细分它,这样就没有惊喜。你会确切知道哪些 agent 预算友好,哪些需要注意。",
  },
  "cost-tracking-per-model": {
    title: "每模型成本跟踪",
    description: "比较 AI 提供商之间的支出。不同模型收取不同费率,此视图帮助你查看你的钱去哪里。你可能发现将一个 agent 切换到更便宜的模型可以节省金钱而不牺牲质量。",
  },
  "success-rate-metrics": {
    title: "成功率指标",
    description: "衡量你的 agent 多频繁正确完成任务。一个简单的百分比告诉你每个 agent 的可靠性 — 95% 意味着它在 20 次中成功 19 次。如果率下降,你会知道是时候审查该 agent 的设置了。",
  },
  "execution-tracing": {
    title: "执行追踪",
    description: "跟踪复杂 agent 运行的逐步路径。追踪向你展示 agent 做的每个决策和使用的每个工具,就像详细的旅行日志。当你需要确切了解 agent 如何得出结果时,这是无价的。",
  },
  "performance-trends": {
    title: "性能趋势",
    description: "通过可视化图表发现随时间的改进或回归。趋势线显示 agent 的速度、成本和成功率如何一周又一周变化。这种鸟瞰视角帮助你庆祝胜利并及早发现问题。",
  },
  "setting-budget-limits": {
    title: "设置预算限制",
    description: "控制 agent 的支出。设置每天、每周或每月上限,当达到限制时 agent 会暂停。它就像在信用卡上设置支出限额 — 你保持对成本的控制。",
  },
  "anomaly-detection": {
    title: "异常检测",
    description: "当 agent 发生异常事情时收到警报。系统了解每个 agent 的正常情况,并标记任何不寻常的事情 — 如成本突然飙升或意外故障。如果有什么需要注意,你会第一个知道。",
  },
  "local-vs-cloud-execution": {
    title: "本地与云执行对比",
    description: "了解何时在你的机器上 vs 在云中运行 agent。本地执行非常适合测试和私有数据 — 你的 agent 直接在你的计算机上运行。云执行让你的 agent 24/7 运行,即使你的计算机关闭。",
  },
  "connecting-to-the-cloud-orchestrator": {
    title: "连接到云 orchestrator",
    description: "设置 24/7 远程 agent 执行,这样你的 agent 永不睡觉。云 orchestrator 是一项全天候运行你的 agent 的服务,无需你的计算机开机。连接一次,你的 agent 始终可用。",
  },
  "deploying-an-agent-to-the-cloud": {
    title: "将 agent 部署到云",
    description: "通过几次点击发布 agent 以始终在线执行。选择 agent,选择你的云设置,然后点击部署 — 它在几秒钟内上线。即使你关闭应用,你的 agent 也会按其计划继续工作。",
  },
  "cloud-execution-monitoring": {
    title: "云执行监控",
    description: "从桌面跟踪远程 agent 性能和成本。即使你的 agent 在云中运行,你也可以从 Personas 应用的舒适环境中监控它们。查看实时状态、成本和结果,就像你为本地 agent 所做的那样。",
  },
  "github-actions-integration": {
    title: "GitHub Actions 集成",
    description: "从你的 agent 触发 GitHub 工作流。如果你的团队使用 GitHub,你的 agent 可以自动启动构建和部署 pipeline。它就像给你的 agent 一个启动团队标准流程的按钮。",
  },
  "gitlab-ci-cd-integration": {
    title: "GitLab CI/CD 集成",
    description: "将 agent 配置导出为 GitLab pipeline YAML。你的 agent 设置可以转换为 GitLab 兼容的文件,在你的现有基础设施中运行。这弥合了 AI agent 和团队开发工作流之间的差距。",
  },
  "n8n-workflow-integration": {
    title: "n8n 工作流集成",
    description: "将 Personas agent 与 n8n 自动化工作流连接。如果你已经使用 n8n 进行自动化,你的 Personas agent 可以直接插入。这让你将 AI 驱动的决策与 n8n 的庞大集成库结合起来。",
  },
  "byoi-bring-your-own-infrastructure": {
    title: "BYOI — 自带基础设施",
    description: "使用你自己的云服务器而不是托管。如果你出于合规或成本原因更喜欢在自己的基础设施上运行所有内容,BYOI 给你完全控制。你获得云执行的所有好处,而没有供应商锁定。",
  },
  "syncing-desktop-and-cloud": {
    title: "同步桌面和云",
    description: "保持你的本地和远程 agent 同步。当你在桌面上进行更改时,它们可以自动推送到云。这确保远程运行的版本始终与你的最新改进保持同步。",
  },
  "cloud-troubleshooting": {
    title: "云故障排除",
    description: "修复常见的云部署问题。如果你的云 agent 没有按预期行为运行,本指南将引导你了解最常见的原因和修复。从连接问题到权限错误,你将找到清晰的步骤恢复正常。",
  },
  "common-error-messages": {
    title: "常见错误消息",
    description: "它们的含义以及如何修复。错误消息可能看起来吓人,但大多数都有简单的解决方案。本指南将最频繁的错误翻译成平实的英语,并准确告诉你该做什么。",
  },
  "agent-not-responding": {
    title: "Agent 无响应",
    description: "诊断和修复无响应 agent 的步骤。如果你的 agent 看起来冻结或卡住,不要担心 — 这通常是一个简单的修复。按照此清单识别原因,并在几分钟内让 agent 重新工作。",
  },
  "credential-errors": {
    title: "凭证错误",
    description: "解决认证和权限问题。当 agent 无法连接到服务时,通常是因为密码已过期或权限已更改。本指南帮助你查明问题并修复它,而无需从头开始。",
  },
  "trigger-not-firing": {
    title: "触发器未触发",
    description: "调试未启动你的 agent 的触发器。不触发的触发器令人沮丧,但原因通常是小事 — 一个拼写错误、一个计时问题或一个缺少的权限。本指南引导你了解最常见的罪魁祸首。",
  },
  "self-healing-explained": {
    title: "自愈解释",
    description: "Personas 如何自动从故障中恢复。当 agent 运行期间出现问题时,自愈系统尝试修复问题并自动重试。它就像一张安全网,在你甚至注意到之前捕获大多数错误。",
  },
  "checking-system-health": {
    title: "检查系统健康",
    description: "你的 Personas 安装的内置诊断。健康检查扫描你的设置并报告任何问题 — 过时的组件、缺少的文件或配置问题。当感觉不对劲时随时运行它以快速评估。",
  },
  "log-files-and-debugging": {
    title: "日志文件和调试",
    description: "当出现问题时在哪里找到详细日志。日志文件就像飞行记录仪 — 它们捕获问题之前发生的一切。本指南向你展示它们在哪里以及如何阅读重要部分。",
  },
  "resetting-to-defaults": {
    title: "重置为默认值",
    description: "如何安全重置设置而不丢失你的 agent。如果你已更改了某些内容且无法弄清楚出了什么问题,重置为默认值给你一个干净的起点。你的 agent、凭证和 memory 都被保留 — 只有你的偏好回到原始值。",
  },
};
