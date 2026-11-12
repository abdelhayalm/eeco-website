'use strict';
const stories = {
  tee: [
    {stage:'Caterpillar · descobrir',art:'tee',alt:'Camiseta de algodão ainda com o tecido em bom estado',title:'Olhe além da gola.',body:'A gola cedeu, mas o tecido da frente e das costas continua firme. Essas duas partes podem ganhar outra forma: os lados de uma bolsa.'},
    {stage:'Cocoon · transformar',art:'cut-tee',alt:'Ilustração das mangas e da gola sendo recortadas para formar as alças',title:'As alças já estão ali.',body:'Com a camiseta aberta sobre uma mesa, o recorte das mangas e da gola deixa faixas largas nos ombros. Elas serão as alças. No app, você acompanha os recortes, as franjas e os nós que fecham a base.'},
    {stage:'Butterfly · experimentar',art:'tote',alt:'Bolsa feita de uma camiseta, com a base amarrada',title:'Um novo jeito de levar.',body:'Confira as costuras e os nós sobre uma mesa. Teste a bolsa com algo macio e leve, levantando devagar. Uma abertura ou um nó solto pede um ajuste antes de usar.'}
  ],
  paper: [
    {stage:'Caterpillar · descobrir',art:'paper-cover',alt:'Retalhos de papel e uma nova folha feita com suas fibras',title:'Uma folha é uma rede de fibras.',body:'Parece uma superfície só, mas a borda rasgada revela fibras. Com água e uma tela, as mesmas fibras podem formar outra folha. O começo é separar papel comum, sem revestimento.'},
    {stage:'Cocoon · transformar',art:'screen',alt:'Tela fina recolhendo fibras de papel de uma bandeja com água',title:'Deixe a tela encontrar as fibras.',body:'A polpa de papel se espalha na água. Uma tela fina passa por baixo e sobe na horizontal: a água escorre, as fibras ficam. A história completa mostra o preparo da polpa e a prensagem.'},
    {stage:'Butterfly · experimentar',art:'sheet',alt:'Folha artesanal com textura e pequenas fibras visíveis',title:'Leia a nova textura.',body:'Depois de secar, sinta o papel e teste um lápis num canto. Uma folha com textura pode virar etiqueta, colagem ou bilhete. Observe o que mudou e o que as fibras trouxeram da primeira vida.'}
  ],
  leaves: [
    {stage:'Caterpillar · descobrir',art:'leaves',alt:'Pequeno conjunto de folhas secas',title:'Uma folha já tem um próximo ciclo.',body:'Sob árvores e arbustos, folhas caídas formam uma camada que abriga vida e se decompõe aos poucos. Você pode observar esse processo em um pequeno canteiro de que cuida.'},
    {stage:'Cocoon · transformar',art:'mulch',alt:'Folhas formando uma camada solta ao redor de uma planta',title:'Cubra o solo. Deixe espaço.',body:'Use um pequeno lote de folhas limpas e secas, sem sinais de doença ou contaminação. Espalhe uma camada fina e solta, deixando espaço junto aos caules e troncos. A água precisa atravessar.'},
    {stage:'Butterfly · experimentar',art:'leaf-cover',alt:'Folhas secas ao lado de um canteiro com cobertura',title:'Volte depois da água.',body:'Depois da chuva ou da rega, compare a área coberta com o solo próximo. Se as folhas formarem uma placa compacta, solte ou retire parte delas. Observe antes de ampliar a experiência.'}
  ]
};
let selectedStory = 'tee';
let cardIndex = 0;
const previous = document.getElementById('reader-prev');
const next = document.getElementById('reader-next');
const choices = [...document.querySelectorAll('[data-story]')];
function render(announce = true) {
  const cards = stories[selectedStory];
  const card = cards[cardIndex];
  document.getElementById('reader-stage').textContent = card.stage;
  document.getElementById('reader-count').textContent = `${cardIndex+1} de ${cards.length}`;
  const art = document.getElementById('reader-art');
  art.src = `/recycla/art/${card.art}.svg`;
  art.alt = card.alt;
  document.getElementById('reader-title').textContent = card.title;
  document.getElementById('reader-body').textContent = card.body;
  previous.disabled = cardIndex === 0;
  next.disabled = cardIndex === cards.length-1;
  choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.story === selectedStory)));
  document.querySelectorAll('.reader-progress span').forEach((dot,i)=>dot.classList.toggle('active',i<=cardIndex));
  if (announce) document.getElementById('reader-announcement').textContent = `Cartão ${cardIndex+1} de ${cards.length}. ${card.stage}. ${card.title}`;
}
choices.forEach(button => button.addEventListener('click',()=>{selectedStory=button.dataset.story;cardIndex=0;render();}));
previous.addEventListener('click',()=>{if(cardIndex>0){cardIndex--;render();}});
next.addEventListener('click',()=>{if(cardIndex<stories[selectedStory].length-1){cardIndex++;render();}});
render(false);
