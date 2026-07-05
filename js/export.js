/**
 * export.js — PDF Export module
 *
 * DEBUG: Set localStorage.setItem('pdf_debug','1') then reload for verbose logging.
 */
var PDF_DEBUG = localStorage && localStorage.getItem('pdf_debug') === '1';
function LOG() { if (PDF_DEBUG) { var args = Array.prototype.slice.call(arguments); args.unshift('[PDF]'); console.log.apply(console, args); } }
function exportPDF() {
  var isZh = document.body.classList.contains('lang-zh');
  var content = document.getElementById('export-content');
  if (!content) { alert('Error: Export content not found'); return; }
  LOG('=== PDF EXPORT START ===');
  LOG('isZh:', isZh);
  LOG('viewport:', window.innerWidth, 'x', window.innerHeight);

  // --- Log element dimensions before modifications ---
  var cr = content.getBoundingClientRect();
  LOG('content (before mods):', {
    offsetWidth: content.offsetWidth,
    offsetHeight: content.offsetHeight,
    scrollWidth: content.scrollWidth,
    scrollHeight: content.scrollHeight,
    clientWidth: content.clientWidth,
    clientHeight: content.clientHeight,
    boundingRect: { top: cr.top, left: cr.left, width: cr.width, height: cr.height }
  });
  var cs = getComputedStyle(content);
  LOG('content computed styles:', {
    width: cs.width,
    maxWidth: cs.maxWidth,
    paddingLeft: cs.paddingLeft,
    paddingRight: cs.paddingRight,
    marginLeft: cs.marginLeft,
    marginRight: cs.marginRight,
    boxSizing: cs.boxSizing,
    overflow: cs.overflow,
    position: cs.position,
    display: cs.display
  });
  LOG('html2pdf lib:', typeof html2pdf, typeof html2pdf === 'function' ? '(loaded)' : '(MISSING!)');
  // --- Disable buttons ---
  var btns = document.querySelectorAll('.export-btn');
  btns.forEach(function(b) { b.disabled = true; b.textContent = isZh ? '⏳ 生成中…' : '⏳ Rendering…'; });

  // --- Force light theme ---
  var oldTheme = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', 'light');

  // --- Inline language visibility ---
  var langEls = content.querySelectorAll('.en-only, .zh-only');
  var langState = [];
  langEls.forEach(function(el) {
    langState.push({ el: el, display: el.style.display });
    el.style.display = el.classList.contains('en-only') ? (isZh ? 'none' : 'block') : (isZh ? 'block' : 'none');
  });

  // --- Strip ↗ from skill tags ---
  var tags = content.querySelectorAll('.skill-tag');
  var arrowState = [];
  tags.forEach(function(el) {
    var t = el.textContent;
    if (t.indexOf('↗') !== -1) { arrowState.push({ el: el, text: t }); el.textContent = t.replace(' ↗', '').replace('↗', ''); }
  });

  // --- Enlarge fonts for PDF readability ---
  var pdfStyle = document.createElement('style');
  pdfStyle.id = 'pdf-export-zoom';
  pdfStyle.textContent = [
    '#export-content { font-size: 22px !important; line-height: 1.7 !important; }',
    '#export-content .header h1 { font-size: 44px !important; }',
    '#export-content .header .title-en { font-size: 22px !important; }',
    '#export-content .section-title { font-size: 17px !important; }',
    '#export-content .entry-company { font-size: 20px !important; }',
    '#export-content .entry-role { font-size: 17px !important; }',
    '#export-content .school { font-size: 19px !important; }',
    '#export-content .project-name { font-size: 19px !important; }',
    '#export-content .contact-row { font-size: 16px !important; }',
    '#export-content .entry-desc, #export-content .intro-block p { font-size: 16px !important; }',
    '#export-content .skill-tag { font-size: 16px !important; }',
    '#export-content .hobby-tag { font-size: 16px !important; }',
    '#export-content .project-desc { font-size: 16px !important; }',
  ].join(' ');
  document.head.appendChild(pdfStyle);

  // --- Log dimensions after style injection ---
  var cr3 = content.getBoundingClientRect();
  LOG('content (after style injection):', {
    offsetWidth: content.offsetWidth,
    offsetHeight: content.offsetHeight
  });

  setTimeout(function() {
    try {
      var opt = {
        margin:       [6, 6, 6, 6],
        filename:     isZh ? 'Wayne_LIN_简历.pdf' : 'Wayne_LIN_Resume.pdf',
        image:        { type: 'jpeg', quality: 0.95 },
        html2canvas:  {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        // mode: [] disables html2pdf's DOM page-splitting plugin which causes blank pages.
        // toPdf() falls back to canvas-based splitting, slicing the full canvas at page heights.
        pagebreak:    { mode: [] }
      };

      LOG('opt being passed to html2pdf:', JSON.parse(JSON.stringify(opt)));

      // --- Intercept html2canvas to log canvas dimensions ---
      var origH2c = window.html2canvas;
      if (typeof origH2c === 'function') {
        window.html2canvas = function(el, opts) {
          LOG('html2canvas invoked - element:', (el && el.id) || (el && el.tagName) || 'unknown', 'opts.width:', (opts && opts.width), 'opts.windowWidth:', (opts && opts.windowWidth));
          return origH2c(el, opts).then(function(cv) {
            LOG('html2canvas RESULT canvas:', { width: cv.width, height: cv.height });
            window.html2canvas = origH2c;
            return cv;
          }, function(err) {
            LOG('html2canvas ERROR:', err);
            window.html2canvas = origH2c;
            throw err;
          });
        };
      } else {
        LOG('WARNING: window.html2canvas not found');
      }

      btns.forEach(function(b) { b.textContent = isZh ? '⏳ 保存PDF…' : '⏳ Saving PDF…'; });

      html2pdf().set(opt).from(content).save().then(function() {
        showToast(isZh ? '✅ PDF 已导出' : '✅ PDF saved!');
        restore();
      }).catch(function(err) {
        console.error('PDF export error:', err);
        showToast('❌ ' + (isZh ? '导出失败' : 'Export failed'));
        restore();
      });
    } catch(e) {
      showToast('❌ Error: ' + e.message);
      restore();
    }
  }, 100);

  function restore() {
    LOG('=== PDF EXPORT END (restore) ===');
    document.documentElement.setAttribute('data-theme', oldTheme || 'light');
    langState.forEach(function(s) { s.el.style.display = s.display; });
    arrowState.forEach(function(s) { s.el.textContent = s.text; });
    var zoomStyle = document.getElementById('pdf-export-zoom');
    if (zoomStyle) zoomStyle.remove();
    btns.forEach(function(b) {
      b.disabled = false;
      b.textContent = isZh ? '📄 导出PDF' : '📄 Export PDF';
    });
  }

  function showToast(msg) {
    var old = document.getElementById('pdf-toast');
    if (old) old.remove();
    var toast = document.createElement('div');
    toast.id = 'pdf-toast';
    toast.textContent = msg;
    toast.style.cssText =
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
      'z-index:9999;background:#1a1c2e;color:#fff;padding:12px 24px;' +
      'border-radius:12px;font-size:14px;font-family:-apple-system,sans-serif;' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.2);max-width:90vw;text-align:center;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300); }, 3000);
  }
}
