export const content: Record<string, string> = {
  "how-agent-memory-works": `
## Cách Bộ Nhớ Agent Hoạt Động

Các agent của bạn có thể ghi nhớ các tác vụ trước đó và học từ kinh nghiệm. Mỗi lần một agent chạy, nó có thể lưu trữ thông tin hữu ích — sự kiện, quyết định, mẫu và bài học. Hãy nghĩ về nó như một cuốn sổ tay mà agent của bạn mang từ tác vụ này sang tác vụ khác, xây dựng kiến thức theo thời gian.

Điều này có nghĩa là các agent của bạn trở nên thông minh hơn khi bạn sử dụng chúng nhiều hơn. Một agent đã xử lý hàng trăm yêu cầu khách hàng sẽ có ngữ cảnh về các vấn đề phổ biến, các giải pháp ưa thích và các quyết định trong quá khứ mà một agent hoàn toàn mới sẽ không biết.

### Điểm Chính

- Các agent **tự động học** từ mỗi tác vụ chúng hoàn thành
- Bộ nhớ tồn tại **giữa các lần chạy** — agent của bạn ghi nhớ công việc trước đó
- Mỗi bộ nhớ được **phân loại và xếp hạng** theo tầm quan trọng
- Bạn có thể **xem lại, chỉnh sửa hoặc xóa** bất kỳ bộ nhớ nào bất cứ lúc nào

### Cách Hoạt Động

Trong một lần chạy, nếu agent gặp phải điều gì đó đáng nhớ — một sự kiện hữu ích, một quyết định quan trọng hoặc một bài học — nó tạo ra một mục bộ nhớ. Lần tiếp theo agent chạy, nó có thể nhớ lại các bộ nhớ liên quan để đưa ra các quyết định tốt hơn. Bạn có toàn quyền kiểm soát để xem lại và quản lý những gì agent của bạn ghi nhớ.

:::tip
Bộ nhớ hoạt động tốt nhất khi các agent có các tác vụ nhất quán, tập trung. Một agent luôn xử lý báo cáo chi phí sẽ xây dựng các bộ nhớ hữu ích hơn một agent làm một tác vụ khác mỗi lần.
:::
  `,

  "memory-categories": `
## Danh Mục Bộ Nhớ

Các bộ nhớ được tổ chức thành năm danh mục, mỗi danh mục phục vụ một mục đích khác nhau. Cấu trúc này giúp agent của bạn nhớ lại đúng loại kiến thức vào đúng thời điểm — giống như các chương trong một cuốn sách tham khảo.

Việc hiểu các danh mục này giúp bạn xem lại và quản lý kiến thức của agent hiệu quả hơn. Mỗi danh mục cho bạn biết không chỉ *cái gì* agent biết, mà *loại kiến thức* nào.

### Năm Danh Mục

:::compare
**Fact**
Thông tin cụ thể được học từ các tác vụ. Ví dụ: "Khách hàng thích ngôn ngữ trang trọng." Các mảnh kiến thức đơn giản mà agent của bạn nhặt được.
---
**Decision**
Các lựa chọn được thực hiện và lý do đằng sau chúng. Ví dụ: "Đã chọn vận chuyển Express vì đơn hàng khẩn cấp." Ghi lại tại sao, không chỉ cái gì.
---
**Insight**
Các mẫu được phát hiện qua nhiều lần chạy. Ví dụ: "Vé hỗ trợ tăng đột biến vào mỗi sáng thứ Hai." Trở nên thông minh hơn theo thời gian.
---
**Learning**
Các bài học từ sai lầm hoặc thành công. Ví dụ: "Dòng tiêu đề ngắn hơn có tỷ lệ mở cao hơn." Cải thiện liên tục trong hành động.
---
**Warning**
Các cạm bẫy cần lưu ý. Ví dụ: "Không bao giờ gửi hóa đơn trước khi hợp đồng được ký." Ngăn agent của bạn lặp lại các sai lầm trong quá khứ.
:::

### Cách Hoạt Động

Khi một agent tạo ra một bộ nhớ, nó tự động phân loại dựa trên nội dung. Sự kiện là các mảnh thông tin đơn giản. Quyết định ghi lại các lựa chọn với lý do. Insights capture các mẫu. Learnings đến từ việc phản ánh về kết quả. Cảnh báo đánh dấu những điều cần tránh.

:::tip
Đặc biệt chú ý đến danh mục Warnings trong các lần xem xét của bạn. Các bộ nhớ này giúp agent của bạn tránh lặp lại các sai lầm trong quá khứ — chúng thường là có giá trị nhất.
:::
  `,

  "importance-levels": `
## Mức Độ Quan Trọng

Mỗi bộ nhớ có một điểm tầm quan trọng từ 1 đến 5. Điểm 1 có nghĩa là đó là thông tin thường xuyên, trong khi 5 có nghĩa là nó quan trọng. Các bộ nhớ quan trọng được nhớ lại thường xuyên hơn, tồn tại lâu hơn và được trọng số nhiều hơn khi agent đưa ra quyết định — giống như cách bạn nhớ các sự kiện lớn trong đời tốt hơn so với những gì bạn ăn cho bữa trưa thứ Ba tuần trước.

Hệ thống xếp hạng này giữ cho agent của bạn tập trung vào những gì quan trọng nhất, thay vì chìm đắm trong các chi tiết không đáng kể.

### Thang Điểm

| Mức độ | Nhãn | Ưu tiên nhớ lại | Mô tả |
|-------|-------|-----------------|-------------|
| 1 | Routine | Thấp | Các chi tiết nhỏ có thể hữu ích đôi khi |
| 2 | Useful | Vừa phải | Ngữ cảnh hữu ích làm phong phú sự hiểu biết |
| 3 | Important | Tiêu chuẩn | Kiến thức thường xuyên ảnh hưởng đến các quyết định |
| 4 | Very Important | Cao | Thông tin quan trọng mà agent gần như luôn nên xem xét |
| 5 | Critical | Luôn luôn | Kiến thức thiết yếu không bao giờ được quên hoặc bỏ qua |

### Cách Hoạt Động

Tầm quan trọng được gán tự động khi một bộ nhớ được tạo ra, dựa trên các yếu tố như tần suất thông tin được tham chiếu và mức độ nó ảnh hưởng đến kết quả. Bạn cũng có thể điều chỉnh các mức độ tầm quan trọng thủ công nếu bạn không đồng ý với việc gán tự động.

:::tip
Nếu một agent tiếp tục mắc cùng một sai lầm, hãy kiểm tra xem bộ nhớ liên quan có tồn tại không và liệu mức độ tầm quan trọng của nó có đủ cao hay không. Tăng nó lên 4 hoặc 5 đảm bảo agent chú ý đến nó.
:::
  `,

  "searching-agent-memories": `
## Tìm Kiếm Bộ Nhớ Agent

Khi các agent của bạn tích lũy kiến thức, khả năng tìm kiếm bộ nhớ của chúng trở nên thiết yếu. Gõ một từ khóa hoặc cụm từ và ngay lập tức xem mọi bộ nhớ liên quan trên tất cả các agent của bạn. Giống như tìm kiếm email của bạn — nhanh, đơn giản và bạn có thể lọc theo danh mục, tầm quan trọng hoặc ngày.

Việc tìm kiếm giúp bạn hiểu những gì các agent của bạn biết, xác minh chúng đã học chính xác và tìm thông tin cụ thể nhanh chóng.

### Điểm Chính

- **Tìm kiếm văn bản đầy đủ** — tìm các bộ nhớ theo bất kỳ từ khóa hoặc cụm từ nào chúng chứa
- **Lọc theo danh mục** — thu hẹp kết quả thành sự kiện, quyết định, hiểu biết, bài học hoặc cảnh báo
- **Lọc theo tầm quan trọng** — chỉ hiển thị các bộ nhớ ưu tiên cao hoặc ưu tiên thấp
- **Tìm kiếm chéo agent** — tìm kiếm trên tất cả các agent của bạn cùng lúc hoặc tập trung vào một

### Cách Hoạt Động

Mở phần \`Memories\` và gõ truy vấn tìm kiếm của bạn vào thanh tìm kiếm. Kết quả xuất hiện ngay lập tức với văn bản khớp được tô sáng. Sử dụng các nút lọc để thu hẹp theo danh mục, mức độ tầm quan trọng, phạm vi ngày hoặc agent cụ thể. Nhấp vào bất kỳ kết quả nào để xem bộ nhớ đầy đủ với tất cả ngữ cảnh của nó.

:::tip
Tìm kiếm chủ đề trước khi tạo một bộ nhớ thủ công. Agent của bạn có thể đã biết những gì bạn sắp dạy nó — trong trường hợp đó, bạn có thể chỉ cần cập nhật bộ nhớ hiện có.
:::
  `,

  "creating-memories-manually": `
## Tạo Bộ Nhớ Thủ Công

Đôi khi bạn muốn agent của mình biết điều gì đó trước khi nó tự học — giống như tóm tắt cho một nhân viên mới vào ngày đầu tiên. Bộ nhớ thủ công cho phép bạn dạy các agent của mình các sự kiện, sở thích hoặc quy tắc cụ thể trực tiếp, cho chúng một khởi đầu thuận lợi về kiến thức mà chúng sẽ phải khám phá qua kinh nghiệm.

Điều này đặc biệt hữu ích cho thông tin dành riêng cho công ty, sở thích cá nhân hoặc các quy tắc quan trọng không bao giờ nên được học qua thử và sai.

:::steps
1. **Mở phần Memories** — nhấp \`Memories\` trong thanh bên và sau đó \`Add Memory\`
2. **Chọn danh mục** — chọn sự kiện, quyết định, hiểu biết, bài học hoặc cảnh báo
3. **Viết nội dung bộ nhớ** — mô tả kiến thức bằng ngôn ngữ đơn giản
4. **Đặt mức độ tầm quan trọng** — gán một điểm từ 1 (thường xuyên) đến 5 (quan trọng)
5. **Gán cho một agent** — chọn một agent cụ thể hoặc làm cho bộ nhớ có sẵn cho tất cả các agent
:::

### Cách Hoạt Động

Bộ nhớ bạn tạo ra được thêm vào cơ sở kiến thức của agent giống như một bộ nhớ được học tự động. Lần tiếp theo agent chạy, nó có thể truy cập thông tin này cùng với mọi thứ nó đã tự học. Các bộ nhớ thủ công được đánh dấu bằng một biểu tượng nhỏ để bạn có thể phân biệt chúng với các bộ nhớ tự động.

:::tip
Tạo một vài bộ nhớ "Warning" cho các quy tắc quan trọng nhất của bạn trước khi một agent đi vào hoạt động. Ví dụ: "Không bao giờ chia sẻ thông tin định giá mà không có sự chấp thuận của quản lý."
:::
  `,

  "memory-tiers-explained": `
## Giải Thích Các Tầng Bộ Nhớ

Không phải tất cả các bộ nhớ đều được tạo ra như nhau, và không phải tất cả chúng đều cần truy cập ngay lập tức. Personas tổ chức các bộ nhớ thành bốn tầng dựa trên tần suất chúng được sử dụng và mức độ quan trọng của chúng. Hãy nghĩ về nó như một hệ thống lưu trữ: các mục được sử dụng nhiều nhất nằm trên bàn của bạn, các mục ít được sử dụng hơn vào ngăn kéo, và các mục hiếm khi cần được nộp vào tủ.

Hệ thống nhiều tầng này giữ cho agent của bạn nhanh và hiệu quả. Nó nhớ lại các bộ nhớ liên quan nhất ngay lập tức trong khi vẫn có quyền truy cập vào kiến thức cũ hơn khi cần.

### Bốn Tầng

:::diagram
[Working (session)] --> [Active (frequent)] --> [Core (pinned)]
:::

:::compare
**Core**
Luôn được tải. Các quy tắc và sự kiện quan trọng vĩnh viễn. Được ghim thủ công và không bao giờ bị hạ cấp. Kiến thức quan trọng nhất của agent của bạn.
---
**Active**
Được tải khi nhớ lại. Các bộ nhớ gần đây được truy cập thường xuyên. Tự động được thăng tiến theo tần suất sử dụng. "Ngăn kéo bàn" của ngữ cảnh hữu ích.
---
**Working**
Có phạm vi phiên. Các bộ nhớ từ tác vụ hiện tại hoặc các phiên gần đây. Được tạo ra trong khi thực thi và lão hóa thành Active theo thời gian.
---
**Archive**
Chỉ theo yêu cầu. Các bộ nhớ cũ hơn không được truy cập gần đây. Tự động được hạ cấp sau thời gian không hoạt động nhưng được bảo toàn vô thời hạn. Không có gì bị mất.
:::

### Cách Hoạt Động

Các bộ nhớ di chuyển giữa các tầng tự động dựa trên các mẫu sử dụng. Một bộ nhớ thường xuyên được nhớ lại sẽ được thăng tiến lên tầng cao hơn; một bộ nhớ không được truy cập trong một thời gian sẽ dần dần di chuyển về phía archive. Bạn cũng có thể ghim các bộ nhớ thủ công vào tầng Core để đảm bảo chúng luôn ở đầu tâm trí của agent.

:::tip
Ghim các quy tắc và sự kiện quan trọng nhất của bạn vào tầng Core. Điều này đảm bảo agent của bạn luôn xem xét chúng, bất kể chúng cũ đến mức nào.
:::
  `,

  "memory-and-execution": `
## Bộ Nhớ Và Thực Thi

Khi agent của bạn bắt đầu một tác vụ mới, nó không bắt đầu với một trang trắng. Nó tự động nhớ lại các bộ nhớ liên quan từ các lần chạy trước đó, mang ngữ cảnh, sở thích và các bài học vào lần thực thi hiện tại. Điều này làm cho mỗi lần chạy được thông báo nhiều hơn lần trước.

Quá trình nhớ lại là thông minh — nó không vứt mọi bộ nhớ cùng một lúc. Thay vào đó, nó chọn những bộ nhớ liên quan nhất đến tác vụ hiện tại, giống như cách bạn tự nhiên nhớ lại các kinh nghiệm liên quan khi đối mặt với một tình huống quen thuộc.

### Điểm Chính

- **Nhớ lại tự động** — các bộ nhớ liên quan được tải trước mỗi lần thực thi
- **Nhận biết ngữ cảnh** — chỉ các bộ nhớ liên quan đến tác vụ hiện tại được nhớ lại
- **Được trọng số theo tầm quan trọng** — các bộ nhớ tầm quan trọng cao hơn có nhiều khả năng được nhớ lại hơn
- **Tạo bộ nhớ** — các bộ nhớ mới có thể được tạo trong quá trình thực thi dựa trên kết quả

### Cách Hoạt Động

Trước khi agent của bạn xử lý tác vụ của nó, hệ thống bộ nhớ quét các mục liên quan dựa trên nội dung và ngữ cảnh của tác vụ. Các bộ nhớ này được cung cấp cho mô hình AI cùng với các hướng dẫn của bạn. Sau khi tác vụ hoàn thành, agent đánh giá xem có học được điều gì mới không và tạo ra các bộ nhớ tương ứng.

:::tip
Nếu một agent không sử dụng các bộ nhớ của nó hiệu quả, hãy kiểm tra rằng các bộ nhớ được phân loại và chấm điểm chính xác. Các bộ nhớ được tổ chức tốt được nhớ lại đáng tin cậy hơn.
:::
  `,

  "reviewing-and-cleaning-memories": `
## Xem Xét Và Dọn Dẹp Bộ Nhớ

Theo thời gian, một số bộ nhớ trở nên lỗi thời, không chính xác hoặc dư thừa. Việc xem xét thường xuyên giữ cho cơ sở kiến thức của agent của bạn chính xác và cập nhật. Hãy nghĩ về nó như tổng vệ sinh mùa xuân cho não của agent — xóa thông tin cũ để agent của bạn đưa ra quyết định dựa trên kiến thức hiện tại, chính xác.

Một cơ sở bộ nhớ sạch dẫn đến hiệu suất agent tốt hơn. Một agent dựa vào thông tin lỗi thời có thể đưa ra quyết định kém mà không nhận ra tại sao.

### Điểm Chính

- **Duyệt tất cả các bộ nhớ** với các tùy chọn sắp xếp và lọc
- **Chỉnh sửa** bất kỳ bộ nhớ nào để sửa các điểm không chính xác hoặc cập nhật thông tin lỗi thời
- **Xóa** các bộ nhớ không còn liên quan
- **Hợp nhất** các bộ nhớ trùng lặp hoặc tương tự vào một mục rõ ràng

### Cách Hoạt Động

Mở phần \`Memories\` và duyệt danh sách bộ nhớ của agent. Sắp xếp theo ngày, tầm quan trọng hoặc danh mục để tập trung vào việc xem xét của bạn. Nhấp vào bất kỳ bộ nhớ nào để chỉnh sửa nội dung, thay đổi mức độ tầm quan trọng hoặc xóa. Hệ thống cũng đề xuất các bản trùng lặp tiềm năng có thể được hợp nhất.

:::tip
Lên lịch xem xét hàng tháng cho các bộ nhớ của các agent hoạt động nhất của bạn. Ngay cả 15 phút dọn dẹp cũng có thể cải thiện đáng kể chất lượng ra quyết định của agent.
:::
  `,

  "exporting-and-importing-memories": `
## Xuất Và Nhập Bộ Nhớ

Bạn có thể xuất toàn bộ cơ sở bộ nhớ của agent ra một tệp — hoàn hảo cho việc sao lưu, chia sẻ kiến thức giữa các agent hoặc chuyển sang máy tính mới. Việc nhập tải một tệp đã xuất trước đó và thêm các bộ nhớ đó vào cơ sở kiến thức của agent đích.

Tính năng này cũng tuyệt vời để cho một agent mới hưởng lợi từ kinh nghiệm của một agent khác. Xuất từ agent có kinh nghiệm của bạn, nhập vào agent mới và nó bắt đầu với một kho kiến thức thay vì một trang trắng.

### Điểm Chính

- **Xuất ra tệp** — lưu tất cả các bộ nhớ dưới dạng một tệp di động bạn có thể lưu trữ hoặc chia sẻ
- **Nhập từ tệp** — tải các bộ nhớ vào bất kỳ agent nào trên bất kỳ thiết bị nào
- **Xuất có chọn lọc** — chọn các danh mục cụ thể hoặc mức độ tầm quan trọng để xuất
- **Xử lý xung đột** — các bản trùng lặp được phát hiện và hợp nhất trong quá trình nhập

### Cách Hoạt Động

Mở cài đặt bộ nhớ của một agent và nhấp \`Export\`. Chọn các bộ nhớ nào để bao gồm (tất cả hoặc được lọc theo danh mục/tầm quan trọng) và lưu tệp. Để nhập, mở cài đặt bộ nhớ của agent đích, nhấp \`Import\` và chọn tệp của bạn. Personas phát hiện các bản trùng lặp và cho phép bạn quyết định cách xử lý chúng.

:::tip
Trước một thay đổi lớn đối với prompt của một agent, hãy xuất các bộ nhớ của nó dưới dạng sao lưu. Nếu prompt mới tạo ra sự nhầm lẫn, bạn có thể khôi phục các bộ nhớ ban đầu.
:::
  `,

  "memory-best-practices": `
## Thực Hành Tốt Nhất Về Bộ Nhớ

Tận dụng tối đa bộ nhớ agent đến từ một vài thói quen chính. Giống như thói quen học tập tốt cho một học sinh, cách bạn cấu trúc và duy trì bộ nhớ tạo nên sự khác biệt lớn về cách các agent của bạn học và nhớ lại thông tin hiệu quả như thế nào.

Tuân theo các hướng dẫn này để xây dựng các agent thực sự cải thiện theo thời gian thay vì tích lũy lộn xộn.

### Thực Hành Tốt Nhất

- **Giữ các agent tập trung** — một agent với một tác vụ nhất quán xây dựng các bộ nhớ hữu ích hơn một generalist
- **Xem xét thường xuyên** — kiểm tra các bộ nhớ hàng tháng và loại bỏ các mục lỗi thời hoặc không chính xác
- **Sử dụng bộ nhớ thủ công cho các quy tắc quan trọng** — đừng chờ agent học điều gì đó theo cách khó khăn
- **Đặt các mức độ tầm quan trọng phù hợp** — không phải mọi thứ đều quan trọng, và điều đó cũng được
- **Ghim kiến thức thiết yếu** vào tầng Core để nó luôn có sẵn

### Cách Hoạt Động

Quản lý bộ nhớ tốt là một thực hành liên tục, không phải một thiết lập một lần. Bắt đầu bằng cách tạo một vài bộ nhớ thủ công cho các quy tắc quan trọng nhất của bạn. Để agent học một cách tự nhiên từ các lần chạy của nó. Xem xét định kỳ để sửa các sai lầm và loại bỏ thông tin lỗi thời. Điều chỉnh các mức độ tầm quan trọng khi sự hiểu biết của bạn về những gì quan trọng phát triển.

:::tip
Hãy nghĩ về quản lý bộ nhớ như chăm sóc một khu vườn. Những nỗ lực nhỏ thường xuyên — cắt tỉa, tưới nước, trồng lại — tạo ra kết quả tốt hơn nhiều so với các đợt đại tu lớn thỉnh thoảng.
:::
  `,
};
