/**
 * export.js — PDF Export module
 *
 * Opens a print-ready window with formatted resume content.
 * User saves as PDF via browser print dialog (Cmd+P → Save as PDF).
 */

function exportPDF() {
  var isZh = document.body.classList.contains('lang-zh');
  var content = document.getElementById('export-content');
  if (!content) {
    alert(isZh ? '错误：未找到导出内容' : 'Error: Export content not found');
    return;
  }

  var clone = content.cloneNode(true);
  clone.removeAttribute('id');

  // Remove opposite language elements
  var removeClass = isZh ? 'en-only' : 'zh-only';
  var toRemove = clone.querySelectorAll('.' + removeClass);
  for (var i = toRemove.length - 1; i >= 0; i--) {
    toRemove[i].parentNode.removeChild(toRemove[i]);
  }

  // Strip arrows and Learn More tags
  var tags = clone.querySelectorAll('.skill-tag');
  for (var j = tags.length - 1; j >= 0; j--) {
    var t = tags[j].textContent;
    if (t.indexOf('Learn More') !== -1 || t.indexOf('了解更多') !== -1) {
      tags[j].parentNode.removeChild(tags[j]);
    } else if (t.indexOf('↗') !== -1) {
      tags[j].textContent = t.replace(' ↗', '').replace('↗', '');
    }
  }

  // Remove clickable links (except skills): remove project/external links entirely, replace others with text
  var links = clone.querySelectorAll('a');
  for (var l = links.length - 1; l >= 0; l--) {
    var link = links[l];
    if (link.closest('.skills-grid')) continue;
    // Remove project links entirely (Project Page, AppStore, Marketing, GitHub, Demo Video etc.)
    if (link.closest('.project-name') || link.closest('.project-links-row') || link.closest('.project-links')) {
      link.parentNode.removeChild(link);
    } else {
      var text = document.createTextNode(link.textContent);
      link.parentNode.replaceChild(text, link);
    }
  }

  // Remove UI elements
  var uiEls = clone.querySelectorAll('.top-bar, .mobile-export, .mobile-menu');
  for (var k = uiEls.length - 1; k >= 0; k--) {
    uiEls[k].parentNode.removeChild(uiEls[k]);
  }

  var printWin = window.open('', '_blank');
  if (!printWin) {
    alert(isZh ? '请允许弹出窗口' : 'Please allow popups');
    return;
  }

  printWin.document.write(
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    '<title>' + (isZh ? 'Wayne LIN 简历' : 'Wayne LIN Resume') + '</title>' +
    '<style>' + getPrintCSS() + '</style></head><body>' +
    clone.innerHTML +
    '<script>window.onload=function(){setTimeout(function(){window.print();},500);}<\/script>' +
    '</body></html>'
  );
  printWin.document.close();
}

function getPrintCSS() {
  return [
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; color: #1a1c2e; line-height: 1.5; font-size: 15px; padding: 30px 42px; max-width: 794px; margin: 0 auto; background: #fff; }',

    '.header { text-align: center; padding: 0 0 14px; }',
    '.header h1 { font-size: 30px; font-weight: 700; margin-bottom: 3px; }',
    '.title-en { font-size: 16px; color: #1c4ed8; font-weight: 500; }',
    '.title-zh { font-size: 16px; color: #6b7280; }',
    '.contact-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin-top: 10px; font-size: 14px; color: #6b7280; }',
    '.contact-row a { color: #1c4ed8; text-decoration: none; }',
    'a { color: #1c4ed8; text-decoration: none; }',

    '.section { margin-bottom: 12px; }',
    '#work { page-break-before: always; break-before: page; margin-top: 0; }',
    '.section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e0e2ec; }',

    '.timeline { position: relative; }',
    '.timeline::before { content: ""; position: absolute; left: 100px; top: 6px; bottom: 6px; width: 1.5px; background: #e0e2ec; }',
    '.entry { display: flex; margin-bottom: 9px; }',
    '.entry-date { width: 100px; flex-shrink: 0; text-align: right; font-size: 13px; color: #6b7280; padding: 3px 10px 0 0; }',
    '.entry-body { position: relative; padding-left: 20px; flex: 1; min-width: 0; }',
    '.entry-body::before { content: ""; position: absolute; left: -5px; top: 7px; width: 10px; height: 10px; border-radius: 50%; background: #1c4ed8; border: 2px solid #fff; }',
    '.entry-company { font-size: 16px; font-weight: 600; color: #1a1c2e; }',
    '.entry-role { font-size: 14px; color: #1c4ed8; margin-top: 1px; }',
    '.entry-desc { font-size: 14px; margin-top: 2px; line-height: 1.5; color: #1a1c2e; }',
    '.entry-desc ul { margin-top: 2px; padding-left: 16px; }',
    '.entry-desc li { margin-bottom: 1px; }',

    '.intro-block { padding: 12px 16px; margin-bottom: 10px; background: #f0f2f8; border-radius: 8px; }',
    '.intro-block p { font-size: 14.5px; line-height: 1.6; margin-bottom: 4px; }',
    '.intro-block p:last-child { margin-bottom: 0; }',

    '.skill-tag { font-size: 13px; padding: 3px 10px; background: #eef2ff; color: #1a1c2e; border: 1px solid #e0e2ec; border-radius: 5px; display: inline-block; margin: 2px 4px 2px 0; }',
    '.hobby-tag { font-size: 13px; padding: 3px 10px; background: #eef2ff; color: #1a1c2e; border: 1px solid #e0e2ec; border-radius: 5px; display: inline-block; margin: 2px 4px 2px 0; }',
    '.skills-category { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-top: 10px; margin-bottom: 4px; }',
    '.skills-grid { display: flex; flex-wrap: wrap; gap: 4px; }',
    '.hobbies { display: flex; flex-wrap: wrap; gap: 4px; }',

    '.project-name { font-size: 15px; font-weight: 600; color: #1c4ed8; display: flex; justify-content: space-between; align-items: center; padding-bottom: 5px; margin-bottom: 5px; border-bottom: 1px solid #e0e2ec; }',
    '.project-name a { font-size: 13px; color: #1c4ed8; text-decoration: none; }',
    '.project-desc { font-size: 14px; line-height: 1.5; color: #1a1c2e; margin-top: 3px; }',
    '.project-desc ul { padding-left: 16px; margin: 3px 0; list-style: disc; }',
    '.project-desc li { margin-bottom: 2px; }',
    '.project-card { padding: 10px 12px; margin-bottom: 8px; border-radius: 8px; background: #f8f9fe; border: 1px solid #e0e2ec; }',
    '.project-grid { display: block; }',
    '.project-build-note { font-size: 13px; padding: 7px 11px; margin-bottom: 8px; background: #eef2ff; border-radius: 8px; }',
    '.project-build-note p { margin: 0; }',
    '.project-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }',
    '.project-tags span { font-size: 12px; background: #eef2ff; color: #1c4ed8; padding: 2px 8px; border-radius: 999px; }',
    '.project-meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; margin-top: 6px; gap: 5px; }',
    '.project-status { font-size: 13px; color: #16a34a; font-weight: 500; }',
    '.project-links { display: flex; flex-wrap: wrap; gap: 4px; }',
    '.project-links a { font-size: 12px; color: #1c4ed8; text-decoration: none; background: #eef2ff; padding: 2px 8px; border-radius: 999px; }',
    '.project-links-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }',
    '.project-links-row a { font-size: 13px; color: #1c4ed8; text-decoration: none; }',

    '.languages-content { font-size: 14.5px; }',
    '.lang-entry { margin-bottom: 3px; }',

    '.entry-parallel .entry-body { padding-left: 20px; }',
    '.entry-parallel-label { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; padding-left: 20px; }',
    '.parallel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-left: 20px; }',
    '.parallel-item { padding: 0; background: none; border-radius: 0; border: none; }',
    '.parallel-item::before { display: none; }',
    '.parallel-item .entry-company { font-size: 14px; }',
    '.parallel-item .entry-role { font-size: 13px; }',
    '.parallel-item .entry-desc { font-size: 13px; }',

    'footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #e0e2ec; text-align: center; font-size: 13px; color: #6b7280; }',

    '@media print {',
    '  body { padding: 22px 34px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
    '  #work { page-break-before: always; break-before: page; }',
    '  .intro-block { break-inside: avoid; }',
    '  .project-card { break-inside: avoid; }',
    '  .header { break-inside: avoid; }',
    '  .parallel-item { break-inside: avoid; }',
    '  .section-title { break-after: avoid; page-break-after: avoid; }',
    '  .entry-company { break-after: avoid; page-break-after: avoid; }',
    '  .entry-role { break-after: avoid; page-break-after: avoid; }',
    '  .section-title + .timeline, .section-title + .skills-grid, .section-title + .project-grid { break-before: avoid; }',
    '}',
    '@page { margin: 0; size: A4; }',
  ].join('\n');
}
