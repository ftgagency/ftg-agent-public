const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const dialog = $('#guideDialog');
const toast = $('#toast');
let toastTimer;

function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

$$('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => scrollToSection(button.dataset.scroll));
});

const sectionIds = ['overview', 'workflow', 'connectors', 'hermes', 'setup'];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    $$('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.scroll === id || (id === 'demo' && link.dataset.scroll === 'setup')));
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.15, 0.4] });
  sectionIds.concat('demo').forEach((id) => { const section = document.getElementById(id); if (section) observer.observe(section); });
}

$$('.setup-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.setup-item');
    const wasOpen = item.classList.contains('open');
    item.classList.toggle('open', !wasOpen);
    button.setAttribute('aria-expanded', String(!wasOpen));
  });
});

const guideContent = {
  facebook: {
    kicker: 'CONNECTOR · META', title: 'Facebook Page',
    intro: 'Đây là hướng dẫn chuẩn bị. Chưa có nút OAuth hoạt động vì Meta App và webhook của Agent chưa được cấu hình.',
    steps: [
      ['Tạo Meta App cho Messenger', 'Đăng ký App ID trong Meta for Developers, thêm Messenger và chọn Page thử nghiệm do bạn quản lý.'],
      ['Xin đúng quyền cho Page', 'Bắt đầu với pages_show_list để liệt kê Page và pages_messaging để đọc/trả lời theo Messenger Platform. Khách ngoài nhóm phát triển cần quyền truy cập phù hợp và có thể phải qua App Review.'],
      ['Cấu hình webhook HTTPS', 'Cần callback server, verify token riêng, xác thực webhook và đăng ký trường messages. GitHub Pages không nhận được webhook.'],
      ['Thử trước, bật có kiểm soát', 'Dùng Page thử nghiệm, xác nhận FAQ, cửa sổ phản hồi của Meta và quy trình chuyển cho nhân viên trước khi bật cho khách thật.']
    ],
    links: [['Meta Messenger API', 'https://developers.facebook.com/documentation/business-messaging/messenger-platform/get-started'], ['Meta Webhooks', 'https://developers.facebook.com/documentation/business-messaging/messenger-platform/webhooks']],
    warning: 'Không gửi App Secret, Page token hoặc mật khẩu Facebook vào website, Google Sheet hay hội thoại hỗ trợ.'
  },
  google: {
    kicker: 'CONNECTOR · GOOGLE', title: 'Google Sheets',
    intro: 'Mục tiêu là ghi lead vào đúng bảng khách chọn, không xin quyền đọc toàn bộ Drive nếu không cần.',
    steps: [
      ['Tạo Google Cloud project', 'Bật Google Sheets API, điền thương hiệu, email hỗ trợ và màn hình đồng ý OAuth.'],
      ['Tạo OAuth Client dạng Web', 'Đặt authorized origin/redirect URI đúng với endpoint sản phẩm đã triển khai; chỉ dùng Client ID phù hợp với luồng web.'],
      ['Dùng scope tối thiểu', 'Ưu tiên quyền theo file như drive.file khi thiết kế luồng khách chọn một bảng; tránh yêu cầu quyền Drive rộng. Kiểm tra quy trình xác minh OAuth cho ứng dụng công khai.'],
      ['Kiểm tra ghi dữ liệu', 'Khách chọn bảng, ánh xạ cột lead và thử bằng dữ liệu giả trước. Token/refresh token phải được backend mã hóa, không nhúng vào JavaScript.']
    ],
    links: [['Google Sheets Quickstart', 'https://developers.google.com/sheets/api/quickstart/js'], ['Google Sheets scopes', 'https://developers.google.com/workspace/sheets/api/scopes']],
    warning: 'Không yêu cầu khách dán OAuth token hoặc Client Secret. Bản xem tĩnh hiện tại không xử lý callback OAuth.'
  },
  chatgpt: {
    kicker: 'CONNECTOR · CHATGPT', title: 'Thêm Agent vào ChatGPT',
    intro: 'ChatGPT cần một MCP server truy cập công khai qua HTTPS. Server đó hiện chưa được xây dựng hoặc triển khai.',
    steps: [
      ['FTG triển khai MCP endpoint', 'Endpoint phải khám phá được tools, có xác thực phù hợp, policy quyền và kiểm thử trên dữ liệu demo. URL chưa tồn tại ở bản này.'],
      ['Khách mở Plugins / Apps', 'Trong ChatGPT web, chọn thêm custom MCP server, nhập tên và endpoint HTTPS do FTG cấp. Tên menu có thể thay đổi theo workspace.'],
      ['Thiết lập xác thực và kiểm tra tools', 'Cấp quyền riêng cho tài khoản khách, xem danh sách tools và thử một thao tác chỉ đọc trước. Không bật quyền ghi nếu chưa cần.'],
      ['Xem khả năng theo gói', 'Quyền tạo, chia sẻ và thực thi MCP phụ thuộc gói ChatGPT và chính sách quản trị workspace. Admin của workspace có thể cần phê duyệt.']
    ],
    links: [['Hướng dẫn OpenAI về custom MCP', 'https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt']],
    warning: 'Không thể kết nối ChatGPT chỉ bằng trang dashboard này. Đừng nhập URL giả hoặc tin rằng trạng thái “đã nối” khi chưa có endpoint.'
  },
  account: {
    kicker: 'TÀI KHOẢN · EMAIL / ĐIỆN THOẠI', title: 'Đăng nhập khách hàng',
    intro: 'Dự kiến hỗ trợ Gmail, Hotmail hoặc các email khác và số điện thoại. Bản demo hiện chưa thể tạo tài khoản hay gửi mã đăng nhập.',
    steps: [
      ['Nhập thông tin liên hệ', 'Khách chọn email hoặc số điện thoại của chính mình. Email Gmail và Hotmail đều là địa chỉ email thông thường.'],
      ['Xác minh mã một lần', 'Sau khi hệ thống xác thực được triển khai, khách nhận mã qua email hoặc SMS và nhập mã để đăng nhập. Không cần gửi mật khẩu email cho FTG.'],
      ['Tài khoản và quyền riêng', 'Mỗi khách có tài khoản, cấu hình Agent và quyền truy cập riêng. Cần backend, dịch vụ gửi mã, chống lạm dụng và bảo vệ dữ liệu trước khi vận hành.']
    ],
    links: [],
    warning: 'Đăng nhập chưa được triển khai. Chưa thu email hay số điện thoại, chưa gửi mã và chưa có phiên đăng nhập trong bản demo.'
  }
};

function openGuide(key) {
  const data = guideContent[key];
  if (!data || !dialog) return;
  $('#dialogKicker').textContent = data.kicker;
  $('#dialogTitle').textContent = data.title;
  const steps = data.steps.map(([title, text], index) => `<div class="dialog-step"><span class="dialog-step-num">${String(index + 1).padStart(2, '0')}</span><div><strong>${title}</strong><small>${text}</small></div></div>`).join('');
  const links = data.links.map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('');
  $('#dialogBody').innerHTML = `<p>${data.intro}</p>${steps}<div class="dialog-links">${links}</div><div class="dialog-warning"><span>!</span><span>${data.warning}</span></div>`;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

$$('[data-open-guide]').forEach((button) => button.addEventListener('click', () => openGuide(button.dataset.openGuide)));
$('#closeDialog')?.addEventListener('click', () => dialog.close());
$('#dialogDone')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

const brainDraftKey = 'ftg-agent-hermes-brain-draft-v1';
const providerLabels = {
  'openai-codex': 'OpenAI Codex / ChatGPT subscription',
  anthropic: 'Claude / Anthropic',
  custom: 'Custom endpoint',
};
const providerGuides = {
  'openai-codex': 'Hermes có provider OpenAI Codex cho gói ChatGPT/Codex subscription; đăng nhập bằng device code trong hermes model. Đây chỉ là lựa chọn nháp, chưa mở trang đăng nhập hay dùng subscription.',
  anthropic: 'Hermes hỗ trợ Anthropic trực tiếp. Có thể dùng Anthropic API key (tính phí theo mức dùng) hoặc OAuth Claude Max kèm extra usage; Claude Pro đơn thuần không đủ cho đường OAuth này. Chưa nhập khóa hay đăng nhập.',
  custom: 'Chọn provider/model và endpoint tương thích trong Hermes ở máy chủ. Chỉ lưu key trong secret/env của Hermes; không nhập key trên website này.',
};
const providerChoice = $('#providerChoice');
function updateProviderDraftStatus(isSaved = false) {
  if (!providerChoice) return;
  const provider = providerChoice.value;
  $('#providerHelp').textContent = providerGuides[provider] || 'Hermes là bộ khung Agent. Chọn Claude, OpenAI Codex hoặc provider khác; cấu hình thực hiện trong Hermes, không lưu API key trên website.';
  $('#providerDraftStatus').textContent = provider
    ? `${isSaved ? 'Đã lưu nháp' : 'Lựa chọn nháp'}: ${providerLabels[provider]}. Chưa cấu hình hoặc kết nối Hermes.`
    : 'Chưa chọn provider. Không có thông tin đăng nhập được lưu.';
}
try {
  const saved = JSON.parse(localStorage.getItem(brainDraftKey) || 'null');
  if (saved && Object.prototype.hasOwnProperty.call(providerLabels, saved.provider)) providerChoice.value = saved.provider;
} catch (_) { /* Bản nháp không tồn tại hoặc bộ nhớ bị chặn. */ }
updateProviderDraftStatus(true);
providerChoice?.addEventListener('change', () => updateProviderDraftStatus(false));
$('#saveProviderDraft')?.addEventListener('click', () => {
  const provider = providerChoice?.value || '';
  try {
    localStorage.setItem(brainDraftKey, JSON.stringify({provider}));
    updateProviderDraftStatus(true);
    notify(provider ? 'Đã lưu lựa chọn provider trên thiết bị; Hermes chưa kết nối.' : 'Chưa chọn provider.');
  } catch (_) { notify('Không thể lưu trên thiết bị; lựa chọn chỉ hiển thị tạm thời.'); }
});

let hermesConnected = false;
const liveHistory = [];
async function refreshHermesStatus() {
  try {
    const response = await fetch(new URL('api/status', document.baseURI), {cache: 'no-store', credentials: 'same-origin'});
    if (!response.ok) return;
    const status = await response.json();
    if (!status || status.connected !== true || status.model !== 'hermes-agent') return;
    hermesConnected = true;
    $('#hermesState').textContent = 'GATEWAY ON';
    $('#hermesState').classList.add('engine-status-live');
    $('#hermesBadge').innerHTML = '<i></i> HERMES API · LOCAL';
    $('#hermesBadge').classList.remove('status-tag-demo', 'status-tag-pending');
    $('#hermesBadge').classList.add('status-tag-live');
    $('#chatHeaderStatus').textContent = 'Hermes gateway local · cần thử chat để xác nhận provider';
    $('#chatModeTag').textContent = 'HERMES LOCAL · DEV';
    $('#chatDisclaimer').textContent = 'Tin nhắn sẽ tới Hermes Agent và provider đã cấu hình trên máy chủ. Hermes có thể dùng tools theo cấu hình host; chỉ thử dữ liệu giả, không dùng URL công khai hoặc dữ liệu khách hàng.';
  } catch (_) { /* GitHub Pages/bản tĩnh không có bridge: giữ chế độ FAQ demo. */ }
}

const answers = [
  { match: /giá|chi phí|bao nhiêu|phí/i, text: 'Theo thông tin mẫu của FTG, dịch vụ thiết lập AI Agent là 1.500.000đ, thường mất khoảng 1–2 giờ và có kèm hướng dẫn vận hành. Đây là FAQ minh họa; hãy xác nhận báo giá hiện hành với FTG trước khi áp dụng cho khách thật.', note: 'Nguồn: FAQ mẫu được viết sẵn trong bản demo; không lấy từ dữ liệu khách hàng.' },
  { match: /bao lâu|thời gian|mất bao lâu|hướng dẫn/i, text: 'Một buổi thiết lập mẫu thường mất 1–2 giờ và bao gồm hướng dẫn vận hành. Thời gian thực tế phụ thuộc vào tài khoản, quyền ứng dụng và việc chuẩn bị dữ liệu.', note: 'FAQ mẫu · chưa kiểm tra lịch thực tế.' },
  { match: /không biết|chưa chắc|không trả lời|ngoài phạm vi|người thật/i, text: 'Khi chưa tìm thấy câu trả lời trong FAQ đã duyệt, Agent nên dừng và chuyển cho nhân viên. Bạn có thể liên hệ FTG qua Zalo 0918 212 460 để được hỗ trợ.', note: 'Hành vi chuyển tuyến được minh họa; chưa kết nối quy trình nhân viên.' },
  { match: /facebook|page|messenger/i, text: 'Để trả lời inbox Page cần Meta App, quyền phù hợp, Page access do chính khách cấp và webhook HTTPS. Bản demo hiện chưa kết nối Facebook.', note: 'Không có lệnh gọi Meta API trong bản demo.' },
  { match: /google|sheet|sheets|lead/i, text: 'Có thể thiết kế Agent để ghi lead vào một Google Sheet do khách chọn. Cần bật Sheets API, OAuth và backend bảo mật; bản demo chưa đọc hay ghi bất kỳ Sheet nào.', note: 'Không có lệnh gọi Google API trong bản demo.' },
  { match: /chatgpt|mcp|kết nối/i, text: 'Khách có thể thêm một custom MCP server vào ChatGPT sau khi FTG triển khai endpoint HTTPS. URL MCP chưa được tạo, nên chưa thể kết nối thật ở phiên bản này.', note: 'Hướng dẫn liên quan: mục “Để khách tự kết nối”.' }
];

function addMessage(text, who, note) {
  const body = $('#chatBody');
  const row = document.createElement('div');
  row.className = `message-row ${who === 'user' ? 'user-message' : 'agent-message'}`;
  if (who === 'agent') {
    const avatar = document.createElement('span');
    avatar.className = 'message-avatar';
    avatar.textContent = '✳';
    row.appendChild(avatar);
  }
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.append(document.createTextNode(text));
  if (note && who === 'agent') {
    const small = document.createElement('small');
    small.textContent = note;
    bubble.appendChild(small);
  }
  row.appendChild(bubble);
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
}

function localAnswer(question) {
  const found = answers.find((item) => item.match.test(question));
  if (found) return found;
  return { text: 'Mình chưa có thông tin đã được FTG xác nhận để trả lời câu này. Bạn có thể nhắn Zalo FTG 0918 212 460; khi triển khai thật, câu hỏi ngoài FAQ sẽ được chuyển cho nhân viên thay vì tự suy đoán.', note: 'Phản hồi dự phòng mẫu · không có AI hoặc CRM phía sau.' };
}

function submitDemo(question) {
  const text = question.trim();
  if (!text) return;
  addMessage(text, 'user');
  $('#chatInput').value = '';
  const body = $('#chatBody');
  const typing = document.createElement('div');
  typing.className = 'message-row agent-message';
  typing.id = 'typingRow';
  typing.innerHTML = '<span class="message-avatar">✳</span><div class="message-bubble"><span class="typing-indicator"><i></i><i></i><i></i></span></div>';
  body.appendChild(typing);
  body.scrollTop = body.scrollHeight;
  if (hermesConnected) {
    const messages = [
      {role: 'system', content: 'Bạn là trợ lý FTG đang thử nghiệm. Chỉ dùng thông tin được cung cấp. Không gửi tin nhắn hoặc sửa dữ liệu bên ngoài nếu người dùng chưa yêu cầu; nếu thiếu dữ liệu, nói rõ và chuyển tới nhân viên FTG qua Zalo 0918 212 460. Trả lời tiếng Việt ngắn gọn.'},
      ...liveHistory,
      {role: 'user', content: text},
    ];
    fetch(new URL('api/chat', document.baseURI), {
      method: 'POST', credentials: 'same-origin', headers: {'content-type': 'application/json'},
      body: JSON.stringify({messages}),
    }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
      const answer = result?.choices?.[0]?.message?.content;
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('empty_llm_answer');
      liveHistory.push({role: 'user', content: text}, {role: 'assistant', content: answer});
      typing.remove();
      $('#chatHeaderStatus').textContent = 'Đã nhận phản hồi từ Hermes local; provider hoạt động ở lượt thử này.';
      addMessage(answer, 'agent', 'Hermes Agent đã trả lời qua bridge localhost; thử nghiệm, không dành cho khách hàng.');
    }).catch(() => {
      typing.remove();
      $('#chatHeaderStatus').textContent = 'Chưa có phản hồi; kiểm tra trạng thái Hermes/provider trên máy chạy Agent.';
      addMessage('Hermes chưa trả lời được. Hãy kiểm tra gateway/provider và thử lại; đây không phải phản hồi thật.', 'agent', 'Lỗi Hermes/provider · không chuyển ngầm sang FAQ demo.');
    });
    return;
  }
  window.setTimeout(() => {
    typing.remove();
    const answer = localAnswer(text);
    addMessage(answer.text, 'agent', answer.note);
  }, 420);
}

$('#chatForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  submitDemo($('#chatInput').value);
});
$$('[data-question]').forEach((button) => button.addEventListener('click', () => submitDemo(button.dataset.question)));
$('#resetChat')?.addEventListener('click', () => {
  const body = $('#chatBody');
  liveHistory.length = 0;
  body.innerHTML = '<div class="chat-date">HÔM NAY · HỘI THOẠI MINH HỌA</div><div class="message-row agent-message"><span class="message-avatar">✳</span><div class="message-bubble">Chào bạn! Mình là trợ lý demo của FTG. Bạn có thể hỏi về dịch vụ thiết lập AI Agent hoặc cách kết nối Facebook và Google. <small>Chỉ là FAQ ví dụ — chưa nối dữ liệu thật.</small></div></div>';
  notify('Đã xóa hội thoại demo.');
});

refreshHermesStatus();
