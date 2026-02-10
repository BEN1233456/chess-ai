# Chess AI Arena

Platform cờ vua mini chạy trên trình duyệt, cho phép bạn (quân trắng) đấu với bot.

## Chạy nhanh

```bash
python3 -m http.server 8000
```

Mở: <http://localhost:8000>

## Tính năng

- Bàn cờ trực quan 8x8 với quân cờ Unicode.
- Luật đi cờ đầy đủ nhờ `chess.js`.
- Bot dùng minimax + alpha-beta pruning (3 mức độ khó).
- Highlight ô được chọn, gợi ý nước đi hợp lệ, đánh dấu nước đi gần nhất.
- Lịch sử nước đi theo từng lượt trắng/đen.
- Nút **Ván mới** để reset nhanh.

## Lưu ý

- Hiện bot tập trung vào strength vừa phải (depth 1-3) để phản hồi nhanh trên trình duyệt.
- Tốt phong cấp tự động thành Hậu.
