import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

// フォントファイルの読み込み
const fontBytes = fs.readFileSync(path.resolve(__dirname, "font/ipaexm.ttf"));

interface InvoiceDetails {
  issuerName: string;
  issuerRegistrationNumber: string;
  date: string;
  invoiceNumber: string;
  billingTo: string;
  itemDescription: string;
  itemQuantity: number;
  itemUnitPrice: number;
  isReducedTaxRate: boolean;
  remarks?: string; // 備考
}

async function createInvoice(outputPath: string, details: InvoiceDetails) {
  // 新しいPDFドキュメントを作成
  const pdfDoc = await PDFDocument.create();

  // フォントの登録
  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  // ページを追加
  const page = pdfDoc.addPage([600, 800]);

  // ページのサイズを取得
  const { width, height } = page.getSize();

  // インボイスのヘッダーを追加
  const fontSize = 18;
  page.drawText("領収書", {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  // ① 適格請求書発行事業者の氏名または名称および登録番号
  const smallFontSize = 12;
  page.drawText(`発行者: ${details.issuerName}`, {
    x: 50,
    y: height - 6 * fontSize,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(`登録番号: ${details.issuerRegistrationNumber}`, {
    x: 50,
    y: height - 7 * fontSize,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  // ② 取引年月日
  page.drawText(`取引日: ${details.date}`, {
    x: 50,
    y: height - 9 * fontSize,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  // 水平線を追加
  page.drawLine({
    start: { x: 50, y: height - 10 * fontSize },
    end: { x: width - 50, y: height - 10 * fontSize },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // ③ 取引内容 (軽減税率の対象品目である旨)
  page.drawText("宛先:", {
    x: 50,
    y: height - 11 * fontSize,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(details.billingTo, {
    x: 50,
    y: height - 12 * fontSize,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  // テーブルヘッダーを追加
  let yPosition = height - 14 * fontSize;

  page.drawText("商品説明", {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  page.drawText("数量", {
    x: 300,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  page.drawText("単価", {
    x: 400,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  page.drawText("合計", {
    x: 500,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  // 水平線を追加
  page.drawLine({
    start: { x: 50, y: yPosition - 5 },
    end: { x: width - 50, y: yPosition - 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // 商品のリストを追加
  yPosition -= 20;
  page.drawText(
    details.itemDescription +
      (details.isReducedTaxRate ? " (軽減税率対象)" : ""),
    {
      x: 50,
      y: yPosition,
      size: smallFontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    }
  );
  page.drawText(details.itemQuantity.toString(), {
    x: 300,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(`¥${details.itemUnitPrice}`, {
    x: 400,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  page.drawText(`¥${details.itemQuantity * details.itemUnitPrice}`, {
    x: 500,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  // 水平線を追加
  page.drawLine({
    start: { x: 50, y: yPosition - 5 },
    end: { x: width - 50, y: yPosition - 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // 合計額と消費税
  yPosition -= 20;
  const totalAmount = details.itemQuantity * details.itemUnitPrice;
  const totalTax = totalAmount * (details.isReducedTaxRate ? 0.08 : 0.1);

  page.drawText(`合計金額: ¥${totalAmount}`, {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;
  page.drawText(`消費税: ¥${totalTax.toFixed(2)}`, {
    x: 50,
    y: yPosition,
    size: smallFontSize,
    font: customFont,
    color: rgb(0, 0, 0),
  });

  // 備考を追加
  if (details.remarks) {
    yPosition -= 40;
    page.drawText("備考:", {
      x: 50,
      y: yPosition,
      size: smallFontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(details.remarks, {
      x: 50,
      y: yPosition - 20,
      size: smallFontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });
  }

  // PDFを保存
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

// 引数の処理
const args = process.argv.slice(2);
if (args.length < 10 || args.length > 11) {
  console.error(
    "Usage: ts-node src/index.ts <outputPath> <issuerName> <issuerRegistrationNumber> <date> <invoiceNumber> <billingTo> <itemDescription> <itemQuantity> <itemUnitPrice> <isReducedTaxRate> [remarks]"
  );
  console.error(`Received ${args.length} arguments: ${args.join(", ")}`);
  process.exit(1);
}

const [
  outputPath,
  issuerName,
  issuerRegistrationNumber,
  date,
  invoiceNumber,
  billingTo,
  itemDescription,
  itemQuantity,
  itemUnitPrice,
  isReducedTaxRate,
  remarks,
] = args;

const details: InvoiceDetails = {
  issuerName,
  issuerRegistrationNumber,
  date,
  invoiceNumber,
  billingTo,
  itemDescription,
  itemQuantity: parseInt(itemQuantity),
  itemUnitPrice: parseFloat(itemUnitPrice),
  isReducedTaxRate: isReducedTaxRate === "true",
  remarks,
};

createInvoice(outputPath, details).catch((err) => console.error(err));
