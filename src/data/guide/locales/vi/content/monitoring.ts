export const content: Record<string, string> = {
  "the-monitoring-dashboard": `
## Bảng Điều Khiển Giám Sát

Trang Overview là trung tâm chỉ huy của bạn cho mọi thứ đang xảy ra trên các agent. Tab Dashboard mở theo mặc định và cho thấy một lưới các KpiTile — một tile cho mỗi chỉ số (tỷ lệ thành công, tổng số lần chạy, tổng chi phí, thời lượng trung bình, các agent đang hoạt động, các thất bại hôm nay, v.v.). Mỗi tile có ba chế độ mật độ (compact / standard / detail) mà bạn chuyển đổi bằng cách nhấp vào tile; hữu ích khi bạn muốn một con số nhanh so với khi bạn muốn biểu đồ xu hướng và phân tích.

Bên dưới các KpiTile, Overview hiển thị hoạt động trực tiếp, các thất bại gần đây và các thông báo bạn đã đăng ký. Mọi thứ trên trang này đều có thể lọc theo agent, theo nhóm và theo phạm vi thời gian — cùng bộ lọc áp dụng trên mọi bảng để bạn có thể giới hạn toàn bộ bảng điều khiển thành "tuần này, chỉ các agent Marketing của tôi" trong một cú nhấp chuột.

| Bảng | Hiển thị gì |
|---------|--------------|
| **KpiTiles** | Tỷ lệ thành công, số lần chạy, chi phí, thời lượng, số thất bại, các agent đang hoạt động — mỗi cái ở ba mức mật độ |
| **Activity feed** | Luồng thực thi trực tiếp trên tất cả các agent, có thể cuộn, có thể tìm kiếm, nhấp để xem chi tiết |
| **Notifications** | Các cảnh báo đã đăng ký (thất bại, giới hạn ngân sách, manual review, các bất thường) với click-through đến lần chạy vi phạm |
| **Health snapshot** | Tổng hợp sức khỏe cho mỗi agent — quét nhanh cho bất cứ điều gì màu vàng hoặc đỏ |

### Cách Hoạt Động

Trang Overview đọc từ cùng kho lưu trữ thực thi và sự kiện mà phần còn lại của ứng dụng sử dụng, vì vậy những gì bạn thấy luôn là trạng thái trực tiếp. Các bộ lọc và tùy chọn mật độ tồn tại qua các phiên; bạn đặt chúng một lần và bảng điều khiển ghi nhớ. Nhấp bất kỳ KpiTile nào để đi sâu vào phân tích cho mỗi agent, nhấp bất kỳ hàng hoạt động nào để mở modal chi tiết thực thi.

:::tip
Chuông thông báo trên title bar là một phím tắt một cú nhấp chuột từ bất cứ đâu trong ứng dụng đến chi tiết thực thi mới nhất. Bạn không cần điều hướng đến Overview thủ công cho các kiểm tra "vừa xảy ra điều gì?" thường xuyên.
:::
  `,

  "execution-logs": `
## Nhật Ký Thực Thi

Mỗi lần chạy agent tạo ra một nhật ký thực thi: payload trigger, prompt được render gửi đến mô hình, phản hồi mô hình, mọi cuộc gọi công cụ (với các đối số và kết quả), đầu ra cuối cùng, thời lượng, chi phí và bất kỳ lỗi nào. Các nhật ký là bất biến — chúng được ghi một lần và được bảo toàn vô thời hạn. Tab Activity (cho mỗi agent trên trình chỉnh sửa, hoặc toàn cục trên Overview) là điểm vào.

Mỗi mục nhật ký là một tóm tắt một dòng trong danh sách; nhấp vào mở modal chi tiết đầy đủ với tất cả các trường ở trên. Từ đó, bạn có thể sao chép bất kỳ trường nào, phát lại lần chạy với cùng đầu vào hoặc chuyển đến chế độ xem trace liên quan để gỡ lỗi từng bước.

### Điểm Chính

- **Capture hoàn chỉnh** — đầu vào, prompt, phản hồi, các cuộc gọi công cụ (với tham số và kết quả), đầu ra, thời lượng, chi phí, lỗi
- **Lịch sử bất biến** — các nhật ký không bao giờ thay đổi sau khi lần chạy hoàn thành; nếu prompt của agent được chỉnh sửa sau đó, các lần chạy cũ vẫn cho thấy những gì đã được gửi vào thời điểm đó
- **Phát lại từ bất kỳ lần chạy nào** — chạy lại agent với đầu vào gốc; hữu ích để xác minh một bản sửa lỗi trên một payload thất bại trước đó
- **Được gắn thẻ theo trigger** — \`manual\`, \`schedule\`, \`webhook\`, \`chain\`, v.v., để bạn có thể lọc hoạt động theo nguồn
- **Đánh dấu manual-review** — các lần chạy mà chính agent đã gắn cờ để xem xét (thông qua chỉ thị \`manual_review\`) nhận được một huy hiệu để bạn có thể tìm thấy chúng nhanh chóng

### Cách Hoạt Động

Kho lưu trữ thực thi là SQLite cục bộ, được ghi theo giao dịch khi lần chạy tiến triển. Tab trace bên trong modal chi tiết mở rộng mỗi bước thành các sự kiện phụ của nó (luồng token mô hình, cuộc gọi công cụ được gửi, kết quả công cụ được nhận, nhánh quyết định được lấy). Lọc theo phạm vi ngày, agent, loại trigger, trạng thái, business_outcome hoặc văn bản đầy đủ trên đầu vào/đầu ra.

:::tip
Khi một agent tạo ra đầu ra không mong đợi, tab trace — không phải đầu ra — là nơi câu trả lời nằm. Tìm cuộc gọi công cụ trả về dữ liệu sai, hoặc quyết định mô hình phân nhánh sai. Đầu ra là triệu chứng; trace là nguyên nhân.
:::
  `,

  "real-time-activity-feed": `
## Bảng Tin Hoạt Động Theo Thời Gian Thực

Bảng tin hoạt động cho bạn thấy những gì đang xảy ra ngay bây giờ trên tất cả các agent của bạn. Khi mỗi agent xử lý tác vụ của nó, các cập nhật xuất hiện trong thời gian thực — giống như xem một bảng điểm trực tiếp. Bạn thấy kết quả vào khoảnh khắc chúng xảy ra mà không cần làm mới hoặc kiểm tra các agent riêng lẻ.

Điều này đặc biệt hữu ích khi bạn có nhiều agent đang chạy đồng thời hoặc khi bạn muốn xem một tự động hóa quan trọng khi nó thực thi.

### Điểm Chính

- **Cập nhật trực tiếp** — xem hoạt động agent khi nó xảy ra, không cần làm mới
- **Tất cả các agent** — một bảng tin bao gồm mọi agent đang chạy trong thiết lập của bạn
- **Các mục có dấu thời gian** — mỗi cập nhật cho thấy chính xác khi nào nó xảy ra
- **Thay đổi trạng thái** — xem khi nào các agent bắt đầu, kết thúc, thành công hoặc thất bại trong thời gian thực

### Cách Hoạt Động

Mở bảng tin hoạt động từ bảng điều khiển giám sát hoặc thanh bên. Cập nhật stream tự động khi các agent của bạn làm việc. Mỗi mục cho thấy tên agent, hành động, dấu thời gian và kết quả. Nhấp bất kỳ mục nào — hoặc chuông thông báo trên title bar — để mở modal chi tiết thực thi đầy đủ trực tiếp trên tab Overview › Activity, nơi bạn có thể thấy trace, prompt được render, đầu vào, đầu ra và bất kỳ lỗi nào. Bản thân bảng tin có thể cuộn và tìm kiếm.

:::tip
Giữ bảng tin hoạt động mở trong một bảng bên trong khi kiểm thử các agent mới. Xem đầu ra trực tiếp giúp bạn phát hiện vấn đề ngay lập tức và lặp lại nhanh hơn. Cho việc sử dụng hàng ngày, chuông thông báo trên title bar là con đường nhanh nhất — nó luôn mở chi tiết thực thi mới nhất mà bạn không cần phải điều hướng.
:::
  `,

  "cost-tracking-per-agent": `
## Theo Dõi Chi Phí Theo Agent

Mỗi nhà cung cấp AI tính phí theo token, và Personas gắn thẻ mỗi lần chạy với số lượng token, mô hình và nhà cung cấp chính xác để chi phí cho mỗi agent luôn được biết. Overview → Usage hiển thị một danh sách có thể sắp xếp của mọi agent với chi phí của nó trong cửa sổ thời gian đã chọn — ngày, tuần, tháng hoặc phạm vi tùy chỉnh — cộng với các mũi tên xu hướng để bạn có thể thấy trong nháy mắt agent nào đang tăng chi phí.

Đi sâu vào bất kỳ hàng nào để xem phân tích: phân bố chi phí cho mỗi lần chạy (trung vị so với p95), chi phí theo mô hình khi agent có dự phòng được cấu hình, tổng số token (đầu vào so với đầu ra) và biểu đồ xu hướng theo thời gian. Nếu chi phí của một agent đang tăng dần, đây là nơi đầu tiên xuất hiện.

### Điểm Chính

- **Phân tích cho mỗi agent** — mỗi lần chạy được quy cho agent của nó
- **Cửa sổ thời gian có thể lọc** — hôm nay, tuần này, tháng này, mọi thời gian hoặc phạm vi tùy chỉnh
- **Phân bố chi phí cho mỗi lần chạy** — trung vị, p95, tối đa; tiết lộ liệu một outlier đắt tiền có đang chiếm ưu thế tổng số không
- **Phân tích token** — token đầu vào so với đầu ra để bạn có thể biết liệu agent có đang đọc nhiều hay tạo ra nhiều
- **Mũi tên xu hướng** — thay đổi tuần-trên-tuần được hiển thị bên cạnh mỗi agent, vì vậy các thoái lui chi phí xuất hiện ngay lập tức

### Cách Hoạt Động

Đồng hồ chi phí tích tắc trực tiếp trong một lần chạy khi các token stream vào. Khi lần chạy hoàn thành, chi phí cuối cùng được hoàn tất và được lưu trữ cùng với nhật ký thực thi. Chế độ xem Usage tổng hợp từ kho lưu trữ này, vì vậy thay đổi bộ lọc phạm vi thời gian chỉ truy vấn lại cùng dữ liệu — không có công việc "kế toán chi phí" riêng đang chạy.

:::tip
Nếu một agent duy nhất chiếm ưu thế chi phí của bạn, phân bố cho mỗi lần chạy hữu ích hơn tổng số. Trung vị cao có nghĩa là prompt nhất quán đắt (xem kích thước prompt và số lượng cuộc gọi công cụ). Một p95 cao với trung vị bình thường có nghĩa là các outlier hiếm (xem các đầu vào bất thường trong lịch sử trace).
:::
  `,

  "cost-tracking-per-model": `
## Theo Dõi Chi Phí Theo Mô Hình

Các mô hình khác nhau có các điểm giá rất khác nhau — Claude Haiku rẻ hơn ~30× so với Opus cho mỗi token, GPT-4o-mini rẻ hơn ~20× so với GPT-4o, và các mô hình cục bộ về cơ bản không tốn gì cho mỗi token (chỉ tính toán). Chế độ xem cho mỗi mô hình trên Overview → Usage chia nhỏ chi tiêu theo nhà cung cấp và mô hình để bạn có thể thấy tiền đi đâu và liệu chi tiêu có khớp với giá trị không.

:::feature
**Gợi Ý Tối Ưu Hóa Thông Minh** color=#34d399
Hệ thống gắn thẻ các lần chạy có vẻ như có thể đã chạy trên một mô hình rẻ hơn với chất lượng tương tự. Khi một mô hình chi phí cao được sử dụng cho một mẫu tác vụ mà mô hình rẻ hơn xử lý tốt ở nơi khác, gợi ý xuất hiện cùng với hàng chi phí — chỉ cho bạn các agent ứng viên để A-B trong Lab.
:::

### Điểm Chính

- **Theo nhà cung cấp và mô hình** — chi phí được chia theo định danh mô hình chính xác (Sonnet 4.6, Haiku 4.5, GPT-4o, Gemini 2.5 Pro, local-ollama)
- **Cuộc gọi, token, chi phí** — ba chế độ xem của cùng dữ liệu; chi phí là những gì bạn trả, token là những gì bạn tiêu, cuộc gọi là tần suất bạn gọi
- **So sánh chi phí cho mỗi cuộc gọi** — cùng chỉ số trên các mô hình để bạn có thể so sánh như-với-như
- **Gợi ý tối ưu hóa** — hiển thị các agent ứng viên có thể được hạ cấp; nhấp vào Lab để kiểm thử A-B
- **Quy gán cho mỗi agent** — đi sâu vào một hàng mô hình để xem các agent nào đang sử dụng nó nhiều nhất

### Cách Hoạt Động

Chế độ xem Usage nhóm cùng các bản ghi thực thi như chế độ xem cho mỗi agent nhưng trên chiều mô hình thay thế. Định giá được cấu hình cho mỗi mô hình trong Settings → Engine, với các mặc định khớp với định giá công khai của mỗi nhà cung cấp; bạn có thể ghi đè nếu bạn có một mức giá đã thương lượng hoặc đang sử dụng BYOI trên một endpoint rẻ hơn.

:::tip
Mỗi tháng một lần, quét chế độ xem cho mỗi mô hình được sắp xếp theo tổng chi phí. Mục đầu là cơ hội tiết kiệm lớn nhất của bạn — thả nó vào arena Lab so với mô hình rẻ hơn tiếp theo và xem chất lượng có giữ được không. Hầu hết các agent chịu được việc hạ cấp mô hình tốt; những agent không chịu được là những agent thực sự đáng chi tiêu.
:::
  `,

  "success-rate-metrics": `
## Chỉ Số Tỷ Lệ Thành Công

Mỗi lần chạy kết thúc với một trạng thái: thành công, thất bại hoặc manual-review. Tỷ lệ thành công là tỷ lệ phần trăm các lần chạy hoàn thành thành công so với nền của hành vi mong đợi. Tab Overview → Health và tab Activity cho mỗi agent đều hiển thị tỷ lệ thành công với một chỉ báo xu hướng — thay đổi tuần-trên-tuần — để bạn có thể thấy trong nháy mắt liệu độ tin cậy có đang được duy trì hay không.

Chỉ số đi xa hơn thành công/thất bại thuần túy bây giờ. Với theo dõi **business_outcome**, chính agent có thể tuyên bố liệu một lần chạy thành công có tạo ra kết quả bạn thực sự muốn (một đơn hàng, một tài liệu được phê duyệt, một tóm tắt hữu ích) — một tín hiệu riêng biệt với "lần chạy có hoàn thành mà không có lỗi không". Tỷ lệ thành công chia thành "hoàn thành sạch" và "tạo ra kết quả kinh doanh mong muốn" — cái thứ hai là con số hữu ích hơn cho hầu hết các agent.

### Điểm Chính

- **Tỷ lệ thành công cho mỗi agent** với mũi tên xu hướng
- **Tỷ lệ kết quả kinh doanh** — riêng biệt với tỷ lệ hoàn thành sạch; theo dõi liệu công việc của agent có thực sự hữu ích không
- **Phân tích cho mỗi trigger** — cùng một agent có thể thành công ở mức 99% trên các lần chạy thủ công nhưng 70% trên các lần chạy theo lịch trình; phân tích cho bạn biết nguồn trigger nào có vấn đề
- **Cảnh báo ngưỡng** — đặt một ngưỡng cho mỗi agent; bạn được thông báo khi tỷ lệ giảm xuống dưới
- **Phân loại lý do thất bại** — \`timeout\`, \`model_error\`, \`tool_error\`, \`credential_expired\`, v.v., để bạn có thể thấy *tại sao* các lần chạy đang thất bại

### Cách Hoạt Động

Tab Health tổng hợp các trạng thái lần chạy trên một cửa sổ cuộn cho mỗi agent. Theo dõi kết quả kinh doanh yêu cầu agent phát ra một chỉ thị \`business_outcome\` trong đầu ra của nó (hầu hết các mẫu cần nó đều làm vậy theo mặc định; các agent tùy chỉnh có thể thêm nó một cách rõ ràng). Các cảnh báo ngưỡng được cấu hình cho mỗi agent và kích hoạt qua cùng các kênh thông báo mà agent được thiết lập.

:::tip
Đặt một ngưỡng 90% trên mỗi agent production. Cảnh báo sẽ không cho bạn biết tại sao một agent đang thất bại, nhưng nó sẽ cho bạn biết có gì đó đang xảy ra. Phân loại lý do thất bại trên tab Health là nơi bạn đi tiếp để chẩn đoán.
:::
  `,

  "execution-tracing": `
## Truy Vết Thực Thi

Truy vết là bản ghi từng bước cho mỗi lần chạy về những gì agent đã làm. Mở bất kỳ thực thi nào từ bảng tin Activity và nhấp tab Trace: bạn sẽ thấy mọi sự kiện theo thứ tự thời gian — bắt đầu và kết thúc luồng token mô hình, mọi lệnh gọi công cụ với các đối số, mọi kết quả công cụ, mọi nhánh quyết định trong một agent được chain, prompt được render, đầu ra. Mỗi bước có thể mở rộng để xem chi tiết đầy đủ.

Đối với các pipeline được chain, trace trải dài trên nhiều agent — canvas lineage (Events → Lineage) hiển thị chế độ xem chéo agent trong khi trace cho mỗi lần chạy hiển thị chi tiết bên trong agent. Cùng nhau, chúng cho phép bạn gỡ lỗi cả "pipeline này bị vỡ ở đâu?" và "agent đã quyết định từng bước như thế nào?".

### Điểm Chính

- **Theo thứ tự thời gian** — mọi sự kiện với dấu thời gian và thời lượng
- **Có thể mở rộng cho mỗi bước** — nhấp bất kỳ bước nào để xem đầy đủ đầu vào/đầu ra của bước đó
- **Thời lượng cho mỗi bước** — xem bước nào chậm; thường là một cuộc gọi công cụ hoặc một phản hồi mô hình dài
- **Trace được chain** — khi một agent được kích hoạt bởi một chain, trace liên kết trở lại agent ngược dòng để bạn có thể điều hướng pipeline
- **Token-by-token** cho mô hình — hữu ích cho các nhà cung cấp streaming chậm nơi người dùng đang chờ

### Cách Hoạt Động

Mỗi lần thực thi ghi các sự kiện vào kho lưu trữ trace khi nó chạy; tab trace truy vấn kho lưu trữ đó và render dòng thời gian. Các sự kiện cấp token được lấy mẫu với tỷ lệ giữ cho trace có thể sử dụng được ngay cả đối với các phản hồi dài (một phản hồi 10k token có thể capture 500 sự kiện được lấy mẫu thay vì 10k). Đối với các vòng lặp sử dụng công cụ, mọi lần lặp của vòng lặp mô hình/công cụ đều được capture.

:::tip
Sử dụng trace để xác nhận những gì mô hình *thực sự* đã nhận được. Nguồn lớn nhất của các lỗi "agent đã làm điều gì đó kỳ lạ" là mô hình nhận được đầu vào khác với những gì bạn mong đợi — thường là do một kết quả công cụ không trông giống như những gì prompt của agent giả định.
:::
  `,

  "performance-trends": `
## Xu Hướng Hiệu Suất

Các xu hướng là chế độ xem dài hạn về hành vi của agent — tỷ lệ thành công, chi phí, thời lượng, chất lượng đầu ra (nơi được đo lường) được vẽ theo thời gian để bạn có thể thấy tác động của các thay đổi bạn thực hiện. Overview → Trends cung cấp cho bạn chế độ xem biểu đồ; bạn chọn (các) agent và (các) chỉ số và phạm vi ngày, và biểu đồ render.

Mẫu hữu ích nhất là "trước so với sau": bạn đã thay đổi prompt của một agent vào ngày 5 tháng 3, mọi thứ có tốt hơn hay tệ hơn không? Chế độ xem xu hướng trả lời điều đó trong vài giây — các đường bạn quan tâm tăng hoặc giảm vào ngày bạn thực hiện thay đổi.

### Điểm Chính

- **Nhiều chỉ số trên một biểu đồ** — phủ tỷ lệ thành công, chi phí, thời lượng, tỷ lệ kết quả kinh doanh
- **Phủ đa agent** — so sánh cùng chỉ số trên nhiều agent trên một biểu đồ
- **Phạm vi ngày tùy chỉnh** — phóng to từ "giờ này" đến "tất cả thời gian"
- **Chú thích** — các sự kiện quan trọng (các lần lưu phiên bản prompt, các thay đổi cài đặt, các lần xoay vòng credential) được gắn vào dòng thời gian để bạn có thể tương quan
- **Xuất** — dữ liệu biểu đồ xuất sang CSV nếu bạn muốn tự phân tích

### Cách Hoạt Động

Các xu hướng tổng hợp từ cùng kho lưu trữ thực thi và trace như phần còn lại của các chế độ xem giám sát — cùng dữ liệu, trực quan hóa khác. Các chú thích được tự động tạo ra từ lịch sử phiên bản và lịch sử cấu hình để bạn không phải đánh dấu thủ công "Tôi đã thực hiện một thay đổi ở đây"; hệ thống đã biết.

:::tip
Sau bất kỳ thay đổi có ý nghĩa nào đối với một agent (sửa đổi prompt, hoán đổi mô hình, công cụ mới), hãy kiểm tra các xu hướng một tuần sau. Hầu hết các thay đổi prompt mà "cảm thấy tốt hơn trong kiểm thử" tạo ra các chỉ số có thể đo lường khác; biểu đồ xác nhận điều đó (hoặc làm mất hiệu lực cảm giác của bạn).
:::
  `,

  "setting-budget-limits": `
## Đặt Giới Hạn Ngân Sách

Giới hạn ngân sách giới hạn chi tiêu AI ở cấp độ agent và cấp độ toàn cầu. Đặt ngân sách cho mỗi lần chạy (lần thực thi đơn lẻ này không thể tốn quá $X), ngân sách cho mỗi ngày (agent này không thể tiêu quá $Y mỗi ngày trên tất cả các lần chạy) hoặc giới hạn toàn cầu trên tất cả các agent. Khi đạt đến một giới hạn, agent bị ảnh hưởng tạm dừng sạch sẽ — lần chạy một phần được capture trong trace, không có khoản phí nào tồn tại sau giới hạn và một thông báo kích hoạt.

Đây là một trong những tính năng bị đánh giá thấp nhất cho các agent không được giám sát. Một agent theo lịch trình hoặc được kích hoạt bởi webhook không có giới hạn ngân sách có thể tích lũy chi phí không mong đợi qua đêm nếu một prompt hoặc đầu vào làm điều gì đó bệnh hoạn. Giới hạn ngân sách có nghĩa là trường hợp xấu nhất bị giới hạn bởi những gì bạn đã quyết định trước, không phải bởi những gì một lần chạy mô hình lạc có thể làm.

### Điểm Chính

- **Giới hạn cho mỗi lần chạy** — giới hạn cứng trên một lần thực thi đơn lẻ
- **Giới hạn cho mỗi ngày / mỗi tuần / mỗi tháng** — giới hạn chi tiêu theo cửa sổ cho mỗi agent
- **Giới hạn toàn cầu** — giới hạn trên tất cả các agent; hữu ích như một mạng lưới an toàn ngay cả khi mỗi agent có giới hạn riêng
- **Dừng duyên dáng** — các agent dừng sạch sẽ ở giới hạn; trace một phần được bảo toàn
- **Thông báo** — mỗi lần đạt giới hạn thông báo cho bạn để bạn có thể quyết định liệu có nên nâng giới hạn hay sửa prompt cơ bản
- **Cảnh báo mềm** — các ngưỡng trước giới hạn tùy chọn (ví dụ: "cảnh báo ở 80%") để bạn biết một agent đang tiến gần đến giới hạn

### Cách Hoạt Động

Giới hạn được cấu hình trên tab Settings của agent (cho mỗi lần chạy, cho mỗi cửa sổ) hoặc trong Settings → Engine → Budget (toàn cầu). Engine thực thi theo dõi chi phí trực tiếp trong lần chạy; khi chi phí vượt qua giới hạn, engine hủy bỏ lần chạy qua cùng đường dẫn như một timeout. Trạng thái bị hủy được bảo toàn trong trace với lý do \`budget_exceeded\`.

:::warning
Luôn đặt ít nhất một giới hạn cho mỗi ngày cho bất kỳ agent nào được kích hoạt tự động (lịch trình, webhook, file watcher, chain). Không có nó, một đầu vào bệnh hoạn hoặc một vòng lặp mô hình có thể tiêu một số tiền không giới hạn trước khi bạn nhận thấy. Giới hạn là mạng lưới an toàn của bạn.
:::

:::tip
Bắt đầu với các giới hạn khoảng 3 lần những gì bạn mong đợi một ngày điển hình sẽ tốn. Đủ chặt để bắt các runaway, đủ lỏng để biến thể bình thường không kích hoạt giới hạn. Điều chỉnh sau một tuần dữ liệu thực.
:::
  `,

  "anomaly-detection": `
## Phát Hiện Bất Thường

Phát hiện bất thường so sánh mỗi lần chạy mới với baseline gần đây của agent và gắn cờ các lần chạy trông không bình thường. Baseline được xây dựng cho mỗi agent: thời lượng điển hình, chi phí điển hình, độ dài đầu ra điển hình, số lượng cuộc gọi công cụ điển hình. Một lần chạy mới lệch đáng kể trên bất kỳ cái nào trong số này được gắn cờ với một lý do — "thời lượng 5× bình thường", "tăng đột biến chi phí", "số lượng cuộc gọi công cụ bất thường", "đầu ra ngắn bất thường".

Điều này bắt một lớp vấn đề mà các chỉ số thành công/thất bại thuần túy bỏ lỡ: lần chạy đã hoàn thành, nhưng có gì đó sai. Agent đã mất năm phút khi nó thường mất ba mươi giây. Đầu ra là ba câu khi nó thường là ba đoạn. Chi phí tăng gấp đôi mà không có thay đổi nào trong đầu vào. Đây là các tín hiệu đáng để thấy trước khi chúng trở thành xu hướng.

### Điểm Chính

- **Baseline đa tín hiệu** — thời lượng, chi phí, kích thước đầu ra, số lượng cuộc gọi công cụ, tỷ lệ thất bại
- **Baseline cho mỗi agent** — mỗi agent có bình thường riêng của nó; những gì bất thường cho một là bình thường cho một cái khác
- **Cảnh báo được gắn thẻ lý do** — cảnh báo đặt tên cho tín hiệu nào đã lệch và bao nhiêu
- **Tiếng ồn thấp** — được hiệu chuẩn để xuất hiện các outlier chính hãng, không phải biến thể bình thường
- **Tích hợp với thông báo** — các bất thường kích hoạt qua bất kỳ kênh thông báo nào mà agent được cấu hình

### Cách Hoạt Động

Baseline là một cửa sổ cuộn của các lần chạy gần đây (có thể cấu hình; mặc định 50). Mỗi lần chạy mới được ghi điểm trên mỗi tín hiệu; nếu bất kỳ tín hiệu nào vượt qua ngưỡng được cấu hình (mặc định 3 độ lệch chuẩn từ trung bình cuộn), lần chạy được gắn cờ và một sự kiện bất thường được phát ra. Các sự kiện bất thường xuất hiện trên Overview → Notifications và trong tab Health cho agent đó.

:::tip
Các bất thường mà bạn điều tra và giải quyết nên được xóa (đánh dấu chúng "đã điều tra"). Baseline loại trừ các bất thường đã được điều tra khỏi cửa sổ cuộn của nó, vì vậy hệ thống không trôi dạt theo hướng coi lần chạy bất thường là "bình thường".
:::
  `,

  "the-director": `
## The Director — Huấn Luyện Agent Tự Động

**The Director** là một meta-agent tích hợp sẵn theo dõi các agent khác của bạn và huấn luyện chúng để thực sự hữu ích hơn. Thay vì bạn phải đọc từng lần chạy, Director xem xét thay cho bạn và để lại nhận định.

Bạn chọn những gì nó theo dõi bằng cách **gắn sao** các agent (biểu tượng ⭐ trên mỗi hàng trong All Agents). Agent được gắn sao là "trong phạm vi của Director" — Director sẽ xem xét nó; các agent chưa gắn sao thì không. Bản thân Director là một agent hệ thống và không thể bị xóa.

### Trung tâm chỉ huy

Director nằm trong **Overview › Director** — một màn hình tập trung duy nhất:

- Một **thẻ điểm danh mục**: bao nhiêu công việc của đội agent thực sự tạo ra giá trị, điểm nhận định trung bình, chi phí trên mỗi lần chạy có giá trị, và phân bố 0–5 cho thấy các agent được gắn sao đứng ở đâu.
- Một **bảng huấn luyện** gồm mọi agent trong phạm vi — điểm số, đường xu hướng (huấn luyện có tạo ra thay đổi không?), tỷ lệ giá trị, lần xem xét gần nhất, và **thẻ chú ý** đánh dấu chính xác những gì cần hành động (chờ xem xét đầu tiên, điểm thấp, đang giảm, lỗi thời). Lọc chỉ những agent cần chú ý. Nhấp vào bất kỳ agent nào để mở **chi tiết** — lịch sử nhận định đầy đủ với lý do và gợi ý cụ thể đằng sau mỗi điểm số.
- Một tiêu đề nhỏ với **Xem xét tất cả trong phạm vi**, bộ chọn **Thêm vào phạm vi**, và nút chuyển đổi **bộ nhớ** dài hạn.

Trang All Agents giữ một dải Director mỏng liên kết thẳng đến đây.

### Một nhận định trông như thế nào

Mỗi lần xem xét tạo ra một **điểm số tổng thể 0–5** cộng với ghi chú huấn luyện tùy chọn:

- Cột **Verdict** trong danh sách Activity hiển thị điểm số dưới dạng sao, ngay bên cạnh agent — một cái nhìn cho bạn biết lần chạy nào xứng đáng với chi phí.
- Tab **Director** trên bất kỳ lần chạy nào mở đánh giá đầy đủ dưới dạng markdown có thể đọc được: điểm số, tóm tắt một dòng, và gợi ý cụ thể (chỉnh sửa prompt, thêm rào chắn, thay đổi cấp mô hình, công cụ còn thiếu).
- Ghi chú có thể hành động cũng được đưa vào hàng đợi xem xét của bạn, nơi phê duyệt hoặc từ chối chúng dạy Director biết gu của bạn theo thời gian.

Một agent khỏe mạnh đạt điểm cao với ít hoặc không cần huấn luyện — Director im lặng khi không có gì cần cải thiện.

### Bộ nhớ dài hạn (tùy chọn)

Nếu bạn sử dụng **Obsidian Brain**, bạn có thể bật bộ nhớ dài hạn của Director. Khi đó nó đọc các ghi chú trong quá khứ về một agent trước mỗi lần xem xét (để lời khuyên cộng dồn thay vì lặp lại) và ghi lại từng nhận định mới vào thư mục \`Director/\` trong vault của bạn — một lịch sử huấn luyện bền vững, có thể đọc được bởi con người.

### Tại Sao Điều Này Quan Trọng

Các con số thô (lần chạy, chi phí, tỷ lệ thành công) cho bạn biết *điều gì* đã xảy ra, không phải *liệu nó có đáng không*. Director bổ sung lớp phán đoán còn thiếu — đánh giá trung thực, dựa trên bằng chứng về giá trị và hiệu quả của từng agent — để một đội agent vẫn hữu ích mà không cần bạn kiểm tra từng lần chạy bằng tay.
  `,

  "tracking-goals": `
## Theo Dõi Mục Tiêu

Mục tiêu là lớp kết quả phía trên các lần chạy riêng lẻ. Thay vì xem các lần thực thi đến và đi, bạn xác định những gì bạn đang cố gắng hoàn thành — và để tiến độ tự động tổng hợp từ công việc mà đội và agent của bạn đang làm.

Mục tiêu có tiêu đề, ngày mục tiêu tùy chọn, trạng thái và phần trăm tiến độ. Trạng thái theo mô hình bốn giá trị đơn giản: **open** (chưa bắt đầu), **in-progress** (đang được làm), **blocked** (đang chờ điều gì đó) và **done**. Tiến độ là hỗn hợp: hệ thống tính toán gợi ý từ các mục checklist, mục tiêu con và các bước giao việc đội được liên kết của mục tiêu — và hiển thị nó cho bạn dưới dạng nhắc nhở **Accept / edit**. Bạn quyết định; ghi đè thủ công luôn thắng.

### Ba Chế độ xem

Mục tiêu nằm trong phần Teams và cung cấp ba bề mặt, được chuyển đổi qua sidebar:

- **Board** — một kanban được tổ chức theo trạng thái. Các thẻ hiển thị tiêu đề mục tiêu đầy đủ và một checklist nội tuyến (một vài việc cần làm đầu tiên dưới dạng hộp kiểm có thể bật, phần còn lại sau liên kết "+N more"). Khi mục tiêu có việc cần làm, hoàn thành chúng thúc đẩy tiến độ — thanh di chuyển khi các mục được tích.
- **Map** — một canvas có thể kéo và phóng to hiển thị mục tiêu liên quan với nhau như thế nào. Các cạnh phụ thuộc (chặn, theo sau) kết nối mục tiêu thành đồ thị có hướng. Tô sáng **Now** (vòng nhấp nháy hổ phách) đánh dấu các mục tiêu hiện đang trong tiến trình; tô sáng **Next** (vòng xanh) đánh dấu các mục tiêu mà các bộ chặn đã xong và sẵn sàng bắt đầu. Phóng ra để xem chòm sao; phóng vào để xem siêu dữ liệu đầy đủ trên mỗi nút.
- **Timeline** — các mục tiêu trên một ray ngày đến thẳng đứng, được nhóm theo sự khẩn cấp: Overdue, This week, This month, Later, No date.

### Động thái Chính: Giao cho Đội AI Của Bạn

Ngăn kéo chi tiết cho bất kỳ mục tiêu nào có điều khiển **Hand to your AI team**. Nhấn nó biến mục tiêu thành một giao việc đội đang chạy được liên kết trở lại với mục tiêu. Đội phân rã mục tiêu thành các bước (hoặc lấy các việc cần làm hiện có nguyên văn), thực hiện từng cái một và tự động tích tiến độ khi mỗi bước hoàn thành. Mục tiêu di chuyển từ open đến in-progress đến done một mình — và chỉ xuất hiện trong hàng đợi xem xét của bạn khi một bước thực sự cần quyết định của người.

:::tip
Bạn không cần giao mục tiêu cho đội ngay lập tức. Sử dụng Board để xây dựng checklist trước một cách thủ công — đội sau đó lấy từng mục việc cần làm theo thứ tự, cho bạn quyền kiểm soát chi tiết về những gì được làm và theo trình tự nào.
:::
  `,

  "measuring-outcomes-with-kpis": `
## Đo Lường Kết Quả Với KPI

KPI là lớp số phía trên mục tiêu. Trong khi mục tiêu mô tả kết quả bạn muốn đạt được, KPI theo dõi liệu bạn có thực sự đến đó hay không — một giá trị hiện tại, một mục tiêu và một đọc nhịp độ cho bạn biết liệu bạn có đang đi đúng hướng không.

Mỗi KPI hiển thị giá trị hiện tại so với mục tiêu với trạng thái **nhịp độ**: **on-track**, **off-track**, **met** hoặc **unmeasured** (khi chưa có phép đo nào được thực hiện). Thanh tiến trình và chỉ báo độ tươi mới của phép đo hoàn thiện thẻ trong nháy mắt.

### Bốn Loại Phép Đo

Các KPI không phải tất cả được đo theo cùng một cách. Personas hỗ trợ bốn loại phép đo, mỗi loại phù hợp với nguồn dữ liệu khác nhau:

:::info
- **Codebase** — chạy lệnh với repository của bạn và phân tích kết quả. Hữu ích cho những thứ như phần trăm coverage kiểm thử hoặc số lỗi lint hoàn toàn nằm trong code.
- **Derived** — đọc từ dữ liệu riêng của orchestrator: số lần chạy, tỷ lệ kết quả, xu hướng chi phí và các chỉ số hoạt động tương tự mà Personas đã theo dõi.
- **Connector** — kéo một giá trị từ một dịch vụ bên ngoài được kết nối (phân tích, lưu lượng, theo dõi lỗi). Nếu connector cần chưa có trong vault của bạn, thẻ KPI hiển thị lời nhắc "Connect \<service\>" liên kết trực tiếp đến catalog thông tin đăng nhập.
- **Manual** — bạn tự nhập giá trị. Hữu ích cho các con số kinh doanh không nằm trong bất kỳ hệ thống nào bạn đã kết nối, hoặc cho các KPI bạn muốn theo dõi không chính thức trước khi tự động hóa phép đo.
:::

### KPI Nằm Ở Đâu

**Teams › KPIs** có hai chế độ xem sau một công tắc phân đoạn. Chế độ xem **Dashboard** hiển thị tất cả các KPI đang hoạt động dưới dạng thẻ — nhấp vào bất kỳ thẻ nào để mở ngăn kéo chi tiết với lịch sử phép đo đầy đủ, sparkline và trường nhập giá trị thủ công. Chế độ xem **Proposals** là hàng đợi xem xét: nhấp "Scan for KPIs" chạy một lần phân tích không đầu qua context map của dự án và các KPI hiện có của bạn, và hiển thị các KPI được đề xuất với lý do một dòng và thủ tục đo lường chính xác nó sẽ sử dụng. Bạn chấp nhận (tùy chọn điều chỉnh mục tiêu trước) hoặc từ chối. Các đề xuất bị từ chối được lưu trữ và phản hồi lại cho các lần quét trong tương lai như các ví dụ tiêu cực để cùng một gợi ý không quay lại.

:::tip
Để quét đề xuất KPI trước khi bạn tự soạn chúng. Nó đọc context map của dự án, các mục tiêu hiện có và danh mục connector trong vault của bạn — và có xu hướng đề xuất các phép đo thực sự có thể tự động hóa với những gì bạn đã kết nối.
:::
  `,

  "director-verdicts-and-categories": `
## Nhận Định và Danh Mục Của Director

Mỗi lần xem xét của Director tạo ra một nhận định có cấu trúc — không chỉ là pass/fail, mà là đánh giá nhiều lớp cho bạn biết agent đang làm tốt điều gì, điều gì cần huấn luyện và cách ghi lại huấn luyện đó để nó thực sự bám vào.

Phần bắt buộc là một **điểm số tổng thể 0–5** với tóm tắt một dòng. Điểm số này đáp vào bản ghi thực thi và xuất hiện dưới dạng sao trong danh sách Activity — vì vậy một lần quét nhanh các lần chạy gần đây của bất kỳ agent nào cho bạn biết cái nào xứng đáng với chi phí của nó. Điểm số cũng thúc đẩy sparkline xu hướng trong bảng Agents: một thanh lịch sử ngắn được tô màu bởi xếp hạng gần nhất.

### Những Gì Đang Hoạt Động Tốt

Đánh giá không bắt đầu bằng phê bình. Trước bất kỳ ghi chú huấn luyện nào, Director nêu ra những điều mà agent thực sự đang làm đúng — những gì tài liệu gọi là **thắng lợi**. Những điều này xuất hiện ở đầu markdown đánh giá đầy đủ dưới dạng phần "What's working". Một agent đang hoạt động tốt có thể chỉ nhận được thắng lợi; Director im lặng khi không có gì để cải thiện.

### Ghi Chú Huấn Luyện và Danh Mục

Sau thắng lợi là các ghi chú huấn luyện: gợi ý cụ thể, có thể hành động được ghi dưới một trong sáu **danh mục**:

- **Prompt** — hướng dẫn hoặc khung của agent cần điều chỉnh
- **Health** — các vấn đề về độ tin cậy hoặc xử lý lỗi
- **Triggers** — cách thức và thời điểm agent kích hoạt (lịch trình, webhook, thiết lập chain)
- **Credentials** — các khoảng trống vault hoặc quyền đang chặn agent
- **Memory** — những gì agent đang lưu và thu hồi (hoặc không làm được)
- **Usefulness** — liệu đầu ra của agent có thực sự có giá trị cho mục đích đã nêu hay không

Các ghi chú huấn luyện xuất hiện trong **hàng đợi xem xét** của bạn dưới dạng các mục bạn phê duyệt hoặc từ chối. Đây không chỉ là việc nhà: phê duyệt hoặc từ chối các ghi chú dạy Director biết gu của bạn. Lần xem xét tiếp theo đọc lại các ghi chú bạn đã chấp nhận và những cái bạn đã bỏ qua, vì vậy vòng phản hồi cộng dồn — Director ngày càng giỏi hơn trong việc biết bạn quan tâm đến điều gì cho mỗi agent, và dừng đề xuất những thứ bạn đã loại trừ.

Trung tâm chỉ huy của Director bao gồm một tổng hợp **Vấn đề theo danh mục** tổng hợp các ghi chú huấn luyện trên toàn đội của bạn, vì vậy bạn có thể thấy ở cấp độ danh mục đầu tư liệu khoảng trống thông tin đăng nhập có phải là vấn đề phổ biến nhất hay chất lượng prompt là nơi hầu hết các agent cần chú ý.

:::tip
Các agent khỏe mạnh đạt điểm cao và tạo ra ít hoặc không có ghi chú huấn luyện. Nếu một agent liên tục đạt 4–5 mà không có mục xem xét đang chờ, đó là tín hiệu để yên nó và tập trung sự chú ý vào những cái có xu hướng giảm hoặc điểm số thấp.
:::
  `,

  "director-momentum-and-stale-sweep": `
## Đà Động Lực và Quét Lỗi Thời Của Director

Ngoài các nhận định cá nhân, Director xây dựng bức tranh cấp độ danh mục đầu tư về cách toàn bộ đội của bạn đang xu hướng. Đây là chế độ xem dọc — không phải "agent này đã làm gì trong lần chạy cuối cùng" mà "huấn luyện có thực sự tạo ra thay đổi trên các agent của bạn theo thời gian không?"

### Thẻ Điểm

Trung tâm chỉ huy của Director mở với **thẻ điểm** trả lời bốn câu hỏi trong nháy mắt: bao nhiêu phần công việc của đội đã tạo ra giá trị (**tỷ lệ giá trị được giao**), điểm nhận định trung bình trên tất cả các agent trong phạm vi là bao nhiêu, **chi phí trên mỗi lần chạy hữu ích** là bao nhiêu và có bao nhiêu agent hiện đang trong phạm vi. Bên dưới KPI tiêu đề, một thanh **phân tích giá trị** phân tách tỷ lệ giá trị được giao thành phân loại kết quả đầy đủ — đã giao, một phần, bị chặn, không có đầu vào, chưa được đánh giá — để bạn có thể thấy giá trị đang rò rỉ ở đâu, không chỉ là liệu có hay không.

Biểu đồ **phân bố điểm 0–5** hiển thị cách các agent được gắn sao của bạn xếp hàng trên toàn thang đánh giá, với đường đứt nét đánh dấu trung bình danh mục đầu tư. Bộ chọn khoảng thời gian xem xét (7 / 30 / 90 ngày) phạm vi toàn bộ thẻ điểm.

### Đà Động Lực

Dải **đà động lực** trả lời câu hỏi danh mục đầu tư quan trọng nhất: mọi thứ có đang tốt hơn không? Nó đếm có bao nhiêu agent **cải thiện**, **giữ nguyên** hoặc **giảm sút** so với lần xem xét trước. Một đội đang cải thiện có nghĩa là huấn luyện đang có tác dụng; một đội đang giảm sút có nghĩa là điều gì đó có tính hệ thống cần chú ý — thay đổi mô hình, trôi dạt thông tin đăng nhập, phân rã prompt.

### Thẻ Chú ý và Phân loại

Bảng huấn luyện gắn cờ mọi agent trong phạm vi với **thẻ chú ý** dựa trên các quy tắc được suy ra từ client: đang chờ xem xét đầu tiên (chưa bao giờ được đánh giá), điểm thấp (≤ 2), xu hướng giảm hoặc xem xét lỗi thời (không được huấn luyện trong hơn 14 ngày). Một thanh phân loại chú ý ở đầu bảng tổng hợp các cờ này — N mới, N thấp, N giảm, N lỗi thời — để bạn thấy quy mô vấn đề trước khi bắt đầu giải quyết.

Nhấp vào chip phân loại lọc bảng theo cờ đó. Sau khi lọc, hành động **Review these N** chạy Director tuần tự trên chính xác những agent đó — phân loại dẫn thẳng vào hành động.

### Quét Lỗi Thời

Nút **Stale sweep** xem xét lại mọi agent được gắn sao chưa được huấn luyện trong hơn 14 ngày, chỉ với một cú nhấp chuột. Nó chỉ xuất hiện khi tồn tại các agent lỗi thời. Đây là lần bảo trì định kỳ: chạy nó một lần mỗi tháng và Director bắt bất kỳ agent nào đã trôi dạt kể từ lần đánh giá cuối cùng.

### Bộ Nhớ Dài Hạn

Với **Obsidian Brain** được bật, Director đọc các ghi chú trong quá khứ về một agent trước mỗi lần xem xét và ghi lại nhận định mới vào thư mục \`Director/\` trong vault của bạn. Huấn luyện cộng dồn thay vì lặp lại — Director không tái đề xuất những thứ nó đã đề cập, và nó xây dựng trên những gì bạn đã phê duyệt và từ chối theo thời gian.

:::tip
Quét lỗi thời và thanh phân loại chú ý là hai cách nhanh nhất để giữ một đội lớn khỏe mạnh mà không mất thời gian với các agent đã đang làm tốt. Sử dụng thanh phân loại để tìm các agent thực sự cần chú ý; sử dụng quét lỗi thời để đảm bảo không có gì đang âm thầm trượt mà không được xem xét.
:::
  `,
};
