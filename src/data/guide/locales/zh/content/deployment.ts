export const content: Record<string, string> = {
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

};
