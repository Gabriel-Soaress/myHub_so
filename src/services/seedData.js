import { createNode, isSeeded, markSeeded } from './storageService';
import { generateId } from '../utils/helpers';

/**
 * Dados iniciais de demonstração do portfólio
 */
export function seedInitialData() {
  if (isSeeded()) return;

  // IDs fixos para manter referências
  const ids = {
    atividades: generateId(),
    pesquisas: generateId(),
    reflexoes: generateId(),
    projetos: generateId(),
    guia: generateId(),
    aula01: generateId(),
    aula02: generateId(),
    reflexao01: generateId(),
    pesquisa01: generateId(),
    projeto01: generateId(),
    guiaConteudo: generateId(),
  };

  // === PASTAS RAIZ ===
  createNode({
    id: ids.atividades,
    type: 'folder',
    name: 'Atividades em Aula',
    parentId: null,
    order: 0,
    metadata: {
      description: 'Registros das atividades realizadas durante as aulas de Engenharia de Software.',
      color: '#4f46e5',
    },
  });

  createNode({
    id: ids.pesquisas,
    type: 'folder',
    name: 'Materiais de Pesquisa',
    parentId: null,
    order: 1,
    metadata: {
      description: 'Artigos, referências bibliográficas e materiais complementares de pesquisa.',
      color: '#2563eb',
    },
  });

  createNode({
    id: ids.reflexoes,
    type: 'folder',
    name: 'Reflexões',
    parentId: null,
    order: 2,
    metadata: {
      description: 'Reflexões pessoais sobre o aprendizado e a evolução na disciplina.',
      color: '#7c3aed',
    },
  });

  createNode({
    id: ids.projetos,
    type: 'folder',
    name: 'Projetos Práticos',
    parentId: null,
    order: 3,
    metadata: {
      description: 'Projetos desenvolvidos ao longo da disciplina com documentação e resultados.',
      color: '#059669',
    },
  });

  createNode({
    id: ids.guia,
    type: 'folder',
    name: 'Guia do Portfólio',
    parentId: null,
    order: 4,
    metadata: {
      description: 'Informações sobre o funcionamento e a organização deste portfólio.',
      color: '#64748b',
    },
  });

  // === SUBPASTAS & CONTEÚDOS ===
  
  // Aula 01
  createNode({
    id: ids.aula01,
    type: 'folder',
    name: 'Aula 01 — Introdução à Engenharia de Software',
    parentId: ids.atividades,
    order: 0,
    metadata: {
      description: 'Conceitos fundamentais, história e importância da Engenharia de Software.',
    },
  });

  createNode({
    id: generateId(),
    type: 'file',
    name: 'Resumo da Aula',
    parentId: ids.aula01,
    order: 0,
    content: {
      type: 'richtext',
      body: `<h2>Introdução à Engenharia de Software</h2>
<p>Nesta primeira aula, foram abordados os <strong>conceitos fundamentais</strong> da Engenharia de Software como disciplina acadêmica e profissional.</p>
<h3>Principais tópicos</h3>
<ul>
<li>Definição e escopo da Engenharia de Software</li>
<li>Diferença entre programação e engenharia de software</li>
<li>Processos de desenvolvimento de software</li>
<li>Importância da qualidade e manutenibilidade</li>
<li>Metodologias tradicionais vs. ágeis</li>
</ul>
<h3>Observações pessoais</h3>
<p>A Engenharia de Software vai muito além de simplesmente escrever código. Envolve <em>planejamento, design, testes, manutenção</em> e uma série de práticas que garantem a qualidade e a longevidade do software produzido.</p>
<blockquote><p>"Software é fácil de fazer, mas difícil de fazer bem." — Adaptado de Frederick Brooks</p></blockquote>
<p>O conceito de <strong>dívida técnica</strong> chamou especial atenção — decisões rápidas tomadas hoje podem gerar custos enormes no futuro.</p>`,
    },
    metadata: {
      description: 'Resumo dos conceitos abordados na primeira aula.',
    },
  });

  // Aula 02
  createNode({
    id: ids.aula02,
    type: 'folder',
    name: 'Aula 02 — Modelos de Processo',
    parentId: ids.atividades,
    order: 1,
    metadata: {
      description: 'Modelos cascata, incremental, espiral e ágeis.',
    },
  });

  createNode({
    id: generateId(),
    type: 'file',
    name: 'Comparativo de Modelos de Processo',
    parentId: ids.aula02,
    order: 0,
    content: {
      type: 'richtext',
      body: `<h2>Modelos de Processo de Software</h2>
<p>Nesta aula, estudamos os diferentes <strong>modelos de processo</strong> utilizados no desenvolvimento de software e suas características.</p>
<h3>Modelo Cascata</h3>
<p>Abordagem linear e sequencial, onde cada fase deve ser concluída antes da próxima iniciar. Adequado para projetos com requisitos bem definidos e estáveis.</p>
<h3>Modelo Incremental</h3>
<p>Combina elementos lineares e iterativos. O software é construído em incrementos, cada um adicionando funcionalidades ao produto.</p>
<h3>Modelo Espiral</h3>
<p>Enfatiza análise de riscos. Cada ciclo da espiral inclui planejamento, análise de riscos, engenharia e avaliação.</p>
<h3>Metodologias Ágeis</h3>
<p>Frameworks como <strong>Scrum</strong> e <strong>Kanban</strong> priorizam entregas frequentes, colaboração com o cliente e adaptação a mudanças.</p>`,
    },
    metadata: {
      description: 'Análise comparativa dos modelos de processo de software.',
    },
  });

  // Reflexão
  createNode({
    id: ids.reflexao01,
    type: 'file',
    name: 'Reflexão — Por que Engenharia de Software importa?',
    parentId: ids.reflexoes,
    order: 0,
    content: {
      type: 'richtext',
      body: `<h2>Por que Engenharia de Software importa?</h2>
<p>Antes de iniciar esta disciplina, minha visão de desenvolvimento de software era predominantemente centrada no código. Acreditava que ser um bom programador significava escrever código elegante e eficiente.</p>
<p>Porém, as primeiras semanas de estudo revelaram uma dimensão muito mais ampla. A Engenharia de Software trata de <strong>construir sistemas que funcionam, que podem ser mantidos e que atendem realmente às necessidades dos usuários</strong>.</p>
<h3>Mudança de perspectiva</h3>
<p>Três pontos que mudaram minha perspectiva:</p>
<ol>
<li><strong>Comunicação</strong> — A maior parte dos problemas em projetos de software não é técnica, é de comunicação.</li>
<li><strong>Planejamento</strong> — Sem planejamento adequado, o código mais brilhante do mundo não resolve o problema certo.</li>
<li><strong>Manutenibilidade</strong> — Escrever código que outros (e eu mesmo no futuro) possam entender é tão importante quanto fazê-lo funcionar.</li>
</ol>
<blockquote><p>A engenharia de software nos ensina a pensar em sistemas, não apenas em programas.</p></blockquote>`,
    },
    metadata: {
      description: 'Reflexão pessoal sobre a importância da disciplina.',
    },
  });

  // Pesquisa
  createNode({
    id: ids.pesquisa01,
    type: 'file',
    name: 'Artigo — Manifesto Ágil e suas implicações',
    parentId: ids.pesquisas,
    order: 0,
    content: {
      type: 'richtext',
      body: `<h2>O Manifesto Ágil e suas Implicações Modernas</h2>
<p>O Manifesto Ágil, publicado em 2001, revolucionou a forma como equipes de desenvolvimento pensam sobre processos de software.</p>
<h3>Os quatro valores</h3>
<ol>
<li><strong>Indivíduos e interações</strong> mais que processos e ferramentas</li>
<li><strong>Software em funcionamento</strong> mais que documentação abrangente</li>
<li><strong>Colaboração com o cliente</strong> mais que negociação de contratos</li>
<li><strong>Responder a mudanças</strong> mais que seguir um plano</li>
</ol>
<h3>Relevância atual</h3>
<p>Mais de duas décadas depois, os princípios ágeis continuam fundamentais. Com o surgimento de práticas como DevOps, CI/CD e microsserviços, a filosofia ágil evoluiu mas manteve seus fundamentos.</p>`,
    },
    metadata: {
      description: 'Pesquisa sobre o Manifesto Ágil e sua relevância atual.',
    },
  });

  // Projeto
  createNode({
    id: ids.projeto01,
    type: 'folder',
    name: 'Projeto Portfólio Digital',
    parentId: ids.projetos,
    order: 0,
    metadata: {
      description: 'Desenvolvimento da plataforma de portfólio reflexivo digital.',
      color: '#059669',
    },
  });

  createNode({
    id: generateId(),
    type: 'file',
    name: 'Documentação do Projeto',
    parentId: ids.projeto01,
    order: 0,
    content: {
      type: 'richtext',
      body: `<h2>Portfólio Reflexivo Digital</h2>
<p>Este projeto consiste no desenvolvimento de uma plataforma digital de portfólio reflexivo para a disciplina de Engenharia de Software.</p>
<h3>Objetivo</h3>
<p>Criar um ambiente acadêmico interativo, organizado e visualmente profissional que funcione como sistema de gerenciamento de conteúdo e plataforma de apresentação.</p>
<h3>Tecnologias utilizadas</h3>
<ul>
<li><strong>React</strong> — Framework de interface</li>
<li><strong>Vite</strong> — Build tool</li>
<li><strong>React Router</strong> — Navegação</li>
<li><strong>TipTap</strong> — Editor de texto rico</li>
<li><strong>Zustand</strong> — Gerenciamento de estado</li>
</ul>
<h3>Status</h3>
<p>Em desenvolvimento ativo. A primeira fase foca na interface e experiência do usuário.</p>`,
    },
    metadata: {
      description: 'Visão geral e documentação do projeto de portfólio.',
    },
  });

  // Guia do Portfólio
  createNode({
    id: ids.guiaConteudo,
    type: 'file',
    name: 'Como navegar neste portfólio',
    parentId: ids.guia,
    order: 0,
    content: {
      type: 'richtext',
      body: `<h2>Guia de Navegação</h2>
<p>Bem-vindo ao Portfólio Reflexivo Digital! Este guia explica como navegar e utilizar a plataforma.</p>
<h3>Estrutura</h3>
<p>O portfólio está organizado em <strong>pastas temáticas</strong>:</p>
<ul>
<li><strong>Atividades em Aula</strong> — Registros das atividades por aula</li>
<li><strong>Materiais de Pesquisa</strong> — Artigos e referências</li>
<li><strong>Reflexões</strong> — Análises pessoais sobre o aprendizado</li>
<li><strong>Projetos Práticos</strong> — Projetos desenvolvidos</li>
<li><strong>Guia do Portfólio</strong> — Informações de uso</li>
</ul>
<h3>Navegação</h3>
<p>Use a <strong>barra lateral</strong> para navegar entre as pastas, ou clique nos <strong>cards</strong> na área principal. A <strong>trilha de navegação</strong> (breadcrumb) no topo mostra onde você está.</p>
<h3>Busca</h3>
<p>Utilize a <strong>barra de busca</strong> no cabeçalho para encontrar conteúdos rapidamente.</p>`,
    },
    metadata: {
      description: 'Instruções de navegação do portfólio.',
    },
  });

  markSeeded();
}
