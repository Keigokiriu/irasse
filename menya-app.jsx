import { useState, useEffect, useReducer, useCallback, useRef } from "react";

const FL = document.createElement("link");
FL.rel = "stylesheet";
FL.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Sans+KR:wght@300;400;500;700&family=Shippori+Mincho:wght@400;600;800&display=swap";
document.head.appendChild(FL);

// ═══════════════════════════════════════════════════════════════
// LANGUAGES & TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
const LANGUAGES = [
  { id:"ja", label:"日本語", flag:"🇯🇵", font:"'Noto Sans JP',sans-serif" },
  { id:"en", label:"English", flag:"🇺🇸", font:"'Noto Sans JP',sans-serif" },
  { id:"ko", label:"한국어",  flag:"🇰🇷", font:"'Noto Sans KR',sans-serif" },
  { id:"es", label:"Español", flag:"🇪🇸", font:"'Noto Sans JP',sans-serif" },
  { id:"pt", label:"Português",flag:"🇧🇷",font:"'Noto Sans JP',sans-serif" },
];

const TR = {
  ja: {
    // Store name
    storeName:"麺屋 雅", storeRoman:"MENYA MIYABI",
    // Nav tabs
    navOrder:"注文", navRequest:"リクエスト", navCall:"呼び出し", navReceipt:"お会計",
    // Wait screen
    congestion:"現在の混雑状況", seatsOccupied:"席 着席中",
    crowded:"🔴 混雑", moderate:"🟡 やや混雑", available:"🟢 余裕あり",
    seatsAvailable:"空席あり", groupsWaiting:"組待ち",
    enterNow:"このまま入店して注文する →", fullNow:"❌ 現在満席です",
    nextFree:"最短で空く予測", minutesLater:"分後",
    tableLimit:"の制限時間まで残り", minutes:"分",
    tablePredictions:"テーブル別 退席予測",
    waitingList:"ウェイティングリスト", waitingGroups:"組",
    myPosition:"番目", waitEstimate:"待ち時間の目安",
    approx:"約", minutesSuffix:"分",
    waitNearby:"順番が来たらスタッフが声をかけます。近くでお待ちください。",
    cancelWait:"キャンセル",
    joinWaitlist:"📋 ウェイティングリストに追加する",
    waitRegistration:"📋 順番待ちに登録",
    yourName:"お名前", namePlaceholder:"例：田中",
    partySize:"人数", cancel:"キャンセル", register:"登録する",
    seatReady:"🔔 お席の準備ができました！",
    seatReadySub:"スタッフにお声がけください",
    enterAndOrder:"入店して注文する →",
    waitingNow:"⏳ ウェイティング中",
    elapsedWait:"分待ち · 目安",
    // Time limit
    timeLimitSeat:"のお席", elapsedFrom:"着席から", elapsedMin:"分経過",
    timeLimitWarn:"⚠️ まもなく時間です。お会計をお済ませください。",
    remaining:"残り",
    // Order tab
    whatMeal:"今日はどんなお食事ですか？", sceneSubtitle:"シーンを選ぶとAIが退席時間を予測します",
    seeMenu:"メニューを見る →", menu:"メニュー",
    orderConfirm:"ご注文内容の確認", aiPrediction:"AI退席時間予測",
    aiCalc:"AIが計算中…", placeOrder:"注文を確定する ✓",
    orderDone:"ご注文を承りました", orderDoneSub:"キッチンに送信されました。まもなくお持ちします。",
    addMore:"追加注文する", back:"← 戻る",
    orderTotal:"確認（¥", subtotal:"小計", tax:"消費税（10%）", total:"合計",
    // Request tab
    requestTitle:"スタッフへのリクエスト", requestSub:"ご要望をお気軽にどうぞ",
    quickRequests:"よくあるご要望", freeText:"その他（自由記入）",
    freeTextPlaceholder:"例：誕生日サプライズをお願いしたいです…",
    allergyTitle:"⚠️ アレルギー・食事制限",
    sendRequest:"💌 スタッフに送信する",
    requestSent:"スタッフに送信しました", requestSentSub:"確認後すぐに対応いたします",
    changeRequest:"変更・追加する",
    // Call tab
    callTitle:"スタッフを呼ぶ", callSub:"用件を選んでボタンを押すだけ",
    callMemo:"メモ（任意）", callMemoPh:"詳細があれば…",
    callBtn:"🔔 スタッフを呼ぶ", callSent:"✅ スタッフに通知しました",
    callSentSub:"まもなく参ります", callingNow:"⏳ スタッフが向かっています…",
    // Receipt tab
    receiptTitle:"お会計", orderContents:"ご注文内容",
    payMethod:"お支払い方法", payBtn:"💳 この内容でお支払い",
    receiptEmail:"🧾 レシートをメールで受け取る",
    payDone:"お支払い完了", payDoneSub:"またのご来店をお待ちしております 🍜",
    // Today's special
    todaySpecial:"🍜 本日のおすすめ：特製ラーメン",
    tableLabel:"テーブル", seatsLabel:"名席",
  },
  en: {
    storeName:"Menya Miyabi", storeRoman:"MENYA MIYABI",
    navOrder:"Order", navRequest:"Requests", navCall:"Call Staff", navReceipt:"Bill",
    congestion:"Current Availability", seatsOccupied:"seats occupied",
    crowded:"🔴 Busy", moderate:"🟡 Moderate", available:"🟢 Available",
    seatsAvailable:"seats open", groupsWaiting:"groups waiting",
    enterNow:"Enter & Order →", fullNow:"❌ Currently Full",
    nextFree:"Next table available in", minutesLater:"min",
    tableLimit:"time limit in", minutes:"min",
    tablePredictions:"Table Departure Estimates",
    waitingList:"Waiting List", waitingGroups:"groups",
    myPosition:"th in line", waitEstimate:"Estimated wait",
    approx:"~", minutesSuffix:"min",
    waitNearby:"We'll come find you when your table is ready. Please stay nearby.",
    cancelWait:"Cancel",
    joinWaitlist:"📋 Join the Waiting List",
    waitRegistration:"📋 Join Waiting List",
    yourName:"Your Name", namePlaceholder:"e.g. Smith",
    partySize:"Party Size", cancel:"Cancel", register:"Join",
    seatReady:"🔔 Your table is ready!",
    seatReadySub:"Please speak to a staff member",
    enterAndOrder:"Enter & Order →",
    waitingNow:"⏳ On the Waiting List",
    elapsedWait:"min wait · est.",
    timeLimitSeat:"time limit", elapsedFrom:"Seated", elapsedMin:"min ago",
    timeLimitWarn:"⚠️ Time is almost up. Please proceed to payment.",
    remaining:"remaining",
    whatMeal:"What's the occasion today?", sceneSubtitle:"AI will predict your dining time based on your scene",
    seeMenu:"See Menu →", menu:"Menu",
    orderConfirm:"Confirm Your Order", aiPrediction:"AI Departure Estimate",
    aiCalc:"AI calculating…", placeOrder:"Place Order ✓",
    orderDone:"Order Placed!", orderDoneSub:"Sent to the kitchen. We'll bring it right out.",
    addMore:"Order More", back:"← Back",
    orderTotal:"Confirm (¥", subtotal:"Subtotal", tax:"Tax (10%)", total:"Total",
    requestTitle:"Special Requests", requestSub:"Let us know how we can make your visit special",
    quickRequests:"Common Requests", freeText:"Other Requests",
    freeTextPlaceholder:"e.g. Birthday surprise, special seating preference…",
    allergyTitle:"⚠️ Allergies & Dietary Restrictions",
    sendRequest:"💌 Send to Staff",
    requestSent:"Sent to Staff!", requestSentSub:"We'll take care of it right away.",
    changeRequest:"Edit / Add",
    callTitle:"Call a Staff Member", callSub:"Select a reason and tap the button",
    callMemo:"Note (optional)", callMemoPh:"Any additional details…",
    callBtn:"🔔 Call Staff", callSent:"✅ Staff has been notified",
    callSentSub:"Someone will be with you shortly", callingNow:"⏳ Staff is on the way…",
    receiptTitle:"Your Bill", orderContents:"Order Summary",
    payMethod:"Payment Method", payBtn:"💳 Pay Now",
    receiptEmail:"🧾 Email Receipt",
    payDone:"Payment Complete", payDoneSub:"Thank you! We hope to see you again 🍜",
    todaySpecial:"🍜 Today's Special: Signature Ramen",
    tableLabel:"Table", seatsLabel:"seats",
  },
  ko: {
    storeName:"멘야 미야비", storeRoman:"MENYA MIYABI",
    navOrder:"주문", navRequest:"요청", navCall:"직원 호출", navReceipt:"계산",
    congestion:"현재 혼잡 상황", seatsOccupied:"석 이용 중",
    crowded:"🔴 혼잡", moderate:"🟡 보통", available:"🟢 여유",
    seatsAvailable:"빈 자리 있음", groupsWaiting:"팀 대기 중",
    enterNow:"입장하여 주문하기 →", fullNow:"❌ 현재 만석입니다",
    nextFree:"가장 빠른 빈 자리 예상", minutesLater:"분 후",
    tableLimit:"이용 제한 시간까지 남은 시간", minutes:"분",
    tablePredictions:"테이블별 퇴석 예측",
    waitingList:"웨이팅 리스트", waitingGroups:"팀",
    myPosition:"번째", waitEstimate:"예상 대기 시간",
    approx:"약", minutesSuffix:"분",
    waitNearby:"순서가 되면 직원이 안내해 드립니다. 근처에서 기다려 주세요.",
    cancelWait:"취소",
    joinWaitlist:"📋 웨이팅 리스트에 등록",
    waitRegistration:"📋 대기 등록",
    yourName:"성함", namePlaceholder:"예: 김철수",
    partySize:"인원", cancel:"취소", register:"등록하기",
    seatReady:"🔔 자리가 준비되었습니다!",
    seatReadySub:"직원에게 말씀해 주세요",
    enterAndOrder:"입장하여 주문하기 →",
    waitingNow:"⏳ 대기 중",
    elapsedWait:"분 대기 · 예상",
    timeLimitSeat:"이용 제한", elapsedFrom:"착석 후", elapsedMin:"분 경과",
    timeLimitWarn:"⚠️ 시간이 거의 다 됐습니다. 계산해 주세요.",
    remaining:"남음",
    whatMeal:"오늘은 어떤 자리인가요?", sceneSubtitle:"상황을 선택하면 AI가 퇴석 시간을 예측합니다",
    seeMenu:"메뉴 보기 →", menu:"메뉴",
    orderConfirm:"주문 확인", aiPrediction:"AI 퇴석 시간 예측",
    aiCalc:"AI 계산 중…", placeOrder:"주문 확정 ✓",
    orderDone:"주문이 완료되었습니다", orderDoneSub:"주방에 전달되었습니다. 곧 가져다 드리겠습니다.",
    addMore:"추가 주문", back:"← 뒤로",
    orderTotal:"확인 (¥", subtotal:"소계", tax:"세금 (10%)", total:"합계",
    requestTitle:"직원에게 요청", requestSub:"편하게 요청해 주세요",
    quickRequests:"자주 하는 요청", freeText:"기타 요청",
    freeTextPlaceholder:"예: 생일 서프라이즈 부탁드립니다…",
    allergyTitle:"⚠️ 알레르기 · 식이 제한",
    sendRequest:"💌 직원에게 전송",
    requestSent:"직원에게 전송했습니다", requestSentSub:"확인 후 바로 처리해 드리겠습니다.",
    changeRequest:"수정 · 추가",
    callTitle:"직원 호출", callSub:"용건을 선택하고 버튼을 누르세요",
    callMemo:"메모 (선택)", callMemoPh:"추가 내용이 있으면 입력해 주세요…",
    callBtn:"🔔 직원 부르기", callSent:"✅ 직원에게 알렸습니다",
    callSentSub:"곧 방문하겠습니다", callingNow:"⏳ 직원이 가고 있습니다…",
    receiptTitle:"계산", orderContents:"주문 내역",
    payMethod:"결제 수단", payBtn:"💳 결제하기",
    receiptEmail:"🧾 영수증 이메일 수신",
    payDone:"결제 완료", payDoneSub:"감사합니다! 또 방문해 주세요 🍜",
    todaySpecial:"🍜 오늘의 추천: 특제 라멘",
    tableLabel:"테이블", seatsLabel:"인석",
  },
  es: {
    storeName:"Menya Miyabi", storeRoman:"MENYA MIYABI",
    navOrder:"Pedir", navRequest:"Solicitudes", navCall:"Llamar", navReceipt:"Cuenta",
    congestion:"Disponibilidad Actual", seatsOccupied:"asientos ocupados",
    crowded:"🔴 Lleno", moderate:"🟡 Moderado", available:"🟢 Disponible",
    seatsAvailable:"asientos libres", groupsWaiting:"grupos esperando",
    enterNow:"Entrar y Pedir →", fullNow:"❌ Actualmente lleno",
    nextFree:"Próxima mesa disponible en", minutesLater:"min",
    tableLimit:"límite de tiempo en", minutes:"min",
    tablePredictions:"Estimación de salida por mesa",
    waitingList:"Lista de Espera", waitingGroups:"grupos",
    myPosition:"° en la lista", waitEstimate:"Espera estimada",
    approx:"~", minutesSuffix:"min",
    waitNearby:"Le avisaremos cuando su mesa esté lista. Por favor quédese cerca.",
    cancelWait:"Cancelar",
    joinWaitlist:"📋 Unirse a la lista de espera",
    waitRegistration:"📋 Registrarse en lista de espera",
    yourName:"Su nombre", namePlaceholder:"Ej: García",
    partySize:"Personas", cancel:"Cancelar", register:"Registrar",
    seatReady:"🔔 ¡Su mesa está lista!",
    seatReadySub:"Por favor hable con un miembro del personal",
    enterAndOrder:"Entrar y Pedir →",
    waitingNow:"⏳ En lista de espera",
    elapsedWait:"min espera · est.",
    timeLimitSeat:"límite de tiempo", elapsedFrom:"Sentado", elapsedMin:"min",
    timeLimitWarn:"⚠️ El tiempo casi se acaba. Por favor proceda al pago.",
    remaining:"restante",
    whatMeal:"¿Cuál es la ocasión hoy?", sceneSubtitle:"La IA predecirá su tiempo de comida según la ocasión",
    seeMenu:"Ver Menú →", menu:"Menú",
    orderConfirm:"Confirmar Pedido", aiPrediction:"Estimación IA de salida",
    aiCalc:"Calculando…", placeOrder:"Confirmar Pedido ✓",
    orderDone:"¡Pedido realizado!", orderDoneSub:"Enviado a cocina. Lo traeremos enseguida.",
    addMore:"Pedir más", back:"← Volver",
    orderTotal:"Confirmar (¥", subtotal:"Subtotal", tax:"Impuesto (10%)", total:"Total",
    requestTitle:"Solicitudes Especiales", requestSub:"Cuéntenos cómo podemos hacer su visita especial",
    quickRequests:"Solicitudes Comunes", freeText:"Otras Solicitudes",
    freeTextPlaceholder:"Ej: Sorpresa de cumpleaños, preferencia de asiento…",
    allergyTitle:"⚠️ Alergias y Restricciones Alimentarias",
    sendRequest:"💌 Enviar al Personal",
    requestSent:"¡Enviado al Personal!", requestSentSub:"Lo atenderemos de inmediato.",
    changeRequest:"Editar / Agregar",
    callTitle:"Llamar al Personal", callSub:"Seleccione un motivo y presione el botón",
    callMemo:"Nota (opcional)", callMemoPh:"Detalles adicionales…",
    callBtn:"🔔 Llamar al Personal", callSent:"✅ Personal notificado",
    callSentSub:"Alguien estará con usted enseguida", callingNow:"⏳ El personal está en camino…",
    receiptTitle:"Su Cuenta", orderContents:"Resumen del Pedido",
    payMethod:"Método de Pago", payBtn:"💳 Pagar Ahora",
    receiptEmail:"🧾 Recibo por Email",
    payDone:"Pago Completo", payDoneSub:"¡Gracias! Esperamos verte de nuevo 🍜",
    todaySpecial:"🍜 Especial del día: Ramen Especial",
    tableLabel:"Mesa", seatsLabel:"personas",
  },
  pt: {
    storeName:"Menya Miyabi", storeRoman:"MENYA MIYABI",
    navOrder:"Pedir", navRequest:"Pedidos", navCall:"Chamar", navReceipt:"Conta",
    congestion:"Disponibilidade Atual", seatsOccupied:"assentos ocupados",
    crowded:"🔴 Lotado", moderate:"🟡 Moderado", available:"🟢 Disponível",
    seatsAvailable:"assentos livres", groupsWaiting:"grupos esperando",
    enterNow:"Entrar e Pedir →", fullNow:"❌ Lotado no momento",
    nextFree:"Próxima mesa disponível em", minutesLater:"min",
    tableLimit:"limite de tempo em", minutes:"min",
    tablePredictions:"Previsão de saída por mesa",
    waitingList:"Lista de Espera", waitingGroups:"grupos",
    myPosition:"° na fila", waitEstimate:"Espera estimada",
    approx:"~", minutesSuffix:"min",
    waitNearby:"Avisaremos quando sua mesa estiver pronta. Fique por perto.",
    cancelWait:"Cancelar",
    joinWaitlist:"📋 Entrar na lista de espera",
    waitRegistration:"📋 Registrar na lista de espera",
    yourName:"Seu nome", namePlaceholder:"Ex: Silva",
    partySize:"Pessoas", cancel:"Cancelar", register:"Registrar",
    seatReady:"🔔 Sua mesa está pronta!",
    seatReadySub:"Por favor fale com um membro da equipe",
    enterAndOrder:"Entrar e Pedir →",
    waitingNow:"⏳ Na lista de espera",
    elapsedWait:"min espera · est.",
    timeLimitSeat:"limite de tempo", elapsedFrom:"Sentado", elapsedMin:"min",
    timeLimitWarn:"⚠️ O tempo está quase acabando. Por favor vá ao pagamento.",
    remaining:"restante",
    whatMeal:"Qual é a ocasião hoje?", sceneSubtitle:"A IA irá prever seu tempo de refeição com base na ocasião",
    seeMenu:"Ver Cardápio →", menu:"Cardápio",
    orderConfirm:"Confirmar Pedido", aiPrediction:"Previsão de saída IA",
    aiCalc:"Calculando…", placeOrder:"Confirmar Pedido ✓",
    orderDone:"Pedido feito!", orderDoneSub:"Enviado para a cozinha. Traremos em breve.",
    addMore:"Pedir mais", back:"← Voltar",
    orderTotal:"Confirmar (¥", subtotal:"Subtotal", tax:"Imposto (10%)", total:"Total",
    requestTitle:"Pedidos Especiais", requestSub:"Diga-nos como podemos tornar sua visita especial",
    quickRequests:"Pedidos Comuns", freeText:"Outros Pedidos",
    freeTextPlaceholder:"Ex: Surpresa de aniversário, preferência de assento…",
    allergyTitle:"⚠️ Alergias e Restrições Alimentares",
    sendRequest:"💌 Enviar para Equipe",
    requestSent:"Enviado para a Equipe!", requestSentSub:"Cuidaremos disso imediatamente.",
    changeRequest:"Editar / Adicionar",
    callTitle:"Chamar a Equipe", callSub:"Selecione um motivo e pressione o botão",
    callMemo:"Nota (opcional)", callMemoPh:"Detalhes adicionais…",
    callBtn:"🔔 Chamar Equipe", callSent:"✅ Equipe notificada",
    callSentSub:"Alguém estará com você em breve", callingNow:"⏳ A equipe está a caminho…",
    receiptTitle:"Sua Conta", orderContents:"Resumo do Pedido",
    payMethod:"Forma de Pagamento", payBtn:"💳 Pagar Agora",
    receiptEmail:"🧾 Recibo por Email",
    payDone:"Pagamento Completo", payDoneSub:"Obrigado! Esperamos te ver novamente 🍜",
    todaySpecial:"🍜 Especial do Dia: Ramen Especial",
    tableLabel:"Mesa", seatsLabel:"lugares",
  },
};

// Translated data per language
const MENU_NAMES = {
  ja: ["特製ラーメン","醤油ラーメン","餃子（6個）","唐揚げ","刺身盛合せ","焼き鳥5本","生ビール","日本酒（1合）","ソフトドリンク","抹茶アイス","コース（全8品）","飲み放題（2h）"],
  en: ["Special Ramen","Soy Sauce Ramen","Gyoza (6 pcs)","Fried Chicken","Sashimi Platter","Yakitori (5 skewers)","Draft Beer","Sake (1 go)","Soft Drink","Matcha Ice Cream","Course Meal (8 dishes)","All-you-can-drink (2h)"],
  ko: ["특제 라멘","간장 라멘","교자 (6개)","닭튀김","사시미 모둠","야키토리 5꼬치","생맥주","사케 (1홉)","소프트드링크","말차 아이스크림","코스 (전 8품)","음료 무제한 (2시간)"],
  es: ["Ramen Especial","Ramen de Soja","Gyoza (6 pcs)","Pollo Frito","Sashimi Variado","Yakitori (5 pinchos)","Cerveza de Grifo","Sake (1 go)","Bebida Sin Alcohol","Helado de Té Verde","Menú Degustación (8 platos)","Barra Libre (2h)"],
  pt: ["Ramen Especial","Ramen de Shoyu","Guioza (6 unid)","Frango Frito","Sashimi Sortido","Yakitori (5 espetos)","Chope","Saquê (1 go)","Refrigerante","Sorvete de Chá Verde","Curso (8 pratos)","Open Bar (2h)"],
};
const MENU_DESCS = {
  ja: ["濃厚豚骨スープ","あっさり醤油ベース","パリッと焼き餃子","ジューシー揚げたて","本日の鮮魚","タレ・塩が選べます","キンキンに冷えてます","本日のおすすめ銘柄","コーラ/オレンジ/ウーロン","国産抹茶使用","シェフおまかせ全8品","ドリンク全種飲み放題"],
  en: ["Rich pork bone broth","Light soy sauce base","Crispy pan-fried","Juicy fresh-fried","Today's fresh catch","Tare or salt seasoning","Ice cold","Today's recommended brand","Cola / Orange / Oolong","Japanese matcha","Chef's choice 8 courses","All drinks included"],
  ko: ["진한 돼지뼈 육수","깔끔한 간장 베이스","바삭한 군만두","즙이 많은 튀김","오늘의 신선한 생선","타레·소금 선택 가능","시원하게 차갑게","오늘의 추천 브랜드","콜라/오렌지/우롱","국산 말차 사용","셰프 오마카세 8품","모든 음료 무제한"],
  es: ["Caldo rico de huesos de cerdo","Base ligera de soya","Crujiente a la plancha","Pollo jugoso recién frito","Captura fresca del día","Salsa tare o sal","Bien fría","Marca recomendada hoy","Cola / Naranja / Té Oolong","Matcha japonés","8 platos del chef","Todas las bebidas incluidas"],
  pt: ["Caldo rico de ossos de porco","Base leve de shoyu","Crocante na frigideira","Frango suculento recém-frito","Peixe fresco do dia","Tempero tare ou sal","Bem gelada","Marca recomendada hoje","Cola / Laranja / Chá Oolong","Matcha japonês","8 pratos do chef","Todas as bebidas inclusas"],
};
const MENU_CATS = {
  ja: ["麺","麺","サイド","サイド","魚介","焼物","ドリンク","ドリンク","ドリンク","デザート","コース","セット"],
  en: ["Noodles","Noodles","Sides","Sides","Seafood","Grilled","Drinks","Drinks","Drinks","Dessert","Course","Set"],
  ko: ["면","면","사이드","사이드","해산물","구이","음료","음료","음료","디저트","코스","세트"],
  es: ["Fideos","Fideos","Acompañamientos","Acompañamientos","Mariscos","A la Plancha","Bebidas","Bebidas","Bebidas","Postre","Menú","Set"],
  pt: ["Macarrão","Macarrão","Acompanhamentos","Acompanhamentos","Frutos do Mar","Grelhados","Bebidas","Bebidas","Bebidas","Sobremesa","Curso","Set"],
};
const SCENE_LABELS = {
  ja: ["1人でサクッと","友人・家族と","デート","記念日","会食","宴会・飲み会"],
  en: ["Solo","With Friends","Date","Anniversary","Business","Party"],
  ko: ["혼자서","친구·가족과","데이트","기념일","비즈니스","파티"],
  es: ["Solo","Con Amigos","Cita","Aniversario","Negocios","Fiesta"],
  pt: ["Solo","Com Amigos","Encontro","Aniversário","Negócios","Festa"],
};
const SCENE_SUBS = {
  ja: ["さっと食べる","ゆっくり楽しむ","雰囲気重視","特別な日","仕事の席","盛り上がる"],
  en: ["Quick meal","Take your time","Romantic vibes","Special occasion","Work dinner","Let's celebrate"],
  ko: ["빠르게 먹기","천천히 즐기기","분위기 중시","특별한 날","업무 식사","신나게"],
  es: ["Comida rápida","Con calma","Ambiente romántico","Ocasión especial","Cena de negocios","A celebrar"],
  pt: ["Refeição rápida","Com calma","Clima romântico","Ocasião especial","Jantar de negócios","Vamos celebrar"],
};
const REQUEST_LABELS = {
  ja: ["誕生日プレート","記念日演出","ベビーチェア","窓側席を希望","静かな席を希望","お土産の包装"],
  en: ["Birthday Plate","Anniversary Setup","Baby Chair","Window Seat","Quiet Seat","Gift Wrapping"],
  ko: ["생일 플레이트","기념일 연출","유아 의자","창가 자리 희망","조용한 자리 희망","기념품 포장"],
  es: ["Plato de Cumpleaños","Decoración Aniversario","Silla para Bebé","Asiento con Vista","Asiento Tranquilo","Envoltura de Regalo"],
  pt: ["Prato de Aniversário","Decoração de Aniversário","Cadeira de Bebê","Assento com Vista","Assento Tranquilo","Embrulho de Presente"],
};
const ALLERGY_LABELS = {
  ja: ["卵","乳製品","小麦","そば","落花生","えび","魚介全般","アルコール","その他"],
  en: ["Eggs","Dairy","Wheat","Buckwheat","Peanuts","Shrimp","Seafood","Alcohol","Other"],
  ko: ["달걀","유제품","밀","메밀","땅콩","새우","해산물 전반","알코올","기타"],
  es: ["Huevos","Lácteos","Trigo","Alforfón","Maní","Camarones","Mariscos","Alcohol","Otro"],
  pt: ["Ovos","Laticínios","Trigo","Trigo Sarraceno","Amendoim","Camarão","Frutos do Mar","Álcool","Outro"],
};
const CALL_LABELS = {
  ja: ["お水をください","おしぼり","追加注文したい","お会計をお願いします","食器を下げてください","困ったことがある","その他"],
  en: ["Water Please","Wet Towel","Additional Order","Check Please","Clear Dishes","Need Help","Other"],
  ko: ["물 주세요","물수건","추가 주문","계산 부탁드려요","식기 치워주세요","도움이 필요해요","기타"],
  es: ["Agua, Por Favor","Toalla Húmeda","Pedir Más","La Cuenta","Retirar Platos","Necesito Ayuda","Otro"],
  pt: ["Água, Por Favor","Toalha Úmida","Pedir Mais","A Conta","Retirar Pratos","Preciso de Ajuda","Outro"],
};
const PAY_METHODS = {
  ja: [{l:"クレジットカード",e:"💳"},{l:"PayPay",e:"📱"},{l:"Apple Pay",e:"🍎"},{l:"交通系IC",e:"🚃"}],
  en: [{l:"Credit Card",e:"💳"},{l:"PayPay",e:"📱"},{l:"Apple Pay",e:"🍎"},{l:"IC Card",e:"🚃"}],
  ko: [{l:"신용카드",e:"💳"},{l:"PayPay",e:"📱"},{l:"Apple Pay",e:"🍎"},{l:"교통카드",e:"🚃"}],
  es: [{l:"Tarjeta de Crédito",e:"💳"},{l:"PayPay",e:"📱"},{l:"Apple Pay",e:"🍎"},{l:"Tarjeta IC",e:"🚃"}],
  pt: [{l:"Cartão de Crédito",e:"💳"},{l:"PayPay",e:"📱"},{l:"Apple Pay",e:"🍎"},{l:"Cartão IC",e:"🚃"}],
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const TIME_LIMITS = [
  { id:"none", label:"制限なし", minutes:null,  emoji:"♾️" },
  { id:"60",   label:"60分制",  minutes:60,    emoji:"⏱️" },
  { id:"90",   label:"90分制",  minutes:90,    emoji:"⏱️" },
  { id:"120",  label:"2時間制", minutes:120,   emoji:"⏱️" },
  { id:"180",  label:"3時間制", minutes:180,   emoji:"⏱️" },
];

const MENU = [
  { id:1,  name:"特製ラーメン",   price:980,  cat:"麺",       emoji:"🍜", desc:"濃厚豚骨スープ",     baseMin:18 },
  { id:2,  name:"醤油ラーメン",   price:880,  cat:"麺",       emoji:"🍜", desc:"あっさり醤油ベース", baseMin:15 },
  { id:3,  name:"餃子（6個）",    price:480,  cat:"サイド",   emoji:"🥟", desc:"パリッと焼き餃子",   baseMin:8  },
  { id:4,  name:"唐揚げ",         price:620,  cat:"サイド",   emoji:"🍗", desc:"ジューシー揚げたて", baseMin:12 },
  { id:5,  name:"刺身盛合せ",     price:1480, cat:"魚介",     emoji:"🐟", desc:"本日の鮮魚",         baseMin:30 },
  { id:6,  name:"焼き鳥5本",      price:620,  cat:"焼物",     emoji:"🍢", desc:"タレ・塩が選べます", baseMin:20 },
  { id:7,  name:"生ビール",       price:520,  cat:"ドリンク", emoji:"🍺", desc:"キンキンに冷えてます",baseMin:3 },
  { id:8,  name:"日本酒（1合）",  price:680,  cat:"ドリンク", emoji:"🍶", desc:"本日のおすすめ銘柄", baseMin:3  },
  { id:9,  name:"ソフトドリンク", price:320,  cat:"ドリンク", emoji:"🥤", desc:"コーラ/オレンジ/ウーロン",baseMin:2},
  { id:10, name:"抹茶アイス",     price:380,  cat:"デザート", emoji:"🍵", desc:"国産抹茶使用",       baseMin:8  },
  { id:11, name:"コース（全8品）",price:4800, cat:"コース",   emoji:"🍱", desc:"シェフおまかせ全8品",baseMin:90 },
  { id:12, name:"飲み放題（2h）", price:1500, cat:"セット",   emoji:"🥂", desc:"ドリンク全種飲み放題",baseMin:120},
];

const SCENES = [
  { id:"solo",     label:"1人でサクッと", emoji:"🧑", sub:"さっと食べる",   mult:1.0 },
  { id:"friends",  label:"友人・家族と",  emoji:"👥", sub:"ゆっくり楽しむ", mult:1.5 },
  { id:"date",     label:"デート",        emoji:"💑", sub:"雰囲気重視",     mult:1.8 },
  { id:"special",  label:"記念日",        emoji:"🎂", sub:"特別な日",       mult:2.2 },
  { id:"business", label:"会食",          emoji:"💼", sub:"仕事の席",       mult:2.5 },
  { id:"party",    label:"宴会・飲み会",  emoji:"🎉", sub:"盛り上がる",     mult:3.0 },
];

const QUICK_REQUESTS = [
  { id:"birthday",    label:"誕生日プレート",   emoji:"🎂" },
  { id:"anniversary", label:"記念日演出",        emoji:"🥂" },
  { id:"baby",        label:"ベビーチェア",      emoji:"👶" },
  { id:"window",      label:"窓側席を希望",      emoji:"🪟" },
  { id:"quiet",       label:"静かな席を希望",    emoji:"🔇" },
  { id:"wrap",        label:"お土産の包装",      emoji:"🎁" },
];

const ALLERGY_PRESETS = [
  { id:"egg",     label:"卵",         emoji:"🥚" },
  { id:"milk",    label:"乳製品",     emoji:"🥛" },
  { id:"wheat",   label:"小麦",       emoji:"🌾" },
  { id:"soba",    label:"そば",       emoji:"🍜" },
  { id:"peanut",  label:"落花生",     emoji:"🥜" },
  { id:"shrimp",  label:"えび",       emoji:"🦐" },
  { id:"fish",    label:"魚介全般",   emoji:"🐟" },
  { id:"alcohol", label:"アルコール", emoji:"🍶" },
  { id:"other",   label:"その他",     emoji:"⚠️" },
];

const CALL_REASONS = [
  { id:"water",     label:"お水をください",      emoji:"💧" },
  { id:"oshibori",  label:"おしぼり",            emoji:"🧻" },
  { id:"order",     label:"追加注文したい",       emoji:"📝" },
  { id:"payment",   label:"お会計をお願いします", emoji:"💳" },
  { id:"tableware", label:"食器を下げてください", emoji:"🍽️" },
  { id:"trouble",   label:"困ったことがある",     emoji:"🆘" },
  { id:"other",     label:"その他",              emoji:"🙋" },
];

const SEAT_TYPES = [
  { id:"table",   label:"テーブル席",  emoji:"🪑", en:"Table",    ko:"테이블석", es:"Mesa",       pt:"Mesa"      },
  { id:"counter", label:"カウンター席",emoji:"🍽️", en:"Counter",  ko:"카운터석", es:"Barra",      pt:"Balcão"    },
  { id:"single",  label:"1人席",       emoji:"👤", en:"Solo Seat",ko:"1인석",   es:"Individual", pt:"Individual"},
  { id:"private", label:"個室",        emoji:"🚪", en:"Private",  ko:"개인실",   es:"Privado",    pt:"Privativo" },
  { id:"tatami",  label:"座敷・畳",    emoji:"🏮", en:"Tatami",   ko:"다다미",   es:"Tatami",     pt:"Tatami"    },
];

const getSeatTypeLabel = (seatTypeId, lang) => {
  const st = SEAT_TYPES.find(x => x.id === seatTypeId) || SEAT_TYPES[0];
  return lang==="en" ? st.en : lang==="ko" ? st.ko : lang==="es" ? st.es : lang==="pt" ? st.pt : st.label;
};

const INIT_STORE = {
  name:        "麺屋 雅",
  nameRoman:   "MENYA MIYABI",
  emoji:       "🍜",
  logo:        null,   // base64 image or null
  floor:       ["1F","2F"],
  hours:       { open:"11:00", close:"22:00", lastOrder:"21:30" },
  currency:    "jpy",
  taxRate:     10,
  taxIncluded: false,
};

const CURRENCIES = [
  { id:"jpy", symbol:"¥",  label:"円 (JPY)",              locale:"ja-JP" },
  { id:"usd", symbol:"$",  label:"ドル (USD)",            locale:"en-US" },
  { id:"krw", symbol:"₩",  label:"ウォン (KRW)",          locale:"ko-KR" },
  { id:"eur", symbol:"€",  label:"ユーロ (EUR)",           locale:"de-DE" },
  { id:"brl", symbol:"R$", label:"レアル (BRL)",          locale:"pt-BR" },
  { id:"sgd", symbol:"S$", label:"シンガポールドル (SGD)", locale:"en-SG" },
  { id:"cny", symbol:"¥",  label:"人民元 (CNY)",           locale:"zh-CN" },
  { id:"gbp", symbol:"£",  label:"ポンド (GBP)",           locale:"en-GB" },
];

const fmtPrice = (amount, currency="jpy") => {
  const c = CURRENCIES.find(x=>x.id===currency)||CURRENCIES[0];
  return `${c.symbol}${Math.round(amount).toLocaleString()}`;
};
const INIT_RESERVATIONS = [
  { id:"rv1", name:"山田",    phone:"090-1234-5678", seats:2, date:new Date().toISOString().slice(0,10), time:"18:00", scene:"date",     requests:[{id:"anniversary",label:"記念日演出",emoji:"🥂"}], allergies:[], note:"窓側希望", status:"confirmed" },
  { id:"rv2", name:"田中グループ", phone:"090-9876-5432", seats:6, date:new Date().toISOString().slice(0,10), time:"19:00", scene:"party",    requests:[], allergies:["wheat"], note:"誕生日会です", status:"confirmed" },
  { id:"rv3", name:"Smith",  phone:"",              seats:2, date:new Date().toISOString().slice(0,10), time:"20:00", scene:"business", requests:[], allergies:[], note:"", status:"confirmed" },
];
const NOW = Date.now();
const mkOrders = ids => { const c={}; ids.forEach(id=>{c[id]=(c[id]||0)+1;}); return Object.entries(c).map(([mid,qty])=>({menuId:Number(mid),qty,served:false})); };

// ─── Initial shared state ─────────────────────────────────────
const INIT_TABLES = [
  { id:1, seats:2, seatType:"table",   floor:"1F", occupied:true,  scene:"date",     startedAt:NOW-38*60000, orders:mkOrders([1,7,10]),   timeLimitId:"120", requests:[], allergies:[], calls:[], paymentStatus:"unpaid", paidAt:null, revenue:0 },
  { id:2, seats:4, seatType:"table",   floor:"1F", occupied:true,  scene:"friends",  startedAt:NOW-55*60000, orders:mkOrders([3,4,7,7]),  timeLimitId:"90",  requests:[], allergies:["milk"], calls:[], paymentStatus:"unpaid", paidAt:null, revenue:0 },
  { id:3, seats:2, seatType:"counter", floor:"1F", occupied:true,  scene:"friends",  startedAt:NOW-10*60000, orders:mkOrders([1,7]),      timeLimitId:"90",  requests:[], allergies:[], calls:[], paymentStatus:"unpaid", paidAt:null, revenue:0 },
  { id:4, seats:6, seatType:"table",   floor:"1F", occupied:true,  scene:"party",    startedAt:NOW-22*60000, orders:mkOrders([12,6,3,5]), timeLimitId:"120", requests:[{id:"birthday",label:"誕生日プレート",emoji:"🎂"}], allergies:["egg"], calls:[], paymentStatus:"unpaid", paidAt:null, revenue:0 },
  { id:5, seats:2, seatType:"private", floor:"2F", occupied:true,  scene:"business", startedAt:NOW-84*60000, orders:mkOrders([11,8,8]),   timeLimitId:"none",requests:[], allergies:[], calls:[], paymentStatus:"unpaid", paidAt:null, revenue:0 },
  { id:6, seats:4, seatType:"table",   floor:"2F", occupied:true,  scene:"date",     startedAt:NOW-25*60000, orders:mkOrders([5,7,7]),    timeLimitId:"120", requests:[], allergies:[], calls:[], paymentStatus:"unpaid", paidAt:null, revenue:0 },
  { id:7, seats:1, seatType:"single",  floor:"2F", occupied:false, scene:null, startedAt:null, orders:[], timeLimitId:"60",  requests:[], allergies:[], calls:[], paymentStatus:"unpaid", paidAt:null, revenue:0 },
  { id:8, seats:8, seatType:"tatami",  floor:"2F", occupied:true,  scene:"party",    startedAt:NOW-30*60000, orders:mkOrders([12,6,6,3]), timeLimitId:"120", requests:[], allergies:[], calls:[], paymentStatus:"unpaid", paidAt:null, revenue:0 },
];

// waitQueue: [{ id, name, seats, joinedAt, notified, done }]
const INIT_QUEUE = [];

const SALES_HISTORY = [
  { tableId:11, seats:2, scene:"solo",    paidAt:NOW-3*3600000,   revenue:1460, paymentMethod:"card" },
  { tableId:12, seats:4, scene:"friends", paidAt:NOW-2.5*3600000, revenue:5840, paymentMethod:"cash" },
  { tableId:13, seats:2, scene:"date",    paidAt:NOW-2*3600000,   revenue:3880, paymentMethod:"card" },
];

// ─── Helpers ─────────────────────────────────────────────────
const elMin   = t => t.startedAt ? Math.floor((Date.now()-t.startedAt)/60000) : 0;
const tlRem   = t => { const tl=TIME_LIMITS.find(x=>x.id===t.timeLimitId); if(!tl?.minutes||!t.startedAt) return null; return Math.max(tl.minutes-elMin(t),0); };
const calcRev = t => t.orders.reduce((s,o)=>{ const m=MENU.find(x=>x.id===o.menuId); return s+(m?.price||0)*o.qty; },0);
const estRem  = t => { const r=tlRem(t); const sc=SCENES.find(s=>s.id===t.scene); if(!sc||!t.orders.length) return r??30; const mb=Math.max(...t.orders.map(o=>MENU.find(m=>m.id===o.menuId)?.baseMin||15)); const ai=Math.max(Math.round(mb*sc.mult-elMin(t)),2); return r!==null?Math.min(ai,r):ai; };
const fmtSec  = s => `${String(Math.floor(Math.max(0,s)/60)).padStart(2,"0")}:${String(Math.max(0,s)%60).padStart(2,"0")}`;
const fmtTime = ts => { const d=new Date(ts); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`; };
const waitMin = ts => Math.floor((Date.now()-ts)/60000);

// ─── Colors ──────────────────────────────────────────────────
const C = {
  bg:"#0a0908",   surf:"#131110",  surf2:"#1a1815", bdr:"#222018",
  amber:"#d4962e",amberD:"#d4962e15",amberM:"#d4962e44",
  green:"#3db870",greenD:"#3db87015",
  red:"#e04545",  redD:"#e0454515",
  blue:"#4a8fd4", blueD:"#4a8fd415",
  purple:"#9b6de8",purpleD:"#9b6de815",
  orange:"#e08030",orangeD:"#e0803015",
  txt:"#ede6d0",  muted:"#635d50",  faint:"#1c1a16",
};

// ═══════════════════════════════════════════════════════════════
// SHARED STATE REDUCER
// ═══════════════════════════════════════════════════════════════
function reducer(state, action) {
  switch(action.type) {

    // ── Customer actions ──────────────────────────────────────
    case "CUSTOMER_CALL": {
      // Customer sends a call → store sees it immediately
      const { tableId, reason, note } = action;
      return { ...state, tables: state.tables.map(t => t.id!==tableId ? t : {
        ...t, calls: [...t.calls, { id:reason.id, label:reason.label, emoji:reason.emoji, note, time:Date.now(), done:false }]
      })};
    }
    case "CUSTOMER_ORDER": {
      const { tableId, orderItems, scene } = action;
      return { ...state, tables: state.tables.map(t => t.id!==tableId ? t : {
        ...t, orders:[...t.orders, ...orderItems], scene: scene||t.scene, startedAt: t.startedAt||Date.now()
      })};
    }
    case "CUSTOMER_REQUEST": {
      const { tableId, requests, allergies } = action;
      return { ...state, tables: state.tables.map(t => t.id!==tableId ? t : { ...t, requests, allergies })};
    }
    case "CUSTOMER_JOIN_QUEUE": {
      const { name, seats } = action;
      const newEntry = { id:action.id, name, seats, joinedAt:Date.now(), notified:false, done:false };
      return { ...state, waitQueue: [...state.waitQueue, newEntry] };
    }
    case "CUSTOMER_LEAVE_QUEUE": {
      return { ...state, waitQueue: state.waitQueue.filter(w=>w.id!==action.id) };
    }
    case "CUSTOMER_PAY": {
      const t = state.tables.find(x=>x.id===action.tableId);
      if(!t) return state;
      return { ...state, tables: state.tables.map(x=>x.id!==action.tableId?x:{...x,paymentStatus:"paid",paidAt:Date.now(),revenue:calcRev(x),paymentMethod:"card"})};
    }
    case "CUSTOMER_PAY_CASH": {
      // Customer declares cash payment → store must collect
      const t = state.tables.find(x=>x.id===action.tableId);
      if(!t) return state;
      return { ...state, tables: state.tables.map(x=>x.id!==action.tableId?x:{...x,paymentStatus:"cash_pending",revenue:calcRev(x),paymentMethod:"cash"})};
    }
    case "STORE_COLLECT_CASH": {
      // Store confirms cash collected
      return { ...state, tables: state.tables.map(x=>x.id!==action.tableId?x:{...x,paymentStatus:"paid",paidAt:Date.now()})};
    }

    // ── Store actions ─────────────────────────────────────────
    case "STORE_DISMISS_CALL": {
      const { tableId, callTime } = action;
      return { ...state, tables: state.tables.map(t=>t.id!==tableId?t:{...t,calls:t.calls.map(c=>c.time===callTime?{...c,done:true}:c)})};
    }
    case "STORE_TOGGLE_SERVED": {
      const { tableId, idx } = action;
      return { ...state, tables: state.tables.map(t=>t.id!==tableId?t:{...t,orders:t.orders.map((o,i)=>i===idx?{...o,served:!o.served}:o)})};
    }
    case "STORE_MARK_PAID": {
      const t = state.tables.find(x=>x.id===action.tableId);
      if(!t) return state;
      return { ...state, tables: state.tables.map(x=>x.id!==action.tableId?x:{...x,paymentStatus:"paid",paidAt:Date.now(),revenue:calcRev(x),paymentMethod:action.paymentMethod||"card"})};
    }
    case "STORE_CLEAR_TABLE": {
      const t = state.tables.find(x=>x.id===action.tableId);
      const newSales = (t?.paymentStatus==="paid"||t?.paymentStatus==="cash_pending") ? [...state.salesHistory,{tableId:t.id,seats:t.seats,scene:t.scene,paidAt:t.paidAt||Date.now(),revenue:t.revenue,paymentMethod:t.paymentMethod||"card"}] : state.salesHistory;
      return { ...state, salesHistory:newSales, tables:state.tables.map(x=>x.id!==action.tableId?x:{...x,occupied:false,scene:null,startedAt:null,orders:[],requests:[],allergies:[],calls:[],paymentStatus:"unpaid",paidAt:null,revenue:0,paymentMethod:null})};
    }
    case "STORE_SET_TL": {
      return { ...state, tables: state.tables.map(t=>t.id!==action.tableId?t:{...t,timeLimitId:action.tlId})};
    }
    case "STORE_SET_SEAT_TYPE": {
      return { ...state, tables: state.tables.map(t=>t.id!==action.tableId?t:{...t,seatType:action.seatType,seats:action.seats})};
    }
    case "STORE_SET_ALL_TL": {
      return { ...state, tables: state.tables.map(t=>({...t,timeLimitId:action.tlId}))};
    }
    case "STORE_SEAT_TABLE": {
      return { ...state, tables: state.tables.map(t=>t.id!==action.tableId?t:{...t,occupied:true,startedAt:Date.now(),scene:"friends",orders:[],paymentStatus:"unpaid"})};
    }
    case "STORE_NOTIFY_QUEUE": {
      return { ...state, waitQueue: state.waitQueue.map(w=>w.id!==action.id?w:{...w,notified:true})};
    }
    case "STORE_REMOVE_QUEUE": {
      return { ...state, waitQueue: state.waitQueue.filter(w=>w.id!==action.id)};
    }
    case "MENU_TOGGLE_SOLDOUT": {
      return { ...state, menuItems: state.menuItems.map(m=>m.id!==action.id?m:{...m,soldOut:!m.soldOut})};
    }
    case "MENU_UPDATE_PRICE": {
      return { ...state, menuItems: state.menuItems.map(m=>m.id!==action.id?m:{...m,price:action.price})};
    }
    case "MENU_ADD_ITEM": {
      const newId = Math.max(...state.menuItems.map(m=>m.id),0)+1;
      return { ...state, menuItems: [...state.menuItems, {...action.item, id:newId, soldOut:false}]};
    }
    case "MENU_UPDATE_ITEM": {
      return { ...state, menuItems: state.menuItems.map(m=>m.id!==action.id?m:{...m,...action.data})};
    }
    case "MENU_DELETE_ITEM": {
      return { ...state, menuItems: state.menuItems.filter(m=>m.id!==action.id)};
    }
    case "RESERVATION_ADD": {
      const newId = `r${Date.now()}`;
      return { ...state, reservations:[...state.reservations,{...action.data,id:newId,status:"confirmed"}]};
    }
    case "RESERVATION_UPDATE": {
      return { ...state, reservations:state.reservations.map(r=>r.id!==action.id?r:{...r,...action.data})};
    }
    case "RESERVATION_DELETE": {
      return { ...state, reservations:state.reservations.filter(r=>r.id!==action.id)};
    }
    case "RESERVATION_SEAT": {
      // Seat the reservation — move to a table
      const r = state.reservations.find(x=>x.id===action.id);
      if(!r) return state;
      return {
        ...state,
        reservations: state.reservations.map(x=>x.id!==action.id?x:{...x,status:"seated",seatedAt:Date.now()}),
        tables: state.tables.map(t=>t.id!==action.tableId?t:{...t,occupied:true,startedAt:Date.now(),scene:r.scene||"friends",orders:[],paymentStatus:"unpaid",requests:r.requests||[],allergies:r.allergies||[]}),
      };
    }
    case "MENU_MOVE": {
      // Move item up or down within its category
      const { id, dir } = action;
      const items = [...state.menuItems];
      const idx = items.findIndex(m=>m.id===id);
      if(idx<0) return state;
      const cat = items[idx].cat;
      const catItems = items.filter(m=>m.cat===cat);
      const catIdx = catItems.findIndex(m=>m.id===id);
      const newCatIdx = catIdx + dir;
      if(newCatIdx<0||newCatIdx>=catItems.length) return state;
      // Swap in catItems
      const tmp = catItems[catIdx];
      catItems[catIdx] = catItems[newCatIdx];
      catItems[newCatIdx] = tmp;
      // Rebuild full list preserving other categories order
      let ci = 0;
      const result = items.map(m=>m.cat===cat ? catItems[ci++] : m);
      return { ...state, menuItems: result };
    }

    default: return state;
  }
}

// ═══════════════════════════════════════════════════════════════
// SHARED UI ATOMS
// ═══════════════════════════════════════════════════════════════
function Bar({pct,col=C.amber,h=4}){
  return <div style={{height:`${h}px`,background:C.faint,borderRadius:"2px",overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,pct))}%`,background:col,borderRadius:"2px",transition:"width 0.5s"}}/></div>;
}
function Badge({col="amber",size="sm",children}){
  const map={amber:[C.amberD,C.amber,C.amberM],green:[C.greenD,C.green,C.green+"44"],red:[C.redD,C.red,C.red+"44"],blue:[C.blueD,C.blue,C.blue+"44"],purple:[C.purpleD,C.purple,C.purple+"44"],orange:[C.orangeD,C.orange,C.orange+"44"]};
  const[bg,fc,bc]=map[col]||map.amber;
  return <span style={{display:"inline-flex",alignItems:"center",gap:"3px",padding:size==="lg"?"5px 12px":"2px 8px",borderRadius:"20px",fontSize:size==="lg"?"12px":"10px",fontWeight:700,background:bg,color:fc,border:`1px solid ${bc}`,whiteSpace:"nowrap"}}>{children}</span>;
}
function Ring({remaining,total,size=72}){
  const[sec,setSec]=useState(remaining*60);
  useEffect(()=>{setSec(remaining*60);const t=setInterval(()=>setSec(s=>Math.max(0,s-1)),1000);return()=>clearInterval(t);},[remaining]);
  const r=(size-7)/2,circ=2*Math.PI*r,pct=total>0?Math.max(0,sec/(total*60)):0;
  const col=pct>0.4?C.green:pct>0.15?C.amber:C.red;
  return <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.faint} strokeWidth="4.5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="4.5" strokeDasharray={`${pct*circ} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 1s linear,stroke 0.4s"}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:"12px",fontWeight:700,color:col,fontFamily:"'Shippori Mincho',serif",lineHeight:1}}>{fmtSec(sec)}</div>
      <div style={{fontSize:"7px",color:C.muted,marginTop:"1px"}}>残り</div>
    </div>
  </div>;
}

const card  = (x={}) => ({background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:"13px",overflow:"hidden",marginBottom:"10px",...x});
const pad   = {padding:"14px"};
const row   = {display:"flex",alignItems:"center",gap:"8px"};
const lbl   = {fontSize:"9px",color:C.muted,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"5px"};

const Btn = ({v="primary",onClick,disabled,style={},children}) => {
  const styles = {
    primary: {background:C.amber,color:C.bg,border:"none"},
    ghost:   {background:"transparent",color:C.muted,border:`1px solid ${C.bdr}`},
    green:   {background:C.greenD,color:C.green,border:`1px solid ${C.green}44`},
    red:     {background:C.redD,color:C.red,border:`1px solid ${C.red}44`},
    blue:    {background:C.blueD,color:C.blue,border:`1px solid ${C.blue}44`},
    purple:  {background:C.purpleD,color:C.purple,border:`1px solid ${C.purple}44`},
  };
  return <button onClick={onClick} disabled={disabled}
    style={{display:"block",width:"100%",padding:"13px",borderRadius:"10px",fontSize:"13px",fontWeight:700,cursor:"pointer",transition:"all 0.15s",fontFamily:"'Noto Sans JP',sans-serif",opacity:disabled?0.35:1,...(styles[v]||styles.primary),...style}}>
    {children}
  </button>;
};

// ═══════════════════════════════════════════════════════════════
// CUSTOMER VIEW
// ═══════════════════════════════════════════════════════════════
// デモ用：テーブル7番を客用テーブルとして使う
const CUSTOMER_TABLE_ID = 7;

function CustomerView({ state, dispatch, myQueueId, setMyQueueId, cashMode, store, menuItems }) {
  const table = state.tables.find(x=>x.id===CUSTOMER_TABLE_ID);
  const[seated, setSeated] = useState(table?.occupied ?? false);
  useEffect(()=>{ if(table?.occupied) setSeated(true); },[table?.occupied]);
  const[lang, setLang] = useState("ja");
  const t = TR[lang] || TR.ja;
  const font = LANGUAGES.find(l=>l.id===lang)?.font || "'Noto Sans JP',sans-serif";

  if(!seated) return <CustomerWaitScreen
    state={state} dispatch={dispatch}
    myQueueId={myQueueId} setMyQueueId={setMyQueueId}
    onEnter={()=>setSeated(true)}
    lang={lang} setLang={setLang} t={t} font={font} store={store}
  />;

  return <CustomerOrderApp table={table} dispatch={dispatch} lang={lang} setLang={setLang} t={t} font={font} cashMode={cashMode} store={store} menuItems={menuItems}/>;
}

// ── Language Selector ─────────────────────────────────────────
function LangSelector({ lang, setLang, dark=false }){
  const[open,setOpen]=useState(false);
  const cur=LANGUAGES.find(l=>l.id===lang);
  return <div style={{position:"relative"}}>
    <button onClick={()=>setOpen(!open)}
      style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 10px",borderRadius:"20px",background:dark?"#ffffff18":"#00000030",border:`1px solid ${dark?"#ffffff33":"#ffffff22"}`,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",fontSize:"11px",fontWeight:700,color:dark?C.txt:"#fff"}}>
      <span style={{fontSize:"14px"}}>{cur?.flag}</span>
      <span>{cur?.label}</span>
      <span style={{fontSize:"9px",opacity:0.6}}>{open?"▲":"▼"}</span>
    </button>
    {open&&<div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:C.surf2,border:`1px solid ${C.bdr}`,borderRadius:"12px",padding:"6px",zIndex:300,minWidth:"140px",boxShadow:"0 8px 24px #00000066"}}>
      {LANGUAGES.map(l=>(
        <button key={l.id} onClick={()=>{setLang(l.id);setOpen(false);}}
          style={{display:"flex",alignItems:"center",gap:"8px",width:"100%",padding:"8px 10px",borderRadius:"8px",background:lang===l.id?C.amberD:"transparent",border:"none",cursor:"pointer",fontFamily:l.font,fontSize:"12px",fontWeight:lang===l.id?700:400,color:lang===l.id?C.amber:C.txt,textAlign:"left"}}>
          <span style={{fontSize:"16px"}}>{l.flag}</span>
          <span>{l.label}</span>
          {lang===l.id&&<span style={{marginLeft:"auto",color:C.amber,fontSize:"10px"}}>✓</span>}
        </button>
      ))}
    </div>}
  </div>;
}

// ── Wait Screen ───────────────────────────────────────────────
function CustomerWaitScreen({ state, dispatch, myQueueId, setMyQueueId, onEnter, lang, setLang, t, font, store }) {
  const[showJoin, setShowJoin] = useState(false);
  const[name, setName] = useState("");
  const[seats, setSeats] = useState(2);
  const[,tick] = useState(0);
  useEffect(()=>{const tm=setInterval(()=>tick(n=>n+1),30000);return()=>clearInterval(tm);},[]);

  const activeQueue = state.waitQueue.filter(w=>!w.done);
  const myQueueEntry = myQueueId ? state.waitQueue.find(w=>w.id===myQueueId) : null;

  const occ = state.tables.filter(x=>x.occupied&&x.paymentStatus!=="cleared");
  const free = state.tables.filter(x=>!x.occupied);
  const allSeats = state.tables.reduce((s,x)=>s+x.seats,0);
  const occSeats = occ.reduce((s,x)=>s+x.seats,0);
  const pct = Math.round(occSeats/allSeats*100);

  const sorted = occ.map(x=>({...x,rem:estRem(x)})).sort((a,b)=>a.rem-b.rem);
  const nextFree = sorted[0];

  const cumWait = pos => {
    if(pos<=0) return nextFree?.rem??0;
    return (nextFree?.rem??20) + pos * 25;
  };

  function doJoin(){
    if(!name.trim()) return;
    const newId = `w${Date.now()}`;
    dispatch({ type:"CUSTOMER_JOIN_QUEUE", id:newId, name:name.trim(), seats });
    setMyQueueId(newId);
    setShowJoin(false);
  }

  const stCol = pct>80?C.red:pct>50?C.amber:C.green;
  const notified = myQueueEntry?.notified;

  return <div style={{minHeight:"100%",background:C.bg,display:"flex",flexDirection:"column",fontFamily:font}}>
    <style>{`
      @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
      @keyframes glow{0%,100%{box-shadow:0 0 20px ${C.green}44}50%{box-shadow:0 0 40px ${C.green}88}}
      @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    `}</style>

    {/* ── STICKY STATUS BAR (shown when in queue) ── */}
    {myQueueEntry && !myQueueEntry.done && (
      <div style={{
        position:"sticky", top:0, zIndex:200,
        background: notified ? C.green : C.amber,
        padding:"0",
        animation:"fadeIn 0.3s ease",
      }}>
        {notified ? (
          /* ── SEAT READY ── */
          <div style={{
            padding:"16px 18px",
            display:"flex", alignItems:"center", gap:"14px",
            animation:"glow 1.5s ease-in-out infinite",
          }}>
            <div style={{fontSize:"36px", animation:"pulse 1s ease-in-out infinite", flexShrink:0}}>🔔</div>
            <div style={{flex:1}}>
              <div style={{fontSize:"16px", fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:"3px"}}>
                {t.seatReady}
              </div>
              <div style={{fontSize:"12px", color:"rgba(255,255,255,0.8)"}}>
                {t.seatReadySub}
              </div>
            </div>
            <button onClick={onEnter} style={{
              background:"#fff", color:C.green, border:"none",
              borderRadius:"10px", padding:"10px 16px",
              fontSize:"12px", fontWeight:800, cursor:"pointer",
              fontFamily:font, flexShrink:0, whiteSpace:"nowrap",
            }}>
              {lang==="ja"?"入店する":lang==="ko"?"입장하기":lang==="en"?"Enter →":lang==="es"?"Entrar →":"Entrar →"}
            </button>
          </div>
        ) : (
          /* ── WAITING STATUS ── */
          <div>
            <div style={{padding:"12px 18px 10px", display:"flex", alignItems:"center", gap:"12px"}}>
              {/* Position number */}
              <div style={{
                width:"52px", height:"52px", borderRadius:"12px",
                background:"rgba(0,0,0,0.25)",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                flexShrink:0,
              }}>
                <div style={{fontSize:"26px", fontWeight:800, color:"#fff", lineHeight:1, fontFamily:"'Shippori Mincho',serif"}}>
                  {activeQueue.findIndex(w=>w.id===myQueueEntry.id)+1}
                </div>
                <div style={{fontSize:"8px", color:"rgba(255,255,255,0.7)", marginTop:"1px"}}>{t.myPosition}</div>
              </div>
              {/* Info */}
              <div style={{flex:1}}>
                <div style={{fontSize:"11px", color:"rgba(255,255,255,0.75)", marginBottom:"3px"}}>
                  {t.waitingNow} · {myQueueEntry.name}
                </div>
                <div style={{display:"flex", alignItems:"baseline", gap:"6px"}}>
                  <span style={{fontSize:"22px", fontWeight:800, color:"#fff", fontFamily:"'Shippori Mincho',serif", lineHeight:1}}>
                    {t.approx}{cumWait(activeQueue.findIndex(w=>w.id===myQueueEntry.id))}
                  </span>
                  <span style={{fontSize:"12px", color:"rgba(255,255,255,0.8)", fontWeight:700}}>{t.minutesSuffix}</span>
                  <span style={{fontSize:"11px", color:"rgba(255,255,255,0.6)"}}>{t.waitEstimate}</span>
                </div>
              </div>
              {/* Cancel */}
              <button onClick={()=>dispatch({type:"CUSTOMER_LEAVE_QUEUE",id:myQueueEntry.id})}
                style={{background:"rgba(0,0,0,0.2)",color:"rgba(255,255,255,0.7)",border:"none",borderRadius:"8px",padding:"6px 10px",fontSize:"10px",cursor:"pointer",fontFamily:font,flexShrink:0}}>
                {t.cancelWait}
              </button>
            </div>
            {/* Progress bar */}
            <div style={{height:"3px", background:"rgba(0,0,0,0.2)"}}>
              <div style={{
                height:"100%",
                width:`${Math.min(100, waitMin(myQueueEntry.joinedAt)/Math.max(1,cumWait(activeQueue.findIndex(w=>w.id===myQueueEntry.id)))*100)}%`,
                background:"rgba(255,255,255,0.6)",
                transition:"width 30s linear",
              }}/>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Hero */}
    <div style={{padding:`${myQueueEntry?"20px":"36px"} 20px 18px`,textAlign:"center",background:`linear-gradient(160deg,#1a1508,${C.bg})`,position:"relative"}}>
      <div style={{position:"absolute",top:"14px",right:"16px"}}>
        <LangSelector lang={lang} setLang={setLang}/>
      </div>
      <div style={{fontSize:"52px",marginBottom:"10px"}}>
        {store?.logo
          ? <img src={store.logo} style={{width:"64px",height:"64px",borderRadius:"16px",objectFit:"cover",display:"block",margin:"0 auto"}}/>
          : store?.emoji||"🍜"
        }
      </div>
      <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:myQueueEntry?"20px":"26px",fontWeight:800,marginBottom:"3px"}}>{store?.name||t.storeName}</div>
      <div style={{fontSize:"10px",color:C.muted,letterSpacing:"0.2em"}}>{store?.nameRoman||t.storeRoman}</div>
    </div>

    <div style={{padding:"0 16px",flex:1}}>

      {/* Congestion */}
      <div style={card({border:`1px solid ${stCol}44`})}>
        <div style={{...pad,background:stCol===C.red?C.redD:stCol===C.amber?C.amberD:C.greenD}}>
          <div style={{...row,justifyContent:"space-between",marginBottom:"8px"}}>
            <div>
              <div style={lbl}>{t.congestion}</div>
              <div style={{fontSize:"12px"}}><span style={{color:stCol,fontWeight:700}}>{occSeats}</span><span style={{color:C.muted}}>/{allSeats} {t.seatsOccupied}</span></div>
            </div>
            <div style={{fontSize:"42px",fontWeight:700,color:stCol,fontFamily:"'Shippori Mincho',serif",lineHeight:1}}>{pct}<span style={{fontSize:"18px"}}>%</span></div>
          </div>
          <Bar pct={pct} col={stCol}/>
          <div style={{display:"flex",gap:"6px",marginTop:"10px",flexWrap:"wrap"}}>
            <Badge col={pct>80?"red":pct>50?"amber":"green"}>{pct>80?t.crowded:pct>50?t.moderate:t.available}</Badge>
            {free.length>0 && <Badge col="green">✅ {free.reduce((s,x)=>s+x.seats,0)} {t.seatsAvailable}</Badge>}
            {activeQueue.length>0 && <Badge col="amber">⏳ {activeQueue.length} {t.groupsWaiting}</Badge>}
          </div>
        </div>
      </div>

      {/* Free seats */}
      {free.length>0 && (
        <div style={card({border:`1px solid ${C.green}55`})}>
          <div style={{...pad,background:C.greenD}}>
            <div style={{fontSize:"13px",color:C.green,fontWeight:700,marginBottom:"10px"}}>✅ {t.enterNow.replace("→","").trim()}</div>
            {free.map((x,i)=><div key={x.id} style={{...row,justifyContent:"space-between",padding:"5px 0"}}>
              <span style={{fontSize:"12px"}}>🪑 {x.seats} {t.seatsLabel}</span>
              <Badge col="blue">{TIME_LIMITS.find(tl=>tl.id===x.timeLimitId)?.label}</Badge>
            </div>)}
            <div style={{marginTop:"12px"}}>
              <Btn v="primary" onClick={onEnter}>{t.enterNow}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Full banner — only when truly no free tables */}
      {free.length===0 && nextFree && (
        <div style={card({border:`1px solid ${C.red}55`})}>
          <div style={{...pad,background:C.redD}}>
            <div style={{fontSize:"13px",color:C.red,fontWeight:700,marginBottom:"10px"}}>{t.fullNow}</div>
            <div style={row}>
              <div style={{flex:1}}>
                <div style={{fontSize:"11px",color:C.muted,marginBottom:"3px"}}>{t.nextFree}</div>
                <div style={{fontSize:"38px",fontWeight:700,color:C.amber,fontFamily:"'Shippori Mincho',serif",lineHeight:1}}>
                  {t.approx}{nextFree.rem}<span style={{fontSize:"16px",color:C.muted}}>{t.minutesLater}</span>
                </div>
                {tlRem(nextFree)!==null && <div style={{fontSize:"11px",color:C.blue,marginTop:"4px"}}>⏱ {tlRem(nextFree)}{t.minutes} {t.remaining}</div>}
              </div>
              {tlRem(nextFree)!==null && <Ring remaining={tlRem(nextFree)} total={TIME_LIMITS.find(x=>x.id===nextFree.timeLimitId)?.minutes||120}/>}
            </div>
          </div>
        </div>
      )}

      {/* Table departure predictions — sorted earliest first, no personal info */}
      {occ.length>0 && (() => {
        const predictions = [...occ]
          .map(x => ({ id:x.id, rem: estRem(x), tlr: tlRem(x), tlId: x.timeLimitId }))
          .sort((a, b) => a.rem - b.rem)
          .slice(0, 5);
        const maxRem = Math.max(...predictions.map(p => p.rem), 1);
        return (
          <div style={{ marginBottom: "10px" }}>
            <div style={{ ...lbl, padding: "2px 2px 8px" }}>{t.tablePredictions}</div>
            <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: "13px", overflow: "hidden" }}>
              <div style={{ padding: "6px 14px" }}>
                {predictions.map((p, i) => {
                  const tableData = occ.find(x=>x.id===p.id);
                  const seatType = SEAT_TYPES.find(s=>s.id===tableData?.seatType) || SEAT_TYPES[0];
                  const tableLabel = lang==="ko" ? `테이블 ${p.id}` : lang==="es" ? `Mesa ${p.id}` : lang==="pt" ? `Mesa ${p.id}` : lang==="en" ? `Table ${p.id}` : `テーブル ${p.id}`;
                  const seatsCount = tableData?.seats || 0;
                  const seatsText = lang==="ko" ? `${seatsCount}석` : lang==="en" ? `${seatsCount} seats` : lang==="es"||lang==="pt" ? `${seatsCount} asientos` : `${seatsCount}席`;
                  const col2 = p.rem <= 15 ? C.red : p.rem <= 30 ? C.amber : C.blue;
                  const tl = TIME_LIMITS.find(x => x.id === p.tlId);
                  const isFirst = i === 0;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "13px 0",
                      borderBottom: i < predictions.length - 1 ? `1px solid ${C.faint}` : "none",
                    }}>
                      {/* Table badge + bar */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display:"inline-flex", alignItems:"center", gap:"5px",
                          background:`${col2}18`, border:`1px solid ${col2}44`,
                          borderRadius:"6px", padding:"3px 8px",
                          fontSize:"11px", fontWeight:700, color:col2,
                          marginBottom:"7px",
                        }}>
                          {seatType.emoji} {tableLabel}
                          <span style={{fontWeight:400,color:C.muted,fontSize:"10px"}}>
                            · {getSeatTypeLabel(seatType.id,lang)} · {seatsText}
                          </span>
                        </div>
                        <div style={{ height: "5px", background: C.faint, borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${Math.max(6, (p.rem / maxRem) * 100)}%`,
                            background: col2, borderRadius: "3px", transition: "width 0.5s",
                          }} />
                        </div>
                        {tl?.minutes && p.tlr !== null && (
                          <div style={{ fontSize: "9px", color: C.blue, marginTop: "4px" }}>⏱ {tl.label}</div>
                        )}
                      </div>
                      {/* Time */}
                      <div style={{ textAlign: "right", flexShrink: 0, minWidth: "80px" }}>
                        <span style={{
                          fontSize: isFirst ? "30px" : "22px",
                          fontWeight: 700, color: col2,
                          fontFamily: "'Shippori Mincho',serif", lineHeight: 1,
                        }}>
                          {t.approx}{p.rem}
                        </span>
                        <span style={{ fontSize: "12px", color: C.muted, marginLeft: "3px" }}>{t.minutesSuffix}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Wait queue — no names shown, only position numbers + "you" indicator */}
      {activeQueue.length > 0 && (() => {
        const myPos = myQueueEntry ? activeQueue.findIndex(w => w.id === myQueueEntry.id) : -1;
        const youLabel = lang==="ja"?"あなた":lang==="ko"?"나":lang==="es"?"Tú":lang==="pt"?"Você":"You";
        const posLabel = lang==="ja"?"あなたの順番":lang==="ko"?"내 순번":lang==="es"?"Tu posición":lang==="pt"?"Sua posição":"Your position";
        return (
          <div style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: "13px", overflow: "hidden", marginBottom: "10px" }}>
            <div style={{ padding: "14px" }}>
              <div style={{ ...row, justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ ...lbl, marginBottom: 0 }}>⏳ {t.waitingList}</div>
                <Badge col="purple">{activeQueue.length} {t.waitingGroups}</Badge>
              </div>

              {/* My position card — shown only if registered */}
              {myQueueEntry && myPos >= 0 && (
                <div style={{
                  background: C.amberD, border: `1px solid ${C.amberM}`,
                  borderRadius: "10px", padding: "12px 16px", marginBottom: "12px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontSize: "11px", color: C.amber, fontWeight: 700, marginBottom: "3px" }}>{posLabel}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: C.txt }}>{myQueueEntry.name}</div>
                    <div style={{ fontSize: "10px", color: C.muted, marginTop: "2px" }}>
                      {waitMin(myQueueEntry.joinedAt)}{t.elapsedWait} {t.approx}{cumWait(myPos)}{t.minutesSuffix}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "44px", fontWeight: 700, color: C.amber, fontFamily: "'Shippori Mincho',serif", lineHeight: 1 }}>
                      {myPos + 1}
                    </div>
                    <div style={{ fontSize: "9px", color: C.muted, marginTop: "2px" }}>{t.myPosition}</div>
                  </div>
                </div>
              )}

              {/* List — numbers + party size only, no names */}
              {activeQueue.map((w, i) => {
                const isMe = w.id === myQueueEntry?.id;
                return (
                  <div key={w.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: i < activeQueue.length - 1 ? `1px solid ${C.faint}` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* Position number */}
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: isMe ? C.amber : C.faint,
                        border: `1px solid ${isMe ? C.amber : C.bdr}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700,
                        color: isMe ? C.bg : C.muted, flexShrink: 0,
                      }}>{i + 1}</div>
                      {/* Party size only */}
                      <div style={{ fontSize: "12px", color: isMe ? C.txt : C.muted, fontWeight: isMe ? 700 : 400 }}>
                        {w.seats}{lang==="ja"?"名":lang==="ko"?"명":lang==="es"||lang==="pt"?" pax":" guests"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {isMe && <Badge col="amber">{youLabel}</Badge>}
                      {w.notified && <Badge col="green">🔔</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Join wait list */}
      {!myQueueEntry && (
        <div style={{paddingBottom:"24px"}}>
          {!showJoin ? (
            <Btn v="primary" onClick={()=>setShowJoin(true)}>{t.joinWaitlist}</Btn>
          ) : (
            <div style={card({border:`1px solid ${C.amber}44`})}>
              <div style={pad}>
                <div style={{fontSize:"14px",fontWeight:700,marginBottom:"14px"}}>{t.waitRegistration}</div>
                <div style={{marginBottom:"12px"}}>
                  <div style={lbl}>{t.yourName}</div>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.namePlaceholder}
                    style={{width:"100%",background:C.faint,border:`1px solid ${C.bdr}`,borderRadius:"8px",padding:"10px 12px",fontSize:"13px",color:C.txt,fontFamily:font,boxSizing:"border-box",outline:"none"}}/>
                </div>
                <div style={{marginBottom:"16px"}}>
                  <div style={lbl}>{t.partySize}</div>
                  <div style={{display:"flex",gap:"6px"}}>
                    {[1,2,3,4,5,6].map(n=>(
                      <button key={n} onClick={()=>setSeats(n)}
                        style={{flex:1,padding:"10px 4px",borderRadius:"8px",fontSize:"13px",fontWeight:seats===n?700:400,cursor:"pointer",background:seats===n?C.amberD:C.faint,color:seats===n?C.amber:C.muted,border:`1px solid ${seats===n?C.amber:C.bdr}`,fontFamily:font}}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:"8px"}}>
                  <Btn v="ghost" onClick={()=>setShowJoin(false)} style={{flex:1}}>{t.cancel}</Btn>
                  <Btn v="primary" onClick={doJoin} disabled={!name.trim()} style={{flex:2}}>{t.register}</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>;
}

// ── Order App (after seated) ──────────────────────────────────
function CustomerOrderApp({ table, dispatch, lang, setLang, t, font, cashMode, store, menuItems }) {
  const[tab, setTab] = useState("order");
  const tl = TIME_LIMITS.find(x=>x.id===table?.timeLimitId);
  const[,tick]=useState(0);
  useEffect(()=>{const tm=setInterval(()=>tick(n=>n+1),1000);return()=>clearInterval(tm);},[]);
  const el = table?.startedAt ? Math.floor((Date.now()-table.startedAt)/60000) : 0;
  const rem = tl?.minutes ? Math.max(tl.minutes-el,0) : null;
  const warn = rem!==null&&rem<=20;
  const col = rem!==null?(rem<=10?C.red:rem<=20?C.amber:C.blue):null;

  const tabs=[
    {id:"order",icon:"🍜",label:t.navOrder},
    {id:"request",icon:"💌",label:t.navRequest},
    {id:"call",icon:"🔔",label:t.navCall},
    {id:"receipt",icon:"🧾",label:t.navReceipt},
  ];

  return <div style={{display:"flex",flexDirection:"column",height:"100%",fontFamily:font}}>
    {/* Header */}
    <div style={{background:C.surf,borderBottom:`1px solid ${C.bdr}`,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      <div>
        <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"17px",fontWeight:800}}>{store?.name||t.storeName}</div>
        <div style={{fontSize:"10px",color:C.muted}}>{t.tableLabel} {table?.id} · {table?.seats} {t.seatsLabel}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <div style={{fontSize:"10px",color:C.amber,fontWeight:700}}>{t.todaySpecial}</div>
        <LangSelector lang={lang} setLang={setLang} dark/>
      </div>
    </div>

    {/* Time limit banner */}
    {tl?.minutes && (
      <div style={{background:warn?C.redD:C.blueD,borderBottom:`1px solid ${col}33`,padding:"10px 16px",flexShrink:0}}>
        <div style={{...row,justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:"11px",color:col,fontWeight:700,marginBottom:"2px"}}>{tl.label} {t.timeLimitSeat}</div>
            <div style={{fontSize:"11px",color:C.muted}}>{t.elapsedFrom} {el}{t.elapsedMin}</div>
            {warn&&<div style={{fontSize:"11px",color:C.red,fontWeight:700,marginTop:"2px"}}>{t.timeLimitWarn}</div>}
          </div>
          <Ring remaining={rem} total={tl.minutes} size={58}/>
        </div>
        <div style={{marginTop:"6px"}}><Bar pct={(el/tl.minutes)*100} col={col}/></div>
      </div>
    )}

    {/* Content */}
    <div style={{flex:1,overflowY:"auto",paddingBottom:"60px"}}>
      {tab==="order"   && <COrderTab   table={table} dispatch={dispatch} lang={lang} t={t} font={font} menuItems={menuItems} store={store}/>}
      {tab==="request" && <CRequestTab table={table} dispatch={dispatch} lang={lang} t={t} font={font}/>}
      {tab==="call"    && <CCallTab    table={table} dispatch={dispatch} lang={lang} t={t} font={font}/>}
      {tab==="receipt" && <CReceiptTab table={table} dispatch={dispatch} lang={lang} t={t} font={font} cashMode={cashMode} menuItems={menuItems} store={store}/>}
    </div>

    {/* Bottom nav */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.surf,borderTop:`1px solid ${C.bdr}`,display:"flex",maxWidth:"480px",flexShrink:0}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)}
          style={{flex:1,padding:"9px 4px 7px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",fontFamily:"'Noto Sans JP',sans-serif"}}>
          <div style={{fontSize:"19px",lineHeight:1}}>{t.icon}</div>
          <div style={{fontSize:"9px",color:tab===t.id?C.amber:C.muted,fontWeight:tab===t.id?700:400}}>{t.label}</div>
          {tab===t.id&&<div style={{width:"18px",height:"2px",background:C.amber,borderRadius:"1px"}}/>}
        </button>
      ))}
    </div>
  </div>;
}

function COrderTab({ table, dispatch, lang, t, font, menuItems, store }){
  const hasOrdered = table?.orders?.length > 0;
  const existingScene = SCENES.find(s=>s.id===table?.scene) || null;
  const currency = CURRENCIES.find(c=>c.id===store?.currency)||CURRENCIES[0];
  const sym = currency.symbol;

  const[scene,setScene]=useState(existingScene);
  const[cart,setCart]=useState({});
  const[step,setStep]=useState(hasOrdered ? "menu" : "scene");
  const[aiResult,setAiResult]=useState(null);
  const[aiLoading,setAiLoading]=useState(false);

  // Use dynamic menuItems, filter out sold out
  const activeMenu = (menuItems||MENU).filter(m=>!m.soldOut);
  const localMenu = activeMenu.map(m=>{
    const idx = MENU.findIndex(x=>x.id===m.id);
    return {...m, name:MENU_NAMES[lang]?.[idx]||m.name, desc:MENU_DESCS[lang]?.[idx]||m.desc, cat:MENU_CATS[lang]?.[idx]||m.cat};
  });
  const localScenes = SCENES.map((s,i)=>({...s, label:SCENE_LABELS[lang]?.[i]||s.label, sub:SCENE_SUBS[lang]?.[i]||s.sub}));
  const cats=[...new Set(localMenu.map(m=>m.cat))];
  const cartItems=Object.entries(cart).filter(([,q])=>q>0).map(([id,qty])=>({item:localMenu.find(m=>m.id===Number(id)),qty})).filter(x=>x.item);
  const total=cartItems.reduce((s,{item,qty})=>s+item.price*qty,0);
  const add=id=>setCart(c=>({...c,[id]:(c[id]||0)+1}));
  const sub=id=>setCart(c=>({...c,[id]:Math.max((c[id]||0)-1,0)}));

  async function confirm(){
    setStep("confirm"); setAiLoading(true);
    try{
      const tl=TIME_LIMITS.find(x=>x.id===table?.timeLimitId);
      const el=table?.startedAt?Math.floor((Date.now()-table.startedAt)/60000):0;
      const tlR=tl?.minutes?Math.max(tl.minutes-el,0):null;
      const items=cartItems.map(({item,qty})=>`${item.name}×${qty}`).join(", ");
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,system:"Departure time prediction AI. Return JSON only.",messages:[{role:"user",content:`Restaurant departure prediction. Seated ${el}min / ${scene?.label} / ${table?.seats||2} guests / orders: ${items} / ${tlR!==null?`time limit remaining ${tlR}min`:"no limit"}\nPredict minutes until departure as integer. JSON: {"minutes":number,"reason":"one sentence reason"}`}]})});
      const d=await res.json();
      setAiResult(JSON.parse((d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim()));
    }catch{setAiResult({minutes:30,reason:"Estimated based on your order."});}
    setAiLoading(false);
  }

  function placeOrder(){
    const orderItems = cartItems.flatMap(({item,qty})=>Array(qty).fill({menuId:item.id,qty:1,served:false}));
    dispatch({ type:"CUSTOMER_ORDER", tableId:CUSTOMER_TABLE_ID, orderItems, scene:scene?.id });
    setStep("done");
  }

  if(step==="done") return <div style={{textAlign:"center",padding:"60px 20px",fontFamily:font}}>
    <div style={{fontSize:"52px",marginBottom:"12px"}}>✅</div>
    <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"22px",fontWeight:800,marginBottom:"6px"}}>{t.orderDone}</div>
    <div style={{fontSize:"12px",color:C.muted,marginBottom:"24px"}}>{t.orderDoneSub}</div>
    <Btn v="ghost" onClick={()=>{setStep("menu");setCart({});setAiResult(null);}}>{t.addMore}</Btn>
  </div>;

  return <div style={{padding:"14px",fontFamily:font}}>
    <div style={{display:"flex",gap:"4px",marginBottom:"16px"}}>
      {["scene","menu","confirm"].map((s,i)=>(
        <div key={s} style={{flex:1,height:"3px",borderRadius:"2px",background:["scene","menu","confirm"].indexOf(step)>=i?C.amber:C.faint,transition:"background 0.3s"}}/>
      ))}
    </div>

    {step==="scene"&&<>
      <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"19px",fontWeight:800,marginBottom:"4px"}}>{t.whatMeal}</div>
      <div style={{fontSize:"11px",color:C.muted,marginBottom:"16px"}}>{t.sceneSubtitle}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"16px"}}>
        {localScenes.map(sc=>(
          <div key={sc.id} onClick={()=>setScene(sc)} style={{background:scene?.id===sc.id?C.amberD:C.surf,border:`1px solid ${scene?.id===sc.id?C.amber:C.bdr}`,borderRadius:"12px",padding:"14px 6px",cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:"26px",marginBottom:"4px"}}>{sc.emoji}</div>
            <div style={{fontSize:"10px",fontWeight:700,color:scene?.id===sc.id?C.amber:C.txt,lineHeight:1.3}}>{sc.label}</div>
            <div style={{fontSize:"9px",color:C.muted,marginTop:"2px"}}>{sc.sub}</div>
          </div>
        ))}
      </div>
      <Btn v="primary" onClick={()=>setStep("menu")} disabled={!scene}>{t.seeMenu}</Btn>
    </>}

    {step==="menu"&&<>
      <div style={{...row,justifyContent:"space-between",marginBottom:"14px"}}>
        <div><div style={{fontSize:"17px",fontWeight:700}}>{t.menu}</div><div style={{fontSize:"10px",color:C.muted}}>{scene?.emoji} {scene?.label}</div></div>
        {Object.values(cart).reduce((s,v)=>s+v,0)>0&&(
          <div style={{background:C.amberD,border:`1px solid ${C.amberM}`,borderRadius:"20px",padding:"5px 12px",fontSize:"11px",fontWeight:700,color:C.amber}}>
            🛒 {sym}{total.toLocaleString()}
          </div>
        )}
      </div>
      {cats.map(cat=>(
        <div key={cat} style={{marginBottom:"14px"}}>
          <div style={{...lbl,marginBottom:"6px"}}>{cat}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
            {localMenu.filter(m=>m.cat===cat).map(item=>(
              <div key={item.id} style={{background:C.surf,border:`1px solid ${cart[item.id]>0?C.amber:C.bdr}`,borderRadius:"12px",padding:"11px 13px",display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{fontSize:"30px",flexShrink:0}}>{item.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"12px",fontWeight:700}}>{item.name}</div>
                  <div style={{fontSize:"10px",color:C.muted,marginBottom:"3px"}}>{item.desc}</div>
                  <div style={{fontSize:"13px",fontWeight:700,color:C.amber}}>{sym}{item.price.toLocaleString()}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"7px",flexShrink:0}}>
                  <button onClick={()=>sub(item.id)} style={{width:"26px",height:"26px",borderRadius:"50%",background:C.faint,border:`1px solid ${C.bdr}`,color:C.txt,fontSize:"15px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                  <span style={{fontSize:"13px",fontWeight:700,color:cart[item.id]>0?C.amber:C.muted,minWidth:"14px",textAlign:"center"}}>{cart[item.id]||0}</span>
                  <button onClick={()=>add(item.id)} style={{width:"26px",height:"26px",borderRadius:"50%",background:C.amber,border:"none",color:C.bg,fontSize:"15px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
        <Btn v="ghost" onClick={()=>setStep("scene")} style={{flex:1}}>{t.back}</Btn>
        <Btn v="primary" onClick={confirm} disabled={!cartItems.length} style={{flex:2}}>{t.orderTotal}{sym}{total.toLocaleString()}）</Btn>
      </div>
    </>}

    {step==="confirm"&&<>
      <div style={{fontSize:"17px",fontWeight:700,marginBottom:"14px"}}>{t.orderConfirm}</div>
      <div style={card()}>
        <div style={pad}>
          {cartItems.map(({item,qty})=>(
            <div key={item.id} style={{...row,justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.bdr}`}}>
              <div style={row}><span style={{fontSize:"18px"}}>{item.emoji}</span><div><div style={{fontSize:"12px",fontWeight:700}}>{item.name}</div><div style={{fontSize:"10px",color:C.muted}}>×{qty}</div></div></div>
              <div style={{fontSize:"12px",color:C.amber,fontWeight:700}}>{sym}{(item.price*qty).toLocaleString()}</div>
            </div>
          ))}
          <div style={{...row,justifyContent:"space-between",paddingTop:"10px"}}>
            <div style={{fontWeight:700}}>{t.total}</div>
            <div style={{fontSize:"20px",fontWeight:700,color:C.amber}}>{sym}{total.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div style={card({border:`1px solid ${C.amber}33`,background:C.amberD})}>
        <div style={pad}>
          <div style={{...row,marginBottom:"6px"}}><span style={{fontSize:"16px"}}>🤖</span><span style={{fontSize:"11px",fontWeight:700,color:C.amber}}>{t.aiPrediction}</span></div>
          {aiLoading?<div style={{fontSize:"12px",color:C.muted}}>{t.aiCalc}</div>:aiResult?<>
            <div style={{fontSize:"34px",fontWeight:700,color:C.amber,fontFamily:"'Shippori Mincho',serif",lineHeight:1}}>{t.approx}{aiResult.minutes}<span style={{fontSize:"14px",color:C.muted}}>{t.minutesSuffix}</span></div>
            <div style={{fontSize:"10px",color:C.muted,marginTop:"4px"}}>{aiResult.reason}</div>
          </>:null}
        </div>
      </div>
      <div style={{display:"flex",gap:"8px"}}>
        <Btn v="ghost" onClick={()=>setStep("menu")} style={{flex:1}}>{t.back}</Btn>
        <Btn v="primary" onClick={placeOrder} style={{flex:2}}>{t.placeOrder}</Btn>
      </div>
    </>}
  </div>;
}

function CRequestTab({ table, dispatch, lang, t, font }){
  const[sel,setSel]=useState([]);
  const[text,setText]=useState("");
  const[allergies,setAllergies]=useState([]);
  const[sent,setSent]=useState(false);

  const localRequests = QUICK_REQUESTS.map((r,i)=>({...r,label:REQUEST_LABELS[lang]?.[i]||r.label}));
  const localAllergies = ALLERGY_PRESETS.map((a,i)=>({...a,label:ALLERGY_LABELS[lang]?.[i]||a.label}));

  const chip=(on,col="purple")=>{const cs={purple:[C.purpleD,C.purple],red:[C.redD,C.red]};const[bg,fc]=cs[col];return{display:"inline-flex",alignItems:"center",gap:"5px",padding:"8px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:on?700:400,cursor:"pointer",background:on?bg:C.faint,color:on?fc:C.muted,border:`1px solid ${on?fc+"55":C.bdr}`,fontFamily:font};};

  if(sent) return <div style={{textAlign:"center",padding:"60px 20px",fontFamily:font}}>
    <div style={{fontSize:"52px",marginBottom:"12px"}}>💌</div>
    <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"20px",fontWeight:800,marginBottom:"8px"}}>{t.requestSent}</div>
    <div style={{fontSize:"12px",color:C.muted,marginBottom:"24px"}}>{t.requestSentSub}</div>
    <Btn v="ghost" onClick={()=>setSent(false)}>{t.changeRequest}</Btn>
  </div>;

  return <div style={{padding:"14px",fontFamily:font}}>
    <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"19px",fontWeight:800,marginBottom:"4px"}}>{t.requestTitle}</div>
    <div style={{fontSize:"11px",color:C.muted,marginBottom:"16px"}}>{t.requestSub}</div>
    <div style={card()}>
      <div style={pad}>
        <div style={lbl}>{t.quickRequests}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
          {localRequests.map(r=>{const on=sel.includes(r.id);return <button key={r.id} onClick={()=>setSel(p=>on?p.filter(x=>x!==r.id):[...p,r.id])} style={chip(on,"purple")}><span>{r.emoji}</span><span>{r.label}</span></button>;})}
        </div>
      </div>
    </div>
    <div style={card()}>
      <div style={pad}>
        <div style={lbl}>{t.freeText}</div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={t.freeTextPlaceholder}
          style={{width:"100%",minHeight:"80px",background:C.faint,border:`1px solid ${C.bdr}`,borderRadius:"8px",padding:"10px",fontSize:"12px",color:C.txt,resize:"vertical",fontFamily:font,boxSizing:"border-box",outline:"none"}}/>
      </div>
    </div>
    <div style={card({border:`1px solid ${C.red}33`})}>
      <div style={pad}>
        <div style={{...lbl,color:C.red}}>{t.allergyTitle}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
          {localAllergies.map(a=>{const on=allergies.includes(a.id);return <button key={a.id} onClick={()=>setAllergies(p=>on?p.filter(x=>x!==a.id):[...p,a.id])} style={chip(on,"red")}><span>{a.emoji}</span><span>{a.label}</span></button>;})}
        </div>
      </div>
    </div>
    <Btn v="purple" onClick={()=>{
      const reqs=sel.map(id=>localRequests.find(r=>r.id===id)).filter(Boolean);
      dispatch({type:"CUSTOMER_REQUEST",tableId:CUSTOMER_TABLE_ID,requests:reqs,allergies});
      setSent(true);
    }} disabled={!sel.length&&!text&&!allergies.length}
    style={{background:C.purpleD,color:C.purple,border:`1px solid ${C.purple}44`}}>
      {t.sendRequest}
    </Btn>
  </div>;
}

function CCallTab({ table, dispatch, lang, t, font }){
  const[sel,setSel]=useState(null);
  const[note,setNote]=useState("");
  const[sent,setSent]=useState(false);
  const localCalls = CALL_REASONS.map((r,i)=>({...r,label:CALL_LABELS[lang]?.[i]||r.label}));
  function send(){
    if(!sel)return;
    const reason=localCalls.find(r=>r.id===sel);
    dispatch({type:"CUSTOMER_CALL",tableId:CUSTOMER_TABLE_ID,reason,note});
    setSent(true);
    setTimeout(()=>setSent(false),3000);
    setSel(null); setNote("");
  }
  return <div style={{padding:"14px",fontFamily:font}}>
    <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"19px",fontWeight:800,marginBottom:"4px"}}>{t.callTitle}</div>
    <div style={{fontSize:"11px",color:C.muted,marginBottom:"14px"}}>{t.callSub}</div>
    {sent&&<div style={{...card({border:`1px solid ${C.green}55`,background:C.greenD}),padding:"12px 14px",marginBottom:"12px"}}>
      <div style={{fontSize:"13px",color:C.green,fontWeight:700}}>{t.callSent}</div>
      <div style={{fontSize:"11px",color:C.muted,marginTop:"2px"}}>{t.callSentSub}</div>
    </div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px",marginBottom:"12px"}}>
      {localCalls.map(r=>{const on=sel===r.id;return(
        <button key={r.id} onClick={()=>setSel(on?null:r.id)}
          style={{background:on?C.amberD:C.surf,border:`1px solid ${on?C.amber:C.bdr}`,borderRadius:"12px",padding:"15px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",fontFamily:font}}>
          <span style={{fontSize:"26px"}}>{r.emoji}</span>
          <span style={{fontSize:"11px",fontWeight:on?700:400,color:on?C.amber:C.muted,lineHeight:1.3,textAlign:"center"}}>{r.label}</span>
        </button>
      );})}
    </div>
    {sel&&<div style={{...card(),marginBottom:"10px"}}>
      <div style={pad}>
        <div style={lbl}>{t.callMemo}</div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t.callMemoPh}
          style={{width:"100%",minHeight:"56px",background:C.faint,border:`1px solid ${C.bdr}`,borderRadius:"8px",padding:"10px",fontSize:"12px",color:C.txt,resize:"vertical",fontFamily:font,boxSizing:"border-box",outline:"none"}}/>
      </div>
    </div>}
    <Btn v="primary" onClick={send} disabled={!sel} style={{padding:"15px",fontSize:"14px"}}>
      {t.callBtn}
    </Btn>
  </div>;
}

function CReceiptTab({ table, dispatch, lang, t, font, cashMode, menuItems, store }){
  const[step,setStep]=useState("select");
  const currency = CURRENCIES.find(c=>c.id===store?.currency)||CURRENCIES[0];
  const sym = currency.symbol;
  const taxRate = store?.taxRate ?? 10;
  const taxIncluded = store?.taxIncluded ?? false;
  const localMenu = (menuItems||MENU).map(m=>{
    const idx=MENU.findIndex(x=>x.id===m.id);
    return {...m,name:MENU_NAMES[lang]?.[idx]||m.name};
  });
  const rev = table ? calcRev(table) : 0;
  const tax = taxIncluded ? Math.round(rev - rev/(1+taxRate/100)) : Math.round(rev*taxRate/100);
  const total = taxIncluded ? rev : rev + tax;
  const taxLabel = lang==="ja"?`消費税（${taxRate}%）`:lang==="ko"?`세금 (${taxRate}%)`:lang==="en"?`Tax (${taxRate}%)`:lang==="es"?`Impuesto (${taxRate}%)`:`Imposto (${taxRate}%)`;
  const payMethods = PAY_METHODS[lang] || PAY_METHODS.ja;

  // Already paid via online
  if(table?.paymentStatus==="paid"&&table?.paymentMethod==="card") return(
    <div style={{textAlign:"center",padding:"60px 20px",fontFamily:font}}>
      <div style={{fontSize:"52px",marginBottom:"12px"}}>🎉</div>
      <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"22px",fontWeight:800,marginBottom:"6px"}}>{t.payDone}</div>
      <div style={{fontSize:"12px",color:C.muted,marginBottom:"6px"}}>{sym}{total.toLocaleString()}</div>
      <div style={{fontSize:"12px",color:C.muted}}>{t.payDoneSub}</div>
    </div>
  );

  // Cash declared — staff collect or cashier depending on store setting
  if(step==="cash_declared"||table?.paymentStatus==="cash_pending") return(
    <div style={{textAlign:"center",padding:"48px 20px",fontFamily:font}}>
      <div style={{fontSize:"64px",marginBottom:"16px"}}>{cashMode==="cashier"?"🧾":"🙇"}</div>
      <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"22px",fontWeight:800,marginBottom:"8px"}}>
        {cashMode==="cashier"
          ? (lang==="ja"?"レジにてお支払いください":lang==="ko"?"계산대에서 결제해 주세요":lang==="en"?"Please pay at the cashier":"Por favor pague en caja")
          : (lang==="ja"?"スタッフが集金に参ります":lang==="ko"?"직원이 수금하러 갑니다":lang==="en"?"Staff will come to collect":"El personal vendrá a cobrar")
        }
      </div>
      <div style={{fontSize:"13px",color:C.muted,marginBottom:"24px",lineHeight:1.7}}>
        {cashMode==="cashier"
          ? (lang==="ja"?"お会計はレジカウンターにてお願いいたします":lang==="ko"?"계산은 계산대에서 부탁드립니다":lang==="en"?"Please proceed to the register":"Diríjase a la caja")
          : (lang==="ja"?"そのままお席でお待ちください":lang==="ko"?"자리에서 기다려 주세요":lang==="en"?"Please wait at your table":"Por favor espere en su mesa")
        }
      </div>
      {/* Amount */}
      <div style={{background:C.amberD,border:`1px solid ${C.amberM}`,borderRadius:"14px",padding:"20px",marginBottom:"16px"}}>
        <div style={{fontSize:"11px",color:C.muted,marginBottom:"6px"}}>
          {lang==="ja"?"お支払い金額":lang==="ko"?"결제 금액":lang==="en"?"Amount due":"Total"}
        </div>
        <div style={{fontSize:"36px",fontWeight:700,color:C.amber,fontFamily:"'Shippori Mincho',serif"}}>
          {sym}{total.toLocaleString()}
        </div>
        <div style={{fontSize:"11px",color:C.muted,marginTop:"6px"}}>💴 {lang==="ja"?"現金":lang==="ko"?"현금":lang==="en"?"Cash":"Efectivo"}</div>
      </div>
      {/* Table number — shown for cashier mode */}
      {cashMode==="cashier"&&(
        <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:"12px",padding:"14px",marginBottom:"16px"}}>
          <div style={{fontSize:"11px",color:C.muted,marginBottom:"4px"}}>
            {lang==="ja"?"テーブル番号":lang==="ko"?"테이블 번호":lang==="en"?"Table No.":"Mesa No."}
          </div>
          <div style={{fontSize:"32px",fontWeight:700,color:C.txt,fontFamily:"'Shippori Mincho',serif"}}>
            {CUSTOMER_TABLE_ID}
          </div>
          <div style={{fontSize:"11px",color:C.muted,marginTop:"6px"}}>
            {lang==="ja"?"レジでテーブル番号をお伝えください":lang==="ko"?"테이블 번호를 알려주세요":lang==="en"?"Tell the cashier your table number":"Informe el número de mesa"}
          </div>
        </div>
      )}
      {/* Staff mode note */}
      {cashMode==="staff"&&(
        <div style={{fontSize:"11px",color:C.muted,background:C.faint,borderRadius:"10px",padding:"12px",lineHeight:1.7}}>
          {lang==="ja"?"まもなくスタッフが参ります。そのままお待ちください。":lang==="ko"?"곧 직원이 방문합니다.":lang==="en"?"A staff member will be with you shortly.":"Un miembro del personal vendrá pronto."}
        </div>
      )}
    </div>
  );

  // Order summary (shared)
  const OrderSummary = () => (
    <div style={card()}>
      <div style={pad}>
        <div style={lbl}>{t.orderContents}</div>
        {(() => {
          const grouped = [];
          (table?.orders || []).forEach(o => {
            const existing = grouped.find(g => g.menuId === o.menuId);
            if(existing) existing.qty += o.qty;
            else grouped.push({ menuId: o.menuId, qty: o.qty });
          });
          return grouped.map((o, i) => {
            const m = localMenu.find(x => x.id === o.menuId);
            if(!m) return null;
            return (
              <div key={i} style={{...row, justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.bdr}`}}>
                <div style={row}>
                  <span style={{fontSize:"18px"}}>{m.emoji}</span>
                  <div>
                    <div style={{fontSize:"12px",fontWeight:700}}>{m.name}</div>
                    {o.qty > 1 && <div style={{fontSize:"10px",color:C.muted}}>×{o.qty}</div>}
                  </div>
                </div>
                <div style={{fontSize:"12px",color:C.amber,fontWeight:700}}>¥{(m.price*o.qty).toLocaleString()}</div>
              </div>
            );
          });
        })()}
        <div style={{paddingTop:"10px"}}>
          <div style={{...row,justifyContent:"space-between",fontSize:"11px",color:C.muted,marginBottom:"3px"}}><span>{t.subtotal}</span><span>{sym}{rev.toLocaleString()}</span></div>
          <div style={{...row,justifyContent:"space-between",fontSize:"11px",color:C.muted,marginBottom:"10px"}}><span>{taxLabel}</span><span>{sym}{tax.toLocaleString()}</span></div>
          <div style={{...row,justifyContent:"space-between",fontSize:"20px",fontWeight:700}}><span>{t.total}</span><span style={{color:C.amber}}>{sym}{total.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );

  // Step: select payment method
  if(step==="select") return(
    <div style={{padding:"14px",fontFamily:font}}>
      <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"19px",fontWeight:800,marginBottom:"14px"}}>{t.receiptTitle}</div>
      <OrderSummary/>
      <div style={{...lbl,marginBottom:"10px"}}>{t.payMethod}</div>
      {/* Online payment */}
      <div onClick={()=>setStep("online")} style={{...card({border:`1px solid ${C.blue}44`,background:C.blueD,cursor:"pointer"}),marginBottom:"10px"}}>
        <div style={{...pad,display:"flex",alignItems:"center",gap:"14px"}}>
          <div style={{fontSize:"32px"}}>💳</div>
          <div style={{flex:1}}>
            <div style={{fontSize:"13px",fontWeight:700,marginBottom:"2px"}}>
              {lang==="ja"?"カード・キャッシュレス":lang==="ko"?"카드·간편결제":lang==="en"?"Card / Cashless":"Tarjeta / Sin Efectivo"}
            </div>
            <div style={{fontSize:"11px",color:C.muted}}>
              {lang==="ja"?"その場で決済完了":lang==="ko"?"즉시 결제 완료":lang==="en"?"Pay instantly":"Pagar instantáneamente"}
            </div>
          </div>
          <div style={{fontSize:"16px",color:C.blue}}>→</div>
        </div>
      </div>
      {/* Cash payment */}
      <div onClick={()=>{dispatch({type:"CUSTOMER_PAY_CASH",tableId:CUSTOMER_TABLE_ID});setStep("cash_declared");}}
        style={{...card({border:`1px solid ${C.green}44`,background:C.greenD,cursor:"pointer"})}}>
        <div style={{...pad,display:"flex",alignItems:"center",gap:"14px"}}>
          <div style={{fontSize:"32px"}}>💴</div>
          <div style={{flex:1}}>
            <div style={{fontSize:"13px",fontWeight:700,marginBottom:"2px"}}>
              {lang==="ja"?"現金":lang==="ko"?"현금":lang==="en"?"Cash":"Efectivo"}
            </div>
            <div style={{fontSize:"11px",color:C.muted}}>
              {lang==="ja"?"スタッフが集金に参ります":lang==="ko"?"직원이 수금하러 옵니다":lang==="en"?"Staff will collect payment":"El personal cobrará"}
            </div>
          </div>
          <div style={{fontSize:"16px",color:C.green}}>→</div>
        </div>
      </div>
    </div>
  );

  // Step: online payment
  if(step==="online") return(
    <div style={{padding:"14px",fontFamily:font}}>
      <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"19px",fontWeight:800,marginBottom:"14px"}}>{t.receiptTitle}</div>
      <OrderSummary/>
      <div style={{...card({background:C.blueD,border:`1px solid ${C.blue}33`}),marginBottom:"10px"}}>
        <div style={pad}>
          <div style={lbl}>{t.payMethod}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px"}}>
            {payMethods.map(p=>(
              <div key={p.l} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:"9px",padding:"11px",textAlign:"center",cursor:"pointer"}}>
                <div style={{fontSize:"20px",marginBottom:"3px"}}>{p.e}</div>
                <div style={{fontSize:"10px",color:C.txt}}>{p.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Btn v="primary" onClick={()=>{dispatch({type:"CUSTOMER_PAY",tableId:CUSTOMER_TABLE_ID});}} style={{padding:"15px",fontSize:"14px",marginBottom:"8px"}}>
        {t.payBtn}
      </Btn>
      <Btn v="ghost" onClick={()=>setStep("select")}>← {t.back}</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STORE VIEW
// ═══════════════════════════════════════════════════════════════
function StoreView({ state, dispatch, cashMode, setCashMode, store, setStore }){
  const[tab,setTab]=useState("alert");
  const[,tick]=useState(0);
  const[notifEnabled,setNotifEnabled]=useState(false);
  const prevCallsRef = useRef([]);
  const prevCashRef  = useRef([]);
  const prevTlRef    = useRef([]);

  useEffect(()=>{const t=setInterval(()=>tick(n=>n+1),10000);return()=>clearInterval(t);},[]);

  // Request notification permission
  function enableNotif(){
    if(!("Notification" in window)){ alert("このブラウザは通知に対応していません"); return; }
    Notification.requestPermission().then(p=>{
      setNotifEnabled(p==="granted");
    });
  }

  function sendNotif(title, body, icon="🔔"){
    if(Notification.permission!=="granted") return;
    try{ new Notification(title, { body, icon:"https://em-content.zobj.net/source/apple/391/bell_1f514.png" }); }catch(e){}
  }

  // Watch for new calls
  const pendingCalls=state.tables.flatMap(t=>t.calls.filter(c=>!c.done).map(c=>({...c,tableId:t.id})));
  useEffect(()=>{
    const prev = prevCallsRef.current;
    const newCalls = pendingCalls.filter(c=>!prev.find(p=>p.time===c.time));
    newCalls.forEach(c=>sendNotif(
      `🔔 テーブル${c.tableId} — 呼び出し`,
      c.label + (c.note?`\n${c.note}`:"")
    ));
    prevCallsRef.current = pendingCalls;
  },[pendingCalls.map(c=>c.time).join(",")]);

  // Watch for new cash pending
  const cashPending=state.tables.filter(t=>t.paymentStatus==="cash_pending");
  useEffect(()=>{
    const prev = prevCashRef.current;
    const newCash = cashPending.filter(t=>!prev.find(p=>p.id===t.id));
    newCash.forEach(t=>sendNotif(
      `💴 テーブル${t.id} — 現金払い`,
      `¥${t.revenue.toLocaleString()} ${cashMode==="cashier"?"レジにお越しください":"集金をお願いします"}`
    ));
    prevCashRef.current = cashPending;
  },[cashPending.map(t=>t.id).join(",")]);

  // Watch for time limit alerts (crossing 15min threshold)
  const tlAlerts=state.tables.filter(t=>t.occupied&&t.paymentStatus==="unpaid").filter(t=>{const r=tlRem(t);return r!==null&&r<=15;});
  useEffect(()=>{
    const prev = prevTlRef.current;
    const newTl = tlAlerts.filter(t=>!prev.find(p=>p.id===t.id));
    newTl.forEach(t=>sendNotif(
      `⏰ テーブル${t.id} — 時間制限まもなく`,
      `残り${tlRem(t)}分です。お声がけください。`
    ));
    prevTlRef.current = tlAlerts;
  },[tlAlerts.map(t=>t.id).join(",")]);

  const paidWait=state.tables.filter(t=>t.paymentStatus==="paid");
  const alertTotal=pendingCalls.length+tlAlerts.length+paidWait.length+cashPending.length;
  const activeQueue=state.waitQueue.filter(w=>!w.done);

  const tabs=[
    {id:"alert",  icon:"🚨", label:"アラート", badge:alertTotal},
    {id:"tables", icon:"🪑", label:"テーブル",  badge:0},
    {id:"queue",  icon:"⏳", label:"待ち",      badge:activeQueue.length},
    {id:"sales",  icon:"📊", label:"売上",      badge:0},
    {id:"kds",    icon:"👨‍🍳", label:"KDS",       badge:0},
    {id:"menu",   icon:"🍽️", label:"メニュー",  badge:0},
    {id:"qr",     icon:"📷", label:"QR",        badge:0},
    {id:"reservation",icon:"📅",label:"予約",     badge:0},
    {id:"settings",icon:"⚙️",label:"設定",      badge:0},
  ];

  return <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    {/* Header */}
    <div style={{background:C.surf,borderBottom:`1px solid ${C.bdr}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      <div>
        <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"16px",fontWeight:800}}>{store?.name||"店舗管理"} <span style={{fontSize:"11px",color:C.muted,fontFamily:"'Noto Sans JP',sans-serif",fontWeight:400}}>管理画面</span></div>
        <div style={{fontSize:"9px",color:C.muted}}>{new Date().toLocaleDateString("ja-JP",{month:"long",day:"numeric",weekday:"short"})}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <div style={{display:"flex",gap:"10px",fontSize:"11px"}}>
          <span style={{color:C.amber,fontWeight:700}}>{state.tables.filter(t=>t.occupied).length}<span style={{color:C.muted,fontWeight:400}}> 着席</span></span>
          <span style={{color:C.green,fontWeight:700}}>{state.tables.filter(t=>!t.occupied).length}<span style={{color:C.muted,fontWeight:400}}> 空席</span></span>
        </div>
        <button onClick={()=>{ if(notifEnabled){setNotifEnabled(false);}else{enableNotif();} }}
          title={notifEnabled?"通知ON — タップで無効化":"通知OFF — タップで有効化"}
          style={{width:"34px",height:"34px",borderRadius:"9px",border:`1px solid ${notifEnabled?C.green+"66":C.bdr}`,background:notifEnabled?C.greenD:C.faint,cursor:"pointer",fontSize:"17px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          {notifEnabled?"🔔":"🔕"}
        </button>
      </div>
    </div>

    <div style={{flex:1,overflowY:"auto",paddingBottom:"60px"}}>
      {tab==="alert"    && <StoreAlertPanel  state={state} dispatch={dispatch} cashMode={cashMode}/>}
      {tab==="tables"   && <StoreTablePanel  state={state} dispatch={dispatch} cashMode={cashMode} setCashMode={setCashMode}/>}
      {tab==="queue"    && <StoreQueuePanel  state={state} dispatch={dispatch}/>}
      {tab==="sales"    && <StoreSalesPanel  state={state} store={store}/>}
      {tab==="kds"      && <StoreKDSPanel    state={state} dispatch={dispatch}/>}
      {tab==="menu"     && <StoreMenuPanel   state={state} dispatch={dispatch} store={store}/>}
      {tab==="qr"       && <StoreQRPanel     state={state} store={store}/>}
      {tab==="reservation"&&<StoreReservationPanel state={state} dispatch={dispatch} store={store}/>}
      {tab==="settings" && <StoreSettingsPanel store={store} setStore={setStore} cashMode={cashMode} setCashMode={setCashMode}/>}
    </div>

    {/* Bottom nav */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:C.surf,borderTop:`1px solid ${C.bdr}`,display:"flex",maxWidth:"480px"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)}
          style={{flex:1,padding:"9px 4px 7px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",fontFamily:"'Noto Sans JP',sans-serif",position:"relative"}}>
          <div style={{fontSize:"19px",lineHeight:1}}>{t.icon}</div>
          <div style={{fontSize:"9px",color:tab===t.id?C.amber:t.id==="alert"&&alertTotal>0?C.red:C.muted,fontWeight:tab===t.id?700:400}}>{t.label}</div>
          {t.badge>0&&<div style={{position:"absolute",top:"5px",right:"calc(50% - 18px)",background:t.id==="alert"?C.red:C.amber,color:"#fff",borderRadius:"10px",padding:"0 5px",fontSize:"9px",fontWeight:700,minWidth:"15px",textAlign:"center"}}>{t.badge}</div>}
          {tab===t.id&&<div style={{width:"18px",height:"2px",background:C.amber,borderRadius:"1px"}}/>}
        </button>
      ))}
    </div>
  </div>;
}

function StoreAlertPanel({ state, dispatch, cashMode }){
  const calls=state.tables.flatMap(t=>t.calls.filter(c=>!c.done).map(c=>({...c,tableId:t.id,seats:t.seats})));
  const tlAlerts=state.tables.filter(t=>t.occupied&&t.paymentStatus==="unpaid").map(t=>({...t,rem:tlRem(t)})).filter(t=>t.rem!==null&&t.rem<=20).sort((a,b)=>a.rem-b.rem);
  const paidWait=state.tables.filter(t=>t.paymentStatus==="paid");
  const cashPending=state.tables.filter(t=>t.paymentStatus==="cash_pending");
  const requests=state.tables.filter(t=>t.occupied&&(t.requests.length>0||t.allergies.length>0));
  const total=calls.length+tlAlerts.length+paidWait.length+cashPending.length;

  if(total===0) return <div style={{textAlign:"center",padding:"48px 20px"}}>
    <div style={{fontSize:"44px",marginBottom:"10px"}}>✅</div>
    <div style={{fontSize:"14px",fontWeight:700,marginBottom:"4px"}}>対応が必要なアラートはありません</div>
    <div style={{fontSize:"11px",color:C.muted}}>すべて対応済みです</div>
  </div>;

  const sbtn=(v="green")=>({padding:"7px 12px",borderRadius:"7px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",whiteSpace:"nowrap",
    background:v==="green"?C.greenD:v==="primary"?C.amber:"transparent",
    color:v==="green"?C.green:v==="primary"?C.bg:C.txt,
    border:v==="green"?`1px solid ${C.green}44`:v==="primary"?"none":`1px solid ${C.bdr}`});

  return <div style={{padding:"12px"}}>
    {calls.length>0&&<div style={card({border:`1px solid ${C.red}66`})}>
      <div style={{background:C.redD,padding:"9px 13px",borderBottom:`1px solid ${C.red}22`}}>
        <div style={{fontSize:"12px",fontWeight:700,color:C.red}}>🔔 呼び出し対応待ち <span style={{background:C.red,color:"#fff",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",marginLeft:"4px"}}>{calls.length}</span></div>
      </div>
      <div style={pad}>
        {calls.map((c,i)=>(
          <div key={i} style={{...row,justifyContent:"space-between",padding:"9px 0",borderBottom:i<calls.length-1?`1px solid ${C.faint}`:"none"}}>
            <div style={row}>
              <div style={{width:"34px",height:"34px",borderRadius:"8px",background:C.redD,border:`1px solid ${C.red}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>{c.emoji}</div>
              <div>
                <div style={{fontSize:"12px",fontWeight:700}}>テーブル{c.tableId} <span style={{color:C.muted,fontWeight:400,fontSize:"10px"}}>{c.seats}名</span></div>
                <div style={{fontSize:"11px",color:C.txt}}>{c.label}</div>
                {c.note&&<div style={{fontSize:"10px",color:C.muted}}>{c.note}</div>}
                <div style={{fontSize:"9px",color:C.muted}}>{Math.floor((Date.now()-c.time)/60000)}分前</div>
              </div>
            </div>
            <button style={sbtn("green")} onClick={()=>dispatch({type:"STORE_DISMISS_CALL",tableId:c.tableId,callTime:c.time})}>対応済 ✓</button>
          </div>
        ))}
      </div>
    </div>}

    {tlAlerts.length>0&&<div style={card({border:`1px solid ${C.orange}66`})}>
      <div style={{background:C.orangeD,padding:"9px 13px",borderBottom:`1px solid ${C.orange}22`}}>
        <div style={{fontSize:"12px",fontWeight:700,color:C.orange}}>⏰ 時間制限リマインド <span style={{background:C.orange,color:"#fff",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",marginLeft:"4px"}}>{tlAlerts.length}</span></div>
      </div>
      <div style={pad}>
        {tlAlerts.map((t,i)=>{
          const sc=SCENES.find(s=>s.id===t.scene),tl=TIME_LIMITS.find(x=>x.id===t.timeLimitId),crit=t.rem<=10;
          return <div key={t.id} style={{...row,justifyContent:"space-between",padding:"9px 0",borderBottom:i<tlAlerts.length-1?`1px solid ${C.faint}`:"none"}}>
            <div style={row}>
              <Ring remaining={t.rem} total={tl?.minutes||120} size={52}/>
              <div>
                <div style={{fontSize:"12px",fontWeight:700}}>テーブル{t.id} <span style={{color:C.muted,fontWeight:400,fontSize:"10px"}}>{t.seats}名</span></div>
                <div style={{fontSize:"10px",color:C.muted}}>{sc?.label} · {tl?.label}</div>
                <Badge col={crit?"red":"orange"}>{crit?`⚠️ 残り${t.rem}分`:`残り${t.rem}分`}</Badge>
              </div>
            </div>
            <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                <button style={sbtn("green")} onClick={()=>dispatch({type:"STORE_MARK_PAID",tableId:t.id,paymentMethod:"card"})}>💳 カード</button>
                <button style={sbtn("primary")} onClick={()=>dispatch({type:"STORE_MARK_PAID",tableId:t.id,paymentMethod:"cash"})}>💴 現金</button>
              </div>
          </div>;
        })}
      </div>
    </div>}

    {/* ── 現金 レジ払い待ち / 集金待ち ── */}
    {cashPending.length>0&&(
      <div style={card({border:`1px solid ${C.orange}77`})}>
        <div style={{background:C.orangeD,padding:"9px 13px",borderBottom:`1px solid ${C.orange}22`}}>
          <div style={{fontSize:"12px",fontWeight:700,color:C.orange}}>
            💴 {cashMode==="cashier"?"レジ払い待ち":"集金待ち"} <span style={{background:C.orange,color:"#fff",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",marginLeft:"4px"}}>{cashPending.length}</span>
          </div>
          <div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>
            {cashMode==="cashier"?"お客様がレジに向かっています":"スタッフが集金に伺ってください"}
          </div>
        </div>
        <div style={pad}>
          {cashPending.map((t,i)=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<cashPending.length-1?`1px solid ${C.faint}`:"none"}}>
              <div>
                <div style={{fontSize:"13px",fontWeight:700}}>テーブル{t.id} <span style={{color:C.muted,fontWeight:400,fontSize:"11px"}}>({t.seats}名)</span></div>
                <div style={{fontSize:"16px",color:C.amber,fontWeight:700,marginTop:"3px"}}>¥{t.revenue.toLocaleString()}</div>
                <div style={{fontSize:"10px",color:C.orange,marginTop:"2px"}}>
                  💴 現金 — {cashMode==="cashier"?"レジにて受付":"集金が必要"}
                </div>
              </div>
              <button onClick={()=>dispatch({type:"STORE_COLLECT_CASH",tableId:t.id})}
                style={{padding:"10px 14px",borderRadius:"8px",background:C.green,color:"#fff",border:"none",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
                ✅ {cashMode==="cashier"?"受付完了":"集金完了"}
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    {paidWait.length>0&&<div style={card({border:`1px solid ${C.green}66`})}>
      <div style={{background:C.greenD,padding:"9px 13px",borderBottom:`1px solid ${C.green}22`}}>
        <div style={{fontSize:"12px",fontWeight:700,color:C.green}}>💳 会計完了 — 片付け待ち <span style={{background:C.green,color:"#fff",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",marginLeft:"4px"}}>{paidWait.length}</span></div>
      </div>
      <div style={pad}>
        {paidWait.map((t,i)=>(
          <div key={t.id} style={{...row,justifyContent:"space-between",padding:"8px 0",borderBottom:i<paidWait.length-1?`1px solid ${C.faint}`:"none"}}>
            <div><div style={{fontSize:"12px",fontWeight:700}}>テーブル{t.id} ({t.seats}名)</div><div style={{fontSize:"10px",color:C.green}}>¥{t.revenue.toLocaleString()} · {fmtTime(t.paidAt)}</div></div>
            <button style={sbtn()} onClick={()=>dispatch({type:"STORE_CLEAR_TABLE",tableId:t.id})}>🧹 片付け完了</button>
          </div>
        ))}
      </div>
    </div>}

    {requests.length>0&&<div style={card({border:`1px solid ${C.purple}44`})}>
      <div style={{background:C.purpleD,padding:"9px 13px",borderBottom:`1px solid ${C.purple}22`}}>
        <div style={{fontSize:"12px",fontWeight:700,color:C.purple}}>💌 リクエスト・アレルギー</div>
      </div>
      <div style={pad}>
        {requests.map((t,i)=>(
          <div key={t.id} style={{padding:"7px 0",borderBottom:i<requests.length-1?`1px solid ${C.faint}`:"none"}}>
            <div style={{fontSize:"11px",fontWeight:700,marginBottom:"5px"}}>テーブル{t.id}</div>
            {t.requests.length>0&&<div style={{display:"flex",gap:"4px",flexWrap:"wrap",marginBottom:"4px"}}>{t.requests.map(r=><Badge key={r.id} col="purple">{r.emoji} {r.label}</Badge>)}</div>}
            {t.allergies.length>0&&<div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{t.allergies.map(id=>{const a=ALLERGY_PRESETS.find(x=>x.id===id);return a?<Badge key={id} col="red">{a.emoji} {a.label}アレルギー</Badge>:null;})}</div>}
          </div>
        ))}
      </div>
    </div>}
  </div>;
}

function StoreTablePanel({ state, dispatch, cashMode, setCashMode }){
  const[globalTL,setGlobalTL]=useState("90");
  const occ=state.tables.filter(t=>t.occupied).length;
  const free=state.tables.filter(t=>!t.occupied).length;

  return <div style={{padding:"12px"}}>

    {/* Cash mode setting */}
    <div style={card({border:`1px solid ${C.purple}44`})}>
      <div style={{...pad,background:C.purpleD}}>
        <div style={{fontSize:"12px",fontWeight:700,color:C.purple,marginBottom:"10px"}}>💴 現金払いの対応方法</div>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>setCashMode("staff")}
            style={{flex:1,padding:"12px 8px",borderRadius:"10px",border:`2px solid ${cashMode==="staff"?C.purple:C.bdr}`,background:cashMode==="staff"?C.purpleD:C.surf,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",textAlign:"center",transition:"all 0.15s"}}>
            <div style={{fontSize:"22px",marginBottom:"5px"}}>🙇</div>
            <div style={{fontSize:"11px",fontWeight:cashMode==="staff"?700:400,color:cashMode==="staff"?C.purple:C.muted,lineHeight:1.4}}>スタッフが集金</div>
            <div style={{fontSize:"9px",color:C.muted,marginTop:"3px"}}>そのままお席でお待ちください</div>
          </button>
          <button onClick={()=>setCashMode("cashier")}
            style={{flex:1,padding:"12px 8px",borderRadius:"10px",border:`2px solid ${cashMode==="cashier"?C.purple:C.bdr}`,background:cashMode==="cashier"?C.purpleD:C.surf,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",textAlign:"center",transition:"all 0.15s"}}>
            <div style={{fontSize:"22px",marginBottom:"5px"}}>🧾</div>
            <div style={{fontSize:"11px",fontWeight:cashMode==="cashier"?700:400,color:cashMode==="cashier"?C.purple:C.muted,lineHeight:1.4}}>レジにご案内</div>
            <div style={{fontSize:"9px",color:C.muted,marginTop:"3px"}}>テーブル番号を表示</div>
          </button>
        </div>
        <div style={{fontSize:"10px",color:C.purple,marginTop:"10px",padding:"7px 10px",background:`${C.purple}11`,borderRadius:"7px"}}>
          ✓ 現在: {cashMode==="staff"?"スタッフが席まで集金に伺います":"お客様をレジにご案内します"}
        </div>
      </div>
    </div>
    {/* Floor map */}
    <div style={card()}>
      <div style={pad}>
        <div style={{...lbl,marginBottom:"8px"}}>🗺️ フロアマップ</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"5px"}}>
          {state.tables.map(t=>{
            const r=tlRem(t);
            const bg=t.paymentStatus==="paid"?C.green:t.occupied?r!==null&&r<=15?C.red:C.amber:C.faint;
            return <div key={t.id} style={{aspectRatio:"1",borderRadius:"7px",background:`${bg}22`,border:`2px solid ${bg}55`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:700,color:bg}}>
              <div style={{fontSize:"8px",color:C.muted}}>{t.id}</div>
              <div>{t.seats}席</div>
            </div>;
          })}
        </div>
        <div style={{display:"flex",gap:"10px",marginTop:"8px",fontSize:"9px",color:C.muted}}>
          <span><span style={{color:C.amber}}>■</span> 着席</span>
          <span><span style={{color:C.red}}>■</span> まもなく</span>
          <span><span style={{color:C.green}}>■</span> 会計済</span>
          <span><span style={{color:C.muted}}>■</span> 空席</span>
        </div>
      </div>
    </div>

    {/* Global TL */}
    <div style={card({border:`1px solid ${C.blue}44`})}>
      <div style={{...pad,background:C.blueD}}>
        <div style={{fontSize:"11px",fontWeight:700,color:C.blue,marginBottom:"8px"}}>⚙️ 全テーブルの時間制限を一括設定</div>
        <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>
          {TIME_LIMITS.map(tl=><button key={tl.id} onClick={()=>setGlobalTL(tl.id)} style={{padding:"5px 10px",borderRadius:"14px",fontSize:"10px",fontWeight:700,cursor:"pointer",border:`1px solid ${globalTL===tl.id?C.blue:C.bdr}`,background:globalTL===tl.id?C.blueD:C.surf,color:globalTL===tl.id?C.blue:C.muted,fontFamily:"'Noto Sans JP',sans-serif"}}>{tl.emoji} {tl.label}</button>)}
        </div>
        <Btn v="blue" onClick={()=>dispatch({type:"STORE_SET_ALL_TL",tlId:globalTL})} style={{...({background:C.blueD,color:C.blue,border:`1px solid ${C.blue}44`}),padding:"10px"}}>全テーブルに適用</Btn>
      </div>
    </div>

    {state.tables.map(t=><StoreTableCard key={t.id} t={t} dispatch={dispatch}/>)}
  </div>;
}

function StoreTableCard({ t, dispatch }){
  const[open,setOpen]=useState(false);
  const sc=SCENES.find(s=>s.id===t.scene);
  const tl=TIME_LIMITS.find(x=>x.id===t.timeLimitId);
  const rem=estRem(t),tlr=tlRem(t),el=elMin(t),rev=calcRev(t);
  const warn=tlr!==null&&tlr<=20,crit=tlr!==null&&tlr<=10;
  const pendingCalls=t.calls.filter(c=>!c.done).length;
  const servedAll=t.orders.length>0&&t.orders.every(o=>o.served);
  const servedCnt=t.orders.filter(o=>o.served).length;
  const isCustomerTable = t.id===CUSTOMER_TABLE_ID;
  const isCashPending = t.paymentStatus==="cash_pending";
  const borderCol=isCashPending?C.red:t.paymentStatus==="paid"?C.green:crit?C.red:warn?C.orange:pendingCalls>0?C.red:undefined;
  const sbtn=(v="ghost")=>({padding:"7px 11px",borderRadius:"7px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",whiteSpace:"nowrap",
    background:v==="primary"?C.amber:v==="green"?C.greenD:"transparent",
    color:v==="primary"?C.bg:v==="green"?C.green:C.txt,
    border:v==="primary"?"none":v==="green"?`1px solid ${C.green}44`:`1px solid ${C.bdr}`});

  return <div style={card({border:borderCol?`1px solid ${borderCol}77`:isCustomerTable?`1px solid ${C.blue}44`:undefined})}>
    <div style={{...pad,cursor:"pointer"}} onClick={()=>setOpen(!open)}>
      {isCustomerTable&&<div style={{fontSize:"9px",color:C.blue,fontWeight:700,marginBottom:"5px"}}>📱 デモ客用テーブル</div>}
      <div style={{...row,justifyContent:"space-between"}}>
        <div style={row}>
          <div style={{width:"38px",height:"38px",borderRadius:"9px",background:isCashPending?C.redD:t.paymentStatus==="paid"?C.greenD:t.occupied?C.amberD:C.greenD,border:`1px solid ${isCashPending?C.red+"44":t.paymentStatus==="paid"?C.green+"44":t.occupied?C.amberM:C.green+"33"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>
            {isCashPending?"💴":t.paymentStatus==="paid"?"💳":t.occupied?(sc?.emoji||"🪑"):"⬜"}
          </div>
          <div>
            <div style={{fontSize:"13px",fontWeight:700}}>テーブル{t.id} <span style={{color:C.muted,fontWeight:400,fontSize:"10px"}}>{t.seats}名·{t.floor}</span></div>
            <div style={{fontSize:"9px",color:C.muted}}>
              {t.paymentStatus==="paid"?`💳 ${fmtTime(t.paidAt)} · ¥${t.revenue.toLocaleString()}`:t.occupied?`${sc?.label} · ${el}分経過 · ¥${rev.toLocaleString()}`:"空席"}
            </div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"3px"}}>
          <Badge col={isCashPending?"orange":t.paymentStatus==="paid"?"green":t.occupied?"amber":"green"} size="lg">
            {isCashPending?"💴 レジ払い待ち":t.paymentStatus==="paid"?"💳 会計済":t.occupied?"着席中":"空席"}
          </Badge>
          {t.occupied&&t.paymentStatus!=="paid"&&<span style={{fontSize:"11px",fontWeight:700,color:crit?C.red:warn?C.orange:C.muted}}>残り{rem}分</span>}
        </div>
      </div>
      <div style={{display:"flex",gap:"4px",flexWrap:"wrap",marginTop:"7px"}}>
        {tl?.minutes&&<Badge col="blue">{tl.label}</Badge>}
        {pendingCalls>0&&<Badge col="red">🔔 {pendingCalls}件</Badge>}
        {(t.requests.length>0||t.allergies.length>0)&&<Badge col="purple">💌 リクエスト</Badge>}
        {t.orders.length>0&&<Badge col={servedAll?"green":"orange"}>{servedAll?"✅ 全品済":`${servedCnt}/${t.orders.length}品`}</Badge>}
      </div>
      {t.occupied&&t.paymentStatus!=="paid"&&tl?.minutes&&<div style={{marginTop:"7px"}}><Bar pct={el/tl.minutes*100} col={crit?C.red:warn?C.orange:C.blue}/></div>}
      <div style={{textAlign:"center",fontSize:"9px",color:C.muted,marginTop:"5px"}}>{open?"▲":"▼"}</div>
    </div>

    {open&&<div style={{borderTop:`1px solid ${C.bdr}`}}>
      {/* Dish check */}
      {t.orders.length>0&&<div style={{padding:"11px 13px",borderBottom:`1px solid ${C.faint}`}}>
        <div style={{...lbl,color:C.amber,marginBottom:"8px"}}>🍽️ 料理提供チェック</div>
        <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
          {t.orders.map((o,idx)=>{const m=MENU.find(x=>x.id===o.menuId);if(!m)return null;return(
            <div key={idx} onClick={()=>dispatch({type:"STORE_TOGGLE_SERVED",tableId:t.id,idx})}
              style={{...row,justifyContent:"space-between",padding:"9px 11px",borderRadius:"9px",background:o.served?C.greenD:C.faint,border:`1px solid ${o.served?C.green+"44":C.bdr}`,cursor:"pointer",userSelect:"none"}}>
              <div style={row}>
                <div style={{width:"20px",height:"20px",borderRadius:"50%",background:o.served?C.green:"transparent",border:`2px solid ${o.served?C.green:C.muted}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"#fff",flexShrink:0}}>{o.served&&"✓"}</div>
                <span style={{fontSize:"14px"}}>{m.emoji}</span>
                <span style={{fontSize:"11px",fontWeight:o.served?400:700,color:o.served?C.muted:C.txt,textDecoration:o.served?"line-through":"none"}}>{m.name}</span>
                {o.qty>1&&<Badge col="amber">×{o.qty}</Badge>}
              </div>
              <span style={{fontSize:"9px",fontWeight:700,color:o.served?C.green:C.muted}}>{o.served?"提供済":"未提供"}</span>
            </div>
          );})}
        </div>
        {!servedAll&&<div style={{fontSize:"10px",color:C.orange,marginTop:"6px",padding:"5px 8px",background:C.orangeD,borderRadius:"5px"}}>⚠️ 未提供の料理があります</div>}
      </div>}

      {/* Calls */}
      {t.calls.length>0&&<div style={{padding:"11px 13px",borderBottom:`1px solid ${C.faint}`}}>
        <div style={{...lbl,marginBottom:"6px"}}>🔔 呼び出し履歴</div>
        {t.calls.map((c,i)=>(
          <div key={i} style={{...row,justifyContent:"space-between",padding:"5px 0",borderBottom:i<t.calls.length-1?`1px solid ${C.faint}`:"none"}}>
            <div style={row}><span style={{fontSize:"14px"}}>{c.emoji}</span><div><div style={{fontSize:"10px",fontWeight:700}}>{c.label}</div>{c.note&&<div style={{fontSize:"9px",color:C.muted}}>{c.note}</div>}</div></div>
            {c.done?<Badge col="green">✓ 済</Badge>:<button style={{padding:"4px 8px",borderRadius:"6px",background:C.greenD,color:C.green,border:`1px solid ${C.green}44`,fontSize:"9px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}} onClick={()=>dispatch({type:"STORE_DISMISS_CALL",tableId:t.id,callTime:c.time})}>対応済</button>}
          </div>
        ))}
      </div>}

      {/* Requests */}
      {(t.requests.length>0||t.allergies.length>0)&&<div style={{padding:"11px 13px",borderBottom:`1px solid ${C.faint}`}}>
        {t.requests.length>0&&<><div style={lbl}>💌 リクエスト</div><div style={{display:"flex",gap:"4px",flexWrap:"wrap",marginBottom:"8px"}}>{t.requests.map(r=><Badge key={r.id} col="purple" size="lg">{r.emoji} {r.label}</Badge>)}</div></>}
        {t.allergies.length>0&&<><div style={lbl}>⚠️ アレルギー</div><div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{t.allergies.map(id=>{const a=ALLERGY_PRESETS.find(x=>x.id===id);return a?<Badge key={id} col="red" size="lg">{a.emoji} {a.label}</Badge>:null;})}</div></>}
      </div>}

      {/* TL change */}
      <div style={{padding:"11px 13px",borderBottom:`1px solid ${C.faint}`}}>
        <div style={{...lbl,marginBottom:"6px"}}>⚙️ 時間制限</div>
        <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
          {TIME_LIMITS.map(opt=><button key={opt.id} onClick={()=>dispatch({type:"STORE_SET_TL",tableId:t.id,tlId:opt.id})} style={{padding:"4px 9px",borderRadius:"14px",fontSize:"9px",fontWeight:700,cursor:"pointer",border:`1px solid ${t.timeLimitId===opt.id?C.blue:C.bdr}`,background:t.timeLimitId===opt.id?C.blueD:C.faint,color:t.timeLimitId===opt.id?C.blue:C.muted,fontFamily:"'Noto Sans JP',sans-serif"}}>{opt.emoji} {opt.label}</button>)}
        </div>
      </div>

      {/* Seat type & count */}
      <div style={{padding:"11px 13px",borderBottom:`1px solid ${C.faint}`}}>
        <div style={{...lbl,marginBottom:"8px"}}>🪑 席の種類・席数</div>
        {/* Seat type selector */}
        <div style={{display:"flex",gap:"4px",flexWrap:"wrap",marginBottom:"10px"}}>
          {SEAT_TYPES.map(st=>(
            <button key={st.id} onClick={()=>dispatch({type:"STORE_SET_SEAT_TYPE",tableId:t.id,seatType:st.id,seats:t.seats})}
              style={{padding:"5px 10px",borderRadius:"14px",fontSize:"9px",fontWeight:700,cursor:"pointer",
                border:`1px solid ${t.seatType===st.id?C.amber:C.bdr}`,
                background:t.seatType===st.id?C.amberD:C.faint,
                color:t.seatType===st.id?C.amber:C.muted,
                fontFamily:"'Noto Sans JP',sans-serif",
                display:"flex",alignItems:"center",gap:"4px"}}>
              <span>{st.emoji}</span><span>{st.label}</span>
            </button>
          ))}
        </div>
        {/* Seats count selector */}
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:"10px",color:C.muted}}>席数</span>
          <div style={{display:"flex",gap:"4px"}}>
            {[1,2,3,4,5,6,7,8,10,12].map(n=>(
              <button key={n} onClick={()=>dispatch({type:"STORE_SET_SEAT_TYPE",tableId:t.id,seatType:t.seatType||"table",seats:n})}
                style={{width:"26px",height:"26px",borderRadius:"6px",fontSize:"11px",fontWeight:t.seats===n?700:400,cursor:"pointer",
                  border:`1px solid ${t.seats===n?C.amber:C.bdr}`,
                  background:t.seats===n?C.amberD:C.faint,
                  color:t.seats===n?C.amber:C.muted,
                  fontFamily:"'Noto Sans JP',sans-serif",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment */}
      <div style={{padding:"11px 13px"}}>
        <div style={{...row,justifyContent:"space-between",marginBottom:"9px"}}>
          <div><div style={lbl}>💳 会計</div><div style={{fontSize:"18px",fontWeight:700,color:C.amber}}>¥{rev.toLocaleString()}</div></div>        </div>
        {t.paymentStatus==="unpaid"&&t.occupied&&<>
          <div style={{display:"flex",gap:"7px",marginBottom:"7px"}}>
            <button style={{flex:1,padding:"11px",borderRadius:"8px",background:C.blueD,color:C.blue,border:`1px solid ${C.blue}44`,fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",textAlign:"center"}}
              onClick={()=>dispatch({type:"STORE_MARK_PAID",tableId:t.id,paymentMethod:"card"})}>
              💳 カード・キャッシュレス
            </button>
            <button style={{flex:1,padding:"11px",borderRadius:"8px",background:C.greenD,color:C.green,border:`1px solid ${C.green}44`,fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",textAlign:"center"}}
              onClick={()=>dispatch({type:"STORE_MARK_PAID",tableId:t.id,paymentMethod:"cash"})}>
              💴 現金
            </button>
          </div>
          <button style={{...sbtn(),width:"100%",padding:"9px",textAlign:"center"}} onClick={()=>dispatch({type:"STORE_CLEAR_TABLE",tableId:t.id})}>退席（未会計）</button>
        </>}
        {isCashPending&&(
          <div>
            <div style={{background:C.orangeD,border:`1px solid ${C.orange}33`,borderRadius:"8px",padding:"11px",marginBottom:"8px"}}>
              <div style={{fontSize:"12px",color:C.orange,fontWeight:700,marginBottom:"3px"}}>💴 レジ払い待ち</div>
              <div style={{fontSize:"16px",fontWeight:700,color:C.amber}}>¥{rev.toLocaleString()}</div>
              <div style={{fontSize:"10px",color:C.muted,marginTop:"3px"}}>お客様がレジに向かっています</div>
            </div>
            <button onClick={()=>dispatch({type:"STORE_COLLECT_CASH",tableId:t.id})}
              style={{display:"block",width:"100%",padding:"11px",borderRadius:"8px",background:C.green,color:"#fff",border:"none",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",textAlign:"center"}}>
              ✅ レジにて受付完了
            </button>
          </div>
        )}
        {t.paymentStatus==="paid"&&<div style={{display:"flex",gap:"7px",alignItems:"center"}}>
          <div style={{flex:1,background:C.greenD,border:`1px solid ${C.green}33`,borderRadius:"7px",padding:"9px",fontSize:"11px",color:C.green,fontWeight:700}}>
            ✅ {fmtTime(t.paidAt)} 会計完了
            <span style={{marginLeft:"8px",fontSize:"10px",color:C.muted}}>
              {t.paymentMethod==="cash"?"💴 現金":"💳 カード"}
            </span>
          </div>
          <button style={{...sbtn(),padding:"10px"}} onClick={()=>dispatch({type:"STORE_CLEAR_TABLE",tableId:t.id})}>🧹 片付け</button>
        </div>}
        {!t.occupied&&!isCashPending&&<button style={{...sbtn("primary"),display:"block",width:"100%",padding:"10px",textAlign:"center"}} onClick={()=>dispatch({type:"STORE_SEAT_TABLE",tableId:t.id})}>着席させる</button>}
      </div>
    </div>}
  </div>;
}

// ── Queue Panel ───────────────────────────────────────────────
function StoreQueuePanel({ state, dispatch }){
  const active=state.waitQueue.filter(w=>!w.done);
  const occ=state.tables.filter(t=>t.occupied);
  const sorted=occ.map(t=>({...t,rem:estRem(t)})).sort((a,b)=>a.rem-b.rem);
  const nextFree=sorted[0];

  return <div style={{padding:"12px"}}>
    {/* Summary */}
    <div style={card()}>
      <div style={pad}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",textAlign:"center"}}>
          {[{l:"待ち組数",v:`${active.length}組`,c:C.amber},{l:"次の空席予測",v:nextFree?`${nextFree.rem}分後`:"空席あり",c:nextFree?C.blue:C.green},{l:"空席テーブル",v:`${state.tables.filter(t=>!t.occupied).length}卓`,c:C.green}].map(s=>(
            <div key={s.l}>
              <div style={{fontSize:"9px",color:C.muted,marginBottom:"4px"}}>{s.l}</div>
              <div style={{fontSize:"18px",fontWeight:700,color:s.c,fontFamily:"'Shippori Mincho',serif"}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {active.length===0&&<div style={{textAlign:"center",padding:"32px 20px"}}>
      <div style={{fontSize:"40px",marginBottom:"10px"}}>👌</div>
      <div style={{fontSize:"13px",color:C.muted}}>現在ウェイティングはいません</div>
    </div>}

    {active.map((w,i)=>{
      const cumW=(nextFree?.rem??20)+i*25;
      return <div key={w.id} style={card({border:w.notified?`1px solid ${C.green}55`:undefined})}>
        <div style={pad}>
          <div style={{...row,justifyContent:"space-between",marginBottom:"8px"}}>
            <div style={row}>
              <div style={{width:"36px",height:"36px",borderRadius:"50%",background:C.amberD,border:`1px solid ${C.amberM}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:700,color:C.amber,flexShrink:0}}>{i+1}</div>
              <div>
                <div style={{fontSize:"13px",fontWeight:700}}>{w.name}様 <span style={{color:C.muted,fontWeight:400,fontSize:"11px"}}>{w.seats}名</span></div>
                <div style={{fontSize:"10px",color:C.muted}}>{waitMin(w.joinedAt)}分待ち · 目安 約{cumW}分</div>
              </div>
            </div>
            {w.notified?<Badge col="green" size="lg">🔔 案内済</Badge>:<Badge col="amber" size="lg">⏳ 待機中</Badge>}
          </div>
          <Bar pct={Math.min(100,waitMin(w.joinedAt)/cumW*100)} col={w.notified?C.green:C.amber}/>
          <div style={{display:"flex",gap:"7px",marginTop:"10px"}}>
            {!w.notified&&<button onClick={()=>dispatch({type:"STORE_NOTIFY_QUEUE",id:w.id})}
              style={{flex:2,padding:"9px",borderRadius:"8px",background:C.amberD,color:C.amber,border:`1px solid ${C.amberM}`,fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
              🔔 席が空いたことを通知する
            </button>}
            <button onClick={()=>dispatch({type:"STORE_REMOVE_QUEUE",id:w.id})}
              style={{flex:1,padding:"9px",borderRadius:"8px",background:"transparent",color:C.muted,border:`1px solid ${C.bdr}`,fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
              削除
            </button>
          </div>
        </div>
      </div>;
    })}
  </div>;
}

// ── Sales Panel ───────────────────────────────────────────────
function StoreSalesPanel({ state, store }){
  const completed=[...state.salesHistory,...state.tables.filter(t=>t.paymentStatus==="paid").map(t=>({tableId:t.id,seats:t.seats,scene:t.scene,paidAt:t.paidAt,revenue:t.revenue}))];
  const todayRev=completed.reduce((s,r)=>s+r.revenue,0);
  const inSeat=state.tables.filter(t=>t.occupied&&t.paymentStatus!=="paid").reduce((s,t)=>s+calcRev(t),0);
  const avgCheck=completed.length>0?Math.round(todayRev/completed.length):0;
  const now2=Date.now();
  const hourly=Array.from({length:8},(_,i)=>{const hs=now2-(7-i)*3600000,he=now2-(6-i)*3600000;const rev=completed.filter(r=>r.paidAt>=hs&&r.paidAt<he).reduce((s,r)=>s+r.revenue,0);return{label:`${new Date(hs).getHours()}時`,rev};});
  const maxH=Math.max(...hourly.map(h=>h.rev),1);
  const scStats={};completed.forEach(r=>{if(!scStats[r.scene])scStats[r.scene]={count:0,rev:0};scStats[r.scene].count++;scStats[r.scene].rev+=r.revenue;});

  return <div style={{padding:"12px"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginBottom:"10px"}}>
      {[{l:"本日の売上",v:`¥${todayRev.toLocaleString()}`,c:C.amber},{l:"着席中見込み",v:`¥${inSeat.toLocaleString()}`,c:C.blue},{l:"完了テーブル",v:`${completed.length}組`,c:C.green},{l:"1組あたり",v:`¥${avgCheck.toLocaleString()}`,c:C.purple}].map(k=>(
        <div key={k.l} style={card({margin:0})}>
          <div style={{...pad,paddingTop:"12px",paddingBottom:"12px"}}>
            <div style={{fontSize:"9px",color:C.muted,marginBottom:"4px"}}>{k.l}</div>
            <div style={{fontSize:"19px",fontWeight:700,color:k.c,fontFamily:"'Shippori Mincho',serif"}}>{k.v}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={card()}>
      <div style={pad}>
        <div style={{...lbl,marginBottom:"12px"}}>📈 時間帯別売上</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:"5px",height:"72px"}}>
          {hourly.map((h,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
              <div style={{fontSize:"8px",color:C.amber}}>{h.rev>0?`¥${Math.round(h.rev/1000)}k`:""}</div>
              <div style={{width:"100%",background:h.rev>0?C.amber:C.faint,borderRadius:"2px 2px 0 0",height:`${Math.max(3,(h.rev/maxH)*56)}px`,transition:"height 0.5s"}}/>
              <div style={{fontSize:"8px",color:C.muted}}>{h.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {Object.keys(scStats).length>0&&<div style={card()}>
      <div style={pad}>
        <div style={{...lbl,marginBottom:"8px"}}>👥 シーン別</div>
        {Object.entries(scStats).sort((a,b)=>b[1].rev-a[1].rev).map(([id,st])=>{
          const sc=SCENES.find(s=>s.id===id);
          return <div key={id} style={{marginBottom:"8px"}}>
            <div style={{...row,justifyContent:"space-between",marginBottom:"2px"}}>
              <span style={{fontSize:"11px"}}>{sc?.emoji} {sc?.label} <span style={{color:C.muted,fontSize:"9px"}}>({st.count}組)</span></span>
              <span style={{fontSize:"11px",color:C.amber,fontWeight:700}}>¥{st.rev.toLocaleString()}</span>
            </div>
            <Bar pct={todayRev>0?st.rev/todayRev*100:0} col={C.amber}/>
          </div>;
        })}
      </div>
    </div>}
    <div style={card()}>
      <div style={pad}>
        <div style={{...lbl,marginBottom:"8px"}}>🧾 会計ログ</div>
        {/* Cash/Card breakdown */}
        {completed.length>0&&(()=>{
          const cashRev=completed.filter(r=>r.paymentMethod==="cash").reduce((s,r)=>s+r.revenue,0);
          const cardRev=completed.filter(r=>r.paymentMethod!=="cash").reduce((s,r)=>s+r.revenue,0);
          return <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
            <div style={{flex:1,background:C.greenD,border:`1px solid ${C.green}33`,borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:"9px",color:C.muted,marginBottom:"3px"}}>💴 現金</div>
              <div style={{fontSize:"15px",fontWeight:700,color:C.green}}>¥{cashRev.toLocaleString()}</div>
            </div>
            <div style={{flex:1,background:C.blueD,border:`1px solid ${C.blue}33`,borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:"9px",color:C.muted,marginBottom:"3px"}}>💳 カード</div>
              <div style={{fontSize:"15px",fontWeight:700,color:C.blue}}>¥{cardRev.toLocaleString()}</div>
            </div>
          </div>;
        })()}
        {completed.length===0&&<div style={{fontSize:"11px",color:C.muted}}>まだ会計完了のテーブルはありません</div>}
        {[...completed].sort((a,b)=>b.paidAt-a.paidAt).map((r,i)=>{
          const sc=SCENES.find(s=>s.id===r.scene);
          const isCash=r.paymentMethod==="cash";
          return(
            <div key={i} style={{...row,justifyContent:"space-between",padding:"8px 0",borderBottom:i<completed.length-1?`1px solid ${C.faint}`:"none"}}>
              <div style={row}>
                <span style={{fontSize:"14px"}}>{sc?.emoji}</span>
                <div>
                  <div style={{fontSize:"11px",fontWeight:700}}>テーブル{r.tableId} ({r.seats}名)</div>
                  <div style={{fontSize:"9px",color:C.muted}}>
                    {sc?.label} · {fmtTime(r.paidAt)}
                    <span style={{marginLeft:"6px",color:isCash?C.green:C.blue}}>
                      {isCash?"💴 現金":"💳 カード"}
                    </span>
                  </div>
                </div>
              </div>
              <span style={{fontSize:"12px",color:C.green,fontWeight:700}}>¥{r.revenue.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// QR PANEL
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// KDS PANEL (Kitchen Display System)
// ═══════════════════════════════════════════════════════════════
function StoreKDSPanel({ state, dispatch }){
  const[,tick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>tick(n=>n+1),10000);return()=>clearInterval(t);},[]);

  // Collect all unserved orders across occupied tables, sorted by order time
  const pendingOrders = state.tables
    .filter(t=>t.occupied)
    .flatMap(t=>
      t.orders
        .map((o,idx)=>({...o,tableId:t.id,tableSeats:t.seats,orderIdx:idx,startedAt:t.startedAt}))
        .filter(o=>!o.served)
    )
    .sort((a,b)=>(a.startedAt||0)-(b.startedAt||0));

  const servedOrders = state.tables
    .filter(t=>t.occupied)
    .flatMap(t=>
      t.orders
        .map((o,idx)=>({...o,tableId:t.id,orderIdx:idx}))
        .filter(o=>o.served)
    );

  // Group pending by table
  const byTable = {};
  pendingOrders.forEach(o=>{
    if(!byTable[o.tableId]) byTable[o.tableId]={tableId:o.tableId,tableSeats:o.tableSeats,startedAt:o.startedAt,items:[]};
    byTable[o.tableId].items.push(o);
  });
  const tableGroups = Object.values(byTable).sort((a,b)=>(a.startedAt||0)-(b.startedAt||0));

  const waitMin2 = ts => ts ? Math.floor((Date.now()-ts)/60000) : 0;

  return <div style={{padding:"12px",background:C.bg,minHeight:"100%"}}>
    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
      <div>
        <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"18px",fontWeight:800}}>👨‍🍳 キッチン</div>
        <div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>
          未提供 <span style={{color:C.red,fontWeight:700}}>{pendingOrders.length}</span>品 ·
          提供済 <span style={{color:C.green,fontWeight:700}}>{servedOrders.length}</span>品
        </div>
      </div>
      {pendingOrders.length===0&&(
        <Badge col="green">✅ 全品提供済</Badge>
      )}
    </div>

    {pendingOrders.length===0&&(
      <div style={{textAlign:"center",padding:"40px 20px"}}>
        <div style={{fontSize:"48px",marginBottom:"12px"}}>✅</div>
        <div style={{fontSize:"14px",fontWeight:700,marginBottom:"4px"}}>全テーブルに提供済みです</div>
        <div style={{fontSize:"11px",color:C.muted}}>新しい注文が入ると表示されます</div>
      </div>
    )}

    {/* Orders grouped by table */}
    {tableGroups.map(group=>{
      const waitTime = waitMin2(group.startedAt);
      const urgent = waitTime > 30;
      const warn = waitTime > 15;
      const borderCol = urgent?C.red:warn?C.orange:C.bdr;

      return <div key={group.tableId} style={{
        background:C.surf,
        border:`2px solid ${borderCol}`,
        borderRadius:"14px",
        overflow:"hidden",
        marginBottom:"12px",
      }}>
        {/* Table header */}
        <div style={{
          background:urgent?C.redD:warn?C.orangeD:C.amberD,
          padding:"10px 14px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{
              width:"40px",height:"40px",borderRadius:"10px",
              background:urgent?C.red:warn?C.orange:C.amber,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"18px",fontWeight:800,color:"#fff",
              fontFamily:"'Shippori Mincho',serif",
            }}>{group.tableId}</div>
            <div>
              <div style={{fontSize:"13px",fontWeight:700}}>テーブル {group.tableId}</div>
              <div style={{fontSize:"10px",color:C.muted}}>{group.tableSeats}名 · {waitTime}分経過</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <Badge col={urgent?"red":warn?"orange":"amber"}>{group.items.length}品 未提供</Badge>
            {/* Mark all served */}
            <button onClick={()=>group.items.forEach(o=>dispatch({type:"STORE_TOGGLE_SERVED",tableId:group.tableId,idx:o.orderIdx}))}
              style={{padding:"6px 12px",borderRadius:"8px",background:C.green,color:"#fff",border:"none",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
              全品 ✓
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{padding:"8px 14px"}}>
          {group.items.map((o,i)=>{
            const m = state.menuItems?.find(x=>x.id===o.menuId) || MENU.find(x=>x.id===o.menuId);
            if(!m) return null;
            return <div key={i} style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"10px 0",
              borderBottom:i<group.items.length-1?`1px solid ${C.faint}`:"none",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{fontSize:"24px"}}>{m.emoji}</span>
                <div>
                  <div style={{fontSize:"13px",fontWeight:700}}>{m.name}</div>
                  {o.qty>1&&<div style={{fontSize:"10px",color:C.amber,fontWeight:700}}>×{o.qty}</div>}
                </div>
              </div>
              <button onClick={()=>dispatch({type:"STORE_TOGGLE_SERVED",tableId:group.tableId,idx:o.orderIdx})}
                style={{
                  width:"36px",height:"36px",borderRadius:"50%",
                  background:C.greenD,color:C.green,
                  border:`2px solid ${C.green}44`,
                  fontSize:"16px",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>✓</button>
            </div>;
          })}
        </div>
      </div>;
    })}

    {/* Served today summary */}
    {servedOrders.length>0&&(
      <div style={{...card({border:`1px solid ${C.green}33`}),marginTop:"8px"}}>
        <div style={pad}>
          <div style={{...lbl,color:C.green,marginBottom:"8px"}}>✅ 本日の提供済み一覧</div>
          {state.tables.filter(t=>t.occupied&&t.orders.some(o=>o.served)).map(t=>(
            <div key={t.id} style={{padding:"5px 0",borderBottom:`1px solid ${C.faint}`}}>
              <div style={{fontSize:"11px",fontWeight:700,color:C.muted,marginBottom:"4px"}}>テーブル {t.id}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                {t.orders.filter(o=>o.served).map((o,i)=>{
                  const m=state.menuItems?.find(x=>x.id===o.menuId)||MENU.find(x=>x.id===o.menuId);
                  return m?<Badge key={i} col="green">{m.emoji} {m.name}{o.qty>1?` ×${o.qty}`:""}</Badge>:null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// MENU PANEL
// ═══════════════════════════════════════════════════════════════
const MENU_EMOJIS = ["🍜","🍣","🍱","🥩","🍗","🍕","🍔","🍺","☕","🍰","🍛","🥗","🦐","🍤","🥟","🍶","🧆","🥘","🫕","🍞","🥙","🌮","🧁","🍦","🥤","🍵","🥂","🍷","🫖","🧃"];

function StoreMenuPanel({ state, dispatch, store }){
  const[editId, setEditId] = useState(null);
  const[showAdd, setShowAdd] = useState(false);
  const[filterCat, setFilterCat] = useState("all");
  const[newItem, setNewItem] = useState({ name:"", price:"", cat:"", emoji:"🍜", desc:"", baseMin:15 });

  const menuItems = state.menuItems || [];
  const cats = ["all", ...new Set(menuItems.map(m=>m.cat))];
  const shown = filterCat==="all" ? menuItems : menuItems.filter(m=>m.cat===filterCat);
  const currency = CURRENCIES.find(c=>c.id===store?.currency)||CURRENCIES[0];

  function saveEdit(id, data){ dispatch({type:"MENU_UPDATE_ITEM", id, data}); setEditId(null); }
  function addItem(){
    if(!newItem.name||!newItem.price) return;
    dispatch({type:"MENU_ADD_ITEM", item:{...newItem, price:Number(newItem.price), baseMin:Number(newItem.baseMin)||15}});
    setNewItem({name:"",price:"",cat:"",emoji:"🍜",desc:"",baseMin:15});
    setShowAdd(false);
  }

  const inp = (extra={})=>({width:"100%",background:C.faint,border:`1px solid ${C.bdr}`,borderRadius:"7px",padding:"8px 10px",fontSize:"12px",color:C.txt,fontFamily:"'Noto Sans JP',sans-serif",boxSizing:"border-box",outline:"none",...extra});

  return <div style={{padding:"12px"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
      <div>
        <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"18px",fontWeight:800}}>メニュー管理</div>
        <div style={{fontSize:"10px",color:C.muted,marginTop:"2px"}}>{menuItems.length}品 · 売り切れ {menuItems.filter(m=>m.soldOut).length}品</div>
      </div>
      <button onClick={()=>setShowAdd(!showAdd)}
        style={{padding:"8px 14px",borderRadius:"8px",background:C.amber,color:C.bg,border:"none",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
        ＋ 追加
      </button>
    </div>

    {/* Add new item form */}
    {showAdd&&(
      <div style={card({border:`1px solid ${C.amber}44`,background:C.amberD,marginBottom:"14px"})}>
        <div style={pad}>
          <div style={{fontSize:"12px",fontWeight:700,color:C.amber,marginBottom:"12px"}}>＋ 新しいメニューを追加</div>

          {/* Emoji picker */}
          <div style={{marginBottom:"10px"}}>
            <div style={{...lbl,marginBottom:"6px"}}>絵文字</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px",maxHeight:"80px",overflowY:"auto"}}>
              {MENU_EMOJIS.map(e=>(
                <button key={e} onClick={()=>setNewItem(n=>({...n,emoji:e}))}
                  style={{width:"34px",height:"34px",borderRadius:"7px",fontSize:"18px",cursor:"pointer",border:`2px solid ${newItem.emoji===e?C.amber:C.bdr}`,background:newItem.emoji===e?C.surf:C.faint,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
            <div>
              <div style={lbl}>メニュー名</div>
              <input value={newItem.name} onChange={e=>setNewItem(n=>({...n,name:e.target.value}))} placeholder="例：塩ラーメン" style={inp()}/>
            </div>
            <div>
              <div style={lbl}>価格（{currency.symbol}）</div>
              <input type="number" value={newItem.price} onChange={e=>setNewItem(n=>({...n,price:e.target.value}))} placeholder="例：850" style={inp()}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
            <div>
              <div style={lbl}>カテゴリー</div>
              <input value={newItem.cat} onChange={e=>setNewItem(n=>({...n,cat:e.target.value}))} placeholder="例：麺、ドリンク" style={inp()}/>
            </div>
            <div>
              <div style={lbl}>調理時間（分）</div>
              <input type="number" value={newItem.baseMin} onChange={e=>setNewItem(n=>({...n,baseMin:e.target.value}))} placeholder="15" style={inp()}/>
            </div>
          </div>
          <div style={{marginBottom:"12px"}}>
            <div style={lbl}>説明文（任意）</div>
            <input value={newItem.desc} onChange={e=>setNewItem(n=>({...n,desc:e.target.value}))} placeholder="例：あっさり塩ベーススープ" style={inp()}/>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setShowAdd(false)}
              style={{flex:1,padding:"10px",borderRadius:"8px",background:"transparent",color:C.muted,border:`1px solid ${C.bdr}`,fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
              キャンセル
            </button>
            <button onClick={addItem} disabled={!newItem.name||!newItem.price}
              style={{flex:2,padding:"10px",borderRadius:"8px",background:C.amber,color:C.bg,border:"none",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",opacity:(!newItem.name||!newItem.price)?0.4:1}}>
              追加する
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Category filter */}
    <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"12px"}}>
      {cats.map(c=>(
        <button key={c} onClick={()=>setFilterCat(c)}
          style={{padding:"5px 12px",borderRadius:"16px",fontSize:"11px",fontWeight:700,cursor:"pointer",border:"none",background:filterCat===c?C.amber:C.faint,color:filterCat===c?C.bg:C.muted,fontFamily:"'Noto Sans JP',sans-serif"}}>
          {c==="all"?"すべて":c}
        </button>
      ))}
    </div>

    {/* Menu items — grouped by category with reorder */}
    {(filterCat==="all" ? cats.filter(c=>c!=="all") : [filterCat]).map(cat=>{
      const catItems = menuItems.filter(m=>m.cat===cat);
      if(catItems.length===0) return null;
      return <div key={cat} style={{marginBottom:"16px"}}>
        <div style={{...lbl,padding:"2px 2px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span>{cat} <span style={{color:C.muted,fontWeight:400}}>({catItems.length}品)</span></span>
        </div>
        {catItems.map((item,catIdx)=>(
          <div key={item.id} style={card({border:item.soldOut?`1px solid ${C.red}44`:undefined,opacity:item.soldOut?0.7:1,marginBottom:"7px"})}>
            {editId===item.id
              ? <EditItemForm item={item} onSave={data=>saveEdit(item.id,data)} onCancel={()=>setEditId(null)} currency={currency} inp={inp}/>
              : <div style={{...pad,paddingTop:"10px",paddingBottom:"10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    {/* Up/down buttons */}
                    <div style={{display:"flex",flexDirection:"column",gap:"3px",flexShrink:0}}>
                      <button onClick={()=>dispatch({type:"MENU_MOVE",id:item.id,dir:-1})}
                        disabled={catIdx===0}
                        style={{width:"24px",height:"24px",borderRadius:"5px",background:catIdx===0?C.faint:C.surf,border:`1px solid ${C.bdr}`,color:catIdx===0?C.bdr:C.muted,fontSize:"12px",cursor:catIdx===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>▲</button>
                      <button onClick={()=>dispatch({type:"MENU_MOVE",id:item.id,dir:1})}
                        disabled={catIdx===catItems.length-1}
                        style={{width:"24px",height:"24px",borderRadius:"5px",background:catIdx===catItems.length-1?C.faint:C.surf,border:`1px solid ${C.bdr}`,color:catIdx===catItems.length-1?C.bdr:C.muted,fontSize:"12px",cursor:catIdx===catItems.length-1?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>▼</button>
                    </div>
                    <span style={{fontSize:"26px",flexShrink:0}}>{item.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"2px"}}>
                        <div style={{fontSize:"13px",fontWeight:700,color:item.soldOut?C.muted:C.txt}}>{item.name}</div>
                        {item.soldOut&&<Badge col="red">売り切れ</Badge>}
                      </div>
                      <div style={{fontSize:"10px",color:C.muted}}>{item.desc}</div>
                      <div style={{fontSize:"13px",fontWeight:700,color:C.amber,marginTop:"3px"}}>{currency.symbol}{item.price.toLocaleString()}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:"5px",flexShrink:0}}>
                      <button onClick={()=>dispatch({type:"MENU_TOGGLE_SOLDOUT",id:item.id})}
                        style={{padding:"5px 8px",borderRadius:"6px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",
                          background:item.soldOut?C.greenD:C.redD,color:item.soldOut?C.green:C.red,
                          border:`1px solid ${item.soldOut?C.green+"44":C.red+"44"}`}}>
                        {item.soldOut?"✅ 再開":"❌ 売切"}
                      </button>
                      <button onClick={()=>setEditId(item.id)}
                        style={{padding:"5px 8px",borderRadius:"6px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",background:C.blueD,color:C.blue,border:`1px solid ${C.blue}44`}}>
                        ✏️ 編集
                      </button>
                      <button onClick={()=>{ if(window.confirm(`「${item.name}」を削除しますか？`)) dispatch({type:"MENU_DELETE_ITEM",id:item.id}); }}
                        style={{padding:"5px 8px",borderRadius:"6px",fontSize:"10px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",background:"transparent",color:C.muted,border:`1px solid ${C.bdr}`}}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
            }
          </div>
        ))}
      </div>;
    })}
  </div>;
}

function EditItemForm({ item, onSave, onCancel, currency, inp }){
  const[d,setD]=useState({name:item.name,price:item.price,cat:item.cat,emoji:item.emoji,desc:item.desc,baseMin:item.baseMin});
  return <div style={pad}>
    <div style={{fontSize:"11px",fontWeight:700,color:C.blue,marginBottom:"10px"}}>✏️ 編集中</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"10px"}}>
      {MENU_EMOJIS.map(e=><button key={e} onClick={()=>setD(x=>({...x,emoji:e}))} style={{width:"30px",height:"30px",borderRadius:"6px",fontSize:"16px",cursor:"pointer",border:`2px solid ${d.emoji===e?C.blue:C.bdr}`,background:d.emoji===e?C.blueD:C.faint,display:"flex",alignItems:"center",justifyContent:"center"}}>{e}</button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginBottom:"7px"}}>
      <div><div style={lbl}>名前</div><input value={d.name} onChange={e=>setD(x=>({...x,name:e.target.value}))} style={inp()}/></div>
      <div><div style={lbl}>価格（{currency.symbol}）</div><input type="number" value={d.price} onChange={e=>setD(x=>({...x,price:Number(e.target.value)}))} style={inp()}/></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginBottom:"7px"}}>
      <div><div style={lbl}>カテゴリー</div><input value={d.cat} onChange={e=>setD(x=>({...x,cat:e.target.value}))} style={inp()}/></div>
      <div><div style={lbl}>調理時間（分）</div><input type="number" value={d.baseMin} onChange={e=>setD(x=>({...x,baseMin:Number(e.target.value)}))} style={inp()}/></div>
    </div>
    <div style={{marginBottom:"10px"}}><div style={lbl}>説明文</div><input value={d.desc} onChange={e=>setD(x=>({...x,desc:e.target.value}))} style={inp()}/></div>
    <div style={{display:"flex",gap:"7px"}}>
      <button onClick={onCancel} style={{flex:1,padding:"9px",borderRadius:"7px",background:"transparent",color:C.muted,border:`1px solid ${C.bdr}`,fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>キャンセル</button>
      <button onClick={()=>onSave(d)} style={{flex:2,padding:"9px",borderRadius:"7px",background:C.blue,color:"#fff",border:"none",fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>保存する</button>
    </div>
  </div>;
}

function StoreQRPanel({ state, store }){
  const[selected, setSelected] = useState(null);

  useEffect(()=>{
    // Load QRCode library dynamically
    if(!window.QRCode){
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      s.onload = ()=>{ if(selected) renderQR(selected); };
      document.head.appendChild(s);
    }
  },[]);

  useEffect(()=>{
    if(selected) renderQR(selected);
  },[selected]);

  function renderQR(tableId){
    const el = document.getElementById(`qr-${tableId}`);
    if(!el||!window.QRCode) return;
    el.innerHTML = "";
    // In production this would be the actual URL e.g. https://app.com/table/7
    const url = `https://menya-miyabi.app/table/${tableId}`;
    new window.QRCode(el, {
      text: url,
      width: 200,
      height: 200,
      colorDark: "#d4962e",
      colorLight: "#0c0b09",
      correctLevel: window.QRCode.CorrectLevel.H,
    });
  }

  function printQR(tableId){
    const t = state.tables.find(x=>x.id===tableId);
    const st = SEAT_TYPES.find(s=>s.id===t?.seatType)||SEAT_TYPES[0];
    const el = document.getElementById(`qr-${tableId}`);
    const canvas = el?.querySelector("canvas");
    const img = canvas?.toDataURL("image/png");
    if(!img) return;
    const w = window.open("","_blank");
    w.document.write(`
      <html><head><title>QR テーブル${tableId}</title>
      <style>
        body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0c0b09;font-family:sans-serif;}
        .card{background:#161510;border:1px solid #252318;border-radius:16px;padding:32px;text-align:center;width:280px;}
        .store{font-size:22px;font-weight:800;color:#ede6d0;margin-bottom:4px;}
        .sub{font-size:11px;color:#6a6050;letter-spacing:0.15em;margin-bottom:20px;}
        img{border-radius:12px;display:block;margin:0 auto 20px;}
        .table{font-size:28px;font-weight:700;color:#d4962e;margin-bottom:4px;}
        .info{font-size:13px;color:#6a6050;}
        .hint{font-size:11px;color:#6a6050;margin-top:16px;line-height:1.6;}
      </style></head>
      <body><div class="card">
        <div class="store">${store?.name||"店舗"}</div>
        <div class="sub">${store?.nameRoman||""}</div>
        <img src="${img}" width="200" height="200"/>
        <div class="table">テーブル ${tableId}</div>
        <div class="info">${st.emoji} ${st.label} · ${t?.seats}席 · ${t?.floor}</div>
        <div class="hint">QRコードをスキャンして<br>注文・ウェイティング登録ができます</div>
      </div></body></html>
    `);
    w.document.close();
    setTimeout(()=>w.print(),500);
  }

  return <div style={{padding:"14px"}}>
    <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"18px",fontWeight:800,marginBottom:"4px"}}>QRコード管理</div>
    <div style={{fontSize:"11px",color:C.muted,marginBottom:"16px"}}>テーブルを選んでQRコードを表示・印刷できます</div>

    {/* Table selector */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"16px"}}>
      {state.tables.map(t=>{
        const st=SEAT_TYPES.find(s=>s.id===t.seatType)||SEAT_TYPES[0];
        const isSel=selected===t.id;
        return(
          <button key={t.id} onClick={()=>setSelected(t.id)}
            style={{padding:"10px 4px",borderRadius:"10px",border:`2px solid ${isSel?C.amber:C.bdr}`,background:isSel?C.amberD:C.surf,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",textAlign:"center",transition:"all 0.15s"}}>
            <div style={{fontSize:"18px",marginBottom:"3px"}}>{st.emoji}</div>
            <div style={{fontSize:"10px",fontWeight:700,color:isSel?C.amber:C.txt}}>{t.id}</div>
            <div style={{fontSize:"9px",color:C.muted}}>{t.seats}席</div>
          </button>
        );
      })}
    </div>

    {/* QR display */}
    {selected ? (()=>{
      const t = state.tables.find(x=>x.id===selected);
      const st = SEAT_TYPES.find(s=>s.id===t?.seatType)||SEAT_TYPES[0];
      return(
        <div style={card({border:`1px solid ${C.amberM}`})}>
          <div style={{...pad,textAlign:"center"}}>
            {/* QR code */}
            <div style={{display:"inline-block",background:C.bg,borderRadius:"16px",padding:"20px",marginBottom:"16px",border:`1px solid ${C.bdr}`}}>
              <div id={`qr-${selected}`} style={{width:"200px",height:"200px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:"11px",color:C.muted}}>読み込み中…</div>
              </div>
            </div>

            {/* Table info */}
            <div style={{marginBottom:"16px"}}>
              <div style={{fontSize:"22px",fontWeight:700,color:C.amber,fontFamily:"'Shippori Mincho',serif",marginBottom:"4px"}}>
                テーブル {selected}
              </div>
              <div style={{fontSize:"12px",color:C.muted}}>
                {st.emoji} {st.label} · {t?.seats}席 · {t?.floor}
              </div>
            </div>

            {/* URL */}
            <div style={{background:C.faint,borderRadius:"8px",padding:"10px 14px",marginBottom:"16px",fontSize:"10px",color:C.muted,wordBreak:"break-all",textAlign:"left"}}>
              <div style={{fontSize:"9px",color:C.muted,marginBottom:"4px",letterSpacing:"0.1em"}}>URL</div>
              <span style={{color:C.amber}}>https://menya-miyabi.app/table/{selected}</span>
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>printQR(selected)}
                style={{flex:1,padding:"12px",borderRadius:"10px",background:C.amber,color:C.bg,border:"none",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
                🖨️ 印刷する
              </button>
              <button onClick={()=>{
                const canvas=document.getElementById(`qr-${selected}`)?.querySelector("canvas");
                if(!canvas)return;
                const a=document.createElement("a");
                a.download=`qr-table-${selected}.png`;
                a.href=canvas.toDataURL("image/png");
                a.click();
              }}
                style={{flex:1,padding:"12px",borderRadius:"10px",background:C.blueD,color:C.blue,border:`1px solid ${C.blue}44`,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
                💾 保存する
              </button>
            </div>
          </div>
        </div>
      );
    })() : (
      <div style={{textAlign:"center",padding:"32px 20px",color:C.muted}}>
        <div style={{fontSize:"48px",marginBottom:"12px"}}>📷</div>
        <div style={{fontSize:"13px"}}>テーブルを選ぶとQRコードが表示されます</div>
      </div>
    )}

    {/* All tables overview */}
    <div style={{marginTop:"16px"}}>
      <div style={{...lbl,marginBottom:"10px"}}>全テーブル一覧</div>
      {state.tables.map(t=>{
        const st=SEAT_TYPES.find(s=>s.id===t.seatType)||SEAT_TYPES[0];
        return(
          <div key={t.id} style={{...card(),marginBottom:"8px",cursor:"pointer"}} onClick={()=>setSelected(t.id)}>
            <div style={{...pad,paddingTop:"11px",paddingBottom:"11px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"36px",height:"36px",borderRadius:"9px",background:C.amberD,border:`1px solid ${C.amberM}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>
                  {st.emoji}
                </div>
                <div>
                  <div style={{fontSize:"12px",fontWeight:700}}>テーブル {t.id}</div>
                  <div style={{fontSize:"10px",color:C.muted}}>{st.label} · {t.seats}席 · {t.floor}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <Badge col={t.occupied?"amber":"green"}>{t.occupied?"着席中":"空席"}</Badge>
                <span style={{fontSize:"12px",color:C.muted}}>→</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════
function StoreSettingsPanel({ store, setStore, cashMode, setCashMode }){
  const[saved,setSaved]=useState(false);
  const[draft,setDraft]=useState(store);

  function save(){
    setStore(draft);
    setSaved(true);
    setTimeout(()=>setSaved(false),3000);
  }

  const inp = (extra={})=>({
    width:"100%", background:C.faint, border:`1px solid ${C.bdr}`,
    borderRadius:"8px", padding:"10px 12px", fontSize:"13px",
    color:C.txt, fontFamily:"'Noto Sans JP',sans-serif",
    boxSizing:"border-box", outline:"none", ...extra
  });

  const EMOJI_OPTS = ["🍜","🍣","🍱","🥩","🍗","🍕","🍔","🍺","☕","🍰","🍛","🥗","🦐","🍤","🥟","🍶"];

  function handleLogoUpload(e){
    const file = e.target.files?.[0];
    if(!file) return;
    if(file.size > 2*1024*1024){ alert("2MB以下の画像を選択してください"); return; }
    const reader = new FileReader();
    reader.onload = ev => setDraft(d=>({...d, logo: ev.target.result, emoji: null}));
    reader.readAsDataURL(file);
  }

  return <div style={{padding:"14px"}}>
    <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeOut{from{opacity:1}to{opacity:0}}`}</style>

    {/* Toast notification */}
    {saved&&(
      <div style={{
        position:"fixed",top:"60px",left:"50%",transform:"translateX(-50%)",
        zIndex:999,
        background:C.green,color:"#fff",
        padding:"12px 24px",borderRadius:"24px",
        fontSize:"13px",fontWeight:700,
        display:"flex",alignItems:"center",gap:"8px",
        boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
        animation:"slideDown 0.25s ease",
        whiteSpace:"nowrap",
        fontFamily:"'Noto Sans JP',sans-serif",
      }}>
        ✅ 設定を保存しました
      </div>
    )}

    <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"18px",fontWeight:800,marginBottom:"4px"}}>店舗設定</div>
    <div style={{fontSize:"11px",color:C.muted,marginBottom:"16px"}}>変更後は「保存する」を押してください</div>

    {/* 基本情報 */}
    <div style={card()}>
      <div style={pad}>
        <div style={{...lbl,color:C.amber,marginBottom:"12px"}}>🏪 基本情報</div>

        {/* Logo / Icon */}
        <div style={{marginBottom:"16px"}}>
          <div style={lbl}>ロゴ・アイコン</div>

          {/* Current logo preview */}
          <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
            <div style={{
              width:"72px",height:"72px",borderRadius:"14px",
              background:C.faint,border:`1px solid ${C.bdr}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              overflow:"hidden",flexShrink:0,
            }}>
              {draft.logo
                ? <img src={draft.logo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontSize:"36px"}}>{draft.emoji||"🍜"}</span>
              }
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:"11px",color:C.muted,marginBottom:"8px"}}>
                {draft.logo ? "画像ロゴを使用中" : "絵文字アイコンを使用中"}
              </div>
              {/* Upload button */}
              <label style={{
                display:"inline-flex",alignItems:"center",gap:"6px",
                padding:"8px 14px",borderRadius:"8px",
                background:C.blueD,color:C.blue,
                border:`1px solid ${C.blue}44`,
                fontSize:"12px",fontWeight:700,cursor:"pointer",
                fontFamily:"'Noto Sans JP',sans-serif",
              }}>
                📁 画像をアップロード
                <input type="file" accept="image/*" onChange={handleLogoUpload}
                  style={{display:"none"}}/>
              </label>
              {draft.logo&&(
                <button onClick={()=>setDraft(d=>({...d,logo:null,emoji:"🍜"}))}
                  style={{marginLeft:"8px",padding:"8px 12px",borderRadius:"8px",background:C.redD,color:C.red,border:`1px solid ${C.red}33`,fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
                  削除
                </button>
              )}
              <div style={{fontSize:"9px",color:C.muted,marginTop:"6px"}}>JPG / PNG · 2MB以下</div>
            </div>
          </div>

          {/* Emoji fallback — shown when no logo */}
          {!draft.logo&&(
            <>
              <div style={{fontSize:"10px",color:C.muted,marginBottom:"8px"}}>または絵文字から選択</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {EMOJI_OPTS.map(e=>(
                  <button key={e} onClick={()=>setDraft(d=>({...d,emoji:e,logo:null}))}
                    style={{width:"38px",height:"38px",borderRadius:"8px",fontSize:"20px",cursor:"pointer",
                      border:`2px solid ${draft.emoji===e?C.amber:C.bdr}`,
                      background:draft.emoji===e?C.amberD:C.faint,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Store name */}
        <div style={{marginBottom:"12px"}}>
          <div style={lbl}>店舗名</div>
          <input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))}
            placeholder="例：麺屋 雅" style={inp()}/>
        </div>

        {/* Roman name */}
        <div style={{marginBottom:"0"}}>
          <div style={lbl}>店舗名（ローマ字）</div>
          <input value={draft.nameRoman} onChange={e=>setDraft(d=>({...d,nameRoman:e.target.value.toUpperCase()}))}
            placeholder="例：MENYA MIYABI" style={inp()}/>
        </div>
      </div>
    </div>

    {/* 営業時間 */}
    <div style={card()}>
      <div style={pad}>
        <div style={{...lbl,color:C.amber,marginBottom:"12px"}}>🕐 営業時間</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
          {[
            {key:"open",      label:"開店"},
            {key:"close",     label:"閉店"},
            {key:"lastOrder", label:"ラストオーダー"},
          ].map(f=>(
            <div key={f.key}>
              <div style={lbl}>{f.label}</div>
              <input type="time" value={draft.hours[f.key]}
                onChange={e=>setDraft(d=>({...d,hours:{...d.hours,[f.key]:e.target.value}}))}
                style={{...inp(),padding:"8px",fontSize:"12px",colorScheme:"dark"}}/>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* フロア */}
    <div style={card()}>
      <div style={pad}>
        <div style={{...lbl,color:C.amber,marginBottom:"10px"}}>🗺️ フロア構成</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"10px"}}>
          {draft.floor.map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"4px",background:C.amberD,border:`1px solid ${C.amberM}`,borderRadius:"20px",padding:"4px 10px"}}>
              <span style={{fontSize:"12px",fontWeight:700,color:C.amber}}>{f}</span>
              <button onClick={()=>setDraft(d=>({...d,floor:d.floor.filter((_,j)=>j!==i)}))}
                style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"12px",padding:"0",lineHeight:1}}>✕</button>
            </div>
          ))}
          <button onClick={()=>{
            const name=prompt("フロア名を入力（例：3F、テラス）");
            if(name?.trim()) setDraft(d=>({...d,floor:[...d.floor,name.trim()]}));
          }}
            style={{padding:"4px 12px",borderRadius:"20px",background:C.faint,border:`1px solid ${C.bdr}`,color:C.muted,fontSize:"12px",cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
            ＋ 追加
          </button>
        </div>
      </div>
    </div>

    {/* 通貨・税率 */}
    <div style={card()}>
      <div style={pad}>
        <div style={{...lbl,color:C.amber,marginBottom:"12px"}}>💱 通貨・税率</div>

        {/* Currency */}
        <div style={{marginBottom:"12px"}}>
          <div style={lbl}>通貨</div>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {CURRENCIES.map(c=>(
              <button key={c.id} onClick={()=>setDraft(d=>({...d,currency:c.id}))}
                style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"9px",cursor:"pointer",
                  border:`1px solid ${draft.currency===c.id?C.blue:C.bdr}`,
                  background:draft.currency===c.id?C.blueD:C.faint,
                  fontFamily:"'Noto Sans JP',sans-serif",textAlign:"left"}}>
                <span style={{fontSize:"18px",minWidth:"28px"}}>{c.symbol}</span>
                <span style={{fontSize:"12px",fontWeight:draft.currency===c.id?700:400,color:draft.currency===c.id?C.blue:C.txt}}>{c.label}</span>
                {draft.currency===c.id&&<span style={{marginLeft:"auto",color:C.blue,fontSize:"11px"}}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tax rate */}
        <div style={{marginBottom:"12px"}}>
          <div style={lbl}>税率（%）</div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {[0,5,8,10,15,20].map(r=>(
              <button key={r} onClick={()=>setDraft(d=>({...d,taxRate:r}))}
                style={{padding:"7px 14px",borderRadius:"20px",fontSize:"12px",fontWeight:700,cursor:"pointer",
                  border:`1px solid ${draft.taxRate===r?C.blue:C.bdr}`,
                  background:draft.taxRate===r?C.blueD:C.faint,
                  color:draft.taxRate===r?C.blue:C.muted,
                  fontFamily:"'Noto Sans JP',sans-serif"}}>
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* Tax included/excluded */}
        <div>
          <div style={lbl}>税の表示方法</div>
          <div style={{display:"flex",gap:"8px"}}>
            {[{v:false,l:"外税（税抜き表示）"},{v:true,l:"内税（税込み表示）"}].map(o=>(
              <button key={String(o.v)} onClick={()=>setDraft(d=>({...d,taxIncluded:o.v}))}
                style={{flex:1,padding:"10px",borderRadius:"9px",fontSize:"11px",fontWeight:700,cursor:"pointer",
                  border:`1px solid ${draft.taxIncluded===o.v?C.blue:C.bdr}`,
                  background:draft.taxIncluded===o.v?C.blueD:C.faint,
                  color:draft.taxIncluded===o.v?C.blue:C.muted,
                  fontFamily:"'Noto Sans JP',sans-serif"}}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Preview */}
    <div style={card({border:`1px solid ${C.amber}33`,background:C.amberD})}>
      <div style={pad}>
        <div style={{...lbl,marginBottom:"10px"}}>👀 プレビュー</div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"52px",height:"52px",borderRadius:"12px",background:C.faint,border:`1px solid ${C.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
            {draft.logo
              ? <img src={draft.logo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <span style={{fontSize:"28px"}}>{draft.emoji||"🍜"}</span>
            }
          </div>
          <div>
            <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"18px",fontWeight:800}}>{draft.name||"店舗名"}</div>
            <div style={{fontSize:"10px",color:C.muted,letterSpacing:"0.15em"}}>{draft.nameRoman||"STORE NAME"}</div>
            <div style={{fontSize:"10px",color:C.muted,marginTop:"3px"}}>
              {draft.hours.open} – {draft.hours.close} · LO {draft.hours.lastOrder}
            </div>
          </div>
        </div>
        <div style={{marginTop:"10px",fontSize:"11px",color:C.muted}}>
          {CURRENCIES.find(c=>c.id===draft.currency)?.symbol}1,000 {draft.taxRate>0?`（税${draft.taxIncluded?"込":"別"} ${draft.taxRate}%）`:""} · {draft.floor.join(" / ")}
        </div>
      </div>
    </div>

    {/* 通知設定 */}
    <div style={card()}>
      <div style={pad}>
        <div style={{...lbl,color:C.amber,marginBottom:"12px"}}>🔔 プッシュ通知</div>
        <div style={{fontSize:"12px",color:C.muted,marginBottom:"12px",lineHeight:1.7}}>
          店舗管理画面を開いているデバイスに通知が届きます。管理画面ヘッダーの🔔ボタンからON/OFFできます。
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {[
            {icon:"🔔",label:"お客様の呼び出し",desc:"スタッフ呼び出しボタンを押したとき"},
            {icon:"⏰",label:"時間制限リマインド",desc:"残り15分を切ったとき"},
            {icon:"💴",label:"現金払いの通知",desc:"お客様が現金払いを選択したとき"},
          ].map(n=>(
            <div key={n.label} style={{...row,padding:"8px 10px",background:C.faint,borderRadius:"8px"}}>
              <span style={{fontSize:"18px",flexShrink:0}}>{n.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:"12px",fontWeight:700}}>{n.label}</div>
                <div style={{fontSize:"10px",color:C.muted}}>{n.desc}</div>
              </div>
              <Badge col="green">通知あり</Badge>
            </div>
          ))}
        </div>
        <button onClick={()=>{
          if(!("Notification" in window)){ alert("このブラウザは通知に対応していません"); return; }
          Notification.requestPermission().then(p=>{
            if(p==="granted") alert("✅ 通知が有効になりました！管理画面ヘッダーの🔔でいつでもON/OFFできます。");
            else alert("通知が許可されませんでした。ブラウザの設定から許可してください。");
          });
        }}
          style={{display:"block",width:"100%",padding:"11px",borderRadius:"9px",background:C.greenD,color:C.green,border:`1px solid ${C.green}44`,fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",marginTop:"12px"}}>
          🔔 通知を許可する
        </button>
      </div>
    </div>

    <button onClick={save}
      style={{display:"block",width:"100%",padding:"14px",borderRadius:"10px",background:C.amber,color:C.bg,border:"none",fontSize:"14px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",marginBottom:"20px"}}>
      ✅ 保存する
    </button>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// RESERVATION PANEL
// ═══════════════════════════════════════════════════════════════
function StoreReservationPanel({ state, dispatch, store }){
  const[showAdd,setShowAdd]=useState(false);
  const[dateFilter,setDateFilter]=useState(new Date().toISOString().slice(0,10));
  const[draft,setDraft]=useState({name:"",phone:"",seats:2,date:new Date().toISOString().slice(0,10),time:"18:00",scene:"friends",requests:[],allergies:[],note:""});

  const reservations = state.reservations||[];
  const today = new Date().toISOString().slice(0,10);
  const filtered = reservations.filter(r=>r.date===dateFilter).sort((a,b)=>a.time.localeCompare(b.time));
  const confirmed = filtered.filter(r=>r.status==="confirmed");
  const seated    = filtered.filter(r=>r.status==="seated");

  const inp=(extra={})=>({width:"100%",background:C.faint,border:`1px solid ${C.bdr}`,borderRadius:"7px",padding:"8px 10px",fontSize:"12px",color:C.txt,fontFamily:"'Noto Sans JP',sans-serif",boxSizing:"border-box",outline:"none",...extra});

  function saveNew(){
    if(!draft.name||!draft.time) return;
    dispatch({type:"RESERVATION_ADD",data:draft});
    setDraft({name:"",phone:"",seats:2,date:dateFilter,time:"18:00",scene:"friends",requests:[],allergies:[],note:""});
    setShowAdd(false);
  }

  const statusBadge = s => s==="confirmed"?<Badge col="blue">✅ 確定</Badge>:s==="seated"?<Badge col="green">🪑 着席中</Badge>:<Badge col="red">❌ キャンセル</Badge>;
  const freeTablesBySeats = seats => state.tables.filter(t=>!t.occupied&&t.seats>=seats);

  return <div style={{padding:"12px"}}>
    {/* Date navigation */}
    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
      <button onClick={()=>{const d=new Date(dateFilter);d.setDate(d.getDate()-1);setDateFilter(d.toISOString().slice(0,10));}}
        style={{width:"32px",height:"32px",borderRadius:"8px",background:C.faint,border:`1px solid ${C.bdr}`,color:C.txt,fontSize:"16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
      <input type="date" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
        style={{flex:1,...inp({padding:"7px 10px",colorScheme:"dark"})}}/>
      <button onClick={()=>{const d=new Date(dateFilter);d.setDate(d.getDate()+1);setDateFilter(d.toISOString().slice(0,10));}}
        style={{width:"32px",height:"32px",borderRadius:"8px",background:C.faint,border:`1px solid ${C.bdr}`,color:C.txt,fontSize:"16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
      {dateFilter===today&&<Badge col="amber">今日</Badge>}
    </div>

    {/* Summary */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"7px",marginBottom:"12px"}}>
      {[
        {l:"確定",v:confirmed.length,c:C.blue},
        {l:"着席済",v:seated.length,c:C.green},
        {l:"合計人数",v:filtered.filter(r=>r.status!=="cancelled").reduce((s,r)=>s+r.seats,0),c:C.amber},
      ].map(s=>(
        <div key={s.l} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:"10px",padding:"10px",textAlign:"center"}}>
          <div style={{fontSize:"9px",color:C.muted,marginBottom:"3px"}}>{s.l}</div>
          <div style={{fontSize:"20px",fontWeight:700,color:s.c,fontFamily:"'Shippori Mincho',serif"}}>{s.v}</div>
        </div>
      ))}
    </div>

    {/* Add button */}
    <button onClick={()=>setShowAdd(!showAdd)}
      style={{display:"block",width:"100%",padding:"11px",borderRadius:"9px",background:C.amberD,color:C.amber,border:`1px solid ${C.amberM}`,fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",marginBottom:"12px"}}>
      ＋ 予約を追加
    </button>

    {/* Add form */}
    {showAdd&&<div style={card({border:`1px solid ${C.amber}44`,background:C.amberD,marginBottom:"12px"})}>
      <div style={pad}>
        <div style={{fontSize:"12px",fontWeight:700,color:C.amber,marginBottom:"12px"}}>＋ 新規予約</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"8px"}}>
          <div><div style={lbl}>お名前</div><input value={draft.name} onChange={e=>setDraft(d=>({...d,name:e.target.value}))} placeholder="例：山田" style={inp()}/></div>
          <div><div style={lbl}>電話番号</div><input value={draft.phone} onChange={e=>setDraft(d=>({...d,phone:e.target.value}))} placeholder="090-0000-0000" style={inp()}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"8px"}}>
          <div><div style={lbl}>日付</div><input type="date" value={draft.date} onChange={e=>setDraft(d=>({...d,date:e.target.value}))} style={{...inp(),colorScheme:"dark"}}/></div>
          <div><div style={lbl}>時間</div><input type="time" value={draft.time} onChange={e=>setDraft(d=>({...d,time:e.target.value}))} style={{...inp(),colorScheme:"dark"}}/></div>
          <div><div style={lbl}>人数</div>
            <select value={draft.seats} onChange={e=>setDraft(d=>({...d,seats:Number(e.target.value)}))} style={inp()}>
              {[1,2,3,4,5,6,7,8,10,12].map(n=><option key={n} value={n}>{n}名</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:"8px"}}>
          <div style={lbl}>シーン</div>
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
            {SCENES.map(s=><button key={s.id} onClick={()=>setDraft(d=>({...d,scene:s.id}))}
              style={{padding:"5px 10px",borderRadius:"16px",fontSize:"10px",fontWeight:700,cursor:"pointer",border:`1px solid ${draft.scene===s.id?C.amber:C.bdr}`,background:draft.scene===s.id?C.amberD:C.faint,color:draft.scene===s.id?C.amber:C.muted,fontFamily:"'Noto Sans JP',sans-serif"}}>
              {s.emoji} {s.label}
            </button>)}
          </div>
        </div>
        <div style={{marginBottom:"8px"}}>
          <div style={lbl}>アレルギー</div>
          <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
            {ALLERGY_PRESETS.map(a=>{const on=draft.allergies.includes(a.id);return<button key={a.id} onClick={()=>setDraft(d=>({...d,allergies:on?d.allergies.filter(x=>x!==a.id):[...d.allergies,a.id]}))}
              style={{padding:"4px 9px",borderRadius:"14px",fontSize:"10px",fontWeight:on?700:400,cursor:"pointer",border:`1px solid ${on?C.red:C.bdr}`,background:on?C.redD:C.faint,color:on?C.red:C.muted,fontFamily:"'Noto Sans JP',sans-serif"}}>
              {a.emoji} {a.label}
            </button>;})}
          </div>
        </div>
        <div style={{marginBottom:"12px"}}>
          <div style={lbl}>メモ・リクエスト</div>
          <input value={draft.note} onChange={e=>setDraft(d=>({...d,note:e.target.value}))} placeholder="窓側希望、誕生日など…" style={inp()}/>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"10px",borderRadius:"8px",background:"transparent",color:C.muted,border:`1px solid ${C.bdr}`,fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>キャンセル</button>
          <button onClick={saveNew} disabled={!draft.name} style={{flex:2,padding:"10px",borderRadius:"8px",background:C.amber,color:C.bg,border:"none",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",opacity:!draft.name?0.4:1}}>予約を確定する</button>
        </div>
      </div>
    </div>}

    {/* Empty state */}
    {filtered.length===0&&<div style={{textAlign:"center",padding:"32px 20px"}}>
      <div style={{fontSize:"40px",marginBottom:"10px"}}>📅</div>
      <div style={{fontSize:"13px",color:C.muted}}>この日の予約はありません</div>
    </div>}

    {/* Reservation list */}
    {filtered.map(r=>{
      const sc=SCENES.find(s=>s.id===r.scene);
      const freeTables=freeTablesBySeats(r.seats);
      return <div key={r.id} style={card({
        border:r.status==="confirmed"?`1px solid ${C.blue}44`:r.status==="seated"?`1px solid ${C.green}44`:`1px solid ${C.bdr}`,
        opacity:r.status==="cancelled"?0.5:1,
        marginBottom:"9px",
      })}>
        <div style={pad}>
          <div style={{...row,justifyContent:"space-between",marginBottom:"8px"}}>
            <div style={row}>
              <div style={{background:C.amberD,border:`1px solid ${C.amberM}`,borderRadius:"8px",padding:"6px 10px",fontFamily:"'Shippori Mincho',serif",fontSize:"15px",fontWeight:700,color:C.amber,flexShrink:0}}>
                {r.time}
              </div>
              <div>
                <div style={{fontSize:"13px",fontWeight:700}}>{r.name} <span style={{color:C.muted,fontWeight:400,fontSize:"11px"}}>{r.seats}名</span></div>
                <div style={{fontSize:"10px",color:C.muted}}>{sc?.emoji} {sc?.label}{r.phone?` · ${r.phone}`:""}</div>
              </div>
            </div>
            {statusBadge(r.status)}
          </div>

          {r.note&&<div style={{fontSize:"11px",color:C.muted,marginBottom:"6px",padding:"6px 8px",background:C.faint,borderRadius:"6px"}}>📝 {r.note}</div>}
          {r.allergies?.length>0&&<div style={{display:"flex",gap:"4px",flexWrap:"wrap",marginBottom:"6px"}}>
            {r.allergies.map(id=>{const a=ALLERGY_PRESETS.find(x=>x.id===id);return a?<Badge key={id} col="red">{a.emoji} {a.label}アレルギー</Badge>:null;})}
          </div>}
          {r.requests?.length>0&&<div style={{display:"flex",gap:"4px",flexWrap:"wrap",marginBottom:"6px"}}>
            {r.requests.map(req=><Badge key={req.id} col="purple">{req.emoji} {req.label}</Badge>)}
          </div>}

          {/* Actions */}
          {r.status==="confirmed"&&<div style={{display:"flex",gap:"6px",marginTop:"8px"}}>
            {freeTables.length>0?(
              <select onChange={e=>{ if(e.target.value) dispatch({type:"RESERVATION_SEAT",id:r.id,tableId:Number(e.target.value)}); }}
                defaultValue=""
                style={{flex:2,width:"100%",background:C.greenD,color:C.green,border:`1px solid ${C.green}44`,cursor:"pointer",borderRadius:"7px",padding:"8px 10px",fontSize:"11px",fontFamily:"'Noto Sans JP',sans-serif",outline:"none",boxSizing:"border-box"}}>
                <option value="">🪑 テーブルに案内する…</option>
                {freeTables.map(t=>{const st=SEAT_TYPES.find(s=>s.id===t.seatType)||SEAT_TYPES[0];return<option key={t.id} value={t.id}>{st.emoji} テーブル{t.id}（{t.seats}席）</option>;})}
              </select>
            ):(
              <div style={{flex:2,padding:"8px",background:C.redD,border:`1px solid ${C.red}33`,borderRadius:"7px",fontSize:"10px",color:C.red,fontWeight:700,textAlign:"center"}}>
                空きテーブルなし（{r.seats}名以上）
              </div>
            )}
            <button onClick={()=>dispatch({type:"RESERVATION_UPDATE",id:r.id,data:{status:"cancelled"}})}
              style={{flex:1,padding:"8px",borderRadius:"7px",background:"transparent",color:C.muted,border:`1px solid ${C.bdr}`,fontSize:"11px",fontWeight:700,cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif"}}>
              ✕ キャンセル
            </button>
          </div>}

          {r.status==="seated"&&<div style={{padding:"7px 10px",background:C.greenD,border:`1px solid ${C.green}33`,borderRadius:"7px",fontSize:"11px",color:C.green,fontWeight:700,marginTop:"6px"}}>
            🪑 案内済み — テーブルに着席しました
          </div>}
        </div>
      </div>;
    })}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// INTRO SCREEN
// ═══════════════════════════════════════════════════════════════
const FEATURES = [
  { emoji:"📱", title:"QRで即座に注文", desc:"テーブルのQRを読むだけ。アプリ不要、ダウンロード不要。多言語対応で外国人客にもそのまま使える。" },
  { emoji:"🤖", title:"AI退席時間予測", desc:"シーン・注文内容・着席時間からAIがリアルタイムに退席を予測。外で待つお客様に「あと○分」が見える。" },
  { emoji:"⏳", title:"ウェイティング管理", desc:"順番待ちをデジタル化。席が空いたら通知。お客様は外で自由に待てる。待ち時間のストレスをゼロに。" },
  { emoji:"🧾", title:"会計もスマホで完結", desc:"カード・PayPay・Apple Payに対応。現金払いも専用フローで食い逃げを防止。売上は自動集計。" },
  { emoji:"👨‍🍳", title:"キッチン連携（KDS）", desc:"注文が入ったらキッチン画面に即反映。提供済みをワンタップで管理。料理の提供ミスをなくす。" },
  { emoji:"📊", title:"売上・予約を一元管理", desc:"売上・回転率・客単価をリアルタイムで確認。予約管理・スタッフ通知・メニュー編集も全部ここで。" },
];

function IntroScreen({ onStart }){
  const[step,setStep]=useState(0); // 0=hero, 1=features, 2=cta
  const[featureIdx,setFeatureIdx]=useState(0);
  const[animating,setAnimating]=useState(false);

  useEffect(()=>{
    if(step===1){
      const t=setInterval(()=>{
        setAnimating(true);
        setTimeout(()=>{
          setFeatureIdx(i=>(i+1)%FEATURES.length);
          setAnimating(false);
        },300);
      },2800);
      return()=>clearInterval(t);
    }
  },[step]);

  const f = FEATURES[featureIdx];

  return <div style={{
    minHeight:"100vh",background:"#050504",color:"#ede6d0",
    fontFamily:"'Noto Sans JP',sans-serif",
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    padding:"0 24px",maxWidth:"480px",margin:"0 auto",
    position:"relative",overflow:"hidden",
  }}>
    <style>{`
      @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeOut2{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-8px)}}
      @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    `}</style>

    {/* Background glow */}
    <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle, #d4962e18 0%, transparent 70%)",pointerEvents:"none"}}/>

    {/* ── HERO ── */}
    {step===0&&(
      <div style={{textAlign:"center",animation:"fadeUp 0.6s ease"}}>
        <div style={{fontSize:"72px",marginBottom:"16px",animation:"floatUp 3s ease-in-out infinite"}}>🍜</div>
        <div style={{
          fontSize:"13px",letterSpacing:"0.3em",color:"#d4962e",
          fontWeight:700,marginBottom:"12px",
        }}>INTRODUCING</div>
        <div style={{
          fontFamily:"'Shippori Mincho',serif",
          fontSize:"52px",fontWeight:800,
          background:"linear-gradient(135deg, #d4962e, #f5c842, #d4962e)",
          backgroundSize:"200% auto",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          animation:"shimmer 3s linear infinite",
          marginBottom:"8px",lineHeight:1,
        }}>Irasse</div>
        <div style={{fontSize:"13px",color:"#6a6050",letterSpacing:"0.2em",marginBottom:"32px"}}>いらっしゃいませ、を世界へ。</div>
        <div style={{fontSize:"14px",color:"#9a8a7a",lineHeight:1.8,marginBottom:"40px",maxWidth:"320px",margin:"0 auto 40px"}}>
          QRコードひとつで、<br/>
          待ち・注文・会計・キッチンを<br/>
          すべてつなぐ飲食店向けSaaS
        </div>
        <button onClick={()=>setStep(1)} style={{
          background:"linear-gradient(135deg,#d4962e,#f5c842)",
          color:"#0c0b09",border:"none",borderRadius:"14px",
          padding:"16px 40px",fontSize:"15px",fontWeight:700,
          cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",
          boxShadow:"0 4px 24px #d4962e44",
          letterSpacing:"0.05em",
        }}>
          デモを見る →
        </button>
      </div>
    )}

    {/* ── FEATURES ── */}
    {step===1&&(
      <div style={{width:"100%",animation:"fadeUp 0.5s ease"}}>
        {/* Progress dots */}
        <div style={{display:"flex",justifyContent:"center",gap:"6px",marginBottom:"32px"}}>
          {FEATURES.map((_,i)=>(
            <div key={i} onClick={()=>setFeatureIdx(i)} style={{
              width:i===featureIdx?"24px":"6px",height:"6px",
              borderRadius:"3px",cursor:"pointer",
              background:i===featureIdx?"#d4962e":"#2a2218",
              transition:"all 0.3s ease",
            }}/>
          ))}
        </div>

        {/* Feature card */}
        <div style={{
          background:"#161510",border:"1px solid #252318",
          borderRadius:"20px",padding:"32px 28px",
          textAlign:"center",marginBottom:"24px",
          minHeight:"220px",display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          opacity:animating?0:1,
          transform:animating?"translateY(-8px)":"translateY(0)",
          transition:"opacity 0.3s, transform 0.3s",
        }}>
          <div style={{fontSize:"52px",marginBottom:"16px"}}>{f.emoji}</div>
          <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"20px",fontWeight:800,marginBottom:"12px",color:"#ede6d0"}}>
            {f.title}
          </div>
          <div style={{fontSize:"13px",color:"#9a8a7a",lineHeight:1.8,maxWidth:"300px"}}>
            {f.desc}
          </div>
        </div>

        {/* Manual nav */}
        <div style={{display:"flex",gap:"10px",marginBottom:"24px"}}>
          <button onClick={()=>setFeatureIdx(i=>(i-1+FEATURES.length)%FEATURES.length)}
            style={{flex:1,padding:"12px",borderRadius:"10px",background:"#161510",border:"1px solid #252318",color:"#6a6050",fontSize:"16px",cursor:"pointer"}}>‹</button>
          <button onClick={()=>setFeatureIdx(i=>(i+1)%FEATURES.length)}
            style={{flex:1,padding:"12px",borderRadius:"10px",background:"#161510",border:"1px solid #252318",color:"#6a6050",fontSize:"16px",cursor:"pointer"}}>›</button>
        </div>

        <button onClick={()=>setStep(2)} style={{
          display:"block",width:"100%",padding:"15px",
          borderRadius:"12px",
          background:"linear-gradient(135deg,#d4962e,#f5c842)",
          color:"#0c0b09",border:"none",fontSize:"14px",fontWeight:700,
          cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",
          letterSpacing:"0.05em",
        }}>
          次へ →
        </button>
      </div>
    )}

    {/* ── CTA ── */}
    {step===2&&(
      <div style={{textAlign:"center",animation:"fadeUp 0.5s ease",width:"100%"}}>
        <div style={{fontSize:"40px",marginBottom:"20px"}}>🚀</div>
        <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"24px",fontWeight:800,marginBottom:"12px"}}>
          さあ、はじめましょう
        </div>
        <div style={{fontSize:"13px",color:"#9a8a7a",lineHeight:1.8,marginBottom:"32px"}}>
          初期費用ゼロ。月額5,000円〜。<br/>
          導入はQRを印刷して置くだけ。
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"10px",marginBottom:"32px"}}>
          {[
            {v:"30秒",l:"導入時間"},
            {v:"0円",l:"初期費用"},
            {v:"5言語",l:"多言語対応"},
          ].map(s=>(
            <div key={s.l} style={{background:"#161510",border:"1px solid #252318",borderRadius:"12px",padding:"14px 8px",textAlign:"center"}}>
              <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:"20px",fontWeight:700,color:"#d4962e",marginBottom:"4px"}}>{s.v}</div>
              <div style={{fontSize:"10px",color:"#6a6050"}}>{s.l}</div>
            </div>
          ))}
        </div>

        <button onClick={onStart} style={{
          display:"block",width:"100%",padding:"18px",
          borderRadius:"14px",
          background:"linear-gradient(135deg,#d4962e,#f5c842)",
          color:"#0c0b09",border:"none",fontSize:"16px",fontWeight:700,
          cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",
          boxShadow:"0 4px 24px #d4962e44",
          letterSpacing:"0.05em",marginBottom:"14px",
        }}>
          デモを体験する →
        </button>
        <button onClick={()=>setStep(0)} style={{
          background:"transparent",border:"none",color:"#6a6050",
          fontSize:"12px",cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",
        }}>
          ← 最初に戻る
        </button>
      </div>
    )}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// ROOT — Demo Switcher
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const[state,dispatch]=useReducer(reducer,{
    tables:INIT_TABLES,
    waitQueue:INIT_QUEUE,
    salesHistory:SALES_HISTORY,
    menuItems:MENU.map(m=>({...m,soldOut:false})),
    reservations:INIT_RESERVATIONS,
  });
  const[view,setView]=useState("customer");
  const[myQueueId,setMyQueueId]=useState(null);
  const[cashMode,setCashMode]=useState("staff");
  const[store,setStore]=useState(INIT_STORE);
  const[showIntro,setShowIntro]=useState(true);

  if(showIntro) return <IntroScreen onStart={()=>setShowIntro(false)}/>;

  return <div style={{fontFamily:"'Noto Sans JP',sans-serif",background:"#050504",minHeight:"100vh",color:C.txt}}>
    {/* Demo switcher */}
    <div style={{background:"#050504",borderBottom:`1px solid #1a1815`,padding:"8px 16px",position:"sticky",top:0,zIndex:200}}>
      <div style={{maxWidth:"480px",margin:"0 auto",display:"flex",alignItems:"center",gap:"10px"}}>
        <div style={{fontSize:"10px",color:"#444",flexShrink:0,letterSpacing:"0.1em"}}>DEMO</div>
        <div style={{flex:1,display:"flex",background:"#111",borderRadius:"8px",padding:"3px",gap:"3px"}}>
          {[{id:"customer",icon:"📱",label:"客用画面 / Customer"},{id:"store",icon:"🏪",label:"店舗管理"}].map(v=>(
            <button key={v.id} onClick={()=>setView(v.id)}
              style={{flex:1,padding:"7px",fontSize:"11px",fontWeight:view===v.id?700:400,background:view===v.id?C.surf:"transparent",color:view===v.id?C.txt:"#444",border:`1px solid ${view===v.id?C.bdr:"transparent"}`,borderRadius:"6px",cursor:"pointer",fontFamily:"'Noto Sans JP',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:"5px"}}>
              <span>{v.icon}</span><span>{v.label}</span>
            </button>
          ))}
        </div>
        <div style={{fontSize:"9px",color:"#333",flexShrink:0,textAlign:"right",lineHeight:1.4}}>
          {view==="customer"?"客のアクションが":"店側の操作が"}<br/>
          <span style={{color:"#d4962e"}}>即座に反映↔</span>
        </div>
      </div>
    </div>

    {/* View */}
    <div style={{maxWidth:"480px",margin:"0 auto",background:C.bg,minHeight:"calc(100vh - 50px)",position:"relative",overflow:"hidden"}}>
      {view==="customer" && <CustomerView state={state} dispatch={dispatch} myQueueId={myQueueId} setMyQueueId={setMyQueueId} cashMode={cashMode} store={store} menuItems={state.menuItems}/>}
      {view==="store"    && <StoreView    state={state} dispatch={dispatch} cashMode={cashMode} setCashMode={setCashMode} store={store} setStore={setStore}/>}
    </div>
  </div>;
}
