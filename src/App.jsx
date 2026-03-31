import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DESIGN TOKENS ─── */
const T = {
  bg:"#0b0d15", card:"#12141f", border:"#1f2235",
  accent:"#22c55e", accentLight:"rgba(34,197,94,0.1)", accentMid:"rgba(34,197,94,0.22)",
  text:"#e2e5f4", muted:"#6b6f90", faint:"#3c3f5c",
  drop:"#f87171", dropLight:"rgba(248,113,113,0.1)", dropBorder:"rgba(248,113,113,0.28)",
  rp:"#a78bfa",   rpLight:"rgba(167,139,250,0.1)",   rpBorder:"rgba(167,139,250,0.28)",
  bi:"#fb923c",   biLight:"rgba(251,146,60,0.1)",    biBorder:"rgba(251,146,60,0.28)",
  ss:"#60a5fa",   ssLight:"rgba(96,165,250,0.1)",    ssBorder:"rgba(96,165,250,0.28)",
};
const INT_CFG = {
  drop:{ label:"DROP SET",   color:T.drop, bg:T.dropLight, border:T.dropBorder, icon:"▼" },
  rp:  { label:"REST-PAUSE", color:T.rp,   bg:T.rpLight,   border:T.rpBorder,   icon:"⏸" },
  bi:  { label:"BI-SET",     color:T.bi,   bg:T.biLight,   border:T.biBorder,   icon:"⇌" },
  ss:  { label:"SUPERSET",   color:T.ss,   bg:T.ssLight,   border:T.ssBorder,   icon:"⚡" },
};

/* ─── SWAP DATABASE ─── */
const SWAPS = {
  'Supino Inclinado (Máquina)':[
    { name:'Supino Inclinado com Halteres',       icon:'🏋️', meta:'4×10–12 · 90s', why:'Mesmo ângulo. Maior amplitude e ativação estabilizadora.', tag:'sim' },
    { name:'Crossover no Cabo (angulado)',         icon:'🔗', meta:'4×12–15 · 75s', why:'Tensão constante no peitoral superior. Ajuste a polia baixa.', tag:'alt' },
    { name:'Flexão de Braço Inclinada (pés alto)',icon:'💪', meta:'4×12–15 · 60s', why:'Sem equipamento. Eleve os pés numa cadeira para focar o peitoral superior.', tag:'eq' },
  ],
  'Supino Sentado (Máquina)':[
    { name:'Supino com Halteres (banco plano)',   icon:'🏋️', meta:'4×10–12 · 90s', why:'Substituto direto. Maior estabilização ativada pelos halteres.', tag:'sim' },
    { name:'Peck Deck (Voador Plano)',            icon:'🦋', meta:'4×12–15 · 75s', why:'Foco no peitoral médio com tensão constante.', tag:'alt' },
    { name:'Flexão de Braço com Palmas Juntas',  icon:'💪', meta:'4×15–20 · 60s', why:'Sem equipamento. Enfatiza a porção medial do peitoral.', tag:'eq' },
  ],
  'Crucifixo no Voador (Máquina)':[
    { name:'Crucifixo com Halteres',             icon:'🦋', meta:'3×12–15 · 60s', why:'Amplitude completa no alongamento.', tag:'sim' },
    { name:'Crossover no Cabo (alto para baixo)',icon:'🔗', meta:'3×12–15 · 60s', why:'Tensão constante durante toda a repetição.', tag:'alt' },
  ],
  'Crucifixo na Polia':[
    { name:'Crucifixo com Halteres',             icon:'🦋', meta:'3×12–15 · 60s', why:'Substituto direto sem polia. Controle a descida em 3s.', tag:'sim' },
    { name:'Peck Deck (Voador Plano)',            icon:'🦋', meta:'3×12–15 · 60s', why:'Máquina alternativa para isolamento do peitoral.', tag:'sim' },
  ],
  'Máquina de Fundos Sentado':[
    { name:'Mergulho entre Bancos',              icon:'💺', meta:'3×10–12 · 60s', why:'Sem máquina. Use dois bancos. Adicione peso no colo para progredir.', tag:'eq' },
    { name:'Tríceps Testa (Barra ou Halter)',    icon:'🏋️', meta:'3×10–12 · 60s', why:'Excelente para a cabeça longa do tríceps. Controle a descida.', tag:'sim' },
    { name:'Tríceps Coice (Halter)',             icon:'💪', meta:'3×12–15 · 60s', why:'Ótimo isolamento com pico de contração no lockout.', tag:'alt' },
  ],
  'Tríceps Polia com Corda':[
    { name:'Tríceps Polia Barra V',             icon:'🔗', meta:'3×12–15 · 60s', why:'A barra V permite mais carga que a corda.', tag:'sim' },
    { name:'Tríceps Coice (Halter)',             icon:'💪', meta:'3×12–15 · 60s', why:'Sem polia. Excelente contração na cabeça lateral.', tag:'eq' },
    { name:'Tríceps Testa com Halter',          icon:'🏋️', meta:'3×10–12 · 60s', why:'Foco na cabeça longa. Amplitude maior que barra reta.', tag:'alt' },
  ],
  'Tríceps Polia Barra Reta':[
    { name:'Tríceps Polia com Corda',           icon:'🔗', meta:'3×12–15 · 60s', why:'A corda permite pronação no final = mais ativação.', tag:'sim' },
    { name:'Mergulho entre Bancos',             icon:'💺', meta:'3×12–15 · 60s', why:'Sem polia. Mesmo músculo, movimento mais funcional.', tag:'eq' },
  ],
  'Desenvolvimento (Máquina)':[
    { name:'Desenvolvimento com Halteres',      icon:'🏋️', meta:'3×10–12 · 75s', why:'Mais estabilização. Amplitude superior à máquina.', tag:'sim' },
    { name:'Desenvolvimento Arnold',            icon:'💪', meta:'3×10–12 · 75s', why:'Recruta todas as cabeças do ombro durante a rotação.', tag:'alt' },
    { name:'Pike Push-Up',                     icon:'⬆️', meta:'3×12–15 · 60s', why:'Sem equipamento. Eleve os pés para aumentar a dificuldade.', tag:'eq' },
  ],
  'Elevação Lateral no Cabo (Unilateral)':[
    { name:'Elevação Lateral com Halter',       icon:'💪', meta:'3×12–15 · 0s',  why:'Clássico do deltóide medial. Não balance o tronco.', tag:'sim' },
    { name:'Elevação Lateral Inclinado (halter)',icon:'🏋️',meta:'3×12–15 · 0s',  why:'Inclinado num banco dá maior amplitude e isolamento.', tag:'alt' },
  ],
  'Elevação Frontal (Halter)':[
    { name:'Elevação Frontal com Cabo',         icon:'🔗', meta:'3×12–15 · 75s', why:'Tensão constante ao longo de todo o movimento.', tag:'alt' },
    { name:'Elevação Frontal com Anilha',       icon:'🔘', meta:'3×12–15 · 75s', why:'Ambas as mãos juntas = mais estável. Controle excêntrico.', tag:'sim' },
  ],
  'Puxada Alta na Polia':[
    { name:'Barra Fixa (Pullup)',               icon:'🤸', meta:'4×máx · 90s',   why:'Padrão ouro da puxada. Use elástico se necessário.', tag:'sim' },
    { name:'Puxada com Halteres Inclinado',     icon:'🏋️', meta:'4×10–12 · 90s', why:'Sem polia. Deitado num banco inclinado, puxa até o quadril.', tag:'eq' },
    { name:'Puxada na Máquina (Lat Pulldown)',  icon:'🦾', meta:'4×10–12 · 90s', why:'Mesmo padrão de movimento com controle de carga fácil.', tag:'sim' },
  ],
  'Puxada Triângulo (Polia)':[
    { name:'Remada Cavalinho (Barra T)',        icon:'🏋️', meta:'3×10–12 · 90s', why:'Pegada neutra similar. Mais carga e ativação do dorsal.', tag:'sim' },
    { name:'Puxada Supinada (Underhand)',       icon:'🤸', meta:'3×10–12 · 90s', why:'Supinação ativa mais bíceps e dorsal baixo.', tag:'alt' },
  ],
  'Remada Iso-Lateral (Máquina)':[
    { name:'Remada com Halter (unilateral)',    icon:'🏋️', meta:'4×10–12 · 90s', why:'Substituto direto unilateral. Apoie o joelho no banco.', tag:'sim' },
    { name:'Remada Sentada na Polia (barra)',   icon:'🔗', meta:'4×10–12 · 90s', why:'Variação com tensão constante.', tag:'alt' },
    { name:'Remada Curvado (Barra)',            icon:'🏋️', meta:'4×8–10 · 90s',  why:'Mais carga total. Cuidado com a postura lombar.', tag:'alt' },
  ],
  'Remada Sentada Pegada em V':[
    { name:'Remada com Halter (unilateral)',    icon:'🏋️', meta:'3×12 · 90s',    why:'Sem polia. Pegada neutra equivalente com halter.', tag:'sim' },
    { name:'Remada Cavalinho (Barra T)',        icon:'🏋️', meta:'3×10–12 · 90s', why:'Mesma pegada neutra. Excelente para espessura do dorsal.', tag:'alt' },
  ],
  'Rosca Direta (Máquina)':[
    { name:'Rosca Direta com Barra',           icon:'🏋️', meta:'3×10–12 · 0s',  why:'Permite maior carga com movimento estrito.', tag:'sim' },
    { name:'Rosca Direta com Halteres',        icon:'💪', meta:'3×10–12 · 0s',  why:'Maior amplitude e supinação independente em cada braço.', tag:'sim' },
  ],
  'Rosca Martelo Alternada':[
    { name:'Rosca Martelo no Cabo',            icon:'🔗', meta:'3×12 · 60s',    why:'Tensão constante durante todo o arco.', tag:'alt' },
    { name:'Rosca Inclinada (halter)',          icon:'💪', meta:'3×10–12 · 60s', why:'Ângulo inclinado = maior alongamento da cabeça longa.', tag:'alt' },
  ],
  'Rosca Scott (Máquina)':[
    { name:'Rosca Scott com Barra EZ',         icon:'🏋️', meta:'3×10–12 · 60s', why:'Substituto direto. Mesmo ângulo com barra EZ.', tag:'sim' },
    { name:'Rosca Concentrada (halter)',        icon:'💪', meta:'3×10–12 · 60s', why:'Pico de contração máximo. Cotovelo fixo no joelho.', tag:'alt' },
  ],
  'Crucifixo Inverso no Cabo (bilateral)':[
    { name:'Crucifixo Inverso com Halteres',   icon:'🦋', meta:'4×12–15 · 60s', why:'Substituto direto. Deitado no banco inclinado (pronado).', tag:'sim' },
    { name:'Face Pull no Cabo',                icon:'🔗', meta:'4×15–20 · 60s', why:'Deltóide posterior + manguito rotador. Essencial para saúde do ombro.', tag:'alt' },
    { name:'Voador Inverso (peck deck)',        icon:'🦾', meta:'4×12–15 · 60s', why:'Máquina alternativa com tensão constante e execução guiada.', tag:'sim' },
  ],
  'Leg Press Horizontal (Máquina)':[
    { name:'Leg Press 45°',                    icon:'🦾', meta:'4×12–15 · 90s', why:'Variação clássica. Mesmo padrão de movimento, ângulo diferente.', tag:'sim' },
    { name:'Agachamento Livre (Barra)',         icon:'🏋️', meta:'4×10–12 · 90s', why:'Mais difícil tecnicamente, mas superior.', tag:'alt' },
    { name:'Agachamento Goblet (Halter)',       icon:'🏋️', meta:'4×12–15 · 90s', why:'Sem máquina. Segure o halter no peito. Ótima postura.', tag:'eq' },
  ],
  'Agachamento Pêndulo (Máquina)':[
    { name:'Agachamento Hack (Máquina)',        icon:'🦾', meta:'4×10–12 · 90s', why:'Substituto direto. Mesmo ângulo de joelho e foco no quadríceps.', tag:'sim' },
    { name:'Agachamento Búlgaro (halter)',      icon:'💪', meta:'4×10–12 · 90s', why:'Unilateral — corrige desequilíbrios. Mais difícil, mais eficiente.', tag:'alt' },
    { name:'Afundo Caminhando (halter)',        icon:'🚶', meta:'4×12 passadas · 90s', why:'Sem máquina. Quadríceps + glúteo + equilíbrio.', tag:'eq' },
  ],
  'Cadeira Extensora (Máquina)':[
    { name:'Wall Sit (isométrico)',             icon:'🧱', meta:'3×30–60s · 60s', why:'Sem máquina. Isométrico intenso no quadríceps.', tag:'eq' },
    { name:'Step-Up com Halter',               icon:'🪜', meta:'3×12–15 · 60s', why:'Funcional. Sem máquina. Use um banco ou caixa com halteres.', tag:'eq' },
  ],
  'Cadeira Flexora (Máquina)':[
    { name:'Mesa Flexora',                     icon:'🦾', meta:'3×12–15 · 60s', why:'Variação deitado. Mesma função, ângulo de quadril diferente.', tag:'sim' },
    { name:'Curl Nórdico (Nordic Curl)',        icon:'💪', meta:'3×6–10 · 75s',  why:'Sem máquina. Isquiotibiais excêntricos — prevenção de lesão.', tag:'eq' },
  ],
  'Stiff (Máquina ou Halter)':[
    { name:'Stiff com Barra (RDL)',             icon:'🏋️', meta:'4×12–15 · 75s', why:'Variação clássica. Permite maior carga e amplitude.', tag:'sim' },
    { name:'Good Morning',                     icon:'🙇', meta:'4×12 · 75s',    why:'Isquiotibiais + lombares. Técnica diferente, mesmo grupo.', tag:'alt' },
  ],
  'Cadeira Adutora':[
    { name:'Agachamento Sumo (halter)',         icon:'🏋️', meta:'3×15 · 60s',    why:'Sem máquina. Adutores + quadríceps. Pés bem abertos.', tag:'eq' },
    { name:'Afundo Lateral (halter)',           icon:'💪', meta:'3×12 · 60s',    why:'Adutores no alongamento. Unilateral e funcional.', tag:'alt' },
  ],
  'Elevação de Panturrilha em Pé (Máquina)':[
    { name:'Elevação de Panturrilha em Degrau',icon:'🪜', meta:'4×12–15 · 45s', why:'Sem máquina. Use um degrau + peso na mão. Amplitude máxima.', tag:'eq' },
    { name:'Elevação de Panturrilha no Smith', icon:'🏋️', meta:'4×12–15 · 45s', why:'Substituto direto com barra guiada.', tag:'sim' },
  ],
  'Elevação de Panturrilha em Pé (Leg Press ou Máquina)':[
    { name:'Elevação de Panturrilha em Degrau',icon:'🪜', meta:'4×12–15 · 45s', why:'Sem máquina. Amplitude e sobrecarga progressiva com halter.', tag:'eq' },
    { name:'Elevação de Panturrilha no Smith', icon:'🏋️', meta:'4×12–15 · 45s', why:'Substituto direto com barra guiada.', tag:'sim' },
  ],
  'Elevação de Panturrilha Sentado (Máquina)':[
    { name:'Elevação Sentado com Anilha no Joelho',icon:'🔘', meta:'4×15–20 · 45s', why:'Sem máquina. Coloque anilha no joelho. Sóleo isolado.', tag:'eq' },
    { name:'Panturrilha no Leg Press (ponta dos pés)',icon:'🦾', meta:'4×15–20 · 45s', why:'Na ponta do leg press com joelhos levemente flexionados = sóleo.', tag:'alt' },
  ],
  'Crunch na Polia (com carga)':[
    { name:'Crunch com Halter (no banco)',      icon:'🏋️', meta:'4×10–15 · 45s', why:'Sem polia. Segure halter atrás da cabeça no banco inclinado.', tag:'eq' },
    { name:'Abdominal na Máquina',             icon:'🦾', meta:'4×10–15 · 45s', why:'Máquina alternativa para reto abdominal com carga progressiva.', tag:'sim' },
  ],
  'Elevação de Pernas (na barra ou banco)':[
    { name:'Elevação de Pernas em Paralela',   icon:'🤸', meta:'4×12–15 · 45s', why:'Nas barras paralelas — mais estabilidade.', tag:'sim' },
    { name:'Abdominal Bicicleta',              icon:'🚲', meta:'4×20 · 40s',    why:'Sem equipamento. Reto inferior + oblíquos. Alta ativação.', tag:'eq' },
    { name:'Dragon Flag (banco)',              icon:'🐉', meta:'4×6–10 · 60s',  why:'Avançado. Core total com foco no reto inferior.', tag:'alt' },
  ],
  'Prancha (progressão de tempo)':[
    { name:'Prancha com Elevação de Perna',    icon:'💪', meta:'4×20–30s · 40s', why:'Progressão natural da prancha. Maior instabilidade = mais core.', tag:'alt' },
    { name:'Dead Bug',                         icon:'🐛', meta:'4×10 · 40s',    why:'Sem equipamento. Excelente para core profundo e controle lombar.', tag:'eq' },
    { name:'Roda Abdominal (Ab Wheel)',        icon:'🔘', meta:'4×8–10 · 50s',  why:'Versão avançada em movimento. Core completo.', tag:'alt' },
  ],
  'Rosca Inversa (Barra ou Halter)':[
    { name:'Rosca Inversa no Cabo',            icon:'🔗', meta:'3×12–15 · 45s', why:'Resistência constante via cabo. Melhor estímulo que halter livre.', tag:'alt' },
    { name:"Farmer's Walk",                    icon:'🏋️', meta:'3×30m · 45s',   why:'Agarre máximo, antebraço completo.', tag:'eq' },
  ],
  'Flexão de Punho (Barra ou Dumbbell)':[
    { name:'Flexão de Punho com Cabo',         icon:'🔗', meta:'3×15–20 · 45s', why:'Tensão mais uniforme via cabo.', tag:'sim' },
    { name:'Hang Grip na Barra Fixa',          icon:'🤸', meta:'3×30–60s · 45s', why:'Sem equipamento extra. Suspensão isométrica = agarre forte.', tag:'eq' },
  ],
  'Encolhimento (Halter)':[
    { name:'Encolhimento com Barra',           icon:'🏋️', meta:'3×12–15 · 60s', why:'Permite mais carga que halter. Mesma execução.', tag:'sim' },
    { name:'Encolhimento na Máquina Smith',    icon:'🦾', meta:'3×12–15 · 60s', why:'Guiado e estável.', tag:'sim' },
    { name:'Encolhimento no Cabo (unilateral)',icon:'🔗', meta:'3×12–15 · 60s', why:'Tensão constante e trabalho unilateral para corrigir assimetrias.', tag:'alt' },
  ],
  'Rotação Russa (com peso)':[
    { name:'Rotação Russa com Cabo',           icon:'🔗', meta:'3×12–16 · 40s', why:'Resistência constante durante o movimento rotacional.', tag:'alt' },
    { name:'Prancha Lateral',                  icon:'💪', meta:'3×30–45s · 40s', why:'Sem equipamento. Oblíquos em isométrico.', tag:'eq' },
  ],
  'Esteira':[
    { name:'Bicicleta Ergométrica',            icon:'🚲', meta:'1×20 min',      why:'Mesmo volume. Baixo impacto. Boa opção para dores no joelho.', tag:'sim' },
    { name:'Elíptico',                         icon:'🏃', meta:'1×20 min',      why:'Impacto zero. Corpo inteiro.', tag:'sim' },
    { name:'Caminhada ao Ar Livre',            icon:'🌳', meta:'1×20–30 min',   why:'Sem academia. Caminhada a 60–70% FCmax.', tag:'eq' },
  ],
};

/* ─── TRAINING DATA ─── */
const DAYS = [
  { dia:"SEG", full:"Segunda-Feira", main:["Peito","Tríceps"], sub:["Ombro","Panturrilha","Abdômen"],
    sections:[
      { title:"Peito", ex:[
        { name:"Supino Inclinado (Máquina)",    ser:4, reps:"10–12", tag:"v", rest:90, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4-5 reps. Foco peitoral superior." },
        { name:"Supino Sentado (Máquina)",      ser:4, reps:"10–12", tag:"v", rest:90, int:"drop", note:"Última série Drop Set: falha → −35% → falha. Peitoral médio." },
        { name:"Crucifixo no Voador (Máquina)", ser:3, reps:"12–15", tag:"v", rest:60, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4 reps. Segure 1s no fechamento." },
        { name:"Crucifixo na Polia",            ser:3, reps:"12–15", tag:"v", rest:60, int:null,   note:null },
      ]},
      { title:"Tríceps", ex:[
        { name:"Máquina de Fundos Sentado", ser:3, reps:"10–12", tag:"v", rest:60, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4 reps." },
        { name:"Tríceps Polia com Corda",   ser:3, reps:"12–15", tag:"v", rest:60, int:"drop", note:"Última série Drop Set: falha → −30% → falha. Abra a corda no final." },
        { name:"Tríceps Polia Barra Reta",  ser:3, reps:"12–15", tag:"v", rest:60, int:null,   note:null },
      ]},
      { title:"Ombro", ex:[
        { name:"Desenvolvimento (Máquina)",              ser:3, reps:"10–12", tag:"g", rest:75, int:"rp", note:"Press PRIMEIRO — músculo fresco. Última série Rest-Pause: falha → 15s → +3-4 reps." },
        { name:"Elevação Lateral no Cabo (Unilateral)",  ser:3, reps:"12–15", tag:"g", rest:0,  int:"bi", note:"Bi-Set: vai DIRETO para Elevação Frontal.", biPair:true },
        { name:"Elevação Frontal (Halter)",              ser:3, reps:"12–15", tag:"g", rest:75, int:"bi", note:"2° do Bi-Set — descanse 75s após.", biPair:false },
      ]},
      { title:"Panturrilha", ex:[
        { name:"Elevação de Panturrilha em Pé (Máquina)", ser:4, reps:"12–15", tag:"a", rest:45, int:"rp", note:"Gastrocnêmio. Desça até o alongamento total. Última série Rest-Pause: falha → 15s → +4 reps." },
      ]},
      { title:"Abdômen", ex:[
        { name:"Crunch na Polia (com carga)", ser:4, reps:"10–15", tag:"a", rest:45, int:"rp", note:"Reto abdominal com carga. Última série Rest-Pause. PROGRIDA O PESO." },
      ]},
      { title:"Cardio", ex:[{ name:"Esteira", ser:1, reps:"20 min", tag:"g", rest:0, int:null, note:null }]},
    ],
  },
  { dia:"TER", full:"Terça-Feira", main:["Costas","Bíceps"], sub:["Ombro Post.","Antebraço","Abdômen"],
    sections:[
      { title:"Costas", ex:[
        { name:"Puxada Alta na Polia",          ser:4, reps:"10–12", tag:"v", rest:90, int:"drop", note:"Última série Drop Set: falha → −30% → falha. Cotovelo ao quadril." },
        { name:"Puxada Triângulo (Polia)",      ser:3, reps:"10–12", tag:"v", rest:90, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4-5 reps." },
        { name:"Remada Iso-Lateral (Máquina)",  ser:4, reps:"10–12", tag:"v", rest:90, int:"drop", note:"Última série Drop Set: falha → −30% → falha. Retraia a escápula." },
        { name:"Remada Sentada Pegada em V",    ser:3, reps:"12",    tag:"v", rest:90, int:null,   note:null },
      ]},
      { title:"Bíceps — Superset", ex:[
        { name:"Rosca Direta (Máquina)",   ser:3, reps:"10–12", tag:"v", rest:0,  int:"ss", note:"Superset: vai DIRETO para Rosca Martelo.", biPair:true },
        { name:"Rosca Martelo Alternada",  ser:3, reps:"12",    tag:"v", rest:60, int:"ss", note:"2° Superset — descanse 60s após.",         biPair:false },
        { name:"Rosca Scott (Máquina)",    ser:3, reps:"10–12", tag:"v", rest:60, int:"drop", note:"Última série Drop Set: falha → −35% → falha. Pico de bíceps." },
      ]},
      { title:"Ombro Posterior", ex:[
        { name:"Crucifixo Inverso no Cabo (bilateral)", ser:4, reps:"12–15", tag:"g", rest:60, int:"drop", note:"Último Drop Set: falha → −30% → falha. Retrai escápulas." },
      ]},
      { title:"Antebraço", ex:[
        { name:"Rosca Inversa (Barra ou Halter)",     ser:3, reps:"12–15", tag:"a", rest:45, int:null, note:null },
        { name:"Flexão de Punho (Barra ou Dumbbell)", ser:3, reps:"15–20", tag:"a", rest:45, int:null, note:null },
      ]},
      { title:"Trapézio & Abdômen", ex:[
        { name:"Encolhimento (Halter)",    ser:3, reps:"12–15", tag:"v", rest:60, int:"drop", note:"Última série Drop Set: falha → −30% → +8-10 reps." },
        { name:"Rotação Russa (com peso)", ser:3, reps:"12–16", tag:"a", rest:40, int:null,   note:"Oblíquo. Segure 1s de cada lado." },
      ]},
      { title:"Cardio", ex:[{ name:"Esteira", ser:1, reps:"20 min", tag:"g", rest:0, int:null, note:null }]},
    ],
  },
  { dia:"QUA", full:"Quarta-Feira", main:["Pernas"], sub:["Quad","Posterior","Panturrilha","Abdômen"],
    sections:[
      { title:"Pernas — Quad / Posterior", ex:[
        { name:"Leg Press Horizontal (Máquina)",  ser:4, reps:"12–15", tag:"v", rest:90, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4-5 reps. Foco quadríceps." },
        { name:"Agachamento Pêndulo (Máquina)",   ser:4, reps:"10–12", tag:"v", rest:90, int:"drop", note:"Última série Drop Set: falha → −30% → falha. Desça até 90°." },
        { name:"Cadeira Extensora (Máquina)",     ser:3, reps:"12–15", tag:"v", rest:60, int:null,   note:null },
        { name:"Cadeira Flexora (Máquina)",       ser:3, reps:"12–15", tag:"v", rest:60, int:null,   note:null },
        { name:"Stiff (Máquina ou Halter)",       ser:4, reps:"12–15", tag:"v", rest:75, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4 reps. Sinta o alongamento. PROGRIDA CARGA." },
      ]},
      { title:"Acessórios", ex:[
        { name:"Cadeira Adutora", ser:3, reps:"15", tag:"v", rest:60, int:null, note:null },
      ]},
      { title:"Panturrilha", ex:[
        { name:"Elevação de Panturrilha em Pé (Leg Press ou Máquina)", ser:4, reps:"12–15", tag:"a", rest:45, int:"rp",   note:"Gastrocnêmio. Última série Rest-Pause." },
        { name:"Elevação de Panturrilha Sentado (Máquina)",             ser:4, reps:"15–20", tag:"a", rest:45, int:"drop", note:"Sóleo. Última série Drop Set: falha → −30% → mais 10-15 reps." },
      ]},
      { title:"Abdômen", ex:[
        { name:"Elevação de Pernas (na barra ou banco)", ser:4, reps:"12–15", tag:"a", rest:45, int:null, note:"Reto inferior. Controle a descida." },
      ]},
      { title:"Cardio", ex:[{ name:"Esteira", ser:1, reps:"20 min", tag:"g", rest:0, int:null, note:null }]},
    ],
  },
  { dia:"QUI", full:"Quinta-Feira", main:["Peito","Tríceps"], sub:["Ombro","Abdômen"],
    sections:[
      { title:"Peito", ex:[
        { name:"Supino Inclinado (Máquina)",    ser:4, reps:"10–12", tag:"v", rest:90, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4-5 reps." },
        { name:"Supino Sentado (Máquina)",      ser:4, reps:"10–12", tag:"v", rest:90, int:"drop", note:"Última série Drop Set: falha → −35% → falha." },
        { name:"Crucifixo no Voador (Máquina)", ser:3, reps:"12–15", tag:"v", rest:60, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4 reps. Segure 1s." },
        { name:"Crucifixo na Polia",            ser:3, reps:"12–15", tag:"v", rest:60, int:null,   note:null },
      ]},
      { title:"Tríceps", ex:[
        { name:"Máquina de Fundos Sentado", ser:3, reps:"10–12", tag:"v", rest:60, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4 reps." },
        { name:"Tríceps Polia com Corda",   ser:3, reps:"12–15", tag:"v", rest:60, int:"drop", note:"Última série Drop Set: falha → −30% → falha. Abra a corda." },
        { name:"Tríceps Polia Barra Reta",  ser:3, reps:"12–15", tag:"v", rest:60, int:null,   note:null },
      ]},
      { title:"Ombro", ex:[
        { name:"Desenvolvimento (Máquina)",              ser:3, reps:"10–12", tag:"g", rest:75, int:"rp", note:"Press PRIMEIRO. Última série Rest-Pause: falha → 15s → +3-4 reps." },
        { name:"Elevação Lateral no Cabo (Unilateral)",  ser:3, reps:"12–15", tag:"g", rest:0,  int:"bi", note:"Bi-Set: vai DIRETO para Elevação Frontal.", biPair:true },
        { name:"Elevação Frontal (Halter)",              ser:3, reps:"12–15", tag:"g", rest:75, int:"bi", note:"2° do Bi-Set — descanse 75s após.", biPair:false },
      ]},
      { title:"Abdômen", ex:[
        { name:"Prancha (progressão de tempo)", ser:4, reps:"30–60s", tag:"a", rest:40, int:null, note:"Core profundo. Aumente 5s por semana. Quadril neutro." },
      ]},
      { title:"Cardio", ex:[{ name:"Esteira", ser:1, reps:"20 min", tag:"g", rest:0, int:null, note:null }]},
    ],
  },
  { dia:"SEX", full:"Sexta-Feira", main:["Costas","Bíceps"], sub:["Ombro Post.","Antebraço","Panturrilha"],
    sections:[
      { title:"Costas", ex:[
        { name:"Puxada Alta na Polia",         ser:4, reps:"10–12", tag:"v", rest:90, int:"drop", note:"Última série Drop Set: falha → −30% → falha. Cotovelo ao quadril." },
        { name:"Puxada Triângulo (Polia)",     ser:3, reps:"10–12", tag:"v", rest:90, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4-5 reps." },
        { name:"Remada Iso-Lateral (Máquina)", ser:4, reps:"10–12", tag:"v", rest:90, int:"drop", note:"Última série Drop Set: falha → −30% → falha. Retraia a escápula." },
        { name:"Remada Sentada Pegada em V",   ser:3, reps:"12",    tag:"v", rest:90, int:null,   note:null },
      ]},
      { title:"Bíceps — Superset", ex:[
        { name:"Rosca Direta (Máquina)",  ser:3, reps:"10–12", tag:"v", rest:0,  int:"ss", note:"Superset: vai DIRETO para Rosca Martelo.", biPair:true },
        { name:"Rosca Martelo Alternada", ser:3, reps:"12",    tag:"v", rest:60, int:"ss", note:"2° Superset — descanse 60s após.",         biPair:false },
        { name:"Rosca Scott (Máquina)",   ser:3, reps:"10–12", tag:"v", rest:60, int:"drop", note:"Última série Drop Set: falha → −35% → falha. Pico de bíceps." },
      ]},
      { title:"Ombro Posterior", ex:[
        { name:"Crucifixo Inverso no Cabo (bilateral)", ser:4, reps:"12–15", tag:"g", rest:60, int:"drop", note:"Último Drop Set: falha → −30% → falha. Retrai escápulas." },
      ]},
      { title:"Antebraço", ex:[
        { name:"Rosca Inversa (Barra ou Halter)",     ser:3, reps:"12–15", tag:"a", rest:45, int:null, note:null },
        { name:"Flexão de Punho (Barra ou Dumbbell)", ser:3, reps:"15–20", tag:"a", rest:45, int:null, note:null },
      ]},
      { title:"Panturrilha", ex:[
        { name:"Elevação de Panturrilha em Pé (Máquina)", ser:4, reps:"12–15", tag:"a", rest:45, int:"rp", note:"Gastrocnêmio. Última série Rest-Pause: falha → 15s → +4 reps." },
      ]},
      { title:"Trapézio & Abdômen", ex:[
        { name:"Encolhimento (Halter)",    ser:3, reps:"12–15", tag:"v", rest:60, int:"drop", note:"Última série Drop Set: falha → −30% → +8-10 reps." },
        { name:"Rotação Russa (com peso)", ser:3, reps:"12–16", tag:"a", rest:40, int:null,   note:"Oblíquo. Segure 1s de cada lado." },
      ]},
      { title:"Cardio", ex:[{ name:"Esteira", ser:1, reps:"20 min", tag:"g", rest:0, int:null, note:null }]},
    ],
  },
  { dia:"SÁB", full:"Sábado", main:["Pernas"], sub:["Quad","Posterior","Panturrilha","Abdômen"],
    sections:[
      { title:"Pernas — Quad / Posterior", ex:[
        { name:"Leg Press Horizontal (Máquina)",  ser:4, reps:"12–15", tag:"v", rest:90, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4-5 reps. Foco quadríceps." },
        { name:"Agachamento Pêndulo (Máquina)",   ser:4, reps:"10–12", tag:"v", rest:90, int:"drop", note:"Última série Drop Set: falha → −30% → falha. Controle a descida!" },
        { name:"Cadeira Extensora (Máquina)",     ser:3, reps:"12–15", tag:"v", rest:60, int:null,   note:null },
        { name:"Cadeira Flexora (Máquina)",       ser:3, reps:"12–15", tag:"v", rest:60, int:null,   note:null },
        { name:"Stiff (Máquina ou Halter)",       ser:4, reps:"12–15", tag:"v", rest:75, int:"rp",   note:"Última série Rest-Pause: falha → 15s → +4 reps. PROGRIDA A CARGA toda semana." },
      ]},
      { title:"Panturrilha", ex:[
        { name:"Elevação de Panturrilha em Pé (Leg Press ou Máquina)", ser:4, reps:"12–15", tag:"a", rest:45, int:"rp",   note:"Gastrocnêmio. Última série Rest-Pause: falha → 15s → +4 reps." },
        { name:"Elevação de Panturrilha Sentado (Máquina)",             ser:4, reps:"15–20", tag:"a", rest:45, int:"drop", note:"Sóleo. Última série Drop Set: falha → −30% → mais 10-15 reps." },
      ]},
      { title:"Abdômen", ex:[
        { name:"Crunch na Polia (com carga)",            ser:4, reps:"10–15", tag:"a", rest:45, int:"rp",  note:"Reto abdominal com carga. Última série Rest-Pause. PROGRIDA O PESO." },
        { name:"Elevação de Pernas (na barra ou banco)", ser:4, reps:"12–15", tag:"a", rest:45, int:null,  note:"Reto inferior. Controle a descida." },
        { name:"Prancha (progressão de tempo)",          ser:3, reps:"45–60s", tag:"a", rest:40, int:null, note:"Core total. Aumente 5s por semana." },
      ]},
      { title:"Cardio", ex:[{ name:"Esteira", ser:1, reps:"20 min", tag:"g", rest:0, int:null, note:null }]},
    ],
  },
];

/* ─── HELPERS ─── */
const fmtTime = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const dKey    = (d,si,ei)=>`${d}-${si}-${ei}`;
const serKey  = (d,si,ei,sn)=>`${d}-${si}-${ei}-s${sn}`;
const getTot  = di=>DAYS[di].sections.reduce((a,s)=>a+s.ex.length,0);
const getDone = (di,done)=>{ let c=0; DAYS[di].sections.forEach((s,si)=>s.ex.forEach((_,ei)=>{if(done[dKey(di,si,ei)])c++;})); return c; };
const getEff  = (day,si,ei,swaps)=>swaps[day]?.[si]?.[ei]||DAYS[day].sections[si].ex[ei];

function buildFlat(dayIdx,swaps){
  const flat=[];
  DAYS[dayIdx].sections.forEach((sec,si)=>{
    let i=0;
    while(i<sec.ex.length){
      const e=getEff(dayIdx,si,i,swaps);
      const isFirst=(e.int==="bi"||e.int==="ss")&&e.biPair===true&&i+1<sec.ex.length;
      if(isFirst){
        const e2=getEff(dayIdx,si,i+1,swaps);
        const s1=Number(e.ser)||1,s2=Number(e2.ser)||1;
        for(let s=1;s<=Math.max(s1,s2);s++){
          if(s<=s1)flat.push({si,ei:i,  sn:s,st:s1,ex:e, role:"first"});
          if(s<=s2)flat.push({si,ei:i+1,sn:s,st:s2,ex:e2,role:"second"});
        }
        i+=2;
      } else {
        const st=Number(e.ser)||1;
        for(let s=1;s<=st;s++) flat.push({si,ei:i,sn:s,st,ex:e,role:null});
        i++;
      }
    }
  });
  return flat;
}

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  body{font-family:'Nunito',sans-serif;background:#0b0d15;}
  ::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:#1f2235;border-radius:3px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes popIn{0%{opacity:0;transform:scale(.92) translateY(18px)}70%{transform:scale(1.02)}100%{opacity:1;transform:scale(1)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}
  .fu{animation:fadeUp .3s ease both;}.pi{animation:popIn .32s cubic-bezier(.34,1.56,.64,1) both;}.su{animation:slideUp .3s cubic-bezier(.22,1,.36,1) both;}
`;

/* ─── SWAP SHEET ─── */
const TAG_LABELS={sim:"Similar",alt:"Variação",eq:"Sem Máquina"};
const TAG_COLORS={sim:{bg:"rgba(22,163,74,0.1)",color:"#16a34a"},alt:{bg:"rgba(59,130,246,0.1)",color:"#3b82f6"},eq:{bg:"rgba(249,115,22,0.1)",color:"#f97316"}};

function SwapSheet({day,si,ei,swaps,onApply,onRestore,onClose}){
  const origEx=DAYS[day].sections[si].ex[ei];
  const origName=origEx.name;
  const alts=SWAPS[origName]||[];
  const isSwapped=!!swaps[day]?.[si]?.[ei];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div className="su" onClick={e=>e.stopPropagation()} style={{background:"#12141f",borderRadius:"24px 24px 0 0",width:"min(480px,100%)",maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 -16px 60px rgba(0,0,0,0.5)",paddingBottom:"env(safe-area-inset-bottom,12px)"}}>
        <div style={{width:36,height:4,background:"#2a2d42",borderRadius:2,margin:"12px auto 0"}}/>
        <div style={{padding:"14px 20px 12px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontWeight:900,fontSize:"1rem",color:T.text}}>🔄 Trocar Exercício</span>
            <button onClick={onClose} style={{background:"#1f2235",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:"0.85rem",color:T.muted}}>✕</button>
          </div>
          <div style={{fontSize:"0.72rem",color:T.muted}}>Substituindo: <strong style={{color:T.text}}>{origName}</strong></div>
          {isSwapped&&<button onClick={onRestore} style={{marginTop:8,padding:"6px 14px",borderRadius:10,background:"rgba(34,197,94,0.1)",border:`1px solid rgba(34,197,94,0.22)`,color:T.accent,fontWeight:700,fontSize:"0.75rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>↩ Restaurar original</button>}
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {alts.length===0?(
            <div style={{padding:"32px 20px",textAlign:"center",color:T.faint}}><div style={{fontSize:"2rem",marginBottom:8}}>🤷</div><div style={{fontSize:"0.82rem"}}>Nenhuma alternativa cadastrada para este exercício.</div></div>
          ):alts.map((a,ai)=>{
            const tc=TAG_COLORS[a.tag]||TAG_COLORS.sim;
            return(
              <div key={ai} onClick={()=>onApply(ai)} style={{display:"flex",gap:14,padding:"14px 20px",borderBottom:`1px solid ${T.border}`,cursor:"pointer",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#191b29"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <div style={{fontSize:"1.6rem",flexShrink:0,lineHeight:1,marginTop:2}}>{a.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:"0.88rem",color:T.text,marginBottom:4}}>{a.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",color:T.muted}}>{a.meta}</span>
                    <span style={{padding:"1px 8px",borderRadius:20,fontSize:"0.58rem",fontWeight:700,background:tc.bg,color:tc.color,letterSpacing:"0.04em"}}>{TAG_LABELS[a.tag]}</span>
                  </div>
                  <div style={{fontSize:"0.72rem",color:T.muted,lineHeight:1.5}}>{a.why}</div>
                </div>
                <div style={{color:T.faint,fontSize:"1rem",alignSelf:"center",flexShrink:0}}>›</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── COMPONENTS ─── */
function IntBadge({type,small}){
  if(!type||!INT_CFG[type])return null;
  const c=INT_CFG[type];
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:small?"1px 7px":"2px 9px",borderRadius:20,background:c.bg,color:c.color,fontSize:small?"0.58rem":"0.6rem",fontWeight:700,letterSpacing:"0.04em",fontFamily:"'JetBrains Mono',monospace",border:`1px solid ${c.border}`,whiteSpace:"nowrap"}}>{c.icon} {c.label}</span>;
}

function Card({ex,si,ei,di,done,onToggle,onSwap,swapped}){
  const k=dKey(di,si,ei),isDone=!!done[k],[open,setOpen]=useState(false);
  return(
    <div style={{background:isDone?"rgba(34,197,94,0.05)":T.card,border:`1px solid ${isDone?"rgba(34,197,94,0.2)":T.border}`,borderRadius:14,position:"relative",overflow:"hidden",transition:"all .2s",opacity:isDone?.55:1}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:isDone?T.accent:(ex.int&&INT_CFG[ex.int]?INT_CFG[ex.int].color:"#e5e7eb"),borderRadius:"14px 0 0 14px"}}/>
      {swapped&&<div style={{position:"absolute",top:6,right:8,fontSize:"0.55rem",color:T.accent,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.04em",opacity:.7}}>🔄 trocado</div>}
      <div onClick={()=>onToggle(si,ei)} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"13px 14px 13px 18px",cursor:"pointer",userSelect:"none"}}>
        <div style={{width:20,height:20,borderRadius:7,border:`1.5px solid ${isDone?T.accent:"#3a3d58"}`,background:isDone?T.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all .2s"}}>
          {isDone&&<span style={{color:"#fff",fontSize:"0.65rem",fontWeight:900}}>✓</span>}
        </div>
        <div style={{flex:1,minWidth:0,paddingRight:swapped?44:0}}>
          <div style={{fontWeight:700,fontSize:"0.87rem",color:isDone?T.muted:T.text,textDecoration:isDone?"line-through":"none",lineHeight:1.3,marginBottom:5}}>{ex.name}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,alignItems:"center"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.68rem",color:T.muted}}>{ex.ser}× {ex.reps}</span>
            {ex.rest>0&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.65rem",color:T.faint}}>⏱{Math.floor(ex.rest/60)>0?`${Math.floor(ex.rest/60)}min`:""}{ex.rest%60>0?` ${ex.rest%60}s`:""}</span>}
            {ex.int&&<IntBadge type={ex.int} small/>}
          </div>
          {ex.note&&ex.int&&(<>
            <div onClick={e=>{e.stopPropagation();setOpen(v=>!v)}} style={{marginTop:6,fontSize:"0.68rem",color:INT_CFG[ex.int]?.color,cursor:"pointer",fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}>{open?"▲ Ocultar":"▼ Ver técnica"}</div>
            {open&&<div style={{marginTop:7,padding:"9px 11px",background:INT_CFG[ex.int]?.bg,borderRadius:9,fontSize:"0.73rem",color:T.text,lineHeight:1.55,border:`1px solid ${INT_CFG[ex.int]?.color}22`}}>{ex.note}</div>}
          </>)}
        </div>
      </div>
      <div style={{borderTop:`1px solid ${T.border}`,padding:"7px 14px 9px 18px",display:"flex",justifyContent:"flex-end"}}>
        <button onClick={e=>{e.stopPropagation();onSwap(si,ei)}} style={{padding:"4px 12px",borderRadius:8,background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.2)",color:"#3b82f6",fontWeight:700,fontSize:"0.65rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:5}}>🔄 Substituir</button>
      </div>
    </div>
  );
}

function GroupCard({exA,exB,si,di,done,onToggle,onSwap,swapsMap}){
  const cfg=INT_CFG[exA.int]||{};
  return(
    <div style={{border:`1px solid ${cfg.color}33`,borderRadius:14,overflow:"hidden"}}>
      <div style={{padding:"6px 13px",background:cfg.bg,fontSize:"0.6rem",fontWeight:800,letterSpacing:"0.07em",color:cfg.color,display:"flex",alignItems:"center",gap:5,fontFamily:"'JetBrains Mono',monospace"}}>{cfg.icon} {cfg.label} — sem pausa</div>
      <div style={{padding:"7px",display:"flex",flexDirection:"column",gap:5,background:"#0f1119"}}>
        <Card ex={exA} si={si} ei={exA._ei} di={di} done={done} onToggle={onToggle} onSwap={onSwap} swapped={!!swapsMap[di]?.[si]?.[exA._ei]}/>
        <Card ex={exB} si={si} ei={exB._ei} di={di} done={done} onToggle={onToggle} onSwap={onSwap} swapped={!!swapsMap[di]?.[si]?.[exB._ei]}/>
      </div>
    </div>
  );
}

function RestModal({seconds,onClose}){
  const [rem,setRem]=useState(seconds),[paused,setPaused]=useState(false),ref=useRef(null);
  const CIRC=2*Math.PI*52,dash=CIRC*(rem/seconds);
  useEffect(()=>{if(paused||rem<=0)return;ref.current=setInterval(()=>setRem(r=>r-1),1000);return()=>clearInterval(ref.current);},[paused,rem]);
  useEffect(()=>{if(rem<=0)onClose();},[rem]);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",backdropFilter:"blur(10px)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="pi" style={{background:"#12141f",borderRadius:24,padding:"28px 24px",width:"min(340px,100%)",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
        <div style={{fontSize:"0.6rem",fontWeight:800,letterSpacing:"0.12em",color:T.faint,marginBottom:16,textTransform:"uppercase"}}>⏱ Descansando</div>
        <div style={{position:"relative",width:128,height:128,margin:"0 auto 22px"}}>
          <svg width="128" height="128" viewBox="0 0 128 128" style={{transform:"rotate(-90deg)"}}>
            <circle cx="64" cy="64" r="52" fill="none" stroke="#1f2235" strokeWidth="5"/>
            <circle cx="64" cy="64" r="52" fill="none" stroke={T.accent} strokeWidth="5" strokeDasharray={`${dash} ${CIRC}`} strokeLinecap="round" style={{transition:"stroke-dasharray 1s linear"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"2rem",fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:T.text,lineHeight:1}}>{fmtTime(rem)}</span>
            <span style={{fontSize:"0.55rem",color:T.faint,marginTop:3,fontWeight:700,letterSpacing:"0.08em"}}>{paused?"PAUSADO":"RESTANTE"}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <button onClick={()=>setPaused(p=>!p)} style={{flex:1,padding:"11px 0",borderRadius:12,background:paused?T.accent:"#1a1d2e",color:paused?"#fff":T.muted,border:"none",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif",transition:"all .2s"}}>{paused?"▶ Retomar":"⏸ Pausar"}</button>
          <button onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:12,background:"#1a1d2e",color:T.muted,border:"none",fontWeight:700,fontSize:"0.82rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Pular ⏭</button>
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"10px 0",borderRadius:12,background:"transparent",color:T.faint,border:`1px solid ${T.border}`,fontWeight:600,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Fechar</button>
      </div>
    </div>
  );
}

/* ─── GUIDED MODE ─── */
function Overlay({children}){ return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(6px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div className="pi" style={{background:"#12141f",borderRadius:24,width:"min(420px,100%)",padding:"0 22px 20px",boxShadow:"0 24px 80px rgba(0,0,0,0.6)",maxHeight:"92vh",overflowY:"auto"}}>{children}</div></div>); }
function ProgBar({pct}){ return(<div style={{position:"sticky",top:0,height:3,background:"#1f2235",borderRadius:"24px 24px 0 0",overflow:"hidden",margin:"0 -22px 0",zIndex:1}}><div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#16a34a,#22c55e)",transition:"width .4s"}}/></div>); }
function Phase({children}){ return(<div style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:T.faint,margin:"16px 0 6px",textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>{children}</div>); }
function GName({children,style}){ return(<div style={{fontWeight:900,fontSize:"1.25rem",color:T.text,textAlign:"center",lineHeight:1.25,marginBottom:5,...style}}>{children}</div>); }
function CtaBtn({children,primary,skip,ghost,onClick,style}){ return(<button onClick={onClick} style={{width:"100%",padding:skip||ghost?"10px 0":"14px 0",border:"none",borderRadius:14,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800,letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:7,transition:"all .2s",...(primary?{background:"linear-gradient(135deg,#16a34a,#22c55e)",color:"#fff",fontSize:"0.95rem",boxShadow:"0 4px 18px rgba(34,197,94,0.25)"}:skip?{background:"transparent",border:`1px solid ${T.border}`,color:T.muted,fontSize:"0.72rem"}:ghost?{background:"transparent",color:T.faint,fontSize:"0.68rem",letterSpacing:"0.03em"}:{background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.text,fontSize:"0.88rem"}),...style}}>{children}</button>); }

function GuidedMode({day,workoutSec,flat,serDone,swaps,onMarkSerie,onClose,onFinish,onSwap}){
  const initIdx=()=>{ let i=0; while(i<flat.length){const it=flat[i];if(!serDone[serKey(day,it.si,it.ei,it.sn)])break;i++;}return Math.min(i,flat.length); };
  const [phase,setPhase]=useState(()=>{ const i=initIdx(); return i>=flat.length?"end":"doing"; });
  const [idx,setIdx]=useState(initIdx);
  const [lastRest,setLastRest]=useState(0),[lastItem,setLastItem]=useState(null);
  const [restLeft,setRestLeft]=useState(0),[restTotal,setRestTotal]=useState(0);
  const [restPaused,setRestPaused]=useState(false),[restDone,setRestDone]=useState(false);
  const [queueOpen,setQueueOpen]=useState(false);
  const restRef=useRef(null);
  const CIRC=2*Math.PI*70;

  useEffect(()=>()=>clearInterval(restRef.current),[]);

  const startRest=useCallback(sec=>{
    clearInterval(restRef.current);
    setRestLeft(sec);setRestTotal(sec);setRestDone(false);setRestPaused(false);
    setTimeout(()=>{
      restRef.current=setInterval(()=>setRestLeft(p=>{ if(p<=1){clearInterval(restRef.current);setRestDone(true);setRestPaused(false);return 0;}return p-1;}),1000);
    },300);
  },[]);

  const pauseRest=()=>{clearInterval(restRef.current);setRestPaused(true);};
  const resumeRest=()=>{
    if(restLeft<=0)return;setRestPaused(false);
    restRef.current=setInterval(()=>setRestLeft(p=>{if(p<=1){clearInterval(restRef.current);setRestDone(true);setRestPaused(false);return 0;}return p-1;}),1000);
  };
  const toggleRest=()=>restPaused?resumeRest():pauseRest();

  useEffect(()=>{
    if(restDone&&phase==="resting"){ const t=setTimeout(()=>{ if(idx<flat.length)setPhase("doing");else{setPhase("end");onFinish();}},1400);return()=>clearTimeout(t);}
  },[restDone,phase]);

  const serieCompleted=()=>{
    const item=flat[idx];if(!item)return;
    onMarkSerie(day,item.si,item.ei,item.sn);
    if(item.role==="first"){setIdx(idx+1);setPhase("doing");return;}
    let next=idx+1;
    while(next<flat.length){const it=flat[next];if(!serDone[serKey(day,it.si,it.ei,it.sn)])break;next++;}
    if(next>=flat.length){setPhase("end");onFinish();return;}
    setLastItem(item);setLastRest(item.ex.rest);setIdx(next);
    if(item.ex.rest>0){setPhase("resting");startRest(item.ex.rest);}else setPhase("doing");
  };

  const skipSerie=()=>{ let next=idx+1;while(next<flat.length){const it=flat[next];if(!serDone[serKey(day,it.si,it.ei,it.sn)])break;next++;}setIdx(next);setPhase("doing");clearInterval(restRef.current); };
  const skipRest=()=>{ clearInterval(restRef.current);setRestDone(false);if(idx>=flat.length){setPhase("end");onFinish();return;}setPhase("doing"); };
  const jumpToIdx=ni=>{ clearInterval(restRef.current);setIdx(ni);setPhase("doing");setQueueOpen(false); };

  const total=flat.length,doneS=flat.filter(f=>serDone[serKey(day,f.si,f.ei,f.sn)]).length;
  const pct=total>0?Math.round(doneS/total*100):0;
  const nextLabel=()=>{ let n=idx;while(n<flat.length){const it=flat[n];if(!serDone[serKey(day,it.si,it.ei,it.sn)])return it.ex.name;n++;}return "Fim do treino 🏆"; };
  const qGroups=(()=>{ const g=[],s=new Set();flat.forEach((f,i)=>{const k=`${f.si}-${f.ei}`;if(!s.has(k)){s.add(k);const items=flat.map((x,xi)=>({...x,flatIdx:xi})).filter(x=>x.si===f.si&&x.ei===f.ei);g.push({key:k,name:f.ex.name,items});}});return g; })();

  const item=flat[idx];

  if(phase==="end") return(
    <Overlay><ProgBar pct={100}/>
      <div style={{textAlign:"center",padding:"24px 0 12px"}}>
        <div style={{fontSize:"3.5rem",marginBottom:10}}>🏆</div>
        <div style={{fontWeight:900,fontSize:"1.45rem",color:T.text,marginBottom:6}}>Treino Concluído!</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"1.1rem",color:T.accent,margin:"6px 0 10px"}}>{fmtTime(workoutSec)}</div>
        <div style={{fontSize:"0.82rem",color:T.muted,lineHeight:1.6}}>Missão cumprida, Alisson!<br/>Descanse bem e volte mais forte. 💪</div>
      </div>
      <CtaBtn primary onClick={onClose}>✓ Fechar</CtaBtn>
    </Overlay>
  );

  if(phase==="resting"){
    const ringOffset=CIRC*(restTotal>0?1-restLeft/restTotal:0);
    const urgent=restLeft<=10&&restLeft>0;
    const ringColor=restDone?T.rp:urgent?T.drop:T.accent;
    const serCtx=lastItem?(lastItem.role==="second"?`${INT_CFG[lastItem.ex.int]?.label||"Bi-Set"} · Série ${lastItem.sn}/${lastItem.st} concluída`:`Série ${lastItem.sn} de ${lastItem.st} concluída`):"Série concluída";
    return(
      <Overlay><ProgBar pct={pct}/>
        <Phase>⏱ Descanso · {serCtx}</Phase>
        <GName style={{marginBottom:4}}>Recuperando...</GName>
        <div style={{textAlign:"center",fontSize:"0.78rem",color:T.muted,marginBottom:16,fontFamily:"'JetBrains Mono',monospace"}}>Próximo: <span style={{color:T.accent,fontWeight:700}}>{nextLabel()}</span></div>
        <div style={{position:"relative",width:160,height:160,margin:"0 auto 16px"}}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{transform:"rotate(-90deg)"}}>
            <circle cx="80" cy="80" r="70" fill="none" stroke="#1f2235" strokeWidth="8"/>
            <circle cx="80" cy="80" r="70" fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={ringOffset} style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"2.4rem",fontWeight:900,color:restDone?T.rp:urgent?T.drop:T.text,lineHeight:1,transition:"color .3s"}}>{fmtTime(restLeft)}</span>
            <span style={{fontSize:"0.55rem",color:T.faint,marginTop:4,fontWeight:700,letterSpacing:"0.1em"}}>{restDone?"CONCLUÍDO":restPaused?"PAUSADO":"DESCANSANDO"}</span>
          </div>
        </div>
        {restDone&&<div style={{textAlign:"center",fontSize:"0.88rem",fontWeight:700,color:T.accent,marginBottom:10}}>✅ Bora próxima série!</div>}
        {!restDone&&<CtaBtn onClick={toggleRest} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.text,marginBottom:8}}>{restPaused?"▶ Retomar":"⏸ Pausar"}</CtaBtn>}
        <CtaBtn skip onClick={skipRest}>⏭ Pular descanso</CtaBtn>
        <CtaBtn ghost onClick={onClose}>✕ Sair</CtaBtn>
      </Overlay>
    );
  }

  if(!item){onFinish();return null;}
  const ex=item.ex,isLast=item.sn===item.st,isFirst=item.role==="first",isSecond=item.role==="second";
  const isPaired=isFirst||isSecond,info=ex.int?INT_CFG[ex.int]:null;
  const serCtx=isPaired?`${info.label} · Passo ${isFirst?1:2}/2 · Série ${item.sn}/${item.st}`:`Série ${item.sn} de ${item.st} · ${doneS+1}/${total}`;
  const alwaysShow=ex.int==="bi"||ex.int==="ss";
  const showNote=info&&ex.note&&(alwaysShow||isLast);
  const notePrefix=(ex.int==="drop"||ex.int==="rp")&&isLast?`⚠️ ÚLTIMA SÉRIE — ${info.label}: `:`${info?.label}: `;
  const btnTxt=isFirst?`✅ Concluí → ${idx+1<flat.length?flat[idx+1].ex.name.split(" ")[0]:"FIM"}`:"✅ Série Concluída";
  const isSwapped=!!swaps[day]?.[item.si]?.[item.ei];

  return(
    <Overlay><ProgBar pct={pct}/>
      <Phase>{serCtx}</Phase>
      {isPaired&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"7px 12px",borderRadius:10,border:`1px solid ${info.border}`,background:info.bg}}><span style={{fontSize:"0.62rem",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",color:info.color,fontFamily:"'JetBrains Mono',monospace"}}>{info.icon} {info.label} · {isFirst?"1º — execute sem parar":"2º — depois descansa"}</span></div>}
      {isSwapped&&<div style={{textAlign:"center",fontSize:"0.6rem",color:T.accent,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.04em",marginBottom:6,opacity:.8}}>🔄 exercício trocado</div>}
      <GName>{ex.name}</GName>
      <div style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:"0.82rem",color:T.muted,letterSpacing:"0.05em",marginBottom:12}}><span style={{color:T.accent,fontWeight:900,fontSize:"1.15rem",fontFamily:"'Nunito',sans-serif"}}>{ex.reps}</span> repetições</div>
      {showNote&&<div style={{padding:"10px 12px",borderRadius:10,marginBottom:12,display:"flex",alignItems:"flex-start",gap:8,background:info.bg,border:`1px solid ${info.border}`}}><span style={{fontSize:"1.1rem",flexShrink:0}}>{info.icon}</span><div style={{fontSize:"0.72rem",lineHeight:1.5,color:T.text}}><strong style={{display:"block",fontSize:"0.7rem",letterSpacing:"0.04em",marginBottom:2,color:info.color}}>{notePrefix}</strong>{ex.note}</div></div>}
      <div style={{textAlign:"center",fontSize:"0.75rem",letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,marginBottom:4,fontFamily:"'JetBrains Mono',monospace"}}>💪 Execute agora</div>
      <div style={{textAlign:"center",fontSize:"2rem",margin:"4px 0 12px"}}>{isFirst?"1️⃣":isSecond?"2️⃣":"🏋️"}</div>
      <CtaBtn primary onClick={serieCompleted}>{btnTxt}</CtaBtn>
      <CtaBtn skip onClick={skipSerie}>↷ Pular esta série</CtaBtn>
      <button onClick={()=>onSwap(item.si,item.ei)} style={{width:"100%",padding:"10px 0",marginBottom:10,borderRadius:12,background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.2)",color:"#3b82f6",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif",letterSpacing:"0.03em"}}>🔄 Substituir exercício</button>
      <div style={{border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
        <button onClick={()=>setQueueOpen(v=>!v)} style={{width:"100%",padding:"10px 14px",background:"#191b29",border:"none",cursor:"pointer",textAlign:"left",fontSize:"0.63rem",fontWeight:700,letterSpacing:"0.08em",color:T.muted,textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>📋 Sequência · {pct}%</span><span style={{fontSize:"0.7rem"}}>{queueOpen?"▲":"▼"}</span>
        </button>
        {queueOpen&&<div style={{maxHeight:200,overflowY:"auto",background:"#12141f"}}>
          {qGroups.map(g=>{
            const isCur=g.items.some(f=>f.flatIdx===idx);
            return(<div key={g.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 14px",gap:10,borderBottom:`1px solid ${T.border}`,background:isCur?T.accentLight:"transparent"}}>
              <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"0.7rem",color:isCur?T.accent:T.muted,fontWeight:isCur?800:500}}>{g.name}</span>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                {g.items.map(f=>{const isDoneS=!!serDone[serKey(day,f.si,f.ei,f.sn)],isCurS=f.flatIdx===idx;return(<button key={f.flatIdx} onClick={()=>!isDoneS&&!isCurS&&jumpToIdx(f.flatIdx)} title={`Série ${f.sn}`} style={{width:11,height:11,borderRadius:"50%",border:"1.5px solid",padding:0,cursor:(!isDoneS&&!isCurS)?"pointer":"default",background:isDoneS?T.accent:"transparent",borderColor:isDoneS?T.accent:isCurS?T.accent:"#3a3d58",boxShadow:isCurS?`0 0 0 2px ${T.accentLight}`:"none",transition:"all .15s"}}/>);})}
              </div>
            </div>);
          })}
        </div>}
      </div>
      <CtaBtn ghost onClick={onClose}>✕ Sair do modo guiado</CtaBtn>
    </Overlay>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
export default function App(){
  const [day,     setDay]     = useState(0);
  const [done,    setDone]    = useState({});
  const [serDone, setSerDone] = useState({});
  const [running, setRunning] = useState(false);
  /* ── PERSISTENT TIMER ──
     Store the epoch timestamp (ms) when the workout started.
     elapsed = (Date.now() - startEpoch) / 1000
     This approach survives screen lock / background tab because we
     always compute from the real wall-clock difference, not a counter. */
  const [startEpoch, setStartEpoch] = useState(null);
  const [elapsed,    setElapsed]    = useState(0);
  const [rest,    setRest]    = useState(null);
  const [guided,  setGuided]  = useState(false);
  const [flat,    setFlat]    = useState([]);
  const [swaps,   setSwaps]   = useState({});
  const [swapSheet,setSwapSheet]=useState(null);
  const tickRef=useRef(null);

  const total=getTot(day),doneC=getDone(day,done),pct=total>0?Math.round(doneC/total*100):0,d=DAYS[day];

  /* Tick every second — reads from epoch, not accumulates */
  useEffect(()=>{
    if(!running||startEpoch===null){clearInterval(tickRef.current);return;}
    setElapsed(Math.floor((Date.now()-startEpoch)/1000));
    tickRef.current=setInterval(()=>setElapsed(Math.floor((Date.now()-startEpoch)/1000)),1000);
    return()=>clearInterval(tickRef.current);
  },[running,startEpoch]);

  /* Correct the display when tab/screen comes back into focus */
  useEffect(()=>{
    const h=()=>{ if(running&&startEpoch!==null&&document.visibilityState==="visible") setElapsed(Math.floor((Date.now()-startEpoch)/1000)); };
    document.addEventListener("visibilitychange",h);
    return()=>document.removeEventListener("visibilitychange",h);
  },[running,startEpoch]);

  const toggleDone=(si,ei)=>{
    const k=dKey(day,si,ei),wasNot=!done[k];
    setDone(p=>({...p,[k]:!p[k]}));
    if(wasNot){const ex=getEff(day,si,ei,swaps);if(ex.rest>0)setRest({seconds:ex.rest});}
  };
  const resetDay=()=>{
    const nd={...done},sd={...serDone};
    DAYS[day].sections.forEach((sec,si)=>sec.ex.forEach((_,ei)=>{delete nd[dKey(day,si,ei)];const st=Number(sec.ex[ei].ser)||1;for(let s=1;s<=st;s++)delete sd[serKey(day,si,ei,s)];}));
    setDone(nd);setSerDone(sd);
  };

  const openGuided=()=>{
    if(!running){setStartEpoch(Date.now());setRunning(true);}
    setFlat(buildFlat(day,swaps));setGuided(true);
  };
  const closeGuided=()=>setGuided(false);
  const stopWorkout=()=>{setRunning(false);setStartEpoch(null);setElapsed(0);setGuided(false);clearInterval(tickRef.current);};
  const markSerie=(d,si,ei,sn)=>{
    const sk=serKey(d,si,ei,sn);
    setSerDone(prev=>({...prev,[sk]:true}));
    const st=Number(getEff(d,si,ei,swaps).ser)||1;
    const allDone=Array.from({length:st},(_,i)=>i+1).every(s=>s===sn||!!serDone[serKey(d,si,ei,s)]);
    if(allDone)setDone(prev=>({...prev,[dKey(d,si,ei)]:true}));
  };
  const onFinish=()=>{const nd={...done};DAYS[day].sections.forEach((s,si)=>s.ex.forEach((_,ei)=>{nd[dKey(day,si,ei)]=true;}));setDone(nd);};

  /* Swap handlers */
  const openSwap=(si,ei)=>setSwapSheet({si,ei});
  const closeSwap=()=>setSwapSheet(null);
  const applySwap=ai=>{
    if(!swapSheet)return;
    const{si,ei}=swapSheet;
    const origEx=DAYS[day].sections[si].ex[ei];
    const alt=SWAPS[origEx.name]?.[ai];
    if(!alt)return;
    const rep={...origEx,name:alt.name,_swapped:true,_origName:origEx.name};
    const newSwaps={...swaps,[day]:{...(swaps[day]||{}),[si]:{...(swaps[day]?.[si]||{}),[ei]:rep}}};
    setSwaps(newSwaps);
    setFlat(buildFlat(day,newSwaps));
    closeSwap();
  };
  const restoreSwap=()=>{
    if(!swapSheet)return;
    const{si,ei}=swapSheet;
    const newSwaps=JSON.parse(JSON.stringify(swaps));
    if(newSwaps[day]?.[si]) delete newSwaps[day][si][ei];
    setSwaps(newSwaps);setFlat(buildFlat(day,newSwaps));closeSwap();
  };
  const changeDay=i=>{setDay(i);setSwapSheet(null);setGuided(false);};

  return(
    <>
      <style>{CSS}</style>
      {swapSheet&&<SwapSheet day={day} si={swapSheet.si} ei={swapSheet.ei} swaps={swaps} onApply={applySwap} onRestore={restoreSwap} onClose={closeSwap}/>}
      {guided&&flat.length>0&&<GuidedMode day={day} workoutSec={elapsed} flat={flat} serDone={serDone} swaps={swaps} onMarkSerie={markSerie} onClose={closeGuided} onFinish={onFinish} onSwap={openSwap}/>}
      {!guided&&rest&&<RestModal seconds={rest.seconds} onClose={()=>setRest(null)}/>}

      {running&&(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:300,background:"rgba(11,13,21,.96)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 18px",boxShadow:"0 2px 16px rgba(0,0,0,.4)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:T.accent,animation:"pulse 1.5s ease-in-out infinite"}}/>
            <div>
              <div style={{fontSize:"0.55rem",fontWeight:800,letterSpacing:"0.1em",color:T.faint,textTransform:"uppercase"}}>Treino ativo</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"1.05rem",fontWeight:600,color:T.accent}}>{fmtTime(elapsed)}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {!guided&&<button onClick={openGuided} style={{padding:"7px 14px",borderRadius:9,background:T.accentLight,color:T.accent,border:`1px solid ${T.accentMid}`,fontWeight:700,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>▶ Guiado</button>}
            <button onClick={stopWorkout} style={{padding:"7px 14px",borderRadius:9,background:"rgba(239,68,68,.08)",color:T.drop,border:"1px solid rgba(239,68,68,.18)",fontWeight:700,fontSize:"0.72rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>✕ Encerrar</button>
          </div>
        </div>
      )}

      <div style={{maxWidth:460,margin:"0 auto",paddingTop:running?56:0,minHeight:"100vh",background:T.bg}}>
        <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"22px 18px 0"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
            <div>
              <div style={{fontSize:"0.62rem",fontWeight:800,letterSpacing:"0.14em",color:T.accent,textTransform:"uppercase",marginBottom:3}}>Ficha Semanal — v4</div>
              <div style={{fontSize:"1.75rem",fontWeight:900,color:T.text,letterSpacing:"-0.035em",lineHeight:1.05}}>Alisson</div>
              <div style={{fontSize:"0.78rem",color:T.muted,fontWeight:500,marginTop:4}}>{doneC} de {total} exercícios hoje</div>
            </div>
            <div style={{width:50,height:50,borderRadius:15,background:`linear-gradient(135deg,${T.accentLight},${T.accentMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.35rem",animation:"breathe 3s ease-in-out infinite"}}>💪</div>
          </div>
          <div style={{display:"flex",gap:2,overflowX:"auto",scrollbarWidth:"none",paddingBottom:1}}>
            {DAYS.map((d,i)=>{const dc=getDone(i,done),dt=getTot(i),act=i===day;return(
              <button key={i} onClick={()=>changeDay(i)} style={{flexShrink:0,padding:"10px 13px",borderRadius:"12px 12px 0 0",background:act?"#0b0d15":"transparent",border:"none",borderBottom:act?`2.5px solid ${T.accent}`:"2.5px solid transparent",cursor:"pointer",transition:"all .2s",textAlign:"center"}}>
                <div style={{fontSize:"0.86rem",fontWeight:900,color:act?T.accent:T.faint,letterSpacing:"0.02em"}}>{d.dia}</div>
                <div style={{fontSize:"0.52rem",fontWeight:700,color:dc===dt&&dt>0?T.accent:T.faint,marginTop:2}}>{dc}/{dt}</div>
              </button>
            );})}
          </div>
        </div>

        <div className="fu" key={day} style={{padding:"18px 14px 130px"}}>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:"1.3rem",fontWeight:900,color:T.text,letterSpacing:"-0.025em",marginBottom:8}}>{d.full}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
              {d.main.map(g=><span key={g} style={{padding:"3px 11px",borderRadius:20,background:T.accentLight,color:T.accent,fontSize:"0.62rem",fontWeight:800,letterSpacing:"0.06em",border:`1px solid ${T.accentMid}`}}>{g}</span>)}
              {d.sub.map(g=><span key={g} style={{padding:"3px 11px",borderRadius:20,background:"#191b29",color:T.muted,fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.06em",border:`1px solid ${T.border}`}}>{g}</span>)}
            </div>
            <div style={{background:T.card,borderRadius:15,padding:"14px 15px",border:`1px solid ${T.border}`,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                <span style={{fontSize:"0.65rem",fontWeight:800,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>Progresso</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.82rem",fontWeight:700,color:pct===100?T.accent:T.text}}>{pct}%</span>
              </div>
              <div style={{height:5,background:"#1f2235",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#16a34a,#22c55e)",borderRadius:5,transition:"width .5s cubic-bezier(.22,1,.36,1)"}}/></div>
              {pct===100&&<div style={{textAlign:"center",marginTop:9,fontSize:"0.73rem",fontWeight:800,color:T.accent}}>🎉 Treino completo! Isso! 💪</div>}
            </div>
            <button onClick={openGuided} style={{width:"100%",padding:"14px 0",background:"linear-gradient(135deg,#16a34a,#22c55e)",border:"none",borderRadius:15,color:"#fff",fontFamily:"'Nunito',sans-serif",fontSize:"0.93rem",fontWeight:900,letterSpacing:"0.06em",cursor:"pointer",boxShadow:"0 6px 22px rgba(22,163,74,.28)",transition:"all .2s",textTransform:"uppercase"}}>
              {running?"▶  Retomar Treino Guiado":"▶  Iniciar Treino Guiado"}
            </button>
          </div>

          {d.sections.map((sec,si)=>(
            <div key={si} style={{marginBottom:22}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9,paddingBottom:7,borderBottom:`1px solid ${T.border}`}}>
                <div style={{width:3,height:13,background:T.accent,borderRadius:3}}/><span style={{fontSize:"0.6rem",fontWeight:800,letterSpacing:"0.1em",color:T.muted,textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace"}}>{sec.title}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {(()=>{const items=[];let i=0;
                  while(i<sec.ex.length){
                    const origEx=sec.ex[i],ex=getEff(day,si,i,swaps);
                    const isFirst=(origEx.int==="bi"||origEx.int==="ss")&&origEx.biPair===true&&i+1<sec.ex.length;
                    if(isFirst){
                      const exB=getEff(day,si,i+1,swaps);
                      items.push(<GroupCard key={i} exA={{...ex,_ei:i}} exB={{...exB,_ei:i+1}} si={si} di={day} done={done} onToggle={toggleDone} onSwap={openSwap} swapsMap={swaps}/>);
                      i+=2;
                    } else {
                      items.push(<Card key={i} ex={ex} si={si} ei={i} di={day} done={done} onToggle={toggleDone} onSwap={openSwap} swapped={!!swaps[day]?.[si]?.[i]}/>);
                      i++;
                    }
                  }
                  return items;
                })()}
              </div>
            </div>
          ))}
        </div>

        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:460,background:"rgba(11,13,21,.97)",backdropFilter:"blur(16px)",borderTop:`1px solid ${T.border}`,padding:"12px 14px 20px",display:"flex",gap:10}}>
          <button onClick={resetDay} style={{flex:1,padding:"12px 0",borderRadius:13,background:"#191b29",border:`1px solid ${T.border}`,color:T.muted,fontWeight:700,fontSize:"0.78rem",cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>↺ Resetar Dia</button>
          <div style={{flex:2.2,padding:"11px 14px",borderRadius:13,background:T.accentLight,border:`1px solid ${T.accentMid}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:"0.55rem",fontWeight:800,color:T.accent,letterSpacing:"0.08em",textTransform:"uppercase"}}>Hoje</div>
              <div style={{fontSize:"0.82rem",fontWeight:800,color:T.text}}>{d.full}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"1.1rem",fontWeight:800,color:T.accent}}>{pct}%</div>
              <div style={{fontSize:"0.58rem",color:T.muted}}>{doneC}/{total}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
