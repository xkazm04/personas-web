export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Personas 如何保护你的数据安全

安全从一开始就内置在 Personas 中。API key、token 和密码存放在你自己机器上的本地加密 vault 中 — 除非 agent 在运行期间明确将它们发送到 AI 提供商或第三方服务,否则它们永远不会离开设备。Vault 文件本身使用 **AES-256-GCM** 加密,解锁它的密钥由你的操作系统原生 keyring 包装(Windows DPAPI、macOS Keychain、Linux Secret Service),因此明文密钥永远不会留在磁盘上。

当你运行 agent 时,引擎只解密该 agent 需要的特定凭证,在调用期间将它们保存在内存中,然后擦除明文。日志、追踪和导出永远不包含原始凭证值 — 凭证会出现的任何地方,你看到的都是 token 引用(\`cred:gmail-work\`)。

### 关键点

- **AES-256-GCM** — 经过验证的加密(每个凭证的密文都经过完整性检查,所以被篡改的 vault 文件会被检测到,而不是静默解密)
- **OS keyring 包装的主密钥** — Windows 上的 DPAPI、macOS 上的 Keychain、Linux 上的 Secret Service;每个会话不需要输入主密码
- **默认仅本地** — 不上传任何内容;云部署是可选的,通过 TLS 加密传输到你选择的 orchestrator
- **日志中的 token 引用** — agent 追踪和导出使用凭证 ID,而不是原始密钥
- **防篡改** — GCM 认证标签捕获对 vault 文件的任何修改

### 工作原理

存储凭证用 vault 密钥(每个 vault 的 AES-256-GCM 密钥,本身由 OS keyring 包装)加密它,并将密文写入本地 SQLite。在 agent 运行期间使用凭证会在内存中解密它,将它传递给相关工具或 HTTP 客户端,并立即释放缓冲区。原始值永远不会被记录,在初次输入后永远不会显示,也永远不会在加密 vault 之外的任何位置序列化。

### 实战示例

:::usecases
**多个服务,隔离的凭证**
你的 agent 与 Slack、GitHub 和 Jira 通信
---
每个凭证都使用自己的随机 nonce 独立加密。一条记录的泄露不会暴露其他记录。
===
**凭证轮换**
Token 过期或被轮换
---
OAuth 凭证通过提供商的 refresh token 自动刷新。手动轮换的密钥你在凭证记录上交换,无需重启任何东西。
===
**审计友好的追踪**
你需要证明哪个凭证在哪里使用
---
每次运行的追踪都记录使用的凭证 ID。实际值永远不会出现;ID 足以证明出处。
:::

:::info
Vault 通过 OS keyring 绑定到你的 OS 用户账户。将 vault 文件复制到另一台机器,即使是相同的操作系统,也无法解密 — 包装密钥位于 OS keyring 中,不可移植。
:::

:::warning
如果你在 macOS 或 Linux 上更改 OS 账户密码,keyring 可能会重新锁定包装密钥。更改后第一次运行时 Personas 会提示输入新凭证。如果 keyring 被擦除(出厂重置、账户删除),vault 将变得不可恢复 — 如果你需要超出本地机器的灾难恢复,请在外部备份原始密钥。
:::

:::tip
仅本地模型是个人自动化的正确默认设置。对于多台机器需要相同凭证的团队/生产工作,云部署(Team / Builder 层级)通过 orchestrator 复制 vault 状态,并进行端到端加密。
:::
  `,

  "adding-a-new-credential": `
## 添加新凭证

打开 Connections → Credentials 并点击 \`Add Credential\`。选择一个类别(email、cloud storage、payments、communication、developer tools、CRM、AI provider、generic) — 选择器显示匹配的预构建连接器,自动配置认证类型、必需字段和标签提示。如果你的服务不在目录中,选择 "Custom" 并自己定义凭证(名称、类型、字段)。

对于支持 OAuth 的服务,流程会打开浏览器窗口到提供商的同意屏幕。对于 API key 服务,将密钥粘贴到安全输入中。无论哪种方式,凭证都会被加密保存,选择器会提供将其应用到任何在匹配类别中有开放能力槽的 agent。

### 一步一步

:::steps
1. **导航到 Connections → Credentials** — 侧边栏 → Connections,然后是 Credentials 选项卡
2. **点击 Add Credential** — 凭证列表的右上按钮
3. **选择类别** — email / storage / payments / 等;匹配的连接器目录自动过滤
4. **运行认证流程** — OAuth 打开同意窗口;API-key 服务使用安全输入字段
5. **命名并保存** — 给凭证一个你能识别的标签("Stripe Live"、"Gmail Personal");凭证用 AES-256-GCM 加密并持久化
6. **可选:立即绑定到 agent** — 选择器显示具有匹配开放能力的 agent;一键绑定避免以后寻找它们
:::

### 工作原理

当你点击 Save 时,凭证的原始值用从 OS keyring 派生的 vault 密钥加密,然后提交到凭证存储。保存仅返回凭证 ID 和标签 — 原始值立即从内存中擦除。从此以后,agent 编辑器的 Connectors 选项卡可以通过 ID 引用凭证。

:::warning
永远不要将凭证粘贴到 agent prompt、代码注释或聊天窗口中。只使用安全凭证输入字段 — 任何其他方式都有原始值被日志、同步或屏幕截图捕获的风险。
:::

:::tip
一旦你有 20+ 个凭证,命名约定很重要。\`<service>-<env>-<account>\`("stripe-live-main"、"gmail-prod-support")在你配置 agent 的 Connectors 选项卡时立即清楚要选择哪个凭证。
:::
  `,

  "oauth-setup-walkthrough": `
## OAuth 设置演练

OAuth 是支持它的服务(Google、GitHub、Slack、Linear、HubSpot、Twitter/X、Discord 等)的首选认证流程。Personas 不是让你输入或粘贴 API key,而是打开浏览器窗口到提供商的官方同意屏幕 — 你使用现有凭证在那里登录,批准 Personas 请求的特定范围,提供商将范围限定的访问令牌返回给应用。令牌加密保存到 vault 中;你的密码从未接触 Personas。

大多数 OAuth 令牌是短期的,与 refresh token 配对。Personas 在后台使用 refresh token 保持访问令牌为最新 — 通常你不会看到来自 OAuth 凭证的过期消息,除非提供商使 refresh token 失效(撤销同意、更改密码、安全事件)。

### 一步一步

:::steps
1. **打开 Connections → Credentials** — 侧边栏 → Connections → Credentials,然后是 \`Add Credential\`
2. **选择服务** — 目录按类别过滤;支持 OAuth 的服务显示 "OAuth" 认证类型徽章
3. **点击 Connect** — 浏览器窗口打开到提供商的同意屏幕
4. **登录并批准范围** — 审查请求的确切权限;批准以发出令牌,或拒绝以取消
5. **确认保存** — 浏览器窗口自动关闭;凭证出现在你的 vault 中,列出授予的范围;你可以立即在 agent 中使用它
:::

### 工作原理

:::diagram
[Click Connect] --> [Browser opens] --> [Sign in to provider] --> [Approve specific scopes] --> [Token + refresh stored encrypted]
:::

OAuth 给 Personas 一个 *范围限定的* 令牌 — 它只能做你批准的事情,别的什么都不行。每个连接器请求集成所声明功能的最低范围(摘要 agent 的 Gmail 只读,自动回复 agent 的 Gmail 读+发送等)。你可以在凭证卡上审查授予的范围,如果你想完全撤销它们,可以从提供商自己的安全设置中撤销。

:::info
OAuth 令牌通常是短期的(几分钟到几小时),Personas 使用长期 refresh token 自动刷新它们。如果 refresh token 本身过期(因提供商而异,通常 90 天到永不),Personas 提示你重新认证 — 一键重新运行同意流程。
:::

:::tip
对于你有 OAuth 和 API key 选项的服务(例如 OpenAI、Anthropic),当可用时首选 OAuth,因为范围更紧,令牌可以从提供商端撤销而无需轮换 API key。API key 仍然适用于无头/编程使用。
:::
  `,

  "understanding-the-credential-vault": `
## 了解凭证 vault

Vault 是每个凭证存放的加密本地存储。从机制上讲,它是应用的 SQLite 数据库内的 AES-256-GCM 加密 blob,加密密钥本身由 OS 原生 keyring 包装。Vault 永远不会以完全解密的状态存在 — 单个凭证一次一个、在内存中、仅在 agent 运行需要时解密。

Vault 可以从 Connections → Credentials 浏览。你看到凭证的标签、类别、状态(healthy / expiring soon / expired / broken)和依赖项(哪些 agent 使用它)。原始值在初次输入后永远不可见 — 按设计没有"显示密码"切换。

:::feature
**AES-256-GCM + OS 原生 keyring** color=#a855f7
GCM 提供机密性和经过认证的完整性 — 被篡改的 vault 文件会被检测到,而不是静默地用垃圾解密。包装密钥位于 DPAPI(Windows)/ Keychain(macOS)/ Secret Service(Linux)中,所以它由你的 OS 用户账户保护,而不是由你必须输入的单独主密码保护。
:::

### 关键点

- **每凭证 AES-256-GCM** — 每个凭证都用自己的 nonce 加密;一次泄露不会级联
- **OS keyring 包装 vault 密钥** — 无需管理单独的主密码;保护来自你的 OS 账户登录
- **篡改检测** — GCM 认证标签捕获任何修改;被篡改的记录无法解密并显示清晰错误
- **审计友好** — 每次凭证访问都记录了时间戳、agent 和执行 ID;原始值从不记录
- **绑定到 OS 账户** — 将 vault 文件复制到另一台机器或用户账户不会使其可用

### 工作原理

当应用启动时,它向 OS keyring 询问包装的 vault 密钥。Keyring 解密包装(使用 OS 账户级别的保护 — DPAPI、Keychain、Secret Service)并将 vault 密钥交给内存中的应用进程。从那里,应用可以按需解密单个凭证。Vault 密钥永远不会以明文形式写入磁盘,OS keyring 是唯一可以生成它的地方。

:::warning
如果你更改 macOS 或 Linux 用户密码,keyring 可能会重新锁定包装密钥,并在下次访问时提示重新派生它。这是正常且可恢复的。如果 OS 账户被删除或 keyring 被重置(例如出厂重置),vault 将变得不可恢复 — 在外部备份任何无法替换的密钥。
:::

:::tip
Vault 安全是二元的:要么完好无损(OS 账户有效,keyring 可读),要么损坏(无法解密)。没有"弱"的中间状态。你可以为 vault 安全做的最重要的事情是运行现代 OS 版本并使用全盘加密(BitLocker、FileVault、LUKS),这样设备级别的威胁模型是有界的。
:::
  `,

  "credential-health-checks": `
## 凭证健康检查

凭证会随时间漂移 — 令牌过期、密钥在上游被轮换、OAuth 范围发生变化。凭证健康检查定期 ping 每个存储的凭证,进行轻量测试调用(一个不产生费用的 no-op API 请求,告诉你凭证是否仍然有效)。结果作为凭证卡上的状态指示器和当凭证降级时的警报显现。

检查计划是可配置的。默认情况下,OAuth 凭证每天检查(因为 refresh-token 流程无论如何都需要凭证定期被使用),API-key 凭证每周检查。手动检查可以随时从凭证卡运行。

### 关键点

- **每凭证状态** — 绿色(healthy)、黄色(即将过期 / 范围更改)、红色(损坏 / 已撤销)
- **可配置频率** — 如果服务对积极检查进行速率限制,可按凭证覆盖
- **手动检查** — 从凭证卡一键测试;在部署新 agent 之前很有用
- **过期预测** — 对于已知过期日期的凭证(签名的 JWT、范围限定的令牌),状态在过期前 N 天翻转为黄色(可配置,默认 7 天)
- **警报路由** — 故障通过你为 agent 配置的相同通知通道路由

### 工作原理

每个连接器定义自己的健康检查调用(行使凭证的最轻请求)。检查按配置的频率在后台运行;结果被持久化并更新凭证的状态。如果检查失败,状态会翻转,凭证卡会突出显示,依赖的 agent 会在自己的健康指示器上继承警告 — 所以损坏的 Gmail 凭证会使每个使用 Gmail 的 agent 显示黄色,直到你修复它。

:::tip
在任何生产部署或计划的过夜运行之前运行手动健康检查。现在花五秒钟比凌晨 3 点因令牌静默轮换而失败要好。
:::
  `,

  "auto-credential-browser": `
## 自动凭证浏览器

自动凭证浏览器是新凭证的目录驱动入门。打开 Connections → Catalog,你会看到 Personas 预配置的每个连接器:截至本文撰写时为 60+ 项服务,按类别组织(email、storage、payments、communication、developer tools、CRM、AI providers 等)。每个连接器都知道正确的认证类型、必需字段、OAuth 范围、API 端点以及任何服务特定的怪癖。

当你选择连接器时,向导会引导你完成该服务的精确步骤 — 包括到服务 UI 中你可以找到 API key 的特定页面的链接、要批准的 OAuth 范围,或哪些权限重要。对于 Personas 可以检测到成功连接的服务(大多数),向导在保存前实时验证。

### 关键点

- **60+ 预配置连接器** — 认证类型、字段、范围、端点已烘焙
- **服务特定的指导** — 到确切 API-key 页面或设置选项卡的直接链接
- **实时验证** — 对于大多数服务,向导在保存前测试凭证
- **建议给 agent 的流程** — 目录也可以从 agent 的 Connectors 选项卡进入,在那里它会过滤到匹配开放能力槽的连接器
- **请求新连接器** — 尚未在目录中的服务可以请求;对于一次性的,使用 Generic / Custom 连接器类型

### 工作原理

连接器定义随应用一起提供,并通过常规发布周期更新。每个定义声明其认证流程、必需字段、验证端点和范围列表。当你选择连接器时,向导读取定义,渲染匹配的表单,运行 OAuth 或 API-key 流程,并在保存前验证。实际的凭证值在保存时使用与手动添加凭证相同的路径加密。

:::tip
目录也是发现已集成内容的最快方式。即使你没有特定需求,也偶尔浏览一下 — 你常常会找到一个建议新自动化的集成。Communication 类别对于输出端用例(将 agent 结果传递到 Slack / Discord / Teams)特别丰富。
:::
  `,

  "which-agents-use-which-credentials": `
## 哪些 agent 使用哪些凭证

Connections 上的 Dependencies 选项卡显示凭证 → agent 图。选择左侧的凭证,你会看到右侧引用它的每个 agent,以及特定能力槽的名称("email-summary agent 的 Gmail 账户")。选择 agent,你会看到它依赖的每个凭证。该图是双向的 — 对于"如果我轮换此密钥会破坏什么?"和"在我可以提升此 agent 之前它需要哪些凭证?"都很有用。

同一依赖图驱动构建引擎的预检查:当你提升 agent 时,引擎会根据 vault 交叉检查每个所需的能力,并在允许提升之前标记丢失或过期的凭证。这就是为什么你几乎从未在新创建的 agent 中得到"找不到凭证"错误 — 依赖检查在提升时运行并捕获了它。

### 关键点

- **双向图** — 凭证 → agent 和 agent → 凭证
- **能力槽命名** — 依赖关系不仅告诉你"此凭证被使用",还告诉你"用作 email-send 能力"
- **预检查** — 使用相同图的提升时验证
- **影响预览** — 选择凭证会突出显示其删除将影响的每个 agent
- **未使用凭证检测** — 零 agent 依赖的凭证在 Connections 摘要中呈现,这样你可以清理它们

### 工作原理

每个 agent 的 Connectors 选项卡按能力槽存储凭证引用。Dependencies 视图双向查询此存储以渲染图。凭证轮换、过期或删除事件通过图传播:依赖于降级凭证的任何 agent 都会在其健康指示器上继承警告状态,所以图不仅是静态参考 — 它是实时传播路径。

:::warning
在轮换或删除任何由无人值守(scheduled / webhook / chain)agent 使用的凭证之前,检查依赖图并先更新 agent 以指向替换凭证。预检查在提升时捕获你;对于已提升的 agent,运行时故障是唯一的信号。
:::

:::tip
每月"凭证审计"例行程序:打开 Connections → Dependencies,按最旧排序,对底部的十几个询问"我还使用此凭证吗?"。未使用的凭证毫无用处,所以删除它们是纯清理。
:::
  `,

  "refreshing-expired-tokens": `
## 刷新过期的令牌

某些凭证按设计是时间限定的 — OAuth 访问令牌在几分钟到几小时内过期;服务发行的令牌(Slack 机器人令牌、GitHub PAT)通常有 N 天或 N 年的过期时间。Personas 在提供商发布的地方跟踪过期,并在截止日期前几天呈现"即将过期"的黄色状态(可配置,默认 7 天)。

对于具有 refresh token 的 OAuth 凭证,刷新在后台自动且静默。对于不刷新的 API key 和令牌,你会看到黄色警告,凭证卡会提供"Reconnect"或"Replace"按钮 — 点击它会打开创建凭证的同一向导。

### 关键点

- **OAuth 的自动刷新** — 静默使用 refresh token;你看不到它发生
- **对非刷新凭证的提前警告** — 过期前 N 天的黄色状态;可配置的警告窗口
- **一键重连** — 凭证卡有一个 Reconnect 按钮,重新运行认证流程
- **零停机交换** — 对于具有活跃依赖 agent 的凭证,新令牌就地替换旧令牌;agent 在下次运行时获取新值
- **故障在 agent 健康中浮现** — 刷新失败的凭证使其依赖 agent 在 Health 选项卡上变黄/红色

### 工作原理

刷新作为执行健康检查的同一后台任务的一部分运行。对于 OAuth,任务使用 refresh token 从提供商铸造新的访问令牌并更新凭证记录。对于不可刷新的令牌,任务仅更新过期预测(这样黄色警告在正确的时间出现);实际的替换是你在警告触发时采取的手动操作。

:::tip
当黄色过期警告触发时,立即刷新而不是等待。现在刷新是一项一分钟的任务。让计划的 agent 因为令牌过夜过期而在凌晨 3 点失败,在撤销错过的运行方面要昂贵得多。
:::
  `,

  "deleting-credentials-safely": `
## 安全删除凭证

删除凭证是永久性的 — 加密记录从 vault 中擦除,从 Personas 内部无法恢复。在你删除之前,凭证卡显示依赖检查:每个引用凭证的 agent、在什么能力槽中、影响是什么。你可以使用删除对话框在确认之前将每个依赖 agent 重新分配到不同的凭证,这样实际删除与重新分配是原子的。

对于 OAuth 凭证,删除仅删除本地存储的令牌 — 它不会在提供商端撤销访问。如果你还想在提供商端撤销,请在提供商的安全设置页面上执行该操作(主要提供商在删除对话框中提供链接)。

### 关键点

- **永久且立即** — 没有撤销;加密记录在确认时擦除
- **预先依赖检查** — 在你确认之前查看每个依赖 agent
- **内联重新分配** — 在删除对话框中将依赖 agent 指向替换凭证
- **OAuth 提供商:默认仅本地删除** — 提供商端撤销是单独的步骤(提供链接)
- **对已损坏凭证的无操作安全** — 删除过期/已撤销的凭证总是安全的;没有功能状态依赖于它

### 工作原理

删除对话框读取与 Dependencies 视图相同的依赖图。当你确认时,引擎首先写入你指定的任何重新分配,然后在单个事务中从 vault 中删除凭证记录。如果重新分配失败验证(例如,你尝试指向错误类别的凭证),删除会回滚,什么都不变。

:::warning
永久意味着永久。加密记录被擦除,如果你没有在其他地方写下原始密钥,它就消失了。如果你可能再次需要凭证,请在删除前在外部备份原始值。
:::

:::tip
最安全的轮换模式是"添加新的,重新分配所有 agent,然后删除旧的"。先添加替换凭证,沿着依赖图重新分配依赖 agent 一个一个(或在重新分配对话框中一次性全部),验证一切健康,然后删除旧凭证。此顺序保证零停机。
:::
  `,

  "connector-catalog": `
## 连接器目录

Connections → Catalog 的目录是 Personas 开箱即用集成的服务的精选列表。截至本文撰写时,跨 9 个类别有 60+ 个连接器,根据用户需求每个版本都会添加新连接器。每个连接器都声明其认证类型(OAuth、API key、基本认证、机器人令牌)、所需的范围/能力,以及它公开的 agent 端工具表面。

当 agent 的 Connectors 选项卡需要能力("email-send"、"cloud-storage-write"、"chat-message-send")时,它在目录中查询满足该能力的连接器,然后与你的 vault 匹配。如果你已经有这些连接器之一的凭证,这是一个立即匹配。如果没有,目录会提供添加一个 — 打开 Auto-Credential Browser 主题中描述的同一向导。

### 连接器类别

| 类别 | 示例服务 | 认证 |
|---|---|---|
| Email | Gmail、Outlook、IMAP/SMTP | OAuth / API |
| Cloud Storage | Google Drive、Dropbox、OneDrive、S3、Local Drive | OAuth / API |
| Payments | Stripe、PayPal、Square | API key |
| Social | Twitter/X、LinkedIn、Facebook、Mastodon | OAuth |
| Developer Tools | GitHub、GitLab、Jira、Linear、Sentry | OAuth / API |
| Communication | Slack、Discord、Microsoft Teams、Telegram、generic webhook | OAuth / bot token |
| CRM | Salesforce、HubSpot、Pipedrive | OAuth / API |
| AI Providers | Anthropic、OpenAI、Google、local Ollama、custom OpenAI-compatible | API |
| Data | Postgres、Snowflake、BigQuery、generic SQL/HTTP | URL + credentials |

### 关键点

- **基于能力的匹配** — 连接器公开能力;agent 需要能力;目录匹配它们
- **服务特定的怪癖已烘焙** — Slack 工作区 ID、GitHub PAT 范围、OAuth 回调 URL 等都已预配置
- **认证类型指示器** — 一眼就能看到哪些连接器是 OAuth、API-key 还是本地
- **Generic / Custom 后备** — 对于不在目录中的服务,Generic 连接器类型接受原始 HTTP/REST 配置
- **通道交付连接器** — Slack、Discord、Teams、generic webhook 也在这里显示用于出站 agent 输出(在 Connectors 选项卡上按 agent 配置)

### 工作原理

连接器定义在应用中,与二进制文件一起版本化。每个 agent 的 Connectors 选项卡动态查询目录 — 向目录添加连接器(在发布中)使其对现有 agent 可用,无需任何按 agent 迁移。你在本地配置的 Custom / Generic 连接器是 vault 范围的,不通过目录。

:::tip
目录也是一个发现表面。即使你没有特定需求也偶尔浏览一下 — 你常常会找到一个建议新自动化的集成。Communication 类别对于输出端用例(将 agent 结果传递到 Slack / Discord / Teams)特别丰富。
:::
  `,
};
