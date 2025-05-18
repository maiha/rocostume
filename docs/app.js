let allData = [];
let filteredData = [];
let currentCategory = 0;
let currentColor = 'all';

const categories = [
  { key: 0, label: "全て" },
  { key: 1, label: "上段" },
  { key: 2, label: "中段" },
  { key: 3, label: "肩" }
];

const COLOR_DEFINITIONS = [
  { key: 'all', label: '全て' },
  { key: 'white', label: '白' },
  { key: 'gray', label: 'グレー' },
  { key: 'beige', label: 'ベージュ' },
  { key: 'red', label: '赤' },
  { key: 'blue', label: '青' },
  { key: 'purple', label: '紫' },
  { key: 'green', label: '緑' },
  { key: 'unclassified', label: '未分類' }
];

// 共通フィルタ関数
function getFilteredData(excludeKey = null) {
  const keyword = document.getElementById('search').value.trim().toLowerCase();
  return allData.filter(item => {
    if (!(excludeKey === 'color') && currentColor !== 'all' && item.category !== currentColor) return false;
    if (!(excludeKey === 'category') && currentCategory !== 0 && item.c !== currentCategory) return false;
    if (keyword && !item.n.toLowerCase().includes(keyword)) return false;
    return true;
  });
}

function renderCategoryFilter() {
  const sidebar = document.getElementById('sidebar');
  const ul = sidebar.querySelector('ul');
  ul.innerHTML = '';

  const baseFiltered = getFilteredData('category');
  const catCounts = {};
  categories.forEach(cat => {
    if (cat.key === 0) {
      catCounts[cat.key] = baseFiltered.length;
    } else {
      catCounts[cat.key] = baseFiltered.filter(item => item.c === cat.key).length;
    }
  });

  categories.forEach(cat => {
    const li = document.createElement('li');
    li.dataset.category = cat.key;
    li.className = (cat.key === Number(currentCategory)) ? 'active' : '';
    if (cat.key === 0) {
      li.textContent = cat.label;
    } else {
      li.textContent = `${cat.label} (${catCounts[cat.key]})`;
    }
    li.onclick = () => {
      currentCategory = Number(cat.key);
      filterAndRender();
      renderCategoryFilter();
      renderColorFilter();
      updateUrl();
    };
    ul.appendChild(li);
  });
}

function getFilteredDataForCount(excludeKey = null) {
  const keyword = document.getElementById('search').value.trim().toLowerCase();
  return allData.filter(item => {
    if (keyword && !item.n.toLowerCase().includes(keyword)) return false;
    if (!(excludeKey === 'color') && currentColor !== 'all' && item.category !== currentColor) return false;
    if (!(excludeKey === 'category') && currentCategory !== 0 && item.c !== currentCategory) return false;
    return true;
  });
}

function renderCategoryFilter() {
  const sidebar = document.getElementById('sidebar');
  const ul = sidebar.querySelector('ul');
  ul.innerHTML = '';
  const baseFiltered = getFilteredDataForCount('category'); // キーワードのみ適用

  categories.forEach(cat => {
    const li = document.createElement('li');
    li.dataset.category = cat.key;
    li.className = (cat.key === Number(currentCategory)) ? 'active' : '';
    let count;
    if (cat.key === 0) {
      count = baseFiltered.length;
    } else {
      count = baseFiltered.filter(item => item.c === cat.key).length;
    }
    li.textContent = (cat.key === 0) ? cat.label : `${cat.label} (${count})`;
    li.onclick = () => {
      currentCategory = Number(cat.key);
      filterAndRender();
      renderCategoryFilter();
      renderColorFilter();
      updateUrl();
    };
    ul.appendChild(li);
  });
}

function renderColorFilter() {
  const ul = document.getElementById('color-filter');
  ul.innerHTML = '';
  const baseFiltered = getFilteredDataForCount('color'); // キーワードのみ適用

  COLOR_DEFINITIONS.forEach(col => {
    const li = document.createElement('li');
    li.dataset.color = col.key;
    li.className = (col.key === currentColor) ? 'active' : '';
    let count;
    if (col.key === 'all') {
      count = baseFiltered.length;
    } else {
      count = baseFiltered.filter(item => item.category === col.key).length;
    }
    li.textContent = (col.key === 'all') ? col.label : `${col.label} (${count})`;
    li.onclick = () => {
      currentColor = col.key;
      filterAndRender();
      renderColorFilter();
      renderCategoryFilter();
      updateUrl();
    };
    ul.appendChild(li);
  });
}

function filterData() {
  filteredData = allData;
  if (currentCategory !== 0) {
    filteredData = filteredData.filter(item => item.c === currentCategory);
  }
  const keyword = document.getElementById('search').value.trim().toLowerCase();
  if (keyword) {
    filteredData = filteredData.filter(item => item.n.toLowerCase().includes(keyword));
  }
  if (currentColor !== 'all') {
    filteredData = filteredData.filter(item => item.category === currentColor);
  }
}

function filterAndRender() {
  filterData();
  renderResults();
}

async function loadData() {
  const res = await fetch('data.json');
  allData = await res.json();

  const colorRes = await fetch('colors.json').catch(() => null);
  const colorData = colorRes ? await colorRes.json() : [];
  const colorMap = new Map(colorData.map(c => [c.i, c]));

  allData.forEach(item => {
    const color = colorMap.get(item.i);
    item.h = color?.h ?? null;
    item.rgb = color?.rgb ?? null;
    item.category = color?.category ?? null;
  });

  filterData();
  renderCategoryFilter();
  renderColorFilter();
  renderResults();
}

function renderResults() {
  const container = document.getElementById('results');
  const count = document.getElementById('count');
  const view = document.querySelector('input[name="view"]:checked').value;
  const showName = document.getElementById('showName').checked;
  const itemInfo = document.getElementById('item-info');

  container.classList.toggle('view-large', view === 'large');
  container.classList.toggle('view-small', view !== 'large');

  container.innerHTML = '';
  count.textContent = `${filteredData.length} 件`;

  filteredData.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <img src="https://rotool.gungho.jp/images/item_icon/${encodeURIComponent(item.i)}.png" alt="${item.n}" data-name="${item.n}" />
      ${showName ? `<div>${item.n}</div>` : ''}
    `;
    div.onclick = () => {
      itemInfo.innerHTML = `
        <span>
          ${item.id}: ${item.n} /
          <a href="https://rotool.gungho.jp/item/${item.id}/0/" target="_blank" rel="noopener">
            <img src="https://rotool.gungho.jp/images/site_logo.png" class="site-link-icon">
          </a>
        </span>
      `;
    };
    container.appendChild(div);
  });
}

function updateUrl() {
  const keyword = encodeURIComponent(document.getElementById('search').value.trim());
  const cat = currentCategory || 0;
  const col = currentColor || 'all';
  history.replaceState(null, '', `?c=${cat}&q=${keyword}&color=${col}`);
}

function loadFromUrl() {
  const params = new URLSearchParams(location.search);
  const cat = params.get('c');
  currentCategory = cat === null ? 0 : Number(cat) || 0;
  const q = params.get('q');
  if (q) document.getElementById('search').value = decodeURIComponent(q);
  currentColor = params.get('color') || 'all';
}

document.getElementById('search').oninput = () => {
  filterAndRender();
  renderColorFilter();
  renderCategoryFilter();
  updateUrl();
};

document.querySelectorAll('input[name="view"], #showName').forEach(el =>
  el.onchange = () => renderResults()
);

window.addEventListener('load', () => {
  loadFromUrl();
  loadData().then(() => {
    renderColorFilter();
    renderCategoryFilter();
    filterAndRender();
  });
});
