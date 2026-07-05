var currentSkill = null;
var currentTitleEn = '';
var currentTitleZh = '';

function loadSkillContent(skill, titleEn, titleZh) {
  currentSkill = skill;
  currentTitleEn = titleEn;
  currentTitleZh = titleZh;
  var lang = document.body.className.indexOf('lang-zh') !== -1 ? 'zh' : 'en';
  var modal = document.getElementById('skill-modal');
  var title = document.getElementById('skill-modal-title');
  var body = document.getElementById('skill-modal-body');
  var customTitle = lang === 'zh' && titleZh ? titleZh : titleEn;
  title.textContent = customTitle || skill;
  body.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--muted);">Loading...</div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  fetch('personalSkills/' + skill + (lang === 'zh' ? '.zh' : '') + '.md')
    .then(function(r) {
      if (!r.ok) throw new Error('Not found');
      return r.text();
    })
    .then(function(md) {
      if (typeof marked !== 'undefined') {
        body.innerHTML = marked.parse(md);
      } else {
        body.innerHTML = '<pre style="white-space:pre-wrap">' + md + '</pre>';
      }
    })
    .catch(function() {
      if (lang === 'zh') {
        return fetch('personalSkills/' + skill + '.md')
          .then(function(r2) {
            if (!r2.ok) throw new Error('Not found');
            return r2.text();
          })
          .then(function(md2) {
            body.innerHTML = marked.parse ? marked.parse(md2) : '<pre style="white-space:pre-wrap">' + md2 + '</pre>';
          })
          .catch(function() {
            body.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--muted);">Content not available.</div>';
          });
      }
      body.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--muted);">Content not available.</div>';
    });
}

// Listen for language changes (from i18n.js) to reload modal
document.addEventListener('langchange', function() {
  if (currentSkill) {
    loadSkillContent(currentSkill, currentTitleEn, currentTitleZh);
  }
});

// Skill modal
document.addEventListener('DOMContentLoaded', function() {
  var tags = document.querySelectorAll('.skill-tag');
  tags.forEach(function(tag) {
    tag.addEventListener('click', function() {
      var skill = this.getAttribute('data-skill');
      if (!skill) return;
      var titleEn = this.getAttribute('data-title-en') || this.textContent.trim();
      var titleZh = this.getAttribute('data-title-zh') || titleEn;
      loadSkillContent(skill, titleEn, titleZh);
    });
  });
});

function closeSkillModal() {
  document.getElementById('skill-modal').style.display = 'none';
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('skill-modal').addEventListener('click', function(e) {
    if (e.target === this) closeSkillModal();
  });
  // Keyboard escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSkillModal();
  });
});
