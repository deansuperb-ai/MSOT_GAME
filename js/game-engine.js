/**
 * Mirai School of Technology - Universal Interactive Game Engine
 * Powers all 17 Games with:
 * - Specific custom tech/anime animations & UI skins per mechanic
 * - 10 questions per game with full scoring, hints, and explanations
 * - Boss battles with animated HP bars & critical timers
 * - Conveyor belts, maze navigation, and Lego voxel builders
 * - Badge awards and XP integration with local state
 */

class MiraiGameEngine {
    constructor() {
        this.currentGame = null;
        this.currentLevel = 1;
        this.currentQIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.combo = 0;
        this.hintUsed = false;
        this.bossHP = 100;
        this.mazeProgress = 0;
        this.raceLaps = 0;
        this.questionStartTime = Date.now();
        this.timerInterval = null;

        this.modal = document.getElementById('gameModal');
        this.container = document.getElementById('gameArenaContainer');

        // Global Escape key shortcut to close game
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const gm = document.getElementById('gameModal');
                if (gm && (gm.classList.contains('active') || gm.style.display === 'flex')) {
                    this.closeGame();
                }
            }
        });
    }

    openGame(gameId, levelNum = null) {
        if (!window.MIRAI_GAMES) return;
        const game = window.MIRAI_GAMES.find(g => g.id === gameId);
        if (!game) {
            console.warn("Game not found:", gameId);
            return;
        }

        this.modal = document.getElementById('gameModal');
        this.container = document.getElementById('gameArenaContainer');
        if (!this.modal || !this.container) return;

        this.currentGame = game;
        this.currentLevel = (typeof levelNum === 'number') ? levelNum : 1;
        this.currentQIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.combo = 0;
        this.bossHP = 100;
        this.mazeProgress = 0;
        this.raceLaps = 0;
        this.hintUsed = false;

        this.modal.classList.add('active');
        this.modal.style.setProperty('display', 'flex', 'important');
        this.modal.style.setProperty('pointer-events', 'auto', 'important');
        this.modal.style.setProperty('visibility', 'visible', 'important');
        document.body.style.overflow = 'hidden';

        if (window.miraiAudio) {
            window.miraiAudio.playClick?.();
        }

        if (game.levels && game.levels.length > 0 && levelNum === null) {
            this.renderLevelSelect();
        } else {
            this.renderStage();
        }
    }

    renderLevelSelect() {
        if (!this.currentGame || !this.currentGame.levels) {
            this.renderStage();
            return;
        }

        const completedList = Array.isArray(window.msotState?.student?.completedGames)
            ? window.msotState.student.completedGames
            : [];

        const isDetective = this.currentGame.mechanic === 'detective';
        const heroVisual = isDetective ? `
            <div class="detective-crime-scene" style="justify-content: center; margin-bottom: 12px;">
                <div class="scene-radar">
                    <div class="radar-sweep"></div>
                    <div class="radar-dot dot1"></div>
                    <div class="radar-dot dot2"></div>
                </div>
            </div>
        ` : `
            <div class="level-select-hero-icon" style="font-size: 52px; margin-bottom: 8px; text-align: center; filter: drop-shadow(0 0 16px rgba(0, 240, 255, 0.4));">
                ${this.currentGame.badge?.icon || '📦'}
            </div>
        `;

        let chamberTag = 'Challenge Scenarios';
        let launchActionText = 'DEPLOY LEVEL';
        if (this.currentGame.mechanic === 'detective') {
            chamberTag = 'Crime Scenes';
            launchActionText = 'INVESTIGATE LEVEL';
        } else if (this.currentGame.mechanic === 'boss_battle') {
            chamberTag = 'Combat Encounters';
            launchActionText = 'ENGAGE BOSS LEVEL';
        } else if (this.currentGame.mechanic === 'box_sort') {
            chamberTag = 'Cargo Scenarios';
            launchActionText = 'SORT CARGO LEVEL';
        } else if (this.currentGame.mechanic === 'maze_runner') {
            chamberTag = 'Labyrinth Portals';
            launchActionText = 'ENTER MAZE LEVEL';
        } else if (this.currentGame.mechanic === 'loop_racer') {
            chamberTag = 'Grand Prix Circuits';
            launchActionText = 'RACE CIRCUIT LEVEL';
        } else if (this.currentGame.mechanic === 'pattern_builder') {
            chamberTag = 'Voxel Blueprints';
            launchActionText = 'BUILD PATTERN LEVEL';
        } else if (this.currentGame.mechanic === 'function_factory') {
            chamberTag = 'Automation Pipelines';
            launchActionText = 'ENGINEER PIPELINE LEVEL';
        } else if (this.currentGame.mechanic === 'house_builder') {
            chamberTag = 'DOM Scaffolds';
            launchActionText = 'CONSTRUCT DOM LEVEL';
        } else if (this.currentGame.mechanic === 'fashion_show') {
            chamberTag = 'Runway Stages';
            launchActionText = 'STYLE RUNWAY LEVEL';
        } else if (this.currentGame.mechanic === 'shopping_list') {
            chamberTag = 'Market Inventory Carts';
            launchActionText = 'STOCK CART LEVEL';
        } else if (this.currentGame.mechanic === 'treasure_map') {
            chamberTag = 'Cyber Archipelago';
            launchActionText = 'SET SAIL TO ARCHIPELAGO';
        } else if (this.currentGame.mechanic === 'gallery_puzzle') {
            chamberTag = 'Holographic Art Wings';
            launchActionText = 'MOUNT GALLERY EXHIBIT';
        } else if (this.currentGame.mechanic === 'timetable_builder') {
            chamberTag = 'Academy Schedules';
            launchActionText = 'CONSTRUCT SCHEDULE GRID';
        } else if (this.currentGame.mechanic === 'desk_rush') {
            chamberTag = 'Admissions Desks';
            launchActionText = 'PROCESS ADMISSIONS QUEUE';
        } else if (this.currentGame.mechanic === 'city_planner') {
            chamberTag = 'Metropolitan Sectors';
            launchActionText = 'ZONE CITY SECTOR';
        } else if (this.currentGame.mechanic === 'conveyor_sort') {
            chamberTag = 'Sorting Pipelines';
            launchActionText = 'START CONVEYOR SORT';
        } else if (this.currentGame.mechanic === 'secret_codes') {
            chamberTag = 'Cipher Dossiers';
            launchActionText = 'DECRYPT CIPHER LEVEL';
        }

        this.container.innerHTML = `
            <div class="game-top-sticky-bar">
                <div class="gt-left-badge">${this.currentGame.badge?.icon || '🎮'} ${this.escapeHtml(this.currentGame.title)} // LEVEL DOSSIERS</div>
                <button type="button" class="floating-game-close-btn" onclick="window.miraiGame.closeGame()" title="Exit Game & Return (Esc)">
                    <span>✕ EXIT GAME</span>
                </button>
            </div>

            <div class="level-select-container">
                <div class="level-select-header">
                    ${heroVisual}
                    <span class="hud-tag">${this.escapeHtml(this.currentGame.trackName || 'DSA in C++')} • TOPIC ${this.currentGame.topicNum || 1}</span>
                    <h2 class="level-select-title">${this.escapeHtml(this.currentGame.title)}: Level Archive</h2>
                    <p class="level-select-subtitle">${this.escapeHtml(this.currentGame.story || 'Select a difficulty tier below to begin challenge.')}</p>
                </div>

                <div class="level-cards-grid">
                    ${this.currentGame.levels.map(lvl => {
                        const isLvlDone = completedList.includes(`${this.currentGame.id}_lvl${lvl.level}`);
                        const badgeIcon = lvl.badge?.icon || '📦';
                        return `
                            <div class="level-card level-${lvl.level} ${isLvlDone ? 'completed' : ''}">
                                <div class="lvl-card-top">
                                    <span class="lvl-badge-tag">${lvl.badge?.name || ('Level ' + lvl.level)}</span>
                                    <span class="lvl-count-pill">${lvl.questions.length} ${chamberTag}</span>
                                </div>
                                <div class="lvl-hero-icon">${badgeIcon}</div>
                                <h3 class="lvl-card-title">${this.escapeHtml(lvl.title)}</h3>
                                <p class="lvl-card-desc">${this.escapeHtml(lvl.subtitle || '')}</p>
                                <div class="lvl-reward-row">
                                    <span class="reward-icon">${badgeIcon}</span>
                                    <span class="reward-text">Reward: <strong>${this.escapeHtml(lvl.badge?.name || 'Badge')}</strong></span>
                                </div>
                                <button type="button" class="lvl-launch-btn" onclick="window.miraiGame.startLevel(${lvl.level})">
                                    <span>${isLvlDone ? 'REPLAY TIER ↺' : launchActionText + ' ' + lvl.level + ' ➔'}</span>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="level-select-actions">
                    <button type="button" class="primary-btn" onclick="window.miraiGame.startLevel(1)">
                        <span>🚀 START LEVEL 1 (CADET)</span>
                    </button>
                    <button type="button" class="secondary-btn" onclick="window.miraiGame.closeGame()">
                        <span>EXIT TO ARCADE</span>
                    </button>
                </div>
            </div>
        `;
    }

    startLevel(lvlNum) {
        this.currentLevel = lvlNum;
        this.currentQIndex = 0;
        this.lives = 3;
        this.score = 0;
        this.combo = 0;
        this.bossHP = 100;
        this.mazeProgress = 0;
        this.raceLaps = 0;
        this.hintUsed = false;
        if (window.miraiAudio) window.miraiAudio.playClick?.();
        this.renderStage();
    }

    getCurrentQuestions() {
        if (this.currentGame && this.currentGame.levels && this.currentLevel) {
            const lvl = this.currentGame.levels.find(l => l.level === this.currentLevel);
            if (lvl && Array.isArray(lvl.questions)) {
                return lvl.questions;
            }
        }
        return (this.currentGame && this.currentGame.questions) || [];
    }

    closeGame() {
        if (!this.modal) this.modal = document.getElementById('gameModal');
        if (this.modal) {
            this.modal.classList.remove('active');
            this.modal.style.setProperty('display', 'none', 'important');
            this.modal.style.setProperty('pointer-events', 'none', 'important');
            this.modal.style.setProperty('visibility', 'hidden', 'important');
            document.body.style.overflow = 'auto';
        }
        clearInterval(this.timerInterval);
        if (this.cleanup3D) {
            this.cleanup3D();
            this.cleanup3D = null;
        }
    }

    renderStage() {
        if (!this.currentGame) return;

        const activeQuestions = this.getCurrentQuestions();
        const totalQCount = activeQuestions.length || 10;
        const q = activeQuestions[this.currentQIndex] || {};
        const progress = Math.round((this.currentQIndex / totalQCount) * 100);
        this.hintUsed = false;
        this.questionStartTime = Date.now();

        const promptText = q.prompt || q.q || q.question || 'Evaluate the logic below and select the correct answer:';
        const qNumber = q.num || (this.currentQIndex + 1);
        const qType = q.type || 'Academic Problem';
        const qHint = q.hint || q.explain || 'Carefully trace each token and branch.';
        const qOptions = Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];

        let mechanicHtml = this.getMechanicVisuals();

        this.container.innerHTML = `
            <!-- Sticky Top Bar with High-Visibility Exit Button -->
            <div class="game-top-sticky-bar">
                <div class="gt-left-badge">⛩️ ${this.escapeHtml(this.currentGame.title)}${this.currentGame.levels ? ` // LEVEL ${this.currentLevel}` : ''}</div>
                <div class="gt-actions-right">
                    ${this.currentGame.levels ? `
                        <button type="button" class="floating-game-cases-btn" onclick="window.miraiGame.renderLevelSelect()" title="View All Case Dossiers">
                            <span>📋 ARCHIVES</span>
                        </button>
                    ` : ''}
                    <button type="button" class="floating-game-close-btn" onclick="window.miraiGame.closeGame()" title="Exit Game & Return (Esc)">
                        <span>✕ EXIT GAME</span>
                    </button>
                </div>
            </div>

            <div class="game-hud">
                <div class="hud-left">
                    <span class="hud-tag">${this.escapeHtml(this.currentGame.trackName || 'CURRICULUM TRIAL')}</span>
                    <h3 class="hud-title">${this.escapeHtml(this.currentGame.title)}</h3>
                    <div class="hud-topic">Topic ${this.currentGame.topicNum || 1}: ${this.escapeHtml(this.currentGame.topic || 'Core Module')}</div>
                </div>
                <div class="hud-right">
                    <div class="hud-stat"><span class="stat-label">LIVES</span> <span class="stat-val heart-val">${'❤️'.repeat(Math.max(0, this.lives))}</span></div>
                    <div class="hud-stat"><span class="stat-label">SCORE</span> <span class="stat-val score-val">${this.score} XP</span></div>
                    <div class="hud-stat"><span class="stat-label">COMBO</span> <span class="stat-val combo-val">${this.combo}x 🔥</span></div>
                    <button type="button" class="game-close-btn" onclick="window.miraiGame.closeGame()" title="Close Game">✕</button>
                </div>
            </div>

            ${this.currentGame.levels ? `
                <!-- Level Switcher Quick Bar -->
                <div class="level-indicator-bar">
                    <span class="level-indicator-tag">ACTIVE LEVEL:</span>
                    <div class="level-pill-group">
                        ${this.currentGame.levels.map(l => `
                            <button type="button" class="level-pill-btn ${l.level === this.currentLevel ? 'active' : ''}" 
                                onclick="window.miraiGame.startLevel(${l.level})" title="${this.escapeHtml(l.title)}">
                                <span>LVL ${l.level}</span>
                                <span class="pill-count">(${l.questions.length}Q)</span>
                            </button>
                        `).join('')}
                        <button type="button" class="level-pill-btn select-all-btn" onclick="window.miraiGame.renderLevelSelect()" title="View All Case Archives">
                            <span>📋 ARCHIVES</span>
                        </button>
                    </div>
                </div>
            ` : ''}

            <!-- Progress bar -->
            <div class="game-progress-track">
                <div class="game-progress-fill" style="width: ${progress}%"></div>
            </div>

            <!-- Custom Mechanic Anime Stage -->
            <div class="mechanic-stage ${this.currentGame.mechanic}">
                ${mechanicHtml}
            </div>

            <!-- Story & Rule Banner -->
            <div class="game-story-card">
                <div class="story-icon">📜</div>
                <div class="story-text">
                    <strong>Case File:</strong> ${this.escapeHtml(this.currentGame.story || 'Complete the curriculum simulation.')}
                </div>
            </div>

            <!-- Question Card -->
            <div class="question-card" id="currentQuestionCard">
                <div class="question-header">
                    <span class="q-badge">Question ${qNumber} of ${totalQCount}</span>
                    <span class="q-type-badge">${this.escapeHtml(qType)}</span>
                    <button type="button" class="hint-trigger-btn" id="hintBtn" onclick="window.miraiGame.revealHint()">
                        💡 Need Clue? (-5 XP)
                    </button>
                </div>

                <div class="q-prompt">${this.escapeHtml(promptText)}</div>

                ${q.code ? `
                    <div class="code-terminal">
                        <div class="code-terminal-header">
                            <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                            <span class="terminal-title">mirai-compiler://${this.currentGame.track || 'terminal'}.cpp</span>
                        </div>
                        <pre><code>${this.escapeHtml(q.code)}</code></pre>
                    </div>
                ` : ''}

                <div class="hint-box" id="hintBox" style="display: none;">
                    <strong>Investigation Clue:</strong> ${this.escapeHtml(qHint)}
                </div>

                <!-- Answer Options -->
                <div class="options-grid">
                    ${qOptions.map((opt, idx) => `
                        <button type="button" class="option-btn" onclick="window.miraiGame.submitAnswer(${idx})">
                            <span class="opt-key">${String.fromCharCode(65 + idx)}</span>
                            <span class="opt-label">${this.escapeHtml(opt)}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- Feedback Area -->
                <div class="feedback-panel" id="feedbackPanel" style="display: none;"></div>
            </div>
        `;

        // Mount In-Game 3D Interactive Viewport
        const stageEl = this.container.querySelector('.mechanic-stage');
        if (stageEl && window.mirai3D) {
            if (this.cleanup3D) this.cleanup3D();
            this.cleanup3D = window.mirai3D.mount3DGameStage(stageEl, this.currentGame.mechanic);
        }
    }

    getMechanicVisuals() {
        const m = this.currentGame.mechanic;
        const qNum = this.currentQIndex + 1;

        if (m === 'boss_battle') {
            const currentLevelObj = (this.currentGame.levels && this.currentGame.levels.find(l => l.level === this.currentLevel));
            const levelLabel = currentLevelObj ? ` // ${currentLevelObj.title.toUpperCase()}` : '';
            return `
                <div class="boss-arena">
                    <div class="boss-nameplate">
                        <span class="boss-title">CYBER MECHA DEMON // ONI-09${levelLabel}</span>
                        <span class="boss-hp-text">${this.bossHP} / 100 HP</span>
                    </div>
                    <div class="boss-hp-track">
                        <div class="boss-hp-fill" style="width: ${this.bossHP}%"></div>
                    </div>
                    <div class="boss-visual-container">
                        <div class="boss-sprite">👹⚡</div>
                        <div class="battle-slash-effect" id="slashFx"></div>
                        <div class="damage-number" id="dmgNumber"></div>
                    </div>
                </div>
            `;
        } else if (m === 'detective') {
            const currentLevelObj = (this.currentGame.levels && this.currentGame.levels.find(l => l.level === this.currentLevel));
            const levelLabel = currentLevelObj ? ` // ${currentLevelObj.title.toUpperCase()}` : '';
            return `
                <div class="detective-crime-scene">
                    <div class="scene-radar">
                        <div class="radar-sweep"></div>
                        <div class="radar-dot dot1"></div>
                        <div class="radar-dot dot2"></div>
                    </div>
                    <div class="evidence-board">
                        <div class="evidence-tag">CRIME SCENE #${qNum}${levelLabel}</div>
                        <div class="evidence-desc">Scanning compiler traces for logical anomalies...</div>
                    </div>
                </div>
            `;
        } else if (m === 'box_sort') {
            const currentLevelObj = (this.currentGame.levels && this.currentGame.levels.find(l => l.level === this.currentLevel));
            const levelLabel = currentLevelObj ? ` // ${currentLevelObj.title.toUpperCase()}` : '';
            return `
                <div class="warehouse-stage">
                    <div class="warehouse-drop-item" id="warehouseItem">
                        <span class="cargo-tag">DATA CARGO #${qNum}${levelLabel}</span>
                    </div>
                    <div class="warehouse-bins">
                        <div class="w-bin bin-int"><span>int</span></div>
                        <div class="w-bin bin-float"><span>float</span></div>
                        <div class="w-bin bin-char"><span>char</span></div>
                        <div class="w-bin bin-bool"><span>bool</span></div>
                        <div class="w-bin bin-string"><span>string</span></div>
                    </div>
                </div>
            `;
        } else if (m === 'maze_runner') {
            const activeQuestions = this.getCurrentQuestions();
            const totalSteps = (activeQuestions && activeQuestions.length) || 10;
            const pct = Math.min(94, (this.mazeProgress / Math.max(1, totalSteps)) * 100);
            return `
                <div class="maze-stage">
                    <div class="maze-gates-track">
                        ${Array.from({ length: totalSteps }, (_, i) => `
                            <div class="maze-gate-step ${i < this.mazeProgress ? 'cleared' : (i === this.mazeProgress ? 'active' : '')}">
                                <span>${i < this.mazeProgress ? '✓' : (i + 1)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="runner-avatar-track">
                        <span class="runner-avatar" style="left: ${pct}%">🏃‍♂️💨</span>
                    </div>
                </div>
            `;
        } else if (m === 'loop_racer') {
            const activeQuestions = this.getCurrentQuestions();
            const totalLaps = (activeQuestions && activeQuestions.length) || 10;
            const nitroPct = Math.round((this.raceLaps / Math.max(1, totalLaps)) * 100);
            const carLeftPct = Math.min(92, (this.raceLaps / Math.max(1, totalLaps)) * 92);
            return `
                <div class="racing-stage">
                    <div class="race-speedometer">
                        <span class="speed-val">NITRO: ${nitroPct}%</span>
                        <span class="laps-counter">LAPS COMPLETED: ${this.raceLaps} / ${totalLaps}</span>
                    </div>
                    <div class="race-track-view">
                        <div class="neon-track-line"></div>
                        <div class="race-car" style="left: ${carLeftPct}%">🏎️🔥</div>
                    </div>
                </div>
            `;
        } else if (m === 'pattern_builder') {
            return `
                <div class="pattern-stage">
                    <div class="voxel-grid-preview" id="patternPreview">
                        <div class="voxel-row">★ ★ ★</div>
                        <div class="voxel-row">★ ★</div>
                        <div class="voxel-row">★</div>
                    </div>
                    <div class="pattern-status">VOXEL BLUEPRINT #${qNum} READY</div>
                </div>
            `;
        } else if (m === 'function_factory') {
            return `
                <div class="factory-stage">
                    <div class="factory-pipe pipe-in"><span>INPUT HOPPER ➔</span></div>
                    <div class="factory-machine">⚙️ CONVERTER MACHINE #${String(qNum).padStart(2, '0')} ⚙️</div>
                    <div class="factory-pipe pipe-out"><span>➔ OUTPUT CONDUIT</span></div>
                </div>
            `;
        } else if (m === 'house_builder') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="house-builder-stage">
                    <div class="house-blueprint-scaffold">
                        <div class="house-beam beam-roof ${progressPct >= 70 ? 'active' : ''}"><span>▲ ROOF &lt;body&gt;</span></div>
                        <div class="house-beam beam-walls ${progressPct >= 40 ? 'active' : ''}"><span>■ PILLARS &lt;head&gt; + &lt;title&gt;</span></div>
                        <div class="house-beam beam-foundation ${progressPct >= 10 ? 'active' : ''}"><span>▄ FOUNDATION &lt;!DOCTYPE html&gt; + &lt;html&gt;</span></div>
                    </div>
                    <div class="house-builder-status">
                        <span class="hb-badge">DOM SCAFFOLDING</span>
                        <span class="hb-progress">${progressPct}% ASSEMBLED (${progress}/${totalQCount} BLOCKS)</span>
                    </div>
                </div>
            `;
        } else if (m === 'fashion_show') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="fashion-show-stage">
                    <div class="fashion-runway-track">
                        <div class="runway-spotlight">✨ 💃 CYBER RUNWAY MODEL #${String(Math.min(totalQCount, progress + 1)).padStart(2, '0')} 🕺 ✨</div>
                        <div class="runway-text-preview">
                            <span class="preview-tag">&lt;h1&gt;</span>
                            <span class="preview-styled-text">FASHION TYPOGRAPHY</span>
                            <span class="preview-tag">&lt;/h1&gt;</span>
                        </div>
                    </div>
                    <div class="fashion-status-bar">
                        <span class="fashion-badge">RUNWAY SPOTLIGHT</span>
                        <span class="fashion-progress">${progress}/${totalQCount} MODELS STYLED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else if (m === 'shopping_list') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="shopping-list-stage">
                    <div class="shopping-cart-container">
                        <div class="cart-header">🛒 CYBER MARKET INVENTORY CART</div>
                        <div class="cart-items-preview">
                            <span class="cart-tag">&lt;ul&gt;</span>
                            <span class="cart-item-slot ${progress >= 1 ? 'filled' : ''}">[📦 &lt;li&gt;ITEM 01&lt;/li&gt;]</span>
                            <span class="cart-item-slot ${progress >= 5 ? 'filled' : ''}">[📦 &lt;li&gt;ITEM 05&lt;/li&gt;]</span>
                            <span class="cart-item-slot ${progress >= 10 ? 'filled' : ''}">[📦 &lt;li&gt;ITEM 10&lt;/li&gt;]</span>
                            <span class="cart-tag">&lt;/ul&gt;</span>
                        </div>
                    </div>
                    <div class="shopping-status-bar">
                        <span class="cart-badge">CART CAPACITY</span>
                        <span class="cart-progress">${progress}/${totalQCount} ITEMS STOCKED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else if (m === 'treasure_map') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="treasure-map-stage">
                    <div class="treasure-map-container">
                        <div class="map-header">🧭 CYBERSPACE NAVIGATION RADAR</div>
                        <div class="map-archipelago-preview">
                            <span class="map-route-node ${progress >= 0 ? 'visited' : ''}">⚓ [PORT 00]</span>
                            <span class="map-route-line">━━━▶</span>
                            <span class="map-route-node ${progress >= 3 ? 'visited' : ''}">🏝️ [ISLE 03]</span>
                            <span class="map-route-line">━━━▶</span>
                            <span class="map-route-node ${progress >= 7 ? 'visited' : ''}">🌊 [REEF 07]</span>
                            <span class="map-route-line">━━━▶</span>
                            <span class="map-route-node ${progress >= totalQCount ? 'visited' : ''}">👑 [TREASURE]</span>
                        </div>
                    </div>
                    <div class="map-status-bar">
                        <span class="map-badge">EXPEDITION ROUTE</span>
                        <span class="map-progress">${progress}/${totalQCount} WAYPOINTS CHARTED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else if (m === 'gallery_puzzle') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="gallery-puzzle-stage">
                    <div class="gallery-canvas-container">
                        <div class="gallery-header">🖼️ MIRAI HOLOGRAPHIC ART GALLERY</div>
                        <div class="gallery-frames-grid">
                            <span class="art-frame ${progress >= 1 ? 'mounted' : ''}">🖼️ [FRAME 01]</span>
                            <span class="art-frame ${progress >= 4 ? 'mounted' : ''}">🎨 [FRAME 04]</span>
                            <span class="art-frame ${progress >= 8 ? 'mounted' : ''}">📽️ [FRAME 08]</span>
                            <span class="art-frame ${progress >= totalQCount ? 'mounted' : ''}">🌟 [MASTERPIECE]</span>
                        </div>
                    </div>
                    <div class="gallery-status-bar">
                        <span class="gallery-badge">CURATOR EXHIBIT</span>
                        <span class="gallery-progress">${progress}/${totalQCount} EXHIBITS MOUNTED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else if (m === 'timetable_builder') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="timetable-builder-stage">
                    <div class="timetable-grid-container">
                        <div class="timetable-header">📊 ACADEMY TIMETABLE MATRIX</div>
                        <div class="timetable-matrix-preview">
                            <div class="matrix-row header-row">
                                <span class="matrix-cell th-cell">&lt;th&gt;PERIOD&lt;/th&gt;</span>
                                <span class="matrix-cell th-cell">&lt;th&gt;MON&lt;/th&gt;</span>
                                <span class="matrix-cell th-cell">&lt;th&gt;TUE&lt;/th&gt;</span>
                            </div>
                            <div class="matrix-row">
                                <span class="matrix-cell ${progress >= 1 ? 'filled' : ''}">&lt;td&gt;01&lt;/td&gt;</span>
                                <span class="matrix-cell ${progress >= 4 ? 'filled' : ''}">&lt;td&gt;MATH&lt;/td&gt;</span>
                                <span class="matrix-cell ${progress >= 7 ? 'filled' : ''}">&lt;td&gt;CODE&lt;/td&gt;</span>
                            </div>
                        </div>
                    </div>
                    <div class="timetable-status-bar">
                        <span class="timetable-badge">GRID CELLS</span>
                        <span class="timetable-progress">${progress}/${totalQCount} CELLS ASSEMBLED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else if (m === 'desk_rush') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="desk-rush-stage">
                    <div class="desk-queue-container">
                        <div class="desk-header">📝 MIRAI ADMISSIONS REGISTRATION DESK</div>
                        <div class="desk-queue-preview">
                            <span class="queue-cadet ${progress >= 1 ? 'processed' : ''}">🪪 [CADET 01]</span>
                            <span class="queue-cadet ${progress >= 4 ? 'processed' : ''}">🪪 [CADET 04]</span>
                            <span class="queue-cadet ${progress >= 8 ? 'processed' : ''}">🪪 [CADET 08]</span>
                            <span class="queue-cadet ${progress >= totalQCount ? 'processed' : ''}">🎓 [ADMITTED]</span>
                        </div>
                    </div>
                    <div class="desk-status-bar">
                        <span class="desk-badge">ADMISSION QUEUE</span>
                        <span class="desk-progress">${progress}/${totalQCount} CADETS PROCESSED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else if (m === 'city_planner') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="city-planner-stage">
                    <div class="city-skyline-container">
                        <div class="city-header">🏙️ NEO-TOKYO METROPOLITAN BLUEPRINT</div>
                        <div class="city-sectors-preview">
                            <span class="city-zone ${progress >= 1 ? 'zoned' : ''}">🏛️ &lt;header&gt;</span>
                            <span class="city-zone ${progress >= 3 ? 'zoned' : ''}">🚇 &lt;nav&gt;</span>
                            <span class="city-zone ${progress >= 5 ? 'zoned' : ''}">🏢 &lt;main&gt;</span>
                            <span class="city-zone ${progress >= 8 ? 'zoned' : ''}">🏬 &lt;aside&gt;</span>
                            <span class="city-zone ${progress >= totalQCount ? 'zoned' : ''}">⚓ &lt;footer&gt;</span>
                        </div>
                    </div>
                    <div class="city-status-bar">
                        <span class="city-badge">URBAN ZONING</span>
                        <span class="city-progress">${progress}/${totalQCount} SECTORS ZONED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else if (m === 'conveyor_sort') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="conveyor-sort-stage">
                    <div class="conveyor-belt-container">
                        <div class="conveyor-header">⚡ RENDERING PIPELINE CONVEYOR BELT</div>
                        <div class="conveyor-bins-preview">
                            <div class="conveyor-bin block-bin">
                                <span class="bin-label">📦 BLOCK BIN</span>
                                <span class="bin-tag ${progress >= 1 ? 'sorted' : ''}">&lt;div&gt;</span>
                                <span class="bin-tag ${progress >= 5 ? 'sorted' : ''}">&lt;p&gt;</span>
                            </div>
                            <div class="conveyor-divider">⚡</div>
                            <div class="conveyor-bin inline-bin">
                                <span class="bin-label">🔗 INLINE BIN</span>
                                <span class="bin-tag ${progress >= 3 ? 'sorted' : ''}">&lt;span&gt;</span>
                                <span class="bin-tag ${progress >= 8 ? 'sorted' : ''}">&lt;a&gt;</span>
                            </div>
                        </div>
                    </div>
                    <div class="conveyor-status-bar">
                        <span class="conveyor-badge">SORTING ACCURACY</span>
                        <span class="conveyor-progress">${progress}/${totalQCount} TAGS CLASSIFIED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else if (m === 'secret_codes') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const progress = Math.min(totalQCount, this.currentQIndex);
            const progressPct = Math.round((progress / totalQCount) * 100);
            return `
                <div class="secret-codes-stage">
                    <div class="secret-terminal-container">
                        <div class="terminal-header">🕵️ MIRAI INTELLIGENCE CIPHER TERMINAL</div>
                        <div class="terminal-ciphers-preview">
                            <span class="cipher-node ${progress >= 1 ? 'decrypted' : ''}">🔐 &amp;lt;</span>
                            <span class="cipher-node ${progress >= 3 ? 'decrypted' : ''}">📜 &lt;!-- --&gt;</span>
                            <span class="cipher-node ${progress >= 6 ? 'decrypted' : ''}">🛰️ &lt;iframe&gt;</span>
                            <span class="cipher-node ${progress >= 8 ? 'decrypted' : ''}">🏷️ &lt;meta&gt;</span>
                            <span class="cipher-node ${progress >= totalQCount ? 'decrypted' : ''}">💎 [DECRYPTED]</span>
                        </div>
                    </div>
                    <div class="terminal-status-bar">
                        <span class="terminal-badge">CIPHER DECRYPTION</span>
                        <span class="terminal-progress">${progress}/${totalQCount} INTEL INTERCEPTED (${progressPct}%)</span>
                    </div>
                </div>
            `;
        } else {
            // Web HTML themes
            return `
                <div class="generic-theme-stage">
                    <div class="theme-icon-badge">${this.currentGame.badge.icon}</div>
                    <div class="theme-tagline">${this.currentGame.rules}</div>
                </div>
            `;
        }
    }

    revealHint() {
        if (this.hintUsed) return;
        this.hintUsed = true;
        const box = document.getElementById('hintBox');
        const btn = document.getElementById('hintBtn');
        if (box) box.style.display = 'block';
        if (btn) {
            btn.disabled = true;
            btn.innerText = '💡 Clue Active (-5 XP)';
        }
        if (window.miraiAudio) window.miraiAudio.playClick();
    }

    submitAnswer(chosenIdx) {
        const activeQuestions = this.getCurrentQuestions();
        const q = (activeQuestions && activeQuestions[this.currentQIndex]) || {};
        const targetCorrect = (typeof q.correctIndex === 'number') ? q.correctIndex : (typeof q.correct === 'number' ? q.correct : 0);
        const isCorrect = chosenIdx === targetCorrect;
        const fbPanel = document.getElementById('feedbackPanel');
        const optionBtns = document.querySelectorAll('.option-btn');
        const timeTaken = (Date.now() - this.questionStartTime) / 1000;
        const durationMs = Date.now() - (this.questionStartTime || Date.now());
        const isCritical = timeTaken <= 10;

        // Pedagogical Integrity Telemetry
        if (window.msotIntegrity && typeof window.msotIntegrity.monitorEvent === 'function') {
            window.msotIntegrity.monitorEvent(isCorrect ? 'QUESTION_SOLVED' : 'ATTEMPT_FAILED', {
                question_id: `${this.currentGame?.id || 'game'}_q${this.currentQIndex}`,
                difficulty: this.currentGame?.difficulty || 'MEDIUM',
                duration_ms: durationMs,
                trusted_start_time: !!this.questionStartTime,
                solution_verified: true,
                answer: chosenIdx
            });
        }


        // Disable all option buttons
        optionBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === targetCorrect) {
                btn.classList.add('correct');
            } else if (idx === chosenIdx) {
                btn.classList.add('wrong');
            }
        });

        if (isCorrect) {
            this.combo++;
            let earnedXP = this.hintUsed ? 5 : 10;
            if (this.combo >= 3) earnedXP += 5; // Combo bonus

            this.score += earnedXP;

            // Trigger specific mechanic animations
            this.triggerMechanicSuccess(isCritical);

            // Trigger anime speedlines
            const speedlines = document.getElementById('animeSpeedlines');
            if (speedlines) {
                speedlines.classList.add('active');
                setTimeout(() => speedlines.classList.remove('active'), 650);
            }

            if (window.miraiAudio) {
                if (isCritical) {
                    window.miraiAudio.playLaser();
                } else {
                    window.miraiAudio.playSlash();
                }
                setTimeout(() => window.miraiAudio.playSuccess(), 120);
            }

            fbPanel.innerHTML = `
                <div class="fb-card success">
                    <div class="fb-title">
                        ✅ EXCELLENT EXECUTION! +${earnedXP} XP ${isCritical ? '⚡ CRITICAL HIT!' : ''}
                    </div>
                    <div class="fb-explanation">${q.explanation}</div>
                    <button class="fb-next-btn" onclick="window.miraiGame.nextQuestion()">CONTINUE ➔</button>
                </div>
            `;
        } else {
            this.combo = 0;
            this.lives--;
            this.triggerMechanicFailure();

            // Trigger screen shake
            const arenaCard = document.querySelector('.game-arena-card');
            if (arenaCard) {
                arenaCard.classList.add('screen-shake');
                setTimeout(() => arenaCard.classList.remove('screen-shake'), 450);
            }

            if (window.miraiAudio) {
                window.miraiAudio.playError();
            }

            // Update hearts in HUD
            const heartDisplay = document.querySelector('.heart-val');
            if (heartDisplay) heartDisplay.innerText = this.lives > 0 ? '❤️'.repeat(this.lives) : '💀 DEAD';

            fbPanel.innerHTML = `
                <div class="fb-card error">
                    <div class="fb-title">
                        ❌ COMPILATION ANOMALY! (-1 Heart)
                    </div>
                    <div class="fb-explanation">${q.explanation}</div>
                    ${this.lives > 0 ? `
                        <button class="fb-next-btn" onclick="window.miraiGame.nextQuestion()">TRY NEXT CASE ➔</button>
                    ` : `
                        <button class="fb-retry-btn" onclick="window.miraiGame.openGame('${this.currentGame.id}')">SYSTEM OVERLOAD: RETRY MISSION ↺</button>
                    `}
                </div>
            `;
        }

        fbPanel.style.display = 'block';

        // Update score & combo in HUD
        const scoreDisplay = document.querySelector('.score-val');
        const comboDisplay = document.querySelector('.combo-val');
        if (scoreDisplay) scoreDisplay.innerText = `${this.score} XP`;
        if (comboDisplay) comboDisplay.innerText = `${this.combo}x 🔥`;
    }

    triggerMechanicSuccess(isCritical) {
        const m = this.currentGame.mechanic;

        if (m === 'boss_battle') {
            const activeQuestions = this.getCurrentQuestions();
            const totalQCount = (activeQuestions && activeQuestions.length) || 10;
            const baseDamage = Math.ceil(100 / totalQCount);
            const damage = isCritical ? Math.min(this.bossHP, Math.ceil(baseDamage * 1.5)) : Math.min(this.bossHP, baseDamage);
            this.bossHP = Math.max(0, this.bossHP - damage);
            const hpFill = document.querySelector('.boss-hp-fill');
            const hpText = document.querySelector('.boss-hp-text');
            const slashFx = document.getElementById('slashFx');
            const dmgNum = document.getElementById('dmgNumber');

            if (hpFill) hpFill.style.width = `${this.bossHP}%`;
            if (hpText) hpText.innerText = `${this.bossHP} / 100 HP`;

            if (slashFx) {
                slashFx.classList.add('active');
                setTimeout(() => slashFx.classList.remove('active'), 500);
            }
            if (dmgNum) {
                dmgNum.innerText = `-${damage} HP!`;
                dmgNum.classList.add('pop');
                setTimeout(() => dmgNum.classList.remove('pop'), 700);
            }
        } else if (m === 'maze_runner') {
            const activeQuestions = this.getCurrentQuestions();
            const maxProgress = (activeQuestions && activeQuestions.length) || 10;
            this.mazeProgress = Math.min(maxProgress, this.mazeProgress + 1);
        } else if (m === 'loop_racer') {
            const activeQuestions = this.getCurrentQuestions();
            const maxLaps = (activeQuestions && activeQuestions.length) || 10;
            this.raceLaps = Math.min(maxLaps, this.raceLaps + 1);
        }
    }

    triggerMechanicFailure() {
        const m = this.currentGame.mechanic;
        if (m === 'maze_runner') {
            this.mazeProgress = Math.max(0, this.mazeProgress - 1);
        } else if (m === 'loop_racer') {
            this.raceLaps = Math.max(0, this.raceLaps - 1);
        }
    }

    nextQuestion() {
        const activeQuestions = this.getCurrentQuestions();
        const totalQCount = (activeQuestions && activeQuestions.length) || 10;
        this.currentQIndex++;
        if (this.currentQIndex < totalQCount && this.lives > 0) {
            this.renderStage();
        } else {
            this.finishGame();
        }
    }

    finishGame() {
        // Victory or Defeat
        const isVictory = this.lives > 0;
        const currentLevelObj = this.currentGame.levels && this.currentLevel
            ? this.currentGame.levels.find(l => l.level === this.currentLevel)
            : null;
        const badge = currentLevelObj?.badge || this.currentGame.badge;

        if (isVictory) {
            // Award Level Badge & Platform XP
            if (window.msotState?.awardBadge && badge?.id) {
                window.msotState.awardBadge(badge.id);
            }
            if (window.msotState?.recordXP) {
                const clearTitle = currentLevelObj ? `${currentLevelObj.title} Clear` : `${this.currentGame.title} Clear`;
                window.msotState.recordXP('GAME_TOPIC_CLEAR', this.score, clearTitle);
            }
            if (window.msotState?.student) {
                const lvlKey = currentLevelObj ? `${this.currentGame.id}_lvl${this.currentLevel}` : this.currentGame.id;
                if (!window.msotState.student.completedGames.includes(lvlKey)) {
                    window.msotState.student.completedGames.push(lvlKey);
                }
                const isFinalLevel = !this.currentGame.levels || (this.currentLevel === this.currentGame.levels.length);
                if (isFinalLevel && !window.msotState.student.completedGames.includes(this.currentGame.id)) {
                    window.msotState.student.completedGames.push(this.currentGame.id);
                }
                window.msotState.save();
            }

            if (window.miraiAudio) {
                window.miraiAudio.playBadgeFanfare?.();
            }

            const hasNextLevel = this.currentGame.levels && (this.currentLevel < this.currentGame.levels.length);
            const nextLevelNum = this.currentLevel + 1;

            this.container.innerHTML = `
                <div class="victory-modal">
                    <div class="victory-halo">✨</div>
                    <div class="victory-badge-icon">${badge.icon}</div>
                    <h2 class="victory-title">${currentLevelObj ? `${currentLevelObj.title.toUpperCase()} CLEARED!` : 'STAGE COMPLETE!'}</h2>
                    <h4 class="victory-badge-name">Unlocked Badge: ${badge.name}</h4>
                    <p class="victory-desc">${badge.desc}</p>
                    <div class="victory-stats">
                        <div class="v-stat"><span class="v-label">XP EARNED</span><span class="v-num">+${this.score} XP</span></div>
                        <div class="v-stat"><span class="v-label">REMAINING HEARTS</span><span class="v-num">${'❤️'.repeat(this.lives)}</span></div>
                        <div class="v-stat"><span class="v-label">HIGHEST COMBO</span><span class="v-num">${this.combo}x</span></div>
                    </div>
                    <div class="victory-actions">
                        ${hasNextLevel ? `
                            <button class="primary-btn" onclick="window.miraiGame.startLevel(${nextLevelNum})">
                                PROCEED TO LEVEL ${nextLevelNum} ➔
                            </button>
                            <button class="secondary-btn" onclick="window.miraiGame.renderLevelSelect()">
                                CASE ARCHIVES (CHOOSE LEVEL) 📋
                            </button>
                        ` : (this.currentGame.levels ? `
                            <button class="primary-btn" onclick="window.miraiGame.renderLevelSelect()">
                                ALL LEVELS COMPLETED! VIEW DOSSIERS 🏆
                            </button>
                            <button class="secondary-btn" onclick="window.miraiGame.startLevel(${this.currentLevel})">
                                REPLAY LEVEL ${this.currentLevel} ↺
                            </button>
                        ` : '')}
                        <button class="${hasNextLevel ? 'secondary-btn' : 'primary-btn'}" onclick="window.miraiGame.closeGame(); window.msotPlatform?.refreshAll?.();">
                            COLLECT REWARD & RETURN TO ARCADE ➔
                        </button>
                    </div>
                </div>
            `;
        } else {
            this.container.innerHTML = `
                <div class="victory-modal defeat">
                    <div class="victory-halo">💀</div>
                    <h2 class="victory-title">MISSION FAILED</h2>
                    <p class="victory-desc">You ran out of lives during ${currentLevelObj ? currentLevelObj.title : 'the cyber trial'}. Review your concepts and challenge again!</p>
                    <div class="victory-actions">
                        <button class="primary-btn" onclick="${this.currentGame.levels ? `window.miraiGame.startLevel(${this.currentLevel})` : `window.miraiGame.openGame('${this.currentGame.id}')`}">
                            RETRY ${currentLevelObj ? 'LEVEL ' + this.currentLevel : 'SIMULATION'} ↺
                        </button>
                        ${this.currentGame.levels ? `
                            <button class="secondary-btn" onclick="window.miraiGame.renderLevelSelect()">
                                CHOOSE ANOTHER LEVEL 📋
                            </button>
                        ` : ''}
                        <button class="secondary-btn" onclick="window.miraiGame.closeGame()">
                            EXIT TO ARCADE
                        </button>
                    </div>
                </div>
            `;
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

window.miraiGame = new MiraiGameEngine();
