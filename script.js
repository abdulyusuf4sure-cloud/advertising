const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
const imageInput = document.getElementById('image-input');
const previewGrid = document.getElementById('preview-grid');
const uploadButton = document.getElementById('upload-button');
const uploadStatus = document.getElementById('upload-status');
const userList = document.getElementById('user-list');

// Payment elements
const submitPaymentBtn = document.getElementById('submit-payment');
const amountInput = document.getElementById('amount');
const paymentRefInput = document.getElementById('paymentRef');
const receiptInput = document.getElementById('receipt');
const paymentMessage = document.getElementById('payment-message');

// Admin elements
const adminLink = document.getElementById('admin-link');
const adminPanel = document.getElementById('admin-panel');
const pendingList = document.getElementById('pending-list');

// Storage keys
const PENDING_KEY = 'world_pending_payments';
const VERIFIED_KEY = 'world_verified_payments';

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return [];
  }
}

function writeJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getPending() { return readJSON(PENDING_KEY); }
function getVerified() { return readJSON(VERIFIED_KEY); }

function renderPending() {
  const pending = getPending();
  pendingList.innerHTML = '';
  if (!pending.length) {
    pendingList.innerHTML = '<li class="user-item">No pending payments</li>';
    return;
  }
  pending.forEach((p) => {
    const li = document.createElement('li');
    li.className = 'user-item';
    li.innerHTML = `
      <div><strong>${p.name}</strong> — ${p.business} — ₦${p.amount}</div>
      <div>${p.ref ? 'Ref: ' + p.ref : ''}</div>
    `;
    if (p.receiptData) {
      const img = document.createElement('img');
      img.src = p.receiptData;
      img.style.maxWidth = '120px';
      img.style.display = 'block';
      img.style.marginTop = '0.5rem';
      li.appendChild(img);
    }
    const btn = document.createElement('button');
    btn.textContent = 'Verify payment';
    btn.className = 'btn-primary';
    btn.style.marginTop = '0.75rem';
    btn.addEventListener('click', () => verifyPayment(p.id));
    li.appendChild(btn);
    pendingList.appendChild(li);
  });
}

function verifyPayment(id) {
  const pending = getPending();
  const idx = pending.findIndex(p => p.id === id);
  if (idx === -1) return;
  const payment = pending.splice(idx, 1)[0];
  const verified = getVerified();
  verified.push(payment);
  writeJSON(PENDING_KEY, pending);
  writeJSON(VERIFIED_KEY, verified);
  // add to live users list
  const listItem = document.createElement('li');
  listItem.className = 'user-item';
  listItem.textContent = `${payment.name} — ${payment.business}`;
  userList.appendChild(listItem);
  renderPending();
}

function submitPendingPayment() {
  const name = document.getElementById('name').value.trim();
  const business = document.getElementById('business').value.trim();
  const amount = parseFloat(amountInput.value);
  const ref = paymentRefInput.value.trim();
  if (!name || !business) {
    paymentMessage.textContent = 'Please fill name and business first.';
    return;
  }
  if (isNaN(amount) || amount < 2000) {
    paymentMessage.textContent = 'You must enter at least ₦2,000 as amount.';
    return;
  }
  const file = receiptInput.files[0];
  if (!file) {
    paymentMessage.textContent = 'Please upload receipt image for verification.';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const pending = getPending();
    const payment = {
      id: Date.now(),
      name,
      business,
      amount,
      ref,
      receiptData: reader.result,
      created: new Date().toISOString(),
    };
    pending.push(payment);
    writeJSON(PENDING_KEY, pending);
    paymentMessage.textContent = 'Payment submitted for verification. Admin will verify shortly.';
    receiptInput.value = '';
    paymentRefInput.value = '';
    amountInput.value = '';
    renderPending();
  };
  reader.readAsDataURL(file);
}

submitPaymentBtn && submitPaymentBtn.addEventListener('click', submitPendingPayment);

adminLink && adminLink.addEventListener('click', (e) => {
  e.preventDefault();
  const code = prompt('Enter admin code to view pending payments:');
  if (code === 'worldadmin') {
    adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
    renderPending();
  } else {
    alert('Invalid admin code');
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const business = document.getElementById('business').value.trim();

  // check verified payments
  const verified = getVerified();
  const found = verified.find(p => p.name === name && p.business === business && p.amount >= 2000);
  if (!found) {
    status.style.color = '#d84444';
    status.textContent = 'You must pay ₦2,000 and have your payment verified before advertising. Submit payment for verification.';
    return;
  }

  status.style.color = '';
  status.textContent = 'Payment verified. Sending your request...';

  setTimeout(() => {
    status.textContent = 'Thanks! Your ad request has been received and your payment is confirmed.';
    const listItem = document.createElement('li');
    listItem.className = 'user-item';
    listItem.textContent = `${name} — ${business}`;
    userList.appendChild(listItem);
    form.reset();
  }, 1000);
});

function updatePreviews(files) {
  previewGrid.innerHTML = '';

  Array.from(files).slice(0, 6).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = () => {
      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = `
        <img src="${reader.result}" alt="Business image ${index + 1}" />
        <span>${file.name}</span>
      `;
      previewGrid.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}

imageInput.addEventListener('change', () => {
  if (!imageInput.files.length) {
    previewGrid.innerHTML = '';
    uploadStatus.textContent = '';
    return;
  }
  updatePreviews(imageInput.files);
  uploadStatus.textContent = `${imageInput.files.length} image(s) selected.`;
});

uploadButton.addEventListener('click', () => {
  if (!imageInput.files.length) {
    uploadStatus.textContent = 'Please choose at least one image to upload.';
    return;
  }

  uploadStatus.textContent = 'Uploading images...';

  setTimeout(() => {
    uploadStatus.textContent = 'Your business images are uploaded successfully!';
    imageInput.value = '';
    previewGrid.innerHTML = '';
  }, 1000);
});
