const app = document.querySelector('#app');

app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#workspace" aria-label="GPT Academic Next home">
        <span class="brand-mark" aria-hidden="true">GA</span>
        <span><strong>GPT Academic</strong><small>Next Workspace</small></span>
      </a>
      <nav class="nav-links" aria-label="Main navigation">
        <a href="#workspace">&#24037;&#20316;&#21488;</a>
        <a href="#reader">&#35770;&#25991;&#38405;&#35835;</a>
        <a href="#plugins">&#25554;&#20214;</a>
        <a href="#deploy">&#37096;&#32626;</a>
      </nav>
      <div class="topbar-actions">
        <button class="icon-button" type="button" data-panel-toggle aria-label="Toggle control panel">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <a class="ghost-button" href="https://github.com/binary-husky/gpt_academic" target="_blank" rel="noreferrer">GitHub</a>
        <button class="primary-button" type="button" data-focus-prompt>&#24320;&#22987;&#20998;&#26512;</button>
      </div>
    </header>

    <main>
      <section class="hero-section" id="workspace">
        <div class="hero-copy">
          <h1>&#25226;&#35770;&#25991;&#12289;&#20195;&#30721;&#21644;&#27169;&#22411;&#23545;&#35805;&#25918;&#36827;&#21516;&#19968;&#20010;&#31185;&#30740;&#24037;&#20316;&#21488;&#12290;</h1>
          <p>&#31867;&#20284; GPT Academic Next &#30340;&#36731;&#37327;&#32593;&#39029;&#20307;&#39564;&#65306;&#19978;&#20256;&#35770;&#25991;&#12289;&#36873;&#25321;&#25554;&#20214;&#12289;&#35843;&#29992;&#27169;&#22411;&#12289;&#29983;&#25104;&#32508;&#36848;&#19982;&#32763;&#35793;&#65292;&#25972;&#20010;&#27969;&#31243;&#20445;&#25345;&#28165;&#26224;&#12289;&#23433;&#38745;&#12289;&#21487;&#36861;&#36394;&#12290;</p>
          <div class="hero-actions">
            <button class="primary-button large" type="button" data-focus-prompt>&#26032;&#24314;&#30740;&#31350;&#20219;&#21153;</button>
            <button class="ghost-button large" type="button" data-scroll-reader>&#26597;&#30475;&#38405;&#35835;&#27969;</button>
          </div>
          <dl class="signal-strip" aria-label="Metrics">
            <div><dt>12+</dt><dd>&#20869;&#32622;&#23398;&#26415;&#25554;&#20214;</dd></div>
            <div><dt>4</dt><dd>&#20219;&#21153;&#27969;&#27700;&#32447;</dd></div>
            <div><dt>PDF</dt><dd>&#32763;&#35793;&#19982;&#38382;&#31572;</dd></div>
          </dl>
        </div>

        <div class="workspace-card" aria-label="Research workspace demo">
          <div class="workspace-toolbar">
            <div class="traffic" aria-hidden="true"><span></span><span></span><span></span></div>
            <span class="toolbar-title">Research Session</span>
            <button class="mini-button" type="button" data-run-demo>&#36816;&#34892;</button>
          </div>
          <div class="workspace-grid">
            <aside class="side-panel" data-control-panel>
              <div class="panel-section">
                <h2>&#27169;&#22411;</h2>
                <div class="segmented" aria-label="Model selector">
                  <button class="active" type="button" data-model="GPT-4o">GPT-4o</button>
                  <button type="button" data-model="Claude">Claude</button>
                  <button type="button" data-model="Local">Local</button>
                </div>
              </div>
              <div class="panel-section">
                <h2>&#25554;&#20214;</h2>
                <label class="check-row"><input type="checkbox" checked /> PDF &#31934;&#35835;</label>
                <label class="check-row"><input type="checkbox" checked /> &#20013;&#33521;&#20114;&#35793;</label>
                <label class="check-row"><input type="checkbox" /> &#20195;&#30721;&#35299;&#37322;</label>
              </div>
              <div class="panel-section compact">
                <h2>&#24403;&#21069;&#29366;&#24577;</h2>
                <p><span class="status-dot"></span><span data-model-status>GPT-4o ready</span></p>
              </div>
            </aside>

            <section class="chat-panel" aria-label="Prompt editor">
              <div class="prompt-header">
                <span>Academic Prompt</span>
                <span data-progress-label>&#24453;&#36816;&#34892;</span>
              </div>
              <textarea data-prompt-input rows="6">Please read this paper, extract the core problem, method contribution, experimental conclusion, and reproducibility risks.</textarea>
              <div class="task-flow" aria-label="Task flow">
                <span class="done">Upload PDF</span>
                <span class="active" data-flow-step>Parse structure</span>
                <span>Draft review</span>
                <span>Export Markdown</span>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section class="reader-section" id="reader">
        <div class="section-copy">
          <h2>&#35770;&#25991;&#38405;&#35835;&#20687;&#20195;&#30721;&#23457;&#26597;&#19968;&#26679;&#21487;&#36861;&#36394;&#12290;</h2>
          <p>&#24038;&#20391;&#20445;&#30041;&#21407;&#25991;&#32467;&#26500;&#65292;&#21491;&#20391;&#29983;&#25104;&#25688;&#35201;&#12289;&#26415;&#35821;&#35299;&#37322;&#12289;&#23454;&#39564;&#34920;&#26684;&#21644;&#36861;&#38382;&#24314;&#35758;&#12290;</p>
        </div>
        <div class="reader-grid">
          <article class="paper-view">
            <div class="paper-meta"><span>paper.pdf</span><span>14 pages</span></div>
            <h3>Adaptive Retrieval for Scientific Agents</h3>
            <p>Abstract. Scientific assistants must coordinate retrieval, reasoning, and citation-grounded generation under changing context budgets...</p>
            <mark>Key contribution: a controllable pipeline for literature-grounded task decomposition.</mark>
          </article>
          <article class="analysis-view">
            <h3>AI &#20998;&#26512;&#32467;&#26524;</h3>
            <ul>
              <li>&#30740;&#31350;&#38382;&#39064;&#65306;&#38271;&#19978;&#19979;&#25991;&#31185;&#30740;&#20219;&#21153;&#20013;&#30340;&#26816;&#32034;&#28418;&#31227;&#12290;</li>
              <li>&#26041;&#27861;&#36129;&#29486;&#65306;&#25226;&#25554;&#20214;&#35843;&#29992;&#12289;&#24341;&#29992;&#32422;&#26463;&#21644;&#25688;&#35201;&#21387;&#32553;&#25286;&#25104;&#27969;&#27700;&#32447;&#12290;</li>
              <li>&#39118;&#38505;&#25552;&#31034;&#65306;&#25968;&#25454;&#38598;&#35268;&#27169;&#36739;&#23567;&#65292;&#28040;&#34701;&#23454;&#39564;&#19981;&#36275;&#12290;</li>
            </ul>
            <button class="ghost-button" type="button" data-copy-summary>&#22797;&#21046;&#25688;&#35201;</button>
          </article>
        </div>
      </section>

      <section class="plugin-section" id="plugins">
        <div class="section-copy narrow">
          <h2>&#20026; GPT Academic &#30340;&#25554;&#20214;&#29983;&#24577;&#30041;&#22909;&#20837;&#21475;&#12290;</h2>
          <p>&#24120;&#29992;&#31185;&#30740;&#21160;&#20316;&#34987;&#25910;&#25918;&#21040;&#21487;&#25195;&#25551;&#30340;&#25805;&#20316;&#21306;&#65292;&#21518;&#32493;&#21487;&#25509;&#20837;&#21407;&#39033;&#30446;&#30340; Gradio/Python &#36923;&#36753;&#12290;</p>
        </div>
        <div class="plugin-grid">
          <article><span>01</span><h3>&#35770;&#25991;&#32763;&#35793;</h3><p>&#27573;&#33853;&#23545;&#40784;&#12289;&#26415;&#35821;&#35760;&#24518;&#12289;Markdown &#23548;&#20986;&#12290;</p></article>
          <article><span>02</span><h3>&#20195;&#30721;&#35299;&#26512;</h3><p>&#35835;&#21462;&#20179;&#24211;&#32467;&#26500;&#65292;&#35299;&#37322;&#20989;&#25968;&#35843;&#29992;&#19982;&#23454;&#39564;&#33050;&#26412;&#12290;</p></article>
          <article><span>03</span><h3>&#32508;&#36848;&#33609;&#31295;</h3><p>&#25353;&#20027;&#39064;&#32858;&#21512;&#25991;&#29486;&#65292;&#29983;&#25104;&#21487;&#32487;&#32493;&#32534;&#36753;&#30340;&#31456;&#33410;&#12290;</p></article>
          <article><span>04</span><h3>&#22810;&#27169;&#22411;&#23545;&#29031;</h3><p>&#21516;&#19968;&#20219;&#21153;&#23545;&#27604;&#19981;&#21516;&#27169;&#22411;&#36755;&#20986;&#65292;&#20445;&#30041;&#24046;&#24322;&#35760;&#24405;&#12290;</p></article>
        </div>
      </section>

      <section class="deploy-section" id="deploy">
        <div>
          <h2>&#38745;&#24577;&#39029;&#38754;&#24050;&#21487;&#29420;&#31435;&#36816;&#34892;&#12290;</h2>
          <p>&#24403;&#21069;&#23454;&#29616;&#19981;&#20381;&#36182;&#22806;&#32593;&#21253;&#21644;&#26500;&#24314;&#24037;&#20855;&#12290;&#22914;&#26524;&#20043;&#21518;&#25226;&#19978;&#28216;&#20179;&#24211;&#20195;&#30721;&#25918;&#36827;&#24037;&#20316;&#21306;&#65292;&#21487;&#20197;&#25226;&#36825;&#20123;&#32452;&#20214;&#36801;&#31227;&#21040;&#39033;&#30446;&#33258;&#24049;&#30340; Web &#20837;&#21475;&#12290;</p>
        </div>
        <code>index.html + styles.css + script.js</code>
      </section>
    </main>
  </div>
`;

const promptInput = document.querySelector('[data-prompt-input]');
const progressLabel = document.querySelector('[data-progress-label]');
const flowStep = document.querySelector('[data-flow-step]');
const modelStatus = document.querySelector('[data-model-status]');
const controlPanel = document.querySelector('[data-control-panel]');

document.querySelectorAll('[data-focus-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    promptInput?.focus();
    promptInput?.select();
  });
});

document.querySelector('[data-scroll-reader]')?.addEventListener('click', () => {
  document.querySelector('#reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('[data-panel-toggle]')?.addEventListener('click', () => {
  controlPanel?.classList.toggle('is-open');
});

document.querySelectorAll('[data-model]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-model]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    modelStatus.textContent = `${button.dataset.model} ready`;
  });
});

document.querySelector('[data-run-demo]')?.addEventListener('click', () => {
  progressLabel.innerHTML = '&#36816;&#34892;&#20013;';
  flowStep.textContent = 'Analyze structure';
  flowStep.classList.add('pulse');
  setTimeout(() => {
    progressLabel.innerHTML = '&#24050;&#29983;&#25104;&#33609;&#31295;';
    flowStep.textContent = 'Draft review';
  }, 900);
});

document.querySelector('[data-copy-summary]')?.addEventListener('click', (event) => {
  event.currentTarget.innerHTML = '&#24050;&#22797;&#21046;';
  setTimeout(() => {
    event.currentTarget.innerHTML = '&#22797;&#21046;&#25688;&#35201;';
  }, 1100);
});
