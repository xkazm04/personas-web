export const content: Record<string, string> = {
  "how-triggers-work": `
## Cách Trigger Hoạt Động

Trigger là "khi nào" của agent. Prompt và công cụ xác định *cái gì* agent làm; trigger xác định *khi nào* và *với đầu vào gì*. Personas ship bảy loại trigger: **manual** (nhấp một nút), **schedule** (kiểu cron), **webhook** (HTTP đến), **clipboard** (khớp sự kiện sao chép), **file watcher** (sự kiện hệ thống tệp), **chain** (đầu ra của agent khác) và **event-based** (sự kiện nội bộ được phát ra bởi các agent khác, plugin hoặc chính engine).

Mỗi agent có thể có bất kỳ số lượng trigger nào, trộn lẫn giữa các loại. Một agent đơn lẻ có thể chạy theo lịch trình hàng ngày, phản ứng với webhook từ Stripe, kích hoạt khi bạn sao chép địa chỉ email và có thể chain được từ các agent ngược dòng — tất cả cùng một lúc.

### Các Loại Trigger

:::compare
**Manual**
Nhấp nút trong trình chỉnh sửa hoặc từ quick-run trên title-bar. Mỗi agent được trigger này theo mặc định. Tốt nhất cho thử nghiệm và gọi tạm thời.
---
**Schedule**
Dựa trên cron. Hàng giờ, hàng ngày, hàng tuần hoặc biểu thức cron đầy đủ với múi giờ. Tốt nhất cho công việc thường xuyên chạy không cần đầu vào — tóm tắt hàng ngày, báo cáo hàng tuần.
---
**Webhook**
Một URL đến duy nhất mà agent lắng nghe. Các dịch vụ bên ngoài POST đến nó để khởi động agent. Tốt nhất cho "phản ứng với sự kiện từ dịch vụ bên thứ ba".
---
**Clipboard**
Kích hoạt khi văn bản đã sao chép khớp với mẫu được cấu hình (regex, loại nội dung hoặc từ khóa). Tốt nhất cho phím tắt người dùng power — sao chép một email, một agent tra cứu nó.
---
**File Watcher**
Các sự kiện hệ thống tệp trên thư mục được giám sát (tạo / sửa đổi / xóa). Tốt nhất cho các quy trình drop-zone nơi tệp đến vào những thời điểm không thể đoán trước.
---
**Chain**
Đầu ra của agent A trở thành đầu vào của agent B. Tốt nhất cho pipeline đa bước được tạo thành từ các agent tập trung.
---
**Event-Based**
Đăng ký các sự kiện Personas nội bộ (một credential đã hết hạn, một plugin phát ra một sự kiện, một lần thực thi kết thúc với manual_review). Tốt nhất cho các tự động hóa phản ứng trong thiết lập của riêng bạn.
:::

### Điểm Chính

- **Nhiều trigger cho mỗi agent** — không có giới hạn trên; kết hợp các loại tự do
- **Kích hoạt độc lập** — mỗi trigger đánh giá riêng nó; một schedule trigger không biết hoặc không quan tâm về một webhook trigger trên cùng một agent
- **Lọc theo trigger** — mỗi trigger có thể có các điều kiện lọc riêng (ví dụ: webhook trigger chỉ kích hoạt trên \`event_type=charge.succeeded\`)
- **Dòng dõi trigger** — canvas Lineage (Events → Live Stream → Lineage) cho thấy các trigger nào, các agent nào và các sự kiện nào được kết nối, từ đầu đến cuối trên toàn bộ thiết lập của bạn
- **Tạm dừng riêng lẻ** — vô hiệu hóa một trigger duy nhất mà không chạm vào phần còn lại của agent

### Cách Hoạt Động

Trigger được cấu hình trên tab Settings của agent hoặc bằng cách thêm chúng từ danh sách trigger trên trang Events. Engine thực thi đánh giá các điều kiện trigger một cách độc lập và gửi một lần chạy đến agent bất cứ khi nào bất kỳ trigger nào khớp. Lần chạy mang payload trigger (nội dung webhook, đường dẫn tệp, văn bản đã sao chép, đầu ra ngược dòng, dữ liệu sự kiện) vào agent như đầu vào.

:::tip
Bắt đầu mọi agent chỉ với một Manual trigger. Khi bạn tin tưởng hành vi của nó, hãy thêm các trigger tự động từng cái một để bạn có thể cô lập cái nào gây ra vấn đề nếu có gì sai.
:::
  `,

  "manual-triggers": `
## Manual Trigger

Manual trigger là mặc định cho mỗi agent. Nhấp \`Run\` trong trình chỉnh sửa và agent bắt đầu ngay lập tức, hoặc sử dụng phím tắt quick-run trên title-bar (\`Ctrl+Enter\` trên agent đang tập trung). Các lần chạy thủ công là cách bạn phát triển và kiểm thử — chúng tương đương với việc chạy một script trực tiếp để xem nó làm gì trước khi thêm một mục cron.

Bạn có thể truyền đầu vào tùy chỉnh mỗi lần. Trình chỉnh sửa agent hiển thị một trường nhập nhỏ bên cạnh nút Run khi agent khai báo rằng nó chấp nhận đầu vào; bất cứ điều gì bạn gõ đều đi qua như payload trigger.

### Điểm Chính

- **Không cần cấu hình** — manual trigger luôn có sẵn
- **Đầu vào tùy chọn** — gõ đầu vào trực tiếp, dán JSON có cấu trúc, hoặc chạy không có đầu vào cho các agent không cần đầu vào
- **Lần chạy chẩn đoán** — các lần chạy thủ công được gắn thẻ \`manual\` trong trace để bạn có thể lọc chúng ra khỏi báo cáo chi phí / chỉ số nếu bạn muốn chỉ xem hoạt động tự động
- **Nhận biết đồng thời** — các lần chạy thủ công tôn trọng giới hạn đồng thời của agent; nếu đạt đến giới hạn, lần nhấp bị từ chối với một thông báo rõ ràng

### Cách Hoạt Động

Manual trigger tồn tại ngầm trên mọi agent — không có công tắc để tắt chúng (sử dụng \`Disable\` trên toàn bộ agent nếu bạn muốn khóa nó). Engine xử lý một lần chạy thủ công giống hệt như một lần chạy tự động: cùng đường dẫn thực thi, cùng việc capture trace, cùng kế toán chi phí. Sự khác biệt duy nhất là thẻ trigger.

:::tip
Sử dụng các lần chạy thủ công trong quá trình lặp lại prompt. Lưu prompt, chạy, xem trace, chỉnh sửa. Lab arena là để so sánh có hệ thống; thủ công là để phản hồi nhanh trong trình chỉnh sửa.
:::
  `,

  "schedule-triggers": `
## Schedule Trigger

Schedule trigger chạy một agent theo tần suất định kỳ — mỗi giờ, mỗi ngày trong tuần lúc 8 giờ sáng, thứ Hai đầu tiên của tháng, hoặc bất kỳ biểu thức cron nào bạn có thể viết. UI lịch trình cung cấp cho bạn các phím tắt preset (hàng giờ, hàng ngày, hàng tuần) cho các trường hợp phổ biến, và một trường cron thô cho mọi thứ khác.

Lịch trình tôn trọng múi giờ có thể cấu hình. Theo mặc định, agent sử dụng múi giờ hệ thống của bạn, nhưng bạn có thể ghi đè cho mỗi trigger — hữu ích cho các agent phải chạy "lúc 9 giờ sáng Eastern" bất kể bạn đang ngồi ở đâu.

### Điểm Chính

- **Preset và cron** — chọn từ các tần suất phổ biến hoặc viết biểu thức cron đầy đủ
- **Múi giờ cho mỗi trigger** — tên múi giờ IANA (\`America/New_York\`, \`Europe/Prague\`, \`UTC\`); DST được xử lý tự động
- **Xem trước lần chạy tiếp theo** — trigger hiển thị ba thời gian lịch trình tiếp theo để bạn có thể kiểm tra biểu thức cron của mình
- **Tạm dừng mà không mất** — vô hiệu hóa một schedule trigger không xóa nó; kích hoạt lại để tiếp tục

### Thiết Lập Lịch Trình

:::steps
1. **Mở cài đặt trigger** — trên tab Settings của agent, hoặc từ trang Events; nhấp \`Add trigger\` và chọn Schedule
2. **Chọn một preset hoặc viết một cron** — \`0 8 * * 1-5\` cho "8 giờ sáng các ngày trong tuần", hoặc sử dụng một preset cho các trường hợp phổ biến
3. **Đặt múi giờ** — mặc định là hệ thống; thay đổi cho các agent gắn với lịch kinh doanh cụ thể
4. **Xác nhận xem trước lần chạy tiếp theo** — ba thời gian chạy sắp tới được hiển thị; xác minh chúng khớp với mong đợi của bạn
5. **Lưu** — trigger được trang bị ngay lập tức và xuất hiện trong danh sách trigger của agent với đồng hồ đếm ngược "lần chạy tiếp theo"
:::

:::tip
Schedule trigger không lấp đầy lại các lần chạy bị bỏ lỡ. Nếu ứng dụng đóng hoặc máy đang ngủ khi một thời gian lịch trình đi qua, lần chạy đó bị bỏ qua. Đối với công việc theo lịch trình quan trọng, hãy chạy triển khai đám mây (gói Builder) để orchestrator xử lý lịch trình phía server.
:::
  `,

  "webhook-triggers": `
## Webhook Trigger

Webhook trigger phơi bày một URL đến duy nhất mà agent lắng nghe. Khi một dịch vụ bên ngoài POST đến URL đó, nội dung trở thành payload trigger và agent chạy. Hầu hết các dịch vụ bên thứ ba hỗ trợ webhook (Stripe, GitHub, Shopify, Linear, Twilio, các API nội bộ tùy chỉnh) hoạt động không cần sửa đổi.

Trigger hỗ trợ lọc trên nội dung yêu cầu, header và phương thức để một endpoint duy nhất có thể chọn lọc về việc các sự kiện nào thực sự khởi động agent. Mẫu phổ biến: một URL webhook cho mỗi agent, được lọc theo các loại sự kiện cụ thể từ dịch vụ ngược dòng.

### Điểm Chính

- **URL duy nhất cho mỗi trigger** — được tạo tự động; không bao giờ được chia sẻ giữa các agent hoặc trigger
- **Biểu thức lọc** — JSONPath / khớp header cho phép bạn chấp nhận chỉ các sự kiện bạn quan tâm
- **Endpoint phát lại** — mỗi webhook nhận được đều được bảo toàn và có thể được phát lại thủ công từ trang chi tiết trigger
- **Send Test** — nút tích hợp POST các payload mẫu đến endpoint cục bộ của bạn để bạn có thể xác thực các bộ lọc và phản hồi của agent mà không cần dịch vụ bên ngoài
- **Webhook đến và đi là riêng biệt** — xem bên dưới

### Kết Nối Webhook

:::steps
1. **Thêm webhook trigger** — trang Events → Add trigger → Webhook; gắn nó với agent
2. **Sao chép URL đã tạo** — duy nhất cho trigger này; không bao giờ hết hạn trừ khi bạn xóa trigger
3. **Cấu hình dịch vụ bên ngoài** — dán URL vào cấu hình webhook của dịch vụ (Stripe Dashboard, cài đặt repo GitHub, v.v.)
4. **Đặt biểu thức lọc** — hạn chế các loại sự kiện cụ thể hoặc hình dạng payload để bạn không chạy agent trên mọi sự kiện mà dịch vụ phát ra
5. **Kiểm thử** — sử dụng Send Test với payload mẫu (hoặc kích hoạt một sự kiện thực trong dịch vụ ngược dòng); kiểm tra trace và điều chỉnh bộ lọc nếu cần
:::

### Webhook Đến Và Đi

Webhook có hai loại và đáng để phân biệt:

- **Webhook đến (chủ đề này)** — một dịch vụ bên ngoài gọi *bạn* để khởi động một agent. Stripe ping bạn khi một khoản phí thành công; GitHub ping bạn khi PR được mở.
- **Webhook đi (một tính năng riêng)** — *agent của bạn* gửi kết quả ra một kênh sau khi hoàn thành. Personas ship phân phối đi hạng nhất đến Slack, Discord, Microsoft Teams và các URL webhook chung, được cấu hình cho mỗi agent trong tab Connectors. Đầu ra của agent được định dạng phù hợp cho mỗi kênh (rich Slack blocks, Discord embeds, Teams cards) và được gửi đi khi lần chạy hoàn thành.

Hầu hết các tự động hóa cuối cùng đều sử dụng cả hai: một webhook đến khởi động agent, agent làm công việc của mình và một kênh đi gửi kết quả đến bất cứ nơi nào team của bạn đang theo dõi.

:::tip
Đối với dev cục bộ hoặc webhook tiền production, hãy sử dụng nút \`Send Test\` với payload mẫu thay vì cấu hình ngược dòng thực. Bạn sẽ lặp lại trên các bộ lọc và prompt nhanh hơn nhiều mà không cần đi vòng dịch vụ bên thứ ba.
:::
  `,

  "clipboard-monitor": `
## Clipboard Monitor

Clipboard monitor theo dõi clipboard hệ thống của bạn và kích hoạt agent khi nội dung đã sao chép khớp với các quy tắc của bạn. Sao chép một số đơn — agent tra cứu nó. Sao chép một câu tiếng nước ngoài — agent dịch nó. Sao chép một email khách hàng — agent kéo tài khoản của họ.

Khớp có thể trên các từ khóa đơn giản, mẫu regex hoặc heuristic loại nội dung (địa chỉ email, URL, số điện thoại, có hình dạng JSON, số, ID có cấu trúc). Trigger đánh giá quy tắc trên mỗi thay đổi clipboard và chỉ kích hoạt khi quy tắc khớp, vì vậy nó ngồi yên lặng trong nền cho đến khi bạn thực sự sao chép điều gì đó thú vị.

### Điểm Chính

- **Dựa trên quy tắc** — xác định một hoặc nhiều quy tắc cho mỗi trigger; khớp đầu tiên thắng
- **Chế độ khớp** — từ khóa, regex hoặc heuristic loại nội dung tích hợp (email/URL/điện thoại/JSON/v.v.)
- **Yên lặng theo mặc định** — các bản sao không khớp thậm chí không kích hoạt nhật ký đánh giá; chỉ các kết quả khớp tạo hoạt động
- **Chế độ đầu ra** — hiển thị dưới dạng thông báo trên màn hình, đẩy đến hộp thư Cockpit hoặc giữ im lặng và chỉ ghi vào bảng tin hoạt động của agent
- **Quyền riêng tư** — nội dung clipboard vẫn cục bộ; không có gì được tải lên ngoại trừ cho bất kỳ nhà cung cấp AI nào agent tự gọi

### Cách Hoạt Động

Trigger đăng ký với hệ thống clipboard của hệ điều hành khi ứng dụng khởi động. Khi clipboard thay đổi, nội dung mới được đánh giá so với mỗi quy tắc trên trigger này; khớp đầu tiên kích hoạt agent với nội dung đã sao chép làm đầu vào. Các bản sao không khớp bị loại bỏ mà không để lại dấu vết, vì vậy monitor không làm phồng nhật ký hoạt động.

:::tip
Hãy cụ thể với các quy tắc. Một clipboard monitor khớp với mọi ký hiệu \`@\` sẽ kích hoạt trên các bản sao bạn không có ý định sử dụng. Sử dụng regex email đầy đủ, hoặc giới hạn ở "các bản sao trông giống ID khách hàng" (khớp với hình dạng ID riêng của bạn).
:::
  `,

  "file-watcher-triggers": `
## File Watcher Trigger

File-watcher trigger kích hoạt khi tệp xuất hiện, thay đổi hoặc biến mất trong một thư mục bạn đã chỉ định. Thả một CSV vào thư mục và một agent xử lý nó. Lưu một hình ảnh vào thư mục "Process" và một agent OCR / phân loại hành động trên đó. Sửa đổi một tệp cấu hình và một agent diff nó so với phiên bản trước đó.

Các thư mục được giám sát có thể nằm trên hệ thống tệp cục bộ hoặc bất kỳ vị trí được đồng bộ nào (OneDrive, Dropbox, iCloud). Bộ lọc thu hẹp các sự kiện theo loại tệp / mẫu glob để bạn không chạy agent trên các thay đổi không liên quan (như các tệp \`.DS_Store\` của macOS hoặc các tệp swap tạm thời của trình soạn thảo).

### Điểm Chính

- **Giám sát bất kỳ thư mục nào** — lưu trữ đám mây cục bộ hoặc được đồng bộ; đệ quy thư mục con tùy chọn
- **Các loại sự kiện** — tạo / sửa đổi / xóa; đăng ký một, hai hoặc cả ba
- **Bộ lọc glob** — \`*.csv\`, \`**/invoices/*.pdf\`; hỗ trợ các mẫu phủ định
- **Debounce** — các sửa đổi nhanh liên tiếp kết hợp thành một sự kiện trigger (không kích hoạt kép cho luồng save-and-immediately-save)
- **Payload** — agent nhận đường dẫn tệp và (khi tệp đủ nhỏ) nội dung nội tuyến; nếu không, một đường dẫn mà agent có thể đọc bằng công cụ file-access của nó

### Cách Hoạt Động

Trigger sử dụng các API file-watch gốc của hệ điều hành (FSEvents trên macOS, ReadDirectoryChangesW trên Windows, inotify trên Linux). Watcher chạy trong tiến trình engine khi ứng dụng đang mở. Khi một sự kiện khớp với bộ lọc của trigger, engine gửi một lần chạy agent với metadata tệp làm đầu vào. Engine cũng định tuyến các sự kiện file-watcher vào **ambient producer**: bất kỳ agent nào đăng ký vào sự kiện ambient liên quan có thể phản ứng mà không cần watcher riêng của mình.

:::tip
Tạo một thư mục drop-zone riêng cho mỗi agent sử dụng file watcher. Trộn các watcher trên các thư mục dùng chung ("Downloads", "Desktop") dẫn đến các lần kích hoạt bất ngờ khi bạn lưu các tệp không liên quan ở đó.
:::
  `,

  "chain-triggers": `
## Chain Trigger

Chain trigger kết nối các agent từ đầu đến cuối: khi agent A hoàn thành thành công, agent B bắt đầu với đầu ra của A làm đầu vào của nó. Đây là cách các tự động hóa đa bước được xây dựng — mỗi agent nhỏ và tập trung, chain ghép chúng thành một pipeline.

Chain có thể phân nhánh (đầu ra của một agent cấp cho nhiều agent xuôi dòng) và hội tụ (nhiều agent ngược dòng cấp vào một agent xuôi dòng). Chúng cũng có thể có điều kiện — trigger có thể có một bộ lọc chỉ chuyển tiếp đầu ra khớp với điều kiện, vì vậy bạn chỉ chạy agent xuôi dòng trong các trường hợp quan trọng.

:::diagram
[Research Agent] --> [Writing Agent] --> [Formatting Agent] --> [Final Output]
:::

### Điểm Chính

- **Kết nối đầu ra → đầu vào** — tự động; prompt của agent xuôi dòng nhìn thấy đầu ra ngược dòng nguyên văn (hoặc được biến đổi nếu bạn cấu hình một transformer)
- **Phân nhánh và hội tụ** — chain nhiều-một và một-nhiều đều được hỗ trợ
- **Chuyển tiếp có điều kiện** — biểu thức lọc trên chain trigger cho phép bạn chuyển tiếp chỉ trên các điều kiện nhất định (đầu ra chứa "error", hoặc một trường vượt qua ngưỡng)
- **Thất bại dừng chain** — nếu một agent ngược dòng thất bại, các agent chain xuôi dòng không chạy; thất bại xuất hiện trong chế độ xem lineage để bạn có thể thấy chính xác nơi chain bị hỏng
- **Có thể nhìn thấy từ đầu đến cuối** — canvas Events → Live Stream → Lineage hiển thị đồ thị đầy đủ của các agent được chain và luồng thực thi trực tiếp

### Cách Hoạt Động

Trên tab Settings của agent xuôi dòng, thêm một Chain trigger và chọn agent ngược dòng. Engine đăng ký agent xuôi dòng vào sự kiện hoàn thành của ngược dòng; khi ngược dòng phát ra "thực thi hoàn tất với thành công", engine chuyển tiếp đầu ra làm đầu vào cho xuôi dòng. Các bộ lọc điều kiện được đánh giá phía server trước khi lần chạy xuôi dòng được gửi đi.

:::tip
Mỗi agent trong một chain nên làm chính xác một việc thật tốt. Một chain gồm ba agent nhỏ tập trung dễ gỡ lỗi hơn nhiều so với một agent lớn làm-mọi-thứ — bạn có thể thấy ở chế độ xem lineage giai đoạn nào đã thất bại, và bạn có thể đổi một agent lấy phiên bản tốt hơn mà không chạm vào phần còn lại của chain.
:::
  `,

  "event-based-triggers": `
## Event-Based Trigger

Event-based trigger đăng ký một agent vào các sự kiện Personas nội bộ. Bất cứ thứ gì trong ứng dụng phát ra sự kiện — một agent khác đang kết thúc, một credential đang hết hạn, một plugin đang kích hoạt (như plugin Drive phát ra các sự kiện \`drive.document.*\` khi các tệp thay đổi trong Local Drive) hoặc chính engine đang gắn cờ một trường hợp manual-review — có thể điều khiển một agent đã đăng ký.

Đây là loại trigger linh hoạt nhất. Không giống như webhook (đến từ hệ thống bên ngoài) hoặc lịch trình (kích hoạt theo đồng hồ), sự kiện đến từ bên trong thiết lập Personas của riêng bạn. Xây dựng các thiết lập hướng sự kiện nơi một tín hiệu có thể lan tỏa đến nhiều agent mà không cần dây nối rõ ràng.

### Điểm Chính

- **Đăng ký bất kỳ sự kiện nào** — sự kiện hoàn thành agent, sự kiện plugin, sự kiện engine, sự kiện tùy chỉnh được phát ra bởi các agent khác
- **Nhận biết payload** — mỗi sự kiện mang dữ liệu (đầu ra của agent, đường dẫn tệp, ID credential); agent đã đăng ký nhận nó làm đầu vào
- **Một-tới-nhiều** — nhiều agent có thể đăng ký vào cùng một sự kiện và tất cả chạy song song khi nó kích hoạt
- **Biểu thức lọc** — hạn chế bởi các trường payload (chỉ kích hoạt trên các sự kiện có \`severity = critical\`)
- **Có thể khám phá** — sổ đăng ký sự kiện có thể duyệt trong trang Events; bạn có thể xem chính xác các sự kiện nào có sẵn và chúng mang các trường nào

### Cách Hoạt Động

Thêm một Event trigger vào agent xuôi dòng và chọn sự kiện từ sổ đăng ký. Engine đăng ký agent khi khởi động và gửi một lần chạy với payload sự kiện bất cứ khi nào sự kiện khớp kích hoạt. Các sự kiện được phát ra bởi plugin trông giống hệt như các sự kiện được phát ra bởi engine từ góc nhìn của agent — tất cả chúng đều chảy qua cùng một bus.

:::tip
Event-based trigger là cách bạn xây dựng các mối quan hệ "nếu X thì cũng Y" mà không thay đổi X. Thêm một event trigger trên một agent mới, trỏ nó vào một sự kiện mà agent khác phát ra, và hành vi mới xảy ra một cách phản ứng — agent hiện có không biết hoặc không quan tâm.
:::
  `,

  "combining-multiple-triggers": `
## Kết Hợp Nhiều Trigger

Một agent có thể có bất kỳ số lượng trigger nào với bất kỳ loại nào. Hầu hết các agent production có ít nhất hai: một manual trigger (để kiểm thử và gọi tạm thời) cộng với một hoặc nhiều trigger tự động (schedule, webhook, chain, event). Thường thấy một agent có kết hợp schedule + webhook + chain — cùng một agent có thể chạy như một phần của batch hàng ngày, để phản ứng với một webhook thời gian thực và như một bước trong một pipeline được chain.

Nhiều trigger không can thiệp lẫn nhau. Mỗi cái kích hoạt theo lịch trình hoặc sự kiện riêng của nó; nếu hai cái kích hoạt cùng một lúc, agent chạy hai lần (cho phép theo giới hạn đồng thời). Mỗi trace của lần chạy capture trigger đã khởi động nó.

### Điểm Chính

- **Không có giới hạn trên** — một agent có thể có hàng tá trigger
- **Đánh giá độc lập** — mỗi trigger đánh giá và gửi đi một cách độc lập
- **Lọc và cấu hình cho mỗi trigger** — schedule có cron riêng, webhook có URL riêng, v.v.
- **Thẻ trigger trong trace** — mỗi lần chạy được gắn thẻ với trigger đã khởi động nó, vì vậy bạn có thể lọc hoạt động theo nguồn trigger
- **Vô hiệu hóa có chọn lọc** — vô hiệu hóa một trigger duy nhất mà không chạm vào phần còn lại

### Cách Hoạt Động

Tab Settings → Triggers trên agent hiển thị mọi trigger được đính kèm, trạng thái của nó (bật/tắt) và thời gian kích hoạt cuối cùng. Thêm các trigger mới bằng \`Add trigger\`; cùng một bộ chọn cho phép bạn tạo bất kỳ loại nào trong bảy loại trigger. Các trigger bị vô hiệu hóa vẫn ở trong danh sách để bạn có thể kích hoạt lại sau mà không cần cấu hình lại.

:::tip
Một mẫu hữu ích: giữ một Manual trigger hoạt động mãi mãi (để gỡ lỗi), và ghép mỗi trigger tự động "thực" với một Manual trigger anh chị em cùng hình dạng đầu vào. Theo cách đó, bạn có thể phát lại bất kỳ payload tự động nào theo cách thủ công bất cứ khi nào bạn muốn điều tra.
:::
  `,

  "testing-and-debugging-triggers": `
## Kiểm Thử Và Gỡ Lỗi Trigger

Tab Events → Test là trình kiểm thử trigger. Đối với bất kỳ trigger nào, bạn có thể gửi một payload mẫu (nội dung webhook, sự kiện tệp, chuỗi clipboard, dữ liệu sự kiện) và xem chính xác những gì agent sẽ nhận và nó sẽ phản hồi như thế nào — mà không cần dịch vụ bên ngoài hoặc chờ đến thời điểm trigger thực tế.

Đối với các trigger đã kích hoạt và agent không chạy theo cách bạn mong đợi, nhật ký trigger cho thấy mọi đánh giá: các bộ lọc khớp, các bộ lọc bị từ chối, hình dạng payload, thời gian gửi. Canvas lineage (Events → Live Stream → Lineage) là tương đương trực quan — nó cho thấy các đánh giá và gửi trigger trực tiếp trên toàn bộ thiết lập của bạn.

### Điểm Chính

- **Mô phỏng bất kỳ trigger nào** — dán một payload và xem phản hồi của agent
- **Nhật ký trigger** — mọi nỗ lực kích hoạt đều được ghi lại, bao gồm các từ chối bộ lọc để bạn có thể thấy điều gì không khớp
- **Canvas lineage** — đồ thị trực quan của các trigger, agent và sự kiện với các chỉ báo luồng trực tiếp khi mọi thứ đang kích hoạt
- **Send Test cho webhook** — nút tích hợp POST một nội dung mẫu đến endpoint cục bộ
- **Phát lại** — các lần kích hoạt trigger trong quá khứ có thể được phát lại với payload gốc chính xác, hữu ích cho "điều gì xảy ra nếu webhook Stripe này đến lại agent"

### Gỡ Lỗi Trigger Từng Bước

:::steps
1. **Xác nhận trigger được bật** — tab Settings → Triggers trên agent; biểu tượng mờ có nghĩa là trigger bị vô hiệu hóa
2. **Kiểm tra nhật ký trigger** — Events → Test → Logs được lọc bởi trigger của bạn; tìm các đánh giá không được gửi
3. **Kiểm tra bộ lọc so với payload** — nếu trigger đã đánh giá nhưng không gửi, một biểu thức lọc đang từ chối nó; sao chép payload và kiểm thử bộ lọc một cách rõ ràng
4. **Xác minh việc gửi đến agent** — trace thực thi nên hiển thị thẻ trigger; nếu không có thực thi nào xuất hiện, trigger chưa bao giờ gửi (vấn đề bộ lọc, giới hạn đồng thời hoặc agent bị vô hiệu hóa)
5. **Sử dụng canvas lineage** — cho các trigger chain hoặc event, mở Lineage và truy vết đường đi; bạn sẽ thấy nơi luồng bị gián đoạn
:::

:::tip
"Trigger của tôi không kích hoạt" hầu như luôn có nghĩa là một trong các vấn đề: trigger bị vô hiệu hóa, một bộ lọc quá nghiêm ngặt, agent bị vô hiệu hóa hoặc dịch vụ bên ngoài không thực sự gửi những gì bạn nghĩ nó đang gửi. Nhật ký trigger phân biệt cả bốn trong vòng một phút.
:::
  `,
};
