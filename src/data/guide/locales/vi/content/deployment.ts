export const content: Record<string, string> = {
  "github-actions-integration": `
## Tích Hợp GitHub Actions

Các agent có thể kích hoạt các quy trình GitHub Actions thông qua công cụ GitHub trên tab Connectors của họ, và GitHub Actions có thể kích hoạt các agent thông qua webhook trigger tiêu chuẩn. Hai mẫu kết hợp tốt: một sự kiện GitHub (PR mở, push to main, release được gắn thẻ) kích hoạt một webhook khởi động một agent Personas, agent làm việc của nó và (nếu cần) agent kích hoạt một quy trình như một phần của đầu ra của nó.

Connector GitHub ship trong Catalog (Connections → Catalog → Developer Tools → GitHub). Xác thực là OAuth hoặc một PAT chi tiết — OAuth được ưu tiên khi agent chỉ cần quyền truy cập đọc; PAT hoạt động tốt cho các hoạt động ghi như gửi quy trình.

### Điểm Chính

- **GitHub → Personas qua webhook đến** — webhook trigger tiêu chuẩn; cấu hình GitHub để POST đến URL của agent
- **Personas → GitHub qua công cụ GitHub** — agent có thể gửi các quy trình, bình luận trên PR, mở các issue, bất cứ điều gì GitHub API phơi bày
- **Xác thực có scope** — OAuth cho các agent chủ yếu đọc, PAT chi tiết cho các hoạt động ghi; scope tối thiểu cho mỗi agent
- **Đồng bộ trạng thái trực tiếp** — các trace agent cho thấy yêu cầu workflow_dispatch và phản hồi của GitHub; agent có thể chờ quy trình hoàn thành nếu cần

### Cách Hoạt Động

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

Công cụ GitHub bao bọc các API GitHub REST/GraphQL và phơi bày các hành động cấp cao cho agent: "dispatch workflow", "comment on PR", "open issue", "merge PR", v.v. Prompt của agent đặt tên hành động nó nên thực hiện dựa trên trigger; công cụ xử lý xác thực, xây dựng payload và xử lý phản hồi.

:::warning
Sử dụng PAT chi tiết thay vì PAT cổ điển bất cứ khi nào gói GitHub của bạn hỗ trợ chúng. PAT cổ điển cấp các quyền rộng trên toàn tổ chức; PAT chi tiết hạn chế ở các kho cụ thể và các scope quyền cụ thể, thu hẹp đáng kể bán kính nổ nếu token bị rò rỉ.
:::

:::tip
Bắt đầu với một quy trình có rủi ro thấp làm mục tiêu — như một quy trình "thông báo Slack" chỉ đăng một tin nhắn. Khi việc chuyển giao agent → GitHub Actions được chứng minh, hãy nâng cấp lên các mục tiêu rủi ro cao hơn (deploy, release-cut, v.v.).
:::
  `,

  "gitlab-ci-cd-integration": `
## Tích Hợp GitLab CI/CD

Personas tích hợp với GitLab theo hai cách: một plugin GitLab trực tiếp cung cấp cho các agent quyền truy cập cấp API (trạng thái pipeline, bình luận MR, quản lý issue), và một xuất khẩu GitLab CI YAML chạy các agent Personas như các bước bên trong các pipeline hiện có của bạn. Cả hai đều ship; chọn cái phù hợp với hình dạng quy trình của team bạn.

Plugin (Plugins → GitLab) xử lý tích hợp phía API: cài đặt, xác thực và các agent của bạn nhận được một bề mặt công cụ \`gitlab\` với các hành động cấp cao (start pipeline, comment on MR, manage issues). Việc xuất khẩu CI YAML đi theo hướng khác — các agent của bạn trở thành các bước trong các pipeline GitLab CI của bạn, được thực thi bởi các runner GitLab, với các kết quả được chuyển tiếp đến các bước tiếp theo.

### Điểm Chính

- **Plugin GitLab** — tích hợp cấp API; agent sử dụng GitLab như một công cụ từ tab Connectors của nó
- **Xuất khẩu CI YAML** — agent trở thành một bước trong pipeline GitLab của bạn; chạy trên các runner GitLab của bạn
- **Hai chiều** — các sự kiện GitLab có thể kích hoạt các agent (webhook), và các agent có thể kích hoạt các pipeline GitLab (plugin)
- **Các scope token** — sử dụng các token truy cập dự án hoặc các token truy cập nhóm có scope đến các quyền tối thiểu cần thiết
- **Các sự kiện pipeline làm trigger** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\` đều có thể tiêu thụ qua webhook trigger

### Cách Hoạt Động

Plugin sử dụng các token API GitLab được lưu trữ trong vault credential. Khi một agent gọi một hành động công cụ GitLab, engine gửi cuộc gọi API, capture phản hồi và đưa nó trở lại làm kết quả công cụ cho lượt tiếp theo của mô hình.

Đối với xuất khẩu CI: mở tab Settings của agent → Export → GitLab CI YAML. Trình hướng dẫn tạo ra một định nghĩa job bao bọc agent trong một hình dạng có thể chạy CI (thường là một image Docker với Personas CLI cộng với tham chiếu của agent). Commit YAML được tạo ra vào \`.gitlab-ci.yml\` của repository của bạn; agent chạy như một phần của pipeline cùng với bất kỳ job CI nào khác.

:::warning
CI YAML được xuất khẩu tham chiếu các biến credential cho những thứ như khóa nhà cung cấp AI. Xác định những thứ này như các biến **được che giấu, được bảo vệ** GitLab CI/CD trong cài đặt dự án của bạn — không bao giờ hardcode các bí mật trong chính tệp YAML, vì pipeline YAML sống trong repo của bạn và có thể nhìn thấy bởi bất kỳ ai có quyền đọc.
:::

:::tip
Plugin là tùy chọn nhẹ hơn cho hầu hết các team. Xuất khẩu CI YAML hữu ích nhất khi agent phải chạy bên trong một runner GitLab dù sao (cô lập mạng, tài nguyên mạng nội bộ, hạ tầng được yêu cầu bởi tuân thủ) — nếu không plugin cho phép bạn giữ agent trong Personas nơi khả quan sát và gỡ lỗi của nó phong phú nhất.
:::
  `,

  "n8n-workflow-integration": `
## Tích Hợp Quy Trình n8n

n8n là một công cụ tự động hóa quy trình mã nguồn mở phổ biến, và Personas tích hợp với nó hai chiều. Bạn có thể nhập các quy trình n8n hiện có vào Personas dưới dạng các mẫu (Templates → n8n Import) — trình hướng dẫn nhập phân tích JSON quy trình và ánh xạ các nút n8n đến các agent, connector và trigger Personas tương đương. Bạn cũng có thể gọi các agent Personas *từ* n8n bằng cách sử dụng các nút HTTP/webhook để gọi URL webhook đến của một agent.

Nhập n8n là một chiều và một lần: nó mang *hình dạng* của quy trình vào Personas, nhưng nó không giữ cho bản gốc n8n được đồng bộ. Sau khi nhập, pipeline được nhập là của bạn để chỉnh sửa độc lập.

### Điểm Chính

- **Nhập n8n → Personas** — Templates → n8n Import; phân tích JSON quy trình, ánh xạ các nút đến các tương đương Personas
- **Trigger Personas → n8n** — các nút HTTP/webhook của n8n có thể POST đến URL webhook trigger của một agent
- **Trigger n8n → Personas** — n8n có thể gọi một webhook agent Personas như một phần của quy trình n8n; phản hồi của agent (có thể cấu hình) chảy trở lại n8n
- **Không được đồng bộ** — các pipeline được nhập tách khỏi nguồn n8n của chúng; xử lý nhập như một điểm khởi đầu một lần
- **Phạm vi nút được ánh xạ** — trình nhập xử lý các nút phổ biến (HTTP, function, IF, switch); các nút lạ / cộng đồng có thể nhập dưới dạng placeholder để hoàn thành thủ công

### Cách Hoạt Động

Trình hướng dẫn nhập đọc JSON quy trình n8n (xuất từ n8n → "Download" trên quy trình), ánh xạ mỗi nút đến tương đương Personas gần nhất của nó (nút HTTP → công cụ, nút function → agent, IF/switch → định tuyến có điều kiện, v.v.) và staging kết quả như một pipeline bạn xem trước trước khi chấp nhận. Việc ánh xạ là nỗ lực tốt nhất: bất cứ thứ gì trình nhập không thể ánh xạ tự tin trở thành một placeholder với một ghi chú để bạn điền vào.

Đối với hướng ngược lại, URL webhook của agent Personas chỉ là một URL — bất kỳ nút HTTP n8n nào cũng có thể gọi nó. Truyền đầu vào dưới dạng nội dung yêu cầu; agent xử lý và (tùy chọn) trả lời đồng bộ với đầu ra của nó.

:::tip
n8n xuất sắc trong việc "di chuyển dữ liệu giữa các dịch vụ"; Personas xuất sắc trong "suy nghĩ" — phân tích, quyết định, viết. Các quy trình kết hợp mạnh nhất sử dụng n8n cho điều phối cộng với các agent Personas cho các điểm quyết định được hỗ trợ bởi AI, thay vì cố gắng làm tất cả của một trong cái kia.
:::
  `,

};
