import ExcelJS from "exceljs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "부산락페_데이터_입력양식.xlsx");
const workbook = new ExcelJS.Workbook();
workbook.creator = "Busan Rock Timetable";

const colors = { dark: "FF111519", acid: "FFD8FF38", cyan: "FF45DFF3", white: "FFF6F7F8", gray: "FFE5E7E9", red: "FFFFD6DA" };
const performances = [
  ["day1","2026-10-02","GREEN","the-bowls","THE BOWLS","11:30","12:00"],
  ["day1","2026-10-02","RIVER","tokai","Tokai","11:30","12:00"],
  ["day1","2026-10-02","SAMROCK","shin-in-ryu","Shin In Ryu","12:00","12:30"],
  ["day1","2026-10-02","GREEN","adios-audio","Adios Audio","12:30","13:00"],
  ["day1","2026-10-02","RIVER","w24","W24","12:20","12:50"],
  ["day1","2026-10-02","RIVER","qwer","QWER","15:10","15:50"],
  ["day1","2026-10-02","GREEN","xdinary-heroes","Xdinary Heroes","16:00","16:50"],
  ["day1","2026-10-02","RIVER","ash-island","ASH ISLAND","17:20","18:00"],
  ["day1","2026-10-02","GREEN","cnblue","CNBLUE","17:40","18:30"],
  ["day1","2026-10-02","SAMROCK","jaurim","JAURIM","18:30","19:30"],
  ["day1","2026-10-02","RIVER","tahiti-80","TAHITI 80","18:40","19:30"],
  ["day1","2026-10-02","GREEN","nell","NELL","19:40","20:40"],
  ["day1","2026-10-02","SAMROCK","suede","SUEDE","20:40","22:00"],
];

function styleSheet(sheet, widths) {
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + widths.length)}1` };
  sheet.getRow(1).height = 28;
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.dark } };
    cell.font = { bold: true, color: { argb: colors.acid } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  widths.forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 24;
      row.eachCell((cell) => { cell.alignment = { vertical: "middle", wrapText: true }; cell.border = { bottom: { style: "hair", color: { argb: "FFCDD1D4" } } }; });
    }
  });
}

const guide = workbook.addWorksheet("입력 안내", { properties: { tabColor: { argb: colors.acid } } });
guide.columns = [{ width: 20 }, { width: 75 }];
guide.addRows([
  ["부산락페 데이터 입력 양식", "노란색 항목은 필수입니다. 기존 ID는 수정하지 않는 것을 권장합니다."],
  ["아티스트 정보", "아티스트 소개, 사진 파일명, YouTube 주소를 입력합니다."],
  ["공연 시간표", "날짜, 스테이지, 아티스트 ID, 시작·종료 시간을 입력합니다."],
  ["사진 준비", "사진 파일명은 qwer.jpg처럼 영문 소문자 사용을 권장합니다."],
  ["시간 형식", "24시간제 HH:MM 형식으로 입력합니다. 예: 15:10"],
  ["아티스트 ID", "시간이나 날짜를 포함하지 않은 고유 영문 ID를 사용합니다. 예: qwer, nell"],
  ["지원 스테이지", "SAMROCK, GREEN, RIVER, HIDDEN"],
]);
guide.mergeCells("A1:B1");
guide.getCell("A1").value = "BUSAN ROCK FESTIVAL · DATA GUIDE";
guide.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: colors.dark } };
guide.getCell("A1").font = { bold: true, size: 16, color: { argb: colors.acid } };
guide.getCell("A1").alignment = { vertical: "middle" };
guide.getRow(1).height = 38;
guide.eachRow((row, index) => { if (index > 1) { row.height = 38; row.getCell(1).font = { bold: true }; row.getCell(2).alignment = { wrapText: true, vertical: "middle" }; } });

const artists = workbook.addWorksheet("아티스트 정보", { properties: { tabColor: { argb: colors.cyan } } });
artists.addRow(["아티스트 ID*","아티스트명*","간단한 소개","사진 파일명","YouTube 주소","Instagram 주소","공식 홈페이지"]);
performances.forEach((item) => artists.addRow([item[3], item[4], "", `${item[3]}.jpg`, "", "", ""]));
styleSheet(artists, [22, 24, 55, 26, 48, 40, 40]);
["A","B"].forEach((column) => { artists.getColumn(column).eachCell((cell, row) => { if (row > 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF6C7" } }; }); });

const timetable = workbook.addWorksheet("공연 시간표", { properties: { tabColor: { argb: colors.acid } } });
timetable.addRow(["DAY ID*","날짜*","스테이지*","아티스트 ID*","아티스트명(확인용)","시작 시간*","종료 시간*","비고"]);
performances.forEach((item) => timetable.addRow([...item, ""]));
styleSheet(timetable, [14, 16, 16, 24, 25, 15, 15, 35]);
["A","B","C","D","F","G"].forEach((column) => { timetable.getColumn(column).eachCell((cell, row) => { if (row > 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF6C7" } }; }); });
for (let row = 2; row <= 300; row += 1) {
  timetable.getCell(`A${row}`).dataValidation = { type: "list", allowBlank: false, formulae: ['"day1,day2,day3"'] };
  timetable.getCell(`C${row}`).dataValidation = { type: "list", allowBlank: false, formulae: ['"SAMROCK,GREEN,RIVER,HIDDEN"'] };
}

await workbook.xlsx.writeFile(output);
console.log(output);
