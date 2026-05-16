export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## Thực Thi Cục Bộ So Với Đám Mây

Các agent Personas chạy ở hai nơi: trên máy cục bộ của bạn (engine riêng của ứng dụng máy tính để bàn) hoặc trên một orchestrator từ xa (được quản lý bởi đám mây bởi chúng tôi, hoặc BYOI trên hạ tầng của riêng bạn). Cục bộ là mặc định và hoạt động ngoài hộp; đám mây là opt-in (gói Team / Builder) và cho phép tính khả dụng 24/7 mà không cần máy của bạn bật. Cùng prompt, công cụ và credential của agent hoạt động trong cả hai môi trường — chuyển đổi là một quyết định triển khai, không phải thiết kế lại.

Các yếu tố quyết định thường là yêu cầu uptime và khả quan sát. Cục bộ hoạt động tuyệt vời cho phát triển, kiểm thử, các agent thăm dò và bất cứ điều gì mà bạn ở xung quanh để xem công việc. Đám mây là lựa chọn phù hợp cho các lần chạy qua đêm theo lịch trình, các agent webhook cần có thể truy cập được trong khi bạn ngủ và bất kỳ tự động hóa cấp production nào mà "laptop của tôi đã đóng" không thể là một chế độ thất bại.

:::compare
**Thực thi cục bộ** [default]
Chạy trong engine của ứng dụng máy tính để bàn. Có sẵn khi ứng dụng đang mở. Không cần thiết lập. Dữ liệu và credential không bao giờ rời khỏi máy của bạn. Đầy đủ khả quan sát trực tiếp trong cùng UI bạn xây dựng. Tốt nhất cho phát triển, kiểm thử, công việc được giám sát và bất cứ điều gì nhạy cảm về quyền riêng tư.
---
**Thực thi đám mây**
Chạy trên orchestrator (đám mây được quản lý hoặc BYOI). Có sẵn 24/7 bất kể máy cục bộ của bạn. Thiết lập là một lần. Dữ liệu và credential được mã hóa khi truyền đến orchestrator và khi nghỉ trên đó. Kết quả đồng bộ với máy tính để bàn của bạn. Tốt nhất cho lịch trình, webhook và công việc không giám sát cấp production.
:::

### Cách Hoạt Động

Các agent cục bộ được gửi bởi engine thực thi trong ứng dụng — cùng đường dẫn mà mọi thứ khác trong ứng dụng sử dụng. Các agent đám mây được triển khai: cấu hình đầy đủ của agent (prompt, công cụ, credential bằng tham chiếu, trigger) được gửi đến orchestrator, chạy một tiến trình agent dài hạn xử lý các trigger phía server. Kết quả stream trở lại ứng dụng máy tính để bàn và xuất hiện trong cùng các chế độ xem giám sát như các lần chạy cục bộ.

:::tip
Phát triển và kiểm thử cục bộ, sau đó triển khai những gì hoạt động lên đám mây. Engine cục bộ có vòng lặp chỉnh sửa-kiểm thử nhanh nhất; đám mây là nơi bạn đặt các agent có lịch trình hoặc tính khả dụng quan trọng. Bạn không phải chọn một hoặc cái kia toàn cầu — thiết lập điển hình có hầu hết các agent cục bộ và một số ít production trên đám mây.
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## Kết Nối Với Cloud Orchestrator

Mở Deployment → Cloud Deploy để kết nối với orchestrator. Hai con đường: **orchestrator được quản lý** (chúng tôi lưu trữ nó; bạn xác thực với tài khoản của bạn và bạn đã xong trong 30 giây) hoặc **BYOI** (bạn lưu trữ orchestrator trên hạ tầng của riêng bạn; bạn trỏ ứng dụng máy tính để bàn vào endpoint của bạn và cung cấp một khóa auth). Dù theo cách nào, kết nối là một lần cho mỗi máy và tồn tại qua các lần khởi động lại ứng dụng.

Khi được kết nối, mỗi tab Settings của agent có thêm tùy chọn "Deploy to cloud". Kích hoạt triển khai tải cấu hình của agent lên orchestrator và bắt đầu một tiến trình phía server dài hạn cho nó. Các agent đám mây xuất hiện trong cùng các chế độ xem giám sát như các agent cục bộ, được gắn thẻ với một biểu tượng đám mây nhỏ.

:::steps
1. **Mở Deployment → Cloud Deploy** — thanh bên → Deployment → Cloud Deploy
2. **Chọn môi trường** — Managed Cloud (đăng nhập một cú nhấp chuột) hoặc BYOI (nhập URL orchestrator + khóa auth)
3. **Cho BYOI**: dán URL orchestrator và token auth; trình hướng dẫn chạy kiểm tra kết nối và xác minh tương thích phiên bản orchestrator
4. **Cho Managed**: nhấp "Sign in"; luồng OAuth mở để xác thực với tài khoản Personas của bạn
5. **Lưu** — kết nối tồn tại; các agent bây giờ hiển thị tùy chọn "Deploy to cloud" trong tab Settings của họ
:::

:::warning
Hãy xử lý token auth BYOI như bất kỳ credential nào khác: lưu trữ nó trong vault (Connections → Credentials → Custom), không dán nó vào trò chuyện hoặc commit nó vào kiểm soát phiên bản. Bất cứ ai nắm giữ token có thể triển khai và gỡ triển khai bất kỳ agent nào trên orchestrator.
:::

### Cách Hoạt Động

Orchestrator là một tiến trình server dài hạn (một cho mỗi môi trường) giữ các cấu hình agent được triển khai và chạy chúng theo lịch trình, theo sự kiện webhook hoặc theo yêu cầu. Giao tiếp giữa ứng dụng máy tính để bàn và orchestrator là qua TLS với xác thực tương hỗ. Các credential của các agent được triển khai được mã hóa tại thời điểm triển khai bằng cách sử dụng khóa cho mỗi tenant của orchestrator và được giải mã chỉ bên trong tiến trình orchestrator tại thời gian chạy.

:::tip
Kiểm thử kết nối trước khi triển khai bất cứ thứ gì. Kiểm tra kết nối của trình hướng dẫn xác minh tương thích phiên bản và khả năng tiếp cận — nếu nó thất bại, thất bại dễ chẩn đoán hơn nhiều bây giờ so với sau khi bạn đã cố gắng triển khai ba agent.
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## Triển Khai Một Agent Lên Đám Mây

Với một orchestrator được kết nối, việc triển khai bất kỳ agent nào là một nút trên tab Settings của nó. Hành động triển khai đóng gói cấu hình đầy đủ của agent (prompt, công cụ, các tham chiếu credential, các định nghĩa trigger, cài đặt) và gửi nó đến orchestrator qua TLS. Orchestrator xác thực, thiết lập agent và bắt đầu xử lý các trigger của nó phía server. Lần chạy đầu tiên thường xảy ra trong vài giây.

Các bản sao cục bộ và đám mây của cùng agent đồng bộ với nhau thông qua cùng hệ thống tự động đồng bộ xử lý tất cả phối hợp máy tính để bàn ↔ đám mây. Bạn có thể tiếp tục lặp lại trên agent cục bộ và triển khai lại khi sẵn sàng; bạn không phải chọn giữa hai môi trường.

:::steps
1. **Xác minh kết nối orchestrator** — Deployment → Cloud Deploy nên hiển thị "Connected"
2. **Mở agent** — trang Agents → cái bạn muốn triển khai
3. **Settings tab → Deploy to Cloud** — nút trong phần triển khai
4. **Xem lại tóm tắt triển khai** — các credential đang được gửi đi, các trigger đang được trang bị, lựa chọn mô hình, cài đặt dự phòng; mọi thứ nên khớp với những gì bạn đã kiểm thử cục bộ
5. **Xác nhận Deploy** — orchestrator nhận cấu hình, xác thực, thiết lập agent; trạng thái chuyển sang "Deployed" trong vài giây
6. **Xác minh trong bảng điều khiển** — Overview → Activity hiển thị agent với một biểu tượng đám mây; sự kiện lịch trình / webhook tiếp theo sẽ định tuyến đến phiên bản đám mây
:::

:::warning
Các agent đám mây sử dụng credential từ vault phía đám mây, không phải vault cục bộ của bạn trực tiếp. Hành động triển khai gửi các *tham chiếu* credential (được mã hóa) và orchestrator giải quyết chúng phía server. Nếu một credential chỉ ở cục bộ hoặc chưa được nhân bản, việc triển khai sẽ hiển thị cảnh báo "credential not available in cloud" và yêu cầu bạn hoặc nhân bản hoặc chọn một sự thay thế trước khi hoàn thành.
:::

### Cách Hoạt Động

Triển khai là nguyên tử: hoặc orchestrator chấp nhận toàn bộ cấu hình và agent đi vào hoạt động, hoặc nó từ chối (với một lý do cụ thể) và không có gì thay đổi phía server. Khi được triển khai, orchestrator sở hữu việc đánh giá trigger — ứng dụng cục bộ của bạn không còn kích hoạt lịch trình / webhook cho agent đó (bạn sẽ nhận được trùng lặp nếu không). Các lần chạy thủ công từ ứng dụng máy tính để bàn được định tuyến đến phiên bản đám mây qua cùng kết nối.

:::tip
Triển khai các agent theo lịch trình trước khi bắt đầu với đám mây. Chúng hưởng lợi nhiều nhất từ uptime 24/7, và chúng dễ xác minh nhất (bạn sẽ thấy lần chạy diễn ra theo lịch trình mong đợi của nó dù laptop của bạn có mở hay không).
:::
  `,

  "cloud-execution-monitoring": `
## Giám Sát Thực Thi Đám Mây

Các agent đám mây có thể nhìn thấy từ cùng các trang Overview như các agent cục bộ — cùng bảng tin Activity, cùng tab Health, cùng phân tích Usage. Một biểu tượng đám mây nhỏ phân biệt các agent đám mây với các agent cục bộ. Nhấp vào bất kỳ lần thực thi đám mây nào và bạn nhận được trace đầy đủ giống như một lần chạy cục bộ: prompt được render, cuộc gọi mô hình, các cuộc gọi công cụ, đầu ra, chi phí.

Ứng dụng máy tính để bàn poll orchestrator liên tục khi mở và đăng ký các luồng sự kiện trực tiếp khi được kết nối, vì vậy những gì bạn thấy là trạng thái trực tiếp với độ trễ được đo bằng giây, không phải phút. Khi ứng dụng đóng, orchestrator tiếp tục mọi thứ tự nó; mở ứng dụng sau đó bắt kịp trạng thái cục bộ từ kho lưu trữ có thẩm quyền của orchestrator.

### Điểm Chính

- **Bề mặt giám sát thống nhất** — các agent cục bộ và đám mây chia sẻ cùng các chế độ xem Activity / Health / Usage
- **Streaming sự kiện trực tiếp** trong khi máy tính để bàn được kết nối; sự tồn tại phía orchestrator đảm bảo không có gì bị mất khi bạn ngoại tuyến
- **Biểu tượng đám mây** phân biệt các agent cư trú trên đám mây
- **Quy gán chi phí cho đám mây** — các biểu đồ sử dụng bao gồm cả chi tiêu cục bộ và đám mây, được phân tích theo môi trường
- **Bắt kịp khi kết nối lại** — mở ứng dụng sau thời gian ngoại tuyến kéo dài đồng bộ tất cả các sự kiện bị bỏ lỡ từ orchestrator

### Cách Hoạt Động

Các agent đám mây phát ra cùng các bản ghi thực thi và sự kiện như các agent cục bộ; orchestrator lưu trữ chúng phía server và sao chép sang ứng dụng máy tính để bàn khi kết nối. Bảng tin Activity hợp nhất các luồng sự kiện cục bộ và đám mây theo thứ tự thời gian, vì vậy thiết lập kết hợp cục bộ + đám mây trông giống như một chế độ xem thống nhất thay vì hai cái song song.

:::tip
Đặt giới hạn ngân sách cho mỗi ngày trên các agent đám mây từ ngày đầu tiên. Các agent đám mây không có kiểm tra "Tôi đang xem điều này xảy ra" ngầm mà các lần chạy thủ công cục bộ có; giới hạn cho mỗi ngày là mạng lưới an toàn của bạn chống lại một prompt bỏ chạy qua đêm.
:::
  `,

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

  "byoi-bring-your-own-infrastructure": `
## BYOI — Bring Your Own Infrastructure

BYOI (gói Builder) có nghĩa là bạn tự chạy orchestrator thay vì sử dụng đám mây được quản lý của chúng tôi. Bạn cài đặt phần mềm orchestrator (được cung cấp như một image Docker và một Kubernetes Helm chart) trên hạ tầng của riêng bạn, cấu hình nó theo sở thích của bạn (xác thực, lưu trữ, mạng) và trỏ ứng dụng máy tính để bàn vào URL orchestrator của bạn. Từ điểm đó, việc triển khai các agent hoạt động giống hệt như đám mây được quản lý — chúng chỉ chạy trên phần cứng của bạn.

BYOI là lựa chọn phù hợp khi chủ quyền dữ liệu quan trọng (các môi trường quy định, sự cô lập dữ liệu khách hàng, các mạng air-gapped), khi bạn có hạ tầng hiện có mà bạn muốn tận dụng (thay vì trả tiền cho hosting được quản lý ngoài ra), hoặc khi bạn muốn toàn quyền kiểm soát môi trường runtime (mạng tùy chỉnh, các đảm bảo tính khả dụng cụ thể, tích hợp với ngăn xếp khả quan sát hiện có của bạn).

### Điểm Chính

- **Orchestrator tự lưu trữ** — image Docker + Helm chart được xuất bản theo mỗi bản phát hành
- **Chủ quyền dữ liệu** — dữ liệu thực thi, credential và trace không bao giờ rời khỏi hạ tầng của bạn
- **Cùng ngữ nghĩa agent** — các agent được triển khai cho một orchestrator BYOI hoạt động giống hệt như đám mây được quản lý
- **Xác thực của bạn, lưu trữ của bạn, mạng của bạn** — orchestrator tích hợp với nhà cung cấp danh tính hiện có, cơ sở dữ liệu và các chính sách mạng của bạn
- **Tính năng cấp Builder** — yêu cầu đăng ký Builder cho giấy phép phần mềm orchestrator

### Cách Hoạt Động

Orchestrator chạy như một tiến trình server dài hạn. Image Docker là tự chứa cho các triển khai một nút; Helm chart hỗ trợ các thiết lập đa nút HA với lưu trữ được chia sẻ. Xác thực tích hợp với các nhà cung cấp OIDC để bạn có thể sử dụng SSO hiện có của mình; lưu trữ sử dụng Postgres (được quản lý hoặc tự lưu trữ); các khóa mã hóa vault credential sống trong KMS bạn chọn (Vault, AWS KMS, GCP KMS, Azure Key Vault).

Việc triển khai một agent cho một orchestrator BYOI giống hệt như đám mây được quản lý từ góc nhìn của ứng dụng máy tính để bàn — cùng UI, cùng luồng, cùng khả quan sát. Endpoint orchestrator chỉ được cấu hình để trỏ vào cài đặt của bạn thay vì của chúng tôi.

:::info
BYOI thực sự là công việc hạ tầng. Phần mềm orchestrator được tài liệu hóa tốt và Helm chart xử lý hầu hết các thiết lập, nhưng bạn vẫn cần ai đó thoải mái với việc chạy phần mềm server production. Đối với các team không có năng lực đó, đám mây được quản lý là điểm khởi đầu tốt hơn — chuyển sang BYOI sau nếu yêu cầu thay đổi.
:::

:::tip
Chạy BYOI trong môi trường staging trước nếu bạn mới với nó. Hướng dẫn thiết lập bao gồm một "minimal local stack" Docker Compose chạy orchestrator + Postgres + Vault trên một máy duy nhất — hoàn hảo để có được các bộ phận đang hoạt động trước khi triển khai phần cứng production.
:::
  `,

  "syncing-desktop-and-cloud": `
## Đồng Bộ Máy Tính Để Bàn Và Đám Mây

Khi bạn có các agent được triển khai cho một cloud orchestrator, ứng dụng máy tính để bàn giữ trạng thái được đồng bộ giữa hai cái tự động. Các chỉnh sửa cục bộ đối với một agent được triển khai (thay đổi prompt, điều chỉnh cài đặt, xoay vòng credential) đẩy đến orchestrator khi lưu. Các sự kiện phía đám mây (kết quả thực thi, các lần kích hoạt trigger, thay đổi sức khỏe) đồng bộ trở lại máy tính để bàn và xuất hiện trong các chế độ xem giám sát.

Đồng bộ chạy trong nền liên tục trong khi máy tính để bàn được kết nối. Khi ứng dụng ngoại tuyến, các thay đổi cục bộ xếp hàng và đẩy khi kết nối lại; các sự kiện đám mây tích lũy phía server và stream xuống khi kết nối lại. Thanh trạng thái cho thấy trạng thái đồng bộ với một chỉ báo nhỏ (xanh lá = đồng bộ đầy đủ, hổ phách = đồng bộ đang tiến hành / các thay đổi đang xếp hàng, đỏ = lỗi đồng bộ cần chú ý).

### Điểm Chính

- **Hai chiều, tự động** — các thay đổi cục bộ đẩy khi lưu; các sự kiện đám mây stream xuống liên tục
- **Chịu được ngoại tuyến** — các thay đổi cục bộ xếp hàng khi ngoại tuyến và đẩy khi kết nối lại; đám mây bảo toàn các sự kiện để bắt kịp
- **Phát hiện xung đột** — nếu cùng agent được chỉnh sửa cục bộ và từ xa (ví dụ: bởi một đồng đội sử dụng cùng orchestrator), máy tính để bàn nhắc giải quyết trước khi commit
- **Chỉ báo trạng thái** — phần tử thanh dưới cùng cho thấy trạng thái đồng bộ trực tiếp
- **Đồng bộ thủ công** — nhấp chỉ báo để kích hoạt đồng bộ rõ ràng; hữu ích ngay trước khi ngắt kết nối

### Cách Hoạt Động

Đồng bộ sử dụng vector phiên bản cho mỗi tài nguyên. Mỗi agent, credential, trigger và bản ghi thực thi mang một phiên bản tăng dần khi thay đổi. Đồng bộ là "gửi các phiên bản của tôi, nhận bất kỳ phiên bản mới hơn nào" — hiệu quả, nhận biết xung đột. Các xung đột (hiếm, nhưng có thể trong các thiết lập orchestrator được chia sẻ) xuất hiện như một nhắc giải quyết; bạn chọn phiên bản nào thắng hoặc hợp nhất thủ công.

:::tip
Liếc nhìn chỉ báo đồng bộ sau các thay đổi có ý nghĩa. Xanh lá có nghĩa là an toàn để đóng ứng dụng và tin tưởng rằng đám mây có cái mới nhất. Hổ phách có nghĩa là các thay đổi đang trong chuyến bay — chờ vài giây trước khi ngắt kết nối nếu bạn muốn chắc chắn.
:::
  `,

  "cloud-troubleshooting": `
## Khắc Phục Sự Cố Đám Mây

Hầu hết các vấn đề đám mây rơi vào một tập hợp nhỏ: orchestrator không thể tiếp cận (mạng / tường lửa / orchestrator down), không khớp credential (một credential mà agent sử dụng không được sao chép sang phía orchestrator), không khớp phiên bản (orchestrator trên bản phát hành cũ hơn máy tính để bàn, các tính năng bị thiếu) hoặc cấu hình không đồng bộ (cục bộ có các thay đổi chưa lưu chưa được đẩy). Trang trạng thái Deployment → Cloud Deploy là bề mặt chẩn đoán tốt nhất duy nhất — nó cho thấy sức khỏe orchestrator, trạng thái đồng bộ và trạng thái triển khai cho mỗi agent với các lý do thất bại cụ thể.

Đối với các vấn đề cấp agent (agent được triển khai nhưng không chạy, các lần chạy thất bại trên đám mây nhưng thành công cục bộ), tab Health của agent cho thấy cùng chẩn đoán cho đám mây như cho cục bộ — trạng thái credential, các lý do thất bại gần đây, sự hoàn chỉnh cấu hình. Trace thực thi cũng cho thấy liệu một lần chạy được thực hiện trên đám mây hay cục bộ, vì vậy bạn có thể cô lập các vấn đề "chỉ đám mây" nhanh chóng.

### Các Vấn Đề Phổ Biến Và Cách Khắc Phục

| Triệu chứng | Nguyên nhân có thể | Khắc phục |
|---|---|---|
| Agent không chạy theo lịch trình | Orchestrator không thể tiếp cận, hoặc trigger bị vô hiệu hóa phía đám mây | Kiểm tra trạng thái Deployment; triển khai lại nếu trạng thái trigger cũ |
| Lỗi credential trên lần chạy đám mây đầu tiên | Credential không được sao chép đến orchestrator | Deployment → Cloud Deploy → "Sync credentials"; xác minh tab Connectors của agent |
| Kết quả không xuất hiện trên máy tính để bàn | Đồng bộ bị tạm dừng hoặc ứng dụng ngoại tuyến khi lần chạy xảy ra | Nhấp chỉ báo đồng bộ; các sự kiện stream xuống khi kết nối lại |
| Agent đám mây chậm hơn cục bộ | Mô hình / nhà cung cấp khác được cấu hình tại deploy; hoặc độ trễ mạng từ agent đến nhà cung cấp AI | Kiểm tra cấu hình hiệu lực của agent trong chế độ xem chi tiết Cloud Deploy |
| Lỗi "Version mismatch" khi deploy | Orchestrator trên bản phát hành cũ hơn | Nâng cấp orchestrator (BYOI) hoặc chờ rollout đám mây được quản lý |

### Cách Hoạt Động

Trang trạng thái Deployment poll orchestrator liên tục trong khi máy tính để bàn được kết nối và render kết quả như một bảng điều khiển duy nhất. Mỗi agent được triển khai có trạng thái cho mỗi tài nguyên (khỏe mạnh / suy giảm / không thể tiếp cận) với vấn đề cụ thể được đặt tên. Hầu hết các vấn đề có giải pháp một cú nhấp chuột được cung cấp trực tiếp từ hàng trạng thái.

:::warning
"Redeploy" là cách khắc phục dễ nhất cho nhiều vấn đề đám mây, nhưng nó đẩy *trạng thái cục bộ hiện tại* đến orchestrator. Nếu bạn có các thay đổi cục bộ mà bạn chưa xem xét (hoặc, trên một orchestrator được chia sẻ, đám mây có các thay đổi chưa đến cục bộ), việc redeploy có thể ghi đè chúng. Luôn kiểm tra trạng thái đồng bộ trước — nếu hổ phách, hãy giải quyết đồng bộ trước khi redeploy.
:::

:::tip
Vấn đề đám mây phổ biến nhất cho đến nay là "Tôi quên sao chép một credential sang vault đám mây". Trước khi triển khai bất kỳ agent nào, trình hướng dẫn deploy kiểm tra trước tính khả dụng credential và cảnh báo; hãy chú ý đến cảnh báo đó thay vì bỏ qua nó, và hầu hết các lỗi credential phía đám mây biến mất.
:::
  `,
};
