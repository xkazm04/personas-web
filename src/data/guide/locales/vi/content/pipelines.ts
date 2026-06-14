export const content: Record<string, string> = {
  "what-are-pipelines": `
## Pipeline Là Gì?

Một pipeline là một nhóm agent được phối hợp truyền công việc giữa nhau để xử lý một tác vụ đa bước. Thay vì một agent lớn làm-mọi-thứ, bạn xây dựng các agent nhỏ tập trung và kết nối chúng — mỗi cái chuyên môn hóa, pipeline xử lý điều phối. Phần Pipeline trong thanh bên là nơi các pipeline sống; Team Canvas bên trong là nơi bạn soạn chúng.

Các pipeline trong Personas là first-class — chúng có lịch sử thực thi riêng, các bề mặt khả quan sát riêng, bộ nhớ team riêng (ngữ cảnh được chia sẻ mà tất cả các agent trong pipeline có thể đọc) và chúng có thể được kích hoạt giống như một agent đơn lẻ (lịch trình, webhook, thủ công, chain). Sự khác biệt là một trigger kích hoạt toàn bộ pipeline thay vì một agent.

:::compare
**Single Agent**
Một prompt, một bộ công cụ, một đầu ra. Đơn giản để thiết lập; giới hạn khi tác vụ tự nhiên phân hủy thành các giai đoạn.
---
**Pipeline** [recommended for multi-stage work]
Nhiều agent tập trung, được kết nối thành một luồng. Mỗi agent nhỏ và dễ gỡ lỗi; pipeline kết hợp chúng thành một khả năng lớn hơn. Bộ nhớ team được chia sẻ cho phép các agent truyền ngữ cảnh có cấu trúc, không chỉ văn bản. Có thể nhìn thấy trên team canvas từ đầu đến cuối.
:::

### Điểm Chính

- **Luồng đa agent** — các agent truyền đầu ra đến đầu vào dọc theo các kết nối được xác định
- **Bộ nhớ team** — một kho lưu trữ ngữ cảnh được chia sẻ mà tất cả các agent pipeline có thể đọc và ghi, riêng biệt với bộ nhớ cho mỗi agent
- **Trình chỉnh sửa trực quan** — Team Canvas; đặt các agent, vẽ kết nối, cấu hình định tuyến
- **Có thể tái sử dụng** — cùng pipeline chạy cho bất kỳ payload trigger phù hợp nào; các pipeline cũng có thể sao chép
- **Khả quan sát** — lịch sử thực thi đầy đủ cấp pipeline với phân tích cho mỗi agent

### Cách Hoạt Động

Bạn soạn một pipeline trên Team Canvas: thả các agent, vẽ kết nối, cấu hình các nhánh có điều kiện nếu cần. Khi pipeline chạy, dữ liệu chảy dọc theo các kết nối — đầu ra của mỗi agent trở thành đầu vào cho bất kỳ agent xuôi dòng nào mà canvas đã kết nối. Engine theo dõi lần chạy từ đầu đến cuối để bạn thấy một lần thực thi pipeline thay vì N lần chạy agent rời rạc.

### Xem Thực Tế

:::usecases
**Tự động hóa DevOps**
Một pull request mở trên GitHub
---
PR Reviewer agent phân tích diff, Test Runner xác minh các bản build, Release Notes soạn changelog, Slack Notifier đăng tóm tắt lên kênh team của bạn — pipeline duy nhất được kích hoạt bởi webhook GitHub.
===
**Quy trình nội dung**
Bạn cần một bài đăng blog được xuất bản từ một chủ đề
---
Research agent thu thập các nguồn, Writer soạn bài, Editor đánh bóng, Publisher định dạng cho CMS của bạn — pipeline quản lý việc chuyển giao và bộ nhớ team mang hướng dẫn phong cách được chia sẻ.
===
**Phân loại hỗ trợ khách hàng**
Một ticket mới đến
---
Classifier xác định mức độ khẩn cấp và danh mục, Knowledge agent truy xuất các tài liệu liên quan, Drafter viết phản hồi ứng viên, Router leo thang lên người nếu độ tin cậy thấp.
:::

:::info
Không có giới hạn trên cứng nào về kích thước pipeline. Bắt đầu với hai agent để xác thực luồng dữ liệu, phát triển bằng cách thêm một chuyên gia tại một thời điểm. Các pipeline với 10+ agent hoạt động đáng tin cậy như các pipeline nhỏ; engine xử lý điều phối giống nhau.
:::

:::tip
Hãy xử lý mỗi agent trong pipeline như một hàm đơn mục đích: một hình dạng đầu vào cụ thể, một hình dạng đầu ra cụ thể. Mỗi agent càng nhỏ và tập trung, toàn bộ pipeline càng dễ gỡ lỗi và các phần riêng lẻ càng có thể tái sử dụng trên các pipeline.
:::
  `,

  "the-team-canvas": `
## Team Canvas

Team Canvas là trình chỉnh sửa trực quan cho các pipeline. Mở Pipeline → Team Canvas và bạn thấy pipeline của mình dưới dạng đồ thị: các nút agent được kết nối bằng các cạnh có hướng. Thả các agent từ bảng thư viện bên trái, vẽ kết nối bằng cách kéo từ port đầu ra của một agent đến port đầu vào của một agent khác, cấu hình các nhánh bằng các nút điều kiện. Canvas hỗ trợ pan, zoom, chọn nhiều, tự động bố trí và điều hướng bàn phím.

Canvas không chỉ là trực quan hóa — nó là trình chỉnh sửa. Mọi thay đổi bạn thực hiện trên canvas (đặt một agent, vẽ một kết nối, thêm một nút điều kiện) ngay lập tức cập nhật định nghĩa của pipeline. Lưu để cam kết; pipeline được kiểm soát phiên bản giống như cách các prompt agent là.

### Điểm Chính

- **Kéo và thả** các agent từ thư viện lên canvas
- **Vẽ kết nối** — nhấp và kéo từ port đầu ra đến port đầu vào; dữ liệu chảy dọc theo kết nối tại thời gian chạy
- **Các nút điều kiện** — thêm một nút định tuyến giữa các agent để phân nhánh dựa trên dữ liệu
- **Tự động bố trí** — một cú nhấp chuột làm gọn canvas thành luồng trái-phải hoặc trên-dưới
- **Được phiên bản hóa** — các bản chụp canvas được lưu cùng với pipeline; khôi phục các bố cục và topology trước đó

### Xây Dựng Pipeline Đầu Tiên Của Bạn

:::steps
1. **Mở Pipeline → Team Canvas** — thanh bên → Pipeline → New Pipeline (hoặc mở một pipeline hiện có)
2. **Duyệt thư viện agent** — bảng bên trái; lọc theo nhóm hoặc tìm kiếm
3. **Kéo các agent lên canvas** — đặt chúng theo thứ tự thực thi gần đúng
4. **Vẽ kết nối** — port đầu ra (cạnh phải) đến port đầu vào (cạnh trái)
5. **Thêm các nút điều kiện nếu cần** — thanh công cụ → Conditional; cấu hình các nhánh
6. **Lưu** — Ctrl+S; pipeline được cam kết và có thể chạy ngay lập tức
:::

:::tip
Trái-sang-phải, trên-xuống-dưới là quy ước dễ đọc nhất. Sử dụng tự động bố trí (nút thanh công cụ) khi topology được đặt; nó tạo ra một luồng trực quan sạch giúp bất kỳ ai đọc canvas — bao gồm tương lai-bạn — hiểu pipeline trong nháy mắt.
:::
  `,

  "adding-agents-to-a-pipeline": `
## Thêm Agent Vào Pipeline

Các agent được thêm vào pipeline từ bảng thư viện bên trái của Team Canvas. Kéo bất kỳ agent nào lên canvas để đặt nó; các cài đặt mặc định của agent được chuyển qua (prompt, công cụ, mô hình, credential), nhưng bạn có thể ghi đè cho mỗi pipeline nếu bạn muốn agent này hoạt động hơi khác ở đây so với nơi khác.

Cùng một agent có thể tham gia vào nhiều pipeline, mỗi cái với bộ ghi đè riêng. Các thay đổi đối với agent cơ bản (ví dụ: chỉnh sửa prompt trong trình chỉnh sửa của chính agent) lan tỏa đến tất cả các pipeline sử dụng nó; các ghi đè cho mỗi pipeline thì không, chúng chỉ sống trong pipeline.

### Điểm Chính

- **Kéo từ thư viện** — bất kỳ agent nào bạn đã tạo đều có sẵn
- **Ghi đè cho mỗi pipeline** — ánh xạ đầu vào, transformer đầu ra, ưu tiên mô hình (nếu bạn muốn pipeline này sử dụng mô hình rẻ hơn cho giai đoạn này), nhà cung cấp dự phòng
- **Tái sử dụng đa pipeline** — một agent trong pipeline A và pipeline B có các bộ ghi đè độc lập cho mỗi pipeline
- **Các thay đổi agent cơ bản lan tỏa** — chỉnh sửa prompt, thay đổi công cụ, v.v., chảy qua mọi pipeline sử dụng agent (các ghi đè cho mỗi pipeline thì không)
- **Thay thế agent tại chỗ** — nhấp chuột phải → Replace; agent mới kế thừa các kết nối của agent cũ nếu các hình dạng đầu vào/đầu ra khớp

### Cách Hoạt Động

Đặt một agent trên canvas tạo ra một *tham chiếu phạm vi pipeline* đến agent đó. Tham chiếu bao gồm bộ ghi đè (bất kỳ tùy chỉnh nào cho mỗi pipeline) và vị trí trên canvas. Tại thời gian chạy, engine giải quyết tham chiếu, áp dụng các ghi đè lên cấu hình cơ bản của agent và gửi lần chạy.

:::tip
Hãy chống lại sự cám dỗ để nướng các tùy chỉnh nặng cho mỗi pipeline vào bộ ghi đè. Nếu bạn thấy mình đang ghi đè nhiều thứ trong một pipeline, thường sạch hơn để sao chép agent (cho bản sao một tên rõ ràng như "Email Writer - Pipeline B") và sử dụng bản sao — giữ các tùy chỉnh cho mỗi pipeline rõ ràng thay vì ẩn trong các bảng ghi đè.
:::
  `,

  "connecting-agents-with-data-flow": `
## Kết Nối Agent Với Luồng Dữ Liệu

Các kết nối trên canvas là các cạnh có hướng từ port đầu ra của một agent đến port đầu vào của một agent khác. Mỗi kết nối mang đầu ra của agent ngược dòng đến agent xuôi dòng làm đầu vào — nguyên văn theo mặc định, hoặc được biến đổi bởi một transformer nội tuyến (một biểu thức nhỏ định hình lại đầu ra trước khi chuyển nó đi).

Các kết nối được cấu hình: bạn có thể thêm transformer, gắn nhãn (hữu ích trong các pipeline phức tạp) và tắt chúng tạm thời để gỡ lỗi mà không cần loại bỏ. Nhiều kết nối có thể fan out từ một đầu ra (broadcast: các agent xuôi dòng đều nhận cùng dữ liệu) hoặc fan in vào một đầu vào (engine kết hợp các đầu vào từ nhiều agent ngược dòng vào một đối tượng đầu vào cho xuôi dòng).

### Điểm Chính

- **Nhấp-kéo** từ port đầu ra đến port đầu vào để tạo kết nối
- **Transformer tùy chọn** — biểu thức nội tuyến định hình lại dữ liệu trên đường đi qua
- **Fan-out** — một đầu ra đến nhiều đầu vào xuôi dòng (phân nhánh song song)
- **Fan-in** — nhiều đầu ra ngược dòng vào một đầu vào xuôi dòng (đối tượng kết hợp)
- **Bật/tắt** — vô hiệu hóa một kết nối mà không xóa nó (hữu ích cho các triển khai theo giai đoạn)
- **Được gắn nhãn** — đặt tên các kết nối để rõ ràng trong các pipeline phức tạp
- **Xóa** — nhấp kết nối → phím Delete

### Kết Nối Hai Agent

:::steps
1. **Tìm port đầu ra** — vòng tròn nhỏ ở cạnh phải của agent nguồn
2. **Nhấp-và-kéo** đến port đầu vào — vòng tròn nhỏ ở cạnh trái của mục tiêu
3. **Thả vào port đầu vào** — đường được vẽ; kết nối được cam kết
4. **Tùy chọn thêm transformer** — nhấp chuột phải kết nối → Add transformer; viết một biểu thức nhỏ để định hình lại dữ liệu
5. **Kiểm thử bằng cách chạy pipeline** — nhấp vào bất kỳ kết nối nào trong một lần chạy để kiểm tra dữ liệu đi qua
:::

:::tip
Sử dụng nhãn kết nối và transformer một cách hào phóng trong bất kỳ pipeline nào có hơn 3-4 agent. Các nhãn làm cho topology tự tài liệu hóa; transformer cho phép bạn giữ các agent có thể tái sử dụng trên các pipeline (một agent không phải biết một pipeline khác ngược dòng có thể tạo ra định dạng nào — transformer điều chỉnh nó).
:::
  `,

  "pipeline-execution": `
## Thực Thi Pipeline

Chạy một pipeline gửi payload trigger vào agent đầu tiên (hoặc các agent, nếu nhiều nút bắt đầu), và mỗi agent xuôi dòng chạy khi đầu vào của nó có sẵn. Canvas cho thấy thực thi trực tiếp — các agent phát sáng khi đang chạy, các kết nối hoạt hình với dữ liệu chảy và các nút điều kiện cho thấy nhánh nào đã được chọn.

Engine xử lý song song tự động: nếu hai agent không có phụ thuộc giữa chúng, chúng chạy song song. Nếu một agent phụ thuộc vào đầu ra từ nhiều agent ngược dòng, nó chờ tất cả hoàn thành. Tổng thời gian thực được xác định bởi đường dẫn quan trọng qua đồ thị, không phải tổng của tất cả các thời lượng agent.

### Điểm Chính

- **Hoạt hình canvas trực tiếp** — xem các agent nào đang chạy, các kết nối nào đang chảy, các nhánh điều kiện nào đã được chọn
- **Song song tự động** — các agent độc lập chạy đồng thời; các agent phụ thuộc chờ các điều kiện tiên quyết
- **Đường dẫn quan trọng xác định thời gian thực** — thời lượng pipeline = chuỗi phụ thuộc dài nhất, không phải tổng các agent
- **Dừng-tại-thất-bại-đầu-tiên** — theo mặc định; có thể cấu hình cho mỗi pipeline nếu bạn muốn thực thi chịu lỗi
- **Chạy lại từ bất kỳ bước nào** — tiếp tục sau khi sửa mà không cần chạy lại các giai đoạn ngược dòng thành công

### Cách Hoạt Động

:::diagram
[Trigger] --> [Agent A] --> [Conditional] --> [Agent B or Agent C] --> [Agent D] --> [Output]
:::

Nhấp \`Run\` (hoặc chờ trigger kích hoạt tự động). Engine xây dựng một kế hoạch thực thi từ topology canvas, gửi các nút bắt đầu và xử lý đồ thị theo thứ tự topological. Khi mỗi agent hoàn thành, các agent xuôi dòng trở nên đủ điều kiện và gửi tự động. Thất bại tạm dừng pipeline tại bước thất bại với lỗi có thể nhìn thấy trong thanh kiểm tra; sửa vấn đề cơ bản và nhấp \`Retry Step\` để tiếp tục.

:::tip
Agent chậm nhất trên đường dẫn quan trọng xác định thời lượng pipeline. Nếu pipeline của bạn cảm thấy chậm, hãy chạy nó một lần, xem các thời lượng cho mỗi agent trong trace, xác định đường dẫn dài nhất và tối ưu hóa agent nào trên đường dẫn đó có thời lượng cao nhất. Các nhánh song song không giúp ích nếu đường dẫn quan trọng của bạn chậm.
:::
  `,

  "conditional-routing": `
## Định Tuyến Có Điều Kiện

Các nút định tuyến có điều kiện cho phép một pipeline phân nhánh dựa trên dữ liệu nó đang xử lý. Thả một nút điều kiện trên canvas, xác định một hoặc nhiều quy tắc ("nếu số tiền > 1000", "nếu email chứa 'urgent'", "nếu đầu ra classifier = 'support'") và kết nối mỗi nhánh với một đường dẫn xuôi dòng khác. Tại thời gian chạy, điều kiện đánh giá và định tuyến đến nhánh phù hợp — chỉ nhánh đó chạy.

Các quy tắc dựa trên biểu thức: một DSL nhỏ của các so sánh và các toán tử logic được đánh giá đối với đầu ra của agent ngược dòng. Không cần mã; trình chỉnh sửa biểu thức có tự động hoàn thành cho hình dạng đầu ra ngược dòng để bạn khám phá các trường có sẵn khi bạn gõ.

:::feature
**Định tuyến dựa trên biểu thức**
Các quy tắc điều kiện được đánh giá như các biểu thức đối với đầu ra ngược dòng. So sánh các trường, kết hợp với AND/OR, rơi xuống một nhánh mặc định khi không có gì khớp. Không cần mã, nhưng đầy đủ biểu cảm khi bạn cần.
:::

### Điểm Chính

- **Nhiều nhánh** — một nút điều kiện, N nhánh được xác định theo quy tắc, cộng với một dự phòng mặc định
- **Nhánh mặc định là bắt buộc** — đảm bảo dữ liệu không bao giờ bị mắc kẹt trên các điều kiện không khớp
- **DSL biểu thức** — so sánh (\`>\`, \`<\`, \`==\`, \`contains\`, \`matches\`), toán tử boolean (\`and\`, \`or\`, \`not\`)
- **Tự động hoàn thành trên hình dạng ngược dòng** — trình chỉnh sửa biểu thức biết schema đầu ra của agent ngược dòng
- **Đánh giá trực tiếp trong trace** — xem nhánh nào đã được chọn trên mỗi lần chạy pipeline

### Cách Hoạt Động

Thả một nút Conditional giữa các agent. Cấu hình quy tắc của mỗi nhánh trong trình chỉnh sửa quy tắc; nhánh mặc định không cần quy tắc (nó là dự phòng). Tại thời gian chạy, engine đánh giá các quy tắc theo thứ tự; khớp đầu tiên thắng; nếu không có quy tắc nào khớp thì nhánh mặc định chạy. Nhánh chạy thấy đầu ra ngược dòng làm đầu vào; những nhánh khác vẫn ở chế độ chờ cho lần chạy này.

:::warning
Luôn xác định một nhánh mặc định. Không có một nhánh, một đầu vào không khớp bị mắc kẹt giữa pipeline và tạo ra một lần chạy bị treo — khó chịu để gỡ lỗi. Nhánh mặc định có thể đơn giản định tuyến đến một agent "log and stop" cuối nếu bạn thực sự muốn các đầu vào không khớp thất bại to, nhưng nhánh cần tồn tại.
:::
  `,

  "team-members-and-roles": `
## Thành Viên Đội Và Vai Trò

Mỗi agent trong một pipeline có thể mang một nhãn vai trò — "Researcher", "Writer", "Editor", "Classifier" — mô tả chức năng của nó trong pipeline. Vai trò hoàn toàn mang tính tổ chức; engine không thực thi hoặc sử dụng chúng. Giá trị của chúng là con người: khi bạn (hoặc người khác) mở canvas một tháng sau, các nhãn vai trò làm cho pipeline tự tài liệu hóa.

Ngoài nhãn, các vai trò cũng hữu ích cho việc thay thế agent. Nếu bạn có nhiều agent có thể lấp đầy vai trò "Editor" (với các phong cách prompt hoặc chuyên môn khác nhau), nhãn vai trò làm rõ slot nào để hoán đổi khi bạn thay đổi ý định. Team Canvas hỗ trợ kéo-thay thế trên một vai trò: thả một agent khác lên vai trò hiện có và canvas hỏi liệu có thay thế không, bảo toàn các kết nối.

### Điểm Chính

- **Nhãn vai trò văn bản tự do** — bất cứ điều gì con người có thể đọc được; những cái phổ biến nhận được gợi ý tự động hoàn thành
- **Hiển thị trên canvas** — các nhãn vai trò xuất hiện phía trên mỗi nút agent để cấu trúc team là trong nháy mắt
- **Kéo-thay thế theo vai trò** — thả một agent mới lên một slot vai trò để thay thế, bảo toàn các kết nối
- **Lọc thư viện theo vai trò** — khi bạn có nhiều agent tương tự, lọc thư viện theo vai trò để tìm ứng viên nhanh chóng
- **Mẫu pipeline sử dụng vai trò** — mẫu xác định các vai trò để điền, bạn mang các agent phù hợp với mỗi vai trò

### Cách Hoạt Động

Nhấp chuột phải bất kỳ agent nào trên canvas → Set role. Nhãn xuất hiện phía trên nút agent. Các vai trò sống trong định nghĩa pipeline cùng với tham chiếu agent; chúng không sửa đổi chính agent. Các mẫu pipeline ship với các vai trò được xác định trước; việc khởi tạo một mẫu nhắc bạn chọn một agent cho mỗi vai trò.

:::tip
Đặt tên các vai trò theo trách nhiệm, không phải theo agent hiện tại. "Editor" tốt hơn "Claude Sonnet Editor"; mô tả vai trò tồn tại lâu hơn bất kỳ agent cụ thể nào hiện đang lấp đầy nó. Nếu bạn chuyển từ Claude sang GPT cho vai trò đó, nhãn vai trò vẫn chính xác.
:::
  `,

  "pipeline-run-history": `
## Lịch Sử Chạy Pipeline

Các lần chạy pipeline là các lần thực thi first-class trong cùng kho lưu trữ mà các lần chạy agent cá nhân đi đến. Tab Pipeline → Run History hiển thị mọi lần chạy với trigger, đầu vào, trạng thái, tổng thời lượng, tổng chi phí và phân tích cho mỗi agent. Nhấp vào bất kỳ lần chạy nào để mở rộng trace đầy đủ: các trace cho mỗi agent, các quyết định điều kiện, các đầu ra transformer, kết quả cuối cùng.

Lịch sử chạy tồn tại vô thời hạn (tùy thuộc vào cài đặt lưu giữ trong Settings → Data) và hỗ trợ cùng lọc và tìm kiếm như các chế độ xem hoạt động cho mỗi agent. Mỗi lần chạy là bất biến — sau khi được capture, trace bị đóng băng, hữu ích cho kiểm toán sau khi hoàn thành.

### Điểm Chính

- **Capture hoàn chỉnh** — đầu vào, các trace cho mỗi agent (prompt, các cuộc gọi công cụ, phản hồi), các quyết định điều kiện, các đầu ra transformer, kết quả cuối cùng
- **Trạng thái cho mỗi agent** trong trace pipeline — thành công / thất bại / bị bỏ qua / đang chờ
- **Tổng + thời gian cho mỗi agent** — xem đường dẫn quan trọng và xác định các nút thắt
- **Tổng + chi phí cho mỗi agent** — chi phí pipeline = tổng các chi phí cho mỗi agent
- **Có thể tìm kiếm và lọc** — theo ngày, trigger, trạng thái, chi phí, thời lượng, agent
- **So sánh hai lần chạy** — chọn hai lần chạy để diff các đầu ra cho mỗi agent (hữu ích cho "điều gì đã thay đổi?")

### Cách Hoạt Động

Các lần chạy pipeline sử dụng cùng kho lưu trữ thực thi như các lần chạy đơn agent nhưng với một wrapper cấp pipeline bổ sung liên kết đến tất cả các bản ghi thực thi agent con. Chế độ xem lịch sử truy vấn kho lưu trữ này, kết nối với các bản ghi thực thi agent cho các phân tích cho mỗi agent và render cây trace.

:::tip
Sau một thay đổi pipeline có ý nghĩa (quy tắc điều kiện mới, agent hoán đổi, sửa đổi prompt trên một agent thành viên), hãy chọn một lần chạy "trước" từ lịch sử và lần chạy "sau" từ lần chạy mới, sau đó sử dụng Compare để xem chính xác những gì khác nhau. Diff ở cấp pipeline thường tiết lộ tác động mà bạn sẽ bỏ qua khi nhìn vào bất kỳ agent đơn lẻ nào riêng biệt.
:::
  `,

  "pipeline-templates": `
## Mẫu Pipeline

Các mẫu pipeline là các hình dạng pipeline được tạo sẵn bạn có thể áp dụng làm điểm khởi đầu. Mẫu xác định topology — các vai trò nào tồn tại, các nhánh điều kiện nào, các transformer nào — nhưng không gắn các agent cụ thể vào mỗi vai trò. Khi bạn khởi tạo một mẫu, canvas mở với topology tại chỗ và nhắc bạn điền mỗi vai trò từ thư viện agent của riêng bạn.

Các mẫu bao gồm các hình dạng phổ biến: quy trình nội dung (research → write → edit → publish), phân loại hỗ trợ (classify → route → respond → escalate), xử lý dữ liệu (ingest → validate → transform → store). Thư viện mẫu nằm trong Pipelines → New Pipeline → Browse Templates.

### Điểm Chính

- **Topology được xác định, vai trò linh hoạt** — mẫu biết hình dạng; bạn mang các agent
- **Các quy tắc điều kiện và transformer được cấu hình sẵn** — logic định tuyến trường hợp phổ biến được tích hợp sẵn
- **Có thể tùy chỉnh sau khi khởi tạo** — khi được khởi tạo, canvas là của bạn để sửa đổi
- **Các mẫu thực hành tốt nhất** — các mẫu ship với xử lý lỗi và các nhánh dự phòng làm tiêu chuẩn
- **Thư viện đang phát triển** — các mẫu mới được thêm dựa trên nhu cầu người dùng; bạn cũng có thể lưu các pipeline của mình làm mẫu để tái sử dụng

### Cách Hoạt Động

Một mẫu là một định nghĩa canvas với các slot vai trò thay vì các tham chiếu agent. Khởi tạo tạo ra một pipeline mới, sao chép canvas của mẫu và yêu cầu bạn điền mỗi vai trò từ thư viện agent. Khi được điền, pipeline có thể chỉnh sửa đầy đủ — nó không được liên kết lại với mẫu, vì vậy các cập nhật đối với mẫu không lan tỏa (và các chỉnh sửa đối với pipeline không ảnh hưởng đến mẫu).

:::tip
Ngay cả khi không có mẫu nào phù hợp chính xác, việc chọn cái gần nhất và sửa đổi nó thường nhanh hơn xây dựng từ đầu. Các mẫu giải quyết trước hình dạng điều phối (vị trí điều kiện, vị trí transformer, topology fan-out/fan-in); công việc còn lại là lựa chọn agent và điều chỉnh prompt, đó là công việc bạn muốn tập trung vào.
:::
  `,

  "team-assignments": `
## Nhiệm Vụ Đội

Pipeline kết nối từng bước một cách thủ công. Nhiệm vụ làm ngược lại: bạn giao cho đội một **mục tiêu** bằng ngôn ngữ thông thường, và đội tự tìm ra các bước. Đội chia mục tiêu thành danh sách kiểm tra, chọn agent phù hợp nhất cho từng bước và chạy song song — chỉ dừng lại để hỏi bạn khi một bước thất bại hoặc cần quyết định.

Hãy nghĩ về sự khác biệt giữa vẽ lưu đồ và giao việc cho một quản lý dự án. Với pipeline, bạn thiết kế luồng; với nhiệm vụ, bạn nêu kết quả và để đội tự tổ chức xung quanh đó.

### Điểm Chính

- **Mục tiêu trước tiên** — mô tả điều bạn muốn; đội phân tách thành các bước theo thứ tự
- **Khớp thông minh** — mỗi bước được định tuyến đến agent phù hợp nhất (bạn có thể ghim agent thủ công, dùng khớp cục bộ nhanh, hoặc để mô hình quyết định)
- **Tự động phân tách** — một cú nhấp chuột biến mục tiêu thành danh sách bước có thể chỉnh sửa trước khi chạy
- **Thực thi song song** — các bước độc lập chạy cùng lúc; các bước phụ thuộc chờ đến lượt
- **Xem xét của người dùng khi thất bại** — một bước thất bại chỉ tạm dừng nhiệm vụ đó và đề xuất Chỉnh sửa / Chỉ định lại / Bỏ qua, kèm thông báo trên thanh tiêu đề
- **Mẫu tái sử dụng** — lưu mục tiêu cùng bố cục bước làm mẫu và tạo các nhiệm vụ mới từ đó
- **Điều phối qua chat** — hỏi Athena "nhờ đội nghiên cứu xử lý việc này" và cô ấy sẽ thiết lập để bạn phê duyệt

### Cách Hoạt Động

Mở canvas của đội và nhấp vào huy hiệu **Assignments** (góc dưới bên trái). Nhấn **New**, nhập mục tiêu và tự điền các bước hoặc nhấn **Auto-decompose** để trợ lý đề xuất. Chọn cách agent được khớp với bước, đặt số lượng chạy song song và nhấn **Create & start**. Xem danh sách kiểm tra cập nhật trực tiếp; nếu một bước thất bại, hãy giải quyết trực tiếp. Lưu những gì bạn sẽ chạy lại làm mẫu.

:::tip
Dùng nhiệm vụ khi bạn biết kết quả nhưng chưa biết chính xác các bước. Dùng pipeline khi bạn muốn kiểm soát chính xác, lặp lại được từng kết nối. Mẫu nối liền cả hai — một nhiệm vụ đã lưu trở thành điểm khởi đầu chỉ một cú nhấp chuột.
:::
  `,

  "team-memory-and-goals": `
## Bộ Nhớ & Mục Tiêu Đội

Đội không chỉ là tập hợp các agent — đó là những agent **nhớ cùng nhau** và hướng đến một kết quả chung. Hai thứ tạo nên điều đó: bộ nhớ chung của đội, và mục tiêu.

### Bộ nhớ chung của đội

Khi đội làm việc, đội ghi lại các quyết định và ràng buộc — "chúng ta đã chuẩn hóa định dạng này", "tài khoản này nằm ngoài phạm vi", "người đánh giá đã từ chối cách tiếp cận X". Những ghi chú đó trở thành **bộ nhớ đội**, và một bản tóm tắt gọn gàng những điểm quan trọng nhất được truyền vào ngữ cảnh của mỗi thành viên trong lần chạy tiếp theo.

Kết quả: đội hội tụ thay vì lặp lại. Một agent không phải khám phá lại quyết định mà một thành viên khác đã đưa ra — nó kế thừa nó. Bạn có thể xem và quản lý bộ nhớ này trong bảng Team Memory trên canvas.

### Mục tiêu — định hướng mà không cần quản lý vi mô

Liên kết đội với một **mục tiêu** và bạn không còn phải giám sát từng lần chạy. Mục tiêu theo dõi tiến độ khi đội làm việc, và ứng dụng chỉ hiển thị những thứ thực sự cần người dùng — mục tiêu bị đình trệ, sắp đến hạn, một bước đang chờ bạn xem xét. Mọi thứ khác cứ chạy.

Đây là vòng lặp "đặt hướng đi, ở tầm cao": bạn xác định kết quả và các giới hạn; đội xử lý phần còn lại và giơ tay khi cần bạn.

:::tip
Hãy nghĩ bộ nhớ đội như kiến thức tổ chức của đội và mục tiêu như ngôi sao hướng dẫn. Bộ nhớ giữ đội nhất quán từ lần chạy này sang lần khác; mục tiêu giữ đội hướng đến điều đáng làm.
:::

### Điểm Chính

- **Bộ nhớ chung** — các quyết định/ràng buộc được đội ghi lại sẽ được đưa vào lần chạy tiếp theo của mỗi thành viên
- **Hội tụ** — các thành viên xây dựng trên kết luận của nhau thay vì phải tự suy luận lại
- **Liên kết mục tiêu** — gắn đội với mục tiêu để theo dõi tiến độ và thời hạn
- **Được hiển thị, không bị chôn vùi** — hàng đợi chú ý chỉ đưa ra những gì cần bạn (bị đình trệ, quá hạn, đang chờ xem xét)
- **Quản lý nó** — xem xét, chỉnh sửa hoặc xóa bộ nhớ đội từ bảng canvas
  `,

  "debugging-pipeline-issues": `
## Gỡ Lỗi Vấn Đề Pipeline

Khi một lần chạy pipeline thất bại, canvas đánh dấu agent thất bại với một chỉ báo đỏ và lần chạy tạm dừng tại bước đó. Mở lần chạy thất bại từ lịch sử (hoặc nhấp vào chỉ báo trên canvas trực tiếp) và bảng debug hiển thị đầu vào của agent, lỗi, trace lên đến thất bại và bất kỳ đầu ra một phần nào agent đã tạo ra trước khi thất bại. Từ cùng bảng, bạn có thể thử lại chỉ bước thất bại hoặc chạy lại toàn bộ pipeline từ đầu.

Các thất bại pipeline phổ biến nhất là sự không khớp hình dạng dữ liệu — một agent ngược dòng tạo ra đầu ra ở định dạng hơi khác so với những gì agent xuôi dòng mong đợi. Trình kiểm tra kết nối (nhấp vào bất kỳ kết nối nào) cho thấy dữ liệu đi qua nó trên lần chạy gần đây nhất, thường đủ để phát hiện sự không khớp.

### Điểm Chính

- **Bước thất bại được làm nổi bật** — chỉ báo đỏ trên canvas, lỗi đầy đủ trong bảng debug
- **Trình kiểm tra kết nối** — nhấp vào bất kỳ kết nối nào để xem dữ liệu trực tiếp hoặc lần chạy gần đây nhất đi qua
- **Thử lại từ bước thất bại** — sửa vấn đề và tiếp tục; các giai đoạn ngược dòng thành công không chạy lại
- **Phát lại từng bước** — chạy lại bất kỳ lần thực thi pipeline trong quá khứ nào với cùng đầu vào để tái tạo một thất bại một cách xác định
- **Xác thực kết nối** — canvas có thể kiểm tra trước liệu các agent ngược dòng và xuôi dòng có các hình dạng đầu vào/đầu ra tương thích hay không (bắt sự không khớp trước thời gian chạy)

### Cách Hoạt Động

Engine pipeline phát ra các sự kiện thất bại có cấu trúc khi một lần chạy agent gặp lỗi. Bảng debug đăng ký các sự kiện này và render trace + trình kiểm tra liên quan. Thử lại-từ-bước được hỗ trợ bởi engine: nó gửi lại agent thất bại với cùng ngữ cảnh ngược dòng, bảo toàn phần còn lại của lần chạy pipeline.

:::tip
Hầu hết các thất bại pipeline là vấn đề kết nối, không phải vấn đề agent. Khi có gì đó hỏng, hãy kiểm tra trước các kết nối cấp cho agent thất bại — nó thực sự nhận được hình dạng nào? Thường là "dữ liệu sai" hơn là "agent sai"; trình kiểm tra kết nối cho bạn biết trường hợp nào trong vòng một phút.
:::
  `,
};
