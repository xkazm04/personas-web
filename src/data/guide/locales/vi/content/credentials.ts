export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Cách Personas Giữ An Toàn Dữ Liệu Của Bạn

Bảo mật được tích hợp vào Personas từ nền tảng. API key, token và mật khẩu sống trong một vault mã hóa cục bộ trên máy của bạn — chúng không bao giờ rời khỏi thiết bị trừ khi một agent rõ ràng gửi chúng đến một nhà cung cấp AI hoặc dịch vụ bên thứ ba trong một lần chạy. Chính tệp vault được mã hóa bằng **AES-256-GCM**, và khóa mở khóa nó được bao bọc bởi keyring gốc của hệ điều hành (Windows DPAPI, macOS Keychain, Linux Secret Service) để các khóa văn bản thuần không bao giờ nằm trên đĩa.

Khi bạn chạy một agent, engine giải mã chỉ các credential cụ thể mà agent đó cần, giữ chúng trong bộ nhớ trong thời gian gọi, sau đó xóa văn bản thuần. Nhật ký, trace và xuất khẩu không bao giờ chứa các giá trị credential thô — bất cứ nơi nào credential xuất hiện, bạn thấy một tham chiếu token (\`cred:gmail-work\`) thay thế.

### Điểm Chính

- **AES-256-GCM** — mã hóa được xác thực (mỗi ciphertext của credential được kiểm tra tính toàn vẹn, vì vậy một tệp vault bị giả mạo được phát hiện, không được giải mã âm thầm)
- **Khóa chính được bao bọc bởi keyring hệ điều hành** — DPAPI trên Windows, Keychain trên macOS, Secret Service trên Linux; không cần mật khẩu chính phải gõ mỗi phiên
- **Chỉ cục bộ theo mặc định** — không có gì được tải lên; triển khai đám mây là tùy chọn và mã hóa khi truyền qua TLS đến orchestrator bạn chọn
- **Tham chiếu token trong nhật ký** — trace và xuất khẩu của agent sử dụng ID credential, không phải bí mật thô
- **Bằng chứng giả mạo** — thẻ xác thực GCM bắt bất kỳ sửa đổi nào với tệp vault

### Cách Hoạt Động

Lưu trữ một credential mã hóa nó bằng khóa vault (khóa AES-256-GCM cho mỗi vault, bản thân nó được bao bọc bởi keyring hệ điều hành) và ghi ciphertext vào SQLite cục bộ. Sử dụng credential trong một lần chạy agent giải mã nó trong bộ nhớ, chuyển nó đến công cụ hoặc HTTP client liên quan và giải phóng buffer ngay lập tức. Giá trị thô không bao giờ được ghi nhật ký, không bao giờ được hiển thị sau khi nhập ban đầu và không bao giờ được tuần tự hóa ở bất cứ đâu bên ngoài vault mã hóa.

### Xem Thực Tế

:::usecases
**Nhiều dịch vụ, các credential được cô lập**
Các agent của bạn nói chuyện với Slack, GitHub và Jira
---
Mỗi credential được mã hóa độc lập với nonce ngẫu nhiên riêng. Sự xâm phạm một bản ghi không phơi bày những bản ghi khác.
===
**Xoay vòng credential**
Một token hết hạn hoặc bị xoay vòng
---
Các credential OAuth tự động làm mới thông qua refresh token của nhà cung cấp. Các khóa được xoay vòng thủ công bạn hoán đổi trên bản ghi credential mà không khởi động lại bất cứ thứ gì.
===
**Trace thân thiện với kiểm toán**
Bạn cần chứng minh credential nào được sử dụng ở đâu
---
Trace của mỗi lần chạy ghi lại ID credential mà nó đã sử dụng. Giá trị thực tế không bao giờ xuất hiện; ID đủ để chứng minh nguồn gốc.
:::

:::info
Vault được ràng buộc với tài khoản người dùng hệ điều hành của bạn thông qua keyring hệ điều hành. Sao chép tệp vault sang máy khác, ngay cả với cùng hệ điều hành, sẽ không làm cho nó có thể giải mã được — khóa bao bọc sống trong keyring hệ điều hành và không di động.
:::

:::warning
Nếu bạn thay đổi mật khẩu tài khoản hệ điều hành của mình trên macOS hoặc Linux, keyring có thể khóa lại khóa bao bọc. Personas sẽ nhắc nhập credential mới trong lần chạy đầu tiên sau khi thay đổi. Nếu keyring bị xóa (factory reset, xóa tài khoản), vault trở nên không thể khôi phục — sao lưu các bí mật thô bên ngoài nếu bạn cần khôi phục thảm họa ngoài máy cục bộ.
:::

:::tip
Mô hình chỉ cục bộ là mặc định phù hợp cho tự động hóa cá nhân. Đối với công việc team / production nơi nhiều máy cần cùng các credential, triển khai đám mây (gói Team / Builder) sao chép trạng thái vault qua orchestrator với mã hóa end-to-end.
:::
  `,

  "adding-a-new-credential": `
## Thêm Credential Mới

Mở Connections → Credentials và nhấp \`Add Credential\`. Chọn một danh mục (email, lưu trữ đám mây, thanh toán, giao tiếp, công cụ dev, CRM, nhà cung cấp AI, chung) — bộ chọn hiển thị các connector được tạo sẵn phù hợp tự động cấu hình loại auth, các trường cần thiết và gợi ý nhãn. Nếu dịch vụ của bạn không có trong catalog, hãy chọn "Custom" và tự xác định credential (tên, loại, trường).

Đối với các dịch vụ hỗ trợ OAuth, luồng mở một cửa sổ trình duyệt đến màn hình đồng thuận của nhà cung cấp. Đối với các dịch vụ API-key, dán key vào trường nhập an toàn. Dù theo cách nào, credential nằm được mã hóa và bộ chọn đề nghị áp dụng nó cho bất kỳ agent nào có slot khả năng mở trong danh mục phù hợp.

### Từng Bước

:::steps
1. **Điều hướng đến Connections → Credentials** — thanh bên → Connections, sau đó tab Credentials
2. **Nhấp Add Credential** — nút trên-phải trên danh sách credential
3. **Chọn một danh mục** — email / lưu trữ / thanh toán / v.v.; catalog connector phù hợp lọc tự động
4. **Chạy luồng auth** — OAuth mở một cửa sổ đồng thuận; các dịch vụ API-key sử dụng trường nhập an toàn
5. **Đặt tên và lưu** — đặt cho credential một nhãn bạn sẽ nhận ra ("Stripe Live", "Gmail Personal"); credential được mã hóa bằng AES-256-GCM và được lưu trữ
6. **Tùy chọn: gắn vào agent ngay bây giờ** — bộ chọn hiển thị các agent có khả năng mở phù hợp; gắn một cú nhấp chuột tránh việc săn tìm chúng sau này
:::

### Cách Hoạt Động

Khi bạn nhấp Save, giá trị thô của credential được mã hóa bằng khóa vault được suy ra từ keyring hệ điều hành, sau đó được cam kết vào kho lưu trữ credential. Việc lưu chỉ trả về ID và nhãn credential — giá trị thô được xóa khỏi bộ nhớ ngay lập tức. Từ thời điểm này, tab Connectors của trình chỉnh sửa agent có thể tham chiếu credential bằng ID.

:::warning
Không bao giờ dán credential vào prompt agent, nhận xét mã hoặc cửa sổ trò chuyện. Chỉ sử dụng trường nhập credential an toàn — bất cứ điều gì khác đều có nguy cơ giá trị thô bị bắt trong nhật ký, đồng bộ hoặc ảnh chụp màn hình.
:::

:::tip
Quy ước đặt tên quan trọng khi bạn có 20+ credential. \`<service>-<env>-<account>\` ("stripe-live-main", "gmail-prod-support") làm rõ ngay lập tức nên chọn credential nào khi bạn đang cấu hình tab Connectors của agent.
:::
  `,



  "credential-health-checks": `
## Kiểm Tra Sức Khỏe Credential

Credential trôi dạt theo thời gian — các token hết hạn, các khóa được xoay vòng ngược dòng, các scope OAuth thay đổi. Kiểm tra sức khỏe credential ping mỗi credential đã lưu định kỳ với một cuộc gọi kiểm thử nhẹ (một yêu cầu API không hoạt động không tốn kém và cho bạn biết liệu credential còn hợp lệ hay không). Kết quả xuất hiện dưới dạng chỉ báo trạng thái trên thẻ credential và dưới dạng cảnh báo khi một credential xuống cấp.

Lịch trình kiểm tra có thể cấu hình. Theo mặc định, các credential OAuth kiểm tra hàng ngày (vì luồng refresh-token cần credential được thực hiện định kỳ dù sao), các credential API-key kiểm tra hàng tuần. Các kiểm tra thủ công có thể được chạy bất cứ lúc nào từ thẻ credential.

### Điểm Chính

- **Trạng thái cho mỗi credential** — xanh lá (khỏe mạnh), vàng (sắp hết hạn / scope đã thay đổi), đỏ (bị hỏng / bị thu hồi)
- **Tần suất có thể cấu hình** — ghi đè cho mỗi credential nếu một dịch vụ giới hạn tốc độ kiểm tra mạnh
- **Kiểm tra thủ công** — kiểm thử một cú nhấp chuột từ thẻ credential; hữu ích trước khi triển khai một agent mới
- **Dự báo hết hạn** — đối với các credential có ngày hết hạn đã biết (JWT đã ký, token có scope), trạng thái chuyển sang vàng N ngày trước khi hết hạn (có thể cấu hình, mặc định 7)
- **Định tuyến cảnh báo** — thất bại định tuyến qua các kênh thông báo giống như bạn đã cấu hình cho agent

### Cách Hoạt Động

Mỗi connector xác định cuộc gọi kiểm tra sức khỏe của riêng nó (yêu cầu nhẹ nhất có thể thực hiện credential). Việc kiểm tra chạy trong nền theo tần suất đã cấu hình; kết quả được lưu trữ và cập nhật trạng thái của credential. Nếu một kiểm tra thất bại, trạng thái chuyển đổi, thẻ credential nổi bật và các agent phụ thuộc kế thừa cảnh báo trên các chỉ báo sức khỏe của riêng họ — vì vậy một credential Gmail bị hỏng làm cho mọi agent sử dụng Gmail hiển thị màu vàng cho đến khi bạn sửa.

:::tip
Chạy một kiểm tra sức khỏe thủ công trước bất kỳ triển khai production hoặc lần chạy theo lịch trình qua đêm nào. Năm giây bây giờ so với một lần chạy thất bại lúc 3 giờ sáng vì một token âm thầm được xoay vòng.
:::
  `,

  "auto-credential-browser": `
## Trình Duyệt Credential Tự Động

Trình duyệt credential tự động là quá trình onboarding theo catalog cho các credential mới. Mở Connections → Catalog và bạn thấy mọi connector được Personas ship cấu hình sẵn: 60+ dịch vụ tại thời điểm viết, được tổ chức theo danh mục (email, lưu trữ, thanh toán, giao tiếp, công cụ dev, CRM, nhà cung cấp AI, v.v.). Mỗi connector biết loại auth phù hợp, các trường cần thiết, các scope OAuth, các endpoint API và bất kỳ điều kỳ quặc nào dành riêng cho dịch vụ.

Khi bạn chọn một connector, trình hướng dẫn dẫn bạn qua các bước chính xác cho dịch vụ đó — bao gồm các liên kết đến các trang cụ thể trong UI của dịch vụ nơi bạn sẽ tìm thấy API key, hoặc các scope OAuth nào để phê duyệt, hoặc các quyền nào quan trọng. Đối với các dịch vụ mà Personas có thể phát hiện kết nối thành công (hầu hết chúng), trình hướng dẫn xác minh trong thời gian thực trước khi lưu.

### Điểm Chính

- **60+ connector được cấu hình sẵn** — loại auth, các trường, scope, endpoint được tích hợp sẵn
- **Hướng dẫn dành riêng cho dịch vụ** — các liên kết trực tiếp đến trang API-key chính xác hoặc tab cài đặt
- **Xác thực trực tiếp** — trình hướng dẫn kiểm thử credential trước khi lưu cho hầu hết các dịch vụ
- **Luồng được đề xuất cho agent** — catalog cũng có thể được vào từ tab Connectors của agent, nơi nó được lọc theo các connector phù hợp với slot khả năng đang mở
- **Yêu cầu connector mới** — các dịch vụ chưa có trong catalog có thể được yêu cầu; cho các trường hợp một lần, hãy sử dụng loại connector Generic / Custom

### Cách Hoạt Động

Các định nghĩa connector được ship cùng với ứng dụng và được cập nhật thông qua chu kỳ phát hành thông thường. Mỗi định nghĩa khai báo luồng auth của nó, các trường cần thiết, endpoint xác thực và danh sách scope. Khi bạn chọn một connector, trình hướng dẫn đọc định nghĩa, render biểu mẫu phù hợp, chạy luồng OAuth hoặc API-key và xác thực trước khi lưu. Giá trị credential thực tế được mã hóa tại thời điểm lưu bằng cùng đường dẫn như một credential được thêm thủ công.

:::tip
Catalog cũng là cách nhanh nhất để khám phá những gì được tích hợp. Nếu bạn đang xem xét liệu Personas có thể làm X với dịch vụ Y, hãy tìm trong catalog trước — nếu Y có ở đó với một khả năng liên quan, tích hợp chỉ là một cú nhấp chuột.
:::
  `,

  "which-agents-use-which-credentials": `
## Agent Nào Dùng Credential Nào

Tab Dependencies trên Connections cho thấy đồ thị credential → agent. Chọn một credential ở bên trái và bạn thấy mọi agent tham chiếu đến nó ở bên phải, với slot khả năng cụ thể được đặt tên ("Gmail account for the email-summary agent"). Chọn một agent và bạn thấy mọi credential mà nó phụ thuộc vào. Đồ thị là hai chiều — hữu ích cho cả "điều gì hỏng nếu tôi xoay vòng khóa này?" và "agent này cần các credential nào trước khi tôi có thể promote?".

Cùng bản đồ phụ thuộc này thúc đẩy kiểm tra pre-flight của build engine: khi bạn promote một agent, engine kiểm tra chéo mọi khả năng yêu cầu so với vault và gắn cờ các credential thiếu hoặc đã hết hạn trước khi cho phép promote. Đây là lý do bạn hầu như không bao giờ gặp lỗi "credential not found" tại thời điểm chạy trong các agent mới được tạo — kiểm tra phụ thuộc đã chạy tại thời điểm promote và bắt được nó.

### Điểm Chính

- **Đồ thị hai chiều** — credential → agent và agent → credential
- **Slot khả năng được đặt tên** — phụ thuộc cho bạn biết không chỉ "credential này được sử dụng" mà "được sử dụng như khả năng gửi email"
- **Kiểm tra pre-flight** — xác thực tại thời điểm promote sử dụng cùng đồ thị
- **Xem trước tác động** — chọn một credential làm nổi bật mọi agent sẽ bị ảnh hưởng bởi việc loại bỏ nó
- **Phát hiện credential không sử dụng** — các credential có 0 phụ thuộc agent xuất hiện trong tóm tắt Connections để bạn có thể dọn dẹp chúng

### Cách Hoạt Động

Tab Connectors của mỗi agent lưu trữ tham chiếu credential cho mỗi slot khả năng. Chế độ xem Dependencies truy vấn kho lưu trữ này theo cả hai hướng để render đồ thị. Xoay vòng credential, hết hạn hoặc các sự kiện loại bỏ lan truyền qua đồ thị: bất kỳ agent nào phụ thuộc vào credential bị xuống cấp đều kế thừa trạng thái cảnh báo trên chỉ báo sức khỏe của nó, vì vậy đồ thị không chỉ là một tham chiếu tĩnh — nó là một đường dẫn lan truyền trực tiếp.

:::warning
Trước khi xoay vòng hoặc xóa bất kỳ credential nào được sử dụng bởi một agent không được giám sát (lịch trình / webhook / chain), hãy kiểm tra bản đồ phụ thuộc và cập nhật các agent để trỏ vào credential thay thế trước. Kiểm tra pre-flight bắt bạn tại thời điểm promote; đối với các agent đã được promote, lỗi runtime là tín hiệu duy nhất.
:::

:::tip
Một thói quen "kiểm toán credential" hàng tháng: mở Connections → Dependencies, sắp xếp theo cũ nhất và hỏi "tôi có còn sử dụng credential này không?" cho hàng tá dưới cùng. Các credential không sử dụng là bề mặt cho không có gì, vì vậy việc loại bỏ chúng là việc dọn dẹp thuần túy.
:::
  `,

  "refreshing-expired-tokens": `
## Làm Mới Token Đã Hết Hạn

Một số credential bị giới hạn thời gian theo thiết kế — các access token OAuth hết hạn trong vài phút đến vài giờ; các token do dịch vụ cấp (Slack bot token, GitHub PAT) thường có thời hạn N ngày hoặc N năm. Personas theo dõi hết hạn nơi nhà cung cấp công bố nó và hiển thị trạng thái vàng "sắp hết hạn" một số ngày trước cắt (có thể cấu hình, mặc định 7 ngày).

Đối với các credential OAuth có refresh token, refresh là tự động và im lặng trong nền. Đối với các API key và token không refresh, bạn sẽ thấy cảnh báo vàng và thẻ credential sẽ cung cấp nút "Reconnect" hoặc "Replace" — nhấp vào nó mở cùng trình hướng dẫn đã tạo ra credential.

### Điểm Chính

- **Làm mới tự động cho OAuth** — refresh token được sử dụng im lặng; bạn không thấy điều này xảy ra
- **Cảnh báo trước cho các credential không refresh** — trạng thái vàng N ngày trước hết hạn; cửa sổ cảnh báo có thể cấu hình
- **Reconnect một cú nhấp chuột** — thẻ credential có nút Reconnect chạy lại luồng auth
- **Hoán đổi không có thời gian chết** — đối với các credential có agent phụ thuộc đang hoạt động, token mới thay thế token cũ tại chỗ; các agent lấy giá trị mới trong lần chạy tiếp theo
- **Lỗi xuất hiện trong sức khỏe agent** — các credential không refresh thành công làm cho các agent phụ thuộc của chúng chuyển sang vàng / đỏ trên tab Health

### Cách Hoạt Động

Refresh chạy như một phần của cùng nhiệm vụ nền thực hiện kiểm tra sức khỏe. Đối với OAuth, nhiệm vụ sử dụng refresh token để tạo một access token mới từ nhà cung cấp và cập nhật bản ghi credential. Đối với các token không thể refresh, nhiệm vụ chỉ cập nhật dự báo hết hạn (để cảnh báo vàng xuất hiện đúng lúc); việc thay thế thực tế là một hành động thủ công bạn thực hiện khi cảnh báo kích hoạt.

:::tip
Khi một cảnh báo hết hạn vàng kích hoạt, hãy refresh ngay lập tức thay vì chờ. Refresh bây giờ là một nhiệm vụ một phút. Để một agent theo lịch trình thất bại lúc 3 giờ sáng vì token hết hạn qua đêm sẽ tốn kém hơn nhiều trong việc khắc phục các lần chạy bị bỏ lỡ.
:::
  `,


  "connector-catalog": `
## Catalog Connector

Catalog tại Connections → Catalog là danh sách được tuyển chọn các dịch vụ mà Personas tích hợp out of the box. Tại thời điểm viết này, 60+ connector trên 9 danh mục, với các connector mới được thêm vào mỗi bản phát hành dựa trên nhu cầu người dùng. Mỗi connector khai báo loại auth của nó (OAuth, API key, basic auth, bot token), các scope / khả năng cần thiết và bề mặt công cụ phía agent mà nó phơi bày.

Khi tab Connectors của một agent cần một khả năng ("email-send", "cloud-storage-write", "chat-message-send"), nó truy vấn catalog cho các connector đáp ứng khả năng đó, sau đó khớp với vault của bạn. Nếu bạn đã có một credential cho một trong các connector đó, đó là một khớp ngay lập tức. Nếu không, catalog đề nghị thêm một — mở cùng trình hướng dẫn được mô tả trong chủ đề Auto-Credential Browser.

### Danh Mục Connector

| Danh mục | Dịch vụ ví dụ | Auth |
|---|---|---|
| Email | Gmail, Outlook, IMAP/SMTP | OAuth / API |
| Cloud Storage | Google Drive, Dropbox, OneDrive, S3, Local Drive | OAuth / API |
| Payments | Stripe, PayPal, Square | API key |
| Social | Twitter/X, LinkedIn, Facebook, Mastodon | OAuth |
| Developer Tools | GitHub, GitLab, Jira, Linear, Sentry | OAuth / API |
| Communication | Slack, Discord, Microsoft Teams, Telegram, generic webhook | OAuth / bot token |
| CRM | Salesforce, HubSpot, Pipedrive | OAuth / API |
| AI Providers | Anthropic, OpenAI, Google, local Ollama, custom OpenAI-compatible | API |
| Data | Postgres, Snowflake, BigQuery, generic SQL/HTTP | URL + credentials |

### Điểm Chính

- **Khớp dựa trên khả năng** — các connector phơi bày khả năng; các agent cần khả năng; catalog khớp chúng
- **Các điều kỳ quặc dành riêng cho dịch vụ được tích hợp sẵn** — ID workspace Slack, scope GitHub PAT, URL callback OAuth, v.v., tất cả đều được cấu hình sẵn
- **Chỉ báo loại auth** — trong nháy mắt, xem connector nào là OAuth so với API-key so với cục bộ
- **Dự phòng Generic / Custom** — đối với các dịch vụ không có trong catalog, loại connector Generic chấp nhận cấu hình HTTP/REST thô
- **Connector phân phối kênh** — Slack, Discord, Teams, generic webhook hiển thị ở đây cho đầu ra agent đi cũng (được cấu hình cho mỗi agent trên tab Connectors)

### Cách Hoạt Động

Các định nghĩa connector sống trong ứng dụng và được phiên bản hóa cùng với mã nhị phân. Tab Connectors trên mỗi agent truy vấn catalog một cách động — việc thêm một connector vào catalog (trong một bản phát hành) làm cho nó có sẵn cho các agent hiện có mà không cần di chuyển cho mỗi agent. Các connector Custom / Generic mà bạn cấu hình cục bộ có phạm vi vault và không đi qua catalog.

:::tip
Catalog cũng là một bề mặt khám phá. Duyệt thỉnh thoảng ngay cả khi bạn không có nhu cầu cụ thể — bạn thường sẽ tìm thấy một tích hợp gợi ý một tự động hóa mới. Đặc biệt danh mục Communication phong phú cho các trường hợp sử dụng phía đầu ra (phân phối kết quả agent đến Slack / Discord / Teams).
:::
  `,
};
