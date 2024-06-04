"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdf_lib_1 = require("pdf-lib");
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// フォントファイルの読み込み
const fontBytes = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "fonts/ipaexm.ttf"));
function createInvoice(outputPath, details) {
    return __awaiter(this, void 0, void 0, function* () {
        // 新しいPDFドキュメントを作成
        const pdfDoc = yield pdf_lib_1.PDFDocument.create();
        // フォントの登録
        pdfDoc.registerFontkit(fontkit_1.default);
        const customFont = yield pdfDoc.embedFont(fontBytes);
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
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // ① 適格請求書発行事業者の氏名または名称および登録番号
        const smallFontSize = 12;
        page.drawText(`発行者: ${details.issuerName}`, {
            x: 50,
            y: height - 6 * fontSize,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText(`登録番号: ${details.issuerRegistrationNumber}`, {
            x: 50,
            y: height - 7 * fontSize,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // ② 取引年月日
        page.drawText(`取引日: ${details.date}`, {
            x: 50,
            y: height - 9 * fontSize,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // 水平線を追加
        page.drawLine({
            start: { x: 50, y: height - 10 * fontSize },
            end: { x: width - 50, y: height - 10 * fontSize },
            thickness: 1,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // ③ 取引内容 (軽減税率の対象品目である旨)
        page.drawText("宛先:", {
            x: 50,
            y: height - 11 * fontSize,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText(details.billingTo, {
            x: 50,
            y: height - 12 * fontSize,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // テーブルヘッダーを追加
        let yPosition = height - 14 * fontSize;
        page.drawText("商品説明", {
            x: 50,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText("数量", {
            x: 300,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText("単価", {
            x: 400,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText("合計", {
            x: 500,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // 水平線を追加
        page.drawLine({
            start: { x: 50, y: yPosition - 5 },
            end: { x: width - 50, y: yPosition - 5 },
            thickness: 1,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // 商品のリストを追加
        yPosition -= 20;
        page.drawText(details.itemDescription +
            (details.isReducedTaxRate ? " (軽減税率対象)" : ""), {
            x: 50,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText(details.itemQuantity.toString(), {
            x: 300,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText(`¥${details.itemUnitPrice}`, {
            x: 400,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawText(`¥${details.itemQuantity * details.itemUnitPrice}`, {
            x: 500,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // 水平線を追加
        page.drawLine({
            start: { x: 50, y: yPosition - 5 },
            end: { x: width - 50, y: yPosition - 5 },
            thickness: 1,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // 合計額と消費税
        yPosition -= 20;
        const totalAmount = details.itemQuantity * details.itemUnitPrice;
        const taxRate = details.isReducedTaxRate ? 0.08 : 0.1;
        const totalTax = totalAmount * taxRate;
        const taxRatePercentage = details.isReducedTaxRate ? "8%" : "10%";
        page.drawText(`合計金額: ¥${totalAmount}`, {
            x: 50,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        yPosition -= 20;
        page.drawText(`消費税: ¥${totalTax.toFixed(2)} （${taxRatePercentage}）`, {
            x: 50,
            y: yPosition,
            size: smallFontSize,
            font: customFont,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        // 備考を追加
        if (details.remarks) {
            yPosition -= 40;
            page.drawText("備考:", {
                x: 50,
                y: yPosition,
                size: smallFontSize,
                font: customFont,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
            page.drawText(details.remarks, {
                x: 50,
                y: yPosition - 20,
                size: smallFontSize,
                font: customFont,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
        }
        // PDFを保存
        const pdfBytes = yield pdfDoc.save();
        fs_1.default.writeFileSync(outputPath, pdfBytes);
    });
}
// 引数の処理
const args = process.argv.slice(2);
if (args.length < 10 || args.length > 11) {
    console.error("Usage: invoice-pdf <outputPath> <issuerName> <issuerRegistrationNumber> <date> <invoiceNumber> <billingTo> <itemDescription> <itemQuantity> <itemUnitPrice> <isReducedTaxRate> [remarks]");
    console.error(`Received ${args.length} arguments: ${args.join(", ")}`);
    process.exit(1);
}
const [outputPath, issuerName, issuerRegistrationNumber, date, invoiceNumber, billingTo, itemDescription, itemQuantity, itemUnitPrice, isReducedTaxRate, remarks,] = args;
const details = {
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
