
let lang = 'en';
let DATA;

fetch('./data/data.json')
.then(r=>r.json())
.then(d=>{
  DATA=d;
  render();
});

function setLang(l){
  lang=l;
  render();
}

function render(){
  document.getElementById('title').innerText=DATA[lang].title;
  document.getElementById('subtitle').innerText=DATA[lang].subtitle;

  let main=document.getElementById('main');
  main.innerHTML='';
  DATA[lang].sections.forEach(s=>{
    let div=document.createElement('div');
    div.className='card';
    div.innerText=s.title;
    div.onclick=()=>openList();
    main.appendChild(div);
  });
}

function openList(){
  document.body.innerHTML='<h1>Paper List</h1><input id="search" placeholder="search"><div id="list"></div>';
  let list=document.getElementById('list');
  let papers=DATA[lang].papers;

  function renderList(){
    let q=document.getElementById('search').value.toLowerCase();
    list.innerHTML='';
    papers.filter(p=>p.title.toLowerCase().includes(q))
    .forEach(p=>{
      let d=document.createElement('div');
      d.innerHTML=`<h3>${p.title} (${p.year})</h3>
      <p>${p.abstract}</p>
      <p>${p.citation}</p>`;
      list.appendChild(d);
    });
  }

  document.getElementById('search').oninput=renderList;
  renderList();
}
