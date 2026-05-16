export const content: Record<string, string> = {
  "common-error-messages": `
## Thông Báo Lỗi Phổ Biến

Các thông báo lỗi có thể trông đáng sợ, nhưng hầu hết đều có các giải pháp đơn giản. Hướng dẫn này dịch các lỗi thường gặp nhất sang tiếng Việt đơn giản và cho bạn biết chính xác phải làm gì. Bạn không cần hiểu các chi tiết kỹ thuật — chỉ cần khớp lỗi với cách khắc phục.

Hầu hết các lỗi rơi vào một vài danh mục: các vấn đề credential, vấn đề timeout và không khớp định dạng đầu vào. Khi bạn biết các mẫu, việc khắc phục sự cố trở thành bản năng thứ hai.

### Danh Sách Chẩn Đoán Nhanh

:::checklist
- Kiểm tra xem API của nhà cung cấp AI có hoạt động không và tài khoản của bạn có hoạt động không
- Xác minh sức khỏe credential trong bảng Credentials (tìm các chỉ báo đỏ/vàng)
- Xem xét các giới hạn tốc độ — chờ một phút nếu bạn đã gửi quá nhiều yêu cầu
- Thử một lần chạy thủ công với đầu vào kiểm thử đơn giản để cô lập vấn đề
- Kiểm tra định dạng đầu vào nếu dữ liệu đến từ một trigger hoặc pipeline
:::

### Các Lỗi Phổ Biến Nhất

- **"Authentication failed"** — credential của bạn đã hết hạn hoặc được nhập không chính xác. Đi tới \`Credentials\` và làm mới hoặc nhập lại.
- **"Request timed out"** — nhà cung cấp AI mất quá lâu để phản hồi. Thử chạy lại, hoặc tăng timeout trong cài đặt agent.
- **"Rate limit exceeded"** — bạn đã thực hiện quá nhiều yêu cầu quá nhanh. Chờ một phút và thử lại, hoặc nâng cấp gói nhà cung cấp của bạn.
- **"Invalid input format"** — dữ liệu được gửi đến agent của bạn không đúng định dạng mong đợi. Kiểm tra trigger hoặc pipeline cấp dữ liệu cho agent này.

### Cách Hoạt Động

Khi một lỗi xảy ra, nó xuất hiện trong nhật ký thực thi với một mã và mô tả. Nhấp vào lỗi để xem giải thích chi tiết và cách khắc phục được đề xuất. Nhiều lỗi bao gồm một nút \`Fix Now\` đưa bạn trực tiếp đến cài đặt cần chú ý.

:::tip
Đừng hoảng sợ khi bạn thấy lỗi. Đọc thông báo cẩn thận — nó hầu như luôn cho bạn biết điều gì sai và chỉ cho bạn đến giải pháp.
:::
  `,

  "agent-not-responding": `
## Agent Không Phản Hồi

Nếu agent của bạn có vẻ bị treo, kẹt hoặc chỉ không tạo ra kết quả, đừng lo lắng — thường là một sửa lỗi đơn giản. Các nguyên nhân phổ biến nhất là kết nối nhà cung cấp AI bị timeout, vấn đề credential hoặc agent đạt đến giới hạn lượt tối đa của nó. Theo danh sách này để quay trở lại đúng hướng.

Hầu hết các vấn đề agent không phản hồi tự giải quyết khi bạn xác định và sửa nguyên nhân cơ bản, hầu như không bao giờ là một vấn đề vĩnh viễn.

### Danh Sách Chẩn Đoán

:::steps
1. **Kiểm tra nhật ký thực thi** — tìm các thông báo lỗi hoặc cảnh báo giải thích sự đình trệ
2. **Xác minh nhà cung cấp AI của bạn** — đảm bảo API của nhà cung cấp của bạn hoạt động và tài khoản của bạn hoạt động
3. **Kiểm tra credential** — đảm bảo các credential của agent chưa hết hạn
4. **Xem xét các giới hạn** — agent có thể đã đạt đến cài đặt timeout hoặc max turns của nó
5. **Thử một lần chạy thủ công** — chạy agent với đầu vào kiểm thử đơn giản để cô lập vấn đề
:::

### Cách Hoạt Động

Mở agent và kiểm tra nhật ký thực thi mới nhất của nó. Nếu nó hiển thị một lỗi, hãy theo cách khắc phục cho lỗi cụ thể đó. Nếu nhật ký hiển thị agent vẫn đang chạy, nó có thể đang xử lý một tác vụ đặc biệt phức tạp. Kiểm tra cài đặt timeout — nếu nó quá ngắn, agent có thể dừng trước khi hoàn thành.

:::tip
Nếu một agent thực sự bị kẹt (không có tiến bộ trong vài phút), hãy nhấp \`Stop\` và sau đó thử một lần chạy thủ công với đầu vào đơn giản hơn. Điều này giúp bạn xác định xem vấn đề có ở đầu vào hay chính agent.
:::
  `,

  "credential-errors": `
## Lỗi Credential

Khi một agent không thể kết nối với một dịch vụ, thường là vì một credential đã hết hạn, một mật khẩu đã được thay đổi hoặc một quyền đã bị thu hồi. Đây là những vấn đề phổ biến nhất trong bất kỳ hệ thống tự động hóa nào và chúng hầu như luôn nhanh để sửa.

Chìa khóa là xác định credential nào đang gây ra vấn đề, sau đó làm mới hoặc thay thế nó.

### Các Nguyên Nhân Phổ Biến

- **Token hết hạn** — các token OAuth hết hạn định kỳ và cần làm mới
- **Mật khẩu đã thay đổi** — nếu bạn đã thay đổi mật khẩu ở nơi khác, hãy cập nhật nó trong Personas
- **Quyền bị thu hồi** — dịch vụ có thể đã thu hồi quyền truy cập bạn đã cấp ban đầu
- **Credential sai được gán** — agent có thể đang sử dụng credential sai cho dịch vụ

### Cách Hoạt Động

Kiểm tra thông báo lỗi trong nhật ký thực thi — nó sẽ đề cập đến dịch vụ nào đã thất bại. Đi tới \`Credentials\` và tìm credential cho dịch vụ đó. Kiểm tra trạng thái sức khỏe của nó. Nếu nó đỏ hoặc vàng, hãy nhấp vào nó để xem điều gì sai và làm theo cách khắc phục được đề xuất — thường là làm mới token hoặc nhập lại mật khẩu.

:::tip
Thiết lập kiểm tra sức khỏe credential để chạy tự động. Chúng sẽ bắt các credential sắp hết hạn trước khi chúng gây ra thất bại của agent, biến một khủng hoảng tiềm năng thành một nhiệm vụ bảo trì thường xuyên.
:::
  `,

  "trigger-not-firing": `
## Trigger Không Kích Hoạt

Một trigger không kích hoạt thật bực bội, nhưng nguyên nhân thường là một điều gì đó nhỏ — lỗi cấu hình, vấn đề về thời gian hoặc thiếu quyền. Hướng dẫn này dẫn bạn qua các thủ phạm phổ biến nhất để bạn có thể đưa các tự động hóa của mình chạy trở lại.

Nhật ký trigger là người bạn tốt nhất của bạn ở đây. Nó ghi lại mọi nỗ lực kích hoạt, bao gồm những nỗ lực đã bị lọc ra hoặc thất bại âm thầm.

### Các Bước Chẩn Đoán

:::steps
1. **Kiểm tra nhật ký trigger** — mở cài đặt trigger của agent và nhấp tab \`Log\` để xem mọi nỗ lực, bao gồm các thất bại
2. **Xác minh trigger được bật** — tìm công tắc; các trigger bị vô hiệu hóa không kích hoạt
3. **Kiểm tra các bộ lọc** — xem xét các điều kiện lọc của bạn, có thể quá nghiêm ngặt và chặn tất cả các sự kiện
4. **Kiểm thử thủ công** — sử dụng trình kiểm thử trigger để mô phỏng một sự kiện và xác minh cấu hình
5. **Kiểm tra quyền** — xác nhận rằng các file watcher có quyền truy cập thư mục và webhook có quyền truy cập mạng
:::

### Cách Hoạt Động

Mở cài đặt trigger của agent và nhấp tab \`Log\`. Mọi nỗ lực trigger được liệt kê với một trạng thái: đã kích hoạt, bị lọc hoặc thất bại. Nhấp bất kỳ mục nào để xem tại sao nó không kích hoạt. Phát hiện phổ biến nhất là một bộ lọc hơi quá nghiêm ngặt — điều chỉnh nó thường giải quyết vấn đề ngay lập tức.

:::tip
Khi thiết lập một trigger mới, hãy bắt đầu không có bất kỳ bộ lọc nào. Khi bạn xác nhận nó kích hoạt chính xác, hãy thêm các bộ lọc từng cái một. Theo cách đó bạn biết mỗi bộ lọc hoạt động như mong đợi.
:::
  `,

  "self-healing-explained": `
## Giải Thích Self-Healing

Khi có gì đó sai trong quá trình chạy agent, hệ thống self-healing cố gắng khắc phục vấn đề và thử lại tự động. Giống như có một mạng lưới an toàn bắt hầu hết các lỗi trước khi bạn nhận ra chúng. Các vấn đề phổ biến như sự cố mạng tạm thời, sự cố API ngắn hoặc giới hạn tốc độ được xử lý mà không cần sự can thiệp của bạn.

Self-healing không có nghĩa là agent của bạn không bao giờ thất bại — nó có nghĩa là nó phục hồi từ các loại vấn đề nhỏ, tạm thời mà nếu không sẽ yêu cầu bạn khởi động lại nó thủ công.

### Điểm Chính

- **Tự động thử lại** — các lỗi tạm thời được thử lại với thời gian backoff thông minh
- **Phân loại lỗi** — hệ thống phân biệt giữa các lỗi có thể sửa và không thể sửa
- **Làm mới credential** — các token hết hạn được làm mới tự động khi có thể
- **Minh bạch** — mọi hành động self-healing đều được ghi nhật ký để bạn có thể thấy điều gì đã xảy ra

### Cách Hoạt Động

Khi một lỗi xảy ra, hệ thống self-healing đánh giá nó. Các lỗi tạm thời (timeout mạng, giới hạn tốc độ, sự cố tạm thời) kích hoạt một lần thử lại tự động sau một khoảng chờ ngắn. Các lần hết hạn credential kích hoạt một nỗ lực làm mới tự động. Các lỗi vĩnh viễn (cấu hình không hợp lệ, thiếu quyền) được báo cáo cho bạn ngay lập tức vì chúng yêu cầu sự chú ý của bạn.

:::success
Khi self-healing thành công, agent tiếp tục như chưa có gì xảy ra. Nhật ký thực thi đánh dấu lỗi đã phục hồi với một huy hiệu "healed" màu xanh lá để bạn có thể thấy điều gì đã được bắt và giải quyết tự động.
:::

:::tip
Kiểm tra nhật ký self-healing thỉnh thoảng để xem điều gì đang được bắt. Nếu cùng lỗi tiếp tục được chữa lành, nó có thể chỉ ra một vấn đề cơ bản đáng để sửa vĩnh viễn.
:::
  `,

  "checking-system-health": `
## Kiểm Tra Sức Khỏe Hệ Thống

Kiểm tra sức khỏe tích hợp sẵn quét toàn bộ cài đặt Personas của bạn và báo cáo bất kỳ vấn đề nào — các thành phần lỗi thời, các tệp bị thiếu, các vấn đề cấu hình hoặc các vấn đề kết nối. Chạy nó bất cứ khi nào có gì đó cảm thấy không ổn để đánh giá nhanh trạng thái tổng thể của hệ thống.

Hãy nghĩ về nó như một chuyến thăm bác sĩ cho thiết lập Personas của bạn. Một kiểm tra nhanh có thể bắt các vấn đề nhỏ trước khi chúng trở thành các vấn đề lớn.

### Những Gì Nó Kiểm Tra

- **Phiên bản ứng dụng** — liệu bạn có đang chạy phiên bản mới nhất không
- **Tính toàn vẹn cơ sở dữ liệu** — các tệp dữ liệu cục bộ của bạn nguyên vẹn và khỏe mạnh
- **Trạng thái credential** — tất cả các credential được lưu trữ đều hợp lệ và đang hoạt động
- **Kết nối nhà cung cấp** — các nhà cung cấp AI của bạn có thể tiếp cận và đang phản hồi
- **Kết nối đám mây** — kết nối orchestrator của bạn đang hoạt động (nếu được cấu hình)

### Cách Hoạt Động

Đi tới \`Settings > System Health\` và nhấp \`Run Health Check\`. Quá trình quét mất vài giây và tạo ra một báo cáo. Các mục màu xanh lá là khỏe mạnh, các mục màu vàng cần chú ý sớm, và các mục màu đỏ cần sửa chữa ngay lập tức. Mỗi mục bao gồm một mô tả của vấn đề và một cách khắc phục được đề xuất.

:::tip
Chạy kiểm tra sức khỏe sau khi cài đặt các bản cập nhật, sau các vấn đề kết nối hoặc trước khi triển khai một agent quan trọng. Chỉ mất vài giây và mang lại cho bạn sự an tâm.
:::
  `,

  "log-files-and-debugging": `
## Tệp Nhật Ký Và Gỡ Lỗi

Các tệp nhật ký giống như một máy ghi hành trình cho cài đặt Personas của bạn. Chúng capture mọi thứ đã xảy ra — các lần chạy agent, các sự kiện hệ thống, lỗi và hơn thế nữa — theo thứ tự thời gian chi tiết. Khi có gì đó sai và nhật ký thực thi không đủ, các tệp này chứa câu chuyện đầy đủ.

Bạn không cần phải đọc nhật ký thường xuyên, nhưng việc biết chúng ở đâu và cách sử dụng chúng là vô giá khi khắc phục sự cố một vấn đề khó.

### Điểm Chính

- **Ghi nhật ký tự động** — mọi thứ đều được ghi lại mà bạn không cần bật bất cứ thứ gì
- **Được tổ chức theo ngày** — các sự kiện của mỗi ngày nằm trong một tệp riêng để dễ duyệt
- **Có thể tìm kiếm** — tìm các sự kiện cụ thể theo từ khóa, ngày hoặc mức độ nghiêm trọng
- **Có thể chia sẻ** — nếu bạn liên hệ hỗ trợ, bạn có thể chia sẻ các trích đoạn nhật ký liên quan

### Cách Hoạt Động

Các tệp nhật ký được lưu trữ cục bộ trên máy tính của bạn. Truy cập chúng từ \`Settings > Logs\` hoặc điều hướng trực tiếp đến thư mục nhật ký. Mỗi tệp bao gồm một ngày và chứa các mục có dấu thời gian. Sử dụng trình xem nhật ký tích hợp để tìm kiếm, lọc và duyệt. Đối với các yêu cầu hỗ trợ, nút \`Export Log\` tạo ra một trích đoạn có thể chia sẻ.

:::tip
Khi liên hệ hỗ trợ về một vấn đề, hãy bao gồm trích đoạn nhật ký liên quan. Nó tăng tốc đáng kể quá trình khắc phục sự cố vì team hỗ trợ có thể thấy chính xác điều gì đã xảy ra.
:::
  `,

  "resetting-to-defaults": `
## Đặt Lại Về Mặc Định

Nếu bạn đã thay đổi một cài đặt và không thể tìm ra cái gì đang gây ra vấn đề, đặt lại về mặc định mang lại cho bạn một điểm khởi đầu trong sạch. Điều này chỉ đặt lại các tùy chọn và cài đặt cấu hình của bạn — các agent, credential, bộ nhớ và dữ liệu của bạn đều được bảo toàn. Không có gì quan trọng bị mất.

Hãy nghĩ về nó như khôi phục một căn phòng về bố cục ban đầu. Tất cả đồ đạc của bạn (agent và dữ liệu) ở lại, nhưng đồ nội thất (cài đặt) trở về nơi nó bắt đầu.

:::warning
Việc đặt lại xóa tất cả các tùy chọn được tùy chỉnh trong một hành động. Điều này bao gồm chủ đề của bạn, mô hình mặc định, cài đặt thông báo và phím tắt. Các agent, credential, bộ nhớ và dữ liệu của bạn không bị ảnh hưởng — nhưng bất kỳ tùy chọn nào được điều chỉnh cẩn thận sẽ cần được cấu hình lại thủ công sau đó.
:::

### Những Gì Được Đặt Lại

- **Tùy chọn hiển thị** — chủ đề, bố cục, chiều rộng thanh bên và cài đặt trực quan
- **Mô hình mặc định** — quay lại mặc định được khuyến nghị
- **Cài đặt thông báo** — đặt lại về hành vi thông báo tiêu chuẩn
- **Phím tắt** — khôi phục về các tổ hợp phím ban đầu

### Những Gì Vẫn An Toàn

- Tất cả **agent** của bạn và các prompt, lịch sử và cấu hình của chúng
- Tất cả **credential** của bạn trong vault
- Tất cả **bộ nhớ**, kết quả kiểm thử và nhật ký thực thi của bạn
- Tất cả **pipeline** và cấu hình team của bạn

### Cách Hoạt Động

Đi tới \`Settings > Advanced > Reset to Defaults\`. Xem lại những gì sẽ được đặt lại, sau đó nhấp \`Confirm\`. Cài đặt của bạn trở về giá trị factory trong khi tất cả công việc của bạn được bảo toàn. Sau đó bạn có thể cấu hình lại các cài đặt từng cái một để xác định thay đổi nào đã gây ra vấn đề.

:::tip
Trước khi đặt lại, hãy ghi chú bất kỳ cài đặt nào bạn đã tùy chỉnh có chủ ý. Theo cách đó, bạn có thể nhanh chóng khôi phục những cài đặt bạn muốn sau khi đặt lại sửa vấn đề của bạn.
:::
  `,
};
