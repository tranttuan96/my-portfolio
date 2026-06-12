# Mixamo Rigging Guide — chibi Tuan (~15 phút)

Mục tiêu: từ file `assets-staging/chibi-tpose.fbx` → model đã rig + 5 animation clips.
Mixamo hoàn toàn free, chỉ cần tài khoản Adobe (đăng ký free được).

## A. Auto-rig (5 phút)

1. Mở https://www.mixamo.com → Sign in (Adobe account, tạo free nếu chưa có)
2. Bấm **Upload Character** → kéo file `assets-staging/chibi-tpose.fbx` vào
3. Đợi preview hiện → **Next** → màn hình đặt marker (Auto-Rigger):
   - **Chin** (cằm): đặt ĐÚNG dưới môi — với chibi đầu to, đừng đặt giữa mặt
   - **Wrists** (2 cổ tay): cuối ống tay áo, trước bàn tay
   - **Elbows** (2 khuỷu): giữa cánh tay — chibi tay ngắn, cứ chia đôi
   - **Knees** (2 đầu gối): giữa chân
   - **Groin** (háng): điểm 2 chân gặp nhau
   - **Skeleton LOD**: chọn **Standard (65 bones)**, KHÔNG chọn no-fingers nếu có lựa chọn
4. **Next** → đợi auto-rig (~1-2 phút) → preview model cử động
   - ✅ Nếu model vẫy/cử động tự nhiên, không rách vai/cổ → **Next/Finish**
   - ❌ Nếu méo (tay xuyên đầu, vai gãy): bấm Back chỉnh lại marker (thường do Chin
     hoặc Wrist đặt sai). Vẫn méo sau 2-3 lần thử → dừng, báo Claude chạy plan B

## B. Tải 5 animations (10 phút)

Sau khi rig xong, model của bạn đang được chọn (góc phải). Với MỖI animation dưới:
tìm theo tên trong ô Search → click chọn → chỉnh setting nếu ghi chú → **Download**.

| # | Tìm kiếm | Chọn animation | Setting khi Download | Lưu tên file |
|---|----------|----------------|----------------------|--------------|
| 0 | — | (không animation — chính character sau khi rig) | Format: **FBX Binary**, Pose: **T-pose** | `rigged-base.fbx` |
| 1 | `Flying` | "Flying" (bay tại chỗ, người thẳng) | **In Place** ✓ nếu có | `anim-fly.fbx` |
| 2 | `Falling To Landing` | "Falling To Landing" | **In Place** ✓ | `anim-land.fbx` |
| 3 | `Waving` | "Waving" (1 tay vẫy, thân thoải mái) | Trim nếu quá dài | `anim-wave.fbx` |
| 4 | `Sitting` | "Stand To Sit" (hoặc "Male Sit Down") | — | `anim-sit.fbx` |
| 5 | `Typing` | "Typing" (ngồi gõ phím) | — | `anim-type.fbx` |

**Setting chung khi Download (trừ #0):**
- Format: **FBX Binary (.fbx)**
- Skin: **Without Skin** ← quan trọng, file nhẹ, chỉ chứa animation
- Frames per Second: 30 · Keyframe Reduction: none

## C. Bàn giao

Bỏ cả 6 file vào: `assets-staging/mixamo/`
Rồi báo Claude: "có mixamo files rồi" — Claude sẽ merge thành `public/avatar.glb` và nén.

## Ghi chú

- Mixamo không có animation "bay kiểu siêu nhân nằm ngang" đẹp — "Flying" của nó là
  bay đứng (kiểu lơ lửng), hợp với kịch bản Doctor Strange hơn. 👍
- Nếu thấy animation nào nhìn hay hơn cho từng cảnh, cứ tải thêm — đặt tên
  `anim-<gì-đó>.fbx`, Claude merge được hết.
