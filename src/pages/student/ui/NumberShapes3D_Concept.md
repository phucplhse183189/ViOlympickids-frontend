# BAI 46 - PROJECT: NUMBERSHAPES 3D

## Tong quan
- Mat danh: Project NumberShapes 3D.
- Doi tuong: hoc sinh lop 2 (7-8 tuoi), uu tien truc quan, han che chu.
- Bai hoc cot loi:
  - Hieu 1 truc xanh = 1 chuc (10), 1 cau vang = 1 don vi (1).
  - Luyen cong/tru trong pham vi 100 thong qua hanh dong ghep/tach.

## The gioi va my thuat
- Boi canh: Hon dao So Hoc, cac nen da bay lo lung, cong nang luong va may ma thuat.
- Art style 3D:
  - Stylized low-poly, bo goc mem.
  - Vat lieu dang nhua cao cap/keo deo, bong va co do dan hoi.
  - Mau nhan vat:
    - Cau vang (don vi): vang am, nhan vat nho, lan nhanh.
    - Tru xanh (hang chuc): xanh la, nhan vat cao hon, di chuyen dam.
- Cam xuc nhan vat:
  - Ghep: bat ngo -> cuoi tuoi -> to sang.
  - Tach: hopp luc nho -> no pop -> 10 cau vang nhay nhe.

## Am thanh
- Ghep thanh cong: "poc" + "bing bing" cao dan.
- Tach thanh cong: "pach" mem + tieng hat vui ngan.
- Sai thao tac: "boing" nhe, khong gay ap luc.
- Hoan thanh muc tieu: chuoi am thanh thang loi ngan, vui.

## Prototype Level 1 - Tram Ghep Nang Luong
- Muc tieu hoc:
  - Hieu va nho nhanh: cau vang la 1, tru xanh la 10.
  - Lam quen hanh dong gom nhom 10 don vi thanh 1 chuc.
- Khong gian 3D:
  - San choi dang dao tron, o giua la "May Nap Nang Luong".
  - Ben trai la vung cau vang lon nhe.
  - Ben phai la o cho tru xanh sang den khi du nang luong.
- Luat choi va cac buoc:
  1. Man hinh hien nhiem vu bang icon (vi du: can 2 tru xanh va 4 cau vang).
  2. Tre keo cac cau vang vao vung ghep.
  3. Moi khi du 10 cau vang, hieu ung hut tu xuat hien va 10 cau "pop" thanh 1 tru xanh.
  4. Tre tiep tuc ghep cho den khi may du so luong can.
  5. Cong mo, nhan vat vo tay, hien thi ket qua bang icon (khong can nhieu chu).
- Phan hoi su pham:
  - Dung: may sang mau xanh, rung nhe, am thanh "bing".
  - Sai (thieu/du): mau vang nhap nhay + goi y bang icon "them cau" hoac "dung lai".

## Prototype Level 2 - Xuong Tach De Mo Cong
- Muc tieu hoc:
  - Hieu thao tac "tach 1 chuc thanh 10 don vi" de giai tinh huong tru/co nho.
  - Luyen doi qua lai giua tru xanh va cau vang.
- Khong gian 3D:
  - Mot cong da bi ket, ben canh la "Ban Tach" va "Bang Dat Muc Tieu".
  - Tru xanh xep thanh cot o hau canh, cau vang cho san o khay truot.
- Luat choi va cac buoc:
  1. Nhiem vu hien bang hinh: vi du "Can tra 14 nang luong".
  2. Tre thu lay tu tru xanh truoc (10 + ...), neu chua du thi bam/quet vao tru xanh de tach.
  3. 1 tru xanh vo mem thanh 10 cau vang, cac cau lan ra theo vat ly nhe.
  4. Tre gom dung so cau vang can thiet vao cong.
  5. Cong mo khi dat dung, tre nhin thay dong nang luong chay qua cong.
- Phan hoi su pham:
  - Dung: cong mo, hieu ung anh sang, nhan vat reo vui.
  - Sai: tra lai 1-2 qua cau ve khay, hien icon goi y, khong phat diem am.

## UI/UX cho tre em
- Chu to, tu khoa ngan, uu tien icon va mau.
- Huong dan bang giong noi + mui ten dong.
- Moi man duoi 2 phut.
- Nut chinh lon, vung cham rong.
- Luon co nut "Thu lai" de giam ap luc.

## KPI prototype de danh gia
- Ty le tre hoan thanh Level 1 trong lan dau >= 80%.
- Ty le tre biet dung thao tac tach o Level 2 >= 70%.
- Thoi gian trung binh moi man: 60-120 giay.
- Ty le bam thoat giua chung < 15%.

## Mapping nhanh voi implementation bai 46 hien tai
- Muc luc da doi ten bai 46 theo NumberShapes 3D.
- Man choi bai 46 da doi sang 2 man prototype.
- Ngo ngu trong game doi sang don vi/chuc va ngu canh Hon dao So Hoc.
- Co the nang cap tiep:
  - Them hanh dong "nut Tach" thuc su tren 1 tru xanh.
  - Them hieu ung hut tu khi du 10 cau vang de minh hoa "ghep" day du hon.
