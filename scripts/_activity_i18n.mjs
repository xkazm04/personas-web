import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "i18n");

const T = {
  de: { tabActivity: "Aktivität", block: { athenaUsage: "Athena-Nutzung", athenaSubtitle: "Companion-Kosten nach Aktion", athenaActions: { invoke: "Aufruf", recall: "Abruf", fallback: "Fallback" }, valueRollup: "Wertübersicht", valueDelivered: "Wert geliefert", costPerValue: "Kosten pro Wert", outcomes: { delivered: "Geliefert", partial: "Teilweise", blocked: "Blockiert" } } },
  es: { tabActivity: "Actividad", block: { athenaUsage: "Uso de Athena", athenaSubtitle: "Costo del Companion por acción", athenaActions: { invoke: "Invocar", recall: "Recuperar", fallback: "Reserva" }, valueRollup: "Resumen de valor", valueDelivered: "Valor entregado", costPerValue: "Costo por valor", outcomes: { delivered: "Entregado", partial: "Parcial", blocked: "Bloqueado" } } },
  fr: { tabActivity: "Activité", block: { athenaUsage: "Utilisation d'Athena", athenaSubtitle: "Coût du Companion par action", athenaActions: { invoke: "Invocation", recall: "Rappel", fallback: "Repli" }, valueRollup: "Bilan de valeur", valueDelivered: "Valeur livrée", costPerValue: "Coût par valeur", outcomes: { delivered: "Livré", partial: "Partiel", blocked: "Bloqué" } } },
  cs: { tabActivity: "Aktivita", block: { athenaUsage: "Využití Atheny", athenaSubtitle: "Náklady Companionu podle akce", athenaActions: { invoke: "Vyvolání", recall: "Načtení", fallback: "Záloha" }, valueRollup: "Přehled hodnoty", valueDelivered: "Dodaná hodnota", costPerValue: "Náklady na hodnotu", outcomes: { delivered: "Dodáno", partial: "Částečně", blocked: "Blokováno" } } },
  ru: { tabActivity: "Активность", block: { athenaUsage: "Использование Athena", athenaSubtitle: "Стоимость Companion по действиям", athenaActions: { invoke: "Вызов", recall: "Извлечение", fallback: "Резерв" }, valueRollup: "Сводка ценности", valueDelivered: "Ценность доставлена", costPerValue: "Стоимость единицы ценности", outcomes: { delivered: "Доставлено", partial: "Частично", blocked: "Заблокировано" } } },
  ja: { tabActivity: "アクティビティ", block: { athenaUsage: "Athena の使用状況", athenaSubtitle: "アクション別のコンパニオンコスト", athenaActions: { invoke: "呼び出し", recall: "リコール", fallback: "フォールバック" }, valueRollup: "価値サマリー", valueDelivered: "提供された価値", costPerValue: "価値あたりのコスト", outcomes: { delivered: "完了", partial: "部分的", blocked: "ブロック" } } },
  ko: { tabActivity: "활동", block: { athenaUsage: "Athena 사용량", athenaSubtitle: "작업별 컴패니언 비용", athenaActions: { invoke: "호출", recall: "회수", fallback: "폴백" }, valueRollup: "가치 요약", valueDelivered: "제공된 가치", costPerValue: "가치당 비용", outcomes: { delivered: "완료", partial: "부분", blocked: "차단됨" } } },
  zh: { tabActivity: "活动", block: { athenaUsage: "Athena 使用情况", athenaSubtitle: "按操作划分的助手成本", athenaActions: { invoke: "调用", recall: "召回", fallback: "回退" }, valueRollup: "价值汇总", valueDelivered: "已交付价值", costPerValue: "单位价值成本", outcomes: { delivered: "已交付", partial: "部分", blocked: "已阻止" } } },
  ar: { tabActivity: "النشاط", block: { athenaUsage: "استخدام Athena", athenaSubtitle: "تكلفة المساعد حسب الإجراء", athenaActions: { invoke: "استدعاء", recall: "استرجاع", fallback: "احتياطي" }, valueRollup: "ملخص القيمة", valueDelivered: "القيمة المقدَّمة", costPerValue: "التكلفة لكل قيمة", outcomes: { delivered: "مُقدَّم", partial: "جزئي", blocked: "محظور" } } },
  hi: { tabActivity: "गतिविधि", block: { athenaUsage: "Athena उपयोग", athenaSubtitle: "क्रिया अनुसार कंपेनियन लागत", athenaActions: { invoke: "आह्वान", recall: "रिकॉल", fallback: "फ़ॉलबैक" }, valueRollup: "मूल्य सारांश", valueDelivered: "वितरित मूल्य", costPerValue: "प्रति मूल्य लागत", outcomes: { delivered: "वितरित", partial: "आंशिक", blocked: "अवरुद्ध" } } },
  id: { tabActivity: "Aktivitas", block: { athenaUsage: "Penggunaan Athena", athenaSubtitle: "Biaya Companion per tindakan", athenaActions: { invoke: "Panggil", recall: "Ambil", fallback: "Cadangan" }, valueRollup: "Ringkasan nilai", valueDelivered: "Nilai terkirim", costPerValue: "Biaya per nilai", outcomes: { delivered: "Terkirim", partial: "Sebagian", blocked: "Terblokir" } } },
  vi: { tabActivity: "Hoạt động", block: { athenaUsage: "Mức dùng Athena", athenaSubtitle: "Chi phí Companion theo hành động", athenaActions: { invoke: "Gọi", recall: "Truy hồi", fallback: "Dự phòng" }, valueRollup: "Tổng hợp giá trị", valueDelivered: "Giá trị đã giao", costPerValue: "Chi phí mỗi giá trị", outcomes: { delivered: "Đã giao", partial: "Một phần", blocked: "Bị chặn" } } },
  bn: { tabActivity: "কার্যকলাপ", block: { athenaUsage: "Athena ব্যবহার", athenaSubtitle: "ক্রিয়া অনুসারে কম্প্যানিয়ন খরচ", athenaActions: { invoke: "আহ্বান", recall: "পুনরুদ্ধার", fallback: "ফলব্যাক" }, valueRollup: "মূল্য সারসংক্ষেপ", valueDelivered: "প্রদত্ত মূল্য", costPerValue: "প্রতি মূল্যে খরচ", outcomes: { delivered: "প্রদত্ত", partial: "আংশিক", blocked: "অবরুদ্ধ" } } },
};

function esc(s) {
  let out = "";
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (ch === "\\") out += "\\\\";
    else if (ch === "'") out += "\\'";
    else if (c < 128) out += ch;
    else if (c > 0xffff) { const x = c - 0x10000; out += "\\u" + (0xd800 + (x >> 10)).toString(16).padStart(4, "0") + "\\u" + (0xdc00 + (x & 0x3ff)).toString(16).padStart(4, "0"); }
    else out += "\\u" + c.toString(16).padStart(4, "0");
  }
  return out;
}
function serialize(obj, indent) {
  const pad = " ".repeat(indent); const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") lines.push(`${pad}${k}: '${esc(v)}',`);
    else { lines.push(`${pad}${k}: {`); lines.push(serialize(v, indent + 2)); lines.push(`${pad}},`); }
  }
  return lines.join("\n");
}

let done = 0;
for (const [loc, { tabActivity, block }] of Object.entries(T)) {
  const path = join(DIR, `${loc}.ts`);
  let src = readFileSync(path, "latin1");
  // 1) tabActivity after tabUsage
  if (!/\n[ \t]*tabActivity: '/.test(src)) {
    const before = src;
    src = src.replace(/(\n)([ \t]+)(tabUsage: '[^']*',\n)/, (m, nl, ind, line) => `${nl}${ind}${line}${ind}tabActivity: '${esc(tabActivity)}',\n`);
    if (src === before) { console.error(`${loc}: tabUsage anchor missing`); process.exit(1); }
  }
  // 2) athena/value block between `other` and `severity`
  if (!/\n[ \t]*athenaUsage: '/.test(src)) {
    const before = src;
    src = src.replace(/(\n([ \t]+)other: '[^']*',\n)([ \t]*severity: \{)/, (m, otherLine, ind, sev) => `${otherLine}${serialize(block, ind.length)}\n${sev}`);
    if (src === before) { console.error(`${loc}: other→severity anchor missing`); process.exit(1); }
  }
  writeFileSync(path, src, "latin1");
  done++;
}
console.log(`done ${done}`);
