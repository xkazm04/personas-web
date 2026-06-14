export const content: Record<string, string> = {
  "installing-personas": `
## Cài đặt Personas

Cài Personas trên máy tính của bạn chỉ mất khoảng một phút. Lấy trình cài đặt cho hệ điều hành của bạn — Windows, macOS hoặc Linux — từ trang tải xuống và chạy nó. Trình cài đặt là một tệp duy nhất không có trình hướng dẫn thiết lập; nhấp đúp, phê duyệt lời nhắc bảo mật và ứng dụng khởi chạy. Các bản cập nhật được cung cấp tự động ở chế độ nền, vì vậy bạn sẽ luôn có phiên bản mới nhất mà không cần làm gì cả.

Lần đầu tiên ứng dụng mở ra, bạn sẽ thấy màn hình chào mừng. Từ đó, bạn có thể chuyển thẳng sang xây dựng một agent (Personas sẽ đề xuất thiết lập một nhà cung cấp AI khi bạn cần) hoặc mở vault credential trước nếu bạn đã có sẵn API key muốn lưu trữ. Cả hai con đường đều hoạt động.

:::steps
1. **Tải trình cài đặt** — chọn tệp phù hợp với hệ điều hành của bạn (NSIS \`.exe\` trên Windows, \`.dmg\` trên macOS, \`.AppImage\` hoặc \`.deb\` trên Linux)
2. **Chạy trình cài đặt** — nhấp đúp trên Windows, kéo vào Applications trên macOS, thực thi trên Linux
3. **Phê duyệt lời nhắc bảo mật** — hệ điều hành có thể yêu cầu xác nhận; điều này là bình thường với phần mềm máy tính mới
4. **Khởi chạy Personas** — màn hình chào mừng mở ra với một chuyến tham quan có hướng dẫn bạn có thể tham gia hoặc bỏ qua
5. **Tùy chọn: kết nối nhà cung cấp** — dán API key trên trang Connections nếu bạn muốn sẵn sàng xây dựng ngay lập tức
:::

:::info
Hoạt động trên **Windows 10+**, **macOS 12+** và hầu hết các bản phân phối **Linux** hiện đại. Trình cài đặt Windows là một NSIS \`.exe\` 53 MB; mã nhị phân đi kèm có dung lượng khoảng 90 MB sau khi cài đặt. Các bản cập nhật tự động chỉ là delta, vì vậy chúng thường nhỏ hơn nhiều.
:::

:::tip
Nếu bạn gặp cảnh báo Windows SmartScreen hoặc macOS Gatekeeper, đó là hệ điều hành của bạn đang thận trọng với phần mềm mới. Phê duyệt nó và bạn đã sẵn sàng — trình cài đặt được ký mã.
:::
  `,

  "creating-your-first-agent": `
## Tạo Agent Đầu Tiên Của Bạn

Agent đầu tiên của bạn mất khoảng năm phút từ trang trắng đến trợ lý đang hoạt động. Bạn có hai con đường: **bắt đầu từ một mẫu** (được khuyến nghị cho agent đầu tiên của bạn — build engine lắp ráp cấu hình hoạt động từ câu trả lời của bạn) hoặc **bắt đầu từ đầu** (toàn quyền kiểm soát thủ công). Cả hai đều kết thúc ở cùng một nơi: một agent bạn có thể chạy.

Nếu bạn chọn con đường mẫu, build engine khởi động một phiên tương tác. Nó hỏi các câu hỏi làm rõ theo nhóm ("bạn mong đợi đầu vào loại nào?", "đầu ra nên đi đâu?", "tần suất chạy như thế nào?"), đề xuất các tham số dựa trên câu trả lời của bạn và hiển thị bản xem trước trực tiếp về agent sắp được xây dựng. Bạn phê duyệt ở cuối và agent sẵn sàng để kiểm thử.

Nếu bạn chọn con đường từ đầu, bạn tự viết prompt, chọn mô hình AI, đính kèm bất kỳ công cụ nào và lưu.

:::steps
1. **Mở trang Agents** — thanh bên → Agents, hoặc nhấn \`Ctrl+1\` để chuyển đến đó
2. **Nhấp Create Agent** — chọn một con đường: chọn mẫu hoặc bắt đầu trống
3. **Trả lời các câu hỏi xây dựng (con đường mẫu)** — build engine nhóm các câu hỏi làm rõ theo khả năng và hiển thị bản xem trước trực tiếp khi câu trả lời của bạn định hình agent
4. **Điều chỉnh prompt và công cụ** — tinh chỉnh các hướng dẫn mà mẫu đã tạo ra (hoặc viết chúng từ đầu)
5. **Promote khi sẵn sàng** — chuyển agent từ bản nháp sang trạng thái hoạt động; kiểm tra setup-status chạy tự động để gắn cờ bất kỳ credential nào chưa được kết nối hoặc trigger chưa được cấu hình trước khi bạn có thể promote
:::

### Cách Hoạt Động

Con đường mẫu là cách nhanh nhất để có được một agent *tốt* (mẫu được chúng tôi thiết kế và kiểm thử), nhưng bạn sẽ vượt qua nó. Khi bạn đã ship một vài agent dựa trên mẫu, bạn sẽ bắt đầu viết prompt trực tiếp và coi mẫu là điểm khởi đầu thay vì giải pháp đầy đủ.

:::tip
Đừng lo lắng về việc hoàn thiện agent đầu tiên của bạn. Lịch sử phiên bản (được đề cập sau) có nghĩa là bạn có thể thử nghiệm tự do — mỗi lần lưu là một điểm kiểm tra bạn có thể quay lại.
:::
  `,

  "understanding-the-interface": `
## Tìm Hiểu Giao Diện

Giao diện Personas có ba khu vực chính. **Thanh bên** ở bên trái là điều hướng cấp cao nhất của bạn — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment và Settings. Nhấp vào một phần cấp cao nhất và một thanh điều hướng cấp hai xuất hiện hiển thị các trang con của nó (ví dụ: nhấp vào Agents sẽ hiển thị All Agents, cùng với các tab Editor cho agent đang được chọn: Prompt, Connectors, Lab, Activity, Health, Settings).

Khu vực trung tâm là **workspace** nơi mọi thứ thực sự xảy ra — chỉnh sửa prompt, xem thực thi, duyệt catalog credential. **Title bar** ở trên cùng chứa chuông thông báo (nhấp để xem chi tiết thực thi mới nhất), truy cập cockpit ("Talk to Athena") và tìm kiếm toàn cục. **Bottom strip** hiển thị các thực thi đang hoạt động và bất kỳ sự kiện hệ thống khẩn cấp nào.

| Khu vực | Chức năng |
|------|-------------|
| Sidebar Level 1 | Các phần cấp cao nhất — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, Settings |
| Sidebar Level 2 | Thanh điều hướng phụ ngữ cảnh cho phần đang hoạt động |
| Workspace | Trình chỉnh sửa / trình duyệt / bảng điều khiển chính cho bất kỳ phần nào bạn đang ở |
| Title bar | Chuông thông báo, lối tắt cockpit, tìm kiếm toàn cục, điều khiển ứng dụng |
| Bottom strip | Các thực thi đang hoạt động, trạng thái hệ thống |

### Cách Hoạt Động

Hầu hết những gì bạn làm xảy ra bằng cách nhấp vào một mục thanh bên và chỉnh sửa trong workspace. Chuông thông báo trên title bar là lối tắt phổ quát duy nhất đáng để ghi nhớ — nó luôn mở chi tiết thực thi gần nhất, bất kể bạn ở đâu. Lối tắt cockpit ("Talk to Athena") mở một cuộc trò chuyện trong ứng dụng với người bạn đồng hành có thể giúp bạn xây dựng, gỡ lỗi hoặc chỉ trả lời các câu hỏi về thiết lập của bạn.

:::tip
Di chuột qua bất kỳ biểu tượng thanh bên nào để xem chú giải công cụ với phím tắt. \`Ctrl+1\` đến \`Ctrl+9\` chuyển trực tiếp đến các phần cấp cao nhất, và \`Ctrl+K\` mở tìm kiếm toàn cục để bạn có thể tìm bất cứ thứ gì theo tên.
:::
  `,

  "what-is-an-ai-agent": `
## AI Agent Là Gì?

Một AI agent là một mô hình AI được cấu hình với một công việc. Bạn cung cấp cho nó các hướng dẫn ("đọc email chưa đọc của tôi và tóm tắt những email quan trọng"), cho nó biết các công cụ nào nó có thể sử dụng, và kích hoạt nó — thủ công bằng một nút, theo lịch trình, theo sự kiện hoặc như một bước trong pipeline. Agent đọc payload trigger, tuân theo hướng dẫn của bạn, gọi bất kỳ công cụ nào nó cần và tạo ra đầu ra. Không giống như chatbot, agent hành động: gửi email, viết tệp, đăng lên Slack.

Mỗi agent trong Personas là bền vững — nó nhớ thiết lập, lịch sử, credential và (tùy chọn) bộ nhớ từ các lần chạy trước đó. Bạn có thể nhân bản nó, kiểm soát phiên bản prompt của nó, chạy nó trong arena với các prompt thay thế để xem cái nào hoạt động tốt hơn, và chain nó với các agent khác để xây dựng quy trình đa bước.

:::compare
**Chatbot**
Bạn gõ một câu hỏi, nó trả lời. Mỗi lượt là một lần. Hữu ích cho việc tra cứu nhanh, brainstorming, soạn thảo. Không có hành động, không có bộ nhớ giữa các phiên, không có tự động hóa.
---
**AI Agent** [recommended]
Một cấu hình bền vững với một công việc. Được kích hoạt thủ công hoặc tự động; sử dụng công cụ để hành động; có prompt được kiểm soát phiên bản, credential đính kèm, lịch sử thực thi và chỉ báo sức khỏe. Mô hình là động cơ, nhưng agent là toàn bộ tập hợp xung quanh nó.
:::

### Cách Hoạt Động

:::diagram
[Trigger fires] --> [Agent reads input] --> [Model + tools execute] --> [Output dispatched]
:::

Trigger đóng gói một payload đầu vào (nội dung webhook, chuỗi clipboard, đường dẫn tệp, sự kiện từ agent khác…). Agent đọc prompt của mình, đưa nó cho mô hình AI cùng với đầu vào và để mô hình gọi các công cụ đính kèm khi cần. Đầu ra cuối cùng được gửi qua bất kỳ kênh đầu ra nào bạn đã cấu hình — trở lại UI, ghi vào tệp, đăng lên Slack hoặc nối tiếp làm đầu vào cho agent tiếp theo.

:::tip
Cách nhanh nhất để hiểu agent là nhìn vào các tác vụ hàng tuần lặp đi lặp lại của bạn và hỏi: "có thể kích hoạt, hướng dẫn và tự động hóa cái này không?" Nếu có, tác vụ đó là một agent.
:::
  `,

  "running-your-first-automation": `
## Chạy Tự Động Hóa Đầu Tiên Của Bạn

Khi bạn đã tạo một agent, bạn có nhiều cách để khởi động nó. Đơn giản nhất là nút **Run** thủ công ở đầu trình chỉnh sửa agent — nhấp vào nó và bạn sẽ thấy luồng thực thi trực tiếp trong bảng activity. Trong vài giây (hoặc vài phút đối với các nhà cung cấp chậm hơn hoặc prompt dài hơn), đầu ra xuất hiện.

Đối với công việc lặp lại, hãy thêm schedule trigger, webhook trigger, file-watcher trigger hoặc chain trigger để agent chạy tự động. Bạn đặt trigger một lần, agent sẽ làm phần còn lại.

:::steps
1. **Mở agent** — tìm nó trên trang Agents; trình chỉnh sửa mở ra với tab Prompt được tập trung
2. **Nhấp Run** — workspace chuyển sang tab Activity tự động; bạn thấy prompt đang được xây dựng, lệnh gọi mô hình đi ra và các token streaming trở lại
3. **Xem bảng tin trực tiếp** — mỗi agent có luồng riêng để bạn có thể chạy nhiều agent song song mà không bị nhầm lẫn
4. **Xem lại đầu ra** — hàng activity mở rộng để hiển thị prompt đầy đủ, phản hồi mô hình, bất kỳ lệnh gọi công cụ nào được thực hiện, thời lượng và chi phí
5. **Lặp lại** — thay đổi prompt hoặc cài đặt, lưu, chạy lại; mỗi lần chạy đều được checkpoint
:::

### Cách Hoạt Động

Một lần chạy là một lần thực thi duy nhất: trigger → xây-dựng-prompt → gọi-mô-hình → gọi-công-cụ → đầu ra. Mỗi bước được ghi lại trong trace thực thi và lần chạy xuất hiện ở tab Activity của trang Overview (chế độ xem toàn cục trên tất cả các agent) và trong tab Activity của chính agent. Từ bất kỳ vị trí nào, bạn có thể nhấp vào lần chạy để xem modal chi tiết đầy đủ.

Nếu một lần chạy thất bại (lỗi mô hình, credential đã hết hạn, sự cố mạng), chỉ báo sức khỏe của agent chuyển sang vàng hoặc đỏ và lỗi được giữ lại trong trace để bạn có thể gỡ lỗi.

:::tip
Lần chạy đầu tiên của bạn một phần là để học xem prompt của bạn thực sự làm gì trong thực tế. Nếu đầu ra không phải là những gì bạn muốn, trace cho bạn thấy chính xác những gì mô hình đã nhận được — thường thì cách khắc phục là làm rõ hoặc ràng buộc prompt thay vì thử lại.
:::
  `,

  "choosing-your-ai-provider": `
## Chọn Nhà Cung Cấp AI Của Bạn

Personas hỗ trợ các nhà cung cấp AI chính — **Anthropic** (gia đình Claude), **OpenAI** (gia đình GPT), **Google** (Gemini) và **các mô hình cục bộ** thông qua Ollama hoặc bất kỳ endpoint tương thích OpenAI nào. Bạn cũng có thể cấu hình các nhà cung cấp tùy chỉnh trong Settings → Custom Models. Mỗi agent chọn nhà cung cấp/mô hình của mình một cách độc lập, vì vậy bạn có thể chạy các mô hình rẻ trên công việc thường xuyên và dành các mô hình đắt tiền cho các tác vụ cần chúng.

Kết nối nhà cung cấp một lần trên trang Connections (bạn sẽ dán API key — được mã hóa trong vault cục bộ — hoặc chạy qua OAuth đối với các nhà cung cấp hỗ trợ). Sau đó, mỗi bộ chọn mô hình của agent hiển thị các nhà cung cấp đã cấu hình và các mô hình của chúng.

:::compare
**Anthropic Claude** [recommended]
Tuân theo hướng dẫn mạnh, lập luận trong ngữ cảnh dài, đầu ra có cấu trúc. Sonnet 4.6 là mặc định cho các agent mới. Các mô hình Opus cho lập luận khó nhất, Haiku cho tốc độ/chi phí. Xuất sắc trong các vòng lặp sử dụng công cụ.
---
**OpenAI GPT**
Hệ sinh thái rộng nhất và được kiểm tra nhiều nhất cho nhiều trường hợp sử dụng. All-rounder vững chắc; các mô hình hạng GPT-4o mạnh mẽ cho công việc trợ lý chung.
---
**Google Gemini**
Đa phương thức, cửa sổ ngữ cảnh lớn, độ trễ token đầu tiên nhanh. Mạnh cho các agent nghiên cứu / xử lý tài liệu.
---
**Local (Ollama / OpenAI-compatible)**
Chạy trên máy của bạn — không có dữ liệu nào rời khỏi thiết bị. Các mô hình nhỏ hơn, nhưng đối với công việc ít rủi ro hoặc riêng tư, sự đánh đổi thường đáng giá.
:::

### Cách Hoạt Động

Khi nhiều nhà cung cấp được kết nối, Personas có thể tự động chuyển đổi dự phòng ở cấp độ agent: nếu nhà cung cấp chính của bạn trả về lỗi vượt qua ngưỡng, lần chạy tiếp theo của agent sẽ sử dụng nhà cung cấp dự phòng đã cấu hình. Khi nhà cung cấp chính phục hồi, luân chuyển bình thường tiếp tục. Điều này được cấu hình cho mỗi agent trong Editor → Settings tab.

Để theo dõi chi phí, mỗi lần chạy được gắn thẻ với nhà cung cấp, mô hình và số lượng token, vì vậy tab Overview → Usage có thể chia nhỏ chi tiêu theo nhà cung cấp, mô hình hoặc agent.

### Xem Thực Tế

:::usecases
**Chiến lược một mô hình cho mỗi agent**
Các agent của bạn có nhu cầu khác nhau
---
Agent đánh giá mã sử dụng Claude Opus (lập luận tốt nhất); trình tóm tắt email sử dụng Haiku (nhanh và rẻ); một agent cá nhân/riêng tư chạy trên Ollama cục bộ.
===
**Chuyển đổi dự phòng khi nhà cung cấp gặp sự cố**
Một nhà cung cấp có sự cố theo khu vực
---
Các agent bị ảnh hưởng tự động định tuyến đến dự phòng đã cấu hình; tab Health cho thấy các agent nào đang chạy trên dự phòng và hiển thị khôi phục khi nhà cung cấp chính trở lại.
===
**Giảm chi phí**
Chi tiêu AI hàng tháng tăng dần
---
Overview → Usage cho biết agent và mô hình nào chiếm phần lớn chi tiêu. Chuyển các agent có chi phí cao nhất sang gói rẻ hơn (Sonnet → Haiku, GPT-4o → GPT-4o-mini); Lab có thể A-B chúng trước để xác nhận chất lượng được duy trì.
:::

:::info
Nhà cung cấp mặc định cho các agent mới được đặt trong Settings → Engine. Bạn có thể ghi đè trên mỗi agent.
:::

:::tip
Hầu hết các nhà cung cấp đều cung cấp tín dụng dùng thử miễn phí. Kết nối hai hoặc ba và chạy cùng một prompt với mỗi nhà cung cấp trong arena Lab — bạn sẽ cảm nhận được sự khác biệt về tính cách và chọn một mặc định phù hợp với phong cách của bạn.
:::
  `,


  "system-requirements": `
## Yêu Cầu Hệ Thống

Personas là một ứng dụng máy tính để bàn Tauri — backend Rust, frontend React, cơ sở dữ liệu SQLite cục bộ — và nó cố ý nhẹ. Hầu hết tính toán nặng xảy ra trên máy chủ của nhà cung cấp AI, không phải trên máy của bạn. Ứng dụng ở chế độ chờ với CPU gần bằng 0 và sử dụng vài trăm megabyte RAM; nó chỉ tăng quy mô khi các agent đang chạy cục bộ.

Mã nhị phân đi kèm có dung lượng khoảng 90 MB sau khi cài đặt. Plugins (Artist để tạo hình ảnh, Obsidian Brain để tìm kiếm vector) có thể thêm vào dung lượng nếu bạn bật chúng.

:::checklist
- Windows 10+, macOS 12+ hoặc Ubuntu 20.04+ (phiên bản mới nhất được khuyến nghị)
- Tối thiểu 4 GB RAM (8 GB+ được khuyến nghị nếu bạn sử dụng plugin embeddings / tìm kiếm vector)
- 1 GB dung lượng đĩa trống (nhiều hơn nếu bạn bật mô hình cục bộ của plugin Artist)
- Băng thông rộng ổn định — thực thi agent bị ràng buộc bởi độ trễ API của nhà cung cấp AI
- CPU dual-core hiện đại nào đó; quad-core hoặc tốt hơn được khuyến nghị cho các lần chạy đa agent song song
:::

### Cách Hoạt Động

Ứng dụng lưu trữ cơ sở dữ liệu của nó (\`personas.db\`), vault credential, lịch sử thực thi và cấu hình cục bộ trong thư mục dữ liệu ứng dụng dành riêng cho hệ điều hành của bạn. Không có gì được tải lên trừ khi bạn cố ý bật triển khai đám mây hoặc sử dụng nhà cung cấp AI đám mây. Plugin ship các mô hình cục bộ (ví dụ: tạo hình ảnh + Gemini vision của plugin Artist) tải xuống các tệp mô hình trong lần sử dụng đầu tiên.

Bản build Windows sử dụng ONNX Runtime cho embedding khi tính năng vector-knowledge-base được bật; đây là phụ thuộc đơn lẻ lớn nhất trong trường hợp đó.

:::tip
Nếu bạn thấy ứng dụng chậm trong một lần chạy đa agent, mở tab Health — nó cho biết các agent nào và các phụ thuộc nào (gọi mô hình, gọi công cụ, suy luận ONNX) đang góp phần vào tải.
:::
  `,


  "where-to-get-help": `
## Nơi Để Nhận Trợ Giúp

Bạn không bao giờ bị mắc kẹt. **Trợ giúp trong ứng dụng** là con đường nhanh nhất: cuộc trò chuyện cockpit ("Talk to Athena" trên title bar) là một người bạn đồng hành được hỗ trợ bởi LLM biết về thiết lập của bạn, các lần thực thi gần đây và sản phẩm. Hỏi nó các câu hỏi bằng tiếng Việt đơn giản và nó cũng có thể đề xuất các thay đổi cấu hình, liên kết bạn đến tab phù hợp hoặc mở một phiên gỡ lỗi trên một lần chạy thất bại.

Đối với những điều mà người bạn đồng hành trong ứng dụng không thể trả lời, **hướng dẫn** (trang này) là tài liệu tham khảo chi tiết, **Discord cộng đồng** là nơi bạn hỏi những người dùng khác và team, và **hỗ trợ qua email** dành cho các vấn đề về tài khoản hoặc thanh toán.

| Tài nguyên | Tốt nhất cho | Thời gian phản hồi |
|----------|----------|---------------|
| Cockpit / Athena (trong ứng dụng) | Câu hỏi thiết lập, gỡ lỗi, "X ở đâu?" | Ngay lập tức |
| Hướng dẫn này | Tham chiếu tính năng và hướng dẫn cách làm | Ngay lập tức |
| Trang tài liệu | Kiến trúc, schema, tích hợp nâng cao | Ngay lập tức |
| Cộng đồng Discord | Mẹo, công thức, "có ai khác thấy điều này không?" | Vài phút |
| Email hỗ trợ | Tài khoản, thanh toán, bảo mật | Vài giờ |
| Video hướng dẫn | Hướng dẫn trực quan các luồng chính | Ngay lập tức |

### Cách Hoạt Động

Cockpit có quyền truy cập vào doctrine — một khối kiến thức được tuyển chọn về sản phẩm — và vào trạng thái cục bộ của bạn (đã ẩn danh). Nó có thể tìm kiếm các lần thực thi của bạn, đề xuất các thay đổi và thậm chí soạn các thẻ UI nội tuyến để dẫn bạn qua một bản sửa lỗi từng bước. Nếu không thể trả lời, nó sẽ đề xuất tài nguyên bên ngoài phù hợp.

:::tip
Đối với các câu hỏi kiểu "Tôi nghĩ có gì đó bị hỏng", hãy mở Athena trước và hỏi "chẩn đoán lần chạy thất bại gần nhất của agent X". Luồng gỡ lỗi của cockpit được xây dựng cho việc này và thường tốt hơn việc đọc nhật ký thủ công.
:::
  `,

  "browsing-templates": `
## Duyệt Templates

Đừng bắt đầu từ trang trắng. Gallery template là một thư viện các agent được xây dựng sẵn — mỗi cái được thiết kế cho một công việc thực tế, đã được kiểm thử và sẵn sàng chuyên biệt hóa cho thiết lập của bạn. Các template bao gồm mọi thứ từ giám sát và báo cáo đến quy trình nội dung và công cụ phát triển. Tìm đúng cái mất ít thời gian hơn so với việc viết prompt từ đầu.

Mỗi thẻ trong gallery cho bạn biết agent làm gì, độ phức tạp của việc thiết lập và thời gian áp dụng tương đương. Bên dưới đó bạn thấy các **connector** mà template cần — các dịch vụ như Slack, Notion, GitHub hoặc nhà cung cấp lưu trữ đám mây — và liệu bạn có thông tin đăng nhập khớp trong vault hay không. Một chỉ báo sẵn sàng nhỏ trên mỗi chip connector nói với bạn trong nháy mắt: xanh có nghĩa là bạn tốt để đi, hổ phách có nghĩa là bạn có khớp một phần, và xám có nghĩa là bạn cần thêm thông tin đăng nhập đó trước khi template có thể chạy.

### Bộ lọc Mức độ bao phủ

Dải lọc ở đầu gallery — **All / Ready / Partial / Drafts** — cho phép bạn thu hẹp đến những gì quan trọng ngay bây giờ:

- **Ready** — mọi connector mà template cần đã có trong vault của bạn. Đây là con đường nhanh nhất đến một agent đang chạy.
- **Partial** — một số connector được khớp, một số thì không. Đáng duyệt nếu bạn đang lên kế hoạch thêm thông tin đăng nhập sớm.
- **Drafts** — các template chưa xuất bản, chỉ hiển thị trong các bản build phát triển.

Bắt đầu với Ready nếu bạn muốn chạy điều gì đó trong vài phút.

### So sánh Templates

Khi bạn đang quyết định giữa một vài tùy chọn, bạn không phải mở từng cái một riêng lẻ. Chọn tối đa ba thẻ (di chuột qua hiển thị hộp kiểm) và nhấp **Compare** — một modal song song xếp chúng cạnh nhau theo danh mục, mục tiêu, connector, trigger, trường hợp sử dụng, độ phức tạp và thời gian thiết lập. Các hàng mà các template khác nhau được tô sáng để các điểm khác biệt dễ nhận thấy. Bạn có thể áp dụng trực tiếp từ chế độ xem so sánh mà không cần quay lại gallery.

### Quick-Adopt Thịnh hành

Đầu gallery có một kệ các template thịnh hành — những template được áp dụng thường xuyên nhất trên tất cả người dùng. Mỗi thẻ có hành động **Adopt** được hiển thị khi di chuột qua mở trực tiếp luồng áp dụng, bỏ qua modal chi tiết nếu bạn đã quyết định.

:::tip
Bắt đầu với bộ lọc **Ready** — những template đó khớp với những gì đã có trong vault của bạn và có thể đang chạy trong vài phút. Khi bạn đã ship một hoặc hai, hãy duyệt **Partial** để xem thông tin đăng nhập mới nào sẽ mở khóa được.
:::
  `,

  "adopting-a-template": `
## Áp Dụng Template

Áp dụng template là cách nhanh nhất để có được một agent được cấu hình và hoạt động. Luồng đưa bạn từ gallery đến agent được promote chỉ trong vài phút — và mọi bước đều có thể đảo ngược.

:::steps
1. **Nhấp Adopt** — từ thẻ gallery, modal chi tiết, chế độ xem so sánh hoặc kệ thịnh hành. Trình hướng dẫn áp dụng mở ra. Chưa có gì được ghi vào cơ sở dữ liệu; bạn có thể đóng tự do ở giai đoạn này.
2. **Trả lời bảng câu hỏi** — biểu mẫu trình bày một câu hỏi mỗi lần. Ở bên phải, một brief trực tiếp hiển thị câu trả lời của bạn tích lũy theo thời gian thực. Các câu hỏi bao gồm những thứ như không gian làm việc hoặc dự án nào cần nhắm mục tiêu, định dạng đầu ra bạn muốn và cách agent xử lý lỗi. Câu trả lời của bạn sẽ điền vào các khe \`{{placeholder}}\` trong prompt của agent, chuyên biệt hóa nó cho thiết lập của bạn.
3. **Kiểm thử tự động** — khi bạn gửi, agent được lắp ráp từ template và câu trả lời của bạn, sau đó chạy một lần tự động. Điều này xác nhận cấu hình hợp lệ với thông tin đăng nhập và connector của bạn trước khi bất kỳ thứ gì được promote lên production.
4. **Promote** — nếu bài kiểm thử vượt qua, agent được promote và trở thành một agent thực sự, có thể chỉnh sửa trên trang Agents của bạn. Trình hướng dẫn điều hướng bạn đến đó tự động.
:::

### Tự động Khớp Vault

Các thông tin đăng nhập đã có trong vault được phát hiện và điền tự động. Khi bảng câu hỏi có câu hỏi connector và bạn có đúng một thông tin đăng nhập khớp, nó được chọn trước và được đánh dấu bằng huy hiệu **auto** — bạn không cần chọn thủ công. Nếu bạn có nhiều thông tin đăng nhập khớp, câu hỏi thu hẹp các lựa chọn có sẵn xuống chỉ những gì bạn có.

Nếu template cần connector bạn chưa thêm, câu hỏi đó bị **chặn** — một banner xuất hiện ở đầu biểu mẫu giải thích danh mục thông tin đăng nhập nào đang thiếu và hiển thị nút **Add credential**. Nhấp vào nó dẫn bạn sâu đến catalog thông tin đăng nhập, được lọc sẵn theo danh mục đúng và lưu câu trả lời đang làm dưới dạng bản nháp. Khi bạn quay lại template sau khi thêm thông tin đăng nhập, câu trả lời của bạn được khôi phục và câu hỏi bị chặn mở khóa.

### Câu trả lời của bạn định hình Agent như thế nào

Phía sau hậu trường, câu trả lời của bạn được thay thế vào prompt ở hai cấp độ. Đầu tiên, bất kỳ placeholder \`{{param.aq_*}}\` nào trong prompt của template được thay thế bằng các giá trị thực tế của bạn. Thứ hai, một phần \`## User Configuration\` được thêm vào system prompt liệt kê mọi câu hỏi và câu trả lời, vì vậy mô hình luôn có đầy đủ ngữ cảnh thiết lập của bạn bất kể placeholder cụ thể có tồn tại hay không. Cả lần chạy kiểm thử và agent được promote đều sử dụng cấu hình thực tế của bạn — không phải các giá trị mặc định template chung.

:::tip
Nếu một câu hỏi chưa rõ, hãy tìm biểu tượng **ⓘ** ở bên phải nhãn câu hỏi. Nhấp vào nó mở rộng một gợi ý với nhiều ngữ cảnh hơn về những gì câu hỏi ảnh hưởng và câu trả lời tốt trông như thế nào.
:::
  `,

  "recipes": `
## Công Thức

Công thức là hàng trăm trường hợp sử dụng sẵn sàng chạy được lấy từ các template, được tổ chức xung quanh những gì chúng hoàn thành. Trong khi template là một cấu hình agent đầy đủ, công thức là một ví dụ cụ thể về một công việc mà agent có thể làm — cụ thể, có thể hành động và gần với điều gì đó bạn có thể thực sự có trong danh sách việc cần làm.

Bạn tìm thấy chúng trong tab **Templates → Recipes**. Catalog đầy đủ có thể sắp xếp và tìm kiếm: duyệt theo tên, lọc theo danh mục hoặc quét các biểu tượng connector để tìm các trường hợp sử dụng khớp với những gì bạn đã kết nối.

### Danh mục

Các công thức được tổ chức thành chín nhóm:

- **Monitoring** — theo dõi thay đổi, cảnh báo, ngưỡng
- **Reporting** — tạo tóm tắt, bản tóm lược và bảng điều khiển
- **Automation** — các hành động lặp lại chạy theo lịch trình hoặc trigger
- **Communication** — tin nhắn, thông báo và định tuyến
- **Data sync** — giữ hai hệ thống đồng bộ
- **Analysis** — tổng hợp thông tin và tạo ra hiểu biết
- **Development** — đánh giá code, tạo kiểm thử, kiểm tra triển khai
- **Content** — soạn thảo, chỉnh sửa, xuất bản
- **Productivity** — công cụ hỗ trợ quy trình cá nhân và đội

### Bảng Công thức

Chế độ xem chính là một bảng có thể sắp xếp. Mỗi hàng hiển thị tên công thức (với tô sáng khớp tìm kiếm khi bạn đã gõ truy vấn), huy hiệu danh mục và một dải biểu tượng connector hiển thị dịch vụ nào cần — tối đa ba biểu tượng, với số tràn cho các template cần nhiều hơn. Nhấp vào bất kỳ hàng nào để mở bảng chi tiết công thức.

Bảng chi tiết cung cấp cho bạn bức tranh đầy đủ: công thức làm gì, nó cần gì (connector và bất kỳ ràng buộc cụ thể nào), cách xử lý lỗi và liệu agent hiện tại có đã áp dụng nó hay không. Nếu bạn đã áp dụng công thức cho agent đang hoạt động, hàng hiển thị chip **Adopted** màu xanh lá.

### Bộ đặt trước Đội

Nếu bạn đang thiết lập một quy trình đầy đủ thay vì một agent đơn, hãy tìm kiếm **team presets** — các bộ template được áp dụng cùng nhau trong một luồng. Một bộ đặt trước bao gồm một công việc nhất quán (như một pipeline nội dung đầy đủ hoặc bộ năng suất nhà phát triển) nơi nhiều agent chuyển giao công việc cho nhau.

:::tip
Các công thức là cách nhanh nhất để tìm một ví dụ cụ thể gần với công việc bạn có trong đầu. Nếu bạn biết kết quả muốn đạt được nhưng không chắc template nào để bắt đầu, hãy tìm kiếm tab Recipes trước — các mô tả trường hợp sử dụng cụ thể thường dễ khớp với một công việc hơn là tên template rộng hơn.
:::
  `,

  "interface-modes": `
## Chế Độ Giao Diện

Personas có hai chế độ giao diện: **Simple** và **Power**. Chúng chạy cùng ứng dụng — cùng các thành phần, cùng dữ liệu, cùng agent — với Simple ẩn các bề mặt mà người dùng không kỹ thuật ít khi cần. Không có gì bị xóa; tất cả chỉ được hiển thị hoặc ẩn tùy thuộc vào chế độ bạn đang ở.

:::compare
**Simple**
Tùy chọn. Bốn màn hình: Home, Agents, Connections, Settings. Các bề mặt nâng cao — Overview, Workflows, Events, Templates, Plugins, trigger nâng cao và bộ tab editor đầy đủ — được ẩn. Thực thi hiển thị dưới dạng thanh tiến trình sạch và kết quả được định dạng thay vì luồng token thô. Tốt cho người dùng muốn chạy agent, không muốn xây dựng chúng.
---
**Power** [recommended]
Mặc định cho hầu hết mọi người. Toàn bộ ứng dụng. Tất cả các phần sidebar, tất cả các tab editor (Prompt, Matrix, Lab, Activity, Health, Settings), tất cả các loại trigger (lịch trình, webhook, file watcher, clipboard, chain và event trigger), vault đầy đủ với playground và biểu đồ phụ thuộc, giám sát qua Overview, Director và mọi thứ khác. Chế độ mà hầu hết người dùng tốt nghiệp khi họ có một vài agent đang chạy.
:::

### Simple Ẩn Gì

Trong chế độ Simple, sidebar thu hẹp thành bốn phần: **Home**, **Agents**, **Connections** và **Settings**. Overview, Workflows, Events, Templates, Plugins và các phần nâng cao khác không xuất hiện trong nav.

Bên trong Agents, editor chỉ hiển thị các tab **Prompt**, **Chat** và **Connectors**. Editor Matrix, arena Lab, nhật ký Activity, tab Health, lịch sử phiên bản, condition builder, bảng cấu hình công cụ, cài đặt nâng cao và các loại trigger nâng cao đều bị ẩn. Trigger duy nhất hiển thị là **Manual** (nút Run).

Đầu ra thực thi được đơn giản hóa: thay vì terminal streaming với đầu ra token thô, bạn thấy thanh tiến trình trong khi agent chạy và kết quả được định dạng, có thể đọc được khi nó kết thúc. Chi phí và số lượng token không được hiển thị.

Trong Connections, danh sách thông tin đăng nhập hiển thị chế độ xem đơn giản hóa — thêm, kiểm thử và xóa thông tin đăng nhập. Playground thông tin đăng nhập, cơ sở kiến thức vector, trình quản lý kết nối cơ sở dữ liệu, hành động hàng loạt và chấm điểm sức khỏe đều bị ẩn.

### Chuyển Đổi Chế Độ

Đi đến **Settings → Appearance → Interface Mode** và chọn Simple hoặc Power. Thay đổi có hiệu lực ngay lập tức — không cần khởi động lại.

Hướng dẫn bạn đang đọc ngay bây giờ có nút chuyển đổi Simple / Power riêng trong sidebar. Chuyển đổi chế độ của hướng dẫn lọc các chủ đề để khớp: chế độ Simple hiển thị các chủ đề cốt lõi, chế độ Power tiết lộ các phần nâng cao. Hai nút chuyển đổi độc lập — bạn có thể đọc các chủ đề hướng dẫn Power-mode trong khi chạy ứng dụng ở chế độ Simple.

:::tip
Bắt đầu ở chế độ Simple nếu bạn mới với Personas. Khi bạn có một vài agent đang chạy và muốn tinh chỉnh lịch trình, thiết lập webhook trigger hoặc đi sâu vào trace thực thi, hãy chuyển sang Power — mọi thứ bạn xây dựng ở chế độ Simple đều được mang sang nguyên vẹn.
:::
  `,
};
