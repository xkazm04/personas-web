export const content: Record<string, string> = {
  "meet-athena": `
## Gặp Gỡ Athena

Athena là người bạn đồng hành tích hợp của Personas — luôn sẵn sàng, luôn nắm bắt ngữ cảnh. Cô ấy không phải là một chatbot được gắn thêm vào bên cạnh. Cô ấy biết agent, mục tiêu, bộ nhớ của bạn và có thể thực sự vận hành ứng dụng thay bạn.

Cô ấy tồn tại ở hai nơi cùng lúc. **Avatar footer** — khuôn mặt hoạt hình ở góc dưới bên phải — là điểm vào: chạm để mở bảng chat, hoặc nhấn và giữ để đọc một tin nhắn thoại mà không cần mở bảng. **Orb nổi** là hình dạng thứ hai của cô ấy: một lớp phủ có thể kéo được nổi trên công việc của bạn để cô ấy luôn có thể tiếp cận dù bạn đang ở đâu trong ứng dụng. Khi orb được bật (mặc định), footer triệu hồi và ẩn orb; thao tác chạm vào orb mở bảng chat đầy đủ.

Cả hai bề mặt đều phản ánh những gì Athena đang làm trong nháy mắt. Khi cô ấy đang suy nghĩ, avatar thay đổi tư thế. Khi cô ấy đang nói, orb phát sáng theo mức độ giọng của cô ấy. Khi một tác vụ nền hoàn thành, orb hiển thị phản ứng ngắn. Đây không phải là trang trí — chúng cho bạn biết trạng thái của cô ấy mà không cần mở bảng.

Những gì Athena có thể làm vượt xa việc trả lời câu hỏi. Cô ấy có thể trả lời câu hỏi và giải thích tính năng, nhưng cô ấy cũng có thể điều hướng ứng dụng cho bạn, chạy agent, lưu bộ nhớ, đề xuất cập nhật danh tính và lên lịch các cuộc kiểm tra trong tương lai. Khi chế độ tự chủ được bật, cô ấy có thể kết nối nhiều bước lại với nhau mà không cần nhấp chuột từ phía bạn.

### Điểm Chính

- **Avatar footer** — chạm để mở/đóng bảng chat; nhấn và giữ để đọc một lượt thoại từ bất kỳ đâu
- **Orb nổi** — lớp phủ có thể kéo, hai thao tác giống nhau; trượt đến từng khu vực trong các walkthrough có hướng dẫn
- **Vận hành ứng dụng** — Athena không chỉ tư vấn; cô ấy có thể điều hướng các tuyến đường, chạy agent và soạn bảng điều khiển
- **Luôn nắm bắt ngữ cảnh** — cô ấy đọc bộ nhớ, mục tiêu và trạng thái agent của bạn trước mỗi phản hồi, vì vậy cô ấy không bao giờ bắt đầu từ đầu
- **Điểm khởi đầu** — các chủ đề trong phần Companion này đi sâu hơn: chat, giọng nói, bộ nhớ, kiểm tra chủ động, walkthrough có hướng dẫn, Decision Hub và điều khiển ứng dụng bằng chat

:::tip
Nếu bạn đóng bảng chat, Athena vẫn tiếp tục làm việc. Các tác vụ nền chạy trong orb, các nhắc nhở chủ động vẫn đến, và các phản hồi thoại vẫn phát — việc đóng bảng không tạm dừng cô ấy.
:::
  `,

  "chatting-with-athena": `
## Trò Chuyện Với Athena

Mở bảng và Athena chào đón bạn bằng **màn hình chào mừng** — avatar của cô ấy, lời chào ngắn và một bộ **chip prompt khởi đầu** bao gồm các điểm bắt đầu phổ biến nhất. Nhấp vào bất kỳ chip nào và tin nhắn được gửi ngay lập tức; bạn không cần phải gõ.

Đối với các prompt có sẵn ngoài bộ khởi đầu, hãy gõ \`/\` làm ký tự đầu tiên của một tin nhắn rỗng. Một **bảng lệnh slash** mở phía trên hộp soạn thảo với các prompt đặt sẵn bạn có thể lọc bằng cách gõ: **get to know me** (cuộc phỏng vấn nhập liệu khởi động bộ nhớ của cô ấy về bạn), **show goals**, **what's queued**, **recent decisions**, **live ops**, **memory recap** và **capabilities**. Các phím mũi tên điều hướng danh sách, Enter chọn mục được tô sáng, Escape xóa và đóng.

Khi Athena trả lời, cô ấy thường thêm **chip phản hồi nhanh** — hai đến năm prompt theo dõi phù hợp với hướng cuộc trò chuyện đang đi. Nhấp vào một để gửi làm tin nhắn tiếp theo của bạn. Phía dưới phản hồi đã hoàn thành gần nhất của cô ấy, bạn cũng nhận được ba **chip tinh chỉnh**: **Shorter**, **More detail** và **Code only**. Mỗi cái gửi lại tin nhắn cuối cùng của bạn kèm theo hậu tố định hướng để bạn có thể định hình phản hồi mà không cần gõ lại.

Hộp soạn thảo luôn mở trong khi Athena đang trả lời. Bạn có thể gõ bất kỳ lúc nào — nếu tin nhắn của bạn nghe có vẻ như một sự chuyển hướng ("thực ra, dừng lại" hoặc "chờ đã, thay vào đó…") nó sẽ ngắt phản hồi đang thực hiện và xếp hàng yêu cầu mới của bạn. Nếu nó có vẻ bổ sung ("và cả…") nó sẽ xếp hàng phía sau phản hồi hiện tại và chạy sau. Bạn sẽ thấy các tin nhắn đã xếp hàng dưới dạng chip nhỏ phía trên hộp soạn thảo; bạn có thể hủy bất kỳ cái nào.

**Chế độ tự chủ** (biểu tượng ∞ trong tiêu đề bảng) cho phép Athena kết nối công việc nhiều bước một cách tự động. Khi nó được bật và cô ấy còn nhiều việc phải làm, cô ấy lên lịch một lượt tiếp theo khoảng mười lăm giây sau, tối đa hai mươi lượt liên tiếp. Một dải mỏng trong bản ghi phân chia mỗi lần tiếp tục tự chủ để bạn có thể biết trong nháy mắt bạn đã dừng ở đâu và cô ấy tiếp quản ở đâu.

### Điểm Chính

- **Màn hình chào mừng** — các chip khởi đầu gửi tin nhắn thực qua cùng pipeline như các tin nhắn được gõ
- **Bảng lệnh slash** — gõ \`/\` để duyệt các prompt đặt sẵn; lọc bằng cách gõ, chọn bằng Enter
- **Chip phản hồi nhanh** — 2–5 tùy chọn theo dõi Athena cung cấp ở cuối phản hồi của cô ấy
- **Chip tinh chỉnh** — Shorter / More detail / Code only; chỉ bên dưới phản hồi đã hoàn thành gần nhất
- **Chuyển hướng giữa câu trả lời** — gõ trong khi cô ấy đang trả lời; tự động được phân loại là ngắt hoặc xếp hàng
- **Chế độ tự chủ** — Athena kết nối tối đa 20 lượt công việc tự định hướng; bất kỳ tin nhắn nào từ bạn sẽ hủy chuỗi

:::tip
Các prompt bảng lệnh slash được dịch sang tất cả 14 ngôn ngữ được hỗ trợ — nếu bạn dùng Personas bằng ngôn ngữ khác tiếng Anh, các tin nhắn đặt sẵn đến bằng ngôn ngữ của bạn và Athena trả lời bằng ngôn ngữ đó.
:::
  `,

  "voice-and-hold-to-talk": `
## Giọng Nói và Nhấn Giữ để Nói

Athena hỗ trợ thoại hai chiều đầy đủ: bạn đọc, cô ấy phiên âm và trả lời, và câu trả lời của cô ấy phát lại bằng giọng nói tổng hợp. Mỗi phần của pipeline đều có một tùy chọn riêng tư.

### Đọc Cho Athena

**Nhấn và giữ** avatar footer hoặc orb nổi khoảng một phần tư giây. Huy hiệu mic và xung động xuất hiện, và bản ghi tạm thời hiển thị dưới dạng chú thích bên cạnh orb. Nhả ra khi bạn nói xong — bản ghi được chuyển cho Athena và pipeline phản hồi thông thường chạy. Phản hồi stream vào bảng và, nếu engine thoại được cấu hình, phát tự động. Bảng không bao giờ cần mở; một lượt thoại hoạt động khi bảng hoàn toàn được thu gọn.

**Phím tắt toàn cục Cmd/Ctrl+Shift+A** triệu hồi Athena từ bất kỳ đâu trong ứng dụng và bắt đầu một lượt thoại chỉ với một phím tắt. Nhấn phím tắt lại để gửi, hoặc Esc để hủy mà không gửi. Phím tắt này dùng cùng phiên như giữ trên orb — phím tắt giữa walkthrough giống như giữ orb.

### Engine chuyển giọng nói thành văn bản

Có hai engine, được chọn trong **Companion → Voice** trong bảng STT:

:::compare
**Trình duyệt (mặc định)**
Sử dụng Web Speech API trong renderer của ứng dụng. Không cần thiết lập. Trên Windows, âm thanh được chuyển tiếp đến dịch vụ giọng nói đám mây của nhà cung cấp OS — tiện lợi nhưng không chạy trên thiết bị.
---
**Whisper Cục Bộ**
Phiên âm trên thiết bị qua sidecar \`whisper-cli\`. Âm thanh không bao giờ rời khỏi máy của bạn. Yêu cầu tải xuống mô hình Whisper và đặt nhị phân vào đường dẫn mong đợi (tab Voice hiển thị vị trí chính xác và trạng thái tải xuống).
:::

### Engine phát lại giọng nói

Khi Athena trả lời, bản tóm tắt nói có thể đến từ một trong hai engine thoại:

:::compare
**ElevenLabs (đám mây)**
Tổng hợp chất lượng cao sử dụng thông tin đăng nhập API ElevenLabs và ID giọng bạn chọn. Tinh chỉnh theo từng giọng: độ ổn định, sự tương đồng, phong cách và tốc độ. Thông tin đăng nhập được lưu trong vault của bạn; API key không bao giờ đến renderer của ứng dụng.
---
**Piper (ONNX cục bộ)**
Tổng hợp trên thiết bị mà không cần kết nối mạng lúc tổng hợp và không cần thông tin đăng nhập. Giọng được tải xuống từ danh mục được tuyển chọn gồm khoảng 17 giọng trên 14 ngôn ngữ. Tab Voice cho thấy giọng nào đã được cài đặt.
:::

### Thông báo chủ động được đọc to

Các kiểm tra chủ động (mục tiêu sắp đến, lỗi agent, nhắc nhở) cũng có thể được đọc to — ngay cả khi bảng chat được đóng. TTS khi đến kích hoạt ngay khi thông báo đến, sử dụng cùng engine bạn đã cấu hình. Nút **Play it again** trong footer phát lại tin nhắn đã nói cuối cùng nếu bạn bỏ lỡ.

:::tip
Nếu bạn muốn thoại mà không có bất kỳ cuộc gọi đám mây nào, hãy kết hợp Whisper cục bộ để đọc và Piper để phát lại. Cả hai đều chạy hoàn toàn trên thiết bị. Tab Voice cung cấp đường dẫn cài đặt và trình duyệt mô hình cho mỗi engine.
:::
  `,

  "athenas-long-term-memory": `
## Bộ Nhớ Dài Hạn Của Athena

Athena nhớ bạn qua các phiên. Cô ấy không bắt đầu từ bảng trắng mỗi khi bạn mở bảng — cô ấy đọc bộ nhớ về bạn trước mỗi phản hồi và sử dụng nó để đưa ra câu trả lời phù hợp với tình huống thực tế của bạn.

### Cô ấy nhớ gì

Bộ nhớ được tổ chức thành các tầng, mỗi tầng bao gồm một loại kiến thức khác nhau:

- **Sự kiện** — những điều cô ấy đã học về bạn, dự án của bạn và thế giới. "Bạn thích tóm tắt ngắn gọn." "Nhánh chính của repo này là master."
- **Tùy chọn thủ tục** — các quy tắc hành vi cô ấy đã học. "Khi tóm tắt tài liệu dài, dẫn đầu bằng câu tóm tắt một câu." "Đối với ví dụ mã, ưu tiên TypeScript."
- **Mục tiêu** — các mục tiêu đang hoạt động và ngày mục tiêu cô ấy theo dõi thay bạn.
- **Hồ sơ danh tính** — một tài liệu \`identity.md\` đang phát triển được đọc vào mỗi system prompt. Đây là nguồn duy nhất của "bạn là ai với Athena lúc này" và phát triển bằng các chỉnh sửa neo đậu, không bao giờ ghi đè toàn bộ.
- **Tập** — lịch sử cuộc trò chuyện, được lưu dưới dạng tệp markdown trên máy của bạn. Doctrine (tài liệu tham khảo riêng của Personas) điền vào kiến thức sản phẩm.

### Khởi động với cuộc phỏng vấn nhập liệu

Khi cài đặt lần đầu, Athena tự động chạy một cuộc phỏng vấn ngắn — một vài câu hỏi tập trung cho cô ấy đủ để viết hồ sơ danh tính ban đầu. Bạn có thể chạy lại cuộc phỏng vấn bất kỳ lúc nào bằng cách chọn **get to know me** từ bảng lệnh slash hoặc nhấp chip phù hợp trên màn hình chào mừng. Nếu hồ sơ danh tính đã tồn tại, cô ấy cập nhật nó với các diff neo đậu; cô ấy không bao giờ xóa ngữ cảnh bạn đã cung cấp trước đó.

### Trình duyệt Bộ nhớ

Mở **Companion → Memory** để xem mọi thứ Athena biết. Brain Viewer liệt kê các tập, sự kiện, tùy chọn thủ tục, mục tiêu và tài liệu danh tính — tất cả có thể duyệt. Nhấp vào bất kỳ mục nào để đọc nội dung đầy đủ, theo dõi các bộ nhớ được liên kết đến các mục liên quan và chỉnh sửa hoặc sửa bất kỳ điều gì sai.

**Sửa chữa chỉ bằng một cú nhấp chuột.** Mỗi dòng trong chế độ xem danh tính có một khả năng "Điều đó sai". Nhấp vào nó và Athena ghi lại sự sửa chữa dưới dạng tín hiệu học tập có giá trị cao và đề xuất xóa dòng không chính xác trong một thẻ phê duyệt duy nhất. Bạn phê duyệt và tuyên bố sai được xóa.

### Quyền riêng tư

Dữ liệu não — tất cả năm tầng bộ nhớ — nằm trên máy của bạn tại \`~/.personas/companion-brain/\`. Không có gì được lưu trong cơ sở dữ liệu đám mây. Nếu bạn sử dụng engine STT Whisper cục bộ và TTS Piper, không có âm thanh nào rời khỏi máy của bạn.

:::tip
Cuộc phỏng vấn nhập liệu ngắn (vài phút) và trả lại lợi ích ngay lập tức — một vài phản hồi đầu tiên của Athena sau khi nhập liệu tốt đáng chú ý hơn nhiều. Hãy chạy nó trước phiên thực sự đầu tiên của bạn.
:::
  `,

  "proactive-check-ins": `
## Kiểm Tra Chủ Động

Athena không chờ bạn hỏi. Khi có điều gì đó đáng để bạn chú ý xảy ra — thời hạn đang đến gần, agent đang chờ, nhắc nhở bạn đã đặt — cô ấy liên hệ trước. Đây là các kiểm tra chủ động: các thẻ xuất hiện trong bảng chat, tùy chọn được đọc to, mà không cần bạn mở bất cứ thứ gì.

### Điều gì kích hoạt kiểm tra

Athena đánh giá các điều kiện khoảng mỗi năm phút. Các trigger có thể tạo ra kiểm tra bao gồm:

- **Mục tiêu đến gần** — một mục tiêu đang hoạt động có ngày mục tiêu trong vòng 24 giờ
- **Tồn đọng lão hóa** — một cam kết tự hứa chưa được giải quyết vượt quá ngưỡng tầng (leo thang từ 1 ngày đến 3 ngày đến 7 ngày)
- **Cadence đến hạn** — một nghi lễ bạn đặt (kiểm tra định kỳ, cửa sổ tập trung) khớp với "bây giờ"
- **Vào ngày này** — một ghi chú hoặc phản ánh từ cùng ngày lịch một tháng, ba tháng hoặc một năm trước, được khớp với các mục tiêu đang hoạt động của bạn
- **Agent cần bạn** — một phiên đội đã thất bại, đã chờ đầu vào hơn hai phút hoặc đã trở nên lỗi thời
- **Cam kết riêng của Athena** — các kiểm tra theo lịch mà Athena đã đề xuất và bạn đã phê duyệt trong một cuộc trò chuyện, được giao đúng vào thời gian cô ấy cam kết

### Rào chắn

Hệ thống được thiết kế để hữu ích mà không ồn ào:

- **Giờ im lặng** — các nhắc nhở được giữ trong bất kỳ cửa sổ im lặng nào bạn cấu hình; không có gì kích hoạt trong khi bạn đã yêu cầu im lặng rõ ràng
- **Hạn mức hàng ngày** — theo mặc định Athena gửi tối đa ba nhắc nhở mỗi ngày từ các loại được kích hoạt bởi trigger; nếu bạn liên tục bỏ qua một loại nhắc nhở, hạn mức cho loại đó sẽ âm thầm giảm theo thời gian
- **Khử trùng lặp** — cùng một trigger cho cùng một chủ đề chỉ có thể kích hoạt một lần cho đến khi bạn giải quyết nó; một agent đang thất bại sẽ không tạo ra nhắc nhở mới mỗi năm phút

### Hành động theo kiểm tra

Mỗi thẻ cung cấp hai hành động: **Tham gia** và **Bỏ qua**. Tham gia mở ngữ cảnh liên quan — chi tiết mục tiêu, hoạt động của agent, mục nhập bộ nhớ. Bỏ qua ghi lại rằng bạn đã thấy nó. Nếu thoại được cấu hình, nội dung nhắc nhở được đọc to ngay khi đến, ngay cả khi bảng chat được đóng.

:::info
Các sự cố có mức độ nghiêm trọng cao, khẩn cấp và nghiêm trọng bỏ qua hoàn toàn hạn mức nhắc nhở hàng ngày — chúng không bao giờ bị im lặng bởi giới hạn tần suất hoặc giờ im lặng. Các mục sàn an toàn luôn đến với bạn.
:::

:::tip
Đặt một nghi lễ giờ im lặng trong bảng lệnh slash (gõ \`/\` và chọn "what's queued" để xem các nghi lễ của bạn) để xác định cửa sổ mà Athena giữ tất cả các kiểm tra cho đến khi cửa sổ kết thúc. Điều này hữu ích cho các khối làm việc chuyên sâu mà bạn muốn không bị gián đoạn.
:::
  `,

  "guided-walkthroughs": `
## Walkthrough Có Hướng Dẫn

Khi bạn hỏi Athena cách làm điều gì đó, cô ấy có thể chỉ cho bạn thay vì chỉ nói với bạn. Hãy nói "show me how to create a persona" hoặc "how do I set up a connector?" và cô ấy cung cấp một lựa chọn: **Build it for me** (cô ấy tự làm việc) hoặc **Show me how to build it** (cô ấy hướng dẫn bạn tự làm).

Chọn đường dẫn walkthrough và chuyến tham quan có hướng dẫn bắt đầu. Orb của Athena trượt qua màn hình đến khu vực liên quan — bạn có thể xem nó di chuyển. Phần tử cô ấy muốn bạn nhìn vào nhận được một vòng phát sáng nhẹ với các dấu ngoặc góc khóa vào nó. Phần còn lại của giao diện người dùng vẫn hoàn toàn hiển thị và có thể nhấp; không có gì bị mờ hoặc bị chặn. Một **bảng chú thích** nằm bên cạnh orb với phần narration bước và điều khiển: Back, Pause, Skip và Stop.

### Cách mỗi bước hoạt động

Mỗi bước trong walkthrough diễn giải những gì bạn đang xem và, khi có hành động cần làm, chờ bạn thực hiện. Nhấp vào phần tử được tô sáng vừa tiến thêm chuyến tham quan **vừa** thực hiện hành động thực — chuyến tham quan và ứng dụng vẫn đồng bộ. Một số bước là các nhịp "lượt của bạn" nơi tự động tiến được tạm dừng hoàn toàn cho đến khi bạn nhấp. Các bước khác tự động tiến sau một khoảng dừng ngắn khi bạn đã đọc phần narration.

Walkthrough có thể điều khiển bằng bàn phím: các phím mũi tên trái/phải lùi và tiến, Space tạm dừng và tiếp tục, Escape dừng.

### Những walkthrough nào có sẵn

Athena đã soạn thảo các chuyến tham quan cho các bề mặt mà người dùng thường hỏi nhất:

- **Tạo persona** — studio build, trigger describe-your-persona của sigil và toggle build tự chủ
- **Thiết lập connector** — tuyến đường Vault, luồng Add new credential và chọn loại connector
- **Tạo trigger** — Events hub và Builder canvas định tuyến
- **Áp dụng template** — gallery template và khả năng Adopt trên thẻ template
- **Phân loại sự cố** — hộp thư Incidents trên Overview và một hàng sự cố
- **Thiết lập mục tiêu và KPI** — bảng Goals và bảng điều khiển KPI

Mỗi walkthrough kết thúc bằng một lời kêu gọi hành động: Start building, Open the catalog, Open the Builder hoặc Set up a goal — vì vậy đường dẫn "show me how" dẫn trực tiếp vào đường dẫn "do it".

### Trỏ và chuyến tham quan ad-hoc

Ngoài các walkthrough có kịch bản, Athena có thể trỏ vào các phần tử riêng lẻ giữa cuộc trò chuyện. Nếu bạn hỏi "activity feed ở đâu?" cô ấy có thể bật vòng phát sáng trên đó và diễn giải một chú thích duy nhất mà không cần bắt đầu chuyến tham quan đầy đủ. Cô ấy cũng có thể lắp ráp một chuyến tham quan ngắn hai đến sáu bước ngay lập tức cho các yêu cầu "show me around".

:::tip
Athena tự động cung cấp walkthrough hoặc đường dẫn build-for-me khi bạn mô tả một persona bạn muốn — bạn không cần biết cụm từ đúng. Chỉ cần mô tả những gì bạn muốn xây dựng và cô ấy sẽ hiển thị cả hai tùy chọn.
:::
  `,

  "the-decision-hub": `
## Decision Hub

Một số hành động của Athena cần sự phê duyệt rõ ràng của bạn trước khi thực hiện. Khi cô ấy muốn làm điều gì đó thay đổi trạng thái — chạy agent, cập nhật hồ sơ danh tính của bạn, lên lịch kiểm tra trong tương lai, triệu hồi các phiên đội — cô ấy đề xuất nó dưới dạng **thẻ phê duyệt**. Thẻ nằm trong bảng chat cho đến khi bạn thực hiện. Không có gì xảy ra cho đến khi bạn làm.

### Những gì xuất hiện dưới dạng thẻ phê duyệt

Phạm vi các hành động xuất hiện theo cách này khá rộng:

- **Chạy agent** — thực thi một persona với các đầu vào nhất định, hoặc khởi chạy một build một lần tự chủ
- **Ghi bộ nhớ và danh tính** — cập nhật hồ sơ danh tính của bạn, ghi hoặc xóa sự kiện hoặc tùy chọn thủ tục, ghi hoặc cập nhật mục tiêu
- **Cam kết trong tương lai** — một kiểm tra theo lịch mà Athena đang đề xuất ("Tôi sẽ nhắn bạn về điều này sau ba ngày")
- **Công việc dự án và phát triển** — đăng ký dự án mới, xếp hàng quét codebase
- **Hoạt động đội** — triệu hồi các phiên worker Claude Code mới, gửi đầu vào cho phiên, kết thúc phiên, gửi thao tác đa phiên

### Các thao tác nhạy cảm không bao giờ được tự động phê duyệt

Một số danh mục **không bao giờ** được tự động phê duyệt, ngay cả khi chế độ tự chủ được bật. Cập nhật danh tính và ghi mục tiêu yêu cầu xem xét của bạn mỗi lần — Athena có thể đề xuất chúng, nhưng cô ấy không thể cam kết chúng mà không có cú nhấp chuột của bạn. Đây là theo thiết kế: các ghi ảnh hưởng đến bạn là ai với Athena và trạng thái mục tiêu điều khiển các kiểm tra chủ động, luôn có con người trong vòng lặp.

### Phê duyệt tất cả

Khi nhiều thẻ phê duyệt chồng chất từ cùng một phiên đội — ví dụ, một phiên đang chờ ba lần ghi tệp liên tiếp — nhóm thẻ hiển thị nút **Approve all** giải quyết mọi thẻ loại phê duyệt trong phiên đó cùng một lúc. Các yêu cầu hướng dẫn cần câu trả lời gõ không bao giờ được gộp; chúng vẫn là từng cái.

### Hub nằm ở đâu

Các thẻ phê duyệt xuất hiện nội tuyến trong bảng chat, phía trên hộp soạn thảo. Bạn cũng có thể thấy các phê duyệt đang chờ từ các phiên agent đang chạy ở đó — bất cứ thứ gì đang chờ quyết định của bạn xuất hiện ở một nơi thay vì rải rác qua các chế độ xem agent riêng lẻ.

:::info
Nếu Athena đề xuất một hành động và bạn từ chối, cô ấy nhận được sự từ chối như phản hồi và có thể đề xuất một giải pháp thay thế. Từ chối luôn an toàn — không có thay đổi trạng thái nào cho đến khi bạn phê duyệt.
:::
  `,

  "operating-by-chat": `
## Vận Hành Ứng Dụng Bằng Chat

Athena có thể làm nhiều hơn là tư vấn — cô ấy có thể điều khiển ứng dụng. Yêu cầu cô ấy đưa bạn đến đâu đó, mở trình chỉnh sửa, xây dựng bảng điều khiển hoặc gọi một dịch vụ được kết nối, và cô ấy làm điều đó, nhấp nháy đích đến để mắt bạn đổ vào những gì cô ấy vừa mang lên.

### Điều hướng bằng giọng nói hoặc văn bản

Hỏi Athena mở bất kỳ phần chính nào của ứng dụng — Overview, Agents, Events, Credentials, Settings và các phần khác — và cô ấy chuyển tuyến đường sidebar. Container của đích đến nhấp nháy một lúc để bạn biết cô ấy đã đến đâu. Điều này hoạt động từ một lượt thoại khi bảng được đóng: hãy nói "take me to the activity feed" và ứng dụng điều hướng trong khi Athena xác nhận trong chat.

Từ một ngữ cảnh cụ thể, cô ấy có thể đi sâu hơn. Hỏi "jump into the Lab for the summarizer agent in comparison mode" và cô ấy mở trình chỉnh sửa của agent đó được chọn trước đến chế độ xem so sánh matrix. Lựa chọn tuyến đường và chế độ xảy ra trong một hành động duy nhất.

### Soạn cockpit tùy chỉnh

Khi Athena muốn giải thích điều gì đó hoạt động — trạng thái đội agent của bạn, tóm tắt dịch vụ được kết nối, phê duyệt đang chờ — cô ấy có thể soạn một **cockpit**: một lưới widget trên tab Home của bạn hiển thị dữ liệu trực tiếp thay vì đổ dưới dạng văn xuôi chat. Cô ấy lắp ráp các widget, duy trì spec, điều hướng bạn đến đó và bảng xác nhận với một lần nhấp nháy của container cockpit.

Bạn cũng có thể yêu cầu cô ấy xây dựng cockpit rõ ràng: "put together a dashboard showing my top three agents and any pending reviews." Các widget được chứng minh là hữu ích có thể được ghim vĩnh viễn bằng một cú nhấp chuột.

### Nút Radar và Sunrise

Hai nút trong thanh công cụ companion cung cấp cho bạn quyền truy cập một chạm vào hai bản tóm tắt hoạt động phổ biến nhất của Athena:

- **Radar** — xem xét đội. Athena thu thập sẵn một bản tóm tắt từ kho thực thi của bạn — sức khỏe đội, tiến độ mục tiêu, hiệu suất agent, điểm Director — và lý luận về nó trong một lượt tập trung. Sử dụng điều này khi bạn muốn đánh giá trung thực về cả đội của mình đang làm thế nào.
- **Sunrise** — bản tóm tắt buổi sáng. Athena tóm tắt 24 giờ qua trên Tin nhắn, Human Review và Sự cố: có bao nhiêu đến, điều gì khẩn cấp, điều gì quá hạn. Sử dụng điều này để định hướng bản thân vào đầu phiên.

Cả hai nút đều bỏ qua lượt chat cho bước thu thập dữ liệu — cú nhấp chuột của bạn là trigger và bản tóm tắt stream trở lại vào bảng như bất kỳ phản hồi nào khác.

### Phím tắt "Ask Athena" trong toàn ứng dụng

Các phần khác của Personas hiển thị các nút **Ask Athena** định tuyến ngữ cảnh trực tiếp đến cô ấy. Thẻ Fleet Optimization trên Mission Control, các trang mục tiêu, chế độ xem chi tiết tin nhắn và các bề mặt khác đều có những cái này. Nhấp vào một cái gửi ngữ cảnh liên quan dưới dạng lượt thoại qua bảng luôn được gắn kết — orb xuất hiện ngắn, xác nhận đã nhận và lượt chạy trong nền để bạn vẫn ở trên màn hình bạn đang ở.

:::tip
Athena có thể gọi trực tiếp các dịch vụ được kết nối của bạn trong chat — sự cố Sentry, pull request GitHub, kênh Slack, luồng Gmail. Ghim một connector trong thanh công cụ và cô ấy có thể lấy từ nó trong một công việc nền, sau đó báo cáo kết quả trong phản hồi tiếp theo của cô ấy mà bạn không cần rời khỏi cuộc trò chuyện.
:::
  `,
};
