export const content: Record<string, string> = {
  "creating-a-new-agent": `
## Tạo Agent Mới

Bạn có hai cách để tạo agent mới. **Từ đầu** — nhấp \`Create Agent\`, đặt tên cho nó và tự viết hướng dẫn. **Từ một mẫu** — duyệt gallery mẫu, chọn một mẫu phù hợp với những gì bạn muốn làm (xử lý hóa đơn, báo cáo hàng ngày, đăng mạng xã hội…), trả lời một vài câu hỏi ngắn về trường hợp sử dụng cụ thể của bạn và để build engine lắp ráp agent cho bạn. Hầu hết mọi người bắt đầu với một mẫu và tinh chỉnh từ đó.

Dù theo cách nào, bạn sẽ chọn tên và biểu tượng, chọn mô hình AI nào hỗ trợ agent và chọn công cụ nào (email, tìm kiếm web, truy cập tệp, v.v.) nó có thể sử dụng. Không có lựa chọn nào trong số này là vĩnh viễn — bạn có thể thay đổi bất kỳ cài đặt nào sau này.

:::steps
1. **Nhấp Create Agent** — từ thanh bên hoặc màn hình chính
2. **Chọn một con đường** — bắt đầu trống, hoặc chọn một mẫu từ gallery
3. **Trả lời các câu hỏi xây dựng** — nếu bạn đi theo con đường mẫu; build engine điều chỉnh agent theo câu trả lời của bạn
4. **Đặt tên cho agent** — và chọn một biểu tượng
5. **Điều chỉnh prompt và công cụ** — tinh chỉnh các hướng dẫn mà mẫu đã tạo ra (hoặc viết chúng từ đầu)
6. **Promote khi sẵn sàng** — agent chuyển từ bản nháp sang hoạt động khi bạn xác nhận
:::

### Cách Hoạt Động

Con đường mẫu chạy một phiên xây dựng tương tác: engine hỏi các câu hỏi làm rõ về trường hợp sử dụng của bạn, đề xuất các tham số (hình dạng đầu vào, kênh đầu ra, tần suất lịch trình) và hiển thị bản xem trước trực tiếp của agent sắp được lắp ráp. Bạn phê duyệt ở cuối và agent sẵn sàng để kiểm thử. Con đường từ đầu bỏ qua tất cả những điều đó — hữu ích khi bạn đã biết chính xác mình muốn agent làm gì.

:::tip
Tên agent tốt mô tả tác vụ, không phải công nghệ. "Morning Email Summary" hữu ích hơn "GPT Agent 3."
:::
  `,

  "writing-effective-prompts": `
## Viết Prompt Hiệu Quả

Prompt là bộ hướng dẫn bạn đưa cho agent. Prompt tốt là cụ thể, rõ ràng và có thứ tự: xác định vai trò của agent, nêu rõ tác vụ, mô tả hình dạng đầu vào, chỉ định định dạng đầu ra và đề cập đến các trường hợp đặc biệt. Prompt mơ hồ tạo ra đầu ra mơ hồ — "tóm tắt email của tôi" hoạt động kém hơn nhiều so với "đọc năm email chưa đọc gần đây nhất của tôi và viết tóm tắt hai câu cho mỗi email, sắp xếp theo tầm quan trọng của người gửi."

Build engine giúp bạn ở đây. Khi bạn áp dụng một mẫu, engine hỏi các câu hỏi làm rõ theo nhóm cho mỗi khả năng (nguồn đầu vào, kênh đầu ra, định dạng, tần suất) và đan các câu trả lời của bạn vào một prompt có cấu trúc. Nếu bạn viết từ đầu, bạn tự làm việc đan này — nhưng cùng năm đầu vào đó tạo ra các agent đáng tin cậy.

### Danh Sách Kiểm Tra Chất Lượng Prompt

:::checklist
- Xác định vai trò — "Bạn là X làm Y." Neo hành vi của mô hình.
- Nêu rõ tác vụ một cách cụ thể — động từ, số lượng, khung thời gian. Tránh "giúp tôi với…"
- Mô tả đầu vào — hình dạng gì, trường nào, agent nên bỏ qua điều gì
- Chỉ định đầu ra — bullet so với đoạn văn so với JSON, với tên trường nếu có cấu trúc
- Xử lý các trường hợp đặc biệt — phải làm gì khi đầu vào trống, không đúng định dạng hoặc bất ngờ
- Sử dụng ví dụ — ngay cả một cặp đầu vào/đầu ra cũng cải thiện đáng kể tính nhất quán
:::

### Cách Hoạt Động

Mỗi lần chạy xây dựng prompt từ mẫu đã lưu, payload trigger và bất kỳ bộ nhớ agent nào mà mô hình được phép tham khảo. Mô hình nhìn thấy cùng một prompt bạn đã viết (theo thứ tự bạn đã viết) cộng với đầu vào — những gì trả về là nỗ lực trung thực của nó để tuân theo hướng dẫn của bạn. Tab trace trong chi tiết thực thi cho thấy prompt chính xác đã được gửi, vì vậy khi đầu ra trôi dạt, bạn có thể thấy liệu prompt hay đầu vào có lỗi.

:::tip
Viết prompt như đang tóm tắt cho một nhà thầu thông minh nhưng hoàn toàn mới. Đừng giả định gì cả. Lần đầu tiên agent tạo ra đầu ra, hãy xem trace và hỏi: "một nhà thầu con người có thể hiểu những gì tôi muốn từ prompt này không?"
:::
  `,

  "simple-vs-structured-prompt-mode": `
## So Sánh Chế Độ Prompt Đơn Giản Và Có Cấu Trúc

Trình chỉnh sửa prompt cung cấp hai chế độ. **Chế độ đơn giản** là một hộp văn bản tự do duy nhất — bạn gõ prompt như một khối văn xuôi. Nhanh cho các agent nhỏ hoặc thử nghiệm. **Chế độ có cấu trúc** chia prompt thành năm phần được đặt tên (Identity, Instructions, Tools, Examples, Error Handling) để bạn có thể suy nghĩ về từng mối quan tâm một cách riêng biệt và chỉnh sửa một phần mà không ảnh hưởng đến các phần khác.

Bạn có thể chuyển đổi giữa các chế độ bất cứ lúc nào mà không bị mất công việc. Trình chỉnh sửa phân tích văn xuôi chế độ đơn giản thành các phần có cấu trúc khi bạn chuyển lên và nối các phần có cấu trúc trở lại thành một khối duy nhất khi bạn chuyển xuống.

:::compare
**Chế độ đơn giản**
Hộp văn bản đơn. Văn xuôi tự do. Nhanh để soạn, nhanh để lặp lại. Tốt nhất cho thử nghiệm và các agent cá nhân nơi bạn là người đọc duy nhất.
---
**Chế độ có cấu trúc** [recommended for shared/production agents]
Năm phần được đặt tên — Identity, Instructions, Tools, Examples, Error Handling. Soạn chậm hơn nhưng dễ duy trì hơn. Mỗi phần có thể được xem xét và thay đổi độc lập, điều quan trọng khi bạn (hoặc người khác) xem lại agent sau nhiều tháng.
:::

:::info
Cả hai chế độ tạo ra cùng một prompt dưới mui xe tại thời gian chạy. Chế độ có cấu trúc là một lớp phủ UX giúp bạn tổ chức suy nghĩ; mô hình nhìn thấy prompt được render dù theo cách nào.
:::

### Cách Hoạt Động

Việc chuyển đổi chế độ không phá hủy: trình chỉnh sửa lưu trữ biểu diễn có cấu trúc nội bộ và chế độ đơn giản là một chế độ xem phẳng của nó. Lịch sử phiên bản giữ lại bất kỳ chế độ nào bạn đã lưu, vì vậy việc khôi phục một phiên bản cũ cũng đưa lại chế độ mà nó được tác giả.

:::tip
Bắt đầu ở chế độ đơn giản trong khi bạn tìm hiểu agent nên làm gì. Khi bạn hài lòng với hành vi, hãy chuyển sang chế độ có cấu trúc cho dài hạn — nó trả lại lần đầu tiên bạn cần điều chỉnh chỉ phần Examples mà không cần đọc lại toàn bộ prompt.
:::
  `,

  "structured-prompt-sections-explained": `
## Giải Thích Các Phần Prompt Có Cấu Trúc

Chế độ có cấu trúc chia prompt thành năm phần. Mỗi phần có một công việc cụ thể, và build engine sử dụng cùng năm nhóm này khi tạo prompt từ các mẫu — vì vậy các phần này không phải là một sự kỳ quặc của UI, chúng là một hợp đồng ổn định giữa cách bạn tác giả và cách mô hình nhìn thấy agent.

### Năm Phần

:::diagram
[Identity] --> [Instructions] --> [Tools] --> [Examples] --> [Error Handling]
:::

- **Identity** — agent là ai. Vai trò, tính cách, lĩnh vực chuyên môn, phong cách giao tiếp. Dòng "bạn là một…".
- **Instructions** — agent làm gì, từng bước. Tác vụ cốt lõi và bất kỳ tác vụ con nào, theo thứ tự chúng nên xảy ra.
- **Tools** — agent sử dụng những khả năng nào và cách sử dụng chúng. Khi nào gọi công cụ nào, các đối số nào quan trọng, phải làm gì với kết quả.
- **Examples** — các cặp đầu vào/đầu ra cho thấy "tốt" trông như thế nào. Phần được sử dụng ít nhất và là một trong những phần có tác động lớn nhất — một ví dụ vững chắc đánh bại ba câu hướng dẫn nữa.
- **Error Handling** — phải làm gì khi đầu vào bị thiếu, không đúng định dạng hoặc bất ngờ. Nơi dừng, gì để thử lại, gì để leo thang cho việc xem xét thủ công.

### Cách Hoạt Động

Trình render nối các phần theo thứ tự được hiển thị, với các dấu phân cách rõ ràng. Một số mô hình chú ý nhiều hơn đến các phần đầu; thứ tự được thiết kế để đặt vai trò và tác vụ cốt lõi lên đầu, với các ví dụ và xử lý lỗi ở dưới cùng nơi chúng vẫn nằm trong ngữ cảnh nhưng không làm loãng tiêu đề. Nếu bạn đang sử dụng prompt có cấu trúc lần đầu tiên, hãy điền Identity và Instructions ngay lập tức và để các phần khác trống — mô hình sẽ hoạt động tốt và bạn có thể thêm Examples / Error Handling khi các trường hợp đặc biệt xuất hiện.

:::tip
Khi một agent bắt đầu tạo ra các lỗi trong các trường hợp đặc biệt, hãy nhìn vào trace và hỏi: "tôi có thể đã ngăn chặn điều này bằng một ví dụ không?" Hầu hết các vấn đề "agent kém ở X" thực sự là "tôi chưa bao giờ cho nó thấy X tốt trông như thế nào".
:::
  `,

  "agent-settings-and-limits": `
## Cài Đặt Và Giới Hạn Agent

Tab Settings trên trình chỉnh sửa agent là nơi bạn đặt rào chắn. Mỗi agent có giới hạn về thời gian chạy, chi phí mỗi lần chạy, số lượt mô hình có thể thực hiện và số bản sao có thể chạy song song. Mặc định là thận trọng — đủ để công việc thực sự xảy ra, đủ thấp để một agent hành xử sai không thể làm tăng hóa đơn trước khi bạn nhận thấy.

Các giới hạn đặc biệt quan trọng đối với các agent không được giám sát (theo lịch trình, kích hoạt bởi webhook, kích hoạt bởi chain). Bạn thấy các lần chạy thủ công xảy ra; bạn không thấy các lần chạy theo lịch trình, vì vậy một prompt bỏ chạy có thể kích hoạt hàng giờ trong một tuần trước khi bạn kiểm tra.

### Cài Đặt Quan Trọng

- **Timeout** — tổng thời gian thực trước khi lần chạy bị giết. Mặc định 2 phút, tăng lên cho các mô hình chậm hoặc chuỗi sử dụng công cụ dài.
- **Budget cap** — chi phí tối đa mỗi lần chạy, được đánh giá so với đồng hồ chi phí trực tiếp; lần chạy hủy bỏ một cách duyên dáng khi nó vượt qua giới hạn.
- **Max turns** — số vòng mô hình ↔ công cụ được phép trong một lần chạy. Ngăn chặn các vòng lặp gọi công cụ nơi mô hình không bao giờ hội tụ.
- **Concurrency** — bao nhiêu lần thực thi song song của agent này được phép. Đặt thành 1 cho các agent có trạng thái (để chúng không chồng chéo trên cùng một đầu vào); tăng lên cho công việc batch song song.
- **Memory access** — liệu agent có đọc từ kho bộ nhớ của nó tại thời điểm chạy không (mặc định bật cho các agent có bộ nhớ được kích hoạt).
- **Failover provider** — nhà cung cấp AI thay thế để sử dụng khi nhà cung cấp chính trả về lỗi vượt qua ngưỡng. Đặt trên các agent bạn quan tâm về thời gian hoạt động.

### Cách Hoạt Động

Giới hạn được thực thi bởi engine thực thi, không phải mô hình. Khi một lần chạy chạm vào giới hạn, nó dừng lại sạch sẽ — trace một phần được giữ lại, lần chạy được đánh dấu với lý do (\`timeout\`, \`budget_exceeded\`, \`turns_exceeded\`), và không có khoản phí hoặc đột biến trạng thái nào tồn tại đối với phần bị cắt. Tab Health hiển thị các điểm dừng giới hạn như cảnh báo để bạn có thể quyết định liệu có nên nâng giới hạn hay sửa prompt cơ bản.

:::tip
Bắt đầu với các giới hạn thận trọng trên mỗi agent mới. Khoảnh khắc rẻ nhất để phát hiện ra một prompt bỏ chạy là vào lần chạy thủ công thứ ba, không phải lần chạy theo lịch trình thứ ba qua đêm.
:::
  `,

  "assigning-tools-to-agents": `
## Gán Công Cụ Cho Agent

Công cụ giống như ứng dụng trên điện thoại — agent của bạn chỉ có thể sử dụng những thứ bạn cài đặt. Bằng cách gán các công cụ cụ thể, bạn kiểm soát chính xác những gì agent có thể làm. Một agent có quyền truy cập email có thể đọc và gửi tin nhắn; một agent có tìm kiếm web có thể tra cứu mọi thứ trực tuyến.

:::warning
Đây cũng là một tính năng an toàn. Một agent không thể vô tình sửa đổi tệp nếu nó không có quyền truy cập tệp, và nó không thể gửi email nếu nó không có công cụ email. Bạn luôn kiểm soát những gì agent của bạn có thể và không thể chạm vào.
:::

### Các Loại Công Cụ Có Sẵn

- **Email** — đọc, soạn thảo và gửi tin nhắn email
- **Web search** — tra cứu thông tin trên internet
- **File access** — đọc và ghi tệp trên máy tính của bạn hoặc lưu trữ đám mây
- **API calls** — tương tác với các dịch vụ và cơ sở dữ liệu bên ngoài
- **Clipboard** — đọc từ và ghi vào clipboard của bạn
- **Messaging channels** — gửi kết quả đến Slack, Discord, Teams hoặc bất kỳ endpoint webhook chung nào như một phần của đầu ra agent

### Cách Gán Công Cụ

:::steps
1. **Mở tab Connectors** — trên trình chỉnh sửa agent; nó hiển thị mọi khả năng mà agent cần so với vault của bạn
2. **Chọn một danh mục, không phải một dịch vụ cụ thể** — chọn "email" hoặc "cloud storage" và bộ chọn hiển thị các credential phù hợp bạn đã có cộng với các connector được đề xuất nếu bạn không có
3. **Ủy quyền bất kỳ thứ gì mới** — đối với các dịch vụ OAuth, bạn sẽ nhấp qua một màn hình đồng thuận một lần; credential kết quả nằm trong vault của bạn và có thể tái sử dụng trên các agent
4. **Kiểm tra trước khi chạy** — trước khi bạn promote agent, build engine kiểm tra chéo mọi khả năng yêu cầu so với vault và gắn cờ bất cứ điều gì thiếu
5. **Lưu cấu hình** — agent sử dụng các công cụ được gán trong lần chạy tiếp theo; nếu một credential sau đó hết hạn, bạn sẽ thấy nó trong chỉ báo sức khỏe của agent
:::

:::tip
Chỉ gán các công cụ mà agent của bạn thực sự cần. Ít công cụ hơn có nghĩa là ít thứ có thể sai và agent của bạn vẫn tập trung vào công việc của mình.
:::
  `,

  "prompt-version-history": `
## Lịch Sử Phiên Bản Prompt

Mỗi lần lưu prompt của agent tạo ra một phiên bản bất biến. Lịch sử nằm bên cạnh trình chỉnh sửa prompt trên tab Prompt — mở nó và bạn thấy mọi lần lưu, có dấu thời gian, với diff so với phiên bản trước đó hiển thị nội tuyến. Không có giới hạn; phiên bản đầu tiên được bảo toàn vĩnh viễn.

Hệ thống cũng tự động phiên bản hóa khi build engine sửa đổi một prompt (ví dụ: trong quá trình áp dụng mẫu hoặc xây dựng lại tham số), vì vậy các thay đổi từ engine xuất hiện cùng với các chỉnh sửa thủ công của bạn với nhãn "auto-generated" rõ ràng.

### Điểm Chính

- **Bản chụp tự động** trên mỗi lần lưu — chỉnh sửa thủ công và chỉnh sửa engine giống nhau
- **Khôi phục một cú nhấp chuột** — chọn bất kỳ phiên bản nào và biến nó thành prompt hiện tại; phiên bản hiện tại được lưu trước, vì vậy việc khôi phục không bao giờ bị mất
- **Diff nội tuyến** — xem những gì đã thay đổi giữa hai phiên bản mà không cần rời khỏi tab
- **Lưu giữ không giới hạn** — phiên bản không bao giờ hết hạn hoặc bị thu gom rác

### Cách Hoạt Động

Lịch sử được lưu trữ trong cơ sở dữ liệu SQLite cục bộ (cùng với chính agent), vì vậy nó có thể tìm kiếm ngay lập tức và hoạt động ngoại tuyến. Khi bạn khôi phục một phiên bản, trình chỉnh sửa chuyển sang phiên bản đó nhưng phiên bản hiện tại trước đó cũng được bảo toàn — bạn có thể lật lại mà không cần làm lại công việc của mình.

:::tip
Trước một thay đổi prompt rủi ro, hãy thực hiện một lần lưu không hoạt động để trạng thái hiện tại được checkpoint trong lịch sử. Sau đó thử nghiệm tự do — khôi phục là một cú nhấp chuột nếu thử nghiệm thất bại.
:::
  `,

  "comparing-prompt-versions": `
## So Sánh Các Phiên Bản Prompt

Khi hành vi của agent thay đổi và bạn muốn biết tại sao, chế độ xem diff trên lịch sử phiên bản hiển thị chính xác các ký tự nào của prompt khác nhau giữa hai phiên bản bất kỳ. Phần thêm được tô sáng màu xanh lá, phần xóa màu đỏ. Đây là cách nhanh nhất để định vị một thoái lui — bạn thường có thể thấy thay đổi vi phạm trong vài giây.

Diff cũng tôn trọng các phần prompt có cấu trúc: nếu bạn đang so sánh hai phiên bản chế độ có cấu trúc, diff được phân đoạn theo từng phần để bạn có thể bỏ qua các phần không liên quan và tập trung vào phần đã thay đổi.

:::code-compare
### Bản gốc
Summarize the emails in my inbox.
Give me the key points.
---
### Đã cải thiện
Read my 5 most recent unread emails.
For each email, write a 2-sentence summary
including the sender name and action needed.
Format as a numbered list.
:::

### Điểm Chính

- **Chế độ xem song song** — cả hai phiên bản hiển thị cùng một lúc với tô sáng cấp ký tự
- **Diff theo phần** cho prompt có cấu trúc — chuyển thẳng đến phần đã thay đổi
- **So sánh hai phiên bản bất kỳ** — không chỉ các phiên bản liên tiếp; hữu ích cho "điều gì đã thay đổi kể từ phiên bản hoạt động ba tuần trước"
- **Khôi phục nhanh** — khôi phục một trong hai phiên bản trực tiếp từ chế độ xem diff

### Cách Hoạt Động

Mở lịch sử phiên bản trên tab Prompt, đánh dấu các ô bên cạnh hai phiên bản và nhấp Compare. Diff render trong bảng song song. Nhấp Restore ở một trong hai bên để biến nó thành hiện tại; diff vẫn mở để bạn có thể thấy chính xác những gì bạn đã hoàn nguyên.

:::tip
Khi bạn tìm thấy thay đổi vi phạm trong một diff, sao chép phiên bản *mới* (bị hỏng) vào prompt và tiếp tục chỉnh sửa — theo cách đó lịch sử phiên bản ghi lại ý định của bạn ("đã thử X, quay lại Y, sau đó tinh chỉnh thành Z"). Khôi phục mà không để lại dấu vết sẽ làm mất bài học.
:::
  `,

  "cloning-and-duplicating-agents": `
## Sao Chép Và Nhân Bản Agent

Sao chép copy toàn bộ cấu hình của một agent vào một agent mới: prompt (bao gồm lịch sử phiên bản), công cụ, trigger, cài đặt, cờ truy cập bộ nhớ, nhà cung cấp dự phòng, mọi thứ trừ trạng thái thời gian chạy (các lần thực thi, chi phí và trigger trực tiếp không được chuyển qua). Bản sao hoàn toàn độc lập — các chỉnh sửa ở một bên không ảnh hưởng đến bên kia.

Cách sử dụng phổ biến nhất là fork một agent đang hoạt động để thử nghiệm an toàn. Bản gốc tiếp tục sản xuất; bản sao là sandbox của bạn. Nếu thử nghiệm tốt, bạn có thể thay thế bản gốc hoặc giữ bản sao như một chuyên môn hóa.

### Điểm Chính

- **Cấu hình đầy đủ được chuyển qua** — prompt, công cụ, trigger, cài đặt, bộ nhớ, dự phòng
- **Trạng thái thời gian chạy thì không** — các lần thực thi, chi phí, trigger trực tiếp thuộc về một agent tại một thời điểm
- **Trigger được sao chép nhưng bị vô hiệu hóa** — để bản sao không kích hoạt ngay lập tức theo cùng lịch trình/webhook như bản gốc
- **Các agent được sao chép nhận hậu tố "(Copy)"** theo mặc định; đổi tên trước khi promote

### Cách Hoạt Động

Nhấp chuột phải vào một agent trong thanh bên hoặc sử dụng menu ba chấm trong thanh công cụ của trình chỉnh sửa và chọn \`Clone\`. Agent mới xuất hiện trong cùng nhóm với các trigger bị vô hiệu hóa. Kích hoạt lại chúng có chủ ý (và cập nhật cấu hình của chúng nếu bạn không muốn bản sao lắng nghe cùng URL webhook như bản gốc, chẳng hạn).

:::tip
Sao chép là cách an toàn nhất để A-B một thay đổi prompt mà không làm gián đoạn agent đã ở production. Thực hiện thay đổi trong bản sao, chạy cả hai trong arena Lab trên cùng đầu vào, và chỉ hoán đổi agent production khi bản sao chiến thắng.
:::
  `,

  "agent-groups-and-organization": `
## Nhóm Và Tổ Chức Agent

Các agent trong thanh bên được tổ chức theo nhóm — các thư mục của riêng bạn để sắp xếp mọi thứ theo team, dự án, chức năng hoặc bất cứ điều gì bạn thấy hữu ích. Trống theo mặc định; bạn thêm nhóm khi bộ sưu tập của bạn phát triển và danh sách phẳng ngừng mở rộng.

Thanh bên cũng hỗ trợ các nhóm lồng nhau (một cấp lồng), sắp xếp lại bằng kéo-thả, trạng thái thu gọn/mở rộng tồn tại qua các phiên và biểu tượng cho mỗi nhóm để nhận biết trực quan nhanh chóng.

### Điểm Chính

- **Tạo nhóm** khi cần — không có giới hạn về số lượng
- **Kéo để sắp xếp lại** — thả một agent vào một nhóm để di chuyển nó, hoặc sắp xếp lại danh sách bằng cách thả giữa các anh chị em
- **Biểu tượng và màu sắc cho mỗi nhóm** — chọn một biểu tượng gợi ý chủ đề của nhóm để bạn tìm đúng nhóm trong nháy mắt
- **Thu gọn để giảm lộn xộn** — các nhóm thu gọn vẫn thu gọn qua các phiên để một danh sách dài không chống lại bạn khi khởi động
- **Lồng một cấp** — hữu ích cho "Personal > Email", "Work > Research", v.v.

### Cách Hoạt Động

Nhấp chuột phải vào thanh bên agent để thêm nhóm, hoặc kéo một nhóm hiện có vào nhóm khác để lồng nó. Các nhóm được lưu trữ trong cơ sở dữ liệu cục bộ và không ảnh hưởng đến việc thực thi agent — chúng hoàn toàn là một lớp tổ chức. Agent có thể nằm trong một nhóm tại một thời điểm nhưng di chuyển tự do giữa chúng.

:::tip
Một nhóm "Drafts" hoặc "Experimental" ở đầu thanh bên của bạn là một mẫu hữu ích. Bất cứ điều gì bạn vẫn đang lặp lại sống ở đó, và các agent production của bạn ở trong các nhóm được đặt tên rõ ràng bên dưới. Phân tách trực quan giảm khả năng chỉnh sửa nhầm agent.
:::
  `,

  "disabling-and-archiving-agents": `
## Vô Hiệu Hóa Và Lưu Trữ Agent

Hai cách để tạm dừng một agent mà không xóa nó. **Vô hiệu hóa** ngăn tất cả các trigger kích hoạt và chặn các lần chạy thủ công; agent vẫn hiển thị trong thanh bên với biểu tượng mờ để bạn nhớ rằng nó tồn tại. **Lưu trữ** chuyển agent vào phần lưu trữ ẩn ra khỏi tầm sử dụng hàng ngày; nó ngừng kích hoạt, không tính vào giới hạn gói và có thể được khôi phục bất cứ lúc nào.

Cả hai thao tác đều không chạm vào các lần thực thi, cài đặt hoặc lịch sử phiên bản. Lưu trữ nặng hơn — dùng nó cho các agent bạn đã hoàn thành bây giờ nhưng có thể muốn quay lại. Vô hiệu hóa nhẹ hơn — dùng nó khi bạn cần tạm dừng một agent tạm thời mà không mất nó khỏi tầm nhìn.

### Điểm Chính

- **Disable** — tạm dừng thực thi; agent vẫn hiển thị trong thanh bên; kích hoạt lại một cú nhấp chuột
- **Archive** — ẩn agent và giải phóng slot của nó so với giới hạn gói; có thể khôi phục vĩnh viễn
- **Cả hai đều không xóa** — cài đặt, lịch sử prompt và các lần thực thi trước đó được bảo toàn
- **Trigger tôn trọng disable** — một agent bị vô hiệu hóa bỏ qua các sự kiện schedule/webhook/file-watcher; chúng không xếp hàng để phát lại khi kích hoạt lại

### Cách Hoạt Động

Mở menu ba chấm trong thanh công cụ của trình chỉnh sửa agent hoặc nhấp chuột phải vào agent trong thanh bên. Disable / Archive / Restore đều ở đó. Các agent được lưu trữ có thể truy cập từ phần Archive ở dưới cùng của thanh bên agent; khôi phục đưa agent trở lại nhóm gốc của nó (hoặc vào nhóm "Ungrouped" nếu nhóm đã bị xóa trong khi đó).

:::tip
Lưu trữ các agent theo mùa (báo cáo hàng quý, quy trình ngày lễ, đối chiếu cuối tháng) thay vì xóa. Khôi phục chúng khi mùa đến và chúng sẵn sàng chạy ngay lập tức.
:::
  `,

  "agent-health-indicators": `
## Chỉ Báo Sức Khỏe Agent

Mỗi agent có một chấm màu nhỏ bên cạnh tên của nó cho bạn biết trạng thái của nó trong nháy mắt. **Xanh lá** có nghĩa là mọi thứ chạy mượt mà. **Vàng** có nghĩa là cần chú ý đến điều gì đó — có thể credential sắp hết hạn hoặc lần chạy gần đây có cảnh báo. **Đỏ** có nghĩa là có vấn đề cần khắc phục.

Các chỉ báo này giúp bạn không phải kiểm tra từng agent riêng lẻ. Một cái nhìn nhanh vào thanh bên cho bạn biết sức khỏe của toàn bộ thiết lập của bạn.

:::feature
**Giám Sát Sức Khỏe Trong Nháy Mắt**
Personas liên tục theo dõi kết quả thực thi, hết hạn credential và sự hoàn chỉnh cấu hình cho mỗi agent. Chỉ báo sức khỏe cập nhật tự động — không yêu cầu kiểm tra thủ công.
:::

### Mỗi Màu Có Nghĩa Là Gì

| Màu | Trạng thái | Ý nghĩa |
|---|---|---|
| **Xanh lá** | Khỏe mạnh | Tất cả các lần chạy gần đây đều thành công, không phát hiện vấn đề, thiết lập hoàn chỉnh |
| **Vàng** | Cảnh báo | Có thể cần chú ý sớm (credential sắp hết hạn, hiệu suất chậm, thiết lập hoàn thành một phần) |
| **Đỏ** | Lỗi | Agent đã thất bại gần đây hoặc có vấn đề cấu hình |
| **Xám** | Không hoạt động | Bị vô hiệu hóa hoặc chưa từng chạy |

### Trạng Thái Thiết Lập

Bên cạnh sức khỏe, mỗi agent có một **trạng thái thiết lập** cho biết nó sẵn sàng chạy tự động đến mức nào. Một agent vừa được promote thường có các khoảng trống thiết lập — credential bị thiếu, trigger chưa được cấu hình, kênh đầu ra vẫn đang được kết nối. Huy hiệu trạng thái thiết lập hiển thị chính xác những gì còn lại phải làm, theo thứ tự ưu tiên, vì vậy bạn không cần phải tìm kiếm qua các tab để tìm ra cái gì đang chặn. Các agent có vấn đề thiết lập dai dẳng tự động bị kéo ra khỏi bất kỳ luân chuyển theo lịch trình hoặc được kích hoạt nào bởi circuit-breaker, vì vậy bạn sẽ không bao giờ có một agent được cấu hình một nửa chạy âm thầm trên dữ liệu xấu.

### Cách Hoạt Động

Sức khỏe được tính toán tự động dựa trên kết quả thực thi gần đây, trạng thái credential và sự hoàn chỉnh cấu hình. Nhấp vào chỉ báo để xem tóm tắt về nguyên nhân gây ra trạng thái hiện tại — bao gồm bất kỳ khoảng trống thiết lập nào. Từ đó, bạn có thể chuyển trực tiếp đến cài đặt, nhật ký hoặc tab cụ thể cần chú ý.

:::tip
Hãy biến nó thành thói quen quét các màu trên thanh bên mỗi ngày một lần. Bắt được chỉ báo vàng sớm ngăn nó trở thành đỏ — và giải quyết các khoảng trống thiết lập ngay sau khi promote là khoảnh khắc rẻ nhất để làm điều đó.
:::
  `,
};
