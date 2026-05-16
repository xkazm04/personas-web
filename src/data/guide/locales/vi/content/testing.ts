export const content: Record<string, string> = {
  "why-test-your-agents": `
## Tại Sao Kiểm Thử Agent Của Bạn?

Kiểm thử là cách bạn giữ cho các agent đáng tin cậy khi bạn lặp lại. Mỗi lần chỉnh sửa prompt, mỗi lần hoán đổi mô hình, mỗi công cụ mới bạn thêm vào đều thay đổi hành vi của agent theo những cách bạn không thể hoàn toàn dự đoán từ việc đọc diff. Kiểm thử biến sự không chắc chắn đó thành bằng chứng: chạy phiên bản mới với các đầu vào đại diện, so sánh với phiên bản trước đó, xem liệu bạn đã cải thiện những điều bạn dự định và không thoái lui những điều bạn không có ý định.

Tab Lab trên trình chỉnh sửa của mỗi agent là nơi điều này xảy ra. Nó có bốn chế độ — Arena, A-B, Matrix, Eval — mỗi chế độ trả lời một câu hỏi khác nhau. Arena so sánh các mô hình trên cùng một prompt. A-B so sánh hai prompt trên cùng một mô hình. Matrix kiểm thử các tổ hợp thành phần prompt. Eval là lưới đầy đủ: mỗi prompt × mỗi mô hình.

### Điểm Chính

- **Bắt thoái lui sớm** — kiểm thử sau mỗi thay đổi là cách bạn tránh "agent đã từng hoạt động, tôi đã làm hỏng gì?"
- **So sánh các lựa chọn thay thế một cách có hệ thống** — Arena và A-B cho phép bạn chọn giữa các tùy chọn bằng bằng chứng thay vì cảm giác
- **Tạo dữ liệu fitness** — các lần chạy Lab tích lũy điểm cho mỗi prompt cung cấp cho genome evolution (gói Builder)
- **Các bộ đầu vào có thể tái sử dụng** — các đầu vào kiểm thử được lưu cho mỗi agent; cùng các prompt, cùng dữ liệu, so sánh có thể lặp lại

### Cách Hoạt Động

Mỗi chế độ Lab gửi cùng payload trigger đến nhiều biến thể agent (các prompt khác nhau, các mô hình khác nhau, hoặc cả hai) song song. Các đầu ra được trình bày song song với metadata định lượng (thời lượng, chi phí, số token) và các nút đánh giá chủ quan của bạn. Kết quả nằm trong lịch sử kiểm thử của agent và đẩy về phía trước trong chấm điểm fitness.

:::tip
Khoảnh khắc rẻ nhất để bắt một thoái lui prompt là ngay sau khi bạn viết nó. Hãy biến Lab → A-B so với phiên bản prompt trước đó thành thói quen của bạn trên mỗi lần chỉnh sửa prompt; ma sát thấp hơn nhiều so với việc phát hiện một thoái lui trong các lần chạy production ba ngày sau.
:::
  `,

  "the-testing-lab-overview": `
## Tổng Quan Testing Lab

Tab Lab trên trình chỉnh sửa của mỗi agent là một không gian làm việc với bốn chế độ. Chọn chế độ theo những gì bạn đang cố gắng tìm hiểu:

### Bốn Chế Độ

:::compare
**Arena**
Cùng một prompt, nhiều mô hình. Gửi một đầu vào qua Claude / GPT / Gemini / cục bộ song song. Tốt nhất cho "mô hình nào phù hợp với agent này?"
---
**A-B**
Hai prompt, cùng một mô hình. So sánh một thay đổi prompt với phiên bản trước đó dưới điều kiện giống hệt nhau. Tốt nhất cho "lần chỉnh sửa này có cải thiện mọi thứ không?"
---
**Matrix**
Tổ hợp. Xác định các thành phần prompt và matrix kiểm thử mọi tổ hợp (3 × 4 = 12 biến thể). Tốt nhất cho "tôi có nhiều ý tưởng cạnh tranh — tổ hợp nào thắng?"
---
**Eval**
Lưới đầy đủ: N prompt × M mô hình. Bức tranh hoàn chỉnh khi bạn muốn tối ưu hóa prompt *và* mô hình cùng nhau. Tốt nhất khi một thay đổi lớn đang được xem xét.
:::

### Cách Hoạt Động

Mỗi chế độ chia sẻ cùng bộ chọn đầu vào (nhập thủ công, dán JSON có cấu trúc hoặc phát lại một lần thực thi thực trong quá khứ từ lịch sử của agent này) và cùng UI đánh giá. Các cột đầu ra mở rộng cho trace đầy đủ (gọi mô hình, gọi công cụ, nhánh quyết định) giống như một lần thực thi thông thường. Kết quả được lưu vào lịch sử kiểm thử với chế độ kiểm thử được gắn thẻ, vì vậy bạn có thể duyệt các kiểm thử trong quá khứ theo chế độ.

Đối với các agent được chain, Lab kiểm thử chỉ agent này — ngược dòng được mock bằng đầu vào bạn đã chỉ định, vì vậy bạn có thể lặp lại trên một giai đoạn của pipeline mà không cần chạy lại toàn bộ chain.

:::tip
Hầu hết các tuần, Arena và A-B là đủ. Matrix là cho "tôi có ba refactor hợp lý và muốn so sánh", Eval là cho "tôi đang xem xét một viết lại lớn hoặc thay đổi gói". Đừng với tới chế độ nặng theo mặc định — các chế độ rẻ hơn thường đủ.
:::
  `,

  "arena-testing": `
## Kiểm Thử Arena

Arena gửi cùng prompt và cùng đầu vào đến nhiều mô hình song song, sau đó đặt các kết quả ra song song. Chi phí và thời lượng được hiển thị cùng với các đầu ra để bạn so sánh trên ba trục — chất lượng (đánh giá của bạn), tốc độ (được đo bởi engine) và chi phí (token-by-token).

Cách sử dụng phổ biến nhất là quyết định lựa chọn mô hình: "agent này đã chạy trên Sonnet 4.6, liệu Haiku 4.5 có giữ vững với 1/30 chi phí không?" Arena trả lời điều đó trong một bài kiểm thử thay vì hàng tuần quan sát production.

### Điểm Chính

- **Gửi song song** — tất cả các mô hình chạy cùng một lúc; tổng thời gian thực = mô hình chậm nhất, không phải tổng
- **Đầu ra song song** — đầu ra đầy đủ của mỗi mô hình có thể nhìn thấy mà không cần chuyển tab
- **Chi phí + thời lượng được hiển thị** — dưới mỗi đầu ra, trong cùng chế độ xem với văn bản
- **UI đánh giá cho mỗi cột** — thumbs-up / thumbs-down / sao cho mỗi mô hình; các đánh giá tồn tại vào dữ liệu fitness của agent
- **Phát lại từ lịch sử** — các bài kiểm thử Arena có thể kéo đầu vào từ bất kỳ lần thực thi nào trong quá khứ của agent này, vì vậy bạn đang kiểm thử trên hình dạng thực

### Cách Hoạt Động

Arena gửi một lần thực thi cho mỗi mô hình đã chọn bằng cách sử dụng cấu hình prompt và công cụ hiện tại của agent. Mỗi lần thực thi là độc lập (trace riêng, kế toán chi phí riêng) và được gắn thẻ \`arena\` để nó không tính vào các chỉ số production thông thường của agent. Kết quả xuất hiện dưới dạng các cột; bạn đánh giá từng cột; các đánh giá cung cấp vào dữ liệu fitness theo từng mô hình cho agent này.

:::tip
Chọn tối đa 3 mô hình cho mỗi lần chạy Arena. Nhiều hơn thế và việc đọc song song trở nên khó kiểm soát. Nếu bạn đang xem xét 5+ mô hình, hãy chạy nhiều Arena theo cặp và giữ một ghi chú tinh thần về mô hình nào thắng mỗi vòng.
:::
  `,

  "ab-testing-prompts": `
## Kiểm Thử A-B Prompt

A-B chạy cùng đầu vào qua hai biến thể prompt trên cùng một mô hình, vì vậy biến số duy nhất là prompt. Đây là công cụ phù hợp để đánh giá một lần chỉnh sửa prompt: tải phiên bản trước đó làm A, phiên bản mới làm B, chạy trên các đầu vào đại diện và xem cái nào tạo ra kết quả bạn muốn.

Bộ chọn phiên bản của Lab tích hợp với lịch sử phiên bản của prompt — bạn không cần copy-paste phiên bản cũ, chỉ cần chọn nó từ dropdown. Điều này làm cho "so sánh bản nháp hiện tại của tôi với phiên bản hoạt động tuần trước" trở thành thiết lập một cú nhấp chuột.

### Điểm Chính

- **Hai prompt, một mô hình, một đầu vào** — so sánh đơn biến
- **Chọn từ lịch sử phiên bản** — A hoặc B có thể là bất kỳ phiên bản nào trong quá khứ của prompt của agent này
- **Cùng độ trung thực trace** — cả hai biến thể đều nhận được trace thực thi đầy đủ, vì vậy bạn có thể so sánh các mẫu gọi công cụ, không chỉ đầu ra cuối cùng
- **Nhiều vòng đầu vào** — chạy A-B với nhiều đầu vào khác nhau theo trình tự để kiểm thử khả năng tổng quát hóa, không chỉ một trường hợp may mắn
- **Điểm tồn tại vào fitness** — các đánh giá A-B cung cấp cùng dữ liệu fitness mà Arena và genome sử dụng

### Cách Hoạt Động

Engine A-B gửi cả hai prompt như các lần thực thi độc lập và gắn nhãn chúng A và B trong bảng kết quả. Ngoài điều đó, chúng là các lần thực thi thông thường — cùng trace, cùng kế toán chi phí, nhưng được gắn thẻ \`ab_test\` để chúng có thể lọc được trong lịch sử kiểm thử và không làm ô nhiễm các chỉ số production.

:::code-compare
### Phiên bản A
Summarize the document.
Keep it short.
---
### Phiên bản B
Summarize the document in exactly
3 bullet points. Each bullet should
be one sentence. Start with the
most important finding.
:::

:::warning
Thay đổi một thứ cho mỗi vòng A-B. Nếu B khác với A về *cả* định dạng *và* tông *và* độ dài, bạn không thể biết chiều nào đã gây ra thay đổi điểm. Thực hiện một thay đổi, chạy A-B, chấp nhận hoặc từ chối, sau đó thực hiện thay đổi tiếp theo.
:::
  `,

  "matrix-testing": `
## Kiểm Thử Matrix

Matrix là A-B-C-D-… tổ hợp tất cả cùng một lúc. Bạn xác định prompt của mình dưới dạng các thành phần (intro × hướng dẫn × định dạng đầu ra, chẳng hạn) và matrix tạo ra mọi tổ hợp, gửi tất cả chúng và xếp hạng kết quả theo điểm fitness.

Với 3 thành phần với 3 tùy chọn mỗi cái, đó là 27 tổ hợp — nhiều hơn nhiều so với những gì bạn sẽ kiểm thử thủ công nhưng dễ dàng để engine fan out song song. Matrix hữu ích nhất khi bạn có nhiều ý tưởng cạnh tranh về cách cấu trúc một prompt và muốn tìm tổ hợp thực sự hoạt động tốt nhất thay vì cái bạn đã đoán.

### Điểm Chính

- **Xác định các thành phần, lấy các tổ hợp** — matrix mở rộng các thành phần thành tất cả các tổ hợp hợp lệ
- **Gửi song song** — mỗi tổ hợp chạy đồng thời (tùy thuộc vào giới hạn tốc độ của nhà cung cấp)
- **Kết quả được xếp hạng** — lưới được chấm điểm fitness, được sắp xếp từ tốt nhất đến tệ nhất
- **Quy gán cấp thành phần** — xem các thành phần nào tương quan với điểm cao; hữu ích ngay cả khi bạn không áp dụng người chiến thắng đứng đầu nguyên văn
- **Lưu tổ hợp chiến thắng** — một cú nhấp chuột để đặt tổ hợp chiến thắng làm prompt hoạt động của agent

### Cách Hoạt Động

Bạn xác định mỗi thành phần như một tập hợp các biến thể được gắn nhãn trong tab matrix. Engine xây dựng mọi tổ hợp dưới dạng một prompt có thể render và gửi mỗi cái như một lần thực thi độc lập. Kết quả được tổng hợp thành một lưới được xếp hạng bởi tín hiệu fitness bạn chọn (đánh giá, chi phí trên chất lượng, tốc độ, tùy chỉnh). Quy gán cấp thành phần được tính bằng cách lấy trung bình fitness trên các tổ hợp chia sẻ thành phần đó — vì vậy ngay cả khi không có người chiến thắng duy nhất nổi bật, bạn học được phong cách intro / hướng dẫn / định dạng đầu ra nào hoạt động tốt nhất trung bình.

:::info
Với 3 thành phần × 3 tùy chọn = 27 biến thể. Với 4 × 4 = 256. Matrix có thể xử lý các lưới lớn nhưng bạn sẽ đốt token theo tỷ lệ. Bắt đầu với 3 × 3 và chỉ mở rộng nếu kết quả thực sự mơ hồ.
:::

:::tip
Matrix hữu ích nhất ngay sau một thiết kế lại lớn của prompt. Khi bạn không chắc liệu cấu trúc mới có tốt hơn cũ hay không, hãy kiểm thử matrix 3-4 cấu trúc ứng viên đối với một vài đầu vào đại diện — người chiến thắng thường rõ ràng hơn bạn mong đợi.
:::
  `,

  "eval-testing": `
## Kiểm Thử Eval

Eval là lưới đầy đủ: mỗi biến thể prompt × mỗi mô hình. Bạn chọn các prompt (thường 2-3 ứng viên), chọn các mô hình (thường 2-4) và lưới eval chạy tất cả các tổ hợp và trình bày một heatmap điểm số. Cặp prompt-mô hình tốt nhất được làm nổi bật.

Đây là chế độ nặng — tốn kém nhất về token, kỹ lưỡng nhất về phạm vi. Sử dụng nó khi bạn đang đưa ra một quyết định lớn ảnh hưởng đến cả hai trục: "chúng ta đang xem xét viết lại prompt và chuyển sang một mô hình rẻ hơn, chúng ta có thể làm cả hai cùng một lúc và vẫn đạt được mức chất lượng của chúng ta không?"

### Điểm Chính

- **N prompt × M mô hình** — heatmap điểm số trên cả hai chiều
- **Tổ hợp tốt nhất được làm nổi bật** — được xếp hạng fitness, với ô tối ưu được gọi ra trực quan
- **Phân tích theo trục** — xem liệu thay đổi prompt hay thay đổi mô hình đã thúc đẩy thay đổi điểm
- **Được gắn thẻ lịch sử kiểm thử** — các lần chạy eval nằm trong lịch sử dưới thẻ \`eval\` để xem xét sau
- **Áp dụng một cú nhấp chuột** — áp dụng tổ hợp tốt nhất (phiên bản prompt + lựa chọn mô hình) cho agent trực tiếp

### Cách Hoạt Động

Eval gửi \`prompts × models\` lần thực thi song song (tùy thuộc vào giới hạn tốc độ của nhà cung cấp). Mỗi ô là một lần thực thi độc lập với trace riêng. Chế độ xem lưới tổng hợp theo cặp prompt-mô hình; bạn đánh giá các ô bằng cùng UI như Arena và A-B; các điểm fitness cuộn lên thành xếp hạng cho mỗi ô. Ô đầu là tổ hợp được đề xuất — áp dụng nó trực tiếp từ chế độ xem lưới.

:::warning
Eval là chế độ tốn kém nhất. 3 prompt × 4 mô hình × 5 đầu vào = 60 lần thực thi, mỗi lần với cuộc gọi mô hình riêng. Chạy tiết kiệm, trên các bộ đầu vào đại diện, và chỉ khi quyết định thực sự bao gồm cả hai trục. Cho các quyết định chỉ về prompt, A-B; cho các quyết định chỉ về mô hình, Arena.
:::
  `,

  "rating-and-scoring-results": `
## Đánh Giá Và Chấm Điểm Kết Quả

Sau bất kỳ bài kiểm thử Lab nào, mỗi hàng đầu ra có các điều khiển đánh giá: thumbs-up / thumbs-down để đánh giá nhị phân, hoặc thang điểm 1-5 sao cho các trường hợp tinh tế. Các đánh giá của bạn cung cấp hai thứ: điểm fitness cho mỗi biến thể của agent (được sử dụng để xếp hạng trong matrix và eval, và như áp lực lựa chọn genome-evolution trên gói Builder), và một tín hiệu sở thích cá nhân trên tất cả các kiểm thử của bạn theo thời gian.

Các đánh giá là cá nhân — chúng mã hóa phán đoán của bạn về chất lượng, không phải một chỉ số khách quan. Điều đó là cố ý; bạn là người biết liệu đầu ra của agent có khớp với những gì bạn cần hay không, và đó là tín hiệu mà hệ thống tối ưu hóa.

### Điểm Chính

- **Nhị phân hoặc 1-5 sao** — chọn bất kỳ thang điểm nào bạn cảm thấy thoải mái nhất quán với
- **Đánh giá cho mỗi đầu ra** — mỗi đầu ra kiểm thử có hàng điều khiển đánh giá riêng; không có gì được tổng hợp tự động cho đến khi bạn đánh giá
- **Thúc đẩy điểm fitness** — các đánh giá cung cấp tín hiệu fitness cho mỗi biến thể mà Matrix / Eval / genome sử dụng
- **Lịch sử phản hồi tồn tại** — mọi đánh giá bạn đã từng cho đều được lưu trữ; hữu ích cho "tôi đã đánh giá X cao hơn Y trong các kiểm thử trước đây không?"
- **Tính nhất quán quan trọng hơn độ chính xác** — một 4 sao bạn sẽ cho nhất quán hữu ích hơn một 5 sao bạn cho một lần và không bao giờ nữa

### Cách Hoạt Động

Các đánh giá được lưu trữ đối với lần thực thi cụ thể (trace, phiên bản prompt, mô hình, đầu vào). Bộ tổng hợp fitness đọc các đánh giá + các chỉ số khách quan (chi phí, thời lượng, thành công) và tính một điểm fitness cho mỗi biến thể được sử dụng trong xếp hạng. Genome evolution (gói Builder) sử dụng các đánh giá làm áp lực lựa chọn chính để chọn các prompt cha mẹ để lai tạo.

:::tip
Đánh giá dựa trên những gì bạn thực sự muốn, không phải những gì ấn tượng về mặt kỹ thuật. Một câu trả lời ngắn chính xác thường đánh bại một câu dài hoành tráng. Hệ thống tối ưu hóa theo sở thích của bạn, vì vậy các đánh giá trung thực, nhất quán tạo ra các agent được điều chỉnh theo phán đoán của *bạn*.
:::
  `,

  "genome-evolution-basics": `
## Cơ Bản Về Genome Evolution

Genome evolution (gói Builder) tự động lai tạo các biến thể prompt mới từ các kiểm thử trước đây được đánh giá cao nhất của bạn. Mỗi "thế hệ" đột biến và tái tổ hợp các prompt hoạt động tốt nhất từ thế hệ trước đó; qua nhiều thế hệ, các prompt hội tụ trên các cấu hình ghi điểm nhất quán tốt hơn điểm khởi đầu của bạn. Đó là tìm kiếm tiến hóa với các đánh giá của bạn làm hàm fitness.

Quá trình không giám sát khi bạn bắt đầu. Bạn cung cấp prompt khởi đầu và tín hiệu fitness (thường là lịch sử đánh giá của bạn cộng với các chỉ số khách quan tùy chọn như chi phí hoặc thời lượng), đặt kích thước quần thể và số thế hệ, và để nó chạy. Các trigger thông thường của agent vẫn tạm dừng trong tiến hóa để giữ cho so sánh sạch sẽ.

:::info
Genome evolution không giám sát khi được khởi động. Bạn đặt các tham số, engine tạo các biến thể, kiểm thử chúng đối với tập đầu vào của bạn, chấm điểm chúng theo đánh giá của bạn và tái tổ hợp những người chiến thắng thành thế hệ tiếp theo. Bạn xem xét quần thể cuối cùng và áp dụng người chiến thắng thủ công — hệ thống không bao giờ âm thầm thay đổi prompt trực tiếp của bạn.
:::

### Điểm Chính

- **Biến đổi + lựa chọn tự động** — engine tạo các đột biến của các cha mẹ hoạt động tốt nhất và chọn qua fitness
- **Thế hệ + quần thể** — cấu hình điển hình là 5-10 thế hệ của 8-12 biến thể mỗi cái
- **Hàm fitness = các đánh giá của bạn** — tín hiệu chính; các tín hiệu phụ (chi phí, thời lượng) là các trọng số có thể cấu hình
- **Tất cả các thế hệ được phiên bản hóa** — mọi prompt được tạo ra đều được bảo toàn trong lịch sử phiên bản của agent; không có gì bị mất
- **Áp dụng thủ công** — engine không bao giờ âm thầm hoán đổi prompt trực tiếp của bạn; bạn xem xét và áp dụng người chiến thắng

### Cách Hoạt Động

Mỗi thế hệ bắt đầu với một quần thể cha mẹ. Engine tạo các biến thể con thông qua các đột biến có cấu trúc nhỏ (viết lại, sắp xếp lại các phần, điều chỉnh các ví dụ, v.v.) và crossover (kết hợp các đoạn từ hai cha mẹ). Mỗi đứa trẻ chạy đối với tập đầu vào của bạn; các đánh giá tạo ra điểm fitness; các con có điểm cao nhất trở thành quần thể cha mẹ cho thế hệ tiếp theo. Sau số thế hệ được cấu hình, bạn thấy quần thể được xếp hạng cuối cùng và có thể áp dụng bất kỳ biến thể nào.

### Xem Thực Tế

:::usecases
**Điều chỉnh phân loại email**
Prompt hiện tại phân loại sai 15% email
---
Chạy 5 thế hệ của quần thể 10. Kết thúc với một biến thể phân loại sai 3% — áp dụng với một cú nhấp chuột.
===
**Tính nhất quán định dạng**
Định dạng đầu ra của agent không nhất quán trên các hình dạng đầu vào
---
Genome tiến hóa trên một tập đầu vào đa dạng với sự tuân thủ định dạng làm tín hiệu fitness; đầu ra ổn định.
===
**Giảm chi phí mà không mất chất lượng**
Bạn muốn tìm một prompt gọn nhẹ hơn vẫn tạo ra đầu ra tốt
---
Thêm chi phí trên token vào hàm fitness với trọng số âm; tiến hóa tìm thấy các prompt ngắn hơn duy trì đánh giá.
:::

:::info
Mỗi biến thể được tạo ra trong quá trình tiến hóa đều được phiên bản hóa trong lịch sử prompt của agent. Nếu biến thể N+1 đã áp dụng hóa ra hoạt động xấu trong production, việc khôi phục biến thể N là một cú nhấp chuột — không có công việc nào bị mất.
:::

:::tip
Kiên nhẫn được đền đáp. Thế hệ 1 thường không tốt hơn đáng kể so với prompt khởi đầu của bạn — các đột biến nhỏ và nhiều là tệ. Đến thế hệ 3-4, quần thể sống sót tập trung vào những cải tiến thực tế; đó là khi bạn thường sẽ thấy một người chiến thắng rõ ràng.
:::
  `,

  "running-a-breeding-cycle": `
## Chạy Một Chu Kỳ Lai Tạo

Một "chu kỳ lai tạo" là một lần chạy tiến hóa đầy đủ: chọn agent, đặt các tham số, khởi động, chờ, xem lại quần thể, áp dụng. Mỗi chu kỳ là N thế hệ của M biến thể được kiểm thử đối với tập đầu vào bạn đã chọn. Tổng chi phí xấp xỉ \`thế hệ × quần thể × số đầu vào × chi phí cho mỗi lần chạy\` — có thể dự đoán từ các tham số.

Tab Genome trên Lab là điểm vào. Nó mở với các tham số mặc định được điều chỉnh cho một điểm khởi đầu đại diện (5 thế hệ × 10 biến thể × 5 đầu vào), đủ để thấy thay đổi có ý nghĩa mà không đốt quá nhiều token. Điều chỉnh các tham số trước khi khởi động nếu bạn muốn một chu kỳ nặng hơn hoặc nhẹ hơn.

:::steps
1. **Mở Lab → Genome** trên agent bạn muốn tiến hóa
2. **Chọn tập đầu vào** — nhập thủ công, một tập đã lưu hoặc phát lại từ lịch sử
3. **Cấu hình trọng số fitness** — trọng số đánh giá (chính), trọng số chi phí (âm nếu bạn muốn ngắn hơn), trọng số thời lượng (âm nếu bạn muốn nhanh hơn)
4. **Đặt số thế hệ và quần thể** — 5 × 10 là mặc định; tăng cả hai cho các vấn đề khó hơn, giảm cả hai cho các thử nghiệm nhanh
5. **Nhấp Start Cycle** — engine chạy không giám sát; bạn có thể để ứng dụng mở hoặc quay lại sau
6. **Xem lại quần thể cuối cùng** — được xếp hạng theo fitness, với trace của mỗi biến thể có sẵn
7. **Áp dụng người chiến thắng** — hoặc bất kỳ biến thể nào khác bạn thích; prompt hoạt động của agent được cập nhật và quần thể đầy đủ của chu kỳ được bảo toàn trong lịch sử phiên bản
:::

### Cách Hoạt Động

Mỗi thế hệ chạy song song: engine gửi tất cả M biến thể đồng thời (tùy thuộc vào giới hạn tốc độ của nhà cung cấp) trên tập đầu vào, thu thập kết quả, chấm điểm chúng qua hàm fitness, chọn những người hoạt động tốt nhất làm cha mẹ, tạo các con cho thế hệ tiếp theo và tiếp tục. UI tiến trình cho thấy fitness tốt nhất và trung bình cho mỗi thế hệ trực tiếp để bạn có thể thấy liệu quần thể có đang cải thiện hay không.

:::tip
Bắt đầu với một tập đầu vào nhỏ (3-5 trường hợp đại diện) và chu kỳ mặc định 5 × 10. Nếu kết quả rõ ràng được cải thiện, bạn đã xong. Nếu nó mơ hồ, hãy mở rộng tập đầu vào và chạy một chu kỳ khác bắt đầu từ người chiến thắng trước đó. Lặp lại các chu kỳ thường đánh bại một chu kỳ khổng lồ.
:::
  `,

  "adopting-evolved-prompts": `
## Áp Dụng Prompt Đã Tiến Hóa

Khi một chu kỳ lai tạo kết thúc, bạn thấy quần thể cuối cùng được xếp hạng theo fitness với biến thể đầu được làm nổi bật. Áp dụng là một cú nhấp chuột — biến thể trở thành prompt hoạt động của agent, prompt hoạt động trước đó được bảo toàn trong lịch sử phiên bản (vì vậy rollback cũng là một cú nhấp chuột), và quần thể đầy đủ của chu kỳ cũng được bảo toàn trong trường hợp bạn muốn áp dụng một biến thể khác sau này.

Hành động áp dụng chạy cùng kiểm tra pre-flight như bất kỳ thay đổi prompt nào khác: setup-status xác minh các credential và công cụ của agent vẫn hợp lệ, phiên bản được checkpoint trong lịch sử, và nếu agent có các trigger theo lịch trình, lần chạy theo lịch trình tiếp theo sử dụng biến thể đã áp dụng tự động.

### Điểm Chính

- **Áp dụng một cú nhấp chuột** từ chế độ xem quần thể được xếp hạng
- **Phiên bản trước được bảo toàn** trong lịch sử; khôi phục cũng là một cú nhấp chuột
- **Quần thể đầy đủ được bảo toàn** — bất kỳ biến thể nào từ chu kỳ vẫn có thể áp dụng được sau này
- **Kiểm tra pre-flight chạy** — xác minh setup-status, xác thực credential, tương thích trigger
- **Các trigger trực tiếp tự động sử dụng biến thể mới** — không có bước "deploy" riêng

### Cách Áp Dụng

:::steps
1. **Chờ chu kỳ lai tạo kết thúc** — thường 10-30 phút tùy thuộc vào tham số
2. **Mở chế độ xem quần thể cuối cùng** — các biến thể được xếp hạng theo fitness với các trace có thể truy cập cho mỗi biến thể
3. **Đọc prompt của biến thể đầu** — kiểm tra nhanh để tìm các diễn đạt bất ngờ hoặc các đột biến kỳ lạ
4. **Tùy chọn kiểm tra các biến thể đứng 2 / 3** — đôi khi một fitness hơi thấp hơn đi kèm với prompt ngắn hơn / sạch hơn nhiều
5. **Nhấp Adopt** cho lựa chọn của bạn; kiểm tra pre-flight chạy; prompt hoạt động của agent cập nhật nguyên tử
6. **Xác minh lần chạy trực tiếp tiếp theo** — thường một Manual Run với đầu vào đại diện là xác nhận rẻ nhất rằng biến thể được áp dụng hoạt động như điểm kiểm thử đã hứa
:::

:::tip
Đọc biến thể được áp dụng trước khi nhấp Adopt. Tiến hóa tìm các prompt có fitness cao, nhưng đôi khi một biến thể ghi điểm tốt bằng cách khai thác một số kỳ quặc của tập đầu vào của bạn; đọc prompt là kiểm tra an toàn bắt được "điều này cũng sẽ vượt qua các bài kiểm thử của tôi nhưng kỳ lạ".
:::
  `,

  "fitness-scoring-explained": `
## Giải Thích Chấm Điểm Fitness

Fitness là con số duy nhất thúc đẩy lựa chọn Matrix / Eval / Genome. Nó kết hợp các đánh giá thủ công của bạn (tín hiệu chính) với các chỉ số khách quan (chi phí, thời lượng, tỷ lệ thành công, sự tuân thủ mục tiêu độ dài đầu ra, các tín hiệu tùy chỉnh) thành một điểm số có trọng số. Bạn cấu hình các trọng số cho mỗi agent hoặc cho mỗi bài kiểm thử — theo mặc định, các đánh giá chiếm ưu thế và các chỉ số khách quan là tiebreaker.

Điểm được tính cho mỗi biến thể cho mỗi đầu vào, sau đó được tổng hợp trên tất cả các đầu vào trong tập kiểm thử để tạo ra một fitness cho mỗi biến thể. Các biến thể được xếp hạng theo fitness tổng hợp; xếp hạng đó là những gì thuật toán lựa chọn genome tiêu thụ và những gì UI Lab sử dụng để làm nổi bật những người chiến thắng.

### Điểm Chính

- **Điểm tổng hợp duy nhất cho mỗi biến thể** — thường là 0.0-1.0 hoặc 0-100 tùy theo tùy chọn hiển thị
- **Nhiều nguồn đầu vào** — đánh giá (chính), chi phí, thời lượng, thành công, sự tuân thủ định dạng đầu ra, hàm fitness tùy chỉnh
- **Trọng số cho mỗi agent** — nhấn mạnh những gì quan trọng; cho các agent nhạy cảm về chi phí, hãy gán trọng số cao hơn cho chi phí; cho những agent nhạy cảm về chất lượng, hãy gán trọng số cao hơn cho đánh giá
- **Tổng hợp trên các đầu vào** — các biến thể được chấm điểm trên mỗi đầu vào sau đó được lấy trung bình, vì vậy một biến thể xuất sắc trên một đầu vào và bị hỏng trên một đầu vào khác ghi điểm tệ hơn một biến thể tầm thường đều đặn
- **Phân tích minh bạch** — nhấp vào bất kỳ số fitness nào để xem các đóng góp cho mỗi tín hiệu

### Cách Hoạt Động

Bộ tổng hợp fitness đọc kết quả thực thi (chi phí, thời lượng, thành công), lịch sử đánh giá (cho mỗi lần thực thi) và bất kỳ tín hiệu fitness tùy chỉnh nào được đăng ký cho agent. Mỗi được chuẩn hóa thành phạm vi 0-1, nhân với trọng số được cấu hình của nó và tổng. Kết quả là fitness của biến thể; tổng hợp trên tất cả các đầu vào trong tập kiểm thử là điểm được hiển thị.

:::tip
Các trọng số mặc định (90% đánh giá, 10% chi phí) được điều chỉnh cho hầu hết các agent. Nếu bạn thấy mình không đồng ý với "người chiến thắng" của hệ thống trong các bài kiểm thử eval / matrix, điều chỉnh hữu ích nhất thường là tăng trọng số đánh giá hơn nữa (95%) để hệ thống tin tưởng phán đoán của bạn hơn. Điều chỉnh trọng số chi phí lên cho các agent khối lượng rất cao nơi chi phí token là mối quan tâm thực sự.
:::
  `,

  "test-history-and-trends": `
## Lịch Sử Và Xu Hướng Kiểm Thử

Mọi bài kiểm thử Lab bạn chạy đều được bảo toàn trong lịch sử kiểm thử của agent. Chế độ xem lịch sử (Lab → History) hiển thị các kiểm thử trong quá khứ được sắp xếp theo ngày với thẻ chế độ, tập đầu vào, điểm fitness và kết quả cuối cùng (được áp dụng / bị từ chối / bị thay thế). Nhấp vào bất kỳ kiểm thử nào trong quá khứ để mở lại nó trong chế độ ban đầu để xem xét lại hoặc để sao chép các tham số vào một bài kiểm thử mới.

Tab phụ Trends vẽ các chỉ số cấp agent theo thời gian — fitness của prompt hiện đang hoạt động, chi phí cho mỗi lần chạy, thời lượng cho mỗi lần chạy, tỷ lệ kết quả kinh doanh. Biểu đồ được chú thích với các sự kiện quan trọng (thay đổi prompt, hoán đổi mô hình, thêm trigger) để bạn có thể thấy tác động của mỗi thay đổi đến các chỉ số của agent trực tiếp.

### Điểm Chính

- **Mọi bài kiểm thử được bảo toàn** — đầu vào đầy đủ, đầu ra, đánh giá, fitness; không có gì bị GC'd
- **Được gắn thẻ chế độ** — lọc theo Arena / A-B / Matrix / Eval / Genome để tìm một bài kiểm thử cụ thể trong quá khứ
- **Biểu đồ xu hướng** với chú thích tự động tại mọi điểm thay đổi có ý nghĩa
- **So sánh một bài kiểm thử trong quá khứ với trạng thái hiện tại** — hữu ích cho "prompt hiện tại có còn tốt hơn cái tôi đã từ chối ba tuần trước không?"
- **Có thể xuất** — lịch sử kiểm thử xuất sang CSV để phân tích bên ngoài

### Cách Hoạt Động

Các kết quả kiểm thử được lưu trữ trong cùng kho lưu trữ thực thi như các lần chạy production, với thẻ chế độ kiểm thử để lọc. Chế độ xem Trends tổng hợp từ kho lưu trữ này; các chú thích tự động được trích xuất từ lịch sử phiên bản và lịch sử cấu hình (cũng tồn tại). Không có gì trong lịch sử có thể thay đổi — các kiểm thử trong quá khứ là các bản ghi bất biến về những gì đã được kiểm thử khi nào.

:::tip
Chế độ xem Trends là nơi tốt nhất duy nhất để trả lời "agent của tôi có thực sự cải thiện theo thời gian không?" Mở nó một lần mỗi tháng; nếu xu hướng fitness phẳng hoặc giảm, các thay đổi gần đây không giúp ích và đã đến lúc suy nghĩ thay vì ship thêm các thay đổi.
:::
  `,
};
