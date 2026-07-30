/**
 * SAIN MOTORS — MEGA OPEN MIC
 * Google Apps Script backend for the registration landing page.
 *
 * Target sheet:
 * https://docs.google.com/spreadsheets/d/1J_fff-66k5Q027YpQFu0PlYKUGeYeW90GyRjnvR-T7c/edit
 *
 * ── Sheet layout (must match COLUMN_* below) ───────────────────────────────
 *   A  Бүртгүүлсэн огноо   written by this script
 *   B  Нэр                 written by this script
 *   C  Утас                written by this script
 *   D  Дууны нэр           written by this script
 *   E  Холбогдсон          left blank — for your team
 *   F  Ирсэн эсэх          left blank — for your team
 *   G  Тэмдэглэл           left blank — for your team
 *
 * Columns E–G are never touched, so notes added by hand survive every write.
 *
 * ── Deployment (must be done from the sheet owner's Google account) ────────
 * 1. Open the sheet ▸ Extensions ▸ Apps Script.
 * 2. In the Files panel on the left, open `Code.gs`, select everything and
 *    replace it with this file. Save (Ctrl+S).
 * 3. Deploy ▸ New deployment ▸ gear icon ▸ Web app
 *      Execute as:        Me
 *      Who has access:    Anyone          ← not "Anyone with Google Account"
 *    Approve the permission prompt (Advanced ▸ Go to project ▸ Allow).
 * 4. Copy the /exec URL into GOOGLE_SHEETS_WEBHOOK_URL — in .env.local
 *    locally, and in the host's environment variables in production.
 *
 * This is a NEW deployment against the MEGA OPEN MIC sheet. Do not reuse the
 * MEGA TEST DRIVE 5 deployment: that one writes a time-slot column into a
 * different spreadsheet and is still serving the live test-drive page.
 *
 * After editing this file later, you must publish a NEW VERSION
 * (Deploy ▸ Manage deployments ▸ edit ▸ New version) or the old code keeps
 * running.
 *
 * ── Contract ──────────────────────────────────────────────────────────────
 * POST  body: { timestamp, fullName, phone, songName }
 *       ->    { ok: true } | { ok: false, reason: "duplicate" | "invalid" | "busy" }
 *
 * GET   ->    { ok: true, total: <rows> }        health check only
 *
 * The duplicate check runs inside a document lock, so concurrent submissions
 * can never write the same person twice.
 */

var SPREADSHEET_ID = "1J_fff-66k5Q027YpQFu0PlYKUGeYeW90GyRjnvR-T7c";
var SHEET_NAME = "Sheet1";

var TIME_ZONE = "Asia/Ulaanbaatar";
var LOCK_TIMEOUT_MS = 20000;

/* 1-indexed column positions. */
var COLUMN_TIMESTAMP = 1;
var COLUMN_NAME = 2;
var COLUMN_PHONE = 3;
var COLUMN_SONG = 4;

var HEADERS = [
  "Бүртгүүлсэн огноо",
  "Нэр",
  "Утас",
  "Дууны нэр",
  "Холбогдсон",
  "Ирсэн эсэх",
  "Тэмдэглэл"
];

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function sheet_() {
  var spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  /* Only write headers into a completely empty sheet — never overwrite yours. */
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function digitsOnly_(value) {
  return String(value).replace(/\D/g, "");
}

/**
 * Keeps Sheets from evaluating a submitted value as a formula.
 *
 * A song title is free text, so "=1+1" or "@sum" is a legitimate thing to
 * type; the leading apostrophe forces it to stay text in the cell.
 */
function asText_(value) {
  var text = String(value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}

/**
 * True when this phone already holds a registration.
 *
 * Matched on the number alone: the form promises one registration per phone,
 * so a second row for the same number would contradict what people were told.
 */
function isDuplicate_(sheet, phone) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  /* Display values, never getValues() — a phone column formatted as a number
     comes back as 99887766 and would stop matching an 8-digit string. */
  var rows = sheet.getRange(2, COLUMN_PHONE, lastRow - 1, 1).getDisplayValues();
  for (var i = 0; i < rows.length; i += 1) {
    if (digitsOnly_(rows[i][0]) === phone) return true;
  }
  return false;
}

function doGet() {
  var sheet = sheet_();
  return json_({ ok: true, total: Math.max(0, sheet.getLastRow() - 1) });
}

function doPost(event) {
  var body;
  try {
    body = JSON.parse(event.postData.contents);
  } catch (error) {
    return json_({ ok: false, reason: "invalid" });
  }

  var fullName = String(body.fullName || "").trim();
  var phone = digitsOnly_(body.phone || "");
  var songName = String(body.songName || "").trim();
  var submittedAt = body.timestamp ? new Date(body.timestamp) : new Date();
  if (isNaN(submittedAt.getTime())) submittedAt = new Date();

  if (!fullName || phone.length !== 8 || !songName) {
    return json_({ ok: false, reason: "invalid" });
  }

  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
    return json_({ ok: false, reason: "busy" });
  }

  try {
    var sheet = sheet_();

    if (isDuplicate_(sheet, phone)) {
      return json_({ ok: false, reason: "duplicate" });
    }

    var row = [];
    row[COLUMN_TIMESTAMP - 1] = Utilities.formatDate(
      submittedAt,
      TIME_ZONE,
      "yyyy-MM-dd HH:mm:ss"
    );
    row[COLUMN_NAME - 1] = asText_(fullName);
    /* Leading apostrophe keeps Sheets from eating a leading zero. */
    row[COLUMN_PHONE - 1] = "'" + phone;
    row[COLUMN_SONG - 1] = asText_(songName);

    sheet.appendRow(row);
    SpreadsheetApp.flush();
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
