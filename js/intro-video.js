/**
 * Mirai School of Technology — Cinematic Guardian Protocol Intro
 * Sacred Mask Split & Sanskrit Reveal ("अंतः अस्ति प्रारंभ")
 *
 * Cinematic Choreography & Timeline:
 * 0.0s – 1.8s: Pitch-black void, deep sub-drone, atmospheric smoke & drifting ash.
 * 1.8s – 5.0s: Intimidating ancient mask emerges with 3D Dolly Zoom & living levitation float.
 *              Anamorphic specular light gleams across metal contours; demonic eyes awaken with laser flares.
 * 5.0s – 5.8s: Center fissure crack ignites with blazing molten laser light and seam sparks.
 * 5.8s – 7.0s: CAMERA SHAKE + CINEMATIC BASS BOOM + SHOCKWAVE!
 *              Mask physically splits into two symmetrical halves, moving apart in 3D perspective.
 * 7.0s – 10.2s: Sanskrit sacred reveal: "अंतः अस्ति प्रारंभ" (END IS THE NEW BEGINNING) forged from fire.
 * 10.2s – 12.0s: Brand forged reveal: "MIRAI SCHOOL OF TECHNOLOGY" with sweeping light rays.
 * 12.0s – 15.0s: Interactive "⚔ OPEN DASHBOARD ⚔" button emerges with flowing fire border.
 *
 * Performance:
 * Ultra-high 60–120 FPS rendering pipeline using offscreen cached particle sprites,
 * hardware-accelerated additive composite blending ('lighter'), and zero CPU Gaussian blur stalls.
 */

(function () {
    'use strict';

    const STORAGE_KEY_INTRO_SEEN = 'msot_intro_seen_v1';
    const BGM_AUDIO_SRC = 'assets/audio/asur_dark_side_intro_bgm.mp3';

    class IntroVideoController {
        constructor() {
            // DOM Elements
            this.overlay = null;
            this.stage = null;
            this.maskViewport = null;
            this.maskSolid = null;
            this.crackOverlay = null;
            this.maskLeft = null;
            this.maskRight = null;
            this.innerSanctum = null;
            this.shockwaveRing = null;
            this.sanskritContainer = null;
            this.brandContainer = null;
            this.heroVideo = null;
            this.ambientVideo = null;
            this.canvas = null;
            this.ctx = null;
            this.bgmAudio = null;
            this.unmuteBtn = null;
            this.portalOverlay = null;

            // Audio Context
            this.audioCtx = null;
            this.isSoundEnabled = false;

            // State flags
            this.isOpen = false;
            this.isPlaying = false;
            this.isTransitioning = false;
            this.maskSplitOccurred = false;

            // High-Performance Particles
            this.ambientEmbers = [];
            this.vortexEmbers = [];
            this.fissureEmbers = [];
            this.smokePuffs = [];
            this.animationFrameId = null;

            // Pre-rendered Cached Sprites for Max FPS
            this.spriteGold = null;
            this.spriteRed = null;
            this.spriteSmoke = null;

            // Timers
            this.timelineTimeouts = [];

            // 3D Mouse Parallax
            this.mouseX = 0;
            this.mouseY = 0;
            this.currentTiltX = 0;
            this.currentTiltY = 0;
        }

        init() {
            this.cacheDom();
            this.initParticleSprites();
            this.initCanvas();
            this.bindEvents();

            if (this.bgmAudio) {
                this.bgmAudio.src = BGM_AUDIO_SRC;
                this.bgmAudio.loop = true;
                this.bgmAudio.volume = 0.95;
                this.bgmAudio.load();
            }

            // Auto-trigger on initial visit or #/intro hash
            const hasSeen = sessionStorage.getItem(STORAGE_KEY_INTRO_SEEN);
            const isIntroHash = window.location.hash === '#/intro';

            if (isIntroHash || (!hasSeen && (window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#/dashboard' || window.location.hash === '#/gates'))) {
                setTimeout(() => {
                    this.playIntro();
                }, 350);
            }
        }

        cacheDom() {
            this.overlay = document.getElementById('msotIntroOverlay');
            this.stage = document.getElementById('msotIntroStage');
            this.maskViewport = document.getElementById('msotMaskViewport');
            this.maskSolid = document.getElementById('msotMaskSolid');
            this.crackOverlay = document.getElementById('msotCrackOverlay');
            this.maskLeft = document.getElementById('msotMaskLeft');
            this.maskRight = document.getElementById('msotMaskRight');
            this.innerSanctum = document.getElementById('msotInnerSanctum');
            this.shockwaveRing = document.getElementById('msotShockwaveRing');
            this.sanskritContainer = document.getElementById('msotSanskritContainer');
            this.brandContainer = document.getElementById('msotBrandContainer');
            this.heroVideo = document.getElementById('msotHeroVideo');
            this.ambientVideo = document.getElementById('msotIntroAmbientVideo');
            this.canvas = document.getElementById('msotMaskCanvas');
            this.bgmAudio = document.getElementById('msotIntroBgmAudio');
            this.unmuteBtn = document.getElementById('msotIntroUnmuteBtn');
            this.portalOverlay = document.getElementById('msotTransitionPortal');
        }

        /**
         * Pre-renders glowing radial sprites into offscreen canvases.
         * Eliminates expensive ctx.shadowBlur & ctx.createRadialGradient inside the render loop!
         */
        initParticleSprites() {
            // 1. Radiant Molten Gold Ember Sprite (64x64)
            this.spriteGold = document.createElement('canvas');
            this.spriteGold.width = 64;
            this.spriteGold.height = 64;
            const ctxG = this.spriteGold.getContext('2d');
            const gradG = ctxG.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradG.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradG.addColorStop(0.2, 'rgba(254, 240, 138, 0.95)');
            gradG.addColorStop(0.5, 'rgba(245, 158, 11, 0.7)');
            gradG.addColorStop(0.8, 'rgba(234, 88, 12, 0.25)');
            gradG.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctxG.fillStyle = gradG;
            ctxG.fillRect(0, 0, 64, 64);

            // 2. Incandescent Crimson Flame Ember Sprite (64x64)
            this.spriteRed = document.createElement('canvas');
            this.spriteRed.width = 64;
            this.spriteRed.height = 64;
            const ctxR = this.spriteRed.getContext('2d');
            const gradR = ctxR.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradR.addColorStop(0, 'rgba(255, 240, 220, 1)');
            gradR.addColorStop(0.25, 'rgba(239, 68, 68, 0.9)');
            gradR.addColorStop(0.6, 'rgba(185, 28, 28, 0.55)');
            gradR.addColorStop(0.85, 'rgba(127, 29, 29, 0.2)');
            gradR.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctxR.fillStyle = gradR;
            ctxR.fillRect(0, 0, 64, 64);

            // 3. Volumetric Smoke Cloud Sprite (128x128)
            this.spriteSmoke = document.createElement('canvas');
            this.spriteSmoke.width = 128;
            this.spriteSmoke.height = 128;
            const ctxS = this.spriteSmoke.getContext('2d');
            const gradS = ctxS.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradS.addColorStop(0, 'rgba(70, 12, 18, 0.38)');
            gradS.addColorStop(0.45, 'rgba(40, 6, 10, 0.2)');
            gradS.addColorStop(0.8, 'rgba(18, 2, 5, 0.06)');
            gradS.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctxS.fillStyle = gradS;
            ctxS.fillRect(0, 0, 128, 128);
        }



        initCanvas() {
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d', { alpha: true });
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());

            this.ambientEmbers = [];
            this.vortexEmbers = [];
            this.fissureEmbers = [];
            this.smokePuffs = [];

            // 1. Ambient rising embers
            for (let i = 0; i < 75; i++) {
                this.ambientEmbers.push(this.createAmbientEmber(true));
            }

            // 2. Swirling vortex embers orbiting the mask in 3D
            for (let i = 0; i < 35; i++) {
                this.vortexEmbers.push(this.createVortexEmber());
            }

            // 3. Ambient background smoke puffs
            for (let i = 0; i < 14; i++) {
                this.smokePuffs.push(this.createSmokePuff(true));
            }
        }

        resizeCanvas() {
            if (!this.canvas) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 1.75); // Capped at 1.75 for 120FPS fluidity
            this.canvas.width = Math.floor(window.innerWidth * dpr);
            this.canvas.height = Math.floor(window.innerHeight * dpr);
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            if (this.ctx) {
                this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        }

        createAmbientEmber(initial = false) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            return {
                x: Math.random() * w,
                y: initial ? Math.random() * h : h + Math.random() * 20,
                radius: Math.random() * 3.0 + 1.2,
                speedY: Math.random() * 1.5 + 0.6,
                speedX: (Math.random() - 0.5) * 0.9,
                opacity: Math.random() * 0.75 + 0.25,
                isGold: Math.random() < 0.65,
                decay: Math.random() * 0.0022 + 0.001,
                wobble: Math.random() * Math.PI * 2
            };
        }

        createVortexEmber() {
            const angle = Math.random() * Math.PI * 2;
            const radiusX = Math.random() * 260 + 110;
            const radiusY = radiusX * (0.35 + Math.random() * 0.2);
            return {
                angle: angle,
                speed: (Math.random() * 0.02 + 0.01) * (Math.random() < 0.5 ? 1 : -1),
                radiusX: radiusX,
                radiusY: radiusY,
                radius: Math.random() * 3.4 + 1.2,
                opacity: Math.random() * 0.7 + 0.3,
                decay: Math.random() * 0.0025 + 0.001,
                isGold: Math.random() < 0.7
            };
        }

        createSmokePuff(initial = false) {
            const w = window.innerWidth;
            const h = window.innerHeight;
            return {
                x: Math.random() * w,
                y: initial ? Math.random() * h : h + Math.random() * 50,
                radius: Math.random() * 120 + 70,
                speedY: Math.random() * 0.35 + 0.15,
                speedX: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.65 + 0.2,
                growRate: Math.random() * 0.05 + 0.02,
                decay: Math.random() * 0.0012 + 0.0006
            };
        }

        createFissureEmber() {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const angle = (Math.random() - 0.5) * Math.PI * 1.8;
            const speed = Math.random() * 7.0 + 2.2;
            return {
                x: cx + (Math.random() - 0.5) * 15,
                y: cy + (Math.random() - 0.5) * 160,
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
                vy: Math.sin(angle) * speed - Math.random() * 2,
                radius: Math.random() * 4.0 + 1.6,
                opacity: 1.0,
                isGold: Math.random() < 0.6,
                decay: Math.random() * 0.016 + 0.009
            };
        }

        /**
         * CINEMATIC SEQUENCE ORCHESTRATION
         */
        playIntro() {
            if (!this.overlay) return;
            this.isOpen = true;
            this.isPlaying = true;
            this.isTransitioning = false;
            this.maskSplitOccurred = false;
            this.fissureEmbers = [];

            this.overlay.classList.add('active');
            this.resetAnimationState();

            this.resizeCanvas();
            this.startRenderLoop();

            // 1. Play Background Video Layers in cinematic slow-motion (playbackRate 0.8)
            if (this.heroVideo) {
                this.heroVideo.playbackRate = 0.8;
                this.heroVideo.currentTime = 0;
                this.heroVideo.play().catch(() => {});
            }

            if (this.ambientVideo) {
                this.ambientVideo.playbackRate = 0.8;
                this.ambientVideo.currentTime = 0;
                this.ambientVideo.play().catch(() => {});
            }

            // 2. Continuous Background Music
            if (this.bgmAudio) {
                this.bgmAudio.loop = true;
                this.bgmAudio.currentTime = 0;
                if (this.isSoundEnabled) {
                    this.bgmAudio.play().catch(() => {});
                }
            }

            this.updateMuteButton();
            this.clearTimelineTimers();

            // TIMELINE STEP 1: 5.0s — Center Fissure Cracks Ignite
            this.scheduleTimeline(() => {
                if (!this.isOpen || this.isTransitioning) return;
                if (this.crackOverlay) {
                    this.crackOverlay.classList.add('ignite');
                }
            }, 5000);

            // TIMELINE STEP 2: 5.8s — MAIN CINEMATIC MOMENT: THE MASK SPLITS OPEN!
            this.scheduleTimeline(() => {
                if (!this.isOpen || this.isTransitioning) return;
                this.triggerMaskSplit();
            }, 5800);

            // TIMELINE STEP 3: 7.2s — SANSKRIT REVEAL ("अंतः अस्ति प्रारंभ")
            this.scheduleTimeline(() => {
                if (!this.isOpen || this.isTransitioning) return;
                if (this.sanskritContainer) {
                    this.sanskritContainer.classList.add('revealed');
                }
            }, 7200);

            // TIMELINE STEP 4: 10.4s — SANSKRIT ASCENDS & MIRAI SCHOOL OF TECHNOLOGY EMERGES
            this.scheduleTimeline(() => {
                if (!this.isOpen || this.isTransitioning) return;
                if (this.sanskritContainer) {
                    this.sanskritContainer.classList.add('fade-up');
                }
                if (this.brandContainer) {
                    this.brandContainer.classList.add('revealed');
                }
            }, 10400);
        }

        /**
         * THE MASK SPLIT EVENT:
         * - Camera Shake
         * - Sub-Bass Audio Impact
         * - Shockwave Explosion
         * - Left & Right Halves Part with 3D Depth
         * - Inner Sanctum Revealed
         */
        triggerMaskSplit() {
            if (this.maskSplitOccurred) return;
            this.maskSplitOccurred = true;

            // 1. Camera Shake on Stage
            if (this.stage) {
                this.stage.classList.add('camera-shake');
                setTimeout(() => {
                    if (this.stage) this.stage.classList.remove('camera-shake');
                }, 750);
            }

            // 2. Shockwave Ring Expansion
            if (this.shockwaveRing) {
                this.shockwaveRing.classList.remove('fire');
                void this.shockwaveRing.offsetWidth;
                this.shockwaveRing.classList.add('fire');
            }

            // 4. Hide Solid Mask & Hero Video, Reveal Left & Right Mask Halves
            if (this.maskSolid) {
                this.maskSolid.classList.add('hidden');
            }
            if (this.heroVideo) {
                this.heroVideo.pause();
            }

            if (this.maskLeft) {
                this.maskLeft.classList.add('active', 'opening');
            }
            if (this.maskRight) {
                this.maskRight.classList.add('active', 'opening');
            }

            // 5. Activate Inner Sanctum Backing Aura
            if (this.innerSanctum) {
                this.innerSanctum.classList.add('revealed');
            }

            // 6. Spawn burst of 90+ fiery fissure embers exploding outward
            for (let i = 0; i < 90; i++) {
                this.fissureEmbers.push(this.createFissureEmber());
            }
        }

        scheduleTimeline(callback, delay) {
            const tid = setTimeout(callback, delay);
            this.timelineTimeouts.push(tid);
        }

        clearTimelineTimers() {
            this.timelineTimeouts.forEach(tid => clearTimeout(tid));
            this.timelineTimeouts = [];
        }

        resetAnimationState() {
            this.clearTimelineTimers();

            if (this.stage) {
                this.stage.classList.remove('camera-shake');
                this.stage.style.transform = '';
            }

            if (this.maskSolid) {
                this.maskSolid.classList.remove('hidden');
            }

            if (this.crackOverlay) {
                this.crackOverlay.classList.remove('ignite');
            }

            if (this.maskLeft) {
                this.maskLeft.classList.remove('active', 'opening');
            }

            if (this.maskRight) {
                this.maskRight.classList.remove('active', 'opening');
            }

            if (this.shockwaveRing) {
                this.shockwaveRing.classList.remove('fire');
            }

            if (this.innerSanctum) {
                this.innerSanctum.classList.remove('revealed');
            }

            if (this.sanskritContainer) {
                this.sanskritContainer.classList.remove('revealed', 'fade-up');
            }

            if (this.brandContainer) {
                this.brandContainer.classList.remove('revealed');
            }
        }

        startRenderLoop() {
            const render = () => {
                if (!this.isOpen) return;
                this.updateAndDrawScene();
                this.updateParallax();
                this.animationFrameId = requestAnimationFrame(render);
            };
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = requestAnimationFrame(render);
        }

        stopRenderLoop() {
            cancelAnimationFrame(this.animationFrameId);
        }

        updateParallax() {
            if (!this.stage) return;
            this.currentTiltX += (this.mouseY * 3.5 - this.currentTiltX) * 0.06;
            this.currentTiltY += (this.mouseX * 5.5 - this.currentTiltY) * 0.06;
            this.stage.style.transform = `perspective(1400px) rotateX(${-this.currentTiltX.toFixed(2)}deg) rotateY(${this.currentTiltY.toFixed(2)}deg)`;
        }

        /**
         * ULTRA-HIGH FPS PARTICLES RENDER PIPELINE:
         * Uses fast GPU texture blits with offscreen pre-rendered sprites and additive blending!
         */
        updateAndDrawScene() {
            if (!this.ctx || !this.canvas) return;
            const ctx = this.ctx;
            const w = window.innerWidth;
            const h = window.innerHeight;
            const cx = w * 0.5;
            const cy = h * 0.5;

            ctx.clearRect(0, 0, w, h);

            // 1. Draw Background Smoke Clouds (Zero-radial-gradient blits!)
            if (this.spriteSmoke) {
                for (let i = 0; i < this.smokePuffs.length; i++) {
                    const s = this.smokePuffs[i];
                    s.y -= s.speedY;
                    s.x += s.speedX;
                    s.radius += s.growRate;
                    s.opacity -= s.decay;

                    if (s.y < -s.radius || s.opacity <= 0) {
                        this.smokePuffs[i] = this.createSmokePuff(false);
                        continue;
                    }

                    ctx.globalAlpha = Math.max(0, s.opacity);
                    const diameter = s.radius * 2;
                    ctx.drawImage(this.spriteSmoke, s.x - s.radius, s.y - s.radius, diameter, diameter);
                }
            }

            // 2. Switch to Hardware-Accelerated Additive Blending for Incandescent Fire Particles
            ctx.globalCompositeOperation = 'lighter';

            // 2a. Swirling Vortex Embers (Orbiting the mask in 3D during emergence)
            if (!this.maskSplitOccurred && (this.spriteGold || this.spriteRed)) {
                for (let i = 0; i < this.vortexEmbers.length; i++) {
                    const ve = this.vortexEmbers[i];
                    ve.angle += ve.speed;
                    ve.opacity -= ve.decay;

                    if (ve.opacity <= 0) {
                        this.vortexEmbers[i] = this.createVortexEmber();
                        continue;
                    }

                    const px = cx + Math.cos(ve.angle) * ve.radiusX;
                    const py = cy + Math.sin(ve.angle) * ve.radiusY;
                    const size = ve.radius * 2.4;
                    const sprite = ve.isGold ? this.spriteGold : this.spriteRed;

                    ctx.globalAlpha = Math.max(0, ve.opacity);
                    ctx.drawImage(sprite, px - size * 0.5, py - size * 0.5, size, size);
                }
            }

            // 2b. Ambient Floating Embers
            for (let i = 0; i < this.ambientEmbers.length; i++) {
                const p = this.ambientEmbers[i];
                p.wobble += 0.035;
                p.y -= p.speedY;
                p.x += p.speedX + Math.sin(p.wobble) * 0.45;
                p.opacity -= p.decay;

                if (p.y < -20 || p.opacity <= 0) {
                    this.ambientEmbers[i] = this.createAmbientEmber(false);
                    continue;
                }

                const size = p.radius * 2.8;
                const sprite = p.isGold ? this.spriteGold : this.spriteRed;

                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.drawImage(sprite, p.x - size * 0.5, p.y - size * 0.5, size, size);
            }

            // 2c. Fissure Explosion Embers (Burst from mask opening)
            for (let i = this.fissureEmbers.length - 1; i >= 0; i--) {
                const pe = this.fissureEmbers[i];
                pe.x += pe.vx;
                pe.y += pe.vy;
                pe.vx *= 0.985;
                pe.vy *= 0.985;
                pe.opacity -= pe.decay;

                if (pe.opacity <= 0) {
                    this.fissureEmbers.splice(i, 1);
                    continue;
                }

                const size = pe.radius * 3.2;
                const sprite = pe.isGold ? this.spriteGold : this.spriteRed;

                ctx.globalAlpha = Math.max(0, pe.opacity);
                ctx.drawImage(sprite, pe.x - size * 0.5, pe.y - size * 0.5, size, size);
            }

            // Reset composite mode & alpha
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
        }

        bindEvents() {
            if (!this.overlay) return;

            window.addEventListener('mousemove', (e) => {
                if (!this.isOpen) return;
                this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
            });

            window.addEventListener('keydown', (e) => {
                if (!this.isOpen || this.isTransitioning) return;

                if (e.key === 'Escape' || e.key === 'Enter') {
                    e.preventDefault();
                    this.enterDashboardWithTransition();
                } else if (e.key === ' ' || e.code === 'Space') {
                    if (document.activeElement?.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.togglePlayPause();
                    }
                } else if (e.key === 'm' || e.key === 'M') {
                    if (document.activeElement?.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.toggleMute();
                    }
                }
            });
        }

        togglePlayPause() {
            this.isPlaying = !this.isPlaying;
            if (this.heroVideo) {
                if (this.isPlaying) this.heroVideo.play().catch(() => {});
                else this.heroVideo.pause();
            }
            if (this.ambientVideo) {
                if (this.isPlaying) this.ambientVideo.play().catch(() => {});
                else this.ambientVideo.pause();
            }
            if (this.bgmAudio) {
                if (this.isPlaying && this.isSoundEnabled) {
                    this.bgmAudio.play().catch(() => {});
                } else {
                    this.bgmAudio.pause();
                }
            }
        }

        toggleMute() {
            this.isSoundEnabled = !this.isSoundEnabled;

            if (this.bgmAudio) {
                if (this.isSoundEnabled) {
                    this.bgmAudio.loop = true;
                    this.bgmAudio.play().catch((e) => console.warn('Audio play note:', e));
                } else {
                    this.bgmAudio.pause();
                }
            }

            this.updateMuteButton();
        }

        updateMuteButton() {
            if (!this.unmuteBtn) return;
            if (!this.isSoundEnabled) {
                this.unmuteBtn.innerHTML = '<span>🔊</span><span>ENABLE AUDIO</span>';
                this.unmuteBtn.classList.add('btn-unmute');
            } else {
                this.unmuteBtn.innerHTML = '<span>🔇</span><span>MUTE AUDIO</span>';
                this.unmuteBtn.classList.remove('btn-unmute');
            }
        }

        enterDashboardWithTransition() {
            if (this.isTransitioning) return;
            this.isTransitioning = true;
            this.clearTimelineTimers();

            // 1. Reveal Portal Gateway Transition Overlay
            if (this.portalOverlay) {
                this.portalOverlay.classList.add('portal-active');
            }

            // 2. Smooth audio fade out
            if (this.bgmAudio && !this.bgmAudio.paused) {
                const fadeSteps = 8;
                let currentStep = 0;
                const initialVol = this.bgmAudio.volume;
                const fadeInterval = setInterval(() => {
                    currentStep++;
                    this.bgmAudio.volume = Math.max(0, initialVol * (1 - currentStep / fadeSteps));
                    if (currentStep >= fadeSteps) {
                        clearInterval(fadeInterval);
                        this.bgmAudio.pause();
                        this.bgmAudio.volume = initialVol;
                    }
                }, 90);
            }

            if (this.heroVideo) this.heroVideo.pause();
            if (this.ambientVideo) this.ambientVideo.pause();

            // 4. Enter Cadet Dashboard
            setTimeout(() => {
                sessionStorage.setItem(STORAGE_KEY_INTRO_SEEN, 'true');
                this.isOpen = false;
                this.stopRenderLoop();

                if (window.switchSection) {
                    window.switchSection('dashboardSection', true);
                }
                window.location.hash = '#/dashboard';

                if (this.overlay) {
                    this.overlay.classList.remove('active');
                }

                setTimeout(() => {
                    if (this.portalOverlay) {
                        this.portalOverlay.classList.remove('portal-active');
                    }
                    this.resetAnimationState();
                }, 400);

            }, 1100);
        }
    }

    window.msotIntroVideo = new IntroVideoController();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.msotIntroVideo.init());
    } else {
        window.msotIntroVideo.init();
    }
})();
