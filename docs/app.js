// app.js
let allData = [];
let filteredData = [];
let currentCategory = 0;

async function loadData() {
  const res = await fetch('data.json');
  allData = await res.json();
  filterData();
  renderCategories();
  renderResults();
}

const categories = [
  { key: 0, label: "全て" },
  { key: 1, label: "上段" },
  { key: 2, label: "中段" },
  { key: 3, label: "肩" }
];

function renderCategories() {
  const sidebar = document.getElementById('sidebar');
  const ul = sidebar.querySelector('ul');
  ul.innerHTML = '';
  categories.forEach(cat => {
    const li = document.createElement('li');
    li.textContent = cat.label;
    li.dataset.category = cat.key;
    if (cat.key === currentCategory) li.classList.add('active');
    li.addEventListener('click', () => {
      currentCategory = cat.key;
      filterData();
      renderCategories();
      renderResults();
      updateUrl();
    });
    ul.appendChild(li);
  });
}

function filterData() {
  if (currentCategory === 0) {
    filteredData = allData;
  } else {
    filteredData = allData.filter(item => item.c === currentCategory);
  }
  const keyword = document.getElementById('search').value.trim().toLowerCase();
  if (keyword) filteredData = filteredData.filter(item => item.n.toLowerCase().includes(keyword));
}

const IMAGE_BASE_URL = "https://rotool.gungho.jp/images/item_icon/";

function renderResults() {
  const container = document.getElementById('results');
  const count = document.getElementById('count');
  const view = document.querySelector('input[name="view"]:checked').value;
  const showName = document.getElementById('showName').checked;
  const imgSize = view === 'large' ? 160 : 80;

  container.innerHTML = '';
  count.textContent = `${filteredData.length} 件`;

  filteredData.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';

    div.innerHTML = `
      <img src="${IMAGE_BASE_URL}${encodeURIComponent(item.i)}.png" alt="${item.n}"
          data-name="${item.n}"
          style="width:${imgSize}px; height:${imgSize}px; display:block; margin:0 auto 0.5rem;" />
      ${showName ? `<div>${item.n}</div>` : ''}
    `;

    container.appendChild(div);
  });
}

// 反映
function updateUrl() {
  const keyword = encodeURIComponent(document.getElementById('search').value.trim());
  const cat = currentCategory === 0 ? 0 : currentCategory;
  history.replaceState(null, '', `?c=${cat}&q=${keyword}`);
}

// 読み込み
function loadFromUrl() {
  const params = new URLSearchParams(location.search);
  const cat = params.get('c');
  currentCategory = (cat === 0 || cat === null) ? 0 : Number(cat) || 1;
  const q = params.get('q');
  if (q) document.getElementById('search').value = decodeURIComponent(q);
}

document.getElementById('search').addEventListener('input', () => {
  filterData();
  renderResults();
  updateUrl();
});

window.addEventListener('load', () => {
  loadFromUrl();
  filterData();
  renderCategories();
  renderResults();
});

document.querySelectorAll('input[name="view"], #showName').forEach(el =>
  el.addEventListener('change', () => renderResults())
);

document.getElementById('search').addEventListener('input', () => {
  filterData();
  renderResults();
});

const hoverTitle = document.getElementById('hover-title');
document.getElementById('results').addEventListener('mouseover', e => {
  const img = e.target.closest('img');
  if (img && img.dataset.name) {
    hoverTitle.textContent = img.dataset.name;
    hoverTitle.style.display = 'block';
  }
});
document.getElementById('results').addEventListener('mouseout', e => {
  const img = e.target.closest('img');
  if (img && img.dataset.name) {
    hoverTitle.style.display = 'none';
  }
});

document.getElementById('results').addEventListener('click', e => {
  const img = e.target.closest('img');
  if (img && img.alt) {
    navigator.clipboard.writeText(img.alt);
  }
});

loadData();

