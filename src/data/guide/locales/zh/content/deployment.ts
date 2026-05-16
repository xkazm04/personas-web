export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## 本地与云执行对比

Personas agent 在两个地方运行:在你的本地机器上(桌面应用自己的引擎)或在远程 orchestrator 上(由我们云托管,或在你自己的基础设施上 BYOI)。本地是默认设置并开箱即用;云是可选的(Team / Builder 层级),允许 24/7 可用性,无需你的机器开机。相同的 agent prompt、工具和凭证在任一环境中工作 — 切换是部署决策,而不是重新设计。

决定因素通常是正常运行时间和可观察性要求。本地非常适合开发、测试、探索性 agent 以及任何你在场观看工作的事情。云是计划过夜运行、需要在你睡觉时可达的 webhook agent 以及任何"我的笔记本关闭了"不能是失败模式的生产级自动化的正确选择。

:::compare
**Local Execution** [default]
在桌面应用的引擎中运行。当应用打开时可用。零设置。数据和凭证永远不会离开你的机器。在你构建的同一 UI 中完整实时可观察性。最适合开发、测试、监督工作和任何隐私敏感的事情。
---
**Cloud Execution**
在 orchestrator 上运行(托管云或 BYOI)。无论你的本地机器如何都 24/7 可用。设置是一次性的。数据和凭证在传输中加密到 orchestrator,在其上静态加密。结果同步到你的桌面。最适合计划、webhook 和生产级无人值守工作。
:::

### 工作原理

本地 agent 由应用内执行引擎分派 — 与应用中其他所有内容使用相同的路径。云 agent 被部署:agent 的完整配置(prompt、工具、按引用的凭证、触发器)被发送到 orchestrator,orchestrator 运行一个长期 agent 进程,该进程在服务器端处理触发器。结果流回桌面应用,并出现在与本地运行相同的监控视图中。

:::tip
在本地开发和测试,然后将有效的内容部署到云。本地引擎具有最快的编辑测试循环;云是你放置计划或可用性重要的 agent 的地方。你不必全局选择一个或另一个 — 典型设置具有大多数 agent 本地和少数生产 agent 在云中。
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## 连接到云 orchestrator

打开 Deployment → Cloud Deploy 以连接到 orchestrator。两条路径:**托管 orchestrator**(我们托管它;你用你的账户认证,30 秒完成)或 **BYOI**(你在自己的基础设施上托管 orchestrator;你将桌面应用指向你的端点并提供认证密钥)。无论哪种方式,每台机器的连接是一次性的,并在应用重启之间持久化。

一旦连接,每个 agent 的 Settings 选项卡获得"Deploy to cloud"选项。触发部署将 agent 的配置上传到 orchestrator,并为其启动一个长期服务器端进程。云 agent 出现在与本地相同的监控视图中,带有小云图标标记。

:::steps
1. **打开 Deployment → Cloud Deploy** — 侧边栏 → Deployment → Cloud Deploy
2. **选择环境** — Managed Cloud(一键登录)或 BYOI(输入你的 orchestrator URL + 认证密钥)
3. **对于 BYOI**:粘贴 orchestrator URL 和认证令牌;向导运行连接测试并验证 orchestrator 版本兼容性
4. **对于 Managed**:点击 "Sign in";OAuth 流程打开以根据你的 Personas 账户认证
5. **保存** — 连接持久化;agent 现在在其 Settings 选项卡中显示 "Deploy to cloud" 选项
:::

:::warning
像对待任何其他凭证一样对待 BYOI 认证令牌:将其存储在 vault 中(Connections → Credentials → Custom),不要将其粘贴到聊天或提交到版本控制。持有令牌的任何人都可以在 orchestrator 上部署和取消部署任何 agent。
:::

### 工作原理

Orchestrator 是一个长期运行的服务器进程(每个环境一个),它保存已部署的 agent 配置,并按计划、按 webhook 事件或按需运行它们。桌面应用和 orchestrator 之间的通信是通过 TLS 与相互认证。已部署 agent 的凭证在部署时使用 orchestrator 的每租户密钥加密,仅在运行时在 orchestrator 进程内解密。

:::tip
在部署任何内容之前测试连接。向导的连接测试验证版本兼容性和可达性 — 如果失败,现在诊断比在你尝试部署三个 agent 之后容易得多。
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## 将 agent 部署到云

连接了 orchestrator 后,部署任何 agent 是其 Settings 选项卡上的一个按钮。部署操作打包 agent 的完整配置(prompt、工具、凭证引用、触发器定义、设置)并通过 TLS 发送到 orchestrator。Orchestrator 验证、设置 agent,并开始在服务器端处理其触发器。第一次运行通常在几秒钟内发生。

同一 agent 的本地和云副本通过处理所有桌面 ↔ 云协调的相同自动同步系统保持同步。你可以继续在本地迭代 agent 并在准备好时重新部署;你不必在两个环境之间做出选择。

:::steps
1. **验证 orchestrator 连接** — Deployment → Cloud Deploy 应显示 "Connected"
2. **打开 agent** — Agents 页面 → 你想要部署的那个
3. **Settings 选项卡 → Deploy to Cloud** — 部署部分中的按钮
4. **审查部署摘要** — 正在交付的凭证、正在激活的触发器、模型选择、故障转移设置;一切都应与你在本地测试的内容匹配
5. **确认 Deploy** — orchestrator 接收配置、验证、设置 agent;状态在几秒钟内翻转为 "Deployed"
6. **在仪表盘中验证** — Overview → Activity 显示带云图标的 agent;下一个计划/webhook 事件将路由到云实例
:::

:::warning
云 agent 使用云端 vault 中的凭证,而不是直接使用你的本地 vault。部署操作运送加密的凭证 *引用*,orchestrator 在服务器端解析它们。如果凭证是仅本地的或尚未复制,部署将呈现"云中不可用的凭证"警告,并要求你在完成之前复制或选择替代品。
:::

### 工作原理

部署是原子的:要么 orchestrator 接受整个配置并 agent 上线,要么它拒绝(带特定原因)而服务器端没有任何更改。一旦部署,orchestrator 拥有触发器评估 — 你的本地应用不再为该 agent 触发计划/webhook(否则你会得到重复)。从桌面应用的手动运行通过相同的连接路由到云实例。

:::tip
开始使用云时,首先部署计划 agent。它们从 24/7 正常运行时间中获益最多,并且最容易验证(你会看到运行按预期的计划落地,无论你的笔记本是否打开)。
:::
  `,

  "cloud-execution-monitoring": `
## 云执行监控

云 agent 从与本地 agent 相同的 Overview 页面可见 — 相同的 Activity feed、相同的 Health 选项卡、相同的 Usage 细分。小云图标区分云 agent 和本地。点击任何云执行,你会获得完整追踪,就像本地运行一样:渲染的 prompt、模型调用、工具调用、输出、成本。

桌面应用在打开时持续轮询 orchestrator,并在连接时订阅实时事件流,所以你看到的是实时状态,延迟以秒为单位测量,而不是分钟。当应用关闭时,orchestrator 自己保持一切运行;稍后打开应用从 orchestrator 的权威存储中追上本地状态。

### 关键点

- **统一监控表面** — 本地和云 agent 共享相同的 Activity / Health / Usage 视图
- **实时事件流** 当桌面连接时;orchestrator 端持久化保证当你离线时不会丢失任何内容
- **云图标** 区分驻留在云中的 agent
- **云的成本归因** — 用量图表包括本地和云支出,按环境细分
- **重连时追上** — 在延长离线时间后打开应用会同步 orchestrator 中所有错过的事件

### 工作原理

云 agent 发出与本地相同的执行和事件记录;orchestrator 在服务器端存储它们,并在连接时复制到桌面应用。Activity feed 按时间顺序合并本地和云事件流,所以混合的本地 + 云设置看起来像一个统一视图,而不是两个并行视图。

:::tip
从第一天起就为云 agent 设置每天预算上限。云 agent 没有本地手动运行隐含的"我在观看这发生"检查;每天上限是你对一夜失控 prompt 的安全网。
:::
  `,

  "github-actions-integration": `
## GitHub Actions 集成

Agent 可以通过 Connectors 选项卡上的 GitHub 工具触发 GitHub Actions 工作流,而 GitHub Actions 可以通过标准 webhook 触发器触发 agent。两种模式很好地结合:GitHub 事件(PR 打开、推送到 main、发布标记)触发 webhook 启动 Personas agent,agent 做它的事情,如果需要,agent 作为其输出的一部分触发工作流。

GitHub 连接器在 Catalog 中提供(Connections → Catalog → Developer Tools → GitHub)。认证是 OAuth 或细粒度 PAT — 当 agent 只需要读取访问时首选 OAuth;PAT 适用于像分派工作流这样的写入操作。

### 关键点

- **GitHub → Personas 通过入站 webhook** — 标准 webhook 触发器;配置 GitHub POST 到 agent 的 URL
- **Personas → GitHub 通过 GitHub 工具** — agent 可以分派工作流、评论 PR、打开 issue,以及 GitHub API 公开的任何内容
- **范围认证** — 用于以读取为主的 agent 的 OAuth,用于写入操作的细粒度 PAT;每 agent 最低范围
- **实时状态同步** — agent 追踪显示 workflow_dispatch 请求和 GitHub 的响应;如果需要,agent 可以等待工作流完成

### 工作原理

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

GitHub 工具包装 GitHub REST/GraphQL API 并向 agent 公开高级操作:"dispatch workflow"、"comment on PR"、"open issue"、"merge PR"等。Agent 的 prompt 根据触发器命名它应该采取的操作;工具处理认证、载荷构造和响应处理。

:::warning
只要你的 GitHub 计划支持,就使用细粒度 PAT 而不是经典 PAT。经典 PAT 授予广泛的组织范围权限;细粒度 PAT 限制为特定仓库和特定权限范围,如果令牌泄露,这会大大收紧爆炸半径。
:::

:::tip
从低风险工作流作为目标开始 — 比如只是发布消息的 "notify Slack" 工作流。一旦 agent → GitHub Actions 切换得到证明,升级到更高风险的目标(部署、发布等)。
:::
  `,

  "gitlab-ci-cd-integration": `
## GitLab CI/CD 集成

Personas 通过两种方式与 GitLab 集成:一个直接的 GitLab 插件,为 agent 提供 API 级访问(pipeline 状态、MR 评论、issue 管理),以及一个 GitLab CI YAML 导出,将 Personas agent 作为现有 pipeline 内部的步骤运行。两者都有;选择适合你团队工作流形状的那个。

插件(Plugins → GitLab)处理 API 端集成:安装、认证,你的 agent 获得 \`gitlab\` 工具表面,带有高级操作(启动 pipeline、评论 MR、管理 issue)。CI YAML 导出走另一个方向 — 你的 agent 成为你的 GitLab CI pipeline 中的步骤,由 GitLab runner 执行,结果传递到后续步骤。

### 关键点

- **GitLab 插件** — API 级集成;agent 从其 Connectors 选项卡使用 GitLab 作为工具
- **CI YAML 导出** — agent 成为你 GitLab pipeline 中的步骤;在你的 GitLab runner 上运行
- **双向** — GitLab 事件可以触发 agent(webhook),agent 可以触发 GitLab pipeline(插件)
- **令牌范围** — 使用项目访问令牌或组访问令牌,范围限定为最低所需权限
- **作为触发器的 Pipeline 事件** — \`Pipeline succeeded\`、\`Pipeline failed\`、\`MR merged\` 都可通过 webhook 触发器消费

### 工作原理

插件使用存储在凭证 vault 中的 GitLab API 令牌。当 agent 调用 GitLab 工具操作时,引擎分派 API 调用,捕获响应,并将其作为工具结果反馈给模型的下一轮。

对于 CI 导出:打开 agent 的 Settings 选项卡 → Export → GitLab CI YAML。向导生成一个作业定义,将 agent 包装为 CI 可运行形状(通常是带有 Personas CLI 加上 agent 引用的 Docker 镜像)。将生成的 YAML 提交到你仓库的 \`.gitlab-ci.yml\`;agent 作为你 pipeline 的一部分与任何其他 CI 作业一起运行。

:::warning
导出的 CI YAML 引用诸如 AI 提供商密钥之类的凭证变量。在你的项目设置中将这些定义为**屏蔽的、受保护的** GitLab CI/CD 变量 — 永远不要在 YAML 文件本身中硬编码密钥,因为 pipeline YAML 位于你的仓库中,对具有读取访问权限的任何人可见。
:::

:::tip
插件是大多数团队的更轻量级选项。CI YAML 导出在 agent 必须无论如何在 GitLab runner 内运行(网络隔离、内部网络资源、合规性强制的基础设施)时最有用 — 否则插件让你将 agent 保留在 Personas 中,在那里其可观察性和调试最丰富。
:::
  `,

  "n8n-workflow-integration": `
## n8n 工作流集成

n8n 是一个流行的开源工作流自动化工具,Personas 与它双向集成。你可以将现有的 n8n 工作流作为模板导入到 Personas 中(Templates → n8n Import) — 导入向导解析工作流 JSON 并将 n8n 节点映射到等效的 Personas agent、连接器和触发器。你也可以通过使用 HTTP/webhook 节点调用 agent 的入站 webhook URL,从 n8n *调用* Personas agent。

n8n 导入是单向且一次性的:它将工作流的 *形状* 带入 Personas,但不会保持 n8n 原始同步。导入后,导入的 pipeline 是你的,可以独立编辑。

### 关键点

- **n8n → Personas 导入** — Templates → n8n Import;解析工作流 JSON,将节点映射到 Personas 等效项
- **Personas → n8n 触发** — n8n 的 HTTP/webhook 节点可以 POST 到 agent 的 webhook 触发器 URL
- **n8n → Personas 触发** — n8n 可以作为 n8n 工作流的一部分调用 Personas agent webhook;agent 的响应(可配置)流回 n8n
- **不同步** — 导入的 pipeline 与其 n8n 源分歧;将导入视为一次性起点
- **映射节点覆盖** — 导入器处理常见节点(HTTP、function、IF、switch);奇异/社区节点可能作为占位符导入以供手动完成

### 工作原理

导入向导读取 n8n 工作流 JSON(从 n8n 导出 → 在工作流上 "Download"),将每个节点映射到其最接近的 Personas 等效项(HTTP 节点 → 工具,function 节点 → agent,IF/switch → 条件路由等),并将结果暂存为你在接受之前预览的 pipeline。映射尽力而为:导入器无法自信映射的任何内容都成为占位符,带有让你填写的注释。

对于反向方向,Personas agent 的 webhook URL 只是一个 URL — 任何 n8n HTTP 节点都可以调用它。将输入作为请求主体传递;agent 处理并(可选)同步回复其输出。

:::tip
n8n 在"在服务之间移动数据"管道方面表现出色;Personas 在"思考"方面表现出色 — 分析、决策、写作。最强大的组合工作流使用 n8n 进行编排加上 Personas agent 进行 AI 驱动的决策点,而不是尝试在一个中做所有事情。
:::
  `,

  "byoi-bring-your-own-infrastructure": `
## BYOI — 自带基础设施

BYOI(Builder 层级)意味着你自己运行 orchestrator,而不是使用我们的托管云。你在自己的基础设施上安装 orchestrator 软件(作为 Docker 镜像和 Kubernetes Helm chart 提供),根据你的偏好配置它(认证、存储、网络),并将桌面应用指向你的 orchestrator URL。从那时起,部署 agent 的工作方式与托管云相同 — 它们只是在你的硬件上运行。

当数据主权重要时(监管环境、客户数据隔离、气隙网络),当你有想要利用的现有基础设施时(而不是除了托管托管之外还要付费),或当你想完全控制运行时环境时(自定义网络、特定的可用性保证、与现有可观察性堆栈的集成),BYOI 是正确的选择。

### 关键点

- **自托管 orchestrator** — 每个版本发布的 Docker 镜像 + Helm chart
- **数据主权** — 执行数据、凭证和追踪永远不会离开你的基础设施
- **相同的 agent 语义** — 部署到 BYOI orchestrator 的 agent 行为与托管云相同
- **你的认证、你的存储、你的网络** — orchestrator 与你现有的身份提供商、数据库和网络策略集成
- **Builder 层级功能** — 需要 Builder 订阅获得 orchestrator 软件许可证

### 工作原理

Orchestrator 作为长期服务器进程运行。Docker 镜像对于单节点部署是自包含的;Helm chart 支持具有共享存储的 HA 多节点设置。认证与 OIDC 提供商集成,这样你可以使用现有的 SSO;存储使用 Postgres(托管或自托管);凭证 vault 加密密钥存在于你选择的 KMS 中(Vault、AWS KMS、GCP KMS、Azure Key Vault)。

从桌面应用的角度看,将 agent 部署到 BYOI orchestrator 与托管云相同 — 相同的 UI、相同的流程、相同的可观察性。Orchestrator 端点只是配置为指向你的安装而不是我们的。

:::info
BYOI 是真正的基础设施工作。Orchestrator 软件文档齐全,Helm chart 处理大部分设置,但你仍然需要一个熟悉运行生产服务器软件的人。对于没有该能力的团队,托管云是更好的起点 — 如果需求变化,以后切换到 BYOI。
:::

:::tip
如果你是 BYOI 新手,先在暂存环境中运行它。设置指南包括一个"最小本地堆栈" Docker Compose,它在单台机器上运行 orchestrator + Postgres + Vault — 非常适合在部署生产硬件之前让活动部件工作。
:::
  `,

  "syncing-desktop-and-cloud": `
## 同步桌面和云

当你将 agent 部署到云 orchestrator 时,桌面应用会自动保持两者之间的状态同步。对已部署 agent 的本地编辑(prompt 更改、设置调整、凭证轮换)在保存时推送到 orchestrator。云端事件(执行结果、触发器触发、健康更改)同步回桌面并出现在监控视图中。

桌面连接时同步在后台连续运行。当应用离线时,本地更改排队并在重新连接时推送;云事件在服务器端累积,并在重新连接时流下来。状态栏显示同步状态,带有小指示器(绿色 = 完全同步,琥珀色 = 同步进行中 / 排队的更改,红色 = 同步错误需要注意)。

### 关键点

- **双向、自动** — 本地更改在保存时推送;云事件持续流下来
- **离线容忍** — 本地更改在离线时排队并在重新连接时推送;云保留事件以供追上
- **冲突检测** — 如果同一 agent 在本地和远程编辑(例如,被使用相同 orchestrator 的队友),桌面提示在提交前解决
- **状态指示器** — 底部栏元素显示实时同步状态
- **手动同步** — 点击指示器以显式触发同步;在断开连接之前很有用

### 工作原理

同步使用每资源版本向量。每个 agent、凭证、触发器和执行记录都携带一个在更改时递增的版本。同步是"发送我的版本,接收任何更新的版本" — 高效、感知冲突。冲突(罕见,但在共享 orchestrator 设置中可能)作为解决提示出现;你选择哪个版本获胜或手动合并。

:::tip
在有意义的更改后瞥一眼同步指示器。绿色意味着关闭应用并信任云有最新版本是安全的。琥珀色意味着更改正在传输中 — 如果你想确定,等几秒再断开连接。
:::
  `,

  "cloud-troubleshooting": `
## 云故障排除

大多数云问题都属于一小类:orchestrator 无法访问(网络 / 防火墙 / orchestrator 停机)、凭证不匹配(agent 使用的凭证未复制到 orchestrator 端)、版本不匹配(orchestrator 上的版本比桌面旧,缺少功能),或配置不同步(本地有未保存的更改未推送)。Deployment → Cloud Deploy 状态页面是最佳的单一诊断表面 — 它显示 orchestrator 健康、同步状态和每 agent 部署状态以及特定的失败原因。

对于 agent 级问题(agent 已部署但未运行、在云中失败但在本地成功的运行),agent 的 Health 选项卡为云显示与本地相同的诊断 — 凭证状态、最近的失败原因、配置完整性。执行追踪还显示运行是在云上还是本地执行,因此你可以快速隔离"仅云"问题。

### 常见问题和修复

| 症状 | 可能原因 | 修复 |
|---|---|---|
| Agent 未按计划运行 | Orchestrator 无法访问,或触发器在云端禁用 | 检查 Deployment 状态;如果触发器状态陈旧,重新部署 |
| 第一次云运行时凭证错误 | 凭证未复制到 orchestrator | Deployment → Cloud Deploy → "Sync credentials";验证 agent 的 Connectors 选项卡 |
| 结果未出现在桌面上 | 同步暂停或运行发生时应用离线 | 点击同步指示器;事件在重连时流下来 |
| 云 agent 比本地慢 | 部署时配置了不同的模型/提供商;或从 agent 到 AI 提供商的网络延迟 | 在 Cloud Deploy 详情视图中检查 agent 的有效配置 |
| 部署时"版本不匹配"错误 | Orchestrator 在较旧的版本上 | 升级 orchestrator(BYOI)或等待托管云推出 |

### 工作原理

Deployment 状态页面在桌面连接时持续轮询 orchestrator,并将结果呈现为单一仪表盘。每个部署的 agent 都有每资源状态(healthy / degraded / unreachable),带有特定问题命名。大多数问题都从状态行直接提供一键解决方案。

:::warning
"重新部署"是许多云问题最简单的修复,但它将 *当前本地状态* 推送到 orchestrator。如果你有未审查的本地更改(或在共享 orchestrator 上,云有未到达本地的更改),重新部署可能会覆盖它们。始终先检查同步状态 — 如果琥珀色,先解决同步再重新部署。
:::

:::tip
迄今为止最常见的云问题是"我忘了将凭证复制到云 vault"。在部署任何 agent 之前,部署向导预先检查凭证可用性并警告;注意该警告而不是忽略它,大多数云端凭证错误就会消失。
:::
  `,
};
