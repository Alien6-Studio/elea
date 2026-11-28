---
title: Composition of interfaces, laboratory
description: Construct a grid, then see how a record, a comparison and a collection share its edges as the available space and the type they hold change.
lab: composition-lab
view: laboratory
---

<article class="grid-lab">
  <header class="grid-lab__intro">
    <h1 class="site-page-title">Composition laboratory</h1>
    <p>Build a page from its outside edges in. Set the frame and margins, divide the available measure into columns, then give the title a span. The programme below shows what fits and where space is left open.</p>
  </header>
  <div class="elea-grid grid-lab__bench">
    <form class="elea-grid__panel grid-lab__controls" hidden>
      <fieldset>
        <legend>Construct the grid</legend>
        <div><label for="grid-width">Frame width</label><span data-value="width">720 px</span><input id="grid-width" type="range" min="240" max="960" step="8" value="720"></div>
        <div><label for="grid-columns">Columns</label><span data-value="columns">6</span><input id="grid-columns" type="range" min="1" max="12" step="1" value="6"></div>
        <div><label for="grid-margin">Outer margin</label><span data-value="margin">24 px</span><input id="grid-margin" type="range" min="0" max="64" step="1" value="24"></div>
        <div><label for="grid-gutter">Column gutter</label><span data-value="gutter">12 px</span><input id="grid-gutter" type="range" min="0" max="32" step="1" value="12"></div>
        <div><label for="grid-baseline">Baseline step</label><span data-value="baseline">8 px</span><input id="grid-baseline" type="range" min="4" max="12" step="1" value="8"></div>
        <div><label for="grid-span">Title span</label><span data-value="span">4 columns</span><input id="grid-span" type="range" min="1" max="6" step="1" value="4"></div>
      </fieldset>
    </form>
    <section class="elea-grid__stage grid-lab__work" aria-labelledby="grid-sheet-heading">
      <div class="grid-lab__head">
        <h2 id="grid-sheet-heading">Programme sheet</h2>
        <label><input id="grid-guides" type="checkbox" checked> Show construction lines</label>
      </div>
      <div class="grid-lab__stage">
        <div id="grid-frame" class="grid-sheet" role="img" aria-label="Programme grid. The heading crosses the page, the title starts on the left and two session times align to the right below.">
          <div class="grid-sheet__folio"><span>Quay House</span><span>17 May</span></div>
          <div class="grid-sheet__lead"><span>Soundings</span></div>
          <div class="grid-sheet__sessions"><span>10:00 · Harbour walk</span><span>14:00 · Listening room</span></div>
          <div class="grid-sheet__lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
      <p class="grid-lab__caption">The title occupies three module rows from the first column. The session list takes the same span from the opposite edge, two rows deep. On very narrow spans the blocks retain their footprint while their lettering drops out.</p>
      <noscript><p>The static grid has six columns, 24 px outer margins and 12 px gutters. The title spans four columns. Enable JavaScript to change the construction and inspect the current dimensions.</p></noscript>
    </section>
  </div>
  <dl class="elea-grid grid-lab__readings" aria-label="Grid measurements" hidden>
    <div><dt>Effective frame</dt><dd data-readout="frame"></dd></div>
    <div><dt>Column width</dt><dd data-readout="track"></dd></div>
    <div><dt>Title width</dt><dd data-readout="span"></dd></div>
    <div><dt>Space after title</dt><dd data-readout="reserve"></dd></div>
    <div><dt>Module depth</dt><dd data-readout="module"></dd></div>
  </dl>
  <details class="grid-lab__method">
    <summary>How to read the construction</summary>
    <p>The frame fits the space available on your screen. Both outer margins come out before dividing the measure. Each column receives an equal share of what remains after the gutters. Margin and gutter limits follow the available width so that columns retain a positive measure. A span includes its internal gutters. The space after the title ends at the inside edge of the far margin and includes the next gutter, if there is one.</p>
    <p>The horizontal rules mark baseline intervals. Four intervals make one module and one interval separates adjacent modules. The sheet has six modules and a single baseline interval outside them at the top and bottom. The drawn grid positions the blocks. The type inside each block has its own line height.</p>
  </details>
  <section id="one-ruling-three-views" class="archive-series" aria-labelledby="archive-series-title">
    <h2 id="archive-series-title">One ruling, three views</h2>
    <p class="archive-series__intro">A record, a comparison and an index from the same sound archive. Follow the first line of each entry as its neighbours move. At 40 rem the comparison already fits side by side and the field note still sits below its passage.</p>
    <div class="archive-series__controls">
      <div class="archive-series__width" hidden>
        <label for="archive-width">Available width</label>
        <input type="range" id="archive-width" min="14" max="64" step=".25" value="46" aria-describedby="archive-width-value">
        <output id="archive-width-value" for="archive-width">46 rem</output>
      </div>
      <label><input type="checkbox" id="archive-transcription"> Allow 18 rem for the note</label>
      <label><input type="checkbox" id="archive-navigation"> Open collection navigation</label>
      <label><input type="checkbox" id="archive-guides" checked> Show column edges</label>
    </div>
    <figure class="archive-series__mount">
      <div class="archive-series__space">
        <div class="archive-workspace">
          <nav class="archive-navigation" aria-label="Sound archive">
            <a href="#archive-record-title">Record</a>
            <a href="#archive-comparison-title">Compare recordings</a>
            <a href="#archive-index-title">Collection index</a>
          </nav>
          <div class="archive-series__frame">
            <div class="archive-series__ruling" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
            <article class="archive-leaf archive-record" aria-labelledby="archive-record-title">
              <div class="archive-passage">
                <h3 id="archive-record-title">Outer harbour</h3>
                <p>From the landing, a loose chain strikes the mooring post. Each blow carries across the water. A passing ferry briefly covers the quieter sound beneath it.</p>
              </div>
              <aside class="archive-note" aria-label="Field note">
                <h4 class="archive-note__short">East landing microphone</h4>
                <h4 class="archive-note__long">East landing and harbour wall microphones</h4>
                <p class="archive-note__short">East landing. Listen for the chain as the ferry pulls away.</p>
                <p class="archive-note__long">The second microphone was on the harbour wall. In that recording the returning ferry enters before the chain falls silent.</p>
              </aside>
            </article>
            <section class="archive-leaf archive-comparison" aria-labelledby="archive-comparison-title">
              <h3 id="archive-comparison-title">Two listening positions</h3>
              <div class="archive-take"><h4>On the landing</h4><p>The links strike in pairs. Footsteps on the boards cut across the second strike.</p></div>
              <div class="archive-take"><h4>On the wall</h4><p>The engine reaches this microphone first. The gap between the strikes is easier to hear.</p></div>
            </section>
            <section class="archive-leaf archive-index" aria-labelledby="archive-index-title">
              <h3 id="archive-index-title">Recordings in the collection</h3>
              <dl>
                <div><dt>Outer harbour</dt><dd>Chain on a mooring post</dd></div>
                <div><dt>Tide steps</dt><dd>Water under the landing</dd></div>
                <div><dt>Ferry crossing</dt><dd>Engine heard from the quay</dd></div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </figure>
    <p class="archive-series__measure" hidden></p>
    <p class="archive-series__caption">The two margins each take 2 rem and each gutter takes 1 rem. A navigation rail takes 14 rem and a 1-rem gap when it can leave 20 rem for the view. In a narrower workspace, navigation sits above it. The shared frame stops growing at 54 rem, where the passage reaches its upper measure. <a href="../#one-ruling-for-a-family-of-views">Read the derivation</a>.</p>
  </section>
</article>
