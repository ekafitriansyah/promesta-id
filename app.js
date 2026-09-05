// ============================================================
      // SAFE STORAGE POLYFILL / FALLBACK (Prevent file:// crashes)
      // ============================================================
      (function() {
        try {
          const testKey = '__storage_test__';
          window.localStorage.setItem(testKey, testKey);
          window.localStorage.removeItem(testKey);
        } catch (e) {
          console.warn('localStorage is restricted or unavailable. Using safe in-memory storage fallback.');
          const memoryStorage = {};
          const mockStorage = {
            getItem: function(key) {
              return Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null;
            },
            setItem: function(key, val) {
              memoryStorage[key] = String(val);
            },
            removeItem: function(key) {
              delete memoryStorage[key];
            },
            clear: function() {
              for (const k in memoryStorage) delete memoryStorage[k];
            },
            get length() {
              return Object.keys(memoryStorage).length;
            },
            key: function(i) {
              return Object.keys(memoryStorage)[i] || null;
            }
          };
          try {
            Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true, writable: true });
          } catch (err) {
            window.localStorage = mockStorage;
          }
        }
      })();

      // ============================================================
      // ELEGANT CUSTOM POPUP ALERT MODAL (Override window.alert)
      // ============================================================
      window.alert = function (message) {
        return new Promise((resolve) => {
          // Remove existing alert modal if any to avoid stacking
          const existing = document.getElementById("custom-alert-modal");
          if (existing) {
            existing.remove();
          }

          const modal = document.createElement("div");
          modal.id = "custom-alert-modal";
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(8, 13, 24, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          `;

          const card = document.createElement("div");
          card.style.cssText = `
            background: #0c1527;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 24px;
            width: 90%;
            max-width: 380px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transform: scale(0.92);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          `;

          // Determine icon and color based on content keywords
          let iconColor = "var(--accent, #facc15)"; // default amber
          let iconBg = "rgba(250, 204, 21, 0.15)";
          let iconName = "info";
          let titleText = "Informasi";

          const msgStr = String(message || "");
          const msgLower = msgStr.toLowerCase();
          if (msgLower.includes("berhasil") || msgLower.includes("sukses") || msgLower.includes("selesai")) {
            iconColor = "#4ade80"; // success green
            iconBg = "rgba(74, 222, 128, 0.15)";
            iconName = "check";
            titleText = "Berhasil";
          } else if (msgLower.includes("gagal") || msgLower.includes("salah") || msgLower.includes("maaf") || msgLower.includes("kosong") || msgLower.includes("error") || msgLower.includes("tidak valid") || msgLower.includes("tidak ada") || msgLower.includes("peringatan")) {
            iconColor = "#f87171"; // danger red
            iconBg = "rgba(248, 113, 113, 0.15)";
            iconName = "alert";
            titleText = "Pemberitahuan";
          }

          // SVG Icons
          let svgPath = '';
          if (iconName === "check") {
            svgPath = '<path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>';
          } else if (iconName === "alert") {
            svgPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
          } else {
            svgPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>';
          }

          const iconSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5">
              ${svgPath}
            </svg>
          `;

          card.innerHTML = `
            <div style="width: 48px; height: 48px; border-radius: 50%; background: ${iconBg}; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              ${iconSvg}
            </div>
            <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; color: #f8fafc; margin: 0 0 8px 0; letter-spacing: -0.01em;">${titleText}</h3>
            <p style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 500; color: #94a3b8; line-height: 1.6; margin: 0 0 20px 0; white-space: pre-line;">${msgStr}</p>
            <button id="custom-alert-ok-btn" style="width: 100%; padding: 10px 16px; background: var(--accent, #facc15); color: #0c1527; border: none; border-radius: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(250, 204, 21, 0.2);">
              Mengerti
            </button>
          `;

          modal.appendChild(card);
          document.body.appendChild(modal);

          // Trigger animation
          setTimeout(() => {
            modal.style.opacity = "1";
            card.style.transform = "scale(1)";
          }, 10);

          const closeAlert = () => {
            modal.style.opacity = "0";
            card.style.transform = "scale(0.92)";
            setTimeout(() => {
              modal.remove();
              resolve();
            }, 200);
          };

          const okBtn = card.querySelector("#custom-alert-ok-btn");
          okBtn.addEventListener("click", closeAlert);
          
          // Listen for keyboard escape/enter
          const handleKeyDown = (e) => {
            if (e.key === "Enter" || e.key === "Escape" || e.key === " ") {
              e.preventDefault();
              closeAlert();
              document.removeEventListener("keydown", handleKeyDown);
            }
          };
          document.addEventListener("keydown", handleKeyDown);
        });
      };

      // ============================================================
      // ELEGANT CUSTOM POPUP CONFIRM MODAL
      // ============================================================
      window.confirmAsync = function (message) {
        return new Promise((resolve) => {
          // Remove existing confirm modal if any to avoid stacking
          const existing = document.getElementById("custom-confirm-modal");
          if (existing) {
            existing.remove();
          }

          const modal = document.createElement("div");
          modal.id = "custom-confirm-modal";
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(8, 13, 24, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          `;

          const card = document.createElement("div");
          card.style.cssText = `
            background: #0c1527;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 24px;
            width: 90%;
            max-width: 380px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transform: scale(0.92);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          `;

          card.innerHTML = `
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(250, 204, 21, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent, #facc15)" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700; color: #f8fafc; margin: 0 0 8px 0; letter-spacing: -0.01em;">Konfirmasi</h3>
            <p style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 500; color: #94a3b8; line-height: 1.6; margin: 0 0 20px 0; white-space: pre-line;">${message}</p>
            <div class="modal-actions" style="margin-top: 20px;">
              <button id="custom-confirm-cancel-btn" class="btn-modal-cancel">
                Batal
              </button>
              <button id="custom-confirm-ok-btn" class="btn-modal-ok">
                Ya, Lanjutkan
              </button>
            </div>
          `;

          modal.appendChild(card);
          document.body.appendChild(modal);

          // Trigger animation
          setTimeout(() => {
            modal.style.opacity = "1";
            card.style.transform = "scale(1)";
          }, 10);

          const closeAndResolve = (val) => {
            modal.style.opacity = "0";
            card.style.transform = "scale(0.92)";
            setTimeout(() => {
              modal.remove();
              resolve(val);
            }, 200);
          };

          card.querySelector("#custom-confirm-cancel-btn").addEventListener("click", () => closeAndResolve(false));
          card.querySelector("#custom-confirm-ok-btn").addEventListener("click", () => closeAndResolve(true));

          // Listen to keys
          const handleKey = (e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              closeAndResolve(false);
              document.removeEventListener("keydown", handleKey);
            }
          };
          document.addEventListener("keydown", handleKey);
        });
      };

      // ============================================================
      // LUCIDE ICONS OBSERVER
      // ============================================================
      function initLucideObserver() {
        try {
          // Sync offline CP banner on start
          const warningEl = document.getElementById('cp-offline-warning-banner');
          if (warningEl) {
            warningEl.style.display = window.BSKAP_046_DATA ? 'none' : 'flex';
          }

          if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
            if (typeof MutationObserver !== 'undefined' && document.body) {
              const observer = new MutationObserver((mutations) => {
                let hasNewIcons = false;
                for (let m of mutations) {
                  for (let node of m.addedNodes) {
                    if (node.nodeType === 1) {
                      if (node.tagName === 'I' && node.hasAttribute('data-lucide')) {
                        hasNewIcons = true;
                      } else if (node.querySelectorAll && node.querySelectorAll('i[data-lucide]').length > 0) {
                        hasNewIcons = true;
                      }
                    }
                    if (hasNewIcons) break;
                  }
                  if (hasNewIcons) break;
                }
                if (hasNewIcons) lucide.createIcons();
              });
              observer.observe(document.body, { childList: true, subtree: true });
            }
          }
        } catch (e) {
          console.warn('Lucide observer error:', e);
        }
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLucideObserver);
      } else {
        initLucideObserver();
      }

      // ============================================================
      // GLOBAL VIEWPORT-CLAMPED FLOATING TOOLTIP ENGINE
      // ============================================================
      function initTooltipsEngine() {
        let tooltipEl = null;

        function getOrCreateTooltip() {
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'global-floating-tooltip';
            tooltipEl.style.cssText = `
              position: fixed;
              background: #1a202c;
              color: #fff;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 11px;
              padding: 5px 10px;
              border-radius: 6px;
              z-index: 999999;
              pointer-events: none;
              text-align: center;
              line-height: 1.45;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              opacity: 0;
              transition: opacity 0.1s ease-out;
              display: none;
              max-width: min(280px, 85vw);
              white-space: normal;
              word-wrap: break-word;
            `;
            document.body.appendChild(tooltipEl);
          }
          return tooltipEl;
        }

        document.addEventListener('mouseover', function(e) {
          const target = e.target.closest('[data-tip]');
          if (!target) return;

          if (target.hasAttribute('title')) {
            target.removeAttribute('title');
          }

          const tipText = target.getAttribute('data-tip');
          if (!tipText) return;

          const tip = getOrCreateTooltip();
          tip.innerHTML = tipText;
          tip.style.display = 'block';

          const rect = target.getBoundingClientRect();
          
          tip.style.left = '0px';
          tip.style.top = '0px';
          const tipRect = tip.getBoundingClientRect();

          let left = rect.left + (rect.width - tipRect.width) / 2;
          const margin = 8;
          const minLeft = margin;
          const maxLeft = window.innerWidth - tipRect.width - margin;
          left = Math.max(minLeft, Math.min(maxLeft, left));

          let top = rect.top - tipRect.height - 8;
          if (top < margin) {
            top = rect.bottom + 8;
          }

          tip.style.left = left + 'px';
          tip.style.top = top + 'px';
          
          setTimeout(() => {
            if (tip.style.display === 'block') {
              tip.style.opacity = '1';
            }
          }, 10);
        });

        document.addEventListener('mouseout', function(e) {
          const target = e.target.closest('[data-tip]');
          if (!target) return;

          const related = e.relatedTarget ? e.relatedTarget.closest('[data-tip]') : null;
          if (related === target) return;

          if (tooltipEl) {
            tooltipEl.style.opacity = '0';
            tooltipEl.style.display = 'none';
          }
        });
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTooltipsEngine);
      } else {
        initTooltipsEngine();
      }

      // ============================================================
      // TOUR STATE & LOGIC (10 LANGKAH LENGKAP & RAMAH PEMULA)
      // ============================================================
      let currentTourStep = 0;
      let activeTourHighlightElements = [];

      function clearTourHighlights() {
        activeTourHighlightElements.forEach(el => {
          if (el) el.classList.remove("tour-highlight");
        });
        activeTourHighlightElements = [];
      }

      function addTourHighlight(selector) {
        const el = document.querySelector(selector);
        if (el) {
          el.classList.add("tour-highlight");
          activeTourHighlightElements.push(el);
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          } catch(e) {}
        }
      }

      function startClassTour(kelasId) {
        clearTourHighlights();
        currentTourStep = 1;
        
        // Ensure we are in the correct class screen
        if (currentKelasId !== kelasId) {
          bukaKelas(kelasId);
        }
        
        showTourStep(1);
      }

      function showTourStep(step) {
        clearTourHighlights();
        currentTourStep = step;
        
        // Remove existing tour DOM if any
        const oldOverlay = document.getElementById("tour-overlay-element");
        if (oldOverlay) oldOverlay.remove();
        const oldCard = document.getElementById("tour-card-element");
        if (oldCard) oldCard.remove();

        const overlay = document.createElement("div");
        overlay.id = "tour-overlay-element";
        overlay.className = "tour-overlay";
        overlay.onclick = () => endClassTour(true); // clicking overlay skips the tour
        document.body.appendChild(overlay);

        const card = document.createElement("div");
        card.id = "tour-card-element";
        card.className = "tour-card";
        
        let cardHTML = "";
        const TOTAL_STEPS = 10;
        
        if (step === 1) {
          card.className = "tour-card centered";
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(250, 204, 21, 0.2); border: 1px solid var(--accent); color: var(--accent); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="sparkles"></i>
                </div>
                <div>
                  <h4 style="font-size: 17px; font-weight: 700; margin: 0; color: #facc15;">Selamat Datang di Panduan Kelas! 🎉</h4>
                  <span class="tour-step-pill" style="margin-top: 4px;">Langkah 1 dari ${TOTAL_STEPS} • Pengenalan</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13.5px; line-height: 1.65; color: rgba(255, 255, 255, 0.92); margin-bottom: 20px;">
              <p style="margin-bottom: 10px;">
                Aplikasi <strong>Promesta.id</strong> dirancang khusus agar Bapak/Ibu Guru dapat menyusun Program Semester secara otomatis dan seluruh administrasi Kurikulum Merdeka secara <strong>lengkap, cepat, dan rapi</strong>.
              </p>
              <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;">
                <strong style="color: #60a5fa; display: block; margin-bottom: 6px; font-size: 13px;">💡 3 Prinsip Kerja Sederhana:</strong>
                <ol style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: var(--text-light);">
                  <li>Isi 6 menu pada kelompok <strong>"Input Data"</strong> di sidebar kiri.</li>
                  <li>Klik satu tombol ajaib kuning <strong>"Generate Dokumen"</strong>.</li>
                  <li>Semua 9 dokumen perangkat ajar otomatis terisi & siap dicetak di kelompok <strong>"Output"</strong>.</li>
                </ol>
              </div>
              <p style="margin: 0; font-size: 12.5px; color: var(--text-light);">
                Ikuti panduan interaktif singkat ini langkah demi langkah untuk memahami setiap fitur tanpa rasa bingung!
              </p>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 14px;">
              <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 16px; font-size: 13px;">Lewati Tour</button>
              <button onclick="showTourStep(2)" class="btn-modal-ok" style="flex: none; padding: 7px 20px; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                Mulai Tur Interaktif <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
              </button>
            </div>
          `;
        } else if (step === 2) {
          showTab("data-umum");
          card.className = "tour-card bottom-right";
          addTourHighlight(".card-identitas");
          addTourHighlight(".card-jadwal");
          addTourHighlight(".card-pengesahan");
          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(96, 165, 250, 0.2); border: 1px solid #60a5fa; color: #60a5fa; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="graduation-cap"></i>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #93c5fd;">Menu 1: Data Umum</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(96, 165, 250, 0.15); color: #93c5fd; border-color: rgba(96, 165, 250, 0.35);">Langkah 2 dari ${TOTAL_STEPS} • Input Data</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); margin-bottom: 18px;">
              <p style="margin-bottom: 8px;">Di halaman <strong>Data Umum</strong>, lengkapi 3 blok data pokok:</p>
              <ul style="padding-left: 18px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px;">
                <li><strong>Identitas:</strong> Nama Sekolah, Mapel, Fase, Kelas, dan Tahun Ajaran.</li>
                <li><strong>Jadwal Mengajar:</strong> Pilih hari mengajar Anda dalam sepekan (Senin s.d. Sabtu) serta alokasi JP per hari. Jadwal ini dipakai untuk menghitung tanggal pertemuan Jurnal Mengajar.</li>
                <li><strong>Pengesahan:</strong> Nama Kepala Sekolah, Guru Pengampu, NIP, serta Titimangsa pengesahan.</li>
              </ul>
              <div style="background: rgba(250, 204, 21, 0.08); border-left: 3px solid #facc15; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #fde047;">
                📌 <em>Data pengesahan ini akan otomatis terpasang pada lembar cover & tanda tangan semua dokumen cetak.</em>
              </div>
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
              <button onclick="showTourStep(1)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <div style="display: flex; gap: 8px;">
                <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px;">Tutup</button>
                <button onclick="showTourStep(3)" class="btn-modal-ok" style="flex: none; padding: 7px 18px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                  Lanjut: Data Libur <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        } else if (step === 3) {
          showTab("data-libur");
          if (typeof renderKalender === 'function') {
            renderKalender('ganjil');
            renderKalender('genap');
            renderKatColorSettings();
          }
          card.className = "tour-card bottom-right";
          addTourHighlight("#tab-data-libur .tab-header");

          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(248, 113, 113, 0.2); border: 1px solid #f87171; color: #f87171; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="calendar-off"></i>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #fca5a5;">Menu 2: Data Libur & Kaldik</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(248, 113, 113, 0.15); color: #fca5a5; border-color: rgba(248, 113, 113, 0.35);">Langkah 3 dari ${TOTAL_STEPS} • Input Data</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); margin-bottom: 18px;">
              <p style="margin-bottom: 8px;">Halaman ini mengatur kalender efektif dan hari non-efektif:</p>
              <ul style="padding-left: 18px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px;">
                <li><strong>Sistem Hari Kerja:</strong> Pilih sekolah Anda menerapkan <em>5 Hari Kerja (Senin-Jumat)</em> atau <em>6 Hari Kerja (Senin-Sabtu)</em>.</li>
                <li><strong>Hari Pertama Masuk:</strong> Tentukan tanggal awal KBM Semester Ganjil & Genap.</li>
                <li><strong>Tandai Libur & Agenda:</strong> Klik tombol hijau <strong style="color: #22c55e;">(+)</strong> di atas tabel untuk menambah tanggal/rentang hari libur dan agenda sekolah, atau kelola sistem hari kerja (5/6 hari) melalui menu <strong>Kelola Data Libur</strong>.</li>
              </ul>
              <div style="background: rgba(250, 204, 21, 0.08); border-left: 3px solid #facc15; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #fde047;">
                📌 <em>Data ini menjadi dasar akurat perhitungan Rencana Pekan Efektif (RPE) & Prosem.</em>
              </div>
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
              <button onclick="showTourStep(2)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <div style="display: flex; gap: 8px;">
                <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px;">Tutup</button>
                <button onclick="showTourStep(4)" class="btn-modal-ok" style="flex: none; padding: 7px 18px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                  Lanjut: Capaian Pembelajaran <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        } else if (step === 4) {
          showTab("atp-input");
          card.className = "tour-card bottom-right";
          addTourHighlight("#tab-atp-input .tab-header");
          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(52, 211, 153, 0.2); border: 1px solid #34d399; color: #34d399; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="book-open"></i>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #6ee7b7;">Menu 3: Capaian Pembelajaran (CP)</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(52, 211, 153, 0.15); color: #6ee7b7; border-color: rgba(52, 211, 153, 0.35);">Langkah 4 dari ${TOTAL_STEPS} • Input Data</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); margin-bottom: 18px;">
              <p style="margin-bottom: 8px;">Capaian Pembelajaran (CP) memuat Elemen keilmuan dan kompetensi akhir:</p>
              <ul style="padding-left: 18px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px;">
                <li><strong>Isi Otomatis:</strong> Klik tombol <strong style="color: #facc15;">"Isi Otomatis CP"</strong> untuk memuat narasi CP resmi BSKAP Kemendikbudristek sesuai Fase & Mapel secara instan.</li>
                <li><strong>Tambah Elemen:</strong> Klik <strong style="color: #6ee7b7;">"+ Tambah Elemen"</strong> jika ingin menulis elemen atau muatan lokal sendiri.</li>
                <li><strong>Impor Excel:</strong> Gunakan menu <em>Template & Impor</em> bila sudah memiliki berkas Excel.</li>
              </ul>
              <div style="background: rgba(250, 204, 21, 0.08); border-left: 3px solid #facc15; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #fde047;">
                💡 <em>Terdapat tombol "Petunjuk" kuning di kanan atas untuk penjelasan detail per elemen.</em>
              </div>
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
              <button onclick="showTourStep(3)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <div style="display: flex; gap: 8px;">
                <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px;">Tutup</button>
                <button onclick="showTourStep(5)" class="btn-modal-ok" style="flex: none; padding: 7px 18px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                  Lanjut: Pemetaan TP <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        } else if (step === 5) {
          showTab("tp");
          card.className = "tour-card bottom-right";
          addTourHighlight("#tab-tp .tab-header");
          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(251, 191, 36, 0.2); border: 1px solid #fbbf24; color: #fbbf24; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="list-todo"></i>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #fde68a;">Menu 4: Pemetaan TP</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(251, 191, 36, 0.15); color: #fde68a; border-color: rgba(251, 191, 36, 0.35);">Langkah 5 dari ${TOTAL_STEPS} • Jantung Perangkat</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); margin-bottom: 18px;">
              <p style="margin-bottom: 8px;"><strong>Pemetaan TP</strong> adalah bagian paling penting yang menyusun materi semester:</p>
              <ul style="padding-left: 18px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px;">
                <li><strong>Otomatis dari CP:</strong> Klik menu <em>"Otomatis dari CP"</em> untuk langsung memecah narasi CP menjadi butir-butir TP dan Bab Materi.</li>
                <li><strong>Struktur Baris:</strong> Tentukan Kode TP (misal: <code>TP 1.1</code>), Materi Pokok, dan Alokasi JP.</li>
                <li><strong>Baris Evaluasi:</strong> Tandai baris Asesmen Sumatif (STS, SAS, Remedial) dengan switch <em>Non-TP</em> agar otomatis dipisahkan di Buku Nilai.</li>
                <li><strong>Distribusi JP:</strong> Gunakan fitur auto-distribusi JP agar total jam pas dengan pekan efektif.</li>
              </ul>
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
              <button onclick="showTourStep(4)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <div style="display: flex; gap: 8px;">
                <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px;">Tutup</button>
                <button onclick="showTourStep(6)" class="btn-modal-ok" style="flex: none; padding: 7px 18px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                  Lanjut: Daftar Murid <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        } else if (step === 6) {
          showTab("siswa");
          card.className = "tour-card bottom-right";
          addTourHighlight("#tab-siswa .tab-header");
          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(167, 139, 250, 0.2); border: 1px solid #a78bfa; color: #a78bfa; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="users"></i>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #c4b5fd;">Menu 5: Daftar Murid</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(167, 139, 250, 0.15); color: #c4b5fd; border-color: rgba(167, 139, 250, 0.35);">Langkah 6 dari ${TOTAL_STEPS} • Input Data</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); margin-bottom: 18px;">
              <p style="margin-bottom: 8px;">Daftar murid ini dipakai untuk Absensi Harian dan Daftar Nilai Rapor:</p>
              <ul style="padding-left: 18px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px;">
                <li><strong>Tambah Cepat (Salin-Tempel):</strong> Klik <em>"Tambah Banyak"</em>, lalu cukup <em>copy-paste</em> satu kolom daftar nama siswa dari file Excel atau Dapodik tanpa mengetik ulang.</li>
                <li><strong>Tambah Manual:</strong> Klik <em>"+ Tambah Murid"</em> untuk mengisi satuan dengan NIS/NISN.</li>
                <li><strong>Urutan Rapi:</strong> Nama siswa otomatis dinomori dan diurutkan secara konsisten di semua tabel absensi dan nilai.</li>
              </ul>
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
              <button onclick="showTourStep(5)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <div style="display: flex; gap: 8px;">
                <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px;">Tutup</button>
                <button onclick="showTourStep(7)" class="btn-modal-ok" style="flex: none; padding: 7px 18px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                  Lanjut: Pengaturan Penilaian <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        } else if (step === 7) {
          showTab("pengaturan-penilaian");
          card.className = "tour-card bottom-right";
          addTourHighlight("#tab-pengaturan-penilaian .tab-header");
          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #38bdf8; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="ruler"></i>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #7dd3fc;">Menu 6: Pengaturan Penilaian</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(56, 189, 248, 0.15); color: #7dd3fc; border-color: rgba(56, 189, 248, 0.35);">Langkah 7 dari ${TOTAL_STEPS} • Input Data Terakhir</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); margin-bottom: 18px;">
              <p style="margin-bottom: 8px;">Di menu ini, Bapak/Ibu dapat menentukan acuan penilaian rapor:</p>
              <ul style="padding-left: 18px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px;">
                <li><strong>KKTP (Kriteria Ketuntasan):</strong> Atur interval skala predikat (<em>Perlu Bimbingan, Cukup, Baik, Sangat Baik</em>).</li>
                <li><strong>Bobot Nilai Akhir (NA):</strong> Tentukan persentase bobot antara Rata-rata Sumatif Lingkup Materi, Sumatif Tengah Semester (STS), dan Sumatif Akhir Semester (SAS/SAT).</li>
                <li>Pengaturan dapat dibedakan antara Semester Ganjil dan Genap.</li>
              </ul>
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
              <button onclick="showTourStep(6)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <div style="display: flex; gap: 8px;">
                <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px;">Tutup</button>
                <button onclick="showTourStep(8)" class="btn-modal-ok" style="flex: none; padding: 7px 18px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                  Langkah Kunci: Generate ⚡ <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        } else if (step === 8) {
          card.className = "tour-card bottom-right";
          addTourHighlight(".btn-gen");
          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(234, 179, 8, 0.25); border: 1px solid #facc15; color: #facc15; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="zap"></i>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #fde047;">Langkah Kunci: "Generate Dokumen"</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(234, 179, 8, 0.2); color: #fde047; border-color: #facc15;">Langkah 8 dari ${TOTAL_STEPS} • Proses Otomatis</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); margin-bottom: 18px;">
              <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;">
                <strong style="color: #fef08a; font-size: 13.5px; display: block; margin-bottom: 4px;">⚡ Tombol Ajaib Penghitung Otomatis:</strong>
                <span style="font-size: 12.5px; color: #fef9c3;">
                  Setelah 6 menu Input Data selesai diisi (atau jika ada perubahan materi/jadwal), <strong>WAJIB menekan tombol kuning "Generate Dokumen"</strong> di sidebar kiri.
                </span>
              </div>
              <p style="margin: 0; font-size: 12.5px; color: var(--text-light);">
                Sistem akan secara instan menghitung pekan efektif, menyinkronkan tanggal Jurnal Mengajar dengan Kalender, mendistribusikan materi Prota & Prosem, serta menyusun Buku Nilai lengkap.
              </p>
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
              <button onclick="showTourStep(7)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <div style="display: flex; gap: 8px;">
                <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px;">Tutup</button>
                <button onclick="showTourStep(9)" class="btn-modal-ok" style="flex: none; padding: 7px 18px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                  Lanjut: Dokumen Output <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        } else if (step === 9) {
          card.className = "tour-card bottom-right";
          addTourHighlight("#output-nav-section");
          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #22c55e; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="printer"></i>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700; margin: 0; color: #86efac;">Menu Kelompok "Output"</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(34, 197, 94, 0.15); color: #86efac; border-color: rgba(34, 197, 94, 0.35);">Langkah 9 dari ${TOTAL_STEPS} • Siap Cetak</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); margin-bottom: 18px;">
              <p style="margin-bottom: 8px;">9 Dokumen Perangkat Ajar resmi siap dibuka dan dicetak:</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px; margin-bottom: 10px;">
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">📅 Kalender Pendidikan</div>
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">🧭 Alur Tujuan (ATP)</div>
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">📊 Pekan Efektif (RPE)</div>
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">📖 Jurnal Harian</div>
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">🗓 Program Tahunan (Prota)</div>
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">📋 Program Semester (Prosem)</div>
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">📝 Absensi Murid</div>
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px;">🎯 Format KKTP</div>
                <div style="background: rgba(255,255,255,0.04); padding: 5px 8px; border-radius: 6px; grid-column: span 2;">🎓 Daftar Nilai & Deskripsi Rapor</div>
              </div>
              <div style="background: rgba(34, 197, 94, 0.08); border-left: 3px solid #22c55e; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #86efac;">
                🖨 <em>Setiap halaman output memiliki tombol <strong>"Cetak"</strong> untuk cetak langsung ke printer atau simpan sebagai PDF A4/Folio rapi.</em>
              </div>
            </div>
            
            <div style="display: flex; gap: 8px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
              <button onclick="showTourStep(8)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <div style="display: flex; gap: 8px;">
                <button onclick="endClassTour(true)" class="btn-modal-cancel" style="padding: 7px 14px; font-size: 12.5px;">Tutup</button>
                <button onclick="showTourStep(10)" class="btn-modal-ok" style="flex: none; padding: 7px 18px; font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                  Lanjut: Tips & Selesai <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right"></i>
                </button>
              </div>
            </div>
          `;
        } else if (step === 10) {
          showTab("data-umum");
          card.className = "tour-card centered";
          
          cardHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #22c55e; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i class="material-symbols-rounded" style="font-size: 24px;" data-lucide="check-circle-2"></i>
                </div>
                <div>
                  <h4 style="font-size: 17px; font-weight: 700; margin: 0; color: #4ade80;">Bapak/Ibu Siap Mengajar! 🚀</h4>
                  <span class="tour-step-pill" style="margin-top: 4px; background: rgba(34, 197, 94, 0.15); color: #86efac; border-color: rgba(34, 197, 94, 0.35);">Langkah 10 dari ${TOTAL_STEPS} • Panduan Selesai</span>
                </div>
              </div>
            </div>
            
            <div style="font-size: 13.5px; line-height: 1.65; color: rgba(255, 255, 255, 0.92); margin-bottom: 20px;">
              <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;">
                <strong style="color: #fde047; display: block; margin-bottom: 6px; font-size: 13px;">💡 Tips Tambahan untuk Guru:</strong>
                <ul style="margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; font-size: 12.5px; color: var(--text-light);">
                  <li><strong>Aman Tersimpan:</strong> Semua data otomatis tersimpan di peramban (browser) Anda.</li>
                  <li><strong>Bisa Diulang Kapan Saja:</strong> Jika ingin melihat kembali panduan ini, cukup klik tombol <em>"Panduan Interaktif Tour"</em> di sidebar atas.</li>
                  <li><strong>Bantuan Per Halaman:</strong> Gunakan tombol kuning <em>"Petunjuk"</em> di bagian atas setiap halaman jika ada hal yang kurang jelas.</li>
                </ul>
              </div>
              <p style="margin: 0; font-size: 13px; color: #dcfce7; text-align: center;">
                Selamat menyusun administrasi pembelajaran dengan mudah dan menyenangkan!
              </p>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 14px;">
              <button onclick="showTourStep(9)" class="btn-modal-cancel" style="padding: 8px 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-left"></i> Kembali
              </button>
              <button onclick="endClassTour(false)" class="btn-modal-ok" style="flex: none; padding: 8px 24px; font-size: 13px; font-weight: 700; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; border: none; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.35); display: inline-flex; align-items: center; gap: 6px;">
                Mulai Kelola Kelas Sekarang <i class="material-symbols-rounded" style="font-size: 15px;" data-lucide="check"></i>
              </button>
            </div>
          `;
        }
        
        document.body.appendChild(card);
        card.innerHTML = cardHTML;
        
        // Re-trigger lucide icons inside the tour card
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }

      function endClassTour(isSkipped) {
        clearTourHighlights();
        const overlay = document.getElementById("tour-overlay-element");
        if (overlay) overlay.remove();
        const card = document.getElementById("tour-card-element");
        if (card) card.remove();
        
        // Save tour status so it doesn't show automatically next time
        if (currentKelasId) {
          localStorage.setItem("tour_shown_" + currentKelasId, "true");
        }
        
        // Switch back to data-umum tab if ended
        showTab("data-umum");
        
        if (!isSkipped) {
          showSaveIndicator("Selamat mengajar! 🎉", "success");
        }
      }

      function checkClassTour(kelasId) {
        const tourShown = localStorage.getItem("tour_shown_" + kelasId);
        if (!tourShown) {
          startClassTour(kelasId);
        }
      }

      // ============================================================
      // CURRENT USER + KALENDER STATE
      // ============================================================
      let currentUser = null; // Local user session object
      let kalender = { ganjil: [], genap: [] };
      let kalWorkDays = new Set([1, 2, 3, 4, 5]);

      // ============================================================
      // STATE: KELAS AKTIF
      // ============================================================
      let currentKelasId = null; // ID kelas yang sedang dibuka
      let daftarKelas = []; // [{id, mapel, kelas, fase, tahun, sekolah, ...}]

      // ============================================================
      // DATABASE CP & AUTOFILL LOGIC
      // ============================================================
      var REGULASI_KURIKULUM_MAPEL = window.REGULASI_KURIKULUM_MAPEL = {
        "sumber": "Regulasi Kurikulum Merdeka & BSKAP No. 046/H/KR/2025",
        "daftar_kelas": [
                {
                        "kelas": 1,
                        "fase": "A",
                        "tingkat_pendidikan": "SD/MI",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari"
                        ]
                },
                {
                        "kelas": 2,
                        "fase": "A",
                        "tingkat_pendidikan": "SD/MI",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari"
                        ]
                },
                {
                        "kelas": 3,
                        "fase": "B",
                        "tingkat_pendidikan": "SD/MI",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Ilmu Pengetahuan Alam Dan Sosial (IPAS)",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Bahasa Inggris"
                        ]
                },
                {
                        "kelas": 4,
                        "fase": "B",
                        "tingkat_pendidikan": "SD/MI",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Ilmu Pengetahuan Alam Dan Sosial (IPAS)",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Bahasa Inggris"
                        ]
                },
                {
                        "kelas": 5,
                        "fase": "C",
                        "tingkat_pendidikan": "SD/MI",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Ilmu Pengetahuan Alam Dan Sosial (IPAS)",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Bahasa Inggris",
                                "Koding Dan Kecerdasan Artifisial"
                        ]
                },
                {
                        "kelas": 6,
                        "fase": "C",
                        "tingkat_pendidikan": "SD/MI",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Ilmu Pengetahuan Alam Dan Sosial (IPAS)",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Bahasa Inggris",
                                "Koding Dan Kecerdasan Artifisial"
                        ]
                },
                {
                        "kelas": 7,
                        "fase": "D",
                        "tingkat_pendidikan": "SMP/MTs",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Ilmu Pengetahuan Alam (IPA)",
                                "Ilmu Pengetahuan Sosial (IPS)",
                                "Bahasa Inggris",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari",
                                "Informatika"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Koding Dan Kecerdasan Artifisial",
                                "Prakarya Budi Daya",
                                "Prakarya Kerajinan",
                                "Prakarya Pengolahan",
                                "Prakarya Rekayasa"
                        ]
                },
                {
                        "kelas": 8,
                        "fase": "D",
                        "tingkat_pendidikan": "SMP/MTs",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Ilmu Pengetahuan Alam (IPA)",
                                "Ilmu Pengetahuan Sosial (IPS)",
                                "Bahasa Inggris",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari",
                                "Informatika"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Koding Dan Kecerdasan Artifisial",
                                "Prakarya Budi Daya",
                                "Prakarya Kerajinan",
                                "Prakarya Pengolahan",
                                "Prakarya Rekayasa"
                        ]
                },
                {
                        "kelas": 9,
                        "fase": "D",
                        "tingkat_pendidikan": "SMP/MTs",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Ilmu Pengetahuan Alam (IPA)",
                                "Ilmu Pengetahuan Sosial (IPS)",
                                "Bahasa Inggris",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari",
                                "Informatika"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Koding Dan Kecerdasan Artifisial",
                                "Prakarya Budi Daya",
                                "Prakarya Kerajinan",
                                "Prakarya Pengolahan",
                                "Prakarya Rekayasa"
                        ]
                },
                {
                        "kelas": 10,
                        "fase": "E",
                        "tingkat_pendidikan": "SMA/MA",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Bahasa Inggris",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Sejarah",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari",
                                "Fisika",
                                "Kimia",
                                "Biologi",
                                "Sosiologi",
                                "Ekonomi",
                                "Geografi",
                                "Informatika",
                                "Projek Ilmu Pengetahuan Alam Dan Sosial"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Koding Dan Kecerdasan Artifisial"
                        ]
                },
                {
                        "kelas": 11,
                        "fase": "F",
                        "tingkat_pendidikan": "SMA/MA",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Bahasa Inggris",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Sejarah",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Fisika",
                                "Kimia",
                                "Biologi",
                                "Informatika",
                                "Matematika Tingkat Lanjut",
                                "Bahasa Indonesia Tingkat Lanjut",
                                "Bahasa Inggris Tingkat Lanjut",
                                "Sosiologi",
                                "Ekonomi",
                                "Geografi",
                                "Antropologi",
                                "Sejarah Tingkat Lanjut",
                                "Koding Dan Kecerdasan Artifisial",
                                "Prakarya Dan Kewirausahaan Budi Daya",
                                "Prakarya Dan Kewirausahaan Kerajinan",
                                "Prakarya Dan Kewirausahaan Pengolahan",
                                "Prakarya Dan Kewirausahaan Rekayasa",
                                "Bahasa Arab",
                                "Bahasa Jepang",
                                "Bahasa Jerman",
                                "Bahasa Korea",
                                "Bahasa Mandarin",
                                "Bahasa Prancis"
                        ]
                },
                {
                        "kelas": 12,
                        "fase": "F",
                        "tingkat_pendidikan": "SMA/MA",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Matematika",
                                "Bahasa Inggris",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Sejarah",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Fisika",
                                "Kimia",
                                "Biologi",
                                "Informatika",
                                "Matematika Tingkat Lanjut",
                                "Bahasa Indonesia Tingkat Lanjut",
                                "Bahasa Inggris Tingkat Lanjut",
                                "Sosiologi",
                                "Ekonomi",
                                "Geografi",
                                "Antropologi",
                                "Sejarah Tingkat Lanjut",
                                "Koding Dan Kecerdasan Artifisial",
                                "Prakarya Dan Kewirausahaan Budi Daya",
                                "Prakarya Dan Kewirausahaan Kerajinan",
                                "Prakarya Dan Kewirausahaan Pengolahan",
                                "Prakarya Dan Kewirausahaan Rekayasa",
                                "Bahasa Arab",
                                "Bahasa Jepang",
                                "Bahasa Jerman",
                                "Bahasa Korea",
                                "Bahasa Mandarin",
                                "Bahasa Prancis"
                        ]
                },
                {
                        "kelas": 10,
                        "fase": "E",
                        "tingkat_pendidikan": "SMK/MAK",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Sejarah",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari",
                                "Matematika",
                                "Bahasa Inggris",
                                "Informatika",
                                "Projek Ilmu Pengetahuan Alam Dan Sosial"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Koding Dan Kecerdasan Artifisial",
                                "Dasar-dasar Teknik Otomotif",
                                "Dasar-dasar Teknik Mesin",
                                "Dasar-dasar Teknik Ketenagalistrikan",
                                "Dasar-dasar Teknik Elektronika",
                                "Dasar-dasar Pengembangan Perangkat Lunak Dan Gim",
                                "Dasar-dasar Teknik Jaringan Komputer Dan Telekomunikasi",
                                "Dasar-dasar Akuntansi Dan Keuangan Lembaga",
                                "Dasar-dasar Manajemen Perkantoran Dan Layanan Bisnis",
                                "Dasar-dasar Pemasaran",
                                "Dasar-dasar Perhotelan",
                                "Dasar-dasar Kuliner",
                                "Dasar-dasar Desain Komunikasi Visual",
                                "Dasar-dasar Busana",
                                "Dasar-dasar Layanan Kesehatan",
                                "Dasar-dasar Farmasi Klinis Dan Komunitas",
                                "Dasar-dasar Agriteknologi Pengolahan Hasil Pertanian",
                                "Dasar-dasar Agribisnis Tanaman",
                                "Dasar-dasar Teknik Konstruksi Dan Perumahan",
                                "Dasar-dasar Desain Pemodelan Dan Informasi Bangunan"
                        ]
                },
                {
                        "kelas": 11,
                        "fase": "F",
                        "tingkat_pendidikan": "SMK/MAK",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Pendidikan Jasmani, Olahraga, Dan Kesehatan",
                                "Sejarah",
                                "Seni Musik",
                                "Seni Rupa",
                                "Seni Teater",
                                "Seni Tari",
                                "Matematika",
                                "Bahasa Inggris",
                                "Projek Kreatif Dan Kewirausahaan",
                                "Praktik Kerja Lapangan (PKL)"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Koding Dan Kecerdasan Artifisial",
                                "Rekayasa Perangkat Lunak",
                                "Teknik Komputer Dan Jaringan",
                                "Teknik Kendaraan Ringan",
                                "Teknik Sepeda Motor",
                                "Teknik Pemesinan",
                                "Teknik Pengelasan",
                                "Teknik Instalasi Tenaga Listrik",
                                "Teknik Audio Video",
                                "Akuntansi",
                                "Manajemen Perkantoran",
                                "Bisnis Digital",
                                "Desain Komunikasi Visual",
                                "Tata Busana",
                                "Perhotelan",
                                "Kuliner",
                                "Asisten Keperawatan Dan Caregiver",
                                "Farmasi Klinis Dan Komunitas",
                                "Agribisnis Tanaman Pangan Dan Hortikultura"
                        ]
                },
                {
                        "kelas": 12,
                        "fase": "F",
                        "tingkat_pendidikan": "SMK/MAK",
                        "mata_pelajaran_wajib": [
                                "Pendidikan Agama Islam Dan Budi Pekerti",
                                "Pendidikan Agama Kristen Dan Budi Pekerti",
                                "Pendidikan Agama Katolik Dan Budi Pekerti",
                                "Pendidikan Agama Hindu Dan Budi Pekerti",
                                "Pendidikan Agama Buddha Dan Budi Pekerti",
                                "Pendidikan Agama Khonghucu Dan Budi Pekerti",
                                "Pendidikan Pancasila",
                                "Bahasa Indonesia",
                                "Sejarah",
                                "Matematika",
                                "Bahasa Inggris",
                                "Projek Kreatif Dan Kewirausahaan",
                                "Praktik Kerja Lapangan (PKL)"
                        ],
                        "mata_pelajaran_pilihan_atau_tingkat_lanjut": [
                                "Koding Dan Kecerdasan Artifisial",
                                "Rekayasa Perangkat Lunak",
                                "Teknik Komputer Dan Jaringan",
                                "Teknik Kendaraan Ringan",
                                "Teknik Sepeda Motor",
                                "Teknik Pemesinan",
                                "Teknik Pengelasan",
                                "Teknik Instalasi Tenaga Listrik",
                                "Teknik Audio Video",
                                "Akuntansi",
                                "Manajemen Perkantoran",
                                "Bisnis Digital",
                                "Desain Komunikasi Visual",
                                "Tata Busana",
                                "Perhotelan",
                                "Kuliner",
                                "Asisten Keperawatan Dan Caregiver",
                                "Farmasi Klinis Dan Komunitas",
                                "Agribisnis Tanaman Pangan Dan Hortikultura"
                        ]
                }
        ]
};


      const AUTO_CP_DATABASE = {};

      if (typeof window.BSKAP_046_DATA === "undefined") {
        window.BSKAP_046_DATA = null;
      }

      

      function loadBSKAP046Database() {
        if (window.BSKAP_046_DATA && (window.BSKAP_046_DATA.lampiran_II || window.BSKAP_046_DATA.lampiran_III)) {
          console.log('Loaded embedded/pre-existing BSKAP CP database.');
          onCPDatabaseLoaded();
          return;
        }

        const customDb = localStorage.getItem('custom_cp_database');
        if (customDb) {
          try {
            window.BSKAP_046_DATA = JSON.parse(customDb);
            console.log('Loaded custom CP database from localStorage.');
            onCPDatabaseLoaded();
            return;
          } catch (e) {
            console.error('Error parsing custom CP database from localStorage:', e);
          }
        }

        // Try to fetch automatically if online
        fetch('./capaian_pembelajaran_bskap_046_2025.json?v=2')
          .then(res => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error("HTTP error " + res.status);
            }
          })
          .then(data => {
            if (data && (data.lampiran_II || data.lampiran_III)) {
              window.BSKAP_046_DATA = data;
              console.log('Successfully fetched and loaded standard CP database from server.');
              onCPDatabaseLoaded();
            } else {
              throw new Error("Data JSON tidak lengkap");
            }
          })
          .catch(err => {
            console.warn('Gagal memuat database otomatis (Standalone/Offline):', err);
            onCPDatabaseFailed();
          });
      }

      function onCPDatabaseLoaded() {
        try {
          if (typeof updateDataUmumMapelOptions === 'function') {
            updateDataUmumMapelOptions(true);
          }
          if (typeof updateModalMapelOptions === 'function') {
            updateModalMapelOptions(true);
          }
          
          // Hide warning banner
          const warningEl = document.getElementById("cp-offline-warning-banner");
          if (warningEl) {
            warningEl.style.display = "none";
          }
        } catch (e) {
          console.warn("onCPDatabaseLoaded handler warning:", e);
        }
      }

      function onCPDatabaseFailed() {
        // Show warning banner or overlay indicating standalone mode
        const warningEl = document.getElementById("cp-offline-warning-banner");
        if (warningEl) {
          warningEl.style.display = "flex";
        }
        
        if (typeof updateDataUmumMapelOptions === 'function') {
          updateDataUmumMapelOptions(false);
        }
        if (typeof updateModalMapelOptions === 'function') {
          updateModalMapelOptions(false);
        }
      }
      loadBSKAP046Database(); // Start loading immediately!


      function parseGradeNumber(kelasStr) {
        if (!kelasStr) return null;
        const str = String(kelasStr).trim().toUpperCase();
        const mNum = str.match(/\d+/);
        if (mNum) return parseInt(mNum[0], 10);
        
        const romanMap = [
          ["XII", 12], ["XI", 11], ["IX", 9], ["VIII", 8], ["VII", 7],
          ["VI", 6], ["IV", 4], ["V", 5], ["III", 3], ["II", 2], ["I", 1], ["X", 10]
        ];
        for (const [rom, num] of romanMap) {
          const regex = new RegExp("\\b" + rom + "\\b", "i");
          if (regex.test(str)) return num;
        }
        return null;
      }

      function normalizeFase(f) {
        if (!f) return "C";
        const str = String(f).trim().toUpperCase();
        
        // Match explicit "FASE X" or single letter "X" (A-F)
        const faseMatch = str.match(/\bFASE\s*([A-F])\b/i) || str.match(/^([A-F])$/i);
        if (faseMatch) return faseMatch[1].toUpperCase();
        
        // Match grade numbers (Arabic or Roman)
        const gradeNum = parseGradeNumber(str);
        if (gradeNum) {
          if (gradeNum === 1 || gradeNum === 2) return "A";
          if (gradeNum === 3 || gradeNum === 4) return "B";
          if (gradeNum === 5 || gradeNum === 6) return "C";
          if (gradeNum >= 7 && gradeNum <= 9) return "D";
          if (gradeNum === 10) return "E";
          if (gradeNum === 11 || gradeNum === 12) return "F";
        }
        
        // Standalone single letter A-F in string
        const singleMatch = str.match(/\b([A-F])\b/);
        if (singleMatch) return singleMatch[1];

        return "C";
      }

      function searchBSKAP046Data(mapel, faseNorm) {
        const json = window.BSKAP_046_DATA;
        if (!mapel || !json) return null;
        const m = mapel.toLowerCase().trim();
        if (m === "muatan lokal" || m.startsWith("muatan lokal") || m === "lainnya" || m.startsWith("lainnya")) {
          return null;
        }
        const fNorm = normalizeFase(faseNorm);
        
        const allSubjects = [];
        if (json.lampiran_II && json.lampiran_II.mata_pelajaran) {
          allSubjects.push(...json.lampiran_II.mata_pelajaran);
        }
        if (json.lampiran_III && json.lampiran_III.mata_pelajaran) {
          allSubjects.push(...json.lampiran_III.mata_pelajaran);
        }

        const cleanMapel = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
        const targetClean = cleanMapel(m);

        // 1. Exact clean match
        let matched = allSubjects.find(s => cleanMapel(s.mata_pelajaran) === targetClean);

        // 2. Acronym or parenthetical match (e.g. "IPA" -> "Ilmu Pengetahuan Alam (IPA)")
        if (!matched) {
          matched = allSubjects.find(s => {
            const sm = s.mata_pelajaran.toLowerCase();
            const parenMatch = sm.match(/\(([^)]+)\)/);
            if (parenMatch && cleanMapel(parenMatch[1]) === targetClean) return true;
            return false;
          });
        }

        // 3. Clean normalized match stripping 'dasar-dasar'
        if (!matched) {
          const cleanNorm = (str) => {
            return (str || "").toLowerCase().trim()
              .replace(/^dasar-dasar\s+/i, "")
              .replace(/^dasar\s+/i, "")
              .replace(/[^a-z0-9]/g, "");
          };
          const mNorm = cleanNorm(m);
          matched = allSubjects.find(s => cleanNorm(s.mata_pelajaran) === mNorm);
        }

        // 4. Known vocational nomenclature aliases (e.g., Geospasial / Geomatika)
        if (!matched) {
          let aliasQuery = "";
          if (m.includes("geomatika") || m.includes("geospasial")) {
            aliasQuery = (fNorm === "E" || m.includes("dasar")) ? "dasar-dasar teknik geospasial" : "teknik geomatika";
          } else if (m === "ipa") {
            aliasQuery = "ilmu pengetahuan alam";
          } else if (m === "ips") {
            aliasQuery = "ilmu pengetahuan sosial";
          } else if (m === "ipas") {
            aliasQuery = "ilmu pengetahuan alam dan sosial";
          }
          if (aliasQuery) {
            const aliasClean = cleanMapel(aliasQuery);
            matched = allSubjects.find(s => cleanMapel(s.mata_pelajaran) === aliasClean);
          }
        }

        // 5. Substring candidate search if still not matched
        if (!matched && targetClean.length > 3) {
          const candidates = allSubjects.filter(s => {
            const sc = cleanMapel(s.mata_pelajaran);
            return sc.includes(targetClean) || targetClean.includes(sc);
          });
          if (candidates.length > 0) {
            candidates.sort((a, b) => Math.abs(cleanMapel(a.mata_pelajaran).length - targetClean.length) - Math.abs(cleanMapel(b.mata_pelajaran).length - targetClean.length));
            matched = candidates[0];
          }
        }

        if (!matched) return null;

        // Phase matching
        const fases = matched.fase || [];
        let fMatch = fases.find(f => {
          const fStr = typeof f === "string" ? f : f.fase;
          return fStr && fStr.toUpperCase().trim() === fNorm;
        });

        // Fallback to first available phase if target phase not explicitly found
        if (!fMatch && fases.length > 0) {
          fMatch = fases[0];
        }

        if (fMatch && fMatch.elemen) {
          return fMatch.elemen.map(e => ({
            elemen: e.elemen,
            subElemen: e.subelemen || e.sub_elemen || e.subElemen || "",
            cp: e.capaian_pembelajaran || e.cp || ""
          }));
        }

        return null;
      }

      function getAutoCPData(mapel, fase) {
        if (!mapel || !fase) return null;
        const m = mapel.toLowerCase().trim();
        if (m === "muatan lokal" || m.startsWith("muatan lokal") || m === "lainnya" || m.startsWith("lainnya")) {
          return null;
        }
        
        const fNorm = normalizeFase(fase);
        
        // Query official database JSON
        let elements = searchBSKAP046Data(mapel, fNorm);

        // Fallback generator only if not found in database JSON
        if ((!elements || elements.length === 0) && typeof generateFallbackCPElements === 'function') {
          elements = generateFallbackCPElements(mapel, fNorm);
        }
        
        if (!elements || elements.length === 0) return null;
        
        // Dynamically build TP/ATP rows for each element from its CP
        return elements.map(el => {
          const cleanedCP = cleanCPText(el.cp);
          // Split CP into clauses based on semicolons or periods
          const rawClauses = cleanedCP.split(/\s*;\s*|\s*\.(?!\d)\s*/);
          const rows = [];
          
          rawClauses.forEach(clause => {
            let s = clause.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, "");
            s = s.trim();
            s = s.replace(/^(?:murid|peserta didik|serta|dan)\s+/i, "").trim();
            s = s.replace(/^dapat\s+/i, "").trim();
            
            if (s.length > 8) {
              const cleaned = s.charAt(0).toUpperCase() + s.slice(1);
              rows.push({
                tp: cleaned,
                atp: cleaned
              });
            }
          });
          
          if (rows.length === 0) {
            rows.push({
              tp: `Memahami esensi dan konsep dari elemen ${el.elemen}`,
              atp: `Memahami esensi dan konsep dari elemen ${el.elemen}`
            });
            rows.push({
              tp: `Menerapkan dan merefleksikan nilai-nilai ${el.elemen} dalam kehidupan sehari-hari`,
              atp: `Menerapkan dan merefleksikan nilai-nilai ${el.elemen} dalam kehidupan sehari-hari`
            });
          }
          
          return {
            elemen: el.elemen,
            subElemen: el.subElemen || "",
            cp: cleanedCP,
            rows: rows
          };
        });
      }

      async function triggerManualAutoCP() {
        const kelas = currentKelasId ? daftarKelas.find((k) => k.id === currentKelasId) : null;
        const mapel = kelas ? kelas.mapel : (document.getElementById("f-mapel")?.value || "");
        const fase = kelas ? kelas.fase : (document.getElementById("f-fase")?.value || "");
        
        if (!window.BSKAP_046_DATA) {
          await showCustomAlert("Database Kosong", "Database Capaian Pembelajaran standar belum dimuat. Jika Anda menjalankan aplikasi secara offline, silakan impor berkas CP (JSON) terlebih dahulu menggunakan menu Kelola CP -> Impor Database CP (JSON).", "warning");
          return;
        }

        if (!mapel || !fase) {
          await showCustomAlert("Informasi Kurang", "Silakan tentukan atau isi Mata Pelajaran dan Fase terlebih dahulu pada Data Umum atau Kelas.", "info");
          return;
        }

        const autoData = getAutoCPData(mapel, fase);
        if (!autoData) {
          await showCustomAlert("Data Tidak Ditemukan", "Format atau nama Mata Pelajaran & Fase ini tidak ditemukan dalam database atau tidak didukung untuk pengisian otomatis.", "warning");
          return;
        }
        
        if (state.atpData && state.atpData.length > 0) {
          const ok = await confirmAsync(`Apakah Anda yakin ingin menimpa data Capaian Pembelajaran saat ini dengan data standar Kurikulum Merdeka untuk ${mapel} Fase ${fase}?`);
          if (!ok) {
            return;
          }
        }
        
        applyAutoCP();
      }

      function applyAutoCP() {
        const kelas = currentKelasId ? daftarKelas.find((k) => k.id === currentKelasId) : null;
        const mapel = kelas ? kelas.mapel : (document.getElementById("f-mapel")?.value || "");
        const fase = kelas ? kelas.fase : (document.getElementById("f-fase")?.value || "");
        
        const autoData = getAutoCPData(mapel, fase);
        if (autoData) {
          // Deep clone the database entries to state.atpData
          state.atpData = JSON.parse(JSON.stringify(autoData));
          
          // Re-render
          renderAtpInput();
          scheduleSave();
          markDirty();
          
          showSaveIndicator("CP Berhasil Terisi Otomatis! ✨", "success");
        }
      }
      async function removeAtpElemen(ei) {
        const ok = await confirmAsync("Hapus elemen ini beserta semua TP-nya?");
        if (!ok) return;
        state.atpData.splice(ei, 1);
        renderAtpInput();
        scheduleSave();
        markDirty();
      }
      function moveAtpRow(ei, ri, dir) {
        if (!state.atpData || !state.atpData[ei] || !state.atpData[ei].rows) return;
        const rows = state.atpData[ei].rows;
        const target = ri + dir;
        if (target < 0 || target >= rows.length) return;
        [rows[ri], rows[target]] = [rows[target], rows[ri]];
        
        const listEl = document.getElementById(`atp-tp-list-${ei}`);
        if (listEl && typeof renderAtpRowHtml === "function") {
          listEl.innerHTML = rows
            .map((row, idx) => renderAtpRowHtml(ei, idx, row, rows.length, idx === target))
            .join("");
          if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons({ attrs: { class: "lucide" }, node: listEl });
          }
          listEl.querySelectorAll("textarea").forEach((ta) => {
            ta.style.height = "auto";
            ta.style.height = (ta.scrollHeight + 2) + "px";
          });
          const targetTa = document.getElementById(`atp-textarea-${ei}-${target}`);
          if (targetTa) targetTa.focus();
        } else {
          renderAtpInput();
        }
        scheduleSave();
        markDirty();
      }

      function formatMapelName(str) {
        if (!str) return "";
        return str.split(" ").map(word => {
          return word.split("/").map(slashPart => {
            return slashPart.split("-").map(part => {
              if (!part) return part;
              let prefix = "";
              let suffix = "";
              let core = part;
              if (core.startsWith("(")) { prefix = "("; core = core.slice(1); }
              if (core.endsWith(")")) { suffix = ")"; core = core.slice(0, -1); }
              
              const upperList = ["IPAS", "IPA", "IPS", "SMK", "MAK", "SMA", "MA", "K3LH", "GIM", "AI", "CP", "ATP", "TP", "PKL", "PKK", "PJOK", "PAI"];
              if (upperList.includes(core.toUpperCase())) {
                return prefix + core.toUpperCase() + suffix;
              }
              
              return prefix + core.charAt(0).toUpperCase() + core.slice(1).toLowerCase() + suffix;
            }).join("-");
          }).join("/");
        }).join(" ");
      }

      function getMapelDataForKelasFase(fase, kelasStr, jenjang) {
        let gradeNum = parseGradeNumber(kelasStr);
        
        const fNorm = (fase || "").toUpperCase().trim() || "C";
        if (!gradeNum) {
          if (fNorm === "A") gradeNum = 1;
          else if (fNorm === "B") gradeNum = 3;
          else if (fNorm === "C") gradeNum = 5;
          else if (fNorm === "D") gradeNum = 7;
          else if (fNorm === "E") gradeNum = 10;
          else if (fNorm === "F") gradeNum = 11;
          else gradeNum = 1;
        }
        
        let jNorm = (jenjang || "").toUpperCase().trim();
        if (!jNorm) {
          if (["A", "B", "C"].includes(fNorm)) {
            jNorm = "SD";
          } else if (fNorm === "D") {
            jNorm = "SMP";
          } else {
            const modalOpen = !document.getElementById("modal-kelas")?.classList.contains("hidden");
            const domJ = (modalOpen ? document.getElementById("mk-jenjang")?.value : (document.getElementById("f-jenjang")?.value || document.getElementById("mk-jenjang")?.value));
            if (domJ) jNorm = domJ.toUpperCase().trim();
            else jNorm = "SMA";
          }
        }

        const isSmk = jNorm.includes("SMK") || jNorm.includes("MAK") || jNorm.includes("KEJURUAN");
        const isSma = (jNorm.includes("SMA") || jNorm.includes("MA") || jNorm.includes("ALIAH")) && !isSmk;
        const isSmp = (jNorm.includes("SMP") || jNorm.includes("MTS") || jNorm.includes("TSANAWIYAH")) && !isSmk && !isSma;
        const isSd = (jNorm.includes("SD") || jNorm.includes("MI") || jNorm.includes("IBTIDAIYAH")) && !isSmk && !isSma && !isSmp;

        const regObj = (typeof REGULASI_KURIKULUM_MAPEL !== "undefined" && REGULASI_KURIKULUM_MAPEL) || (typeof window !== "undefined" && window.REGULASI_KURIKULUM_MAPEL) || { daftar_kelas: [] };
        const daftarKelasList = (regObj && regObj.daftar_kelas) || [];

        let found = daftarKelasList.find(k => {
          if (k.kelas !== gradeNum || k.fase !== fNorm) return false;
          if (isSmk) return k.tingkat_pendidikan.includes("SMK") || k.tingkat_pendidikan.includes("MAK");
          if (isSma) return (k.tingkat_pendidikan.includes("SMA") || k.tingkat_pendidikan.includes("MA")) && !k.tingkat_pendidikan.includes("SMK");
          if (isSmp) return k.tingkat_pendidikan.includes("SMP");
          if (isSd) return k.tingkat_pendidikan.includes("SD");
          return true;
        }) || daftarKelasList.find(k => {
          if (k.fase !== fNorm) return false;
          if (isSmk) return k.tingkat_pendidikan.includes("SMK") || k.tingkat_pendidikan.includes("MAK");
          if (isSma) return (k.tingkat_pendidikan.includes("SMA") || k.tingkat_pendidikan.includes("MA")) && !k.tingkat_pendidikan.includes("SMK");
          if (isSmp) return k.tingkat_pendidikan.includes("SMP");
          if (isSd) return k.tingkat_pendidikan.includes("SD");
          return true;
        });

        if (!found) {
          if (isSmk) {
            found = daftarKelasList.find(k => (k.tingkat_pendidikan.includes("SMK") || k.tingkat_pendidikan.includes("MAK")) && k.fase === fNorm) ||
                    daftarKelasList.find(k => k.tingkat_pendidikan.includes("SMK") || k.tingkat_pendidikan.includes("MAK"));
          } else if (isSma) {
            found = daftarKelasList.find(k => (k.tingkat_pendidikan.includes("SMA") || k.tingkat_pendidikan.includes("MA")) && !k.tingkat_pendidikan.includes("SMK") && k.fase === fNorm) ||
                    daftarKelasList.find(k => (k.tingkat_pendidikan.includes("SMA") || k.tingkat_pendidikan.includes("MA")) && !k.tingkat_pendidikan.includes("SMK"));
          } else if (isSmp) {
            found = daftarKelasList.find(k => k.tingkat_pendidikan.includes("SMP"));
          } else {
            found = daftarKelasList.find(k => k.kelas === gradeNum && k.fase === fNorm) || daftarKelasList.find(k => k.fase === fNorm);
          }
        }

        const lowerMap = new Map();
        const wajibList = [];
        const pilihanList = [];

        const addMapel = (name, targetArr) => {
          if (!name || typeof name !== "string") return;
          const cleanName = formatMapelName(name.trim());
          const lower = cleanName.toLowerCase();
          if (!lowerMap.has(lower)) {
            lowerMap.set(lower, targetArr);
            targetArr.push(cleanName);
          }
        };

        // 1. Add Wajib from Regulasi
        if (found && found.mata_pelajaran_wajib) {
          found.mata_pelajaran_wajib.forEach(m => addMapel(m, wajibList));
        }

        // 2. Add Pilihan from Regulasi
        if (found && found.mata_pelajaran_pilihan_atau_tingkat_lanjut) {
          found.mata_pelajaran_pilihan_atau_tingkat_lanjut.forEach(m => addMapel(m, pilihanList));
        }

        // 3. Add from BSKAP JSON if available with STRICT jenjang segregation
        const bskapJson = window.BSKAP_046_DATA;
        if (bskapJson) {
          const processList = (list) => {
            if (!list) return;
            list.forEach(item => {
              const name = item.mata_pelajaran;
              if (!name) return;
              const matchesFase = (item.fase || []).some(fObj => {
                const fStr = typeof fObj === "string" ? fObj : fObj.fase;
                return fStr && fStr.toUpperCase().trim() === fNorm;
              });
              if (matchesFase) {
                addMapel(name, pilihanList);
              }
            });
          };

          if (isSmk) {
            // ONLY Lampiran III (SMK/MAK)
            processList(bskapJson.lampiran_III?.mata_pelajaran);
          } else if (isSma) {
            // ONLY Lampiran II (SMA/MA)
            processList(bskapJson.lampiran_II?.mata_pelajaran);
          } else {
            // Lampiran I/II (SD/SMP)
            processList(bskapJson.lampiran_I?.mata_pelajaran || bskapJson.lampiran_II?.mata_pelajaran);
          }
        }

        // 4. Add from AUTO_CP_DATABASE
        if (typeof AUTO_CP_DATABASE !== "undefined") {
          for (const k in AUTO_CP_DATABASE) {
            const item = AUTO_CP_DATABASE[k];
            if (item && item[fNorm]) {
              const itemJenjang = (item.jenjang || item.tingkat || "").toUpperCase().trim();
              const itemIsSmk = itemJenjang.includes("SMK") || itemJenjang.includes("MAK") || item.lampiran === "III";
              if (isSmk && itemJenjang && !itemIsSmk) continue;
              if (!isSmk && itemIsSmk) continue;
              const title = item.title;
              if (title) {
                addMapel(title, pilihanList);
              }
            }
          }
        }

        // Sort pilihan alphabetically
        pilihanList.sort((a,b) => a.localeCompare(b, "id"));

        return {
          mata_pelajaran_wajib: wajibList,
          mata_pelajaran_pilihan_atau_tingkat_lanjut: pilihanList,
          jenjang: isSmk ? "SMK" : (isSma ? "SMA" : (isSmp ? "SMP" : (isSd ? "SD" : jNorm)))
        };
      }

      function renderMapelSelectOptions(selectId, fase, kelasStr, currentVal, jenjang) {
        const sel = document.getElementById(selectId);
        if (!sel) return;

        let jNorm = jenjang;
        if (!jNorm) {
          if (selectId === "mk-mapel") {
            jNorm = document.getElementById("mk-jenjang")?.value;
          } else {
            jNorm = document.getElementById("f-jenjang")?.value;
          }
        }
        
        const mapelData = getMapelDataForKelasFase(fase, kelasStr, jNorm);
        const wajibList = mapelData.mata_pelajaran_wajib || [];
        const pilihanList = mapelData.mata_pelajaran_pilihan_atau_tingkat_lanjut || [];
        const isSmk = (mapelData.jenjang === "SMK" || mapelData.jenjang === "MAK" || (jNorm && (jNorm.toUpperCase().includes("SMK") || jNorm.toUpperCase().includes("MAK") || jNorm.toUpperCase().includes("KEJURUAN"))));
        
        let html = "";
        
        if (pilihanList.length > 0) {
          const wajibLabel = isSmk ? "Mata Pelajaran Umum (Wajib SMK/MAK)" : "Mata Pelajaran Wajib (Standar Kurikulum)";
          html += '<optgroup label="' + wajibLabel + '" style="background-color: #1e293b; color: #facc15; font-weight: bold;">';
          wajibList.forEach(m => {
            html += '<option value="' + m + '">' + m + '</option>';
          });
          html += '</optgroup>';
          
          const pilihanLabel = isSmk ? "Mata Pelajaran Kejuruan / Konsentrasi Keahlian (BSKAP 046/2025)" : "Mata Pelajaran Pilihan / Peminatan / Tingkat Lanjut (BSKAP 046/2025)";
          html += '<optgroup label="' + pilihanLabel + '" style="background-color: #1e293b; color: #facc15; font-weight: bold;">';
          pilihanList.forEach(m => {
            html += '<option value="' + m + '">' + m + '</option>';
          });
          html += '</optgroup>';
        } else {
          wajibList.forEach(m => {
            html += '<option value="' + m + '">' + m + '</option>';
          });
        }
        
        html += '<optgroup label="Muatan Lokal & Kustom" style="background-color: #1e293b; color: #38bdf8; font-weight: bold;">';
        html += '<option value="Muatan Lokal">Muatan Lokal</option>';
        html += '<option value="Lainnya">Lainnya...</option>';
        html += '</optgroup>';
        
        sel.innerHTML = html;
        
        if (currentVal) {
          const allOptions = Array.from(sel.querySelectorAll("option")).map(o => o.value);
          const matched = matchMapelOption(allOptions, currentVal);
          if (matched) {
            sel.value = matched;
          }
        }
      }

      function checkDataUmumMapelLock(resetMapelToDefault = false) {
        const faseEl = document.getElementById("f-fase");
        const kelasEl = document.getElementById("f-kelas");
        const rombelEl = document.getElementById("f-rombel");
        const mapelEl = document.getElementById("f-mapel");
        const noticeEl = document.getElementById("f-mapel-lock-notice");
        const manualContainer = document.getElementById("f-mapel-manual-container");

        if (!faseEl || !kelasEl || !rombelEl || !mapelEl) return;

        const faseVal = (faseEl.value || "").trim();
        const kelasVal = (kelasEl.value || "").trim();
        const rombelVal = (rombelEl.value || "").trim();

        const isFilled = Boolean(faseVal && kelasVal && rombelVal);

        if (!isFilled) {
          mapelEl.disabled = true;
          if (noticeEl) noticeEl.classList.remove("hidden");
          if (manualContainer) manualContainer.classList.add("hidden");
        } else {
          const wasDisabled = mapelEl.disabled;
          mapelEl.disabled = false;
          if (noticeEl) noticeEl.classList.add("hidden");

          const preserveCurrent = !(wasDisabled || resetMapelToDefault);
          updateDataUmumMapelOptions(preserveCurrent);

          if (wasDisabled || resetMapelToDefault || !mapelEl.value) {
            const defaultMapel = "Pendidikan Agama Islam dan Budi Pekerti";
            const options = Array.from(mapelEl.querySelectorAll("option")).map(o => o.value);
            if (options.includes(defaultMapel)) {
              mapelEl.value = defaultMapel;
            } else if (options.length > 0) {
              mapelEl.value = options[0];
            }
            toggleMapelManual("f-mapel", "f-mapel-manual-container", "f-mapel-manual");
          }
        }
      }

      function checkModalMapelLock(resetMapelToDefault = false) {
        const faseEl = document.getElementById("mk-fase");
        const kelasEl = document.getElementById("mk-kelas");
        const rombelEl = document.getElementById("mk-rombel");
        const mapelEl = document.getElementById("mk-mapel");
        const noticeEl = document.getElementById("mk-mapel-lock-notice");
        const manualContainer = document.getElementById("mk-mapel-manual-container");

        if (!faseEl || !kelasEl || !rombelEl || !mapelEl) return;

        const faseVal = (faseEl.value || "").trim();
        const kelasVal = (kelasEl.value || "").trim();
        const rombelVal = (rombelEl.value || "").trim();

        const isFilled = Boolean(faseVal && kelasVal && rombelVal);

        if (!isFilled) {
          mapelEl.disabled = true;
          if (noticeEl) noticeEl.classList.remove("hidden");
          if (manualContainer) manualContainer.classList.add("hidden");
        } else {
          const wasDisabled = mapelEl.disabled;
          mapelEl.disabled = false;
          if (noticeEl) noticeEl.classList.add("hidden");

          const preserveCurrent = !(wasDisabled || resetMapelToDefault);
          updateModalMapelOptions(preserveCurrent);

          if (wasDisabled || resetMapelToDefault || !mapelEl.value) {
            const defaultMapel = "Pendidikan Agama Islam dan Budi Pekerti";
            const options = Array.from(mapelEl.querySelectorAll("option")).map(o => o.value);
            if (options.includes(defaultMapel)) {
              mapelEl.value = defaultMapel;
            } else if (options.length > 0) {
              mapelEl.value = options[0];
            }
            toggleMapelManual("mk-mapel", "mk-mapel-manual-container", "mk-mapel-manual");
          }
        }
      }

      function matchMapelOption(allOptionVals, val) {
        if (!val || typeof val !== "string") return null;
        const clean = val.trim();
        if (!clean || clean === "Muatan Lokal" || clean === "Lainnya") return null;

        if (allOptionVals.includes(clean)) return clean;

        const cleanLower = clean.toLowerCase();
        const matchCase = allOptionVals.find(o => o.trim().toLowerCase() === cleanLower);
        if (matchCase) return matchCase;

        const formatted = typeof formatMapelName === "function" ? formatMapelName(clean) : clean;
        const matchFormat = allOptionVals.find(o => o.trim().toLowerCase() === formatted.trim().toLowerCase());
        if (matchFormat) return matchFormat;

        return null;
      }

      function updateDataUmumMapelOptions(preserveCurrent = true) {
        const sel = document.getElementById("f-mapel");
        const container = document.getElementById("f-mapel-manual-container");
        const inp = document.getElementById("f-mapel-manual");
        if (!sel) return;

        const rawVal = preserveCurrent ? getMapelValue("f-mapel", "f-mapel-manual") : "";
        const currentSelVal = sel.value;
        const fase = document.getElementById("f-fase")?.value || "C";
        const kelas = document.getElementById("f-kelas")?.value || "Kelas V";
        const jenjang = document.getElementById("f-jenjang")?.value || "SD";

        renderMapelSelectOptions("f-mapel", fase, kelas, rawVal, jenjang);

        const allOptionVals = Array.from(sel.querySelectorAll("option")).map(o => o.value);
        const matched = matchMapelOption(allOptionVals, rawVal);

        if (matched) {
          sel.value = matched;
          if (container) container.classList.add("hidden");
          if (inp && inp.value === matched) inp.value = "";
        } else if (rawVal && (rawVal === "Muatan Lokal" || rawVal.toLowerCase().startsWith("muatan lokal"))) {
          sel.value = "Muatan Lokal";
          if (container) container.classList.remove("hidden");
          if (inp) {
            inp.value = rawVal;
            autoResizeTextarea(inp);
          }
        } else if (rawVal && rawVal === "Lainnya") {
          sel.value = "Lainnya";
          if (container) container.classList.remove("hidden");
          if (inp && inp.value === "Lainnya") inp.value = "";
        } else if (rawVal) {
          sel.value = (currentSelVal === "Lainnya") ? "Lainnya" : "Muatan Lokal";
          if (container) container.classList.remove("hidden");
          if (inp) {
            inp.value = rawVal;
            autoResizeTextarea(inp);
          }
        } else {
          const defaultPai = "Pendidikan Agama Islam dan Budi Pekerti";
          const matchedPai = matchMapelOption(allOptionVals, defaultPai);
          if (matchedPai) sel.value = matchedPai;
          else if (allOptionVals.includes("Matematika")) sel.value = "Matematika";
          else sel.value = allOptionVals[0] || "Muatan Lokal";
          if (container) container.classList.add("hidden");
          if (inp) inp.value = "";
        }

        const newMapel = getMapelValue("f-mapel", "f-mapel-manual");
        const lbl = document.getElementById("sidebar-kelas-label");
        if (lbl) {
          lbl.textContent = `${newMapel} · ${kelas}`;
        }
      }

      function updateModalMapelOptions(preserveCurrent = true) {
        const sel = document.getElementById("mk-mapel");
        const container = document.getElementById("mk-mapel-manual-container");
        const inp = document.getElementById("mk-mapel-manual");
        if (!sel) return;

        const rawVal = preserveCurrent ? getMapelValue("mk-mapel", "mk-mapel-manual") : "";
        const currentSelVal = sel.value;
        const fase = document.getElementById("mk-fase")?.value || "C";
        const kelas = document.getElementById("mk-kelas")?.value || "Kelas V";
        const jenjang = document.getElementById("mk-jenjang")?.value || "SD";

        renderMapelSelectOptions("mk-mapel", fase, kelas, rawVal, jenjang);

        const allOptionVals = Array.from(sel.querySelectorAll("option")).map(o => o.value);
        const matched = matchMapelOption(allOptionVals, rawVal);

        if (matched) {
          sel.value = matched;
          if (container) container.classList.add("hidden");
          if (inp && inp.value === matched) inp.value = "";
        } else if (rawVal && (rawVal === "Muatan Lokal" || rawVal.toLowerCase().startsWith("muatan lokal"))) {
          sel.value = "Muatan Lokal";
          if (container) container.classList.remove("hidden");
          if (inp) {
            inp.value = rawVal;
            autoResizeTextarea(inp);
          }
        } else if (rawVal && rawVal === "Lainnya") {
          sel.value = "Lainnya";
          if (container) container.classList.remove("hidden");
          if (inp && inp.value === "Lainnya") inp.value = "";
        } else if (rawVal) {
          sel.value = (currentSelVal === "Lainnya") ? "Lainnya" : "Muatan Lokal";
          if (container) container.classList.remove("hidden");
          if (inp) {
            inp.value = rawVal;
            autoResizeTextarea(inp);
          }
        } else {
          const defaultPai = "Pendidikan Agama Islam dan Budi Pekerti";
          const matchedPai = matchMapelOption(allOptionVals, defaultPai);
          if (matchedPai) sel.value = matchedPai;
          else if (allOptionVals.includes("Matematika")) sel.value = "Matematika";
          else sel.value = allOptionVals[0] || "Muatan Lokal";
          if (container) container.classList.add("hidden");
          if (inp) inp.value = "";
        }
        updateModalPlaceholders();
      }

      function loadMapelUI(selectId, inputContainerId, inputId, val, fase, kelasStr, jenjang) {
        const j = jenjang || (selectId === "mk-mapel" ? document.getElementById("mk-jenjang")?.value : document.getElementById("f-jenjang")?.value) || "SD";
        const f = fase || (selectId === "mk-mapel" ? document.getElementById("mk-fase")?.value : document.getElementById("f-fase")?.value) || "C";
        const k = kelasStr || (selectId === "mk-mapel" ? document.getElementById("mk-kelas")?.value : document.getElementById("f-kelas")?.value) || "Kelas V";

        renderMapelSelectOptions(selectId, f, k, val, j);
        const sel = document.getElementById(selectId);
        const container = document.getElementById(inputContainerId);
        const inp = document.getElementById(inputId);
        if (!sel) return;

        const cleanVal = (val || "").trim();
        const optionVals = Array.from(sel.querySelectorAll("option")).map(o => o.value);
        const matched = matchMapelOption(optionVals, cleanVal);

        if (matched) {
          sel.value = matched;
          if (container) container.classList.add("hidden");
          if (inp) inp.value = "";
        } else if (cleanVal && (cleanVal === "Muatan Lokal" || cleanVal.toLowerCase().startsWith("muatan lokal"))) {
          sel.value = "Muatan Lokal";
          if (container) container.classList.remove("hidden");
          if (inp) {
            inp.value = cleanVal;
            autoResizeTextarea(inp);
          }
        } else if (cleanVal === "Lainnya") {
          sel.value = "Lainnya";
          if (container) container.classList.remove("hidden");
          if (inp) {
            inp.value = "";
            autoResizeTextarea(inp);
          }
        } else if (cleanVal) {
          sel.value = (sel.value === "Lainnya") ? "Lainnya" : "Muatan Lokal";
          if (container) container.classList.remove("hidden");
          if (inp) {
            inp.value = cleanVal;
            autoResizeTextarea(inp);
          }
        } else {
          const defaultPai = "Pendidikan Agama Islam dan Budi Pekerti";
          const matchedPai = matchMapelOption(optionVals, defaultPai);
          if (matchedPai) sel.value = matchedPai;
          else if (optionVals.includes("Matematika")) sel.value = "Matematika";
          else sel.value = optionVals[0] || "Muatan Lokal";
          if (container) container.classList.add("hidden");
          if (inp) inp.value = "";
        }
      }

      function getKelasSuggestionsByFase(fase, jenjang = "") {
        const f = (fase || "").toUpperCase().trim();
        if (f === "A") return ["Kelas I", "Kelas II"];
        if (f === "B") return ["Kelas III", "Kelas IV"];
        if (f === "C") return ["Kelas V", "Kelas VI"];
        if (f === "D") return ["Kelas VII", "Kelas VIII", "Kelas IX"];
        if (f === "E") return ["Kelas X"];
        if (f === "F") return ["Kelas XI", "Kelas XII"];

        const j = (jenjang || "").toUpperCase().trim();
        if (j === "SD") return ["Kelas I", "Kelas II", "Kelas III", "Kelas IV", "Kelas V", "Kelas VI"];
        if (j === "SMP") return ["Kelas VII", "Kelas VIII", "Kelas IX"];
        if (j === "SMA" || j === "SMK") return ["Kelas X", "Kelas XI", "Kelas XII"];
        return ["Kelas I", "Kelas II", "Kelas III", "Kelas IV", "Kelas V", "Kelas VI"];
      }

      function updateFaseOptions(resetToDefault = false) {
        const jenjang = document.getElementById("f-jenjang")?.value || "SD";
        const faseSelect = document.getElementById("f-fase");
        if (!faseSelect) return;

        const prevFase = faseSelect.value;
        let options = [];

        if (jenjang === "SD") {
          options = [
            { val: "A" },
            { val: "B" },
            { val: "C" }
          ];
        } else if (jenjang === "SMP") {
          options = [
            { val: "D" }
          ];
        } else if (jenjang === "SMA" || jenjang === "SMK") {
          options = [
            { val: "E" },
            { val: "F" }
          ];
        } else {
          options = [
            { val: "A" }, { val: "B" }, { val: "C" },
            { val: "D" }, { val: "E" }, { val: "F" }
          ];
        }

        faseSelect.innerHTML = options
          .map(o => `<option value="${o.val}">${o.val}</option>`)
          .join("");

        const validVals = options.map(o => o.val);
        if (validVals.includes(prevFase) && !resetToDefault) {
          faseSelect.value = prevFase;
        } else {
          faseSelect.value = validVals[0];
        }

        updateKelasSuggestions(resetToDefault);

        if (typeof scheduleSave === "function") {
          scheduleSave();
          markDirty();
        }
      }

      function updateKelasSuggestions(resetMapel = false, targetKelas = null) {
        const jenjang = document.getElementById("f-jenjang")?.value || "SD";
        const fase = document.getElementById("f-fase")?.value || "C";
        const kelasSelect = document.getElementById("f-kelas");
        if (!kelasSelect) return;

        const prevValue = targetKelas !== null && targetKelas !== undefined ? targetKelas : kelasSelect.value;
        let suggestions = getKelasSuggestionsByFase(fase, jenjang);

        if (targetKelas && !suggestions.includes(targetKelas)) {
          suggestions.push(targetKelas);
        }

        kelasSelect.innerHTML = suggestions
          .map(s => `<option value="${s}">${s}</option>`)
          .join("");

        if (prevValue && suggestions.includes(prevValue)) {
          kelasSelect.value = prevValue;
        } else if (suggestions.length > 0) {
          const prevNum = typeof parseGradeNumber === "function" ? parseGradeNumber(prevValue) : null;
          const matchedRom = suggestions.find(s => typeof parseGradeNumber === "function" && parseGradeNumber(s) === prevNum);
          if (matchedRom) {
            kelasSelect.value = matchedRom;
          } else {
            kelasSelect.value = suggestions[0];
          }
        }

        updateDataUmumMapelOptions(!resetMapel);
        updateDataUmumPlaceholders();
      }

      function updateDataUmumPlaceholders() {
        const jenjangEl = document.getElementById("f-jenjang");
        const sekolahEl = document.getElementById("f-sekolah");
        const kelasEl = document.getElementById("f-kelas");
        const rombelEl = document.getElementById("f-rombel");
        const kepsekEl = document.getElementById("f-kepsek");

        if (sekolahEl) {
          const jenjangVal = (jenjangEl?.value || "SD").trim();
          sekolahEl.placeholder = `${jenjangVal} Negeri 17 Nusantara`;
        }

        if (rombelEl) {
          let kelasVal = (kelasEl?.value || "").trim();
          kelasVal = kelasVal.replace(/^kelas\s+/i, "").trim();
          rombelEl.placeholder = `${kelasVal || "V"} Putra`;
        }

        if (kepsekEl) {
          kepsekEl.placeholder = "Abdurrahman, M.Pd., Gr.";
        }
      }

      function updateModalPlaceholders() {
        const jenjangEl = document.getElementById("mk-jenjang");
        const sekolahEl = document.getElementById("mk-sekolah");
        const kelasEl = document.getElementById("mk-kelas");
        const rombelEl = document.getElementById("mk-rombel");

        if (sekolahEl) {
          const jenjangVal = (jenjangEl?.value || "SD").trim();
          sekolahEl.placeholder = `${jenjangVal} Negeri 17 Nusantara`;
        }

        if (rombelEl) {
          let kelasVal = (kelasEl?.value || "").trim();
          kelasVal = kelasVal.replace(/^kelas\s+/i, "").trim();
          rombelEl.placeholder = `${kelasVal || "V"} Putra`;
        }
      }

      function updateModalFaseOptions(resetToDefault = false) {
        const jenjang = document.getElementById("mk-jenjang")?.value || "SD";
        const faseSelect = document.getElementById("mk-fase");
        if (!faseSelect) return;

        const prevFase = faseSelect.value;
        let options = [];

        if (jenjang === "SD") {
          options = [{ val: "A" }, { val: "B" }, { val: "C" }];
        } else if (jenjang === "SMP") {
          options = [{ val: "D" }];
        } else if (jenjang === "SMA" || jenjang === "SMK") {
          options = [{ val: "E" }, { val: "F" }];
        } else {
          options = [{ val: "A" }, { val: "B" }, { val: "C" }, { val: "D" }, { val: "E" }, { val: "F" }];
        }

        faseSelect.innerHTML = options
          .map(o => `<option value="${o.val}">${o.val}</option>`)
          .join("");

        const validVals = options.map(o => o.val);
        if (validVals.includes(prevFase) && !resetToDefault) {
          faseSelect.value = prevFase;
        } else {
          faseSelect.value = validVals[0];
        }

        updateModalKelasSuggestions(resetToDefault);
      }

      function updateModalKelasSuggestions(resetMapelOrTarget = false, targetKelas = null) {
        const jenjang = document.getElementById("mk-jenjang")?.value || "SD";
        const fase = document.getElementById("mk-fase")?.value || "C";
        const kelasSelect = document.getElementById("mk-kelas");
        if (!kelasSelect) return;

        let resetMapel = false;
        let explicitTarget = targetKelas;

        if (typeof resetMapelOrTarget === "boolean") {
          resetMapel = resetMapelOrTarget;
        } else if (typeof resetMapelOrTarget === "string") {
          explicitTarget = resetMapelOrTarget;
        }

        const prevVal = explicitTarget !== null && explicitTarget !== undefined ? explicitTarget : kelasSelect.value;
        let suggestions = getKelasSuggestionsByFase(fase, jenjang);

        if (explicitTarget && !suggestions.includes(explicitTarget)) {
          suggestions.push(explicitTarget);
        }

        kelasSelect.innerHTML = suggestions
          .map(s => `<option value="${s}">${s}</option>`)
          .join("");

        if (prevVal && suggestions.includes(prevVal)) {
          kelasSelect.value = prevVal;
        } else if (suggestions.length > 0) {
          const prevNum = typeof parseGradeNumber === "function" ? parseGradeNumber(prevVal) : null;
          const matchedRom = suggestions.find(s => typeof parseGradeNumber === "function" && parseGradeNumber(s) === prevNum);
          if (matchedRom) {
            kelasSelect.value = matchedRom;
          } else {
            kelasSelect.value = suggestions[0];
          }
        }

        updateModalMapelOptions(!resetMapel);
        updateModalPlaceholders();
      }

      function getMapelValue(selectId, inputId) {
        const sel = document.getElementById(selectId);
        if (!sel) return "";
        const val = sel.value;
        if (val === "Muatan Lokal" || val === "Lainnya") {
          const inp = document.getElementById(inputId);
          const manualVal = inp ? inp.value.trim() : "";
          if (manualVal) return manualVal;
          return val;
        }
        return val;
      }

      function autoResizeTextarea(el) {
        if (!el) return;
        if (el.tagName && el.tagName.toLowerCase() === "textarea") {
          el.style.height = "auto";
          el.style.height = (el.scrollHeight + 2) + "px";
        }
      }

      function toggleMapelManual(selectId, inputContainerId, inputId) {
        const sel = document.getElementById(selectId);
        const container = document.getElementById(inputContainerId);
        const inp = document.getElementById(inputId);
        if (!sel || !container) return;
        
        if (sel.value === "Muatan Lokal") {
          container.classList.remove("hidden");
          if (inp) {
            inp.placeholder = "Tulis nama Muatan Lokal kustom (contoh: Bahasa Daerah, PLH, dll)...";
            inp.focus();
            autoResizeTextarea(inp);
          }
        } else if (sel.value === "Lainnya") {
          container.classList.remove("hidden");
          if (inp) {
            inp.placeholder = "Tulis nama mata pelajaran kustom...";
            inp.focus();
            autoResizeTextarea(inp);
          }
        } else {
          container.classList.add("hidden");
          if (inp) {
            inp.value = "";
            autoResizeTextarea(inp);
          }
        }
      }


      // Check session on load
      async function initAppSession() {
        try {
          const sessionUser = localStorage.getItem("current_local_user");
          if (sessionUser) {
            currentUser = JSON.parse(sessionUser);
            await loadDaftarKelas(currentUser.uid);
            showDashboard();
          } else {
            currentUser = null;
            showLoginScreen();
          }
        } catch (e) {
          console.error("Init session error:", e);
          currentUser = null;
          showLoginScreen();
        }

        // Initialize default academic year and date if inputs exist
        try {
          const autoTA = typeof getAutoTahunAjaran === "function" ? getAutoTahunAjaran() : "2025/2026";
          const fTahunInput = document.getElementById("f-tahun");
          if (fTahunInput && !fTahunInput.value) {
            fTahunInput.value = autoTA;
          }
          const fTglInput = document.getElementById("f-tgl");
          if (fTglInput && (!fTglInput.value || fTglInput.value === "2025-07-14")) {
            if (typeof getDefaultTanggalPengesahan === "function") {
              fTglInput.value = getDefaultTanggalPengesahan(autoTA);
            }
          }

          // Attach registration checker
          const nameInput = document.getElementById("login-nama");
          if (nameInput && typeof checkNameRegistration === "function") {
            nameInput.addEventListener("input", checkNameRegistration);
            nameInput.addEventListener("blur", checkNameRegistration);
          }
        } catch (err) {
          console.error("Init input error:", err);
        }
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAppSession);
      } else {
        initAppSession();
      }

      // Hard safety fallback: Always hide loading spinner after max 500ms
      setTimeout(() => {
        const loadingEl = document.getElementById("fb-loading");
        if (loadingEl && !loadingEl.classList.contains("hidden")) {
          loadingEl.classList.add("hidden");
          if (!currentUser) {
            showLoginScreen();
          } else {
            showDashboard();
          }
        }
      }, 500);

      // ============================================================
      // LICENSING & REGISTRATION HELPER
      // ============================================================
      function isValidLicenseKey(key) {
        if (!key) return false;
        const cleanKey = key.trim().toUpperCase();
        
        // Master Keys for quick developer setup/custom codes
        const masterKeys = ["PGGURU26", "PGOFFLIN", "PGACTIVE"];
        if (masterKeys.includes(cleanKey)) return true;
        
        // Mathematical generator pattern: 8 digits (no spaces, no dashes)
        // Part 1 (first 4 digits) must sum to 15
        // Part 2 (last 4 digits) must sum to 22
        const regex = /^(\d{4})(\d{4})$/;
        const match = cleanKey.match(regex);
        if (match) {
          const firstPart = match[1];
          const secondPart = match[2];
          
          const sumFirst = firstPart.split('').reduce((acc, val) => acc + parseInt(val, 10), 0);
          const sumSecond = secondPart.split('').reduce((acc, val) => acc + parseInt(val, 10), 0);
          
          return sumFirst === 15 && sumSecond === 22;
        }
        return false;
      }

      function findUserKey(users, name) {
        if (!users || !name) return null;
        const clean = name.trim().toLowerCase();
        if (!clean) return null;

        if (users[name]) return name;

        // Exact case-insensitive match
        for (const key of Object.keys(users)) {
          if (key.trim().toLowerCase() === clean) {
            return key;
          }
        }

        // Soft match ignoring gelar/titles (e.g. "Eka Fitriansyah, S.Pd." vs "Eka Fitriansyah")
        const stripGelar = (str) => str.toLowerCase().replace(/,\s*[a-z0-9\.\s]+/gi, "").trim();
        const baseTarget = stripGelar(clean);

        if (baseTarget.length >= 3) {
          for (const key of Object.keys(users)) {
            const baseKey = stripGelar(key);
            if (baseKey === baseTarget) {
              return key;
            }
          }
        }

        return null;
      }

      function checkNameRegistration() {
        const nameInput = document.getElementById("login-nama");
        const licenseField = document.getElementById("license-field");
        if (!nameInput || !licenseField) return;

        const name = (nameInput.value || "").trim();
        if (!name) {
          licenseField.style.display = "none";
          return;
        }

        const users = JSON.parse(localStorage.getItem("perangkat_guru_local_users") || "{}");
        const matchedKey = findUserKey(users, name);
        if (matchedKey) {
          licenseField.style.display = "none";
        } else {
          licenseField.style.display = "block";
        }
      }

      function toggleLoginPasswordVisibility() {
        const passInp = document.getElementById("login-password");
        const toggleBtn = document.getElementById("login-password-toggle");
        if (!passInp) return;
        const isPassword = passInp.type === "password";
        passInp.type = isPassword ? "text" : "password";

        if (toggleBtn) {
          toggleBtn.title = isPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi";
          toggleBtn.setAttribute("aria-label", isPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
          toggleBtn.innerHTML = `<i class="material-symbols-rounded" style="font-size: 17px;" data-lucide="${isPassword ? "eye-off" : "eye"}"></i>`;
          if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons({
              attrs: { class: "lucide" },
              node: toggleBtn
            });
          }
        }
      }

      async function doLogin() {
        let nama = (document.getElementById("login-nama")?.value || "").trim();
        const pass = document.getElementById("login-password")?.value || "";
        const errEl = document.getElementById("login-err");
        if (errEl) errEl.textContent = "";

        if (!nama) {
          if (errEl) errEl.textContent = "Nama Lengkap & Gelar tidak boleh kosong.";
          return;
        }
        if (!pass) {
          if (errEl) errEl.textContent = "Password tidak boleh kosong.";
          return;
        }

        const btn = document.getElementById("auth-submit-btn");
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Masuk...";
        }

        try {
          // Load users list
          let users = JSON.parse(localStorage.getItem("perangkat_guru_local_users") || "{}");
          let existingKey = findUserKey(users, nama);
          
          if (!existingKey) {
            // Unregistered user tries to sign up
            const licenseKey = (document.getElementById("login-license")?.value || "").trim();
            if (!licenseKey) {
              if (errEl) errEl.textContent = "Kode Lisensi wajib diisi untuk aktivasi perangkat baru.";
              if (btn) {
                btn.disabled = false;
                btn.textContent = "Masuk";
              }
              return;
            }

            if (!isValidLicenseKey(licenseKey)) {
              if (errEl) errEl.textContent = "Kode Lisensi tidak valid. Silakan hubungi administrator untuk lisensi resmi.";
              if (btn) {
                btn.disabled = false;
                btn.textContent = "Masuk";
              }
              return;
            }

            // Create user securely with their set password
            const uid = "usr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
            users[nama] = {
              password: pass,
              uid: uid,
              activatedWith: licenseKey.toUpperCase()
            };
            localStorage.setItem("perangkat_guru_local_users", JSON.stringify(users));
            await alert("Aktivasi Lisensi Berhasil! Akun Anda telah aktif secara offline.");
            existingKey = nama;
          } else {
            nama = existingKey; // Use existing account key
          }

          // Validate password
          if (users[nama].password !== pass) {
            if (errEl) errEl.textContent = "Password salah.";
            if (btn) {
              btn.disabled = false;
              btn.textContent = "Masuk";
            }
            return;
          }

          // Set current user session
          const localUser = {
            uid: users[nama].uid,
            displayName: nama,
            email: nama + "@local.db"
          };
          localStorage.setItem("current_local_user", JSON.stringify(localUser));
          currentUser = localUser;

          // Reset button and clear password field
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Masuk";
          }
          const passInput = document.getElementById("login-password");
          if (passInput) passInput.value = "";

          // Load data & proceed
          await loadDaftarKelas(localUser.uid);
          showDashboard();
          
        } catch (err) {
          if (errEl) errEl.textContent = "Terjadi kesalahan: " + err.message;
        } finally {
          const btnFin = document.getElementById("auth-submit-btn");
          if (btnFin) {
            btnFin.disabled = false;
            btnFin.textContent = "Masuk";
          }
        }
      }

      function showCustomAlert(title, text, type = 'info') {
        return new Promise((resolve) => {
          const existing = document.getElementById("custom-alert-modal");
          if (existing) existing.remove();

          const modal = document.createElement("div");
          modal.id = "custom-alert-modal";
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(8, 13, 24, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          `;

          const isSuccess = type === 'success';
          const isError = type === 'error';
          const isWarning = type === 'warning';
          
          let iconColor = '#60a5fa'; // info blue
          let iconBg = 'rgba(59, 130, 246, 0.15)';
          let svgPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>';
          
          if (isSuccess) {
            iconColor = '#4ade80';
            iconBg = 'rgba(74, 222, 128, 0.15)';
            svgPath = '<path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>';
          } else if (isError) {
            iconColor = '#f87171';
            iconBg = 'rgba(248, 113, 113, 0.15)';
            svgPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
          } else if (isWarning) {
            iconColor = '#facc15';
            iconBg = 'rgba(250, 204, 21, 0.15)';
            svgPath = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
          }

          modal.innerHTML = `
            <div style="
              background: #0c1527;
              border: 1px solid rgba(255, 255, 255, 0.15);
              border-radius: 16px;
              width: 90%;
              max-width: 400px;
              padding: 24px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              transform: scale(0.92);
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            ">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: ${iconBg}; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5">
                  ${svgPath}
                </svg>
              </div>
              <h4 style="color: #f8fafc; font-size: 16px; font-weight: 700; margin-bottom: 8px; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em;">${title}</h4>
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 24px; font-family: 'Plus Jakarta Sans', sans-serif; white-space: pre-line;">${text}</p>
              <button id="custom-alert-ok" style="
                background: ${isSuccess ? '#10b981' : (isError ? '#ef4444' : 'var(--accent, #facc15)')};
                color: ${isSuccess || isError ? '#ffffff' : '#0c1527'};
                border: none;
                border-radius: 10px;
                padding: 10px 24px;
                font-weight: 700;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
                width: 100%;
                font-family: 'Plus Jakarta Sans', sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              ">OK</button>
            </div>
          `;

          document.body.appendChild(modal);

          setTimeout(() => {
            modal.style.opacity = '1';
            if (modal.firstElementChild) modal.firstElementChild.style.transform = 'scale(1)';
          }, 10);

          const closeBtn = modal.querySelector("#custom-alert-ok");
          if (closeBtn) closeBtn.focus();

          const closeModal = () => {
            modal.style.opacity = '0';
            if (modal.firstElementChild) modal.firstElementChild.style.transform = 'scale(0.92)';
            setTimeout(() => {
              modal.remove();
              resolve();
            }, 200);
          };

          if (closeBtn) closeBtn.addEventListener("click", closeModal);
          modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
          });

          const handleKey = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              document.removeEventListener('keydown', handleKey);
              closeModal();
            }
          };
          document.addEventListener('keydown', handleKey);
        });
      }

      function showCustomPrompt(title, text, placeholder = "", isPassword = false, maxLength = null) {
        return new Promise((resolve) => {
          const existing = document.getElementById("custom-prompt-modal");
          if (existing) existing.remove();

          const modal = document.createElement("div");
          modal.id = "custom-prompt-modal";
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.2s ease;
          `;

          const inputType = isPassword ? 'password' : 'text';
          const maxLenAttr = maxLength ? `maxlength="${maxLength}"` : '';

          modal.innerHTML = `
            <div style="
              background: #1e293b;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 16px;
              width: 90%;
              max-width: 420px;
              padding: 24px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
              transform: scale(0.9);
              transition: transform 0.2s ease;
            ">
              <h4 style="color: #f8fafc; font-size: 18px; font-weight: 600; margin-bottom: 8px; font-family: system-ui, sans-serif;">${title}</h4>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 16px; font-family: system-ui, sans-serif;">${text}</p>
              
              <input id="custom-prompt-input" type="${inputType}" placeholder="${placeholder}" ${maxLenAttr} style="
                width: 100%;
                background: #0f172a;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                padding: 10px 14px;
                color: #f8fafc;
                font-size: 14px;
                margin-bottom: 20px;
                outline: none;
                font-family: system-ui, sans-serif;
              " />

              <div class="modal-actions">
                <button id="custom-prompt-cancel" class="btn-modal-cancel">Batal</button>
                <button id="custom-prompt-confirm" class="btn-modal-ok">Lanjutkan</button>
              </div>
            </div>
          `;

          document.body.appendChild(modal);

          const inputEl = modal.querySelector("#custom-prompt-input");
          setTimeout(() => {
            modal.style.opacity = '1';
            modal.firstElementChild.style.transform = 'scale(1)';
            inputEl.focus();
          }, 50);

          const handleConfirm = () => {
            const value = inputEl.value;
            modal.style.opacity = '0';
            modal.firstElementChild.style.transform = 'scale(0.9)';
            setTimeout(() => {
              modal.remove();
              resolve(value);
            }, 200);
          };

          const handleCancel = () => {
            modal.style.opacity = '0';
            modal.firstElementChild.style.transform = 'scale(0.9)';
            setTimeout(() => {
              modal.remove();
              resolve(null);
            }, 200);
          };

          modal.querySelector("#custom-prompt-confirm").addEventListener("click", handleConfirm);
          modal.querySelector("#custom-prompt-cancel").addEventListener("click", handleCancel);
          
          inputEl.addEventListener("keydown", (e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') handleCancel();
          });

          modal.addEventListener("click", (e) => {
            if (e.target === modal) handleCancel();
          });
        });
      }

      async function doForgotPassword() {
        const nama = (document.getElementById("login-nama")?.value || "").trim();
        const errEl = document.getElementById("login-err");
        if (errEl) errEl.textContent = "";

        if (!nama) {
          await showCustomAlert(
            "Nama Diperlukan", 
            "Silakan ketikkan Nama Lengkap & Gelar Anda terlebih dahulu pada kotak input sebelum melakukan reset.",
            "error"
          );
          return;
        }

        let users = JSON.parse(localStorage.getItem("perangkat_guru_local_users") || "{}");
        if (!users[nama]) {
          await showCustomAlert(
            "Akun Tidak Ditemukan",
            `Nama "${nama}" belum terdaftar pada perangkat ini.`,
            "error"
          );
          return;
        }

        const enteredKey = await showCustomPrompt(
          "Verifikasi Kepemilikan Akun",
          `Silakan masukkan Kode Lisensi / Aktivasi 8-digit yang digunakan untuk mengaktifkan akun "${nama}":`,
          "Masukkan 8-digit lisensi (Contoh: 12345678)"
        );
        if (enteredKey === null) return; // User cancelled

        const cleanEnteredKey = enteredKey.trim().toUpperCase();
        const savedKey = (users[nama].activatedWith || "").toUpperCase();

        // Allow match if it matches the saved key exactly, OR if the entered key is a valid license key
        const isAuthorized = (savedKey && cleanEnteredKey === savedKey) || isValidLicenseKey(cleanEnteredKey);

        if (!isAuthorized) {
          await showCustomAlert(
            "Verifikasi Gagal",
            "Kode Lisensi tidak cocok atau tidak valid secara sistem. Gagal melakukan reset password.",
            "error"
          );
          return;
        }

        const newPass = await showCustomPrompt(
          "Verifikasi Sukses!",
          "Silakan masukkan password baru Anda (minimal 4 karakter):",
          "Masukkan password baru",
          true
        );
        if (newPass === null) return;

        const cleanNewPass = newPass.trim();
        if (cleanNewPass.length < 4) {
          await showCustomAlert(
            "Password Terlalu Pendek",
            "Gagal: Password baru minimal harus terdiri dari 4 karakter.",
            "error"
          );
          return;
        }

        users[nama].password = cleanNewPass;
        localStorage.setItem("perangkat_guru_local_users", JSON.stringify(users));
        
        await showCustomAlert(
          "Password Diperbarui",
          "Password Anda berhasil diperbarui! Silakan masuk menggunakan password baru Anda sekarang.",
          "success"
        );
      }

      async function doLogout() {
        if (currentUser && currentKelasId) {
          try {
            await saveKelasData(currentUser.uid, currentKelasId);
          } catch (e) {}
        }
        currentKelasId = null;
        daftarKelas = [];
        currentUser = null;
        localStorage.removeItem("current_local_user");
        showLoginScreen();
      }

      // ============================================================
      // PASSWORD MANAGEMENT (LOCAL)
      // ============================================================
      function openChangePasswordModal() {
        if (!currentUser) return;
        document.getElementById("chg-pass-old").value = "";
        document.getElementById("chg-pass-new").value = "";
        document.getElementById("chg-pass-confirm").value = "";
        const errEl = document.getElementById("chg-pass-err");
        if (errEl) errEl.textContent = "";
        document.getElementById("modal-ganti-password").classList.remove("hidden");
      }

      function closeChangePasswordModal() {
        document.getElementById("modal-ganti-password").classList.add("hidden");
      }

      async function submitChangePassword() {
        const oldPass = document.getElementById("chg-pass-old").value;
        const newPass = document.getElementById("chg-pass-new").value;
        const confirmPass = document.getElementById("chg-pass-confirm").value;
        const errEl = document.getElementById("chg-pass-err");
        if (errEl) errEl.textContent = "";

        if (!oldPass || !newPass || !confirmPass) {
          if (errEl) errEl.textContent = "Semua bidang harus diisi.";
          return;
        }

        if (newPass !== confirmPass) {
          if (errEl) errEl.textContent = "Konfirmasi password baru tidak cocok.";
          return;
        }

        if (newPass.length < 4) {
          if (errEl) errEl.textContent = "Password baru minimal 4 karakter.";
          return;
        }

        let users = JSON.parse(localStorage.getItem("perangkat_guru_local_users") || "{}");
        const nama = currentUser.displayName;

        if (!users[nama]) {
          if (errEl) errEl.textContent = "Akun tidak ditemukan di database lokal.";
          return;
        }

        if (users[nama].password !== oldPass) {
          if (errEl) errEl.textContent = "Password lama salah.";
          return;
        }

        users[nama].password = newPass;
        localStorage.setItem("perangkat_guru_local_users", JSON.stringify(users));
        closeChangePasswordModal();
        await alert("Password Anda berhasil diperbarui!");
      }

      // ============================================================
      // SCREENS: SHOW/HIDE & GUEST PORTAL
      // ============================================================
      function activateLoginMode() {
        const container = document.getElementById("auth-hybrid-container");
        if (container) {
          container.classList.add("login-active");
        }
      }

      function deactivateLoginMode() {
        const container = document.getElementById("auth-hybrid-container");
        if (container) {
          container.classList.remove("login-active");
        }
      }

      function setupRandomWelcoming() {
        // Random greetings
        const greetings = [
          "Guru Hebat!",
          "Guru Inspiratif!",
          "Guru Kreatif!",
          "Guru Berdedikasi!",
          "Pendidik Mulia!",
          "Guru Inovatif!",
          "Guru Teladan!",
          "Pilar Bangsa!",
          "Pahlawan Cerdas!",
        ];
        const randomGreeting =
          greetings[Math.floor(Math.random() * greetings.length)];
        const dynamicNameEl = document.getElementById("welcome-dynamic-name");
        if (dynamicNameEl) {
          dynamicNameEl.textContent = randomGreeting;
        }

        // Random quotes
        const quotes = [
          {
            q: "Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan, Anda dapat mengubah dunia.",
            a: "Nelson Mandela",
          },
          {
            q: "Pendidikan adalah tiket ke masa depan. Hari esok dimiliki oleh orang-orang yang mempersiapkan dirinya sejak hari ini.",
            a: "Malcolm X",
          },
          {
            q: "Ing ngarso sung tulodo, ing madyo mangun karso, tut wuri handayani.",
            a: "Ki Hajar Dewantara",
          },
          {
            q: "Fungsi pendidikan adalah mengajarkan seseorang untuk berpikir secara intensif dan kritis. Kecerdasan plus karakter - itu adalah tujuan pendidikan sejati.",
            a: "Martin Luther King, Jr.",
          },
          {
            q: "Satu anak, satu guru, satu buku, dan satu pena dapat mengubah dunia.",
            a: "Malala Yousafzai",
          },
        ];
        const r = quotes[Math.floor(Math.random() * quotes.length)];
        const quoteTextEl = document.getElementById("welcome-quote-text");
        const quoteAuthorEl = document.getElementById("welcome-quote-author");
        if (quoteTextEl && quoteAuthorEl) {
          quoteTextEl.textContent = `"${r.q}"`;
          quoteAuthorEl.textContent = ` -  ${r.a}`;
        }
      }

      function showLoginScreen() {
        document.getElementById("fb-loading").classList.add("hidden");
        document.getElementById("login-screen").classList.remove("hidden");
        
        document.getElementById("dashboard-screen").classList.add("hidden");
        document.querySelector(".sidebar").style.display = "none";
        document.querySelector(".content").style.display = "none";

        // Reset login button and clear sensitive input fields
        const btn = document.getElementById("auth-submit-btn");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Masuk";
        }
        const passInput = document.getElementById("login-password");
        if (passInput) {
          passInput.value = "";
          passInput.type = "password";
        }
        const passToggleBtn = document.getElementById("login-password-toggle");
        if (passToggleBtn) {
          passToggleBtn.title = "Tampilkan kata sandi";
          passToggleBtn.setAttribute("aria-label", "Tampilkan kata sandi");
          passToggleBtn.innerHTML = `<i class="material-symbols-rounded" style="font-size: 17px;" data-lucide="eye"></i>`;
          if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons({
              attrs: { class: "lucide" },
              node: passToggleBtn
            });
          }
        }
        const errEl = document.getElementById("login-err");
        if (errEl) errEl.textContent = "";

        deactivateLoginMode();
        setupRandomWelcoming();
      }

      

      function showDashboard() {
        document.getElementById("fb-loading").classList.add("hidden");
        document.getElementById("login-screen").classList.add("hidden");
        
        document.getElementById("dashboard-screen").classList.remove("hidden");
        document.querySelector(".sidebar").style.display = "none";
        document.querySelector(".content").style.display = "none";

        const nama = currentUser.displayName || currentUser.email;
        if(document.getElementById("dash-guru-nama-text")) document.getElementById("dash-guru-nama-text").textContent = nama;
        if(document.getElementById("dash-guru-nama")) document.getElementById("dash-guru-nama").title = nama;
        if(document.getElementById("dash-welcome")) document.getElementById("dash-welcome").textContent =
          `Halo, ${currentUser.displayName || "Guru"}!`;
        const panggilanList = [
          "Guru Inovatif",
          "Pahlawan Tanpa Tanda Jasa",
          "Guru Hebat",
          "Guru Inspiratif",
          "Pendidik Berdedikasi",
          "Penggerak Pendidikan",
          "Agen Perubahan",
          "Pendidik Visioner"
        ];
        if(document.getElementById("dash-guru-title")) document.getElementById("dash-guru-title").innerHTML = `<i class="material-symbols-rounded" style="font-size: 16px;" data-lucide="star"></i> ${panggilanList[Math.floor(Math.random() * panggilanList.length)]}`;
        renderDaftarKelas();
        checkOnboarding();
      }

      function showKelas(kelasId) {
        
        document.getElementById("dashboard-screen").classList.add("hidden");
        document.querySelector(".sidebar").style.display = "";
        document.querySelector(".content").style.display = "";

        const kelas = daftarKelas.find((k) => k.id === kelasId);
        if (!kelas) return;

        // Sidebar info
        const nama = currentUser.displayName || "";
        if(document.getElementById("sidebar-guru-nama")) document.getElementById("sidebar-guru-nama").textContent =
          nama || currentUser.email;
        if(document.getElementById("sidebar-sekolah")) document.getElementById("sidebar-sekolah").textContent =
          kelas.sekolah || "promesta.id";
        if(document.getElementById("sidebar-kelas-label")) document.getElementById("sidebar-kelas-label").textContent =
          `${kelas.mapel} · ${kelas.kelas}`;

        // Isi form
        const sv = (id, v) => {
          if (v !== undefined && v !== null)
            document.getElementById(id).value = v;
        };
        sv("f-jenjang", kelas.jenjang || "SD");
        updateFaseOptions(false);
        sv("f-fase", kelas.fase);
        updateKelasSuggestions(false, kelas.kelas);
        sv("f-kelas", kelas.kelas);
        sv("f-rombel", kelas.rombel || "");
        loadMapelUI("f-mapel", "f-mapel-manual-container", "f-mapel-manual", kelas.mapel || "Pendidikan Agama Islam dan Budi Pekerti", kelas.fase, kelas.kelas, kelas.jenjang || "SD");
        checkDataUmumMapelLock();
        sv("f-tahun", kelas.tahun || getAutoTahunAjaran());
        sv("f-sekolah", kelas.sekolah);
        sv("f-kepsek", kelas.kepsek);
        const kepsekIdType =
          kelas.kepsekIdType === undefined ? "NIP" : kelas.kepsekIdType;
        const rbKipType = document.querySelector(
          `input[name="f-kepsek-id-type"][value="${kepsekIdType}"]`,
        );
        if (rbKipType) rbKipType.checked = true;
        sv("f-kepsek-id", kelas.kepsekId || "");

        sv("f-tempat", kelas.tempat);
        const autoTgl = getDefaultTanggalPengesahan(kelas.tahun || document.getElementById("f-tahun")?.value || getAutoTahunAjaran());
        sv("f-tgl", kelas.tgl || autoTgl);
        sv("f-guru", kelas.guru || currentUser.displayName || "");
        const guruIdType =
          kelas.guruIdType === undefined ? "NIP" : kelas.guruIdType;
        const rbGuruType = document.querySelector(
          `input[name="f-guru-id-type"][value="${guruIdType}"]`,
        );
        if (rbGuruType) rbGuruType.checked = true;
        sv("f-guru-id", kelas.guruId || "");

        toggleIdInput("kepsek");
        toggleIdInput("guru");
        updateDataUmumPlaceholders();

        if (kelas.firstDay !== undefined) {
          document.getElementById("f-first-day").value = kelas.firstDay;
        } else {
          document.getElementById("f-first-day").value = "0";
        }

        // State
        state.imgTtdKepsek = kelas.imgTtdKepsek || null;
        state.imgCapSekolah = kelas.imgCapSekolah || null;
        state.imgTtdGuru = kelas.imgTtdGuru || null;

state.jadwal =
          kelas.jadwal || [];
        state.tpGanjil =
          kelas.tpGanjil || [];
        state.tpGenap =
          kelas.tpGenap || [];
        state.siswa = kelas.siswa || [];
        state.absensiGanjil = kelas.absensiGanjil || {};
        state.absensiGenap = kelas.absensiGenap || {};
        state.nilaiGanjil = kelas.nilaiGanjil || {};
        state.nilaiGenap = kelas.nilaiGenap || {};

        let defPengaturanGanjil = [
          { id: "slm", name: "Sumatif Lingkup Materi", code: "SLM", bobot: 50, fixed: true, active: true, subKomponents: [] },
          { id: "sas", name: "Sumatif Akhir Semester", code: "SAS", bobot: 50, fixed: true, active: true, subKomponents: [{ id: "sasnt", name: "Nontes", code: "Nontes" }, { id: "sast", name: "Tes", code: "Tes" }] },
        ];
        let defPengaturanGenap = [
          { id: "slm", name: "Sumatif Lingkup Materi", code: "SLM", bobot: 50, fixed: true, active: true, subKomponents: [] },
          { id: "sas", name: "Sumatif Akhir Semester", code: "SAS", bobot: 50, fixed: true, active: true, subKomponents: [{ id: "sasnt", name: "Nontes", code: "Nontes" }, { id: "sast", name: "Tes", code: "Tes" }] },
        ];

        if (kelas.customColsGanjil && Array.isArray(kelas.customColsGanjil)) {
          kelas.customColsGanjil.forEach((colName, idx) => {
            defPengaturanGanjil.push({
              id: String(idx),
              name: colName,
              bobot: 50,
              fixed: false,
              active: true,
            });
          });
        }
        if (kelas.customColsGenap && Array.isArray(kelas.customColsGenap)) {
          kelas.customColsGenap.forEach((colName, idx) => {
            defPengaturanGenap.push({
              id: String(idx),
              name: colName,
              bobot: 50,
              fixed: false,
              active: true,
            });
          });
        }

        // Migrate and load pengaturanPenilaian preserving user-saved bobot
        state.pengaturanPenilaianGanjil = migratePengaturan(
          kelas.pengaturanPenilaianGanjil ||
          kelas.pengaturanPenilaian ||
          defPengaturanGanjil
        );
        state.pengaturanPenilaianGenap = migratePengaturan(
          kelas.pengaturanPenilaianGenap ||
          kelas.pengaturanPenilaian ||
          defPengaturanGenap
        );

        state.atpData =
          kelas.atpData || [];
        state.savedMapel = (kelas.mapel || "").trim();
        state.savedFase = (kelas.fase || "").trim();
        state.kktp =
          kelas.kktp || JSON.parse(JSON.stringify(DEFAULT_STATE.kktp));

        kalender.ganjil =
          kelas.kalenderGanjil || [];
        kalender.genap =
          kelas.kalenderGenap || [];

        // Map any legacy categories to new 3 categories
        kalender.ganjil.forEach(l => { l.kategori = getMappedKategori(l.kategori); });
        kalender.genap.forEach(l => { l.kategori = getMappedKategori(l.kategori); });

        // Load custom category colors
        const defaultColors = {
          libur: "#EF4444",
          kegiatan_nonaktif: "#F97316",
          kegiatan_aktif: "#3B82F6"
        };
        const katColors = kelas.katColors || defaultColors;
        KAT_LIST.forEach(kat => {
          if (katColors[kat.id]) {
            kat.warna = katColors[kat.id];
          }
        });

        state.liburGanjil = kalender.ganjil;
        state.liburGenap = kalender.genap;

        state.isGenerated = kelas.isGenerated || false;
        isGenerated = kelas.isGenerated || false;

        refreshAll();
        if (isGenerated) {
          if (typeof generate === "function") {
            generate();
          }
        } else {
          markDirty();
        }
        showTab("data-umum");

        setTimeout(() => {
          checkClassTour(kelasId);
        }, 600);
      }

      function kembaliKeDashboard() {
        if (currentUser && currentKelasId) {
          saveKelasData(currentUser.uid, currentKelasId)
            .then(() => {
              showSaveIndicator("Tersimpan", "success");
            })
            .catch(() => {});
        }
        currentKelasId = null;
        showDashboard();
      }

      // ============================================================
      // DASHBOARD: RENDER DAFTAR KELAS
      // ============================================================
      function renderDaftarKelas() {
        const grid = document.getElementById("kelas-grid");
        const totalKelasEl = document.getElementById("stat-total-kelas");
        if (totalKelasEl) {
          totalKelasEl.textContent = daftarKelas.length;
        }

        const cards = daftarKelas
          .map(
            (k, idx) => {
              const isIndigo = idx % 2 === 0;
              const iconClass = isIndigo ? "indigo" : "blue";
              const faseClass = `fase-${(k.fase || "c").toLowerCase().trim()}`;
              return `
      <div class="dashboard-kelas-row-card" onclick="bukaKelas('${k.id}')">
        <div class="dashboard-kelas-row-left">
          <div class="dashboard-kelas-row-icon ${iconClass}">
            <i data-lucide="folder" style="width: 20px; height: 20px;"></i>
          </div>
          <div class="dashboard-kelas-row-info">
            <h3 class="dashboard-kelas-row-title">${escH(k.mapel || " - ")}</h3>
            <div class="dashboard-kelas-row-meta">
              <div class="dashboard-kelas-row-meta-item">
                <i data-lucide="square-library" style="width: 13px; height: 13px;"></i>
                <span>${escH(k.rombel || (k.kelas ? `Kelas ${k.kelas}` : " - "))}</span>
              </div>
              <div class="dashboard-kelas-row-meta-item">
                <i data-lucide="graduation-cap" style="width: 13px; height: 13px;"></i>
                <span>${escH(k.sekolah || "SDIT Merdeka")}</span>
              </div>
              <div class="dashboard-kelas-row-meta-item">
                <i data-lucide="calendar" style="width: 13px; height: 13px;"></i>
                <span>TA ${escH(k.tahun || " - ")}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="dashboard-kelas-row-right">
          <!-- Action Buttons -->
          <div class="dashboard-kelas-row-actions">
            <button class="dashboard-kelas-row-action-btn edit" onclick="event.stopPropagation();bukaModalKelas('${k.id}')" title="Edit Identitas Kelas">
              <i data-lucide="pencil" style="width: 15px; height: 15px;"></i>
            </button>
            <button class="dashboard-kelas-row-action-btn delete" onclick="event.stopPropagation();hapusKelas('${k.id}')" title="Hapus Kelas">
              <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
          <span class="dashboard-kelas-row-fase-badge ${faseClass}">FASE ${escH(k.fase || " - ")}</span>
          <i class="dashboard-kelas-row-arrow" data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
        </div>
      </div>`;
            }
          )
          .join("");

        grid.innerHTML = cards || `
          <div class="dashboard-kelas-empty">
            <i data-lucide="folder-open" style="width: 42px; height: 42px; color: rgba(34, 197, 94, 0.5); margin-bottom: 12px;"></i>
            <p>Belum ada kelas mengajar</p>
            <button class="dashboard-kelas-empty-btn" onclick="bukaModalKelas()">
              Tambah Kelas Baru
            </button>
          </div>
        `;

        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }

      async function bukaKelas(kelasId) {
        
        document.getElementById("dashboard-screen").classList.add("hidden");

        currentKelasId = kelasId;
        showKelas(kelasId);
      }

      async function hapusKelas(kelasId) {
        const k = daftarKelas.find((x) => x.id === kelasId);
        if (!k) return;
        const ok = await confirmAsync(`Hapus kelas "${k.mapel} - ${k.kelas}"?\nSemua data perangkat kelas ini akan hilang permanen.`);
        if (!ok) return;
        try {
          daftarKelas = daftarKelas.filter((x) => x.id !== kelasId);
          localStorage.setItem("perangkat_guru_data_" + currentUser.uid, JSON.stringify(daftarKelas));
          renderDaftarKelas();
        } catch (e) {
          await alert("Gagal menghapus kelas.");
        }
      }

      // ============================================================
      // MODAL KELAS: TAMBAH / EDIT
      // ============================================================
      let _editKelasId = null;

      function bukaModalKelas(kelasId = null) {
        _editKelasId = kelasId;
        const modal = document.getElementById("modal-kelas");
        const kelas = kelasId
          ? daftarKelas.find((k) => k.id === kelasId)
          : null;
        if(document.getElementById("modal-kelas-title")) document.getElementById("modal-kelas-title").textContent = kelasId
          ? "Edit Kelas"
          : "Tambah Kelas Baru";
        if(document.getElementById("modal-kelas-ok")) document.getElementById("modal-kelas-ok").textContent = kelasId
          ? "Simpan"
          : "Buat Kelas";
        
        if (document.getElementById("mk-jenjang")) {
          document.getElementById("mk-jenjang").value = kelas?.jenjang || "SD";
          updateModalFaseOptions(false);
        }
        document.getElementById("mk-fase").value = kelas?.fase || "C";
        updateModalKelasSuggestions(kelas?.kelas || null);
        if (kelas && kelas.kelas) {
          document.getElementById("mk-kelas").value = kelas.kelas;
        }
        document.getElementById("mk-rombel").value = kelas?.rombel || "";
        document.getElementById("mk-tahun").value = kelas?.tahun || getAutoTahunAjaran();
        document.getElementById("mk-sekolah").value = kelas?.sekolah || "";
        loadMapelUI("mk-mapel", "mk-mapel-manual-container", "mk-mapel-manual", kelas?.mapel || "Pendidikan Agama Islam dan Budi Pekerti", document.getElementById("mk-fase").value, document.getElementById("mk-kelas").value, document.getElementById("mk-jenjang").value);
        checkModalMapelLock();
        updateModalPlaceholders();
        modal.classList.remove("hidden");
        document.getElementById("mk-mapel").focus();
      }

      function tutupModalKelas() {
        document.getElementById("modal-kelas").classList.add("hidden");
        _editKelasId = null;
      }

      // ============================================================
      // ONBOARDING MODAL & PETUNJUK
      // ============================================================
      function bukaModalOnboarding() {
        const m = document.getElementById("modal-onboarding");
        if (m) {
          m.classList.remove("hidden");
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }

      function checkOnboarding() {
        const onboardingShown = localStorage.getItem("onboarding_shown_" + currentUser.uid);
        if (!onboardingShown) {
          bukaModalOnboarding();
        }
      }

      function tutupModalOnboarding() {
        document.getElementById("modal-onboarding").classList.add("hidden");
        if (currentUser) {
          localStorage.setItem("onboarding_shown_" + currentUser.uid, "true");
        }
      }

      function bukaModalPetunjukLibur() {
        const m = document.getElementById("modal-petunjuk-libur");
        if (m) {
          m.classList.remove("hidden");
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }

      function tutupModalPetunjukLibur() {
        const m = document.getElementById("modal-petunjuk-libur");
        if (m) {
          m.classList.add("hidden");
        }
      }

      function bukaModalPetunjukCP() {
        const m = document.getElementById("modal-petunjuk-cp");
        if (m) {
          m.classList.remove("hidden");
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }

      function tutupModalPetunjukCP() {
        const m = document.getElementById("modal-petunjuk-cp");
        if (m) {
          m.classList.add("hidden");
        }
      }

      function bukaModalPetunjukTP() {
        const m = document.getElementById("modal-petunjuk-tp");
        if (m) {
          m.classList.remove("hidden");
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }

      function tutupModalPetunjukTP() {
        const m = document.getElementById("modal-petunjuk-tp");
        if (m) {
          m.classList.add("hidden");
        }
      }

      function bukaModalPetunjukSiswa() {
        const m = document.getElementById("modal-petunjuk-siswa");
        if (m) {
          m.classList.remove("hidden");
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }

      function tutupModalPetunjukSiswa() {
        const m = document.getElementById("modal-petunjuk-siswa");
        if (m) {
          m.classList.add("hidden");
        }
      }

      function bukaModalPetunjukPenilaian() {
        const m = document.getElementById("modal-petunjuk-penilaian");
        if (m) {
          m.classList.remove("hidden");
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }

      function tutupModalPetunjukPenilaian() {
        const m = document.getElementById("modal-petunjuk-penilaian");
        if (m) {
          m.classList.add("hidden");
        }
      }



      async function simpanModalKelas() {
        const jenjang = document.getElementById("mk-jenjang")?.value || "SD";
        const mapel = getMapelValue("mk-mapel", "mk-mapel-manual");
        const kelas = document.getElementById("mk-kelas").value.trim();
        const fase = document.getElementById("mk-fase").value.trim();
        const sekolahEl = document.getElementById("mk-sekolah");
        const rombelEl = document.getElementById("mk-rombel");
        const rombel = (rombelEl?.value || "").trim() || (rombelEl?.placeholder || "");
        const tahun = document.getElementById("mk-tahun").value.trim();
        const sekolah = (sekolahEl?.value || "").trim() || (sekolahEl?.placeholder || "");

        if (!mapel || !kelas) {
          await alert("Mata pelajaran dan kelas wajib diisi.");
          return;
        }

        const btn = document.getElementById("modal-kelas-ok");
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Menyimpan...";
        }

        try {
          const data = {
            jenjang,
            mapel,
            kelas,
            fase,
            rombel,
            tahun,
            sekolah,
            guru: currentUser.displayName || "",
            updated_at: new Date().toISOString(),
          };

          if (_editKelasId) {
            const idx = daftarKelas.findIndex((k) => k.id === _editKelasId);
            if (idx >= 0) Object.assign(daftarKelas[idx], data);
          } else {
            const newId = "kelas_" + Date.now();
            daftarKelas.push({
              id: newId,
              ...data,
              tgl: getDefaultTanggalPengesahan(tahun),
              jadwal: [],
              atpData: [],
              tpGanjil: [],
              tpGenap: [],
              siswa: [],
              kktp: JSON.parse(JSON.stringify(DEFAULT_STATE.kktp)),
              absensiGanjil: {},
              absensiGenap: {},
              nilaiGanjil: {},
              nilaiGenap: {},
              kalenderGanjil: [],
              kalenderGenap: []
            });
          }
          localStorage.setItem("perangkat_guru_data_" + currentUser.uid, JSON.stringify(daftarKelas));
          tutupModalKelas();
          renderDaftarKelas();
        } catch (e) {
          await alert("Gagal menyimpan kelas: " + e.message);
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Simpan";
          }
        }
      }


      // Tutup modal saat klik overlay
      document
        .getElementById("modal-kelas")
        .addEventListener("click", function (e) {
          if (e.target === this) tutupModalKelas();
        });

      document
        .getElementById("modal-onboarding")
        .addEventListener("click", function (e) {
          if (e.target === this) tutupModalOnboarding();
        });

      const mPetunjukLibur = document.getElementById("modal-petunjuk-libur");
      if (mPetunjukLibur) {
        mPetunjukLibur.addEventListener("click", function (e) {
          if (e.target === this) tutupModalPetunjukLibur();
        });
      }

      const mPetunjukCP = document.getElementById("modal-petunjuk-cp");
      if (mPetunjukCP) {
        mPetunjukCP.addEventListener("click", function (e) {
          if (e.target === this) tutupModalPetunjukCP();
        });
      }

      const mPetunjukTP = document.getElementById("modal-petunjuk-tp");
      if (mPetunjukTP) {
        mPetunjukTP.addEventListener("click", function (e) {
          if (e.target === this) tutupModalPetunjukTP();
        });
      }

      const mPetunjukSiswa = document.getElementById("modal-petunjuk-siswa");
      if (mPetunjukSiswa) {
        mPetunjukSiswa.addEventListener("click", function (e) {
          if (e.target === this) tutupModalPetunjukSiswa();
        });
      }

      const mPetunjukPenilaian = document.getElementById("modal-petunjuk-penilaian");
      if (mPetunjukPenilaian) {
        mPetunjukPenilaian.addEventListener("click", function (e) {
          if (e.target === this) tutupModalPetunjukPenilaian();
        });
      }

      // ============================================================
      // LOCAL STORAGE: LOAD DAFTAR KELAS
      // ============================================================
      async function loadDaftarKelas(uid) {
        try {
          const localData = localStorage.getItem("perangkat_guru_data_" + uid);
          daftarKelas = localData ? JSON.parse(localData) : [];

          // Auto-recovery: if current UID has no class data, check if there is data under other UIDs on this device
          if ((!daftarKelas || daftarKelas.length === 0) && uid) {
            const allKeys = Object.keys(localStorage);
            const dataKeys = allKeys.filter(k => k.startsWith("perangkat_guru_data_") && k !== ("perangkat_guru_data_" + uid));
            
            let recovered = [];
            for (const k of dataKeys) {
              try {
                const item = JSON.parse(localStorage.getItem(k) || "[]");
                if (Array.isArray(item) && item.length > 0) {
                  recovered.push(...item);
                }
              } catch (err) {}
            }

            if (recovered.length > 0) {
              const map = new Map();
              recovered.forEach(c => {
                const key = c.id || (c.sekolah + "_" + c.mapel + "_" + c.kelas + "_" + c.rombel);
                if (!map.has(key)) map.set(key, c);
              });
              daftarKelas = Array.from(map.values());
              localStorage.setItem("perangkat_guru_data_" + uid, JSON.stringify(daftarKelas));
              console.log("Auto-recovered class data:", daftarKelas.length, "classes.");
            }
          }
        } catch (e) {
          console.warn("loadDaftarKelas error:", e);
          daftarKelas = [];
        }
      }

      // ============================================================
      // ============================================================
      // BACKUP, IMPORT, RESET KELAS (ALL)
      // ============================================================
      async function backupAllData() {
        if (!daftarKelas || daftarKelas.length === 0) {
          await alert("Tidak ada data kelas untuk dibackup.");
          return;
        }
        let namaGuru = (currentUser && currentUser.displayName) ? currentUser.displayName : (document.getElementById("f-guru")?.value || "");
        if (!namaGuru && daftarKelas && daftarKelas.length > 0) {
          namaGuru = daftarKelas[0].guru || "";
        }
        namaGuru = namaGuru.trim().replace(/[/\\?%*:|"<>]/g, "");
        if (!namaGuru) namaGuru = "guru";

        const dataStr = JSON.stringify(daftarKelas, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `perangkat_${namaGuru}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      async function importAllData(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            let importedData = JSON.parse(ev.target.result);
            if (!Array.isArray(importedData)) {
              if (importedData && typeof importedData === "object" && (importedData.mapel || importedData.kelas || importedData.sekolah || importedData.id)) {
                importedData = [importedData];
              } else {
                throw new Error("Format tidak valid (harus array JSON data kelas atau objek data mata pelajaran).");
              }
            }
            const ok = await confirmAsync(`Ditemukan ${importedData.length} data kelas. Apakah Anda yakin ingin mengimpor ini? Data dengan ID yang sama akan ditimpa.`);
            if (!ok) {
              e.target.value = "";
              return;
            }
            const fbLoading = document.getElementById("fb-loading");
            if (fbLoading) fbLoading.classList.remove("hidden");
            
            for (const k of importedData) {
              const dataToSave = { ...k };
              const id = dataToSave.id;
              dataToSave.updated_at = new Date().toISOString();
              if (id) {
                const idx = daftarKelas.findIndex(x => x.id === id);
                if (idx >= 0) {
                  Object.assign(daftarKelas[idx], dataToSave);
                } else {
                  daftarKelas.push(dataToSave);
                }
              } else {
                dataToSave.id = "kelas_" + Math.random().toString(36).substr(2, 9);
                daftarKelas.push(dataToSave);
              }
            }
            const uid = (currentUser && currentUser.uid) ? currentUser.uid : "local_user";
            localStorage.setItem("perangkat_guru_data_" + uid, JSON.stringify(daftarKelas));
            await loadDaftarKelas(uid);
            renderDaftarKelas();
            if (typeof showCustomAlert === "function") {
              await showCustomAlert("Impor Berhasil", `Berhasil mengimpor ${importedData.length} data kelas ke dashboard.`, "success");
            } else {
              alert(`Data berhasil diimpor (${importedData.length} kelas).`);
            }
          } catch (err) {
            console.error("importAllData error:", err);
            if (typeof showCustomAlert === "function") {
              await showCustomAlert("Gagal Mengimpor Data", err.message || "Format file tidak dikenali.", "error");
            } else {
              alert("Gagal mengimpor data: " + err.message);
            }
          } finally {
            const fbLoading = document.getElementById("fb-loading");
            if (fbLoading) fbLoading.classList.add("hidden");
            e.target.value = "";
          }
        };
        reader.readAsText(file);
      }

      async function resetAllDataLocal() {
        const ok1 = await confirmAsync("PERINGATAN: Semua data kelas Anda akan dihapus secara permanen. Apakah Anda yakin?");
        if (!ok1) return;
        const ok2 = await confirmAsync("Apakah Anda BENAR-BENAR yakin? Tindakan ini tidak dapat dibatalkan!");
        if (!ok2) return;
        try {
          localStorage.removeItem("perangkat_guru_data_" + currentUser.uid);
          daftarKelas = [];
          renderDaftarKelas();
          await alert("Semua data berhasil direset dari perangkat ini.");
        } catch (e) {
          await alert("Gagal mereset data: " + e.message);
        }
      }

      // ============================================================
      // LOCAL STORAGE: SAVE KELAS DATA (semua per-kelas)
      // ============================================================
      async function saveKelasData(uid, kelasId) {
        if (!uid || !kelasId) return;
        const guru =
          document.getElementById("f-guru")?.value ||
          currentUser?.displayName ||
          "";
        const getVal = (id) => document.getElementById(id)?.value || "";
        const data = {
          jenjang: getVal("f-jenjang"),
          mapel: getMapelValue("f-mapel", "f-mapel-manual"),
          fase: getVal("f-fase"),
          kelas: getVal("f-kelas"),
          rombel: getVal("f-rombel"),
          tahun: getVal("f-tahun"),
          sekolah: getVal("f-sekolah"),
          kepsek: getVal("f-kepsek"),
          kepsekIdType:
            document.querySelector('input[name="f-kepsek-id-type"]:checked')
              ?.value || "",
          kepsekId: getVal("f-kepsek-id"),
          tempat: getVal("f-tempat"),
          tgl: getVal("f-tgl"),
          firstDay: getVal("f-first-day"),
          guru,
          guruIdType:
            document.querySelector('input[name="f-guru-id-type"]:checked')
              ?.value || "",
          guruId: getVal("f-guru-id"),
          jadwal: state.jadwal || [],
          tpGanjil: state.tpGanjil || [],
          tpGenap: state.tpGenap || [],
          siswa: state.siswa || [],
          absensiGanjil: JSON.parse(JSON.stringify(state.absensiGanjil || {})),
          absensiGenap: JSON.parse(JSON.stringify(state.absensiGenap || {})),
          nilaiGanjil: JSON.parse(JSON.stringify(state.nilaiGanjil || {})),
          nilaiGenap: JSON.parse(JSON.stringify(state.nilaiGenap || {})),
          pengaturanPenilaianGanjil: JSON.parse(JSON.stringify(state.pengaturanPenilaianGanjil || [])),
          pengaturanPenilaianGenap: JSON.parse(JSON.stringify(state.pengaturanPenilaianGenap || [])),
          atpData: state.atpData || [],
          modulAjar: JSON.parse(JSON.stringify(state.modulAjar || {})),
          kalenderGanjil: kalender?.ganjil || [],
          kalenderGenap: kalender?.genap || [],
          katColors: {
            libur: (typeof KAT_LIST !== "undefined" && KAT_LIST.find) ? (KAT_LIST.find(k => k.id === "libur")?.warna || "#EF4444") : "#EF4444",
            kegiatan_nonaktif: (typeof KAT_LIST !== "undefined" && KAT_LIST.find) ? (KAT_LIST.find(k => k.id === "kegiatan_nonaktif")?.warna || "#F97316") : "#F97316",
            kegiatan_aktif: (typeof KAT_LIST !== "undefined" && KAT_LIST.find) ? (KAT_LIST.find(k => k.id === "kegiatan_aktif")?.warna || "#3B82F6") : "#3B82F6",
          },
          imgTtdKepsek: state.imgTtdKepsek || null,
          imgCapSekolah: state.imgCapSekolah || null,
          imgTtdGuru: state.imgTtdGuru || null,
          isGenerated: typeof isGenerated !== "undefined" ? isGenerated : false,
          updated_at: new Date().toISOString(),
        };
        // Update local cache
        const idx = daftarKelas.findIndex((k) => k.id === kelasId);
        if (idx >= 0) {
          Object.assign(daftarKelas[idx], data);
          localStorage.setItem("perangkat_guru_data_" + uid, JSON.stringify(daftarKelas));
        }
      }

      async function simpanDataUmumManually() {
        try {
          const newMapel = getMapelValue("f-mapel", "f-mapel-manual").trim();
          const newFase = (document.getElementById("f-fase")?.value || "").trim();
          const newKelas = (document.getElementById("f-kelas")?.value || "").trim();
          const newRombel = (document.getElementById("f-rombel")?.value || "").trim();

          const baseMapel = (state.savedMapel !== undefined ? state.savedMapel : (currentKelasId ? (daftarKelas.find((k) => k.id === currentKelasId)?.mapel || "") : "")).trim();
          const baseFase = (state.savedFase !== undefined ? state.savedFase : (currentKelasId ? (daftarKelas.find((k) => k.id === currentKelasId)?.fase || "") : "")).trim();

          const mapelChanged = (baseMapel.toLowerCase() !== newMapel.toLowerCase());
          const faseChanged = (baseFase.toLowerCase() !== newFase.toLowerCase());
          const mapelOrFaseChanged = mapelChanged || faseChanged;

          // Reset & Auto-populate CP if Mata Pelajaran or Fase was changed
          if (mapelOrFaseChanged) {
            if (newMapel && newFase) {
              const autoData = getAutoCPData(newMapel, newFase);
              if (autoData && autoData.length > 0) {
                state.atpData = JSON.parse(JSON.stringify(autoData));
              } else {
                state.atpData = [];
              }
            } else {
              state.atpData = [];
            }
          }

          // Auto-populate TP from CP if mapel/fase changed, or if TP list is currently empty and CP is available
          const hasExistingTP = (state.tpGanjil && state.tpGanjil.length > 0) || (state.tpGenap && state.tpGenap.length > 0);
          if (mapelOrFaseChanged || !hasExistingTP) {
            if (state.atpData && state.atpData.length > 0) {
              autoPopulateTPFromCP(mapelOrFaseChanged);
            }
          }

          // Update saved mapel & fase state
          state.savedMapel = newMapel;
          state.savedFase = newFase;

          if (currentKelasId) {
            const idx = daftarKelas.findIndex((k) => k.id === currentKelasId);
            if (idx >= 0) {
              daftarKelas[idx].mapel = newMapel;
              daftarKelas[idx].fase = newFase;
              daftarKelas[idx].kelas = newKelas;
              daftarKelas[idx].rombel = newRombel;
              daftarKelas[idx].atpData = state.atpData;
              daftarKelas[idx].tpGanjil = state.tpGanjil;
              daftarKelas[idx].tpGenap = state.tpGenap;
            }
          }

          if (currentUser && currentKelasId) {
            await saveKelasData(currentUser.uid, currentKelasId);
          } else {
            if (typeof scheduleSave === "function") scheduleSave();
          }

          if (typeof refreshAll === "function") {
            refreshAll();
          } else if (typeof renderAtpInput === "function") {
            renderAtpInput();
          }

          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Data Berhasil Disimpan", "success");
          }
        } catch (err) {
          console.error("Gagal menyimpan Data Umum:", err);
          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Gagal Menyimpan Data", "error", err.message || "Terjadi kesalahan.");
          }
        }
      }

      // ============================================================
      // KALENDER: SAVE + EXPORT/IMPORT JSON (per kelas)
      // ============================================================
      async function saveKalender() {
        if (!currentUser || !currentKelasId) return;
        try {
          const data = {
            kalenderGanjil: kalender.ganjil,
            kalenderGenap: kalender.genap,
            katColors: {
              libur: KAT_LIST.find(k => k.id === "libur").warna,
              kegiatan_nonaktif: KAT_LIST.find(k => k.id === "kegiatan_nonaktif").warna,
              kegiatan_aktif: KAT_LIST.find(k => k.id === "kegiatan_aktif").warna,
            },
            updated_at: new Date().toISOString(),
          };
          const idx = daftarKelas.findIndex((k) => k.id === currentKelasId);
          if (idx >= 0) {
            Object.assign(daftarKelas[idx], data);
            localStorage.setItem("perangkat_guru_data_" + currentUser.uid, JSON.stringify(daftarKelas));
          }
        } catch (err) {
          console.warn("saveKalender error:", err);
        }
      }

      async function saveKalenderAndRefresh() {
        kalender.ganjil.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
        kalender.genap.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

        await saveKalender();
        state.liburGanjil = kalender.ganjil;
        state.liburGenap = kalender.genap;

        // Re-render table input after sorting so the row matches new index
        renderKalender("ganjil");
        renderKalender("genap");

        showSaveIndicator("Kalender Disimpan", "success");
        renderKalenderPendidikan();
      }

      function exportKalender() {
        const du = getDU();
        const data = {
          _info: "Kalender Promesta  -  promesta.id",
          tahun_ajaran: du.tahun,
          sekolah: du.sekolah,
          exported_at: new Date().toISOString(),
          ganjil: kalender.ganjil,
          genap: kalender.genap,
          katColors: {
            libur: KAT_LIST.find(k => k.id === "libur").warna,
            kegiatan_nonaktif: KAT_LIST.find(k => k.id === "kegiatan_nonaktif").warna,
            kegiatan_aktif: KAT_LIST.find(k => k.id === "kegiatan_aktif").warna,
          },
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `kalender_${(du.tahun || "ta").replace("/", "-")}.json`;
        a.click();
      }

      function importKalender() {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = ".json";
        inp.onchange = async (e) => {
          const f = e.target.files[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = async (ev) => {
            try {
              const d = JSON.parse(ev.target.result);
              if (!Array.isArray(d.ganjil) || !Array.isArray(d.genap))
                throw new Error("Format tidak valid");
              
              // Map legacy categories on import
              d.ganjil.forEach(l => { l.kategori = getMappedKategori(l.kategori); });
              d.genap.forEach(l => { l.kategori = getMappedKategori(l.kategori); });

              kalender.ganjil = d.ganjil;
              kalender.genap = d.genap;
              state.liburGanjil = d.ganjil;
              state.liburGenap = d.genap;

              // Import custom colors if present
              if (d.katColors) {
                KAT_LIST.forEach(kat => {
                  if (d.katColors[kat.id]) {
                    kat.warna = d.katColors[kat.id];
                  }
                });
              }

              await saveKalender();
              renderKalender("ganjil");
              renderKalender("genap");
              renderKatColorSettings();
              renderKalenderPendidikan();
              showSaveIndicator("Kalender Diimpor", "success");
              alert(
                `Kalender berhasil diimpor!\n${d.ganjil.length} entri ganjil, ${d.genap.length} entri genap.`,
              );
            } catch (err) {
              alert(
                "File tidak valid. Pastikan file kalender dari promesta.id.",
              );
            }
          };
          r.readAsText(f);
        };
        inp.click();
      }

      // -- KONFIGURASI WARNA PER KETERANGAN PENANDAAN -------------------
      function renderKatColorSettings() {
        return;
        const container = document.getElementById("kat-color-settings-container");
        if (!container) return;

        // Get all unique keterangan from both semesters
        const kets = new Set();
        [...kalender.ganjil, ...kalender.genap].forEach(l => {
          if (l.keterangan && l.keterangan.trim()) {
            kets.add(l.keterangan.trim());
          }
        });

        const sortedKets = [...kets].sort();

        if (sortedKets.length === 0) {
          container.innerHTML = `
            <div class="card" style="padding: 16px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 18px;">
              <div style="font-size: var(--fs-sm); font-weight: 600; color: var(--text-light); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <i class="material-symbols-rounded" style="font-size: 16px; color: var(--accent);" data-lucide="palette"></i>
                <span>Konfigurasi Warna per Keterangan</span>
              </div>
              <p style="font-size: var(--fs-xs); color: var(--text-light); opacity: 0.7; margin: 0;">Belum ada keterangan agenda/libur yang dibuat. Tambahkan agenda/libur terlebih dahulu untuk mengatur warnanya secara spesifik.</p>
            </div>
          `;
          if (window.lucide) window.lucide.createIcons();
          return;
        }

        const presets = [
          "#EF4444", "#F97316", "#F59E0B", "#10B981", 
          "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", 
          "#EC4899", "#84CC16", "#14B8A6", "#64748B"
        ];

        let html = `
          <div class="card" style="padding: 16px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 18px;">
            <div style="font-size: var(--fs-sm); font-weight: 600; color: var(--text-light); margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
              <i class="material-symbols-rounded" style="font-size: 16px; color: var(--accent);" data-lucide="palette"></i>
              <span>Konfigurasi Warna per Keterangan</span>
            </div>
            <p style="font-size: 11px; color: var(--text-light); opacity: 0.7; margin-bottom: 14px;">Setiap keterangan libur atau agenda dapat disesuaikan warnanya sendiri-sendiri secara otomatis.</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        `;

        sortedKets.forEach((ket) => {
          // Find the color used for this keterangan. Use the first entry found, or fallback to the category color
          const matchingEntry = [...kalender.ganjil, ...kalender.genap].find(l => l.keterangan && l.keterangan.trim() === ket);
          const currentWarna = matchingEntry ? (matchingEntry.warna || katById(matchingEntry.kategori).warna) : "#EF4444";

          const presetHtml = presets.map(color => `
            <button 
              onclick="changeKatColor(this.dataset.ket, '${color}')" 
              data-ket="${escH(ket)}"
              style="width: 20px; height: 20px; border-radius: 50%; background: ${color}; border: ${currentWarna.toLowerCase() === color.toLowerCase() ? '2px solid var(--text)' : '1px solid rgba(255,255,255,0.2)'}; cursor: pointer; transition: transform 0.1s; padding: 0;"
              onmouseover="this.style.transform='scale(1.15)'"
              onmouseout="this.style.transform='scale(1)'"
              title="${color}"
            ></button>
          `).join("");

          html += `
            <div style="background: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span class="kat-badge" style="background: ${currentWarna}; color: #fff; font-weight: 600; font-size: 11px; padding: 4px 8px; border-radius: 4px; display: inline-block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 240px;" title="${escH(ket)}">
                  ${escH(ket)}
                </span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 11px; color: var(--text-light);">Preset warna:</div>
                <div style="display: flex; gap: 5px; flex-wrap: wrap; align-items: center;">
                  ${presetHtml}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.06);">
                <span style="font-size: 11px; color: var(--text-light);">Custom warna:</span>
                <input 
                  type="color" 
                  value="${currentWarna}" 
                  onchange="changeKatColor(this.dataset.ket, this.value)" 
                  data-ket="${escH(ket)}"
                  style="width: 28px; height: 24px; border: none; background: none; cursor: pointer; padding: 0;"
                >
                <input 
                  type="text" 
                  value="${currentWarna}" 
                  onchange="changeKatColor(this.dataset.ket, this.value)" 
                  data-ket="${escH(ket)}"
                  placeholder="#Hex" 
                  style="width: 70px; padding: 2px 6px; font-size: 11px; background: rgba(0,0,0,0.2); color: var(--text); border: 1px solid var(--border); border-radius: 4px; text-align: center; font-family: monospace;"
                >
              </div>
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
        container.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
      }

      function changeKatColor(ket, value) {
        if (value.startsWith('#') && value.length >= 4) {
          const targetKet = ket.trim().toLowerCase();
          const updateInArray = (arr) => {
            arr.forEach(entry => {
              if (entry.keterangan && entry.keterangan.trim().toLowerCase() === targetKet) {
                entry.warna = value;
              }
            });
          };
          updateInArray(kalender.ganjil);
          updateInArray(kalender.genap);

          renderKatColorSettings();
          renderKalender("ganjil");
          renderKalender("genap");
          renderLibur("ganjil");
          renderLibur("genap");
          renderKalenderPendidikan();
          scheduleSave();
          markDirty();
        }
      }

      // -- Kalender CRUD (Guru edit sendiri) ------------------------
      function renderModalColorCtrls(containerId, categoryId, currentWarna) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const presets = [
          "#EF4444", "#F97316", "#F59E0B", "#10B981", 
          "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", 
          "#EC4899", "#84CC16", "#14B8A6", "#64748B"
        ];

        const initialColor = currentWarna || katById(categoryId).warna;

        const presetHtml = presets.map(color => `
          <button 
            type="button"
            onclick="updateModalSelectedColor('${containerId}', '${color}')" 
            style="width: 18px; height: 18px; border-radius: 50%; background: ${color}; border: ${initialColor.toLowerCase() === color.toLowerCase() ? '2px solid var(--text)' : '1px solid rgba(255,255,255,0.2)'}; cursor: pointer; transition: transform 0.1s; padding: 0;"
            onmouseover="this.style.transform='scale(1.15)'"
            onmouseout="this.style.transform='scale(1)'"
            title="${color}"
          ></button>
        `).join("");

        container.innerHTML = `
          <input type="hidden" id="${containerId}-value" value="${initialColor}">
          <div style="background: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 600; color: var(--text-light);">Pilih Warna Libur / Agenda</span>
              <span id="${containerId}-preview" style="width: 12px; height: 12px; border-radius: 50%; background: ${initialColor}; display: inline-block;"></span>
            </div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
              ${presetHtml}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.06);">
              <span style="font-size: 11px; color: var(--text-light);">Custom:</span>
              <input 
                type="color" 
                value="${initialColor}" 
                oninput="updateModalSelectedColor('${containerId}', this.value)" 
                style="width: 24px; height: 20px; border: none; background: none; cursor: pointer; padding: 0;"
              >
              <input 
                type="text" 
                id="${containerId}-text"
                value="${initialColor}" 
                onchange="updateModalSelectedColor('${containerId}', this.value)" 
                placeholder="#Hex" 
                style="width: 65px; padding: 1px 4px; font-size: 10px; background: rgba(0,0,0,0.2); color: var(--text); border: 1px solid var(--border); border-radius: 4px; text-align: center; font-family: monospace;"
              >
            </div>
          </div>
        `;
      }

      function updateModalSelectedColor(containerId, value) {
        if (value.startsWith('#') && value.length >= 4) {
          const input = document.getElementById(containerId + "-value");
          if (input) {
            input.value = value;
            const preview = document.getElementById(containerId + "-preview");
            if (preview) preview.style.background = value;
            const textInput = document.getElementById(containerId + "-text");
            if (textInput) textInput.value = value;

            // Update preset selection border
            const presets = [
              "#EF4444", "#F97316", "#F59E0B", "#10B981", 
              "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", 
              "#EC4899", "#84CC16", "#14B8A6", "#64748B"
            ];
            const container = document.getElementById(containerId);
            if (container) {
              const buttons = container.querySelectorAll('button');
              buttons.forEach((btn, idx) => {
                if (idx < presets.length) {
                  const color = presets[idx];
                  btn.style.border = value.toLowerCase() === color.toLowerCase() ? '2px solid var(--text)' : '1px solid rgba(255,255,255,0.2)';
                }
              });
            }
          }
        }
      }

      function getNamaHariIndo(dateStr, short = false) {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length !== 3) return "";
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const daysFull = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const daysShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const days = short ? daysShort : daysFull;
        return days[d.getDay()] || "";
      }

      function formatTanggalIndo(dateStr, includeDay = false, shortMonth = true) {
        if (!dateStr) return "-";
        const parts = dateStr.split("-");
        if (parts.length !== 3) return dateStr;
        const thn = parts[0];
        const blnIdx = parseInt(parts[1], 10) - 1;
        const tgl = parseInt(parts[2], 10);
        const bulanIndoFull = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const bulanIndoShort = [
          "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
          "Jul", "Agt", "Sep", "Okt", "Nov", "Des"
        ];
        const bulanList = shortMonth ? bulanIndoShort : bulanIndoFull;
        if (blnIdx >= 0 && blnIdx < 12) {
          const formatted = `${tgl} ${bulanList[blnIdx]} ${thn}`;
          if (includeDay) {
            const dayName = getNamaHariIndo(dateStr, shortMonth);
            return dayName ? `${dayName}, ${formatted}` : formatted;
          }
          return formatted;
        }
        return dateStr;
      }

      function formatTanggalRangeIndo(dateStr1, dateStr2, shortMonth = true) {
        if (!dateStr1) return "-";
        if (!dateStr2 || dateStr1 === dateStr2) return formatTanggalIndo(dateStr1, false, shortMonth);
        const bulanIndoFull = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const bulanIndoShort = [
          "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
          "Jul", "Agt", "Sep", "Okt", "Nov", "Des"
        ];
        const bulanList = shortMonth ? bulanIndoShort : bulanIndoFull;
        const p1 = dateStr1.split("-");
        const p2 = dateStr2.split("-");
        if (p1.length !== 3 || p2.length !== 3) return `${dateStr1} - ${dateStr2}`;
        const y1 = p1[0], m1 = parseInt(p1[1], 10) - 1, d1 = parseInt(p1[2], 10);
        const y2 = p2[0], m2 = parseInt(p2[1], 10) - 1, d2 = parseInt(p2[2], 10);
        
        if (y1 === y2 && m1 === m2) {
          return `${d1} - ${d2} ${bulanList[m1]} ${y1}`;
        } else if (y1 === y2) {
          return `${d1} ${bulanList[m1]} - ${d2} ${bulanList[m2]} ${y1}`;
        } else {
          return `${d1} ${bulanList[m1]} ${y1} - ${d2} ${bulanList[m2]} ${y2}`;
        }
      }

      function groupKalenderEntries(arr) {
        if (!arr || !arr.length) return [];
        // Sort entries ascending by date
        const sorted = [...arr].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
        const groups = [];

        sorted.forEach((item) => {
          const ket = (item.keterangan || "").trim();
          const kat = item.kategori || "libur";
          const warna = item.warna || katById(kat).warna;
          const penting = !!item.penting;

          const lastGroup = groups[groups.length - 1];

          if (lastGroup) {
            const lastItemDate = lastGroup.dates[lastGroup.dates.length - 1];
            const p1 = lastItemDate.split("-").map(Number);
            const p2 = item.tanggal.split("-").map(Number);
            const dt1 = new Date(p1[0], p1[1] - 1, p1[2]);
            const dt2 = new Date(p2[0], p2[1] - 1, p2[2]);
            const diffDays = Math.round((dt2 - dt1) / 86400000);

            const isSameMeta =
              lastGroup.keterangan.toLowerCase() === ket.toLowerCase() &&
              lastGroup.kategori === kat &&
              lastGroup.penting === penting &&
              lastGroup.warna === warna;

            // Group if metadata matches and the date is consecutive (diffDays <= 1)
            if (isSameMeta && diffDays <= 1) {
              if (!lastGroup.dates.includes(item.tanggal)) {
                lastGroup.dates.push(item.tanggal);
              }
              lastGroup.endDate = item.tanggal;
              lastGroup.items.push(item);
              return;
            }
          }

          groups.push({
            startDate: item.tanggal,
            endDate: item.tanggal,
            dates: [item.tanggal],
            items: [item],
            kategori: kat,
            keterangan: ket,
            penting: penting,
            warna: warna,
          });
        });

        return groups;
      }

      function renderKalender(sem) {
        const arr = sem === "ganjil" ? kalender.ganjil : kalender.genap;
        const groups = groupKalenderEntries(arr);

        if (document.getElementById("cnt-kalender-" + sem)) {
          document.getElementById("cnt-kalender-" + sem).textContent =
            `${groups.length} agenda (${arr.length} hari)`;
        }

        if (document.getElementById("body-kalender-" + sem)) {
          if (groups.length === 0) {
            document.getElementById("body-kalender-" + sem).innerHTML = `
              <tr>
                <td colspan="6" style="text-align: center; color: var(--text-light); padding: 24px;">
                  Belum ada data libur atau kegiatan pada semester ini.
                </td>
              </tr>
            `;
            return;
          }

          document.getElementById("body-kalender-" + sem).innerHTML = groups
            .map((g, i) => {
              const kat = katById(g.kategori || "libur");
              const pentingCheckbox = `<input type="checkbox" ${g.penting ? "checked" : ""} style="width:16px; height:16px; accent-color:var(--accent); pointer-events:none; cursor:default; margin-top:2px; vertical-align:top;" onclick="return false;">`;
              
              let katBadgeHtml = "";
              const katBg = g.warna || kat.warna;
              if (kat.id === "kegiatan_aktif" || kat.label.includes("KBM aktif")) {
                katBadgeHtml = `
                  <span class="kat-badge" style="background:${katBg}; color:#fff; font-size:10px; font-weight:600; padding:3px 7px; border-radius:4px; display:inline-flex; flex-direction:column; align-items:flex-start; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.1); line-height:1.2; text-align:left;">
                    <span>Kegiatan Sekolah</span>
                    <span style="font-size:9px; opacity:0.95; font-weight:500;">(KBM aktif)</span>
                  </span>
                `;
              } else if (kat.id === "kegiatan_nonaktif" || kat.label.includes("KBM nonaktif")) {
                katBadgeHtml = `
                  <span class="kat-badge" style="background:${katBg}; color:#fff; font-size:10px; font-weight:600; padding:3px 7px; border-radius:4px; display:inline-flex; flex-direction:column; align-items:flex-start; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.1); line-height:1.2; text-align:left;">
                    <span>Kegiatan Sekolah</span>
                    <span style="font-size:9px; opacity:0.95; font-weight:500;">(KBM nonaktif)</span>
                  </span>
                `;
              } else {
                katBadgeHtml = `
                  <span class="kat-badge" style="background:${katBg}; color:#fff; font-size:10.5px; font-weight:600; padding:3px 8px; border-radius:4px; display:inline-block; box-shadow:0 1px 3px rgba(0,0,0,0.1); line-height:1.2;">
                    ${kat.label}
                  </span>
                `;
              }

              let tglContent = "";
              if (g.dates.length > 1) {
                tglContent = `
                  <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
                    <span style="font-family: var(--f); font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.4;">${formatTanggalRangeIndo(g.startDate, g.endDate)}</span>
                    <span style="font-size: 11px; padding: 1px 6px; border-radius: 10px; background: rgba(250, 204, 21, 0.12); color: var(--accent-light, #FACC15); border: 1px solid rgba(250, 204, 21, 0.25); font-weight: 600; flex-shrink: 0;">${g.dates.length} hari</span>
                  </div>
                `;
              } else {
                tglContent = `
                  <span style="font-family: var(--f); font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.4; white-space: nowrap;">${formatTanggalIndo(g.startDate)}</span>
                `;
              }

              return `<tr>
                <td class="td-ctr" style="font-weight: 500; line-height: 1.4;">${i + 1}</td>
                <td>${tglContent}</td>
                <td>${katBadgeHtml}</td>
                <td style="font-weight: 500; font-size: 13px; line-height: 1.4;">${escH(g.keterangan || "-")}</td>
                <td class="td-ctr">${pentingCheckbox}</td>
                <td class="td-ctr" style="white-space:nowrap;">
                  <div style="display:inline-flex; align-items:center; justify-content:center; gap:2px; vertical-align:top;">
                    <button class="btn-action-edit" onclick="openEditKalenderGroupModal('${sem}', ${i})" title="Edit Rentang / Atur Hari">
                      <i class="material-symbols-rounded" style="font-size:18px" data-lucide="edit"></i>
                    </button>
                    <button class="btn-action-del" onclick="confirmDeleteKalenderGroup('${sem}', ${i})" title="Hapus">
                      <i class="material-symbols-rounded" style="font-size:18px" data-lucide="trash"></i>
                    </button>
                  </div>
                </td>
              </tr>`;
            })
            .join("");
        }
        if (window.lucide) window.lucide.createIcons();
      }

      function clearKalender() {
        if (
          !confirm(
            "Hapus semua data libur dan agenda? Data yang belum tersimpan akan hilang jika tidak disimpan.",
          )
        )
          return;
        kalender.ganjil = [];
        kalender.genap = [];
        saveKalenderAndRefresh();
      }

      

      function addKalenderRange(sem) {
        const arr = sem === "ganjil" ? kalender.ganjil : kalender.genap;
        let defaultDate = sem === "ganjil" ? "2025-08-01" : "2026-01-10";
        if (arr.length > 0) {
          defaultDate = arr[arr.length - 1].tanggal;
        }

        let existing = document.getElementById("kr-modal");
        if (existing) existing.remove();

        const katOpts = KAT_LIST.map(
          (k) => `<option value="${k.id}">${k.label}</option>`,
        ).join("");

        const modal = document.createElement("div");
        modal.id = "kr-modal";
        modal.style.cssText =
          "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9990;display:flex;align-items:center;justify-content:center;";
        modal.innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:24px;width:400px;max-width:94vw;display:flex;flex-direction:column;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="font-family:'Funnel Display',sans-serif;font-size:13pt;font-weight:700;color:var(--text);text-shadow:0 0 10px rgba(255,255,255,0.2);">Tambah Data Libur / Agenda</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="font-size:var(--fs-xs);font-weight:600;color:var(--text-light);">Tanggal Mulai <span style="color:var(--accent);">*</span></label>
        <input type="date" id="kr-dari" value="${defaultDate}" style="padding:8px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid rgba(255,255,255,0.12);border-radius:6px;font-family:var(--f);">
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="font-size:var(--fs-xs);font-weight:600;color:var(--text-light);">Tanggal Akhir <span style="font-size:11px;font-weight:normal;color:var(--text-light);">(Opsional / kosongkan jika 1 hari)</span></label>
        <input type="date" id="kr-sampai" placeholder="Kosongkan jika hanya 1 hari" style="padding:8px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid rgba(255,255,255,0.12);border-radius:6px;font-family:var(--f);">
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="font-size:var(--fs-xs);font-weight:600;color:var(--text-light);">Kategori</label>
        <select id="kr-kat" onchange="renderModalColorCtrls('kr-modal-color-ctrls', this.value)" style="padding:8px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid rgba(255,255,255,0.12);border-radius:6px;font-family:var(--f);">
          ${katOpts}
        </select>
      </div>
      <div id="kr-modal-color-ctrls"></div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="font-size:var(--fs-xs);font-weight:600;color:var(--text-light);">Keterangan</label>
        <input type="text" id="kr-ket" placeholder="Mis. Libur Semester" style="padding:8px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid rgba(255,255,255,0.12);border-radius:6px;font-family:var(--f);">
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
        <input type="checkbox" id="kr-penting" style="width:16px;height:16px;accent-color:var(--accent);">
        <label for="kr-penting" style="font-size:var(--fs-xs);font-weight:600;cursor:pointer;color:var(--text);">Tandai Penting</label>
      </div>
      <div class="modal-actions" style="margin-top:12px;">
        <button id="kr-batal" class="btn-modal-cancel">Batal</button>
        <button id="kr-ok" class="btn-modal-ok">OK</button>
      </div>
    </div>`;
        document.body.appendChild(modal);

        renderModalColorCtrls('kr-modal-color-ctrls', KAT_LIST[0].id);

        document.getElementById("kr-batal").onclick = () => modal.remove();
        document.getElementById("kr-ok").onclick = async () => {
          const dari = document.getElementById("kr-dari").value;
          let sampai = document.getElementById("kr-sampai").value;
          const kat = document.getElementById("kr-kat").value;
          const ket = document.getElementById("kr-ket").value.trim();
          const penting = document.getElementById("kr-penting").checked;
          const warnaEl = document.getElementById("kr-modal-color-ctrls-value");
          const warna = warnaEl ? warnaEl.value : katById(kat).warna;

          if (!dari) {
            alert("Tanggal mulai wajib diisi!");
            return;
          }

          if (!sampai) {
            sampai = dari;
          }

          try {
            const rows = expandRange(dari, sampai, ket, kat, penting, warna);
            arr.push(...rows);
            modal.remove();
            await saveKalenderAndRefresh();
          } catch (e) {
            alert("Format tanggal tidak valid!");
          }
        };
      }

      

      function openEditKalenderGroupModal(sem, groupIndex) {
        const arr = sem === "ganjil" ? kalender.ganjil : kalender.genap;
        const groups = groupKalenderEntries(arr);
        const group = groups[groupIndex];
        if (!group) return;

        let existing = document.getElementById("ke-modal");
        if (existing) existing.remove();

        let currentGroupDates = [...group.dates];

        const katOpts = KAT_LIST.map(
          (k) => `<option value="${k.id}"${group.kategori === k.id ? " selected" : ""}>${k.label}</option>`,
        ).join("");

        const modal = document.createElement("div");
        modal.id = "ke-modal";
        modal.style.cssText =
          "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9990;display:flex;align-items:center;justify-content:center;";
        modal.innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:24px;width:460px;max-width:94vw;display:flex;flex-direction:column;gap:12px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <div style="font-family:'Funnel Display',sans-serif;font-size:13pt;font-weight:700;color:var(--text);text-shadow:0 0 10px rgba(255,255,255,0.2);">Edit Data Libur / Agenda</div>
      </div>
      
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="font-size:var(--fs-xs);font-weight:600;color:var(--text-light);">Kategori</label>
        <select id="ke-kat" onchange="renderModalColorCtrls('ke-modal-color-ctrls', this.value)" style="padding:8px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid rgba(255,255,255,0.12);border-radius:6px;font-family:var(--f);">
          ${katOpts}
        </select>
      </div>
      <div id="ke-modal-color-ctrls"></div>
      
      <div style="display:flex;flex-direction:column;gap:6px;">
        <label style="font-size:var(--fs-xs);font-weight:600;color:var(--text-light);">Keterangan</label>
        <input type="text" id="ke-ket" value="${escH(group.keterangan || "")}" placeholder="Keterangan..." style="padding:8px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid rgba(255,255,255,0.12);border-radius:6px;font-family:var(--f);">
      </div>
      
      <!-- RINCIAN TANGGAL DALAM RENTANG -->
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:2px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <label style="font-size:var(--fs-xs);font-weight:600;color:var(--text-light);">
            Rincian Hari Aktif (<span id="ke-count-badge" style="color:var(--accent); font-weight:700;">${currentGroupDates.length} hari</span>)
          </label>
          <span style="font-size:11px;color:var(--text-light);opacity:0.8;">Klik tanda x untuk menghapus hari tertentu</span>
        </div>
        <div id="ke-chips-container" style="display:flex;flex-wrap:wrap;gap:6px;max-height:130px;overflow-y:auto;padding:8px 10px;background:rgba(0,0,0,0.25);border:1px solid var(--border);border-radius:8px;min-height:48px;align-content:flex-start;">
        </div>
        
        <!-- Opsi Tambah Hari ke Rentang -->
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
          <input type="date" id="ke-add-date-input" style="flex:1;padding:6px 8px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid var(--border);border-radius:6px;font-family:var(--f);font-size:12px;">
          <button type="button" id="ke-btn-add-date" style="padding:6px 12px;background:rgba(255,255,255,0.08);color:var(--text);border:1px solid var(--border);border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
            <i class="material-symbols-rounded" style="font-size:15px;color:var(--accent);" data-lucide="plus"></i> Tambah Hari
          </button>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
        <input type="checkbox" id="ke-penting" ${group.penting ? "checked" : ""} style="width:16px;height:16px;accent-color:var(--accent);">
        <label for="ke-penting" style="font-size:var(--fs-xs);font-weight:600;cursor:pointer;color:var(--text);">Tandai Penting</label>
      </div>

      <div class="modal-actions" style="margin-top:8px;">
        <button id="ke-batal" class="btn-modal-cancel">Batal</button>
        <button id="ke-ok" class="btn-modal-ok btn-save">Simpan</button>
      </div>
    </div>`;
        document.body.appendChild(modal);

        renderModalColorCtrls('ke-modal-color-ctrls', group.kategori || KAT_LIST[0].id, group.warna);

        function updateChipsView() {
          const container = document.getElementById("ke-chips-container");
          const countBadge = document.getElementById("ke-count-badge");
          if (!container) return;

          if (countBadge) countBadge.textContent = `${currentGroupDates.length} hari`;

          if (currentGroupDates.length === 0) {
            container.innerHTML = `
              <div style="font-size: 12px; color: #EF4444; padding: 6px 0; width: 100%;">
                Semua tanggal telah dikeluarkan. Minimal 1 tanggal wajib ada untuk menyimpan rentang.
              </div>
            `;
            return;
          }

          currentGroupDates.sort();
          container.innerHTML = currentGroupDates
            .map((dStr) => {
              const formattedDate = formatTanggalIndo(dStr, true);
              return `
                <div style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-size: 12px; color: var(--text); transition: all 0.15s ease;">
                  <span>${formattedDate}</span>
                  <button type="button" data-del-date="${dStr}" style="background: none; border: none; color: #EF4444; cursor: pointer; padding: 0 3px; font-weight: bold; font-size: 13px; line-height: 1; display: flex; align-items: center; border-radius: 3px; margin-left: 2px;" title="Hapus tanggal ${formattedDate}" onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='none'">x</button>
                </div>
              `;
            })
            .join("");

          // Bind click handlers for delete buttons on chips
          container.querySelectorAll("button[data-del-date]").forEach((btn) => {
            btn.onclick = () => {
              const dt = btn.getAttribute("data-del-date");
              currentGroupDates = currentGroupDates.filter((x) => x !== dt);
              updateChipsView();
            };
          });
        }

        updateChipsView();

        document.getElementById("ke-btn-add-date").onclick = () => {
          const inp = document.getElementById("ke-add-date-input");
          if (!inp || !inp.value) {
            alert("Pilih tanggal terlebih dahulu!");
            return;
          }
          const val = inp.value;
          if (!currentGroupDates.includes(val)) {
            currentGroupDates.push(val);
            currentGroupDates.sort();
            updateChipsView();
            inp.value = "";
          } else {
            alert("Tanggal tersebut sudah ada di dalam daftar!");
          }
        };

        document.getElementById("ke-batal").onclick = () => modal.remove();
        document.getElementById("ke-ok").onclick = async () => {
          if (currentGroupDates.length === 0) {
            alert("Setidaknya harus ada 1 tanggal aktif! Jika ingin menghapus seluruh rentang, gunakan tombol Hapus pada tabel.");
            return;
          }

          const kat = document.getElementById("ke-kat").value;
          const ket = document.getElementById("ke-ket").value.trim();
          const penting = document.getElementById("ke-penting").checked;
          const warnaEl = document.getElementById("ke-modal-color-ctrls-value");
          const warna = warnaEl ? warnaEl.value : katById(kat).warna;

          // Remove the original items belonging to this group
          const targetArr = sem === "ganjil" ? kalender.ganjil : kalender.genap;
          const originalItemSet = new Set(group.items);
          const remainingItems = targetArr.filter((item) => !originalItemSet.has(item));

          // Generate updated items for all active dates
          const newItems = currentGroupDates.map((dStr) => ({
            tanggal: dStr,
            kategori: kat,
            keterangan: ket,
            penting: penting,
            warna: warna,
          }));

          if (sem === "ganjil") {
            kalender.ganjil = [...remainingItems, ...newItems];
          } else {
            kalender.genap = [...remainingItems, ...newItems];
          }

          modal.remove();
          await saveKalenderAndRefresh();
        };

        if (window.lucide) window.lucide.createIcons();
      }

      

      function confirmDeleteKalenderGroup(sem, groupIndex) {
        const arr = sem === "ganjil" ? kalender.ganjil : kalender.genap;
        const groups = groupKalenderEntries(arr);
        const group = groups[groupIndex];
        if (!group) return;

        let existing = document.getElementById("kd-modal");
        if (existing) existing.remove();

        const rangeStr = group.dates.length > 1
          ? `${formatTanggalRangeIndo(group.startDate, group.endDate)} (${group.dates.length} hari)`
          : formatTanggalIndo(group.startDate);

        const modal = document.createElement("div");
        modal.id = "kd-modal";
        modal.style.cssText =
          "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9990;display:flex;align-items:center;justify-content:center;";
        modal.innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:24px;width:420px;max-width:94vw;display:flex;flex-direction:column;gap:14px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
      <div style="display:flex;align-items:center;gap:10px;color:#EF4444;margin-bottom:4px;">
        <span style="display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.1);padding:6px;border-radius:8px;">
          <i class="material-symbols-rounded" style="font-size:24px;" data-lucide="alert-triangle"></i>
        </span>
        <div style="font-family:'Funnel Display',sans-serif;font-size:13pt;font-weight:700;">Konfirmasi Hapus Data Libur</div>
      </div>
      <div style="font-size:13px;color:var(--text-light);line-height:1.5;margin-bottom:4px;">
        Anda akan menghapus data agenda/libur: <strong>${escH(group.keterangan || "Tanpa Keterangan")}</strong> pada rentang <strong>${rangeStr}</strong>.
      </div>

      <div style="display:flex; align-items:center; gap:8px; margin-top:4px; padding:10px; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.15); border-radius:8px;">
        <input type="checkbox" id="kd-yakin" style="width:16px; height:16px; accent-color:#EF4444; cursor:pointer;">
        <label for="kd-yakin" style="font-size:11.5px; font-weight:600; cursor:pointer; color:var(--text); user-select:none;">Ya, saya yakin ingin menghapus seluruh data rentang ini.</label>
      </div>

      <div class="modal-actions" style="margin-top:10px;">
        <button id="kd-batal" class="btn-modal-cancel">Batal</button>
        <button id="kd-hapus" class="btn-modal-ok" style="background:#EF4444; border-color:#EF4444; color:#fff; opacity:0.5; cursor:not-allowed;" disabled>Hapus</button>
      </div>
    </div>`;
        document.body.appendChild(modal);

        const checkYakin = document.getElementById("kd-yakin");
        const btnHapus = document.getElementById("kd-hapus");

        checkYakin.onchange = () => {
          if (checkYakin.checked) {
            btnHapus.disabled = false;
            btnHapus.style.opacity = "1";
            btnHapus.style.cursor = "pointer";
          } else {
            btnHapus.disabled = true;
            btnHapus.style.opacity = "0.5";
            btnHapus.style.cursor = "not-allowed";
          }
        };

        document.getElementById("kd-batal").onclick = () => modal.remove();
        document.getElementById("kd-hapus").onclick = async () => {
          if (!checkYakin.checked) return;

          const originalItemSet = new Set(group.items);
          if (sem === "ganjil") {
            kalender.ganjil = kalender.ganjil.filter((item) => !originalItemSet.has(item));
          } else {
            kalender.genap = kalender.genap.filter((item) => !originalItemSet.has(item));
          }

          modal.remove();
          await saveKalenderAndRefresh();
        };

        if (window.lucide) window.lucide.createIcons();
      }

      // ============================================================
      // KALENDER PENDIDIKAN  -  RENDER FUNCTIONS
      // ============================================================
      function mergeLiburByTip(kalArr) {
        if (!kalArr.length) return [];
        const tipMap = {};
        [...kalArr]
          .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
          .forEach((l) => {
            const tip = l.keterangan || katById(l.kategori || "custom").label;
            const warna = katWarna(l);
            if (!tipMap[tip]) tipMap[tip] = { tip, warna, dates: [] };
            tipMap[tip].dates.push(l.tanggal);
          });
        const out = [];
        Object.values(tipMap).forEach((g) => {
          const dates = [...new Set(g.dates)].sort();
          let start = dates[0],
            end = dates[0];
          for (let i = 1; i < dates.length; i++) {
            const diff = (pd(dates[i]) - pd(dates[i - 1])) / 86400000;
            if (diff <= 1) {
              end = dates[i];
            } else {
              out.push({
                isoStart: start,
                isoEnd: end,
                tip: g.tip,
                warna: g.warna,
              });
              start = dates[i];
              end = dates[i];
            }
          }
          out.push({
            isoStart: start,
            isoEnd: end,
            tip: g.tip,
            warna: g.warna,
          });
        });
        return out.sort((a, b) => a.isoStart.localeCompare(b.isoStart));
      }

      function fmtNoteDate(isoStart, isoEnd) {
        const s = pd(isoStart),
          en = pd(isoEnd);
        const sD = s.getUTCDate(),
          sM = s.getUTCMonth();
        const eD = en.getUTCDate(),
          eM = en.getUTCMonth();
        if (isoStart === isoEnd) return `${sD} ${BULAN[sM]}`;
        if (sM === eM) return `${sD}-${eD} ${BULAN[sM]}`;
        return `${sD} ${BULAN[sM]} - ${eD} ${BULAN[eM]}`;
      }

      function fmtNoteDateShort(isoStart, isoEnd) {
        const s = pd(isoStart),
          en = pd(isoEnd);
        const sD = s.getUTCDate(),
          sM = s.getUTCMonth(),
          sY = s.getUTCFullYear();
        const eD = en.getUTCDate(),
          eM = en.getUTCMonth(),
          eY = en.getUTCFullYear();
        if (isoStart === isoEnd) return `${sD} ${BULAN_S[sM]} ${sY}`;
        if (sM === eM && sY === eY) return `${sD}-${eD} ${BULAN_S[sM]} ${sY}`;
        if (sY === eY) return `${sD} ${BULAN_S[sM]} - ${eD} ${BULAN_S[eM]} ${sY}`;
        return `${sD} ${BULAN_S[sM]} ${sY} - ${eD} ${BULAN_S[eM]} ${eY}`;
      }

      function buildConsolidatedNotes(kalArr, isLarge = false) {
        const entries = mergeLiburByTip(kalArr);
        if (!entries.length) return "";
        const fs = isLarge ? "var(--fs)" : "var(--fs-xs)";
        const makeRow = (
          e,
        ) => `<tr style="page-break-inside: avoid; break-inside: avoid;">
      <td style="padding:4px 10px 4px 0;vertical-align:top;width:18px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${e.warna};margin-top:5px;flex-shrink:0;box-shadow:0 1px 2px rgba(0,0,0,0.12);"></span>
      </td>
      <td style="white-space:nowrap;font-weight:700;padding:4px 8px 4px 0;vertical-align:top;font-size:${fs};">${fmtNoteDate(e.isoStart, e.isoEnd)}</td>
      <td style="padding:4px 10px 4px 0;vertical-align:top;color:#999;font-size:${fs};">:</td>
      <td style="padding:4px 0;vertical-align:top;line-height:1.5;font-size:${fs};">${escH(e.tip)}</td>
    </tr>`;

        if (!isLarge && entries.length > 3) {
          const half = Math.ceil(entries.length / 2);
          const col1 = entries.slice(0, half).map(makeRow).join("");
          const col2 = entries.slice(half).map(makeRow).join("");
          return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
        <table class="layout-tbl" style="border-collapse:collapse;width:100%;">${col1}</table>
        <table class="layout-tbl" style="border-collapse:collapse;width:100%;">${col2}</table>
      </div>`;
        }

        const rows = entries.map(makeRow).join("");
        return `<table class="layout-tbl" style="border-collapse:collapse;width:100%;">${rows}</table>`;
      }

      function openHariKerjaModal() {
        let existing = document.getElementById("hk-modal");
        if (existing) existing.remove();

        const WD_LIST = [
          { dow: 1, label: "Senin" },
          { dow: 2, label: "Selasa" },
          { dow: 3, label: "Rabu" },
          { dow: 4, label: "Kamis" },
          { dow: 5, label: "Jumat" },
          { dow: 6, label: "Sabtu" },
          { dow: 0, label: "Minggu" },
        ];

        const checksHtml = WD_LIST.map(({ dow, label }) => {
          const isChecked = kalWorkDays.has(dow) ? "checked" : "";
          return `
            <label style="display:flex; align-items:center; gap:10px; padding:9px 12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; cursor:pointer; font-size:var(--fs-sm); color:var(--text); transition:background 0.15s;">
              <input type="checkbox" data-dow="${dow}" ${isChecked} style="width:16px; height:16px; accent-color:var(--accent); cursor:pointer;">
              <span style="font-weight:600;">${label}</span>
            </label>
          `;
        }).join("");

        const modal = document.createElement("div");
        modal.id = "hk-modal";
        modal.style.cssText =
          "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9990;display:flex;align-items:center;justify-content:center;";
        modal.innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:24px;width:380px;max-width:94vw;display:flex;flex-direction:column;gap:14px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="font-family:'Funnel Display',sans-serif;font-size:13pt;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px;">
          <i class="material-symbols-rounded" style="font-size:18px;color:var(--accent);" data-lucide="calendar-check"></i>
          <span>Pengaturan Hari Kerja</span>
        </div>
      </div>
      <p style="font-size:var(--fs-xs);color:var(--text-light);margin:0;line-height:1.4;">Centang hari-hari efektif sekolah yang dihitung sebagai hari kerja:</p>
      <div id="hk-checkboxes-container" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${checksHtml}
      </div>
      <div class="modal-actions" style="margin-top:10px;">
        <button id="hk-batal" class="btn-modal-cancel">Batal</button>
        <button id="hk-simpan" class="btn-modal-ok btn-save">Simpan</button>
      </div>
    </div>`;
        document.body.appendChild(modal);
        if (window.lucide) window.lucide.createIcons();

        document.getElementById("hk-batal").onclick = () => modal.remove();
        document.getElementById("hk-simpan").onclick = () => {
          const inputs = modal.querySelectorAll("input[data-dow]");
          kalWorkDays.clear();
          inputs.forEach((input) => {
            if (input.checked) {
              kalWorkDays.add(parseInt(input.dataset.dow, 10));
            }
          });
          modal.remove();
          renderWdBar();
          renderKalenderPendidikan();
          if (typeof scheduleSave === "function") scheduleSave();
        };
      }

      function renderWdBar() {
        const container = document.getElementById("libur-wd-bar");
        if (!container) return;
        const fdw = parseInt(
          document.getElementById("f-first-day")?.value || "0",
        );
        const WD_FULL = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        const wdArray =
          fdw === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];
        const wdBar = `<div class="kal-workday-bar">
    <span style="font-weight:700;color:var(--accent-light);white-space:nowrap;">Hari Kerja:</span>
    ${wdArray
      .map(
        (i) => `<label class="kal-wd-check">
      <input type="checkbox" ${kalWorkDays.has(i) ? "checked" : ""} onchange="toggleWorkDay(${i})">
      <span style="color:${kalWorkDays.has(i) ? "var(--text)" : "#ef4444"};">${WD_FULL[i]}</span>
    </label>`,
      )
      .join("")}
  </div>`;
        container.innerHTML = wdBar;
      }

      function toggleWorkDay(dow) {
        if (kalWorkDays.has(dow)) kalWorkDays.delete(dow);
        else kalWorkDays.add(dow);
        renderWdBar();
        renderKalenderPendidikan();
      }

      function hexToRgba(hex, alpha) {
        const h = hex.replace("#", "");
        const r = parseInt(h.substring(0, 2), 16),
          g = parseInt(h.substring(2, 4), 16),
          b = parseInt(h.substring(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      }
      function darkenColor(hex, factor = 0.62) {
        const h = hex.replace("#", "");
        const r = Math.round(parseInt(h.substring(0, 2), 16) * factor);
        const g = Math.round(parseInt(h.substring(2, 4), 16) * factor);
        const b = Math.round(parseInt(h.substring(4, 6), 16) * factor);
        return `rgb(${r},${g},${b})`;
      }

      function renderKKTPOutput() {
        const pane = document.getElementById("kktp-content");
        if (!pane) return;
        
        const du = getDU();
        const tpsGanjil = state.tpGanjil || [];
        const tpsGenap = state.tpGenap || [];
        const tps = [...tpsGanjil, ...tpsGenap];
        
        if (!tps.length) {
          pane.innerHTML = `<div class="empty">
            <div class="ic"><i class="material-symbols-rounded" style="font-size:48px; color:inherit" data-lucide="file-text"></i></div>
            <h3>Belum di-generate</h3>
            <p>Isi Tujuan Pembelajaran terlebih dahulu.</p>
          </div>`;
          return;
        }

        let html = ``;
        html += `<div class="doc-frame kktp-frame">`;
        html += `<div class="doc-info" style="margin-bottom:16px;">
          <div class="doc-title">Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</div>
          <div class="doc-meta-list">
            <div class="dml-row"><span class="dml-lbl">Nama Sekolah</span><span class="dml-sep">:</span><span class="dml-val">${escH(du.sekolah)}</span></div>
            <div class="dml-row"><span class="dml-lbl">Mata Pelajaran</span><span class="dml-sep">:</span><span class="dml-val">${escH(du.mapel)}</span></div>
            <div class="dml-row"><span class="dml-lbl">Fase / Kelas</span><span class="dml-sep">:</span><span class="dml-val">${escH(formatFaseKelas(du.fase, du.kelas, du.rombel))}</span></div>
            <div class="dml-row"><span class="dml-lbl">Tahun Ajaran</span><span class="dml-sep">:</span><span class="dml-val">${escH(du.tahun)}</span></div>
          </div>
        </div>`;

        html += `<table style="width:100%;border-collapse:collapse;font-size:var(--fs);border:1px solid #1e3a5f;" border="1">
          <thead>
            <tr>
               <th rowspan="3" style="width:4%;padding:4px;border:1px solid #1e3a5f;background:#bdd7ee;color:#000;text-align:center;">No.</th>
              <th rowspan="3" style="width:8%;padding:4px;border:1px solid #1e3a5f;background:#bdd7ee;color:#000;text-align:center;">Kode TP</th>
              <th rowspan="3" style="width:36%;padding:4px;border:1px solid #1e3a5f;background:#bdd7ee;color:#000;text-align:center;">Tujuan Pembelajaran</th>
              <th colspan="${state.kktp.length}" style="padding:4px;border:1px solid #1e3a5f;background:#bdd7ee;color:#000;text-align:center;">Skala atau Interval Nilai</th>
            </tr>
            <tr>
              ${state.kktp.map(k => `<th style="padding:4px;border:1px solid #1e3a5f;background:#bdd7ee;color:#000;text-align:center;width:13%;">${escH(k.val)}%</th>`).join('')}
            </tr>
            <tr>
              ${state.kktp.map(k => `<th style="padding:4px;border:1px solid #1e3a5f;background:#bdd7ee;color:#000;font-weight:normal;font-size:0.85em;text-align:center;vertical-align:top;">${escH(k.desc)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>`;

        let no = 1;
        const emptyCols = state.kktp.map(() => `<td style="border:1px solid #1e3a5f;"></td>`).join("");
        if (tpsGanjil.length > 0) {
           html += `<tr><td colspan="${3 + state.kktp.length}" style="padding:6px;font-weight:bold;background:#f2f2f2;border:1px solid #1e3a5f;text-align:center;">Semester Ganjil</td></tr>`;
           tpsGanjil.forEach(r => {
             if (r.ev) return;
             html += `<tr>
                <td style="text-align:center;padding:4px;border:1px solid #1e3a5f;">${no++}</td>
                <td style="text-align:center;padding:4px;border:1px solid #1e3a5f;">${escH(r.kode || "-")}</td>
                <td style="padding:4px;border:1px solid #1e3a5f;">${escH(r.tp)}</td>
                ${emptyCols}
             </tr>`;
           });
        }
        if (tpsGenap.length > 0) {
           html += `<tr><td colspan="${3 + state.kktp.length}" style="padding:6px;font-weight:bold;background:#f2f2f2;border:1px solid #1e3a5f;text-align:center;">Semester Genap</td></tr>`;
           tpsGenap.forEach(r => {
             if (r.ev) return;
             html += `<tr>
                <td style="text-align:center;padding:4px;border:1px solid #1e3a5f;">${no++}</td>
                <td style="text-align:center;padding:4px;border:1px solid #1e3a5f;">${escH(r.kode || "-")}</td>
                <td style="padding:4px;border:1px solid #1e3a5f;">${escH(r.tp)}</td>
                ${emptyCols}
             </tr>`;
           });
        }

        html += `</tbody></table><br>`;
        html += renderDUSignHTML(du); // The signature block from Data Umum
        html += `</div>`;
        pane.innerHTML = html;
        
        const btnPrint = document.getElementById("btn-print-kktp");
        if (btnPrint) btnPrint.style.display = "inline-flex";
        const btnDocx = document.getElementById("btn-docx-kktp");
        if (btnDocx) btnDocx.style.display = "inline-flex";
      }

      function renderKalenderPendidikan() {
        const du = getDU();
        const ta = document.getElementById("f-tahun")?.value || du.tahun || getAutoTahunAjaran();
        const parts = ta.split("/"),
          yr1 = parseInt(parts[0]),
          yr2 = parseInt(parts[1] || yr1 + 1);
        if(document.getElementById("kal-tahun-label")) document.getElementById("kal-tahun-label").textContent = ta;

        const titleHeader = `
          <div id="kal-title-header" style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1.5px solid #254b77;">
            <div style="font-weight: 800; font-size: 15pt; color: #0f172a; line-height: 1.3; text-transform: uppercase; letter-spacing: 0.5px;">KALENDER PENDIDIKAN</div>
            <div style="font-weight: 800; font-size: 15pt; color: #0f172a; line-height: 1.3; text-transform: uppercase; letter-spacing: 0.5px;">${escH(du.sekolah || "promesta.id")}</div>
            <div style="font-weight: 800; font-size: 15pt; color: #0f172a; line-height: 1.3; text-transform: uppercase; letter-spacing: 0.5px;">TAHUN AJARAN ${escH(ta)}</div>
          </div>`;

        const fdw = parseInt(
          document.getElementById("f-first-day")?.value || "0",
        );

        const lookup = {};
        [...kalender.ganjil, ...kalender.genap].forEach((l) => {
          const kat = katById(l.kategori || "custom");
          if (!lookup[l.tanggal]) {
            lookup[l.tanggal] = {
              warna: katWarna(l),
              tips: [],
              countEfektif: !!kat.countEfektif,
              penting: !!l.penting,
            };
          } else {
            if (!kat.countEfektif) lookup[l.tanggal].countEfektif = false;
            if (l.penting) lookup[l.tanggal].penting = true;
          }
          lookup[l.tanggal].tips.push(l.keterangan || kat.label);
        });

        const WD_LABELS =
          fdw === 1
            ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
            : ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const todayStr = fi(new Date());

        const weeksSem1 = buildMonthWeeks(1).monthWeeksArr;
        const weeksSem2 = buildMonthWeeks(2).monthWeeksArr;

        function thStyleFor(actualDow, isLarge = false) {
          const thFs = isLarge ? "font-size: 10.5pt; padding: 7px 0 6px;" : "font-size: 8pt; padding: 5px 0 4px;";
          return `${thFs}`;
        }

        function renderMonth(year, month, isLarge = false) {
          const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
          let startDowIndex = firstDow;
          if (fdw === 1) {
            startDowIndex = firstDow === 0 ? 6 : firstDow - 1;
          }

          const sem = (month >= 6 && month <= 11) ? 1 : 2;
          const mi = sem === 1 ? month - 6 : month;
          const jumlahPekan = sem === 1 ? (weeksSem1[mi] || 0) : (weeksSem2[mi] || 0);

          const total = daysInMonth(year, month);
          const cells = [];
          for (let i = 0; i < startDowIndex; i++) cells.push(null);
          for (let d = 1; d <= total; d++) cells.push(d);
          while (cells.length < 42) cells.push(null);
          const dateCol = {};
          cells.forEach((d, idx) => {
            if (d !== null) dateCol[d] = idx % 7;
          });
          const dayMarks = {};
          for (let d = 1; d <= total; d++) {
            const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            if (lookup[iso]) dayMarks[d] = lookup[iso];
          }
          function conn(d) {
            const cur = dayMarks[d];
            if (!cur) return null;
            const col = dateCol[d];
            const prev = dayMarks[d - 1],
              next = dayMarks[d + 1];
            const cPrev = !!(prev && prev.warna === cur.warna && col > 0);
            const cNext = !!(next && next.warna === cur.warna && col < 6);
            return {
              warna: cur.warna,
              tips: cur.tips,
              cPrev,
              cNext,
              penting: !!cur.penting,
            };
          }
          const H = isLarge ? 44 : 27;
          const fs = isLarge ? "12pt" : "9.5pt";
          let rows = "";
          let hariEfektif = 0;
          for (let r = 0; r < cells.length / 7; r++) {
            let tds = "";
            for (let c = 0; c < 7; c++) {
              const d = cells[r * 7 + c];
              const actualDow = (c + fdw) % 7;
              if (d === null) {
                tds += `<td class="kal-empty-cell" style="padding:0;"></td>`;
                continue;
              }
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isToday = iso === todayStr;
              const isWork = kalWorkDays.has(actualDow);
              const eventAtDay = lookup[iso];
              const isLibur = eventAtDay ? !eventAtDay.countEfektif : false;
              if (isWork && !isLibur) {
                hariEfektif++;
              }
              const mk = conn(d);
              const isSun = actualDow === 0;
              const isSat = actualDow === 6;
              const cellColorClass = !isWork
                ? "kal-cell-wknd-off"
                : isSun
                  ? "kal-cell-sun"
                  : isSat
                    ? "kal-cell-sat"
                    : "";

              if (!mk) {
                tds += `<td style="padding:0;text-align:center;vertical-align:middle;">
            <span class="kal-cell-num ${cellColorClass}" style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:${H}px;font-size:${fs};">${d}</span>
          </td>`;
                continue;
              }
              const { warna, tips, cPrev, cNext } = mk;
              const tip = ` data-tip="${escH(tips.join(" | "))}"`;
              const soft = hexToRgba(warna, 0.15);
              const darkTxt = darkenColor(warna);
              const todayOutline = mk.penting
                  ? `box-shadow: inset 0 0 0 var(--pw, 2px) var(--out-col);`
                  : "";
              const isSingle = !cPrev && !cNext;
              const hlWkndStyle = !isWork ? `color: var(--kal-hl-wknd, #dc2626) !important;` : "";
              const pCls = mk.penting ? " kal-penting" : "";
              tds += `<td class="kal-td-hl${pCls}" style="--kal-bg:${soft}; --kal-out-screen:${warna}; --kal-out-print:${darkTxt}; --kal-txt-print:${darkTxt}; padding:0;${todayOutline}" ${tip}>
          <span class="kal-txt-hl ${cellColorClass}" style="${hlWkndStyle} display:flex;align-items:center;justify-content:center;
            width:100%;height:${H}px;font-size:${fs};font-weight:800;cursor:default;">${d}</span>
          </td>`;
            }
            rows += `<tr>${tds}</tr>`;
          }
          const nameFs = isLarge ? "14pt" : "11pt";
          return `<div class="kal-month">
      <div class="kal-month-hdr" style="${isLarge ? 'padding: 10px 14px;' : ''}">
        <div class="kal-month-title" style="font-size: ${nameFs}">${BULAN[month]} ${year}</div>
      </div>
      <table class="kal-tbl">
        <thead><tr>${WD_LABELS.map((w, i) => `<th style="${thStyleFor((i + fdw) % 7, isLarge)}">${w}</th>`).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="kal-hari-efektif" style="${isLarge ? 'font-size: 13px; padding: 8px 14px;' : ''}">
        <span>Hari Efektif = ${hariEfektif}</span>
        <span>Jumlah Pekan = ${jumlahPekan}</span>
      </div>
    </div>`;
        }

        const sem1 = [6, 7, 8, 9, 10, 11]
          .map((m) => renderMonth(yr1, m))
          .join("");
        const sem2 = [0, 1, 2, 3, 4, 5]
          .map((m) => renderMonth(yr2, m))
          .join("");
        const notes1 = buildConsolidatedNotes(kalender.ganjil, []);
        const notes2 = buildConsolidatedNotes(kalender.genap, []);
        const notesBlock = (notes, sem) =>
          notes
            ? `
    <div class="kal-notes-legend">
      <div class="kal-notes-legend-title">
        Keterangan Semester ${sem === 1 ? "Ganjil" : "Genap"}
      </div>
      <div class="kal-notes-cols" style="display: block;">
        ${notes}
      </div>
    </div>`
            : "";

        window.kalMode = window.kalMode || "semua";
        window.setKalMode = (mode) => {
          window.kalMode = mode;
          renderKalenderPendidikan();
        };

        const monthTabsArr = [
          { id: "semua", label: "Semua" },
          { id: "6", label: "Jul" },
          { id: "7", label: "Agu" },
          { id: "8", label: "Sep" },
          { id: "9", label: "Okt" },
          { id: "10", label: "Nov" },
          { id: "11", label: "Des" },
          { id: "0", label: "Jan" },
          { id: "1", label: "Feb" },
          { id: "2", label: "Mar" },
          { id: "3", label: "Apr" },
          { id: "4", label: "Mei" },
          { id: "5", label: "Jun" },
        ];

        const tabsHtml = monthTabsArr
          .map(
            (t) =>
              `<button class="kal-filter-btn ${window.kalMode === t.id ? "active" : ""}" onclick="setKalMode('${t.id}')">${t.label}</button>`
          )
          .join("");

        const filterEl = document.getElementById("kal-month-filter") || document.getElementById("kal-sticky-toolbar");
        if (filterEl) filterEl.innerHTML = tabsHtml;

        let kalContentHtml = "";
        if (window.kalMode === "semua") {
          kalContentHtml = `<div class="doc-frame kal-outer">
            <div class="kal-sem-container">
              <div class="kal-sem-pill" style="margin-top:0;">Semester Ganjil</div>
              <div class="kal-grid">${sem1}</div>
              ${notesBlock(notes1, 1)}
            </div>
            <div class="kal-sem-container" style="margin-top:20px;">
              <div class="kal-sem-pill" style="margin-top:0;">Semester Genap</div>
              <div class="kal-grid">${sem2}</div>
              ${notesBlock(notes2, 2)}
            </div>
          </div>`;
        } else {
          const m = parseInt(window.kalMode);
          const isGanjil = m >= 6;
          const y = isGanjil ? yr1 : yr2;
          const filteredKal = (
            isGanjil ? kalender.ganjil : kalender.genap
          ).filter((l) => {
            return parseInt(l.tanggal.split("-")[1], 10) - 1 === m;
          });
          const targetNotes = buildConsolidatedNotes(filteredKal, true);
          const semNum = isGanjil ? 1 : 2;
          const monthName = BULAN[m];

          const title = `Keterangan Bulan ${monthName} ${y}`;
          const noteHtml = targetNotes
            ? `
    <div class="kal-notes-legend" style="margin-top: 0;">
      <div class="kal-notes-legend-title">
        ${title}
      </div>
      <div class="kal-notes-cols" style="display: block;">
        ${targetNotes}
      </div>
    </div>`
            : "";

          kalContentHtml = `<div class="doc-frame kal-outer">
            <div style="display: grid; grid-template-columns: 1.25fr 2fr; gap: 24px; align-items: start;">
              <div class="kal-grid" style="grid-template-columns: 1fr;">${renderMonth(y, m, true)}</div>
              <div>${noteHtml}</div>
            </div>
          </div>`;
        }

        if(document.getElementById("kalender-content")) document.getElementById("kalender-content").innerHTML = titleHeader + kalContentHtml;
      }

      // -- KATEGORI KALENDER -----------------------------------------
      function getMappedKategori(id) {
        const lowerId = (id || "").toLowerCase();
        if (lowerId === "libnas" || lowerId === "libsek" || lowerId === "libur") return "libur";
        if (lowerId === "kegiatan" || lowerId === "ujian" || lowerId === "custom" || lowerId === "kegiatan_nonaktif") return "kegiatan_nonaktif";
        if (lowerId === "kegiatan_efektif" || lowerId === "kegiatan_aktif") return "kegiatan_aktif";
        return "libur";
      }

      const KAT_LIST = [
        { id: "libur", label: "Libur", warna: "#EF4444", countEfektif: false },
        { id: "kegiatan_nonaktif", label: "Kegiatan Sekolah (KBM nonaktif)", warna: "#F97316", countEfektif: false },
        { id: "kegiatan_aktif", label: "Kegiatan Sekolah (KBM aktif)", warna: "#3B82F6", countEfektif: true }
      ];
      function katById(id) {
        const mappedId = getMappedKategori(id);
        return (
          KAT_LIST.find((k) => k.id === mappedId) || KAT_LIST[0]
        );
      }
      function katWarna(entry) {
        return entry.warna || katById(entry.kategori).warna;
      }

      const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const HARI_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const HARI_DOW = {
        Senin: 1,
        Selasa: 2,
        Rabu: 3,
        Kamis: 4,
        Jumat: 5,
        Sabtu: 6,
      };
      const BULAN = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const BULAN_S = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      // ============================================================
      // DATE UTILS
      // ============================================================
      function pd(iso) {
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, d));
      }
      function fi(dt) {
        const y = dt.getUTCFullYear(),
          m = String(dt.getUTCMonth() + 1).padStart(2, "0"),
          d = String(dt.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
      function ad(dt, n) {
        return new Date(dt.getTime() + n * 86400000);
      }
      function fmtD(iso) {
        if (!iso) return "-";
        const [y, m, d] = iso.split("-").map(Number);
        return `${d} ${BULAN[m - 1]} ${y}`;
      }
      function fmtJurnalDate(iso, jp) {
        if (!iso) return "-";
        const dt = pd(iso);
        const [y, m, d] = iso.split("-").map(Number);
        const dayName = HARI_NAMES[dt.getUTCDay()] || "";
        const monthShort = BULAN_S[m - 1] || "";
        const jpSuffix = jp ? ` (${jp} JP)` : "";
        return `${dayName}, ${d} ${monthShort} ${y}${jpSuffix}`;
      }
      
      
      function expandRange(dari, sampai, ket, kategori, penting, warna) {
        const res = [];
        let cur = pd(dari);
        const end = pd(sampai);
        while (cur <= end) {
          res.push({
            tanggal: fi(cur),
            keterangan: ket,
            kategori: kategori || "libur",
            penting: !!penting,
            warna: warna,
          });
          cur = ad(cur, 1);
        }
        return res;
      }
      function daysInMonth(y, m) {
        return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      }

      function getAutoTahunAjaran(dateObj = new Date()) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth(); // 0 = Jan, 6 = Juli
        // Di Indonesia, Tahun Ajaran baru dimulai bulan Juli (index 6).
        // Juli-Desember -> year/year+1 (Contoh: Agt 2026 -> 2026/2027)
        // Januari-Juni -> year-1/year (Contoh: Feb 2026 -> 2025/2026)
        if (month >= 6) {
          return `${year}/${year + 1}`;
        } else {
          return `${year - 1}/${year}`;
        }
      }

      function getDefaultTanggalPengesahan(tahunAjaranStr) {
        if (!tahunAjaranStr) tahunAjaranStr = getAutoTahunAjaran();
        const match = String(tahunAjaranStr).match(/(\d{4})/);
        if (!match) return "2025-07-14";
        const startYear = parseInt(match[1], 10);
        if (isNaN(startYear) || startYear < 1900 || startYear > 2200) return "2025-07-14";

        // Cari hari Senin pertama pada atau setelah tanggal 10 Juli (pekan ke-3 Juli)
        for (let day = 10; day <= 17; day++) {
          const d = new Date(startYear, 6, day); // month 6 = Juli
          if (d.getDay() === 1) { // 1 = Senin
            const mStr = "07";
            const dStr = String(day).padStart(2, "0");
            return `${startYear}-${mStr}-${dStr}`;
          }
        }
        return `${startYear}-07-14`;
      }

      // ============================================================
      // DEFAULT STATE (pre-filled from Excel file)
      // ============================================================
      const DEFAULT_STATE = {
        prosemShowJp: true,
        kktp: [
          { val: "0 - 40", desc: "Belum Mencapai, remedial di seluruh bagian" },
          { val: "41 - 65", desc: "Belum Mencapai Ketuntasan, remedial di bagian yang diperlukan" },
          { val: "66 - 85", desc: "Sudah Mencapai Ketuntasan, tidak perlu remedial" },
          { val: "86 - 100", desc: "Sangat Baik, perlu pengayaan atau tantangan lebih" },
        ],
        siswa: [],
        absensiGanjil: {},
        absensiGenap: {},
        nilaiGanjil: {},
        nilaiGenap: {},
        pengaturanPenilaianGanjil: [
          { id: "slm", name: "Sumatif Lingkup Materi", code: "SLM", bobot: 50, fixed: true, active: true, subKomponents: [] },
          { id: "sas", name: "Sumatif Akhir Semester", code: "SAS", bobot: 50, fixed: true, active: true, subKomponents: [{ id: "sasnt", name: "Nontes", code: "Nontes" }, { id: "sast", name: "Tes", code: "Tes" }] },
        ],
        pengaturanPenilaianGenap: [
          { id: "slm", name: "Sumatif Lingkup Materi", code: "SLM", bobot: 50, fixed: true, active: true, subKomponents: [] },
          { id: "sas", name: "Sumatif Akhir Semester", code: "SAS", bobot: 50, fixed: true, active: true, subKomponents: [{ id: "sasnt", name: "Nontes", code: "Nontes" }, { id: "sast", name: "Tes", code: "Tes" }] },
        ],
        customColsGanjil: ["Keterampilan"],
        customColsGenap: ["Keterampilan"],
        jadwal: [
          { hari: "Selasa", jp: 2 },
          { hari: "Rabu", jp: 3 },
        ],
        atpData: [
          {
            elemen: "Bilangan",
            cp: "Menunjukkan pemahaman dan intuisi bilangan (number sense) pada bilangan cacah sampai 1.000.000; membaca, menulis, menentukan nilai tempat, membandingkan, mengurutkan, melakukan komposisi dan dekomposisi bilangan; menyelesaikan masalah yang berkaitan dengan uang; melakukan operasi penjumlahan, pengurangan, perkalian, dan pembagian bilangan cacah sampai 100.000; serta menyelesaikan masalah yang berkaitan dengan KPK dan FPB. Murid dapat membandingkan dan mengurutkan berbagai pecahan termasuk pecahan campuran, melakukan operasi penjumlahan dan pengurangan pecahan, serta melakukan operasi perkalian dan pembagian pecahan dengan bilangan asli; mengubah pecahan menjadi berbagai bentuk pecahan lain, serta membandingkan dan mengurutkan bilangan desimal (satu angka di belakang koma).",
            rows: [
              {
                tp: "Membaca bilangan cacah sampai 100.000",
                atp: "Membaca bilangan cacah sampai 100.000",
              },
              {
                tp: "Menulis bilangan cacah sampai 100.000",
                atp: "Menulis bilangan cacah sampai 100.000",
              },
              {
                tp: "Menentukan nilai tempat bilangan cacah sampai 100.000",
                atp: "Menentukan nilai tempat bilangan cacah sampai 100.000",
              },
              {
                tp: "Membandingkan bilangan cacah sampai 100.000",
                atp: "Membandingkan bilangan cacah sampai 100.000",
              },
              {
                tp: "Mengurutkan bilangan sampai 100.000",
                atp: "Mengurutkan bilangan sampai 100.000",
              },
              {
                tp: "Menentukan komposisi bilangan sampai 100.000",
                atp: "Menentukan komposisi bilangan sampai 100.000",
              },
              {
                tp: "Menentukan dekomposisi bilangan sampai 100.000",
                atp: "Menentukan dekomposisi bilangan sampai 100.000",
              },
              {
                tp: "Menghitung penjumlahan bilangan sampai 100.000",
                atp: "Menghitung penjumlahan bilangan sampai 100.000",
              },
              {
                tp: "Menghitung pengurangan bilangan sampai 100.000",
                atp: "Menghitung pengurangan bilangan sampai 100.000",
              },
              {
                tp: "Menghitung perkalian bilangan sampai 100.000",
                atp: "Menghitung perkalian bilangan sampai 100.000",
              },
              {
                tp: "Menghitung pembagian bilangan sampai 100.000",
                atp: "Menghitung pembagian bilangan sampai 100.000",
              },
              {
                tp: "Menentukan kelipatan bilangan",
                atp: "Menentukan kelipatan bilangan",
              },
              {
                tp: "Menentukan kelipatan persekutuan dua bilangan atau lebih",
                atp: "Menentukan kelipatan persekutuan dua bilangan atau lebih",
              },
              {
                tp: "Menentukan kelipatan persekutuan terkecil dua bilangan atau lebih",
                atp: "Menentukan kelipatan persekutuan terkecil dua bilangan atau lebih",
              },
              {
                tp: "Menyelesaikan masalah yang berkaitan dengan KPK",
                atp: "Menyelesaikan masalah yang berkaitan dengan KPK",
              },
              {
                tp: "Menentukan faktor suatu bilangan",
                atp: "Menentukan faktor suatu bilangan",
              },
              {
                tp: "Menentukan faktor persekutuan dua bilangan atau lebih",
                atp: "Menentukan faktor persekutuan dua bilangan atau lebih",
              },
              {
                tp: "Menentukan faktor persekutuan terbesar suatu bilangan atau lebih",
                atp: "Menentukan faktor persekutuan terbesar suatu bilangan atau lebih",
              },
              {
                tp: "Menyelesaikan masalah yang berkaitan dengan FPB",
                atp: "Menyelesaikan masalah yang berkaitan dengan FPB",
              },
              { tp: "Memahami bilangan prima", atp: "Memahami bilangan prima" },
              {
                tp: "Menentukan bilangan prima di bawah 100",
                atp: "Menentukan bilangan prima di bawah 100",
              },
              {
                tp: "Menentukan faktor prima suatu bilangan",
                atp: "Menentukan faktor prima suatu bilangan",
              },
              {
                tp: "Menentukan KPK dan FPB dengan menggunakan bilangan prima",
                atp: "Menentukan KPK dan FPB dengan menggunakan bilangan prima",
              },
              {
                tp: "Membandingkan bilangan pecahan",
                atp: "Membandingkan bilangan pecahan",
              },
              {
                tp: "Mengurutkan bilangan pecahan",
                atp: "Mengurutkan bilangan pecahan",
              },
              {
                tp: "Melakukan penjumlahan dengan penyebut sama",
                atp: "Melakukan penjumlahan dengan penyebut sama",
              },
              {
                tp: "Melakukan penjumlahan dengan penyebut beda",
                atp: "Melakukan penjumlahan dengan penyebut beda",
              },
              {
                tp: "Melakukan pengurangan dengan penyebut sama",
                atp: "Melakukan pengurangan dengan penyebut sama",
              },
              {
                tp: "Melakukan pengurangan dengan penyebut beda",
                atp: "Melakukan pengurangan dengan penyebut beda",
              },
              {
                tp: "Membaca bilangan cacah sampai 1.000.000",
                atp: "Membaca bilangan cacah sampai 1.000.000",
              },
              {
                tp: "Menulis bilangan cacah sampai 1.000.000",
                atp: "Menulis bilangan cacah sampai 1.000.000",
              },
              {
                tp: "Menentukan nilai tempat bilangan cacah sampai 1.000.000",
                atp: "Menentukan nilai tempat bilangan cacah sampai 1.000.000",
              },
              {
                tp: "Membandingkan bilangan cacah sampai 1.000.000",
                atp: "Membandingkan bilangan cacah sampai 1.000.000",
              },
              {
                tp: "Mengurutkan bilangan sampai 1.000.000",
                atp: "Mengurutkan bilangan sampai 1.000.000",
              },
              {
                tp: "Menentukan komposisi bilangan sampai 1.000.000",
                atp: "Menentukan komposisi bilangan sampai 1.000.000",
              },
              {
                tp: "Menentukan dekomposisi bilangan sampai 1.000.000",
                atp: "Menentukan dekomposisi bilangan sampai 1.000.000",
              },
            ],
          },
          {
            elemen: "Geometri dan Pengukuran",
            cp: "Menjelaskan keliling dan luas daerah berbagai bentuk bangun datar (segitiga, segiempat, dan segi banyak). Murid dapat menjelaskan hubungan antarsudut sebagai akibat dari dua garis yang berpotongan dan bersejajar. Murid dapat menjelaskan ciri-ciri lingkaran dan menentukan keliling dan luas lingkaran, menjelaskan cara menentukan luas permukaan dan volume bangun ruang (prisma, tabung, bola, limas dan kerucut) serta gabungannya.",
            rows: [
              {
                tp: "Mengenali situasi soal yang melibatkan keliling bangun datar",
                atp: "Mengenali situasi soal yang melibatkan keliling bangun datar",
              },
              {
                tp: "Menemukan konsep keliling bangun datar sebagai jumlahan panjang sisi-sisinya",
                atp: "Menemukan konsep keliling bangun datar sebagai jumlahan panjang sisi-sisinya",
              },
              {
                tp: "Menemukan keliling berbagai jenis segitiga",
                atp: "Menemukan keliling berbagai jenis segitiga",
              },
              {
                tp: "Menemukan keliling berbagai jenis segi empat",
                atp: "Menemukan keliling berbagai jenis segi empat",
              },
              {
                tp: "Menemukan keliling segi lima, segi enam, dan segi delapan beraturan",
                atp: "Menemukan keliling segi lima, segi enam, dan segi delapan beraturan",
              },
              {
                tp: "Mendekomposisi bangun datar gabungan dan menemukan kelilingnya",
                atp: "Mendekomposisi bangun datar gabungan dan menemukan kelilingnya",
              },
              {
                tp: "Mengenali situasi soal yang melibatkan luas daerah bangun datar",
                atp: "Mengenali situasi soal yang melibatkan luas daerah bangun datar",
              },
              {
                tp: "Menemukan konsep luas daerah bangun datar",
                atp: "Menemukan konsep luas daerah bangun datar",
              },
              {
                tp: "Menemukan luas daerah persegi panjang",
                atp: "Menemukan luas daerah persegi panjang",
              },
              {
                tp: "Menemukan luas persegi, segitiga, jajargenjang, belah ketupat, dan layang-layang",
                atp: "Menemukan luas persegi, segitiga, jajargenjang, belah ketupat, dan layang-layang",
              },
              {
                tp: "Menemukan luas daerah trapesium",
                atp: "Menemukan luas daerah trapesium",
              },
              {
                tp: "Mendekomposisi bangun datar gabungan dan menemukan luasnya",
                atp: "Mendekomposisi bangun datar gabungan dan menemukan luasnya",
              },
              {
                tp: "Mengenali hubungan keliling dan luas daerah bangun datar",
                atp: "Mengenali hubungan keliling dan luas daerah bangun datar",
              },
              {
                tp: "Menemukan sudut siku-siku di lingkungan sekitar",
                atp: "Menemukan sudut siku-siku di lingkungan sekitar",
              },
              {
                tp: "Memahami bagian-bagian sudut",
                atp: "Memahami bagian-bagian sudut",
              },
              {
                tp: "Menyebutkan jenis-jenis sudut",
                atp: "Menyebutkan jenis-jenis sudut",
              },
              {
                tp: "Mengelompokkan sudut berdasarkan ciri-cirinya",
                atp: "Mengelompokkan sudut berdasarkan ciri-cirinya",
              },
              {
                tp: "Mengukur besar sudut dengan menggunakan busur derajat",
                atp: "Mengukur besar sudut dengan menggunakan busur derajat",
              },
              {
                tp: "Membandingkan besar sudut",
                atp: "Membandingkan besar sudut",
              },
              {
                tp: "Melukis sudut dengan ukuran tertentu",
                atp: "Melukis sudut dengan ukuran tertentu",
              },
              {
                tp: "Memecahkan masalah yang berkaitan dengan sudut",
                atp: "Memecahkan masalah yang berkaitan dengan sudut",
              },
              {
                tp: "Membuat rancangan peta kota dengan menggunakan konsep sudut",
                atp: "Membuat rancangan peta kota dengan menggunakan konsep sudut",
              },
              {
                tp: "Menemukan syarat tiga ruas garis dapat membentuk segitiga",
                atp: "Menemukan syarat tiga ruas garis dapat membentuk segitiga",
              },
              {
                tp: "Membandingkan karakteristik segitiga berdasarkan besar sudutnya",
                atp: "Membandingkan karakteristik segitiga berdasarkan besar sudutnya",
              },
              {
                tp: "Menemukan jumlah sudut-sudut dalam sebuah segitiga",
                atp: "Menemukan jumlah sudut-sudut dalam sebuah segitiga",
              },
              {
                tp: "Membandingkan karakteristik segitiga berdasarkan panjang sisinya",
                atp: "Membandingkan karakteristik segitiga berdasarkan panjang sisinya",
              },
              {
                tp: "Membandingkan karakteristik berbagai jenis segi empat",
                atp: "Membandingkan karakteristik berbagai jenis segi empat",
              },
            ],
          },
          {
            elemen: "Analisis Data dan Peluang",
            cp: "Mengurutkan, membandingkan, menyajikan, dan menganalisis data banyak benda dan data hasil pengukuran dalam bentuk beberapa jenis diagram (piktogram, diagram batang, dan diagram garis) dan tabel frekuensi untuk mendapatkan informasi.",
            rows: [
              {
                tp: "Mengumpulkan data sederhana dari lingkungan sekitar",
                atp: "Mengumpulkan data sederhana dari lingkungan sekitar",
              },
              {
                tp: "Menyajikan hasil pengumpulan data menggunakan tabel frekuensi sederhana",
                atp: "Menyajikan hasil pengumpulan data menggunakan tabel frekuensi sederhana",
              },
              { tp: "Membuat piktogram", atp: "Membuat piktogram" },
              {
                tp: "Membaca data dari piktogram",
                atp: "Membaca data dari piktogram",
              },
              {
                tp: "Menganalisis data dari piktogram",
                atp: "Menganalisis data dari piktogram",
              },
              {
                tp: "Membuat diagram batang vertikal",
                atp: "Membuat diagram batang vertikal",
              },
              {
                tp: "Membuat diagram batang horizontal",
                atp: "Membuat diagram batang horizontal",
              },
              {
                tp: "Membuat diagram batang ganda",
                atp: "Membuat diagram batang ganda",
              },
              {
                tp: "Membaca data dari diagram batang",
                atp: "Membaca data dari diagram batang",
              },
              {
                tp: "Menganalisis data dari diagram batang",
                atp: "Menganalisis data dari diagram batang",
              },
            ],
          },
        ],
        liburGanjil: [
          ...expandRange(
            "2025-07-01",
            "2025-07-13",
            "Libur akhir tahun ajaran 2024/2025",
          ),
          ...expandRange(
            "2025-11-24",
            "2025-11-28",
            "Perkiraan Sumatif Akhir Semester Ganjil",
          ),
          ...expandRange("2025-12-01", "2025-12-05", "Lomba & Class Meeting"),
          ...expandRange(
            "2025-12-08",
            "2025-12-12",
            "Persiapan & Penyerahan Rapor",
          ),
          ...expandRange(
            "2025-12-15",
            "2025-12-31",
            "Libur Akhir Semester Ganjil",
          ),
        ],
        liburGenap: [
          ...expandRange(
            "2026-01-01",
            "2026-01-05",
            "Libur Akhir Semester Ganjil & Tahun Baru",
          ),
          {
            tanggal: "2026-01-16",
            keterangan: "Libur Isra' Mi'raj Nabi Muhammad SAW",
          },
          { tanggal: "2026-01-29", keterangan: "Libur Tahun Baru Imlek 2577" },
          ...expandRange(
            "2026-02-17",
            "2026-02-20",
            "Libur Menyambut Bulan Ramadhan",
          ),
          ...expandRange(
            "2026-03-15",
            "2026-04-01",
            "Libur Hari Raya Idul Fitri 1447 H & Nyepi",
          ),
          { tanggal: "2026-04-03", keterangan: "Libur Hari Jumat Agung" },
          {
            tanggal: "2026-05-01",
            keterangan: "Libur Hari Buruh Internasional",
          },
          ...expandRange("2026-05-11", "2026-05-15", "Perkiraan SASP"),
          { tanggal: "2026-05-21", keterangan: "Libur Kenaikan Isa Al Masih" },
          ...expandRange(
            "2026-06-10",
            "2026-06-30",
            "Persiapan & Libur Akhir Tahun Ajaran",
          ),
        ],
        tpGanjil: [
          {
            bab: "1",
            mp: "Bilangan cacah 100.000 dan nilai tempatnya",
            kode: "TP 1",
            tp: "Membaca bilangan cacah sampai 100.000",
            jp: 1,
            ev: false,
          },
          {
            bab: "1",
            mp: "Bilangan cacah 100.000 dan nilai tempatnya",
            kode: "TP 2",
            tp: "Menulis bilangan cacah sampai 100.000",
            jp: 1,
            ev: false,
          },
          {
            bab: "1",
            mp: "Bilangan cacah 100.000 dan nilai tempatnya",
            kode: "TP 3",
            tp: "Menentukan nilai tempat bilangan cacah sampai 100.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "1",
            mp: "Membandingkan dan mengurutkan bilangan sampai 100.000",
            kode: "TP 4",
            tp: "Membandingkan bilangan cacah sampai 100.000",
            jp: 1,
            ev: false,
          },
          {
            bab: "1",
            mp: "Membandingkan dan mengurutkan bilangan sampai 100.000",
            kode: "TP 5",
            tp: "Mengurutkan bilangan sampai 100.000",
            jp: 1,
            ev: false,
          },
          {
            bab: "1",
            mp: "Komposisi dan dekomposisi bilangan sampai 100.000",
            kode: "TP 6",
            tp: "Menentukan komposisi bilangan sampai 100.000",
            jp: 1,
            ev: false,
          },
          {
            bab: "1",
            mp: "Komposisi dan dekomposisi bilangan sampai 100.000",
            kode: "TP 7",
            tp: "Menentukan dekomposisi bilangan sampai 100.000",
            jp: 1,
            ev: false,
          },
          {
            bab: "1",
            mp: "Operasi bilangan sampai 100.000",
            kode: "TP 8",
            tp: "Menghitung penjumlahan bilangan sampai 100.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "1",
            mp: "Operasi bilangan sampai 100.000",
            kode: "TP 9",
            tp: "Menghitung pengurangan bilangan sampai 100.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "1",
            mp: "Operasi bilangan sampai 100.000",
            kode: "TP 10",
            tp: "Menghitung perkalian bilangan sampai 100.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "1",
            mp: "Operasi bilangan sampai 100.000",
            kode: "TP 11",
            tp: "Menghitung pembagian bilangan sampai 100.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "1",
            mp: "",
            kode: "S1",
            tp: "Sumatif Bab 1",
            jp: 2,
            ev: true,
          },
          {
            bab: "2",
            mp: "Kelipatan suatu bilangan",
            kode: "TP 12",
            tp: "Menentukan kelipatan bilangan",
            jp: 1,
            ev: false,
          },
          {
            bab: "2",
            mp: "Kelipatan persekutuan dan KPK",
            kode: "TP 13",
            tp: "Menentukan kelipatan persekutuan dua bilangan atau lebih",
            jp: 1,
            ev: false,
          },
          {
            bab: "2",
            mp: "Kelipatan persekutuan dan KPK",
            kode: "TP 14",
            tp: "Menentukan KPK dua bilangan atau lebih",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Kelipatan persekutuan dan KPK",
            kode: "TP 15",
            tp: "Menyelesaikan masalah yang berkaitan dengan KPK",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Faktor bilangan",
            kode: "TP 16",
            tp: "Menentukan faktor suatu bilangan",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Faktor persekutuan dan FPB",
            kode: "TP 17",
            tp: "Menentukan faktor persekutuan dua bilangan atau lebih",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Faktor persekutuan dan FPB",
            kode: "TP 18",
            tp: "Menentukan FPB suatu bilangan atau lebih",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Faktor persekutuan dan FPB",
            kode: "TP 19",
            tp: "Menyelesaikan masalah yang berkaitan dengan FPB",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Bilangan prima",
            kode: "TP 20",
            tp: "Memahami bilangan prima",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Bilangan prima",
            kode: "TP 21",
            tp: "Menentukan bilangan prima di bawah 100",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Bilangan prima",
            kode: "TP 22",
            tp: "Menentukan faktor prima suatu bilangan",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "Bilangan prima",
            kode: "TP 23",
            tp: "Menentukan KPK dan FPB dengan menggunakan bilangan prima",
            jp: 2,
            ev: false,
          },
          {
            bab: "2",
            mp: "",
            kode: "S2",
            tp: "Sumatif Bab 2",
            jp: 2,
            ev: true,
          },
          {
            bab: "3",
            mp: "Perbandingan pecahan",
            kode: "TP 24",
            tp: "Membandingkan bilangan pecahan",
            jp: 3,
            ev: false,
          },
          {
            bab: "3",
            mp: "Urutan bilangan pecahan",
            kode: "TP 25",
            tp: "Mengurutkan bilangan pecahan",
            jp: 3,
            ev: false,
          },
          {
            bab: "3",
            mp: "Penjumlahan pecahan",
            kode: "TP 26",
            tp: "Melakukan penjumlahan dengan penyebut sama",
            jp: 3,
            ev: false,
          },
          {
            bab: "3",
            mp: "Penjumlahan pecahan",
            kode: "TP 27",
            tp: "Melakukan penjumlahan dengan penyebut beda",
            jp: 3,
            ev: false,
          },
          {
            bab: "3",
            mp: "Pengurangan pecahan",
            kode: "TP 28",
            tp: "Melakukan pengurangan dengan penyebut sama",
            jp: 3,
            ev: false,
          },
          {
            bab: "3",
            mp: "Pengurangan pecahan",
            kode: "TP 29",
            tp: "Melakukan pengurangan dengan penyebut beda",
            jp: 3,
            ev: false,
          },
          {
            bab: "3",
            mp: "",
            kode: "S3",
            tp: "Sumatif Bab 3",
            jp: 2,
            ev: true,
          },
          {
            bab: "4",
            mp: "Keliling bangun datar",
            kode: "TP 30",
            tp: "Mengenali situasi soal yang melibatkan keliling bangun datar",
            jp: 1,
            ev: false,
          },
          {
            bab: "4",
            mp: "Keliling bangun datar",
            kode: "TP 31",
            tp: "Menemukan konsep keliling bangun datar sebagai jumlahan panjang sisi-sisinya",
            jp: 1,
            ev: false,
          },
          {
            bab: "4",
            mp: "Keliling segitiga",
            kode: "TP 32",
            tp: "Menemukan keliling berbagai jenis segitiga",
            jp: 3,
            ev: false,
          },
          {
            bab: "4",
            mp: "Keliling segi empat",
            kode: "TP 33",
            tp: "Menemukan keliling berbagai jenis segi empat",
            jp: 3,
            ev: false,
          },
          {
            bab: "4",
            mp: "Keliling segi beraturan",
            kode: "TP 34",
            tp: "Menemukan keliling segi lima, segi enam, dan segi delapan beraturan",
            jp: 2,
            ev: false,
          },
          {
            bab: "4",
            mp: "Keliling bangun datar gabungan",
            kode: "TP 35",
            tp: "Mendekomposisi bangun datar gabungan dan menemukan kelilingnya",
            jp: 3,
            ev: false,
          },
          {
            bab: "4",
            mp: "",
            kode: "S4",
            tp: "Sumatif Bab 4",
            jp: 2,
            ev: true,
          },
          {
            bab: "5",
            mp: "Luas daerah bangun datar",
            kode: "TP 36",
            tp: "Mengenali situasi soal yang melibatkan luas daerah bangun datar",
            jp: 2,
            ev: false,
          },
          {
            bab: "5",
            mp: "Satuan luas",
            kode: "TP 37",
            tp: "Menemukan konsep luas daerah bangun datar",
            jp: 2,
            ev: false,
          },
          {
            bab: "5",
            mp: "Luas persegi panjang",
            kode: "TP 38",
            tp: "Menemukan luas daerah persegi panjang",
            jp: 2,
            ev: false,
          },
          {
            bab: "5",
            mp: "Luas berbagai bangun datar",
            kode: "TP 39",
            tp: "Menemukan luas persegi, segitiga, jajargenjang, belah ketupat, dan layang-layang",
            jp: 3,
            ev: false,
          },
          {
            bab: "5",
            mp: "Luas berbagai bangun datar",
            kode: "TP 40",
            tp: "Menemukan luas daerah trapesium",
            jp: 3,
            ev: false,
          },
          {
            bab: "5",
            mp: "Luas bangun datar gabungan",
            kode: "TP 41",
            tp: "Mendekomposisi bangun datar gabungan dan menemukan luasnya",
            jp: 2,
            ev: false,
          },
          {
            bab: "5",
            mp: "Hubungan keliling dan luas",
            kode: "TP 42",
            tp: "Mengenali hubungan keliling dan luas daerah bangun datar",
            jp: 2,
            ev: false,
          },
          {
            bab: "5",
            mp: "",
            kode: "S5",
            tp: "Sumatif Bab 5",
            jp: 2,
            ev: true,
          },
        ],
        tpGenap: [
          {
            bab: "6",
            mp: "Sudut siku-siku",
            kode: "TP 43",
            tp: "Menemukan sudut siku-siku di lingkungan sekitar",
            jp: 2,
            ev: false,
          },
          {
            bab: "6",
            mp: "Pengertian dan bagian-bagian sudut",
            kode: "TP 44",
            tp: "Memahami bagian-bagian sudut",
            jp: 1,
            ev: false,
          },
          {
            bab: "6",
            mp: "Pengertian dan bagian-bagian sudut",
            kode: "TP 45",
            tp: "Menyebutkan jenis-jenis sudut",
            jp: 1,
            ev: false,
          },
          {
            bab: "6",
            mp: "Pengertian dan bagian-bagian sudut",
            kode: "TP 46",
            tp: "Mengelompokkan sudut berdasarkan ciri-cirinya",
            jp: 1,
            ev: false,
          },
          {
            bab: "6",
            mp: "Mengukur dan membandingkan sudut",
            kode: "TP 47",
            tp: "Mengukur besar sudut dengan menggunakan busur derajat",
            jp: 2,
            ev: false,
          },
          {
            bab: "6",
            mp: "Mengukur dan membandingkan sudut",
            kode: "TP 48",
            tp: "Membandingkan besar sudut",
            jp: 2,
            ev: false,
          },
          {
            bab: "6",
            mp: "Melukis sudut",
            kode: "TP 49",
            tp: "Melukis sudut dengan ukuran tertentu",
            jp: 2,
            ev: false,
          },
          {
            bab: "6",
            mp: "Melukis sudut",
            kode: "TP 50",
            tp: "Memecahkan masalah yang berkaitan dengan sudut",
            jp: 2,
            ev: false,
          },
          {
            bab: "6",
            mp: "Melukis sudut",
            kode: "TP 51",
            tp: "Membuat rancangan peta kota dengan menggunakan konsep sudut",
            jp: 2,
            ev: false,
          },
          {
            bab: "6",
            mp: "",
            kode: "S6",
            tp: "Sumatif Bab 6",
            jp: 2,
            ev: true,
          },
          {
            bab: "7",
            mp: "Syarat tiga ruas garis membentuk segitiga",
            kode: "TP 52",
            tp: "Menemukan syarat tiga ruas garis dapat membentuk segitiga",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Karakteristik segitiga berdasarkan besar sudutnya",
            kode: "TP 53",
            tp: "Membandingkan karakteristik segitiga berdasarkan besar sudutnya",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Jumlah sudut-sudut dalam segitiga",
            kode: "TP 54",
            tp: "Menemukan jumlah sudut-sudut dalam sebuah segitiga",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Karakteristik segitiga berdasarkan panjang sisinya",
            kode: "TP 55",
            tp: "Membandingkan karakteristik segitiga berdasarkan panjang sisinya",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Membandingkan ciri-ciri segi empat",
            kode: "TP 56",
            tp: "Mengingat kembali karakteristik trapesium",
            jp: 1,
            ev: false,
          },
          {
            bab: "7",
            mp: "Membandingkan ciri-ciri segi empat",
            kode: "TP 57",
            tp: "Membandingkan karakteristik jajargenjang dan trapesium",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Membandingkan ciri-ciri segi empat",
            kode: "TP 58",
            tp: "Membandingkan karakteristik persegi panjang dan jajargenjang",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Membandingkan ciri-ciri segi empat",
            kode: "TP 59",
            tp: "Membandingkan karakteristik belah ketupat dan jajargenjang",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Membandingkan ciri-ciri segi empat",
            kode: "TP 60",
            tp: "Membandingkan karakteristik persegi dan belah ketupat",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Membandingkan ciri-ciri segi empat",
            kode: "TP 61",
            tp: "Membandingkan karakteristik persegi dan persegi panjang",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "Membandingkan ciri-ciri segi empat",
            kode: "TP 62",
            tp: "Membandingkan karakteristik layang-layang dan belah ketupat",
            jp: 2,
            ev: false,
          },
          {
            bab: "7",
            mp: "",
            kode: "S7",
            tp: "Sumatif Bab 7",
            jp: 2,
            ev: true,
          },
          {
            bab: "8",
            mp: "Mengumpulkan dan menyajikan data",
            kode: "TP 63",
            tp: "Mengumpulkan data sederhana dari lingkungan sekitar",
            jp: 3,
            ev: false,
          },
          {
            bab: "8",
            mp: "Mengumpulkan dan menyajikan data",
            kode: "TP 64",
            tp: "Menyajikan hasil pengumpulan data menggunakan tabel frekuensi sederhana",
            jp: 2,
            ev: false,
          },
          {
            bab: "8",
            mp: "Membuat piktogram",
            kode: "TP 65",
            tp: "Membuat piktogram",
            jp: 2,
            ev: false,
          },
          {
            bab: "8",
            mp: "Membuat piktogram",
            kode: "TP 66",
            tp: "Membaca data dari piktogram",
            jp: 2,
            ev: false,
          },
          {
            bab: "8",
            mp: "Membuat piktogram",
            kode: "TP 67",
            tp: "Menganalisis data dari piktogram",
            jp: 3,
            ev: false,
          },
          {
            bab: "8",
            mp: "Diagram batang",
            kode: "TP 68",
            tp: "Membuat diagram batang vertikal",
            jp: 2,
            ev: false,
          },
          {
            bab: "8",
            mp: "Diagram batang",
            kode: "TP 69",
            tp: "Membuat diagram batang horizontal",
            jp: 2,
            ev: false,
          },
          {
            bab: "8",
            mp: "Diagram batang",
            kode: "TP 70",
            tp: "Membuat diagram batang ganda",
            jp: 2,
            ev: false,
          },
          {
            bab: "8",
            mp: "Diagram batang",
            kode: "TP 71",
            tp: "Membaca data dari diagram batang",
            jp: 2,
            ev: false,
          },
          {
            bab: "8",
            mp: "Diagram batang",
            kode: "TP 72",
            tp: "Menganalisis data dari diagram batang",
            jp: 3,
            ev: false,
          },
          {
            bab: "8",
            mp: "",
            kode: "S8",
            tp: "Sumatif Bab 8",
            jp: 2,
            ev: true,
          },
          {
            bab: "9",
            mp: "Bilangan cacah 1.000.000 dan nilai tempatnya",
            kode: "TP 73",
            tp: "Membaca bilangan cacah sampai 1.000.000",
            jp: 1,
            ev: false,
          },
          {
            bab: "9",
            mp: "Bilangan cacah 1.000.000 dan nilai tempatnya",
            kode: "TP 74",
            tp: "Menulis bilangan cacah sampai 1.000.000",
            jp: 1,
            ev: false,
          },
          {
            bab: "9",
            mp: "Bilangan cacah 1.000.000 dan nilai tempatnya",
            kode: "TP 75",
            tp: "Menentukan nilai tempat bilangan cacah sampai 1.000.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "9",
            mp: "Membandingkan dan mengurutkan bilangan sampai 1.000.000",
            kode: "TP 76",
            tp: "Membandingkan bilangan cacah sampai 1.000.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "9",
            mp: "Membandingkan dan mengurutkan bilangan sampai 1.000.000",
            kode: "TP 77",
            tp: "Mengurutkan bilangan sampai 1.000.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "9",
            mp: "Komposisi dan dekomposisi bilangan sampai 1.000.000",
            kode: "TP 78",
            tp: "Menentukan komposisi bilangan sampai 1.000.000",
            jp: 2,
            ev: false,
          },
          {
            bab: "9",
            mp: "Komposisi dan dekomposisi bilangan sampai 1.000.000",
            kode: "TP 79",
            tp: "Menentukan dekomposisi bilangan sampai 1.000.000",
            jp: 3,
            ev: false,
          },
          {
            bab: "9",
            mp: "",
            kode: "S9",
            tp: "Sumatif Bab 9",
            jp: 2,
            ev: true,
          },
        ],
      };

      // ============================================================
      // STATE
      // ============================================================
      let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      let isGenerated = false;

      // ============================================================
      // ATP  -  ALUR TUJUAN PEMBELAJARAN
      // ============================================================
            function cleanCPText(text) {
        if (!text) return "";
        let s = text;
        // 1. Remove bracketed references like [12-15] or [5, 8] or [5-7] or []
        s = s.replace(/\[\s*\d*(?:[\-,]\s*\d+)*\s*\]/g, "");
        s = s.replace(/\[\s*\]/g, "");
        // 2. Remove common preamble phrases
        s = s.replace(/^(?:pada akhir fase [a-f],?\s*(?:peserta didik|murid)\s*(?:dapat|mampu)?|pada akhir fase ini,?\s*(?:peserta didik|murid)\s*(?:dapat|mampu)?|secara umum murid|murid mampu|murid dapat|peserta didik mampu|peserta didik dapat)\s+/i, "");
        // 3. Remove standalone 'Murid' at start of sentences and capitalize next character
        s = s.replace(/^Murid\s+(\w)/i, (match, p1) => p1.toUpperCase());
        s = s.replace(/([\.\;\!\?]\s*)Murid\s+(\w)/gi, (match, p1, p2) => p1 + p2.toUpperCase());
        s = s.replace(/\bmurid\b\s*/gi, "");
        // 4. Capitalize after punctuation or at start
        s = s.replace(/(^\w|[\.\;\!\?]\s+\w)/g, (match) => match.toUpperCase());
        // 5. Clean extra spaces or spaces before punctuation
        s = s.replace(/\s+/g, " ").replace(/\s+([\.\;\!\?\,])/g, "").trim();
        return s;
      }

      function renderAtpRowHtml(ei, ri, row, totalRows, isNew = false) {
        return `
          <div class="atp-tp-row ${isNew ? "tp-row-new" : ""}" id="atp-row-${ei}-${ri}">
            <span style="font-size:var(--fs-sm);color:var(--text-light);min-width:24px;text-align:right;font-weight:600;">${ri + 1}.</span>
            <textarea rows="1"
              id="atp-textarea-${ei}-${ri}"
              placeholder="Tujuan Pembelajaran..."
              oninput="this.style.height='auto';this.style.height=(this.scrollHeight+2)+'px';"
              onchange="state.atpData[${ei}].rows[${ri}].tp=this.value;state.atpData[${ei}].rows[${ri}].atp=this.value;scheduleSave();markDirty();"
              style="flex:1;resize:none;overflow:hidden;line-height:1.4;">${escH(row.tp)}</textarea>
            
            <button type="button" onclick="moveAtpRow(${ei},${ri},-1)" ${ri === 0 ? "disabled" : ""} title="Naik" class="btn-sm" style="flex:unset;width:28px;height:28px;padding:0;">
              <i class="material-symbols-rounded" style="font-size:18px;" data-lucide="arrow-up"></i>
            </button>
            <button type="button" onclick="moveAtpRow(${ei},${ri},1)" ${ri === totalRows - 1 ? "disabled" : ""} title="Turun" class="btn-sm" style="flex:unset;width:28px;height:28px;padding:0;">
              <i class="material-symbols-rounded" style="font-size:18px;" data-lucide="arrow-down"></i>
            </button>
            <button type="button" onclick="removeAtpRow(${ei},${ri})" title="Hapus TP" class="btn-del">
              <i class="material-symbols-rounded" style="font-size:18px;" data-lucide="trash"></i>
            </button>
          </div>
        `;
      }

      function renderAtpInput() {
        const kelas = currentKelasId ? daftarKelas.find((k) => k.id === currentKelasId) : null;
        const mapel = getMapelValue("f-mapel", "f-mapel-manual") || (kelas ? kelas.mapel : "");
        const fase = (document.getElementById("f-fase")?.value || (kelas ? kelas.fase : "")).trim();

        // Auto-populate CP & TP automatically if state.atpData is empty and matching CP standard is found
        if ((!state.atpData || state.atpData.length === 0) && mapel && fase) {
          const autoData = getAutoCPData(mapel, fase);
          if (autoData && autoData.length > 0) {
            state.atpData = JSON.parse(JSON.stringify(autoData));
            scheduleSave();
            markDirty();
            if (typeof showSaveIndicator === 'function') {
              showSaveIndicator("CP & TP Berhasil Terisi Otomatis (Regulasi Terbaru)! ✨", "success");
            }
          }
        }

        const arr = state.atpData || [];
        
        // Automatically clean existing CP texts & extract subElemen if applicable
        let changed = false;
        arr.forEach(el => {
          if (el.cp) {
            const cleaned = cleanCPText(el.cp);
            if (cleaned !== el.cp) {
              el.cp = cleaned;
              changed = true;
            }
          }
          if (mapel.toLowerCase().includes("kristen") && el.elemen && el.elemen.includes(" - ")) {
            const parts = el.elemen.split(" - ");
            el.elemen = parts[0].trim();
            el.subElemen = parts.slice(1).join(" - ").trim();
            changed = true;
          }
        });
        if (changed) {
          scheduleSave();
        }

        let totalRows = arr.reduce((s, e) => s + e.rows.length, 0);
        const cntEl = document.getElementById("cnt-atp");
        if (cntEl)
          cntEl.textContent = arr.length + " elemen | " + totalRows + " TP";

        // Render dynamic status banner
        const suggestionEl = document.getElementById("atp-autofill-suggestion");
        if (suggestionEl) {
          suggestionEl.innerHTML = "";
        }
        const wrap = document.getElementById("atp-cp-table-wrap");
        if (!wrap) return;

        if (arr.length === 0) {
          wrap.innerHTML = `<div class="empty" style="padding:40px;"><i class="material-symbols-rounded" style="font-size:48px; color:var(--text-light); margin-bottom:12px; display:block;" data-lucide="book-open"></i><h3>Belum ada elemen</h3><p>Klik <strong>Tambah Elemen</strong> untuk memulai.</p></div>`;
          if (typeof lucide !== 'undefined') {
            lucide.createIcons({
              attrs: { class: 'lucide' },
              node: wrap
            });
          }
          return;
        }

        wrap.innerHTML = `<div style="display:flex;flex-direction:column;gap:18px;">
    ${arr
      .map(
        (el, ei) => `
      <div class="card card-tp" style="margin-bottom:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <div class="sec-title" style="margin-bottom:0;">Elemen ${ei + 1}</div>
          <button onclick="removeAtpElemen(${ei})" class="btn-del" title="Hapus"><i class="material-symbols-rounded" style="font-size:18px;" data-lucide="trash"></i></button>
        </div>
        
        <div class="form-grid" style="display:flex;flex-direction:column;gap:14px;">
          <div class="fg">
            <label>Nama Elemen</label>
            <input type="text" value="${escH(el.elemen)}"
              placeholder="Contoh: Bilangan, Aljabar, dll..."
              onchange="state.atpData[${ei}].elemen=this.value;scheduleSave();markDirty();">
          </div>
          
          <div class="fg">
            <label>Sub Elemen (Opsional)</label>
            <input type="text" value="${escH(el.subElemen || "")}"
              placeholder="Subelemen untuk mapel tertentu..."
              onchange="state.atpData[${ei}].subElemen=this.value;scheduleSave();markDirty();">
          </div>
          
          <div class="fg">
            <label>Capaian Pembelajaran</label>
            <textarea rows="2"
              placeholder="Deskripsi Capaian Pembelajaran untuk elemen ini..."
              oninput="this.style.height='auto';this.style.height=(this.scrollHeight+2)+'px';"
              onchange="state.atpData[${ei}].cp=this.value;scheduleSave();markDirty();"
              style="resize:none;overflow:hidden;">${escH(el.cp)}</textarea>
          </div>
          
          <div class="fg">
            <div class="atp-tp-card-header">
              <label style="margin-bottom:0;font-weight:600;">Tujuan Pembelajaran (TP)</label>
              <div class="atp-tp-btn-group" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <button type="button" onclick="addAtpRow(${ei})" class="btn-add-tp" title="Tambah 1 Tujuan Pembelajaran baru">
                  <i class="material-symbols-rounded" style="font-size:15px;" data-lucide="plus"></i>
                  <span>Tambah TP</span>
                </button>
                <button type="button" onclick="openBulkAddTPModal(${ei})" class="btn-add-tp btn-add-tp-bulk" title="Tambah banyak Tujuan Pembelajaran sekaligus per baris">
                  <i class="material-symbols-rounded" style="font-size:15px;" data-lucide="list-plus"></i>
                  <span>Tambah Sekaligus</span>
                </button>
                <button type="button" onclick="clearAtpRows(${ei})" class="btn-add-tp btn-add-tp-del" title="Hapus semua TP pada elemen ini untuk menginput TP kustom sendiri">
                  <i class="material-symbols-rounded" style="font-size:15px;" data-lucide="trash-2"></i>
                  <span>Hapus TP</span>
                </button>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,0.02);padding:14px;border-radius:10px;border:1px dashed rgba(255,255,255,0.15);">
              <div id="atp-tp-list-${ei}" style="display:flex;flex-direction:column;gap:8px;">
                ${el.rows && el.rows.length > 0
                  ? el.rows.map((row, ri) => renderAtpRowHtml(ei, ri, row, el.rows.length)).join("")
                  : `<div class="atp-tp-empty-msg" style="font-size:var(--fs-sm);color:var(--text-light);padding:8px 4px;font-style:italic;display:flex;align-items:center;gap:6px;">
                      <i class="material-symbols-rounded" style="font-size:16px;opacity:0.7;" data-lucide="info"></i>
                      <span>Belum ada Tujuan Pembelajaran. Klik <strong>Tambah TP</strong> atau <strong>Tambah Sekaligus</strong> untuk mengisi TP kustom Anda.</span>
                    </div>`
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
      )
      .join("")}
  </div>`;

        // Auto-resize textareas right after rendering, only if visible
        setTimeout(() => {
          document
            .querySelectorAll("#atp-cp-table-wrap textarea")
            .forEach((ta) => {
              if (ta.offsetParent !== null) {
                ta.style.height = "auto";
                ta.style.height = ta.scrollHeight + 2 + "px";
              }
            });
          if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons({
              attrs: { class: "lucide" },
              node: wrap
            });
          }
        }, 0);
      }

      function downloadTemplateCP() {
        const wsData = [
          ["Elemen", "Sub Elemen (Opsional)", "Capaian Pembelajaran", "Tujuan Pembelajaran"]
        ];
        
        if (state.atpData.length === 0) {
          wsData.push(["Contoh Elemen", "", "Contoh deskripsi capaian pembelajaran...", "Contoh tujuan pembelajaran 1"]);
          wsData.push(["", "", "", "Contoh tujuan pembelajaran 2"]);
        } else {
          state.atpData.forEach(el => {
            if (el.rows && el.rows.length > 0) {
              el.rows.forEach((row, rowIndex) => {
                wsData.push([
                  rowIndex === 0 ? el.elemen : "",
                  rowIndex === 0 ? (el.subElemen || "") : "",
                  rowIndex === 0 ? el.cp : "",
                  row.tp
                ]);
              });
            } else {
              wsData.push([el.elemen, el.subElemen || "", el.cp, ""]);
            }
          });
        }
        
        const du = typeof getDU === "function" ? getDU() : {};
        const kelasStr = (du.kelas || "kelas").toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        const rombelStr = (du.rombel || "").toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        const mapelStr = (du.mapel || "mapel").toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        
        let fileParts = ["template_cp", kelasStr];
        if (rombelStr) fileParts.push(rombelStr);
        fileParts.push(mapelStr);
        const fileName = `${fileParts.filter(Boolean).join("_")}.xlsx`;

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Capaian Pembelajaran");
        XLSX.writeFile(wb, fileName);
      }

      function handleUploadCP(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (json.length > 1) {
              const newAtpData = [];
              let currentElemen = null;
              
              const headers = json[0] || [];
              const hasSubElemenColumn = headers.length >= 4 && String(headers[1] || "").toLowerCase().includes("sub");
              
              for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row || row.length === 0) continue;
                
                let elemenName, subElemenText, cpText, tpText;
                
                if (hasSubElemenColumn) {
                  if (row[0] === undefined && row[1] === undefined && row[2] === undefined && row[3] === undefined) continue;
                  elemenName = row[0] ? String(row[0]).trim() : "";
                  subElemenText = row[1] ? String(row[1]).trim() : "";
                  cpText = row[2] ? String(row[2]).trim() : "";
                  tpText = row[3] ? String(row[3]).trim() : "";
                } else {
                  if (row[0] === undefined && row[1] === undefined && row[2] === undefined) continue;
                  elemenName = row[0] ? String(row[0]).trim() : "";
                  subElemenText = "";
                  cpText = row[1] ? String(row[1]).trim() : "";
                  tpText = row[2] ? String(row[2]).trim() : "";
                }
                
                if (elemenName || cpText || subElemenText) {
                  currentElemen = {
                    elemen: elemenName,
                    subElemen: subElemenText,
                    cp: cpText,
                    rows: []
                  };
                  newAtpData.push(currentElemen);
                }
                
                if (currentElemen && tpText) {
                  currentElemen.rows.push({
                    tp: tpText,
                    atp: ""
                  });
                }
              }
              
              if (newAtpData.length > 0) {
                if (confirm("Data berhasil dibaca. Apakah Anda yakin ingin mengganti data Capaian Pembelajaran saat ini dengan data dari Excel?")) {
                  state.atpData = newAtpData;
                  renderAtpInput();
                  scheduleSave();
                  markDirty();
                  alert("Data Capaian Pembelajaran berhasil diimpor!");
                }
              } else {
                alert("Tidak ada data yang valid dalam file Excel.");
              }
            } else {
              alert("File Excel kosong atau format tidak sesuai.");
            }
          } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat membaca file Excel. Pastikan file valid.");
          }
          event.target.value = '';
        };
        reader.readAsArrayBuffer(file);
      }
      async function handleUploadCPJson(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (e) {
          try {
            const data = JSON.parse(e.target.result);
            
            // Validation
            if (!data || typeof data !== "object") {
              throw new Error("Format JSON harus berupa object");
            }
            if (!data.sumber && !data.lampiran_II && !data.lampiran_III) {
              throw new Error("Format JSON tidak valid sebagai database Capaian Pembelajaran. Harus memiliki struktur Capaian Pembelajaran Kurikulum Merdeka.");
            }

            // Ask confirmation
            const ok = await confirmAsync(`Apakah Anda yakin ingin mengimpor database CP baru dari "${file.name}"?\nDatabase ini akan menggantikan database standar yang saat ini sedang aktif.`);
            if (!ok) {
              event.target.value = '';
              return;
            }

            // Save to localStorage
            localStorage.setItem('custom_cp_database', JSON.stringify(data));
            
            // Reload database
            loadBSKAP046Database();

            await showCustomAlert("Berhasil Impor", "Database CP (JSON) kustom berhasil diimpor dan disimpan ke penyimpanan lokal perangkat ini!", "success");
            
            // Re-render current page if applicable
            if (typeof renderAtpInput === 'function') {
              renderAtpInput();
            }
          } catch (err) {
            console.error(err);
            await showCustomAlert("Gagal Impor", "Gagal membaca file JSON: " + err.message, "error");
          }
          event.target.value = '';
        };
        reader.readAsText(file);
      }

      async function resetCPJsonDatabase() {
        const ok = await confirmAsync("Apakah Anda yakin ingin menghapus database CP kustom dan mengembalikan ke database standar bawaan Promesta.id?");
        if (!ok) return;

        localStorage.removeItem('custom_cp_database');
        
        // Reload database
        loadBSKAP046Database();

        await showCustomAlert("Reset Berhasil", "Database Capaian Pembelajaran berhasil dikembalikan ke pengaturan standar bawaan.", "success");
        
        // Re-render if applicable
        if (typeof renderAtpInput === 'function') {
          renderAtpInput();
        }
      }

      function downloadTemplateTP() {
        const wsData = [
          ["Semester (Ganjil/Genap)", "Bab", "Materi Pokok", "Kode TP", "Tujuan Pembelajaran", "Evaluasi/Sumatif? (Ya/Tidak)", "JP"]
        ];
        
        const pushTp = (arr, semLabel) => {
          if (arr.length > 0) {
            arr.forEach(t => {
              wsData.push([
                semLabel,
                t.bab || "",
                t.mp || "",
                t.kode || "",
                t.tp || "",
                t.ev ? "Ya" : "Tidak",
                t.jp || 0
              ]);
            });
          }
        };

        if (state.tpGanjil.length === 0 && state.tpGenap.length === 0) {
          wsData.push(["Ganjil", "1", "Bilangan Cacah", "TP 1", "Membaca bilangan", "Tidak", "2"]);
          wsData.push(["Ganjil", "1", "Bilangan Cacah", "Sumatif 1", "Sumatif Bab 1", "Ya", "2"]);
          wsData.push(["Genap", "3", "Pecahan", "TP 5", "Mengenal pecahan", "Tidak", "2"]);
        } else {
          pushTp(state.tpGanjil, "Ganjil");
          pushTp(state.tpGenap, "Genap");
        }
        
        const du = typeof getDU === "function" ? getDU() : {};
        const kelasStr = (du.kelas || "kelas").toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        const rombelStr = (du.rombel || "").toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        const mapelStr = (du.mapel || "mapel").toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        
        let fileParts = ["template_tp", kelasStr];
        if (rombelStr) fileParts.push(rombelStr);
        fileParts.push(mapelStr);
        const fileName = `${fileParts.filter(Boolean).join("_")}.xlsx`;

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Tujuan Pembelajaran");
        XLSX.writeFile(wb, fileName);
      }

      function handleUploadTP(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (json.length > 1) {
              const newGanjil = [];
              const newGenap = [];
              const allOpts = getAllTPOptions();
              const validTPs = new Set(allOpts.map(o => o.label.toLowerCase()));
              const missingTPs = new Set();
              
              for (let i = 1; i < json.length; i++) {
                const row = json[i];
                if (!row || row.length === 0) continue;
                
                const semRaw = String(row[0] || "").toLowerCase().trim();
                const isGenap = semRaw === "genap" || semRaw === "2";
                
                const evRaw = String(row[5] || "").toLowerCase().trim();
                const isEv = evRaw === "ya" || evRaw === "y" || evRaw === "true" || evRaw === "1";
                
                const tpObj = {
                  bab: String(row[1] || "").trim(),
                  mp: String(row[2] || "").trim(),
                  kode: String(row[3] || "").trim(),
                  tp: String(row[4] || "").trim(),
                  ev: isEv,
                  jp: parseInt(row[6]) || 0
                };
                
                if (tpObj.bab || tpObj.mp || tpObj.tp || tpObj.kode) {
                  if (!tpObj.ev && tpObj.tp && !validTPs.has(tpObj.tp.toLowerCase())) {
                    missingTPs.add(tpObj.tp);
                  }
                  if (isGenap) {
                    newGenap.push(tpObj);
                  } else {
                    newGanjil.push(tpObj);
                  }
                }
              }
              
              if (newGanjil.length > 0 || newGenap.length > 0) {
                if (missingTPs.size > 0) {
                  const msg = `Ditemukan ${missingTPs.size} TP yang tidak ada di data Capaian Pembelajaran.\n\nApakah Anda ingin melanjutkan impor dan menambahkan TP baru tersebut ke Capaian Pembelajaran? (Pilih Batal untuk membatalkan impor)`;
                  if (!confirm(msg)) {
                    event.target.value = "";
                    return;
                  }
                  
                  const newElement = {
                    elemen: "TP Impor Excel",
                    cp: "Diimpor secara otomatis",
                    rows: Array.from(missingTPs).map(tp => ({ tp: tp, atp: "" }))
                  };
                  state.atpData.push(newElement);
                  renderAtpInput();
                }

                if (confirm("Data TP siap diimpor. Ganti data TP saat ini dengan data dari Excel?")) {
                  state.tpGanjil = newGanjil;
                  state.tpGenap = newGenap;
                  renderTP("ganjil");
                  renderTP("genap");
                  renderTPCombined();
                  syncATPFromTPOrder();
                  scheduleSave();
                  markDirty();
                  alert("Data TP berhasil diimpor!");
                }
              } else {
                alert("Tidak ada data TP valid ditemukan di file Excel.");
              }
            } else {
              alert("Format Excel kosong atau tidak sesuai.");
            }
          } catch (err) {
            console.error(err);
            alert("Gagal membaca file Excel. Pastikan format sesuai template.");
          }
          event.target.value = "";
        };
        reader.readAsArrayBuffer(file);
      }

      function addAtpElemen() {
        state.atpData.push({ elemen: "", subElemen: "", cp: "", rows: [{ tp: "", atp: "" }] });
        renderAtpInput();
        scheduleSave();
        markDirty();
      }

      

      function triggerMapelChange() {
        const mapel = getMapelValue("f-mapel", "f-mapel-manual").trim();
        const fase = (document.getElementById("f-fase")?.value || "").trim();
        const kelas = (document.getElementById("f-kelas")?.value || "").trim();
        const rombel = (document.getElementById("f-rombel")?.value || "").trim();
        const lbl = document.getElementById("sidebar-kelas-label");
        if (lbl) {
          lbl.textContent = `${mapel} · ${kelas}`;
        }

        const prevMapel = (state.savedMapel !== undefined ? state.savedMapel : (currentKelasId ? (daftarKelas.find((k) => k.id === currentKelasId)?.mapel || "") : "")).trim();
        const prevFase = (state.savedFase !== undefined ? state.savedFase : (currentKelasId ? (daftarKelas.find((k) => k.id === currentKelasId)?.fase || "") : "")).trim();

        const isMapelChanged = (prevMapel.toLowerCase() !== mapel.toLowerCase());
        const isFaseChanged = (prevFase.toLowerCase() !== fase.toLowerCase());

        if (isMapelChanged || isFaseChanged) {
          state.savedMapel = mapel;
          state.savedFase = fase;

          if (mapel && fase) {
            const autoData = getAutoCPData(mapel, fase);
            if (autoData && autoData.length > 0) {
              state.atpData = JSON.parse(JSON.stringify(autoData));
            } else {
              // Custom / non-standard subject -> clear CP immediately so no leftover CP from previous subject!
              state.atpData = [];
            }
          } else {
            state.atpData = [];
          }
        }

        if (currentKelasId) {
          const idx = daftarKelas.findIndex((k) => k.id === currentKelasId);
          if (idx >= 0) {
            daftarKelas[idx].mapel = mapel;
            daftarKelas[idx].fase = fase;
            daftarKelas[idx].kelas = kelas;
            daftarKelas[idx].rombel = rombel;
            daftarKelas[idx].atpData = state.atpData;
          }
        }
        renderAtpInput();
        scheduleSave();
        markDirty();
      }

      // Kumpulkan semua TP dari atpData untuk dropdown
      function getAllTPOptions() {
        const opts = [];
        for (const el of state.atpData) {
          for (const row of el.rows) {
            if (row.tp && row.tp.trim())
              opts.push({ label: row.tp.trim(), elemen: el.elemen });
          }
        }
        return opts;
      }

      function autoPopulateTPFromCP(force = false) {
        if (!force && ((state.tpGanjil && state.tpGanjil.length > 0) || (state.tpGenap && state.tpGenap.length > 0))) {
          return;
        }

        const allTps = [];
        if (!state.atpData || state.atpData.length === 0) {
          if (force) {
            alert("Data Capaian Pembelajaran (CP) masih kosong.\nSilakan isi otomatis data CP di tab 'Capaian Pembelajaran' terlebih dahulu.");
          }
          return;
        }

        state.atpData.forEach((el) => {
          if (el.rows && el.rows.length > 0) {
            el.rows.forEach((row) => {
              if (row.tp && row.tp.trim()) {
                allTps.push({
                  tp: row.tp.trim(),
                  elemen: el.elemen
                });
              }
            });
          }
        });

        if (allTps.length === 0) {
          if (force) {
            alert("Tidak ditemukan butir Tujuan Pembelajaran (TP) di tab 'Capaian Pembelajaran'. Silakan periksa kembali data CP Anda.");
          }
          return;
        }

        const half = Math.ceil(allTps.length / 2);
        const ganjilSource = allTps.slice(0, half);
        const genapSource = allTps.slice(half);

        state.tpGanjil = ganjilSource.map((item, idx) => {
          const num = idx + 1;
          return {
            bab: "",
            mp: "",
            kode: `TP ${num}`,
            tp: item.tp,
            jp: 2,
            ev: false
          };
        });

        state.tpGenap = genapSource.map((item, idx) => {
          const num = half + idx + 1;
          return {
            bab: "",
            mp: "",
            kode: `TP ${num}`,
            tp: item.tp,
            jp: 2,
            ev: false
          };
        });

        renderTPCombined();
        renderTP("ganjil");
        renderTP("genap");
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();

        if (force) {
          showSaveIndicator("Pemetaan TP Berhasil Diisi Otomatis! ✨", "success");
        }
      }

       async function triggerAutoPopulateTP() {
        const hasData = (state.tpGanjil && state.tpGanjil.length > 0) || (state.tpGenap && state.tpGenap.length > 0);
        if (hasData) {
          const ok = await confirmAsync("Apakah Anda yakin ingin mengisi ulang Pemetaan TP dari data Capaian Pembelajaran? Semua data Pemetaan TP saat ini akan ditimpa dan dibagi rata ke kedua semester.");
          if (!ok) {
            return;
          }
        }
        autoPopulateTPFromCP(true);
      }

      // Tambah TP baru via modal picker
      function addTPDropdown(sem) {
        const opts = getAllTPOptions();
        if (opts.length === 0) {
          alert("Belum ada TP di halaman Capaian Pembelajaran.\nTambahkan dulu di tab Capaian Pembelajaran.");
          return;
        }

        let existing = document.getElementById("tp-picker-modal");
        if (existing) existing.remove();

        const modal = document.createElement("div");
        modal.id = "tp-picker-modal";
        modal.style.cssText =
          "position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9990;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);";

        // Exclude TP yang sudah dipakai di KEDUA semester (pool tahunan)
        const usedInSem = new Set(
          [...state.tpGanjil, ...state.tpGenap]
            .filter((t) => !t.ev && t.tp)
            .map((t) => t.tp),
        );
        const availableOpts = opts.filter((o) => !usedInSem.has(o.label));
        
        if (availableOpts.length === 0) {
          modal.remove();
          alert("Semua TP sudah digunakan di semester.");
          return;
        }

        const nextNum = [...state.tpGanjil, ...state.tpGenap].filter(t => !t.ev).length + 1;
        const defaultKode = `TP ${nextNum}`;

        const tpOptionsHtml = availableOpts.map(o => `<option value="${escH(o.label)}">${escH(o.label)}</option>`).join("");

        modal.innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:24px;width:520px;max-width:94vw;max-height:90vh;display:flex;flex-direction:column;gap:16px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="font-family:'Funnel Display',sans-serif;font-size:14pt;font-weight:700;color:var(--text);text-shadow:0 0 10px rgba(255,255,255,0.2);">Tambah Tujuan Pembelajaran</div>
        <button onclick="document.getElementById('tp-picker-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:rgba(255,255,255,0.5);"><i class="material-symbols-rounded" data-lucide="x"></i></button>
      </div>
      
      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:var(--fs-sm);color:var(--text-light);">Bab</label>
        <input type="text" id="tp-form-bab" placeholder="Contoh: 1" style="padding:10px 14px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid var(--border);border-radius:8px;font-family:var(--f);font-size:var(--fs);">
      </div>

      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:var(--fs-sm);color:var(--text-light);">Materi Pokok</label>
        <input type="text" id="tp-form-mp" placeholder="Contoh: Bilangan Cacah" style="padding:10px 14px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid var(--border);border-radius:8px;font-family:var(--f);font-size:var(--fs);">
      </div>

      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:var(--fs-sm);color:var(--text-light);">Kode TP</label>
        <input type="text" id="tp-form-kode" value="${defaultKode}" placeholder="Contoh: TP 1" oninput="checkKodeTP(this.value, '${sem}')" style="padding:10px 14px;background:rgba(255,255,255,0.05);color:var(--text);border:1px solid var(--border);border-radius:8px;font-family:var(--f);font-size:var(--fs);">
        <span id="tp-kode-warning" style="color:#ef4444;font-size:11px;display:none;margin-top:2px;">Kode TP ini sudah digunakan. Disarankan menggunakan kode unik.</span>
      </div>

      <div style="display:flex;flex-direction:column;gap:4px;">
        <label style="font-size:var(--fs-sm);color:var(--text-light);">Tujuan Pembelajaran</label>
        <select id="tp-form-tp" style="padding:10px 14px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:8px;font-family:var(--f);font-size:var(--fs);">
          ${tpOptionsHtml}
        </select>
      </div>

      <div class="modal-actions" style="margin-top:12px;">
        <button onclick="document.getElementById('tp-picker-modal').remove()" class="btn-modal-cancel">Batal</button>
        <button class="btn-modal-ok btn-save" onclick="submitTPForm('${sem}')">Simpan</button>
      </div>
    </div>`;
        document.body.appendChild(modal);

        modal.addEventListener("click", (e) => {
          if (e.target === modal) modal.remove();
        });
      }

      function checkKodeTP(val, sem) {
        const arr = [...state.tpGanjil, ...state.tpGenap];
        const exists = arr.some(t => t.kode && t.kode.toLowerCase() === val.trim().toLowerCase());
        const warn = document.getElementById("tp-kode-warning");
        if (exists && val.trim() !== "") {
          warn.style.display = "block";
        } else {
          warn.style.display = "none";
        }
      }

      function submitTPForm(sem) {
        const bab = document.getElementById("tp-form-bab").value;
        const mp = document.getElementById("tp-form-mp").value;
        const kode = document.getElementById("tp-form-kode").value.trim() || "TP";
        const tp = document.getElementById("tp-form-tp").value;

        const arr = sem === "ganjil" ? state.tpGanjil : state.tpGenap;
        arr.push({
          bab: bab,
          mp: mp,
          kode: kode,
          tp: tp,
          jp: 2,
          ev: false,
        });
        
        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();
        document.getElementById("tp-picker-modal")?.remove();
      }

      function getOrderedATPList() {
        const list = [];
        const usedSet = new Set();

        const addTPItem = (t) => {
          if (!t || t.ev) return;
          const text = (t.tp || "").trim();
          if (text && !usedSet.has(text)) {
            usedSet.add(text);
            list.push({
              kode: t.kode || "",
              tp: text,
              bab: t.bab || "",
              mp: t.mp || "",
              jp: t.jp || 0
            });
          }
        };

        if (Array.isArray(state.tpGanjil)) {
          state.tpGanjil.forEach(addTPItem);
        }

        if (Array.isArray(state.tpGenap)) {
          state.tpGenap.forEach(addTPItem);
        }

        if (Array.isArray(state.atpData)) {
          state.atpData.forEach((el) => {
            if (Array.isArray(el.rows)) {
              el.rows.forEach((r) => {
                const text = (r.atp || r.tp || "").trim();
                if (text && !usedSet.has(text)) {
                  usedSet.add(text);
                  list.push({
                    kode: "",
                    tp: text,
                    bab: "",
                    mp: "",
                    jp: 0
                  });
                }
              });
            }
          });
        }

        return list;
      }

      function syncATPFromTPOrder() {
        try {
          if (typeof renderATP === "function") {
            const du = typeof getDU === "function" ? getDU() : {};
            renderATP(du);
          }
        } catch (e) {
          console.warn("syncATPFromTPOrder error:", e);
        }
      }

      // Render tabel TP gabungan
      function renderTPCombined() {
        // Update stats
        updateTPStatsOnly();

        ["ganjil", "genap"].forEach((sem) => {
          const arr = sem === "ganjil" ? state.tpGanjil : state.tpGenap;
          const stateKey = sem === "ganjil" ? "tpGanjil" : "tpGenap";
          const totalJP = arr.reduce((s, t) => s + (+t.jp || 0), 0);
          const cntEl = document.getElementById("cnt-tp-" + sem);
          if (cntEl)
            cntEl.textContent =
              arr.length + " item | Total: " + totalJP + " JP";
          const tbody = document.getElementById("body-tp-" + sem + "-combined");
          if (!tbody) return;
          const allOpts = getAllTPOptions();
          // TP yang sudah dipakai di KEDUA semester (pool tahunan)
          const usedTPs = new Set(
            [...state.tpGanjil, ...state.tpGenap]
              .filter((t) => !t.ev && t.tp)
              .map((t) => t.tp),
          );
          tbody.innerHTML = arr
            .map((t, i) => {
              // Opsi untuk baris ini: semua TP yg belum dipakai + nilai baris ini sendiri
              const rowOpts = allOpts.filter(
                (o) => o.label === t.tp || !usedTPs.has(o.label),
              );
              return `
      <tr draggable="true"
          ondragstart="handleTPRowDragStart(event, '${sem}', ${i})"
          ondragover="handleTPRowDragOver(event)"
          ondragenter="handleTPRowDragEnter(event)"
          ondragleave="handleTPRowDragLeave(event)"
          ondrop="handleTPRowDrop(event, '${sem}', ${i})"
          ondragend="handleTPRowDragEnd(event)"
          style="${t.ev ? "background:rgba(245, 158, 11, 0.1)" : ""}">
        <td class="td-ctr">
          <span class="tp-drag-handle" title="Tarik / Geser baris untuk mengubah urutan"><i class="material-symbols-rounded" style="font-size:14px;" data-lucide="grip-vertical"></i></span>
          ${i + 1}
        </td>
        <td><input type="text" style="width:38px;text-align:center" value="${escH(t.bab)}"
          onchange="state.${stateKey}[${i}].bab=this.value;renderTPCombined();renderTP('${sem}');syncATPFromTPOrder();scheduleSave();markDirty();" placeholder="-"></td>
        <td><input type="text" value="${escH(t.mp)}"
          onchange="state.${stateKey}[${i}].mp=this.value;renderTPCombined();renderTP('${sem}');syncATPFromTPOrder();scheduleSave();markDirty();"
          placeholder="Materi pokok..."></td>
        <td><input type="text" style="width:66px" value="${escH(t.kode)}"
          onchange="state.${stateKey}[${i}].kode=this.value;renderTPCombined();renderTP('${sem}');syncATPFromTPOrder();scheduleSave();markDirty();"></td>
        <td>${
          t.ev
            ? `<input type="text" value="${escH(t.tp)}"
              onchange="state.${stateKey}[${i}].tp=this.value;renderTPCombined();renderTP('${sem}');syncATPFromTPOrder();scheduleSave();markDirty();"
              placeholder="Tujuan Pembelajaran / Sumatif..." style="width:100%;min-width:250px;padding:8px 10px;min-height:38px;border:1px solid var(--border);border-radius:6px;font-family:var(--f);font-size:var(--fs);color:var(--text);background:var(--bg);box-sizing:border-box;">`
            : `<select onchange="state.${stateKey}[${i}].tp=this.value;renderTPCombined();
        renderTP('${sem}');syncATPFromTPOrder();scheduleSave();markDirty();"
                style="width:100%;min-width:250px;padding:8px 10px;min-height:38px;border:1px solid var(--border);border-radius:6px;font-family:var(--f);font-size:var(--fs);color:var(--text);background:var(--bg);line-height:1.4;box-sizing:border-box;">
              <option value="">-- Pilih TP --</option>
              ${rowOpts.map((o) => `<option value="${escH(o.label)}"${t.tp === o.label ? " selected" : ""}>${escH(o.label)}</option>`).join("")}
            </select>`
        }
        </td>
        <td><input type="number" min="1" max="30" value="${t.jp}"
          onchange="state.${stateKey}[${i}].jp=+this.value||1;renderTPCombined();renderTP('${sem}');syncATPFromTPOrder();scheduleSave();markDirty();"
          style="width:60px;text-align:center;padding:4px 2px;"></td>
        <td style="text-align:center;white-space:nowrap;">
          <button onclick="moveTPRow('${sem}',${i},-1)" ${i === 0 ? "disabled" : ""} title="Naik"
            style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;border:none;border-radius:6px;color:${i === 0 ? "#ccc" : "var(--text)"};cursor:${i === 0 ? "default" : "pointer"};" onmouseover="if(${i !== 0})this.style.background='rgba(255,255,255,0.1)'" onmouseout="if(${i !== 0})this.style.background='none'"><i class="material-symbols-rounded" style="font-size:18px;" data-lucide="arrow-up"></i></button>
          <button onclick="moveTPRow('${sem}',${i},1)" ${i === arr.length - 1 ? "disabled" : ""} title="Turun"
            style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;border:none;border-radius:6px;color:${i === arr.length - 1 ? "#ccc" : "var(--text)"};cursor:${i === arr.length - 1 ? "default" : "pointer"};" onmouseover="if(${i !== arr.length - 1})this.style.background='rgba(255,255,255,0.1)'" onmouseout="if(${i !== arr.length - 1})this.style.background='none'"><i class="material-symbols-rounded" style="font-size:18px;" data-lucide="arrow-down"></i></button>
        </td>
        <td style="text-align:center;white-space:nowrap;">
          <button onclick="openEditTP('${sem}',${i})" title="Edit"
            style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;color:#60a5fa;border:none;border-radius:6px;cursor:pointer;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'"><i class="material-symbols-rounded" style="font-size:18px;" data-lucide="pencil"></i></button>
          <button onclick="removeTPCombined('${sem}',${i})" title="Hapus"
            style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;color:#ef4444;border:none;border-radius:6px;cursor:pointer;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='none'"><i class="material-symbols-rounded" style="font-size:18px;" data-lucide="trash"></i></button>
        </td>
      </tr>`;
            })
            .join("");
        });
      }

      // ============================================================
      // FITUR AUTO URUT NOMOR KODE TP & DRAG-AND-DROP REORDERING
      // ============================================================
      function isEvalRow(t) {
        if (!t) return false;
        if (t.ev === true) return true;
        const k = String(t.kode || "").trim().toUpperCase();
        if (/^S\s*\d*$/.test(k)) return true;
        if (/^(STS|SAS|PTS|PAS|PAT|PSAS|PSAT)$/.test(k)) return true;
        if (/^SUMATIF/i.test(t.tp || "")) return true;
        return false;
      }

      function formatSumatifKode(existingKode, counter) {
        const k = String(existingKode || "").trim().toUpperCase();
        if (/^(STS|SAS|PTS|PAS|PAT|PSAS|PSAT)$/.test(k)) {
          return existingKode;
        }
        if (/^S\s*\d*$/i.test(k)) {
          return `S${counter}`;
        }
        return existingKode || `S${counter}`;
      }

      function detectTPPrefixStyle() {
        const allTps = [...(state.tpGanjil || []), ...(state.tpGenap || [])].filter(t => !isEvalRow(t) && t.kode);
        if (allTps.length === 0) return "TP ";

        let countSpace = 0; // "TP 1"
        let countDot = 0;   // "TP.1"
        let countClassDot = 0; // "7.1"
        let sampleClassDot = "";

        allTps.forEach(t => {
          const k = String(t.kode || "").trim();
          if (/^TP\s+\d+$/i.test(k)) countSpace++;
          else if (/^TP\.\d+$/i.test(k)) countDot++;
          else if (/^(\d+)\.\d+$/.test(k)) {
            countClassDot++;
            sampleClassDot = k.split(".")[0] + ".";
          }
        });

        if (countClassDot > countSpace && countClassDot > countDot) {
          return sampleClassDot || "7.";
        }
        if (countDot > countSpace) {
          return "TP.";
        }
        return "TP ";
      }

      function formatTPKode(prefix, num) {
        let p = prefix;
        if (p === "TP") p = "TP ";
        return `${p}${num}`;
      }

      function isAutoUrutKodeTPEnabled() {
        if (typeof state.autoUrutKodeTP === "boolean") {
          return state.autoUrutKodeTP;
        }
        const stored = localStorage.getItem("promesta_auto_urut_tp");
        if (stored !== null) {
          return stored === "true";
        }
        return true; // Default aktif
      }

      function toggleAutoUrutKodeTP(enabled) {
        state.autoUrutKodeTP = !!enabled;
        localStorage.setItem("promesta_auto_urut_tp", String(state.autoUrutKodeTP));
        if (state.autoUrutKodeTP) {
          autoUrutKodeTP("all");
          renderTPCombined();
          renderTP("ganjil");
          renderTP("genap");
          syncATPFromTPOrder();
          scheduleSave();
          markDirty();
          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Auto Urut Kode TP Diaktifkan ✨", "success", "Nomor kode TP otomatis teratur berurutan saat urutan dipindahkan.");
          }
        } else {
          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Auto Urut Kode TP Dinonaktifkan", "info", "Nomor kode TP tidak akan diubah otomatis saat memindahkan urutan.");
          }
        }
        updateAutoUrutCheckboxes();
      }

      function updateAutoUrutCheckboxes() {
        const checked = isAutoUrutKodeTPEnabled();
        document.querySelectorAll(".tp-auto-urut-toggle, #toggle-auto-urut-tp, #modal-cb-auto-urut").forEach((cb) => {
          if (cb && cb.checked !== checked) {
            cb.checked = checked;
          }
        });
      }

      function autoUrutKodeTP(targetSem = "all", customOptions = {}) {
        if (!state.tpGanjil) state.tpGanjil = [];
        if (!state.tpGenap) state.tpGenap = [];

        const mode = customOptions.mode || state.autoUrutTPMode || "auto";
        let prefix = customOptions.prefix;
        if (!prefix && prefix !== "") {
          prefix = detectTPPrefixStyle();
        }

        let isContinuous = true;
        if (mode === "semester") {
          isContinuous = false;
        } else if (mode === "annual") {
          isContinuous = true;
        } else {
          const nonEvalGanjil = state.tpGanjil.filter(t => !isEvalRow(t));
          const nonEvalGenap = state.tpGenap.filter(t => !isEvalRow(t));
          if (nonEvalGenap.length > 0 && nonEvalGanjil.length > 0) {
            const matchFirst = String(nonEvalGenap[0].kode || "").match(/(\d+)$/);
            if (matchFirst && parseInt(matchFirst[1], 10) === 1) {
              isContinuous = false;
            }
          }
        }

        // 1. Ganjil renumbering
        let nextGanjilNum = (typeof customOptions.startNumber === "number" && targetSem === "ganjil") 
          ? customOptions.startNumber 
          : 1;
        let sGanjilCount = 1;

        if (targetSem === "ganjil" || targetSem === "all" || isContinuous) {
          state.tpGanjil.forEach(t => {
            if (isEvalRow(t)) {
              t.kode = formatSumatifKode(t.kode, sGanjilCount++);
            } else {
              t.kode = formatTPKode(prefix, nextGanjilNum++);
            }
          });
        }

        // 2. Genap renumbering
        let nextGenapNum = 1;
        if (isContinuous) {
          const totalGanjilNonEval = state.tpGanjil.filter(t => !isEvalRow(t)).length;
          nextGenapNum = totalGanjilNonEval + 1;
        }
        if (typeof customOptions.startNumber === "number" && targetSem === "genap") {
          nextGenapNum = customOptions.startNumber;
        }

        let sGenapCount = 1;
        if (targetSem === "genap" || targetSem === "all" || isContinuous) {
          state.tpGenap.forEach(t => {
            if (isEvalRow(t)) {
              t.kode = formatSumatifKode(t.kode, sGenapCount++);
            } else {
              t.kode = formatTPKode(prefix, nextGenapNum++);
            }
          });
        }
      }

      function swapStudentScoresForTP(sem, i, t) {
        const semNum = (sem === "ganjil" || sem === 1) ? 1 : 2;
        const obj = semNum === 1 ? state.nilaiGanjil : state.nilaiGenap;
        if (!obj || !state.siswa || !Array.isArray(state.siswa) || state.siswa.length === 0) return;

        for (let si = 0; si < state.siswa.length; si++) {
          const keyI = `tp_${i}_${si}`;
          const keyT = `tp_${t}_${si}`;
          const hasI = Object.prototype.hasOwnProperty.call(obj, keyI);
          const hasT = Object.prototype.hasOwnProperty.call(obj, keyT);
          const valI = obj[keyI];
          const valT = obj[keyT];

          if (hasI) obj[keyT] = valI;
          else delete obj[keyT];

          if (hasT) obj[keyI] = valT;
          else delete obj[keyI];
        }
      }

      function remapStudentScoresOnMove(sem, fromIdx, toIdx) {
        if (fromIdx === toIdx) return;
        const semNum = (sem === "ganjil" || sem === 1) ? 1 : 2;
        const obj = semNum === 1 ? state.nilaiGanjil : state.nilaiGenap;
        if (!obj || !state.siswa || !Array.isArray(state.siswa) || state.siswa.length === 0) return;

        const mapOldToNew = {};
        const maxLen = 120;
        for (let k = 0; k < maxLen; k++) {
          if (k === fromIdx) {
            mapOldToNew[k] = toIdx;
          } else if (fromIdx < toIdx && k > fromIdx && k <= toIdx) {
            mapOldToNew[k] = k - 1;
          } else if (fromIdx > toIdx && k >= toIdx && k < fromIdx) {
            mapOldToNew[k] = k + 1;
          } else {
            mapOldToNew[k] = k;
          }
        }

        const backup = {};
        Object.keys(obj).forEach(key => {
          if (key.startsWith("tp_")) {
            backup[key] = obj[key];
            delete obj[key];
          }
        });

        Object.keys(backup).forEach(key => {
          const parts = key.split("_");
          if (parts.length === 3) {
            const oldIdx = parseInt(parts[1], 10);
            const si = parts[2];
            const newIdx = mapOldToNew[oldIdx] !== undefined ? mapOldToNew[oldIdx] : oldIdx;
            obj[`tp_${newIdx}_${si}`] = backup[key];
          } else {
            obj[key] = backup[key];
          }
        });
      }

      function removeStudentScoresOnDelete(sem, deletedIdx) {
        const semNum = (sem === "ganjil" || sem === 1) ? 1 : 2;
        const obj = semNum === 1 ? state.nilaiGanjil : state.nilaiGenap;
        if (!obj) return;

        const backup = {};
        Object.keys(obj).forEach(key => {
          if (key.startsWith("tp_")) {
            backup[key] = obj[key];
            delete obj[key];
          }
        });

        Object.keys(backup).forEach(key => {
          const parts = key.split("_");
          if (parts.length === 3) {
            const idx = parseInt(parts[1], 10);
            const si = parts[2];
            if (idx < deletedIdx) {
              obj[`tp_${idx}_${si}`] = backup[key];
            } else if (idx > deletedIdx) {
              obj[`tp_${idx - 1}_${si}`] = backup[key];
            }
          } else {
            obj[key] = backup[key];
          }
        });
      }

      // Drag and Drop state
      let tpDragState = {
        sem: null,
        fromIndex: null
      };

      function handleTPRowDragStart(e, sem, index) {
        tpDragState.sem = sem;
        tpDragState.fromIndex = index;
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", `${sem}:${index}`);
        }
        const tr = e.target.closest("tr");
        if (tr) {
          setTimeout(() => tr.classList.add("tp-row-dragging"), 10);
        }
      }

      function handleTPRowDragOver(e) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        const tr = e.target.closest("tr");
        if (tr && !tr.classList.contains("tp-row-drag-over")) {
          document.querySelectorAll(".tp-row-drag-over").forEach(el => el.classList.remove("tp-row-drag-over"));
          tr.classList.add("tp-row-drag-over");
        }
      }

      function handleTPRowDragEnter(e) {
        e.preventDefault();
      }

      function handleTPRowDragLeave(e) {
        const tr = e.target.closest("tr");
        if (tr && !tr.contains(e.relatedTarget)) {
          tr.classList.remove("tp-row-drag-over");
        }
      }

      function handleTPRowDragEnd(e) {
        document.querySelectorAll(".tp-row-dragging").forEach(el => el.classList.remove("tp-row-dragging"));
        document.querySelectorAll(".tp-row-drag-over").forEach(el => el.classList.remove("tp-row-drag-over"));
        tpDragState.sem = null;
        tpDragState.fromIndex = null;
      }

      function handleTPRowDrop(e, sem, toIndex) {
        e.preventDefault();
        document.querySelectorAll(".tp-row-dragging").forEach(el => el.classList.remove("tp-row-dragging"));
        document.querySelectorAll(".tp-row-drag-over").forEach(el => el.classList.remove("tp-row-drag-over"));

        if (tpDragState.sem !== sem || tpDragState.fromIndex === null) return;
        const fromIndex = tpDragState.fromIndex;
        if (fromIndex === toIndex) return;

        const arr = sem === "ganjil" ? state.tpGanjil : state.tpGenap;
        const [movedItem] = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, movedItem);

        remapStudentScoresOnMove(sem, fromIndex, toIndex);

        if (isAutoUrutKodeTPEnabled()) {
          autoUrutKodeTP(sem);
        }

        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();

        if (typeof showSaveIndicator === "function") {
          showSaveIndicator("Urutan TP dipindahkan & nomor kode TP otomatis diurutkan! ✨", "success");
        }

        tpDragState.sem = null;
        tpDragState.fromIndex = null;
      }

      function pindahSemesterTP(fromSem, index) {
        const toSem = fromSem === "ganjil" ? "genap" : "ganjil";
        const fromArr = fromSem === "ganjil" ? state.tpGanjil : state.tpGenap;
        const toArr = toSem === "ganjil" ? state.tpGanjil : state.tpGenap;

        if (!fromArr || !fromArr[index]) return;
        const [item] = fromArr.splice(index, 1);
        toArr.push(item);

        if (isAutoUrutKodeTPEnabled()) {
          autoUrutKodeTP("all");
        }

        renderTPCombined();
        renderTP("ganjil");
        renderTP("genap");
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();

        if (typeof showSaveIndicator === "function") {
          showSaveIndicator(`TP dipindahkan ke Semester ${toSem === "ganjil" ? "Ganjil" : "Genap"} & kode diperbarui! ✨`, "success");
        }
      }

      function moveTPRow(sem, i, dir) {
        const arr = sem === "ganjil" ? state.tpGanjil : state.tpGenap;
        const t = i + dir;
        if (t < 0 || t >= arr.length) return;
        [arr[i], arr[t]] = [arr[t], arr[i]];

        swapStudentScoresForTP(sem, i, t);

        if (isAutoUrutKodeTPEnabled()) {
          autoUrutKodeTP(sem);
        }

        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();

        if (isAutoUrutKodeTPEnabled() && typeof showSaveIndicator === "function") {
          showSaveIndicator("Urutan TP diubah & kode TP otomatis diurutkan! ✨", "success");
        }
      }

      function removeTPCombined(sem, i) {
        const semNum = (sem === "ganjil" || sem === 1) ? 1 : 2;
        removeStudentScoresOnDelete(semNum, i);
        (sem === "ganjil" ? state.tpGanjil : state.tpGenap).splice(i, 1);

        if (isAutoUrutKodeTPEnabled()) {
          autoUrutKodeTP(sem);
        }

        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();
      }

      // Modal Format & Pengaturan Urut Kode TP
      function openModalUrutKodeTP(sem = "ganjil") {
        let existing = document.getElementById("modal-urut-tp");
        if (existing) existing.remove();

        const detectedPrefix = detectTPPrefixStyle();
        const nonEvalGanjil = (state.tpGanjil || []).filter(t => !isEvalRow(t)).length;
        const nonEvalGenap = (state.tpGenap || []).filter(t => !isEvalRow(t)).length;
        const isCurrentlyContinuous = state.autoUrutTPMode === "annual" || (state.autoUrutTPMode !== "semester");
        const autoUrutChecked = isAutoUrutKodeTPEnabled();

        const rawKelas = (state && state.kelas) || document.getElementById("f-kelas")?.value || "7";
        const cleanKelas = String(rawKelas).replace(/\D/g, "") || "7";

        const modal = document.createElement("div");
        modal.id = "modal-urut-tp";
        modal.className = "modal-overlay";
        modal.innerHTML = `
          <div class="modal-box" style="max-width: 540px; width: 95vw;">
            <div class="modal-title" style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="material-symbols-rounded" style="color: #38bdf8; font-size: 22px;" data-lucide="arrow-down-1-0"></i>
                <span>Pengaturan &amp; Urutkan Nomor Kode TP</span>
              </div>
              <button onclick="tutupModalUrutKodeTP()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-light);"><i class="material-symbols-rounded" data-lucide="x"></i></button>
            </div>

            <p style="font-size: var(--fs-xs, 12px); color: var(--text-light); line-height: 1.5; margin: 0 0 14px 0;">
              Atur format kode TP dan aktifkan pengurutan nomor kode otomatis setiap kali baris TP dipindahkan (tombol naik/turun atau geser baris).
            </p>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; margin-bottom: 14px;">
              <div style="font-size: var(--fs-xs, 12px); font-weight: 600; color: var(--text); margin-bottom: 6px;">Ringkasan TP Saat Ini:</div>
              <div style="display: flex; gap: 16px; font-size: var(--fs-xs, 12px); color: var(--text-light); flex-wrap: wrap;">
                <div>Semester Ganjil: <strong style="color: #38bdf8;">${nonEvalGanjil} TP</strong></div>
                <div>Semester Genap: <strong style="color: #a78bfa;">${nonEvalGenap} TP</strong></div>
                <div>Total: <strong style="color: var(--text);">${nonEvalGanjil + nonEvalGenap} TP</strong></div>
              </div>
            </div>

            <div class="tp-config-section">
              <div class="tp-config-title">Format Penomoran Kode TP:</div>
              <div class="tp-radio-list">
                <label class="tp-radio-row">
                  <input type="radio" name="format-tp-kode" value="TP " ${detectedPrefix === "TP " ? "checked" : ""} onchange="updateModalUrutPreview()">
                  <span class="tp-radio-label"><strong>TP [No]</strong> (Contoh: TP 1, TP 2, TP 3...) &mdash; <em style="color: var(--text-light);">Standar</em></span>
                </label>
                <label class="tp-radio-row">
                  <input type="radio" name="format-tp-kode" value="TP." ${detectedPrefix === "TP." ? "checked" : ""} onchange="updateModalUrutPreview()">
                  <span class="tp-radio-label"><strong>TP.[No]</strong> (Contoh: TP.1, TP.2, TP.3...)</span>
                </label>
                <label class="tp-radio-row">
                  <input type="radio" name="format-tp-kode" value="${cleanKelas}." ${detectedPrefix.startsWith(cleanKelas) ? "checked" : ""} onchange="updateModalUrutPreview()">
                  <span class="tp-radio-label"><strong>${cleanKelas}.[No]</strong> (Contoh: ${cleanKelas}.1, ${cleanKelas}.2...) &mdash; <em style="color: var(--text-light);">Berdasarkan Kelas</em></span>
                </label>
                <label class="tp-radio-row">
                  <input type="radio" name="format-tp-kode" value="" ${detectedPrefix === "" ? "checked" : ""} onchange="updateModalUrutPreview()">
                  <span class="tp-radio-label"><strong>[No]</strong> (Contoh: 1, 2, 3...) &mdash; <em style="color: var(--text-light);">Hanya Nomor</em></span>
                </label>
                <label class="tp-radio-row">
                  <input type="radio" name="format-tp-kode" value="custom" id="radio-format-custom" onchange="updateModalUrutPreview()">
                  <span class="tp-radio-label" style="display: inline-flex; align-items: center;">
                    <strong>Format Kustom:</strong>
                    <input type="text" id="input-prefix-custom" class="tp-custom-prefix-input" placeholder="Awalan kode..." oninput="document.getElementById('radio-format-custom').checked=true; updateModalUrutPreview();">
                  </span>
                </label>
              </div>
            </div>

            <div class="tp-config-section">
              <div class="tp-config-title">Mode Kelanjutan Semester:</div>
              <div class="tp-radio-list">
                <label class="tp-radio-row align-top">
                  <input type="radio" name="mode-tp-continuity" value="annual" ${isCurrentlyContinuous ? "checked" : ""} onchange="updateModalUrutPreview()">
                  <div class="tp-radio-label">
                    <strong>Lanjut Tahunan (Ganjil &rarr; Genap)</strong>
                    <div style="font-size: 11px; color: var(--text-light); margin-top: 1px;">Nomor TP Semester Genap berlanjut setelah Semester Ganjil</div>
                  </div>
                </label>
                <label class="tp-radio-row align-top">
                  <input type="radio" name="mode-tp-continuity" value="semester" ${!isCurrentlyContinuous ? "checked" : ""} onchange="updateModalUrutPreview()">
                  <div class="tp-radio-label">
                    <strong>Reset Tiap Semester (Per Semester)</strong>
                    <div style="font-size: 11px; color: var(--text-light); margin-top: 1px;">Tiap semester dimulai dari nomor 1</div>
                  </div>
                </label>
              </div>
            </div>

            <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 10px 12px; margin-bottom: 16px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: var(--fs-sm, 13px); font-weight: 600; color: var(--text); margin: 0;">
                <input type="checkbox" id="modal-cb-auto-urut" style="width: 17px; height: 17px; accent-color: #38bdf8; margin: 0; flex-shrink: 0;" ${autoUrutChecked ? "checked" : ""}>
                <span>Aktifkan Auto Urut Nomor Kode TP saat memindahkan baris TP</span>
              </label>
            </div>

            <div id="modal-urut-preview-box" style="background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; font-family: monospace;">
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-modal-cancel" onclick="tutupModalUrutKodeTP()">Batal</button>
              <button type="button" class="btn-modal-ok btn-save" onclick="terapkanUrutKodeTPModal('${sem}')">
                <i class="material-symbols-rounded" style="font-size: 16px;" data-lucide="check"></i>
                <span>Terapkan Urutan Kode TP</span>
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons();
        }
        updateModalUrutPreview();
      }

      function tutupModalUrutKodeTP() {
        const m = document.getElementById("modal-urut-tp");
        if (m) m.remove();
      }

      function updateModalUrutPreview() {
        const box = document.getElementById("modal-urut-preview-box");
        if (!box) return;

        let prefix = "TP ";
        const radioChecked = document.querySelector('input[name="format-tp-kode"]:checked');
        if (radioChecked) {
          if (radioChecked.value === "custom") {
            prefix = document.getElementById("input-prefix-custom")?.value || "TP ";
          } else {
            prefix = radioChecked.value;
          }
        }

        const modeChecked = document.querySelector('input[name="mode-tp-continuity"]:checked')?.value || "annual";
        const isAnnual = modeChecked === "annual";

        const nonEvalGanjil = (state.tpGanjil || []).filter(t => !isEvalRow(t)).length || 4;
        const nonEvalGenap = (state.tpGenap || []).filter(t => !isEvalRow(t)).length || 4;

        const ganjilSamp = [1, 2, 3].map(n => formatTPKode(prefix, n)).join(", ") + ` ... ${formatTPKode(prefix, nonEvalGanjil)}`;
        const genapStart = isAnnual ? (nonEvalGanjil + 1) : 1;
        const genapSamp = [genapStart, genapStart + 1, genapStart + 2].map(n => formatTPKode(prefix, n)).join(", ") + ` ... ${formatTPKode(prefix, genapStart + nonEvalGenap - 1)}`;

        box.innerHTML = `
          <div style="color: #94a3b8; margin-bottom: 4px; font-weight: bold;">Contoh Hasil Penomoran:</div>
          <div><span style="color: #38bdf8;">Ganjil:</span> ${ganjilSamp}</div>
          <div style="margin-top: 2px;"><span style="color: #a78bfa;">Genap:</span> &nbsp;${genapSamp}</div>
        `;
      }

      function terapkanUrutKodeTPModal(sem = "all") {
        let prefix = "TP ";
        const radioChecked = document.querySelector('input[name="format-tp-kode"]:checked');
        if (radioChecked) {
          if (radioChecked.value === "custom") {
            prefix = document.getElementById("input-prefix-custom")?.value || "TP ";
          } else {
            prefix = radioChecked.value;
          }
        }

        const mode = document.querySelector('input[name="mode-tp-continuity"]:checked')?.value || "annual";
        state.autoUrutTPMode = mode;

        const autoUrutCb = document.getElementById("modal-cb-auto-urut");
        if (autoUrutCb) {
          state.autoUrutKodeTP = autoUrutCb.checked;
          localStorage.setItem("promesta_auto_urut_tp", String(state.autoUrutKodeTP));
          updateAutoUrutCheckboxes();
        }

        autoUrutKodeTP("all", { prefix, mode });

        renderTPCombined();
        renderTP("ganjil");
        renderTP("genap");
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();

        tutupModalUrutKodeTP();

        if (typeof showSaveIndicator === "function") {
          showSaveIndicator("Nomor Kode TP Berhasil Diurutkan! ✨", "success", `Format: ${prefix || "Nomor"} (${mode === "annual" ? "Lanjut Tahunan" : "Per Semester"})`);
        }
      }

      function distributeJPProportional(sem) {
        const semNum = (sem === "ganjil" || sem === 1) ? 1 : 2;
        const semStr = semNum === 1 ? "ganjil" : "genap";
        const semName = semNum === 1 ? "Semester Ganjil" : "Semester Genap";

        const tpArr = semNum === 1 ? state.tpGanjil : state.tpGenap;
        if (!tpArr || tpArr.length === 0) {
          alert(`Belum ada Tujuan Pembelajaran (TP) pada ${semName}.`);
          return;
        }

        const hEfektif = buildHariEfektif(semNum);
        const totalAvailJP = hEfektif.reduce((s, h) => s + h.jp, 0);

        if (totalAvailJP <= 0) {
          alert(`Total JP tersedia di hari efektif ${semName} adalah 0 JP.\nSilakan periksa pengaturan Hari Mengajar / Jadwal dan Kalender Libur.`);
          return;
        }

        // Pisahkan item khusus sumatif / evaluasi dan item TP reguler
        // Khusus baris sumatif: JP harus tetap bernilai 2 JP saat distribusi otomatis,
        // namun tetap bisa dicustom secara manual oleh pengguna setelahnya.
        const evalItems = [];
        const regularItems = [];

        tpArr.forEach((t, idx) => {
          if (isEvalRow(t)) {
            evalItems.push({ item: t, index: idx });
          } else {
            regularItems.push({ item: t, index: idx });
          }
        });

        // Setel setiap baris sumatif menjadi tepat 2 JP
        evalItems.forEach(({ item }) => {
          item.jp = 2;
        });

        const totalSumatifJP = evalItems.length * 2;
        const targetRegularJP = Math.max(0, totalAvailJP - totalSumatifJP);

        if (regularItems.length > 0) {
          // Standard Hare-Niemeyer / Largest Remainder Method untuk distribusi proporsional bilangan bulat pada TP reguler
          const weights = regularItems.map(({ item }) => (+item.jp > 0 ? +item.jp : 1));
          const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

          // Alokasikan JP yang tersisa untuk TP reguler (minimal 1 JP jika memungkinkan)
          const availForRegular = targetRegularJP > 0 ? targetRegularJP : regularItems.length;
          const exacts = weights.map(w => (w / totalWeight) * availForRegular);

          let floors = exacts.map(e => Math.floor(e));
          if (availForRegular >= regularItems.length) {
            floors = floors.map(f => Math.max(1, f));
          }

          let currentSum = floors.reduce((a, b) => a + b, 0);
          let diff = availForRegular - currentSum;

          if (diff > 0) {
            const remainders = exacts.map((e, idx) => ({
              index: idx,
              rem: e - Math.floor(e)
            }));
            remainders.sort((a, b) => b.rem - a.rem || a.index - b.index);

            for (let i = 0; i < diff; i++) {
              floors[remainders[i % remainders.length].index]++;
            }
          } else if (diff < 0) {
            const remainders = exacts.map((e, idx) => ({
              index: idx,
              rem: e - Math.floor(e)
            }));
            remainders.sort((a, b) => a.rem - b.rem || a.index - b.index);

            let reduced = 0;
            for (let i = 0; i < remainders.length && reduced < Math.abs(diff); i++) {
              const idx = remainders[i].index;
              if (floors[idx] > 1) {
                floors[idx]--;
                reduced++;
              }
            }
          }

          regularItems.forEach(({ item }, idx) => {
            item.jp = floors[idx];
          });
        }

        renderTPCombined();
        renderTP("ganjil");
        renderTP("genap");
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();

        if (typeof showSaveIndicator === "function") {
          const evalMsg = evalItems.length > 0 ? ` (${evalItems.length} Sumatif tetap 2 JP)` : "";
          showSaveIndicator(`Distribusi JP Otomatis ${semName} Berhasil! Total ${totalAvailJP} JP terbagi.${evalMsg} ✨`, "success");
        }
      }

      function distributeJPProportionalAll() {
        distributeJPProportional("ganjil");
        distributeJPProportional("genap");
      }

      function addAtpRow(ei) {
        if (!state.atpData || !state.atpData[ei]) return;
        if (!state.atpData[ei].rows) state.atpData[ei].rows = [];
        state.atpData[ei].rows.push({ tp: "", atp: "" });
        const newRi = state.atpData[ei].rows.length - 1;
        const listEl = document.getElementById(`atp-tp-list-${ei}`);

        if (listEl && typeof renderAtpRowHtml === "function") {
          listEl.innerHTML = state.atpData[ei].rows
            .map((row, ri) => renderAtpRowHtml(ei, ri, row, state.atpData[ei].rows.length, ri === newRi))
            .join("");

          if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons({
              attrs: { class: "lucide" },
              node: listEl
            });
          }

          let totalRows = state.atpData.reduce((s, e) => s + (e.rows ? e.rows.length : 0), 0);
          const cntEl = document.getElementById("cnt-atp");
          if (cntEl) cntEl.textContent = state.atpData.length + " elemen | " + totalRows + " TP";

          setTimeout(() => {
            const newTa = document.getElementById(`atp-textarea-${ei}-${newRi}`);
            if (newTa) {
              newTa.focus();
              newTa.style.height = "auto";
              newTa.style.height = (newTa.scrollHeight + 2) + "px";
            }
          }, 40);
        } else {
          renderAtpInput();
        }

        scheduleSave();
        markDirty();
      }

      function openBulkAddTPModal(targetEi) {
        if (!state.atpData || state.atpData.length === 0) {
          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Belum ada elemen Capaian Pembelajaran. Silakan buat elemen terlebih dahulu.", "error");
          }
          return;
        }

        const existing = document.getElementById("bulk-add-tp-modal");
        if (existing) existing.remove();

        const selectedEi = (typeof targetEi === "number" && targetEi >= 0 && targetEi < state.atpData.length) ? targetEi : 0;
        const currentEl = state.atpData[selectedEi];

        let elemenSelectHtml = "";
        if (state.atpData.length > 1) {
          elemenSelectHtml = `
            <div class="modal-field" style="margin-bottom: 12px;">
              <label style="font-weight:600; font-size:var(--fs-sm); color:var(--text); margin-bottom:6px; display:block;">Pilih Elemen Tujuan</label>
              <select id="bulk-tp-elemen-select" style="width:100%; padding:9px 12px; background:rgba(255,255,255,0.06); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:var(--f); font-size:var(--fs); outline:none;">
                ${state.atpData.map((el, idx) => `
                  <option value="${idx}" ${idx === selectedEi ? "selected" : ""}>
                    Elemen ${idx + 1}: ${escH(el.elemen || "Tanpa Nama")} (${el.rows ? el.rows.length : 0} TP)
                  </option>
                `).join("")}
              </select>
            </div>
          `;
        } else {
          elemenSelectHtml = `
            <input type="hidden" id="bulk-tp-elemen-select" value="${selectedEi}">
            <div style="font-size:var(--fs-sm); color:var(--text-light); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <i class="material-symbols-rounded" style="font-size:16px; color:#38bdf8;" data-lucide="layers"></i>
              <span>Target: <strong>Elemen ${selectedEi + 1} (${escH(currentEl.elemen || "Tanpa Nama")})</strong></span>
            </div>
          `;
        }

        const modal = document.createElement("div");
        modal.id = "bulk-add-tp-modal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
          <div class="modal-box" style="max-width: 580px; width: 92%; max-height: 90vh; overflow-y: auto;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:34px; height:34px; border-radius:8px; background:rgba(56, 189, 248, 0.15); display:flex; align-items:center; justify-content:center; color:#38bdf8;">
                  <i class="material-symbols-rounded" style="font-size:20px;" data-lucide="list-plus"></i>
                </div>
                <div>
                  <div class="modal-title" style="margin-bottom:0; font-size:16.5px; font-weight:700;">Tambah TP Sekaligus</div>
                  <div style="font-size:11.5px; color:var(--text-light);">Tambahkan banyak butir Tujuan Pembelajaran per baris</div>
                </div>
              </div>
              <button type="button" onclick="closeBulkAddTPModal()" style="background:none; border:none; color:var(--text-light); cursor:pointer; padding:4px; display:flex; align-items:center; border-radius:6px;" title="Tutup">
                <i class="material-symbols-rounded" style="font-size:20px;" data-lucide="x"></i>
              </button>
            </div>

            ${elemenSelectHtml}

            <div class="modal-field" style="margin-bottom:12px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                <label style="font-weight:600; font-size:var(--fs-sm); color:var(--text);">Daftar Tujuan Pembelajaran</label>
                <span id="bulk-tp-counter" style="font-size:11.5px; font-weight:600; color:var(--text-light); background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:9999px;">0 butir terdeteksi</span>
              </div>
              <textarea id="bulk-tp-textarea" rows="7" 
                placeholder="Ketik atau tempel (paste) butir-butir Tujuan Pembelajaran di sini, satu TP per baris...&#10;&#10;Contoh:&#10;1. Mengidentifikasi pola bilangan sederhana&#10;2. Menentukan rumus suku ke-n pada barisan aritmetika&#10;3. Menyelesaikan masalah nyata yang berkaitan dengan deret aritmetika"
                style="width:100%; box-sizing:border-box; padding:10px 12px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:var(--text); font-family:var(--f); font-size:var(--fs-sm); line-height:1.5; resize:vertical; outline:none;"></textarea>
            </div>

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 12px; margin-bottom:16px; display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:12px; color:var(--text); user-select:none;">
                <input type="checkbox" id="bulk-tp-clean-prefix" checked style="accent-color:#38bdf8; width:15px; height:15px;">
                <span>Hapus nomor urut / tanda bullet di awal baris secara otomatis (misal: <em>1.</em>, <em>1)</em>, <em>-</em>, <em>•</em>)</span>
              </label>
              <div style="font-size:11px; color:var(--text-light); line-height:1.4; display:flex; align-items:flex-start; gap:6px;">
                <i class="material-symbols-rounded" style="font-size:14px; color:#facc15; flex-shrink:0; margin-top:1px;" data-lucide="sparkles"></i>
                <span>Tip: Anda dapat langsung menyalin (Copy) butir-butir TP dari dokumen silabus / modul ajar Word atau PDF lalu Tempel (Paste) di atas.</span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-modal-cancel" onclick="closeBulkAddTPModal()">Batal</button>
              <button type="button" class="btn-modal-ok btn-save" onclick="executeBulkAddTP()">
                <i class="material-symbols-rounded" style="font-size:17px;" data-lucide="plus-circle"></i>
                <span>Tambahkan ke Elemen</span>
              </button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        const textarea = document.getElementById("bulk-tp-textarea");
        const counter = document.getElementById("bulk-tp-counter");
        const cleanCheckbox = document.getElementById("bulk-tp-clean-prefix");

        function updateCounter() {
          const text = textarea ? textarea.value : "";
          const clean = cleanCheckbox ? cleanCheckbox.checked : true;
          const lines = text.split(/\r?\n/)
            .map(line => {
              let l = line.trim();
              if (clean) {
                l = l.replace(/^\s*(?:[0-9]+[\.\)]|[a-zA-Z][\.\)]|[-*•–—])\s+/, "").trim();
              }
              return l;
            })
            .filter(l => l.length > 0);
          
          if (counter) {
            counter.textContent = `${lines.length} butir terdeteksi`;
            if (lines.length > 0) {
              counter.style.color = "#38bdf8";
              counter.style.background = "rgba(56,189,248,0.15)";
            } else {
              counter.style.color = "var(--text-light)";
              counter.style.background = "rgba(255,255,255,0.06)";
            }
          }
        }

        if (textarea) {
          textarea.addEventListener("input", updateCounter);
          setTimeout(() => {
            textarea.focus();
          }, 50);
        }
        if (cleanCheckbox) {
          cleanCheckbox.addEventListener("change", updateCounter);
        }

        if (typeof lucide !== "undefined" && lucide.createIcons) {
          lucide.createIcons({
            attrs: { class: "lucide" },
            node: modal
          });
        }
      }

      function closeBulkAddTPModal() {
        const modal = document.getElementById("bulk-add-tp-modal");
        if (modal) modal.remove();
      }

      function executeBulkAddTP() {
        const selectEl = document.getElementById("bulk-tp-elemen-select");
        const textarea = document.getElementById("bulk-tp-textarea");
        const cleanCheckbox = document.getElementById("bulk-tp-clean-prefix");

        if (!textarea || !selectEl) return;
        const targetEi = parseInt(selectEl.value, 10);
        if (isNaN(targetEi) || !state.atpData || !state.atpData[targetEi]) {
          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Elemen tujuan tidak valid.", "error");
          }
          return;
        }

        const clean = cleanCheckbox ? cleanCheckbox.checked : true;
        const rawText = textarea.value;
        const lines = rawText.split(/\r?\n/)
          .map(line => {
            let l = line.trim();
            if (clean) {
              l = l.replace(/^\s*(?:[0-9]+[\.\)]|[a-zA-Z][\.\)]|[-*•–—])\s+/, "").trim();
            }
            return l;
          })
          .filter(l => l.length > 0);

        if (lines.length === 0) {
          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Silakan masukkan minimal satu butir Tujuan Pembelajaran.", "error");
          }
          textarea.focus();
          return;
        }

        if (!state.atpData[targetEi].rows) {
          state.atpData[targetEi].rows = [];
        } else if (state.atpData[targetEi].rows.length === 1 && (!state.atpData[targetEi].rows[0].tp || state.atpData[targetEi].rows[0].tp.trim() === "")) {
          state.atpData[targetEi].rows = [];
        }

        lines.forEach(item => {
          state.atpData[targetEi].rows.push({
            tp: item,
            atp: item
          });
        });

        closeBulkAddTPModal();
        renderAtpInput();
        scheduleSave();
        markDirty();

        if (typeof showSaveIndicator === "function") {
          showSaveIndicator(`Berhasil menambahkan ${lines.length} Tujuan Pembelajaran sekaligus! ✨`, "success");
        }

        setTimeout(() => {
          const listEl = document.getElementById(`atp-tp-list-${targetEi}`);
          if (listEl) {
            listEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 120);
      }

      window.openBulkAddTPModal = openBulkAddTPModal;
      window.closeBulkAddTPModal = closeBulkAddTPModal;
      window.executeBulkAddTP = executeBulkAddTP;

      function removeAtpRow(ei, ri) {
        if (!state.atpData || !state.atpData[ei] || !state.atpData[ei].rows) return;
        const rowEl = document.getElementById(`atp-row-${ei}-${ri}`);
        const listEl = document.getElementById(`atp-tp-list-${ei}`);

        if (rowEl && listEl && typeof renderAtpRowHtml === "function") {
          rowEl.classList.add("tp-row-removing");
          setTimeout(() => {
            state.atpData[ei].rows.splice(ri, 1);
            if (state.atpData[ei].rows.length > 0) {
              listEl.innerHTML = state.atpData[ei].rows
                .map((row, idx) => renderAtpRowHtml(ei, idx, row, state.atpData[ei].rows.length))
                .join("");
            } else {
              listEl.innerHTML = `<div class="atp-tp-empty-msg" style="font-size:var(--fs-sm);color:var(--text-light);padding:8px 4px;font-style:italic;display:flex;align-items:center;gap:6px;">
                <i class="material-symbols-rounded" style="font-size:16px;opacity:0.7;" data-lucide="info"></i>
                <span>Belum ada Tujuan Pembelajaran. Klik <strong>Tambah TP</strong> atau <strong>Tambah Sekaligus</strong> untuk mengisi TP kustom Anda.</span>
              </div>`;
            }

            if (typeof lucide !== "undefined" && lucide.createIcons) {
              lucide.createIcons({
                attrs: { class: "lucide" },
                node: listEl
              });
            }

            listEl.querySelectorAll("textarea").forEach((ta) => {
              ta.style.height = "auto";
              ta.style.height = (ta.scrollHeight + 2) + "px";
            });

            let totalRows = state.atpData.reduce((s, e) => s + (e.rows ? e.rows.length : 0), 0);
            const cntEl = document.getElementById("cnt-atp");
            if (cntEl) cntEl.textContent = state.atpData.length + " elemen | " + totalRows + " TP";

            scheduleSave();
            markDirty();
          }, 200);
        } else {
          state.atpData[ei].rows.splice(ri, 1);
          renderAtpInput();
          scheduleSave();
          markDirty();
        }
      }

      async function clearAtpRows(ei) {
        if (!state.atpData || !state.atpData[ei]) return;
        const currentRows = state.atpData[ei].rows || [];
        if (currentRows.length === 0) {
          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Daftar TP pada elemen ini sudah kosong.", "info");
          }
          return;
        }
        const elemenName = state.atpData[ei].elemen ? ` "${state.atpData[ei].elemen}"` : ` Elemen ${ei + 1}`;
        const ok = await confirmAsync(
          `Hapus semua (${currentRows.length}) Tujuan Pembelajaran pada${elemenName}? Anda dapat menginput TP kustom Anda sendiri setelahnya.`
        );
        if (!ok) return;

        state.atpData[ei].rows = [];
        const listEl = document.getElementById(`atp-tp-list-${ei}`);
        if (listEl) {
          listEl.innerHTML = `<div class="atp-tp-empty-msg" style="font-size:var(--fs-sm);color:var(--text-light);padding:8px 4px;font-style:italic;display:flex;align-items:center;gap:6px;">
            <i class="material-symbols-rounded" style="font-size:16px;opacity:0.7;" data-lucide="info"></i>
            <span>Belum ada Tujuan Pembelajaran. Klik <strong>Tambah TP</strong> atau <strong>Tambah Sekaligus</strong> untuk mengisi TP kustom Anda.</span>
          </div>`;
          if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons({
              attrs: { class: "lucide" },
              node: listEl
            });
          }
          let totalRows = state.atpData.reduce((s, e) => s + (e.rows ? e.rows.length : 0), 0);
          const cntEl = document.getElementById("cnt-atp");
          if (cntEl) cntEl.textContent = state.atpData.length + " elemen | " + totalRows + " TP";
        } else {
          renderAtpInput();
        }

        scheduleSave();
        markDirty();
        if (typeof showSaveIndicator === "function") {
          showSaveIndicator("TP pada elemen ini berhasil dihapus. Silakan input TP kustom Anda! ✨", "success");
        }
      }

      async function clearAllAtpTP() {
        if (!state.atpData || state.atpData.length === 0) return;
        const totalRows = state.atpData.reduce((s, e) => s + (e.rows ? e.rows.length : 0), 0);
        if (totalRows === 0) {
          if (typeof showSaveIndicator === "function") {
            showSaveIndicator("Semua TP pada semua elemen sudah kosong.", "info");
          }
          return;
        }
        const ok = await confirmAsync(
          `Hapus semua (${totalRows}) Tujuan Pembelajaran di seluruh elemen? Seluruh TP akan dikosongkan agar Anda leluasa menginput TP kustom sendiri.`
        );
        if (!ok) return;

        state.atpData.forEach((el) => {
          el.rows = [];
        });
        renderAtpInput();
        scheduleSave();
        markDirty();
        if (typeof showSaveIndicator === "function") {
          showSaveIndicator("Semua TP berhasil dihapus. Silakan input TP kustom Anda! ✨", "success");
        }
      }

      window.clearAtpRows = clearAtpRows;
      window.clearAllAtpTP = clearAllAtpTP;

      function renderATP(du) {
        const arr = state.atpData;
        if (!arr || arr.length === 0) {
          if(document.getElementById("atp-content")) document.getElementById("atp-content").innerHTML =
            `<div class="empty"><div class="ic"><i class="material-symbols-rounded" style="font-size:48px; color:inherit" data-lucide="file-text"></i></div><h3>Data ATP kosong</h3><p>Tambahkan data di tab <strong>Data ATP</strong> terlebih dahulu.</p></div>`;
          return;
        }
        const TH = (ex = "") =>
          `style="background:#BDD7EE;color:#000000;padding:8px 10px;font-size:var(--fs);font-weight:700;text-align:center;border:1px solid #000000;${ex}"`;

        const validElements = arr.filter((el) => el.rows && el.rows.length > 0);
        const hasSubelemen = validElements.some(el => el.subElemen && el.subElemen.trim() !== "");
        const totalRows = validElements.length;

        const orderedAtp = getOrderedATPList();
        const allAtpItems = orderedAtp.length > 0
          ? orderedAtp
              .map(item => `<li style="margin:0 0 6px 0;line-height:1.4;text-align:left;word-break:break-word;">${escH(item.tp)}</li>`)
              .join("")
          : "<li>-</li>";

        const rows = validElements
          .map((el, index) => {
            const tpItems = (el.rows || [])
              .map(row => `<li style="margin:0 0 6px 0;line-height:1.4;text-align:left;word-break:break-word;">${escH(row.tp)}</li>`)
              .join("");

            const atpCell = index === 0
              ? `<td rowspan="${totalRows}" style="padding:8px 10px;border:1px solid #000000;vertical-align:top;font-size:var(--fs);line-height:1.4;word-break:break-word;overflow-wrap:break-word;">
                  <ol style="margin:0;padding:0;padding-left:18px;list-style-position:outside;list-style-type:decimal;word-break:break-word;">
                    ${allAtpItems}
                  </ol>
                </td>`
              : "";

            const subElemenCell = hasSubelemen
              ? `<td style="padding:8px 10px;border:1px solid #000000;vertical-align:top;font-size:var(--fs);text-align:left;font-weight:normal;line-height:1.4;">${escH(el.subElemen || "-")}</td>`
              : "";

            return `<tr>
              <td style="padding:8px 10px;border:1px solid #000000;vertical-align:top;font-size:var(--fs);text-align:left;font-weight:normal;line-height:1.4;">${escH(el.elemen)}</td>
              ${subElemenCell}
              <td style="padding:8px 10px;border:1px solid #000000;vertical-align:top;font-size:var(--fs);text-align:left;line-height:1.4;">${escH(el.cp)}</td>
              <td style="padding:8px 10px;border:1px solid #000000;vertical-align:top;font-size:var(--fs);line-height:1.4;">
                <ul style="margin:0;padding:0;padding-left:18px;list-style-position:outside;list-style-type:disc;">
                  ${tpItems || "<li>-</li>"}
                </ul>
              </td>
              ${atpCell}
            </tr>`;
          })
          .join("");

        const tbodies = `<tbody style="page-break-inside:auto;">${rows}</tbody>`;

        if(document.getElementById("atp-content")) document.getElementById("atp-content").innerHTML = `
  <div class="doc-frame">
    <div class="doc-info" style="margin-bottom:16px;">
      <div class="doc-title">Alur Tujuan Pembelajaran</div>
      <div class="doc-meta-list">
        <div class="dml-row"><span class="dml-lbl">Nama Sekolah</span><span class="dml-sep">:</span><span class="dml-val">${du.sekolah}</span></div>
        <div class="dml-row"><span class="dml-lbl">Mata Pelajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.mapel}</span></div>
        <div class="dml-row"><span class="dml-lbl">Fase / Kelas</span><span class="dml-sep">:</span><span class="dml-val">${escH(formatFaseKelas(du.fase, du.kelas))}</span></div>
        <div class="dml-row"><span class="dml-lbl">Tahun Ajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.tahun}</span></div>
      </div>
      <div style="margin-top:10px;font-weight:700;font-size:var(--fs);">Capaian Pembelajaran Fase ${du.fase}</div>
    </div>
    <div class="prota-wrap">
      <table class="pt" style="width:100%;border-collapse:collapse;table-layout:fixed;">
        <colgroup>
          <col style="width:${hasSubelemen ? "14%" : "15%"};">
          ${hasSubelemen ? `<col style="width:14%;">` : ""}
          <col style="width:${hasSubelemen ? "24%" : "25%"};">
          <col style="width:${hasSubelemen ? "24%" : "30%"};">
          <col style="width:${hasSubelemen ? "24%" : "30%"};">
        </colgroup>
        <thead>
          <tr>
            <th ${TH()}>Elemen</th>
            ${hasSubelemen ? `<th ${TH()}>Sub Elemen</th>` : ""}
            <th ${TH()}>Capaian Pembelajaran</th>
            <th ${TH()}>Tujuan Pembelajaran</th>
            <th ${TH()}>Alur Tujuan Pembelajaran</th>
          </tr>
        </thead>
        ${tbodies}
      </table>
    </div>
    ${renderDUSignHTML(du)}
  </div>`;
      }

      // ============================================================
      // NAVIGATION
      // ============================================================
            function toggleCollapseSidebar() {
        const sidebar = document.getElementById("app-sidebar");
        sidebar.classList.toggle("collapsed");
        const btn = document.querySelector(".btn-collapse-sidebar");
        if (sidebar.classList.contains("collapsed")) {
          btn.innerHTML = '<i data-lucide="panel-left-close"></i>';
        } else {
          btn.innerHTML = '<i data-lucide="panel-left-open"></i>';
        }
        if (window.lucide) window.lucide.createIcons();
      }
      
      // Also close sidebar logic for mobile if needed
function toggleSidebar() {
        const sidebar = document.getElementById("app-sidebar");
        const overlay = document.getElementById("mobile-overlay");
        if (sidebar.classList.contains("open")) {
          sidebar.classList.remove("open");
          overlay.classList.remove("active");
        } else {
          sidebar.classList.add("open");
          overlay.classList.add("active");
        }
      }

      function showTab(id) {
        // Close sidebar on mobile when navigating
        const sidebar = document.getElementById("app-sidebar");
        if (sidebar && sidebar.classList.contains("open")) {
          toggleSidebar();
        }

        const outputTabs = ["kalender", "atp", "rpe", "jurnal", "prota", "prosem", "absensi", "kktp", "nilai"];
        if (outputTabs.includes(id) && (!isGenerated || (typeof isGenerated !== "undefined" && !isGenerated))) {
          id = "data-umum";
        }

        if (id === "modul-ajar") closeModulAjarDetail();
        document
          .querySelectorAll(".tab-pane")
          .forEach((p) => p.classList.remove("active"));
        document
          .querySelectorAll(".nav-btn")
          .forEach((b) => b.classList.remove("active"));
        const tab = document.getElementById("tab-" + id);
        if (tab) {
          tab.classList.add("active");
          if (id === "data-libur") {
            renderKatColorSettings();
          }
          if (id === "atp-input") {
            renderAtpInput();
          }
          if (id === "tp") {
            autoPopulateTPFromCP(false);
          }
          if (id === "atp") {
            const du = typeof getDU === "function" ? getDU() : {};
            renderATP(du);
          }
          if (id === "prosem") {
            updateProsemJpVisibility();
          }

          // Sync semester content and buttons
          if (["prosem", "rpe", "jurnal", "absensi", "nilai"].includes(id)) {
            const btn1 = document.getElementById(`btn-${id}-sem-1`);
            const sem = btn1 && btn1.classList.contains("active") ? 1 : (btn1 ? 2 : 1);
            switchSemContent(id, sem);
          }

          // Auto-resize textareas when tab becomes visible
          tab.querySelectorAll("textarea").forEach((ta) => {
            if (ta.hasAttribute("oninput") || ta.classList.contains("auto-resize")) {
              ta.style.height = "auto";
              ta.style.height = ta.scrollHeight + 2 + "px";
            }
          });

          if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons();
          }
        }
        document.querySelectorAll(".nav-btn").forEach((b) => {
          if (
            b.getAttribute("onclick") &&
            b.getAttribute("onclick").includes("'" + id + "'")
          )
            b.classList.add("active");
        });
      }

      function switchSemContent(prefix, sem) {
        const btn1 = document.getElementById(`btn-${prefix}-sem-1`);
        const btn2 = document.getElementById(`btn-${prefix}-sem-2`);
        if (btn1 && btn2) {
          if (sem === 1) {
            btn1.classList.add("active");
            btn2.classList.remove("active");
          } else {
            btn2.classList.add("active");
            btn1.classList.remove("active");
          }
        }

        const c1 = document.getElementById(`${prefix}-1-content`);
        const c2 = document.getElementById(`${prefix}-2-content`);
        if (c1 && c2) {
          if (sem === 1) {
            c1.style.display = "";
            c2.style.display = "none";
          } else {
            c2.style.display = "";
            c1.style.display = "none";
          }
        }

        const p1 = document.getElementById(`btn-print-${prefix}-1`);
        const p2 = document.getElementById(`btn-print-${prefix}-2`);
        const d1 = document.getElementById(`btn-docx-${prefix}-1`);
        const d2 = document.getElementById(`btn-docx-${prefix}-2`);
        if (p1 && p2) {
          if (sem === 1) {
            p1.style.display = "inline-flex";
            p2.style.display = "none";
          } else {
            p2.style.display = "inline-flex";
            p1.style.display = "none";
          }
        }
        if (d1 && d2) {
          if (sem === 1) {
            d1.style.display = "inline-flex";
            d2.style.display = "none";
          } else {
            d2.style.display = "inline-flex";
            d1.style.display = "none";
          }
        }

        const s1 = document.getElementById(`stats-${prefix}-ganjil`);
        const s2 = document.getElementById(`stats-${prefix}-genap`);
        if (s1 && s2) {
          if (sem === 1) {
            s1.style.display = "";
            s2.style.display = "none";
          } else {
            s2.style.display = "";
            s1.style.display = "none";
          }
        }

        if (typeof lucide !== "undefined" && lucide.createIcons) {
          lucide.createIcons();
        }
      }

      // ============================================================
      // HEADER DROPDOWN HANDLER
      // ============================================================
      function toggleHeaderDropdown(event, dropdownId) {
        if (event) {
          event.stopPropagation();
          event.preventDefault();
        }
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;
        const wasOpen = dropdown.classList.contains("open");
        closeAllHeaderDropdowns();
        if (!wasOpen) {
          dropdown.classList.add("open");
          const menu = dropdown.querySelector(".header-dropdown-menu");
          if (menu) {
            menu.style.left = "";
            menu.style.right = "";
            
            const rect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            
            // If flagged as align-right or if opening to the right would overflow the viewport
            if (dropdown.classList.contains("align-right") || rect.right > viewportWidth - 16) {
              menu.style.left = "auto";
              menu.style.right = "0px";
            }
            
            // Ensure menu stays within visible boundaries without causing horizontal scroll
            const updatedRect = menu.getBoundingClientRect();
            if (updatedRect.right > viewportWidth - 12) {
              const overflowRight = updatedRect.right - (viewportWidth - 12);
              const currentRight = parseFloat(menu.style.right) || 0;
              menu.style.right = `${currentRight + overflowRight}px`;
            }
            const finalRect = menu.getBoundingClientRect();
            if (finalRect.left < 12) {
              const currentRight = parseFloat(menu.style.right) || 0;
              menu.style.right = `${Math.max(0, currentRight - (12 - finalRect.left))}px`;
            }
          }
          if (typeof lucide !== "undefined" && lucide.createIcons) {
            lucide.createIcons();
          }
        }
      }

      function closeAllHeaderDropdowns() {
        document.querySelectorAll(".header-dropdown.open").forEach((d) => {
          d.classList.remove("open");
          const menu = d.querySelector(".header-dropdown-menu");
          if (menu) {
            menu.style.left = "";
            menu.style.right = "";
          }
        });
      }

      document.addEventListener("click", (e) => {
        if (!e.target.closest(".header-dropdown")) {
          closeAllHeaderDropdowns();
        }
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeAllHeaderDropdowns();
        }
      });

      // ============================================================
      // JADWAL
      // ============================================================
      function renderJadwal() {
        updateTPStatsOnly();
        if(document.getElementById("jadwal-container")) document.getElementById("jadwal-container").innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; flex: 1; height: 100%; justify-content: space-between;">
            ${HARI_LIST.map((h) => {
              const j = state.jadwal.find((x) => x.hari === h);
              const isChecked = !!j;
              return `
                <div class="card" style="padding: 6px 12px !important; margin-bottom: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1.5px solid ${isChecked ? "rgba(250, 204, 21, 0.4)" : "rgba(255, 255, 255, 0.12)"}; border-radius: 8px; background: ${isChecked ? "rgba(250, 204, 21, 0.06)" : "transparent"}; transition: all 0.2s ease; box-shadow: ${isChecked ? "0 2px 8px rgba(250, 204, 21, 0.1)" : "none"}; overflow: hidden; min-width: 0; flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                    <input type="checkbox" id="chk-hari-${h}" ${isChecked ? "checked" : ""} onchange="toggleJadwalHari('${h}', this.checked)" style="width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer; border-radius: 4px; flex-shrink: 0;">
                    <label for="chk-hari-${h}" style="font-size: 13px; font-weight: 600; cursor: pointer; color: ${isChecked ? "var(--text)" : "var(--text-light)"}; padding-top: 1px; margin-bottom: 0; transition: color 0.2s ease; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${h}</label>
                  </div>
                  <div style="display: flex; flex-direction: row; align-items: center; justify-content: flex-end; gap: 6px; ${isChecked ? "" : "opacity: 0.35; pointer-events: none;"}; transition: opacity 0.2s ease; flex-shrink: 0;">
                    <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" value="${j ? j.jp : ""}" onchange="updateJadwalJp('${h}', this.value)" style="width: 40px; padding: 4px 6px; font-size: 13px; text-align: center; border: 1.5px solid ${isChecked ? "rgba(250, 204, 21, 0.4)" : "rgba(255, 255, 255, 0.15)"}; border-radius: 6px; outline: none; background: rgba(255, 255, 255, 0.15); color: var(--text); box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);" ${isChecked ? "" : "disabled"} onfocus="this.style.borderColor='var(--accent-light)';this.style.boxShadow='0 0 12px rgba(250,204,21,0.15), inset 0 1px 2px rgba(0,0,0,0.1)'" onblur="this.style.borderColor='${isChecked ? "rgba(250, 204, 21, 0.4)" : "rgba(255, 255, 255, 0.15)"}';this.style.boxShadow='inset 0 1px 2px rgba(0,0,0,0.1)'">
                    <span style="font-size: 11.5px; color: ${isChecked ? "var(--accent)" : "var(--text-light)"}; font-weight: 600; flex-shrink: 0;">JP</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `;
      }
      function toggleIdInput(type) {
        const inp = document.getElementById(`f-${type}-id`);
        if (!inp) return;
        const val = document.querySelector(
          `input[name="f-${type}-id-type"]:checked`,
        )?.value;
        if (!val) {
          inp.style.opacity = "0.5";
          inp.style.pointerEvents = "none";
          inp.disabled = true;
          inp.value = "";
        } else {
          inp.style.opacity = "1";
          inp.style.pointerEvents = "auto";
          inp.disabled = false;
        }
        if (typeof scheduleSave === "function") scheduleSave();
        if (typeof markDirty === "function") markDirty();
      }

      function toggleJadwalHari(h, checked) {
        if (checked) {
          state.jadwal.push({ hari: h, jp: 2 });
          // Sort `state.jadwal` based on HARI_LIST
          state.jadwal.sort(
            (a, b) => HARI_LIST.indexOf(a.hari) - HARI_LIST.indexOf(b.hari),
          );
        } else {
          state.jadwal = state.jadwal.filter((x) => x.hari !== h);
        }
        renderJadwal();
      }
      function updateJadwalJp(h, jpStr) {
        const jp = +jpStr || 1;
        const j = state.jadwal.find((x) => x.hari === h);
        if (j) {
          j.jp = jp;
        }
        renderJadwal();
      }

      // ============================================================
      // LIBUR
      // ============================================================
      function renderLibur(sem) {
        updateTPStatsOnly();
        const arr = sem === "ganjil" ? state.liburGanjil : state.liburGenap;
        if(document.getElementById("cnt-libur-" + sem)) document.getElementById("cnt-libur-" + sem).textContent =
          arr.length + " entri";
        if(document.getElementById("body-libur-" + sem)) document.getElementById("body-libur-" + sem).innerHTML = arr
          .map(
            (l, i) => `
    <tr><td class="td-ctr">${i + 1}</td>
      <td><input type="date" value="${l.tanggal}" onchange="updateLibur('${sem}',${i},'tanggal',this.value)"></td>
      <td><input type="text" value="${escH(l.keterangan)}" placeholder="Keterangan..." onchange="updateLibur('${sem}',${i},'keterangan',this.value)"></td>
      <td style="white-space:nowrap;">
        <button class="icon-btn" onclick="openEditLibur('${sem}',${i})" title="Edit" style="color:#60a5fa;background:none;border:none;cursor:pointer;margin-right:4px;padding:4px;"><i class="material-symbols-rounded" style="font-size:18px" data-lucide="pencil"></i></button>
        <button class="btn-del" onclick="removeLibur('${sem}',${i})" title="Hapus"><i class="material-symbols-rounded" style="font-size:18px" data-lucide="trash"></i></button>
      </td>
    </tr>`,
          )
          .join("");
      }
      function openEditLibur(sem, index) {
        let existing = document.getElementById("edit-libur-modal");
        if (existing) existing.remove();
        
        const arr = sem === "ganjil" ? state.liburGanjil : state.liburGenap;
        const liburData = arr[index];
        
        const modal = document.createElement("div");
        modal.id = "edit-libur-modal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
          <div class="modal-box">
            <div class="modal-title">Edit Data Libur</div>
            <div class="modal-field">
              <label>Tanggal</label>
              <input type="date" id="edit-libur-tanggal" value="${liburData.tanggal}">
            </div>
            <div class="modal-field">
              <label>Keterangan</label>
              <input type="text" id="edit-libur-keterangan" value="${escH(liburData.keterangan)}" placeholder="Keterangan...">
            </div>
            <div class="modal-actions">
              <button class="btn-modal-cancel" onclick="document.getElementById('edit-libur-modal').remove()">Batal</button>
              <button class="btn-modal-ok btn-save" onclick="saveEditLibur('${sem}', ${index})">Simpan</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
      function saveEditLibur(sem, index) {
        const tanggal = document.getElementById("edit-libur-tanggal").value;
        const keterangan = document.getElementById("edit-libur-keterangan").value;
        
        const arr = sem === "ganjil" ? state.liburGanjil : state.liburGenap;
        arr[index].tanggal = tanggal;
        arr[index].keterangan = keterangan;
        
        document.getElementById('edit-libur-modal').remove();
        renderLibur(sem);
        scheduleSave();
        markDirty();
      }
      function updateLibur(sem, i, f, v) {
        (sem === "ganjil" ? state.liburGanjil : state.liburGenap)[i][f] = v;
      }
      
      
      function removeLibur(sem, i) {
        (sem === "ganjil" ? state.liburGanjil : state.liburGenap).splice(i, 1);
        renderLibur(sem);
      }

      // ============================================================
      // TP
      // ============================================================
      function renderTP(sem) {
        const arr = sem === "ganjil" ? state.tpGanjil : state.tpGenap;
        const totalJP = arr.reduce((s, t) => s + (+t.jp || 0), 0);
        if (document.getElementById("cnt-tp-" + sem)) {
          document.getElementById("cnt-tp-" + sem).textContent = arr.length + " item | Total: " + totalJP + " JP";
        }
        
        const allOpts = getAllTPOptions();
        const usedTPs = new Set(
          [...state.tpGanjil, ...state.tpGenap]
            .filter((t) => !t.ev && t.tp)
            .map((t) => t.tp)
        );

        const html = arr.map((t, i) => {
          let tpInput = "";
          if (t.ev) {
            tpInput = `<input type="text" value="${escH(t.tp)}" onchange="updateTP('${sem}',${i},'tp',this.value)" placeholder="Tujuan Pembelajaran / Sumatif..." style="width:100%;min-width:250px;padding:8px 10px;min-height:38px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-family:var(--f);font-size:var(--fs);box-sizing:border-box;">`;
          } else {
            const rowOpts = allOpts.filter((o) => o.label === t.tp || !usedTPs.has(o.label));
            const existsInCP = allOpts.some(o => o.label === t.tp);
            let optHtml = `<option value="">-- Pilih TP --</option>`;
            if (!existsInCP && t.tp) {
              optHtml += `<option value="${escH(t.tp)}" selected class="invalid-tp">⚠ ${escH(t.tp)} (Tidak ada di CP)</option>`;
            }
            optHtml += rowOpts.map(o => `<option value="${escH(o.label)}" ${o.label === t.tp ? 'selected' : ''}>${escH(o.label)}</option>`).join('');
            
            tpInput = `<select style="width:100%; min-width: 250px; font-size:var(--fs); padding:8px 10px; min-height:38px; border:1px solid var(--border); border-radius:6px; background:var(--bg); color:var(--text); line-height:1.4; box-sizing:border-box;" onchange="updateTP('${sem}',${i},'tp',this.value)">${optHtml}</select>`;
          }

          return `
    <tr draggable="true"
        ondragstart="handleTPRowDragStart(event, '${sem}', ${i})"
        ondragover="handleTPRowDragOver(event)"
        ondragenter="handleTPRowDragEnter(event)"
        ondragleave="handleTPRowDragLeave(event)"
        ondrop="handleTPRowDrop(event, '${sem}', ${i})"
        ondragend="handleTPRowDragEnd(event)"
        style="${t.ev ? "background:rgba(245, 158, 11, 0.1)" : ""}">
      <td class="td-ctr">
        <span class="tp-drag-handle" title="Tarik / Geser baris untuk mengubah urutan"><i class="material-symbols-rounded" style="font-size:14px;" data-lucide="grip-vertical"></i></span>
        ${i + 1}
      </td>
      <td><input type="text" style="width:40px;text-align:center" value="${escH(t.bab)}" onchange="updateTP('${sem}',${i},'bab',this.value)" placeholder="-"></td>
      <td><input type="text" value="${escH(t.mp)}" onchange="updateTP('${sem}',${i},'mp',this.value)" placeholder="Materi pokok..."></td>
      <td><input type="text" style="width:72px" value="${escH(t.kode)}" onchange="updateTP('${sem}',${i},'kode',this.value)"></td>
      <td>${tpInput}</td>
      <td><input type="number" min="1" max="30" value="${t.jp}" onchange="updateTP('${sem}',${i},'jp',+this.value||1)"></td>
      <td style="text-align:center;white-space:nowrap;">
        <button onclick="moveTPRow('${sem}',${i},-1)" ${i === 0 ? "disabled" : ""} title="Naik (Auto Urut)"
          style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;border:none;border-radius:6px;color:${i === 0 ? "rgba(255,255,255,0.2)" : "var(--text)"};cursor:${i === 0 ? "default" : "pointer"};" onmouseover="if(${i !== 0})this.style.background='rgba(255,255,255,0.1)'" onmouseout="if(${i !== 0})this.style.background='none'"><i class="material-symbols-rounded" style="font-size:18px;" data-lucide="arrow-up"></i></button>
        <button onclick="moveTPRow('${sem}',${i},1)" ${i === arr.length - 1 ? "disabled" : ""} title="Turun (Auto Urut)"
          style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:none;border:none;border-radius:6px;color:${i === arr.length - 1 ? "rgba(255,255,255,0.2)" : "var(--text)"};cursor:${i === arr.length - 1 ? "default" : "pointer"};" onmouseover="if(${i !== arr.length - 1})this.style.background='rgba(255,255,255,0.1)'" onmouseout="if(${i !== arr.length - 1})this.style.background='none'"><i class="material-symbols-rounded" style="font-size:18px;" data-lucide="arrow-down"></i></button>
      </td>
      <td style="text-align:center;white-space:nowrap;">
        <button class="icon-btn" onclick="openEditTP('${sem}',${i})" title="Edit" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:#60a5fa;background:none;border:none;border-radius:6px;cursor:pointer;margin-right:2px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'"><i class="material-symbols-rounded" style="font-size:18px" data-lucide="pencil"></i></button>
        <button class="btn-del" onclick="removeTP('${sem}',${i})" title="Hapus" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;color:#ef4444;background:none;border:none;border-radius:6px;cursor:pointer;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='none'"><i class="material-symbols-rounded" style="font-size:18px" data-lucide="trash"></i></button>
      </td>
    </tr>`;
        }).join("");
        
        if (document.getElementById("body-tp-" + sem)) {
          document.getElementById("body-tp-" + sem).innerHTML = html;
        }
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
        updateAutoUrutCheckboxes();
      }
      function updateTP(sem, i, f, v) {
        (sem === "ganjil" ? state.tpGanjil : state.tpGenap)[i][f] = v;
        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();
      }
      function addTP(sem) {
        let defaultKode = "TP";
        if (isAutoUrutKodeTPEnabled()) {
          const nonEvalGanjil = (state.tpGanjil || []).filter(t => !isEvalRow(t)).length;
          const nonEvalGenap = (state.tpGenap || []).filter(t => !isEvalRow(t)).length;
          const prefix = detectTPPrefixStyle();
          let nextNum = 1;
          if (sem === "ganjil") {
            nextNum = nonEvalGanjil + 1;
          } else {
            const isContinuous = state.autoUrutTPMode !== "semester";
            nextNum = isContinuous ? (nonEvalGanjil + nonEvalGenap + 1) : (nonEvalGenap + 1);
          }
          defaultKode = formatTPKode(prefix, nextNum);
        }
        (sem === "ganjil" ? state.tpGanjil : state.tpGenap).push({
          bab: "",
          mp: "",
          kode: defaultKode,
          tp: "",
          jp: 2,
          ev: false,
        });
        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();
      }
      function addEval(sem) {
        const arr = sem === "ganjil" ? state.tpGanjil : state.tpGenap;
        const evalCount = (arr || []).filter(t => isEvalRow(t)).length;
        const nextNum = evalCount + 1;
        (sem === "ganjil" ? state.tpGanjil : state.tpGenap).push({
          bab: "",
          mp: "",
          kode: `S${nextNum}`,
          tp: `Sumatif ${nextNum}`,
          jp: 2,
          ev: true,
        });
        renderTP(sem);
        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();
      }
      function removeTP(sem, i) {
        const semNum = (sem === "ganjil" || sem === 1) ? 1 : 2;
        removeStudentScoresOnDelete(semNum, i);
        (sem === "ganjil" ? state.tpGanjil : state.tpGenap).splice(i, 1);
        if (isAutoUrutKodeTPEnabled()) {
          autoUrutKodeTP(sem);
        }
        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();
      }

      function openEditTP(sem, index) {
        let existing = document.getElementById("edit-tp-modal");
        if (existing) existing.remove();
        
        const arr = sem === "ganjil" ? state.tpGanjil : state.tpGenap;
        const tpData = arr[index];
        
        const allOpts = getAllTPOptions();
        const usedTPs = new Set(
          [...state.tpGanjil, ...state.tpGenap]
            .filter((t) => !t.ev && t.tp)
            .map((t) => t.tp)
        );
        const rowOpts = allOpts.filter(
          (o) => o.label === tpData.tp || !usedTPs.has(o.label)
        );

        let tpFieldHtml = "";
        if (tpData.ev) {
            tpFieldHtml = `<textarea id="edit-tp-tp" rows="4" style="width:100%; padding:10px 14px; background:rgba(255,255,255,0.05); color:var(--text); border:1px solid var(--border); border-radius:8px; font-family:var(--f); font-size:var(--fs);">${escH(tpData.tp)}</textarea>`;
        } else {
            const existsInCP = allOpts.some(o => o.label === tpData.tp);
            let optHtml = `<option value="">-- Pilih TP --</option>`;
            if (!existsInCP && tpData.tp) {
              optHtml += `<option value="${escH(tpData.tp)}" selected class="invalid-tp">⚠ ${escH(tpData.tp)} (Tidak ada di CP)</option>`;
            }
            optHtml += rowOpts.map(o => `<option value="${escH(o.label)}" ${o.label === tpData.tp ? 'selected' : ''}>${escH(o.label)}</option>`).join('');
            
            tpFieldHtml = `<select id="edit-tp-tp" style="width:100%; padding:10px 14px; background:var(--bg); color:var(--text); border:1px solid var(--border); border-radius:8px; font-family:var(--f); font-size:var(--fs);">${optHtml}</select>`;
        }
        
        const modal = document.createElement("div");
        modal.id = "edit-tp-modal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
          <div class="modal-box">
            <div class="modal-title">Edit Tujuan Pembelajaran</div>
            <div class="modal-field">
              <label>Bab</label>
              <input type="text" id="edit-tp-bab" value="${escH(tpData.bab)}">
            </div>
            <div class="modal-field">
              <label>Materi Pokok</label>
              <textarea id="edit-tp-mp" rows="3">${escH(tpData.mp)}</textarea>
            </div>
            <div class="modal-field">
              <label>Kode TP</label>
              <input type="text" id="edit-tp-kode" value="${escH(tpData.kode)}">
            </div>
            <div class="modal-field">
              <label>Tujuan Pembelajaran</label>
              ${tpFieldHtml}
            </div>
            <div class="modal-field">
              <label>Alokasi Waktu (JP)</label>
              <input type="number" id="edit-tp-jp" min="1" max="30" value="${tpData.jp}">
            </div>
            <div class="modal-actions" style="display: flex; align-items: center; justify-content: space-between;">
              <button type="button" class="btn-modal-cancel" onclick="document.getElementById('edit-tp-modal').remove()">Batal</button>
              <button type="button" class="btn-modal-cancel" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;" onclick="document.getElementById('edit-tp-modal').remove(); pindahSemesterTP('${sem}', ${index})">
                <i class="material-symbols-rounded" style="font-size: 14px;" data-lucide="arrow-right-left"></i>
                <span>Pindah ke Sem. ${sem === 'ganjil' ? 'Genap' : 'Ganjil'}</span>
              </button>
              <button type="button" class="btn-modal-ok btn-save" onclick="saveEditTP('${sem}', ${index})">Simpan</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      }
      
      function saveEditTP(sem, index) {
        const bab = document.getElementById("edit-tp-bab").value;
        const mp = document.getElementById("edit-tp-mp").value;
        const kode = document.getElementById("edit-tp-kode").value;
        const tpVal = document.getElementById("edit-tp-tp").value;
        const jp = parseInt(document.getElementById("edit-tp-jp").value) || 1;
        
        const arr = sem === "ganjil" ? state.tpGanjil : state.tpGenap;
        arr[index].bab = bab;
        arr[index].mp = mp;
        arr[index].kode = kode;
        arr[index].tp = tpVal;
        arr[index].jp = jp;
        
        document.getElementById('edit-tp-modal').remove();
        renderTP(sem);
        renderTPCombined();
        renderTP(sem);
        syncATPFromTPOrder();
        scheduleSave();
        markDirty();
      }

      function formatKelas(kelas) {
        if (!kelas) return "";
        let k = String(kelas).trim();
        if (k.toLowerCase().startsWith("kelas ")) {
          return k;
        }
        return `Kelas ${k}`;
      }

      function formatFaseKelas(fase, kelas, rombel) {
        const f = String(fase || "").trim();
        let r = rombel;
        if ((r === undefined || r === null) && typeof getDU === "function") {
          try {
            const d = getDU();
            if (d && d.rombel) r = d.rombel;
          } catch (e) {}
        }
        let k = String(r !== undefined && r !== null && String(r).trim() !== "" ? r : kelas || "").trim();
        k = k.replace(/^(kelas\s*)+/i, "").trim();

        const fasePart = f ? (f.toLowerCase().startsWith("fase ") ? f : `Fase ${f}`) : "";
        const kelasPart = k ? `Kelas ${k}` : "";
        if (fasePart && kelasPart) return `${fasePart} / ${kelasPart}`;
        return fasePart || kelasPart || "-";
      }

      function formatJadwalText(jadwalArr) {
        if (!jadwalArr || !Array.isArray(jadwalArr) || jadwalArr.length === 0) return " - ";
        const items = jadwalArr.map((j) => `${j.hari} (${j.jp} JP)`);
        if (items.length === 1) return items[0];
        if (items.length === 2) return items.join(" dan ");
        return items.slice(0, -1).join(", ") + ", dan " + items[items.length - 1];
      }

      function escH(s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      // ============================================================
      // ALGORITHM: EFFECTIVE DAYS + DISTRIBUTION
      // ============================================================
      function buildHariEfektif(sem) {
        const ta = document.getElementById("f-tahun").value;
        const parts = ta.split("/");
        const yr1 = parseInt(parts[0]);
        const yr2 = parseInt(parts[1] || yr1 + 1);
        const [startDt, endDt] =
          sem === 1
            ? [new Date(Date.UTC(yr1, 6, 1)), new Date(Date.UTC(yr1, 11, 31))]
            : [new Date(Date.UTC(yr2, 0, 1)), new Date(Date.UTC(yr2, 5, 30))];

        const liburArr = sem === 1 ? kalender.ganjil : kalender.genap;
        const liburSet = new Set(
          liburArr
            .filter((l) => !katById(l.kategori || "custom").countEfektif)
            .map((l) => l.tanggal),
        );
        const jadwalMap = {};
        for (const j of state.jadwal) {
          const dow = HARI_DOW[j.hari];
          if (dow !== undefined) jadwalMap[dow] = +j.jp;
        }

        const result = [];
        let cur = new Date(startDt);
        while (cur <= endDt) {
          const iso = fi(cur),
            dow = cur.getUTCDay();

          if (jadwalMap[dow] !== undefined && !liburSet.has(iso)) {
            result.push({ tanggal: iso, jp: jadwalMap[dow] });
          }
          cur = ad(cur, 1);
        }
        return result;
      }

      function distributeTP(tpArr, hariEfektif) {
        const result = [];
        let hi = 0,
          jpUsed = 0;
        for (const tp of tpArr) {
          let need = +tp.jp;
          let tMul = null,
            tSel = null;
          const pertemuanList = [];
          while (need > 0 && hi < hariEfektif.length) {
            const h = hariEfektif[hi];
            const avail = h.jp - jpUsed;
            if (!tMul) tMul = h.tanggal;
            if (need <= avail) {
              const allocated = need;
              jpUsed += need;
              tSel = h.tanggal;
              need = 0;
              const existing = pertemuanList.find((p) => p.tanggal === h.tanggal);
              if (existing) {
                existing.jp += allocated;
              } else {
                pertemuanList.push({ tanggal: h.tanggal, jp: allocated });
              }
              if (jpUsed >= h.jp) {
                hi++;
                jpUsed = 0;
              }
            } else {
              const allocated = avail;
              need -= avail;
              tSel = h.tanggal;
              const existing = pertemuanList.find((p) => p.tanggal === h.tanggal);
              if (existing) {
                existing.jp += allocated;
              } else {
                pertemuanList.push({ tanggal: h.tanggal, jp: allocated });
              }
              hi++;
              jpUsed = 0;
            }
          }
          result.push({ ...tp, tMul, tSel, pertemuanList });
        }
        return result;
      }

      function buildMonths(sem) {
        const ta = document.getElementById("f-tahun").value;
        const parts = ta.split("/");
        const yr1 = parseInt(parts[0]),
          yr2 = parseInt(parts[1] || yr1 + 1);
        const mNums = sem === 1 ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];
        const yr = sem === 1 ? yr1 : yr2;
        return mNums.map((m) => ({
          year: yr,
          month: m,
          name: BULAN[m],
          days: daysInMonth(yr, m),
        }));
      }

      // Majority-rule week assignment:
      // A Mon-Sun week belongs to the month that contains ≥4 of its 7 days.
      // Returns {months, monthWeeksArr, dateLookup}
      //   monthWeeksArr[mi] = number of weeks in month mi
      //   dateLookup[isoDate] = {mi, wk}  (1-based week index within month)
      function buildMonthWeeks(sem) {
        const months = buildMonths(sem);
        const monthKey = (m) => `${m.year}-${m.month}`;
        const miMap = {};
        months.forEach((m, mi) => (miMap[monthKey(m)] = mi));

        const semStart = new Date(Date.UTC(months[0].year, months[0].month, 1));
        const semEnd = new Date(
          Date.UTC(
            months[months.length - 1].year,
            months[months.length - 1].month + 1,
            0,
          ),
        );

        // First day of week: 0=Sunday, 1=Monday
        const fdw = parseInt(document.getElementById("f-first-day").value) || 0;

        // Find the first [fdw] day on or before semStart
        let dow = semStart.getUTCDay(); // 0=Sun ... 6=Sat
        let offset;
        if (fdw === 0) {
          // Sunday-start: go back to nearest Sunday
          offset = -dow;
        } else {
          // Monday-start: go back to nearest Monday
          offset = dow === 0 ? -6 : 1 - dow;
        }
        let wkStart = ad(semStart, offset);

        const monthWeeksArr = months.map(() => 0); // count of weeks per month
        const dateLookup = {};

        while (wkStart <= semEnd) {
          // Count days per month this week
          const cnt = {};
          for (let i = 0; i < 7; i++) {
            const d = ad(wkStart, i);
            const k = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
            cnt[k] = (cnt[k] || 0) + 1;
          }
          // Owner = month with ≥4 days (that is in our semester)
          let ownerMi = -1;
          for (const [k, c] of Object.entries(cnt)) {
            if (c >= 4 && miMap[k] !== undefined) {
              ownerMi = miMap[k];
              break;
            }
          }
          if (ownerMi >= 0) {
            monthWeeksArr[ownerMi]++;
            const wkNum = monthWeeksArr[ownerMi];
            for (let i = 0; i < 7; i++) {
              const d = ad(wkStart, i);
              const iso = fi(d);
              if (!dateLookup[iso])
                dateLookup[iso] = { mi: ownerMi, wk: wkNum };
            }
          }
          wkStart = ad(wkStart, 7);
        }
        return { months, monthWeeksArr, dateLookup };
      }

      

      // ============================================================
      // RENDER RPE
      // ============================================================
      function renderRPE(sem, du) {
        const semLabel = sem === 1 ? "Ganjil" : "Genap";
        const jpPerPekan = state.jadwal.reduce((s, j) => s + (+j.jp || 0), 0);
        const { months, monthWeeksArr, dateLookup } = buildMonthWeeks(sem);

        const liburArr = sem === 1 ? kalender.ganjil : kalender.genap;
        const liburSet = new Set(
          liburArr
            .filter((l) => !katById(l.kategori || "custom").countEfektif)
            .map((l) => l.tanggal),
        );
        const jadwalMap = {};
        for (const j of state.jadwal) {
          const dow = HARI_DOW[j.hari];
          if (dow !== undefined) jadwalMap[dow] = +j.jp;
        }

        // For each (mi, wk): check if it has any teaching day that's on holiday
        // Only count days that are actual scheduled teaching days (in jadwalMap)
        const wkHasActive = {}; // key -> bool
        const wkHasLibur = {}; // key -> bool
        const liburWkKetMap = {}; // key -> Set<keterangan>  -  tracks which ket caused libur per week

        const semStart = new Date(Date.UTC(months[0].year, months[0].month, 1));
        const semEnd = new Date(
          Date.UTC(
            months[months.length - 1].year,
            months[months.length - 1].month + 1,
            0,
          ),
        );
        let cur = new Date(semStart);
        while (cur <= semEnd) {
          const iso = fi(cur),
            dow = cur.getUTCDay();
          const cell = dateLookup[iso];
          if (cell) {
            const key = `${cell.mi}-${cell.wk}`;
            if (liburSet.has(iso)) {
              wkHasLibur[key] = true;
              const entry = liburArr.find((l) => l.tanggal === iso);
              const ket = entry ? entry.keterangan || "Libur" : "Libur";
              if (!liburWkKetMap[key]) liburWkKetMap[key] = new Set();
              liburWkKetMap[key].add(ket);
            } else if (jadwalMap[dow] !== undefined) {
              wkHasActive[key] = true;
            }
          }
          cur = ad(cur, 1);
        }

        // A week is tidak efektif only if teaching days were all holidays (no active teaching)
        const isNotEfektif = (key) => wkHasLibur[key] && !wkHasActive[key];

        // --- SECTION A: per-month summary ---
        let totalAll = 0,
          totalTidak = 0,
          totalEfektif = 0;
        const sectionA = months.map((m, mi) => {
          const total = monthWeeksArr[mi];
          const tidakWks = Array.from(
            { length: total },
            (_, w) => `${mi}-${w + 1}`,
          ).filter(isNotEfektif);
          const tidak = tidakWks.length;
          const efektif = total - tidak;
          totalAll += total;
          totalTidak += tidak;
          totalEfektif += efektif;
          return { nama: m.name, total, tidak, efektif };
        });

        // --- SECTION B: per-kegiatan libur ---
        // Find all contiguous blocks of non-effective weeks to avoid double counting
        // when multiple holidays overlap in the same or adjacent weeks.
        const allKeys = [];
        months.forEach((m, mi) => {
          for (let w = 1; w <= monthWeeksArr[mi]; w++) {
            allKeys.push(`${mi}-${w}`);
          }
        });

        const blocks = [];
        let currentBlock = null;

        for (const key of allKeys) {
          if (isNotEfektif(key)) {
            if (!currentBlock) {
              currentBlock = { keys: [], kets: new Set() };
              blocks.push(currentBlock);
            }
            currentBlock.keys.push(key);
            if (liburWkKetMap[key]) {
              liburWkKetMap[key].forEach((k) => currentBlock.kets.add(k));
            }
          } else {
            currentBlock = null;
          }
        }

        const sectionB = blocks.map((b) => {
          const labels = b.keys.map((key) => {
            const [mi, wk] = key.split("-").map(Number);
            return {
              mi,
              wk,
              label: `Pekan ke-${wk} ${months[mi].name} ${months[mi].year}`,
            };
          });
          let ketStr;
          if (labels.length === 1) {
            ketStr = labels[0].label;
          } else {
            const first = labels[0],
              last = labels[labels.length - 1];
            if (first.mi === last.mi) {
              ketStr = `Pekan ke-${first.wk} s.d. Pekan ke-${last.wk} ${months[first.mi].name} ${months[first.mi].year}`;
            } else {
              ketStr = `${first.label} s.d. ${last.label}`;
            }
          }
          return {
            ket: Array.from(b.kets).join(" / "),
            jumlah: b.keys.length,
            ketStr,
          };
        });

        const totalB = sectionB.reduce((s, r) => s + r.jumlah, 0);

        // --- SECTION C ---
        const jamEfektif = totalEfektif * jpPerPekan;

        // --- RENDER ---
        const yr = du.tahun.split("/");
        const semYear = sem === 1 ? yr[0] : yr[1] || parseInt(yr[0]) + 1;

        const thStyle = `style="background:#BDD7EE;color:#000;padding:6px 8px;font-size:var(--fs);font-weight:700;text-align:center;border:1px solid #1E3A5F;white-space:nowrap;"`;
        const thL = `style="background:#BDD7EE;color:#000;padding:6px 8px;font-size:var(--fs);font-weight:700;text-align:center;border:1px solid #1E3A5F;"`;
        const tdC = `style="padding:5px 8px;border:1px solid #1E3A5F;text-align:center;font-size:var(--fs);"`;
        const tdL = `style="padding:5px 8px;border:1px solid #1E3A5F;font-size:var(--fs);"`;
        const tdN = `style="padding:5px 8px;border:1px solid #1E3A5F;text-align:center;font-size:var(--fs);"`;
        const trEven = `style="background:#F2F2F2;"`;
        if(document.getElementById(`rpe-${sem}-content`)) document.getElementById(`rpe-${sem}-content`).innerHTML = `
  <div class="doc-frame">
  <div class="doc-info" style="margin-bottom:20px;">
    <div class="doc-title">Rencana Pekan Efektif</div>
    <div class="doc-meta-list">
      <div class="dml-row"><span class="dml-lbl">Nama Sekolah</span><span class="dml-sep">:</span><span class="dml-val">${du.sekolah}</span></div>
      <div class="dml-row"><span class="dml-lbl">Mata Pelajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.mapel}</span></div>
      <div class="dml-row"><span class="dml-lbl">Fase / Kelas</span><span class="dml-sep">:</span><span class="dml-val">${escH(formatFaseKelas(du.fase, du.kelas))}</span></div>
      <div class="dml-row"><span class="dml-lbl">Semester</span><span class="dml-sep">:</span><span class="dml-val">${semLabel}</span></div>
      <div class="dml-row"><span class="dml-lbl">Tahun Ajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.tahun}</span></div>
      <div class="dml-row"><span class="dml-lbl">Hari Mengajar / JP</span><span class="dml-sep">:</span><span class="dml-val">${formatJadwalText(state.jadwal)}</span></div>
    </div>
  </div>

  <!-- SECTION A -->
  <p style="font-size:var(--fs);font-weight:700;margin-bottom:6px;">A. Jumlah Pekan dalam Semester ${semLabel}</p>
  <div class="prota-wrap" style="margin-bottom:18px;">
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <colgroup>
        <col style="width:40px;">
        <col>
        <col style="width:110px;">
        <col style="width:110px;">
        <col style="width:110px;">
        <col>
      </colgroup>
      <thead>
        <tr>
          <th ${thStyle} rowspan="2">No.</th>
          <th ${thL} rowspan="2" style="text-align:center;">Bulan</th>
          <th ${thStyle} colspan="3">Jumlah Pekan</th>
          <th ${thStyle} rowspan="2">Keterangan</th>
        </tr>
        <tr>
          <th ${thStyle}>Seluruhnya</th>
          <th ${thStyle}>Tidak Efektif</th>
          <th ${thStyle}>Efektif</th>
        </tr>
      </thead>
      <tbody>
        ${sectionA
          .map(
            (r, i) => `
        <tr style="${i % 2 === 1 ? "background:#F2F2F2" : ""}">
          <td ${tdN}>${i + 1}</td>
          <td ${tdL}>${r.nama}</td>
          <td ${tdC}>${r.total}</td>
          <td ${tdC}>${r.tidak}</td>
          <td ${tdC}>${r.efektif}</td>
          <td ${tdC}> - </td>
        </tr>`,
          )
          .join("")}
      </tbody>
      <tfoot><tr>
        <td colspan="2" style="padding:6px 8px;background:#BDD7EE;color:#000;font-weight:700;text-align:center;font-size:var(--fs);border:1px solid #1E3A5F;">Jumlah</td>
        <td style="padding:6px 8px;background:#BDD7EE;color:#000;font-weight:700;text-align:center;border:1px solid #1E3A5F;">${totalAll}</td>
        <td style="padding:6px 8px;background:#BDD7EE;color:#000;font-weight:700;text-align:center;border:1px solid #1E3A5F;">${totalTidak}</td>
        <td style="padding:6px 8px;background:#BDD7EE;color:#000;font-weight:700;text-align:center;border:1px solid #1E3A5F;">${totalEfektif}</td>
        <td style="padding:6px 8px;background:#BDD7EE;color:#000;border:1px solid #1E3A5F;"></td>
      </tr></tfoot>
    </table>
  </div>

  <!-- SECTION B -->
  <p style="font-size:var(--fs);font-weight:700;margin-bottom:6px;">B. Jumlah Pekan Tidak Efektif dalam Semester ${semLabel}</p>
  <div class="prota-wrap" style="margin-bottom:18px;">
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <colgroup>
        <col style="width:40px;">
        <col>
        <col style="width:110px;">
        <col>
      </colgroup>
      <thead><tr>
        <th ${thStyle}>No.</th>
        <th ${thStyle}>Kegiatan</th>
        <th ${thStyle}>Jumlah Pekan</th>
        <th ${thStyle}>Keterangan</th>
      </tr></thead>
      <tbody>
        ${sectionB
          .map(
            (r, i) => `
        <tr style="${i % 2 === 1 ? "background:#F2F2F2" : ""}">
          <td ${tdN.replace('style="', 'style="vertical-align:top;')}>${i + 1}</td>
          <td ${tdL.replace('style="', 'style="vertical-align:top;')}>${r.ket}</td>
          <td ${tdC.replace('style="', 'style="vertical-align:top;')}>${r.jumlah}</td>
          <td ${tdL.replace('style="', 'style="vertical-align:top;')}>${r.ketStr}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
      <tfoot><tr>
        <td colspan="2" style="padding:6px 8px;background:#BDD7EE;color:#000;font-weight:700;text-align:center;font-size:var(--fs);border:1px solid #1E3A5F;">Jumlah</td>
        <td style="padding:6px 8px;background:#BDD7EE;color:#000;font-weight:700;text-align:center;border:1px solid #1E3A5F;">${totalB}</td>
        <td style="padding:6px 8px;background:#BDD7EE;color:#000;border:1px solid #1E3A5F;"></td>
      </tr></tfoot>
    </table>
  </div>

  <!-- SECTION C -->
  <p style="font-size:var(--fs);font-weight:700;margin-bottom:10px;">C. Perhitungan Jumlah Pekan dan Jam Efektif</p>
  <div style="margin-bottom:24px;font-size:var(--fs);">
    <table class="layout-tbl" style="border-collapse:collapse;">
      <tbody>
        <tr>
          <td style="padding:2px 0;min-width:200px;vertical-align:top;">Jumlah Pekan Efektif</td>
          <td style="padding:2px 10px;vertical-align:top;">=</td>
          <td style="padding:2px 0;vertical-align:top;">Jumlah Pekan Satu Semester &minus; Pekan Tidak Efektif</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding:2px 10px;">=</td>
          <td>${totalAll} &minus; ${totalTidak}</td>
        </tr>
        <tr>
          <td style="padding-bottom:16px;"></td>
          <td style="padding:2px 10px;padding-bottom:16px;">=</td>
          <td style="font-weight:700;padding-bottom:16px;">${totalEfektif} Pekan</td>
        </tr>
        <tr>
          <td style="padding:2px 0;vertical-align:top;">Jumlah Jam Efektif</td>
          <td style="padding:2px 10px;vertical-align:top;">=</td>
          <td style="vertical-align:top;">Jumlah Pekan Efektif &times; JP per Pekan</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding:2px 10px;">=</td>
          <td>${totalEfektif} &times; ${jpPerPekan}</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding:2px 10px;">=</td>
          <td style="font-weight:700;">${jamEfektif} JP</td>
        </tr>
      </tbody>
    </table>
  </div>

  ${renderDUSignHTML(du)}`;
      }

      // ============================================================
      // EXPORT ALL PDF
      // ============================================================

      function markDirty() {
        isGenerated = false;
        if (typeof state !== "undefined" && state) state.isGenerated = false;
        const btn = document.querySelector(".btn-gen");
        if (btn) btn.classList.remove("generated");
        const outNav = document.getElementById("output-nav-section");
        if (outNav) {
          outNav.classList.add("hidden");
          outNav.classList.add("disabled-section");
          outNav.title = "Silakan klik Generate Dokumen terlebih dahulu";
        }

        // Switch away from output tabs if currently active
        const outputTabs = ["kalender", "atp", "rpe", "jurnal", "prota", "prosem", "absensi", "kktp", "nilai"];
        const activeTabPane = document.querySelector(".tab-pane.active");
        if (activeTabPane) {
          const activeId = activeTabPane.id ? activeTabPane.id.replace("tab-", "") : "";
          if (outputTabs.includes(activeId)) {
            showTab("data-umum");
          }
        }
      }

      function markGenerated() {
        isGenerated = true;
        if (typeof state !== "undefined" && state) state.isGenerated = true;
        const btn = document.querySelector(".btn-gen");
        if (btn) btn.classList.add("generated");
        const outNav = document.getElementById("output-nav-section");
        if (outNav) {
          outNav.classList.remove("hidden");
          outNav.classList.remove("disabled-section");
          outNav.title = "";
        }
      }

      function updateTPStatsOnly() {
        const hG = buildHariEfektif(1);
        const hE = buildHariEfektif(2);
        const jpTG = state.tpGanjil.reduce((s, t) => s + +t.jp, 0);
        const jpTE = state.tpGenap.reduce((s, t) => s + +t.jp, 0);
        const jpAG = hG.reduce((s, h) => s + h.jp, 0);
        const jpAE = hE.reduce((s, h) => s + h.jp, 0);
        renderTPStats(1, jpTG, jpAG);
        renderTPStats(2, jpTE, jpAE);
      }

      function renderTPStats(sem, jpTotal, jpAvail) {
        const semStr = sem === 1 ? "ganjil" : "genap";
        const el = document.getElementById("stats-tp-" + semStr);
        if (!el) return;
        const sisa = jpAvail - jpTotal;
        const silaColor =
          sisa < 0 ? "#FF2D55" : sisa === 0 ? "#374151" : "#4DAF7C";
        el.innerHTML = `
    <div class="stat-box"><div class="stat-lbl">Total JP Dibutuhkan</div><div class="stat-val">${jpTotal} JP</div></div>
    <div class="stat-box"><div class="stat-lbl">JP Tersedia</div><div class="stat-val">${jpAvail} JP</div></div>
    <div class="stat-box"><div class="stat-lbl">Sisa JP</div><div class="stat-val" style="color:${silaColor};">${sisa} JP</div></div>`;
      }

      // ============================================================
      // RENDER JURNAL
      // ============================================================
      function renderJurnal(sem, du, dist) {
        const semLabel = sem === 1 ? "Ganjil" : "Genap";
        const jpPerPekan = state.jadwal.reduce((s, j) => s + (+j.jp || 0), 0);

        // Format date range for a TP
        function fmtRange(tMul, tSel) {
          if (!tMul) return " - ";
          if (!tSel || tMul === tSel) return fmtD(tMul);
          const [y1, m1, d1] = tMul.split("-").map(Number);
          const [y2, m2, d2] = tSel.split("-").map(Number);
          if (m1 === m2 && y1 === y2)
            return `${d1} - ${d2} ${BULAN[m1 - 1]} ${y1}`;
          if (y1 === y2)
            return `${d1} ${BULAN[m1 - 1]} - ${d2} ${BULAN[m2 - 1]} ${y1}`;
          return `${fmtD(tMul)} - ${fmtD(tSel)}`;
        }

        const rows = dist
          .map(
            (item, i) => {
              const isSumatif = item.ev || /sumatif/i.test(item.tp || "");
              const asesmenText = isSumatif ? "Sumatif" : "Formatif";
              const pertemuanCount =
                item.pertemuanList && item.pertemuanList.length > 0
                  ? item.pertemuanList.length
                  : item.tMul
                    ? 1
                    : " - ";

              let tanggalCellHtml = " - ";
              if (item.pertemuanList && item.pertemuanList.length > 0) {
                const listItems = item.pertemuanList
                  .map((p) => {
                    const dateStr = fmtJurnalDate(p.tanggal, p.jp);
                    return `<li style="margin-bottom:2px;line-height:1.35;white-space:nowrap;">${dateStr}</li>`;
                  })
                  .join("");
                tanggalCellHtml = `<ul style="margin:0;padding-left:16px;text-align:left;list-style-type:disc;">${listItems}</ul>`;
              } else if (item.tMul) {
                tanggalCellHtml = fmtRange(item.tMul, item.tSel);
              }

              return `
    <tr class="${item.ev ? "eval-row" : ""}${i % 2 === 1 ? " zebra" : ""}">
      <td style="padding:5px 4px;border:1px solid #1E3A5F;text-align:center;vertical-align:top;white-space:nowrap;">${i + 1}</td>
      <td style="padding:5px 8px;border:1px solid #1E3A5F;text-align:center;font-weight:normal;vertical-align:top;">${item.kode}</td>
      <td style="padding:5px 8px;border:1px solid #1E3A5F;text-align:left;vertical-align:top;">${item.tp}</td>
      <td style="padding:5px 8px;border:1px solid #1E3A5F;text-align:left;vertical-align:top;">${item.mp || " - "}</td>
      <td style="padding:5px 6px;border:1px solid #1E3A5F;text-align:center;vertical-align:top;white-space:nowrap;">${pertemuanCount}</td>
      <td style="padding:5px 8px;border:1px solid #1E3A5F;text-align:center;vertical-align:top;white-space:nowrap;">${asesmenText}</td>
      <td style="padding:5px 8px;border:1px solid #1E3A5F;text-align:left;vertical-align:top;">${tanggalCellHtml}</td>
    </tr>`;
            },
          )
          .join("");

        if(document.getElementById(`jurnal-${sem}-content`)) document.getElementById(`jurnal-${sem}-content`).innerHTML = `
  <div class="doc-frame">
    <div class="doc-info">
      <div style="text-align:center;margin-bottom:10px;">
          <div class="doc-title">Jurnal Harian</div>
          <div class="doc-title" style="margin-top:2px;">Pelaksanaan Pembelajaran</div>
        </div>
      <div class="doc-meta-list">
        <div class="dml-row"><span class="dml-lbl">Nama Sekolah</span><span class="dml-sep">:</span><span class="dml-val">${du.sekolah}</span></div>
        <div class="dml-row"><span class="dml-lbl">Mata Pelajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.mapel}</span></div>
        <div class="dml-row"><span class="dml-lbl">Fase / Kelas</span><span class="dml-sep">:</span><span class="dml-val">${escH(formatFaseKelas(du.fase, du.kelas))}</span></div>
        <div class="dml-row"><span class="dml-lbl">Semester</span><span class="dml-sep">:</span><span class="dml-val">${semLabel}</span></div>
        <div class="dml-row"><span class="dml-lbl">Tahun Ajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.tahun}</span></div>
        <div class="dml-row"><span class="dml-lbl">JP per Pekan</span><span class="dml-sep">:</span><span class="dml-val">${jpPerPekan} JP</span></div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:var(--fs);margin-bottom:0;">
      <thead>
        <tr>
          <th style="background:#BDD7EE;color:#000;padding:6px 4px;border:1px solid #1E3A5F;font-weight:700;text-align:center;width:40px;min-width:40px;white-space:nowrap;">No.</th>
          <th style="background:#BDD7EE;color:#000;padding:6px 8px;border:1px solid #1E3A5F;font-weight:700;text-align:center;width:65px;min-width:60px;">Kode TP</th>
          <th style="background:#BDD7EE;color:#000;padding:6px 8px;border:1px solid #1E3A5F;font-weight:700;text-align:center;">Alur Tujuan Pembelajaran</th>
          <th style="background:#BDD7EE;color:#000;padding:6px 8px;border:1px solid #1E3A5F;font-weight:700;text-align:center;width:170px;">Materi</th>
          <th style="background:#BDD7EE;color:#000;padding:6px 6px;border:1px solid #1E3A5F;font-weight:700;text-align:center;width:75px;min-width:70px;white-space:nowrap;">Jml Pertemuan</th>
          <th style="background:#BDD7EE;color:#000;padding:6px 8px;border:1px solid #1E3A5F;font-weight:700;text-align:center;width:80px;white-space:nowrap;">Asesmen</th>
          <th style="background:#BDD7EE;color:#000;padding:6px 8px;border:1px solid #1E3A5F;font-weight:700;text-align:center;width:220px;min-width:200px;">Tanggal Pelaksanaan</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <style>
      .zebra td{background:#F2F2F2!important;}
      .eval-row td{background:#FFF2CC!important;}
    </style>
    ${renderDUSignHTML(du)}
  </div>`;
      }

      // ============================================================
      // PENGATURAN PENILAIAN
      // ============================================================
      function migratePengaturan(arr) {
        if (!arr) arr = [];
        
        // Deduplicate input array by treating 'nr' and 'slm' as the same ID 'slm'
        let seenIds = new Set();
        let dedupedInput = [];
        arr.forEach((p) => {
          let testId = (p.id === "nr" || p.id === "slm") ? "slm" : p.id;
          if (!seenIds.has(testId)) {
            seenIds.add(testId);
            dedupedInput.push(p);
          }
        });

        let newArr = [];
        let hasSlm = dedupedInput.some(p => p.id === "nr" || p.id === "slm");
        let hasSas = dedupedInput.some(p => p.id === "sas");

        // Process existing items in their current order
        dedupedInput.forEach((p) => {
          if (p.id === "nr" || p.id === "slm") {
            p.id = "slm";
            if (!p.name || p.name === "Nilai Rataan TP") {
              p.name = "Sumatif Lingkup Materi";
            }
            p.code = p.code !== undefined ? p.code : "SLM";
            p.fixed = true;
            if (p.active === undefined) p.active = true;
            if (!p.subKomponents) p.subKomponents = [];
            newArr.push(p);
          } else if (p.id === "sas") {
            p.code = p.code !== undefined ? p.code : "SAS";
            p.fixed = true;
            if (p.active === undefined) p.active = true;
            if (!p.subKomponents) {
              p.subKomponents = [
                { id: "sasnt", name: "Nontes", code: "Nontes" },
                { id: "sast", name: "Tes", code: "Tes" }
              ];
            } else {
              p.subKomponents.forEach(sub => {
                if (sub.name && /^non[\s-]?tes$/i.test(sub.name.trim())) sub.name = "Nontes";
                if (sub.code && /^non[\s-]?tes$/i.test(sub.code.trim())) sub.code = "Nontes";
              });
            }
            newArr.push(p);
          } else {
            p.code = p.code !== undefined ? p.code : (p.name || "KMP");
            if (p.active === undefined) p.active = true;
            if (!p.subKomponents) {
              p.subKomponents = [];
            } else {
              p.subKomponents.forEach(sub => {
                if (sub.name && /^non[\s-]?tes$/i.test(sub.name.trim())) sub.name = "Nontes";
                if (sub.code && /^non[\s-]?tes$/i.test(sub.code.trim())) sub.code = "Nontes";
              });
            }
            newArr.push(p);
          }
        });

        // Add slm if missing
        if (!hasSlm) {
          newArr.unshift({
            id: "slm",
            name: "Sumatif Lingkup Materi",
            code: "SLM",
            bobot: 50,
            fixed: true,
            active: true,
            subKomponents: [],
          });
        }

        // Add sas if missing (insert right after slm if exists)
        if (!hasSas) {
          const slmIdx = newArr.findIndex(p => p.id === "slm");
          const sasObj = {
            id: "sas",
            name: "Sumatif Akhir Semester",
            code: "SAS",
            bobot: 50,
            fixed: true,
            active: true,
            subKomponents: [
              { id: "sasnt", name: "Nontes", code: "Nontes" },
              { id: "sast", name: "Tes", code: "Tes" }
            ],
          };
          if (slmIdx !== -1) {
            newArr.splice(slmIdx + 1, 0, sasObj);
          } else {
            newArr.unshift(sasObj);
          }
        }

        return newArr;
      }

      function renderKKTP() {
        const t = document.getElementById("body-kktp");
        if (!t) return;
        t.innerHTML = state.kktp
          .map((k, i) => `<tr>
            <td style="text-align:center;font-weight:normal;white-space:nowrap;">
              Rentang &nbsp; ${i + 1}
            </td>
            <td><input type="text" value="${escH(k.val)}" style="width:100%;padding:6px;border:1px solid var(--border);border-radius:4px;outline:none;" onchange="state.kktp[${i}].val=this.value;scheduleSave();markDirty();"></td>
            <td style="display:flex; gap:6px; align-items:center; border:none; border-bottom:1px solid var(--border-light, #1e3a5f);">
              <input type="text" value="${escH(k.desc)}" style="width:100%;padding:6px;border:1px solid var(--border);border-radius:4px;outline:none;" onchange="state.kktp[${i}].desc=this.value;scheduleSave();markDirty();">
              ${state.kktp.length > 1 ? `<button onclick="removeKKTP(${i})" title="Hapus" style="color:var(--danger, #ef4444);background:none;border:none;cursor:pointer;padding:6px;display:flex;align-items:center;justify-content:center;border-radius:4px;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'"><i class="material-symbols-rounded" style="font-size:20px;" data-lucide="trash"></i></button>` : ''}
            </td>
          </tr>`)
          .join("");
      }

      function addKKTP() {
        state.kktp.push({ val: "", desc: "" });
        scheduleSave();
        markDirty();
        renderKKTP();
      }

      function removeKKTP(index) {
        state.kktp.splice(index, 1);
        scheduleSave();
        markDirty();
        renderKKTP();
      }

      function calculateTotalBobot(sem) {
        const arr = sem === 1 ? state.pengaturanPenilaianGanjil : state.pengaturanPenilaianGenap;
        return (arr || []).filter(p => p.active !== false).reduce((sum, p) => sum + (parseFloat(p.bobot) || 0), 0);
      }

      function updatePengaturanPenilaianSummary(sem) {
        const totalBobot = calculateTotalBobot(sem);
        const semName = sem === 1 ? "Ganjil" : "Genap";

        const bannerEl = document.getElementById(`pp-status-banner-${sem}`);
        if (bannerEl) {
          if (totalBobot === 100) {
            bannerEl.innerHTML = `
              <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(34,197,94,0.12); border:1px solid #22c55e; color:#166534; padding:10px 14px; border-radius:8px; font-size:13px; font-weight:500;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <i class="material-symbols-rounded" style="font-size:20px; color:#22c55e;" data-lucide="check-circle"></i>
                  <span>Total bobot komponen aktif Semester ${semName}: <b>100%</b> (Tepat &amp; Sesuai Standar Penilaian).</span>
                </div>
                <span style="background:#22c55e; color:#fff; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px;">Valid 100%</span>
              </div>
            `;
          } else {
            const diffText = totalBobot < 100 ? `Kurang ${(100 - totalBobot).toFixed(0)}%` : `Kelebihan ${(totalBobot - 100).toFixed(0)}%`;
            bannerEl.innerHTML = `
              <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#991b1b; padding:10px 14px; border-radius:8px; font-size:13px; font-weight:500;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <i class="material-symbols-rounded" style="font-size:20px; color:#ef4444;" data-lucide="alert-circle"></i>
                  <span>Total bobot komponen aktif Semester ${semName}: <b>${totalBobot}%</b> (${diffText}). Total harus tepat <b>100%</b> sebelum disimpan.</span>
                </div>
                <span style="background:#ef4444; color:#fff; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px;">${diffText}</span>
              </div>
            `;
          }
        }

        const tfootEl = document.getElementById(`foot-pengaturan-penilaian-${sem}`);
        if (tfootEl) {
          tfootEl.innerHTML = `
            <tr style="background: rgba(0,0,0,0.04); font-weight: 700;">
              <td colspan="3" style="text-align: right; padding: 10px 14px; font-size: 13px; color: var(--text);">Total Bobot Komponen Aktif:</td>
              <td style="text-align: center; padding: 10px 14px; font-size: 14px; font-weight: 700; ${totalBobot === 100 ? 'color: #16a34a;' : 'color: #dc2626;'}">
                ${totalBobot}%
              </td>
              <td style="text-align: center; padding: 10px 8px;">
                ${totalBobot === 100 
                  ? '<span style="color:#16a34a; font-size:12px; font-weight:600; display:inline-flex; align-items:center; gap:4px;"><i class="material-symbols-rounded" style="font-size:16px;" data-lucide="check"></i> 100%</span>' 
                  : `<span style="color:#dc2626; font-size:11px; font-weight:600; display:inline-flex; align-items:center; gap:2px;"><i class="material-symbols-rounded" style="font-size:15px;" data-lucide="alert-triangle"></i> ${totalBobot < 100 ? '-' + (100 - totalBobot) + '%' : '+' + (totalBobot - 100) + '%'}</span>`
                }
              </td>
            </tr>
          `;
        }
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      function updateBobotPenilaian(sem, idx, val, isLiveInput = false) {
        const targetKey = sem === 1 ? "pengaturanPenilaianGanjil" : "pengaturanPenilaianGenap";
        if (state[targetKey] && state[targetKey][idx]) {
          let numVal = parseFloat(val);
          if (isNaN(numVal)) numVal = 0;
          numVal = Math.max(0, Math.min(100, numVal));
          state[targetKey][idx].bobot = numVal;
          if (isLiveInput) {
            updatePengaturanPenilaianSummary(sem);
          } else {
            renderPengaturanPenilaian();
          }
          if (typeof renderNilai === "function") {
            renderNilai(1);
            renderNilai(2);
          }
          scheduleSave();
          markDirty();
        }
      }

      function toggleActivePenilaian(sem, idx, checked) {
        const targetKey = sem === 1 ? "pengaturanPenilaianGanjil" : "pengaturanPenilaianGenap";
        if (state[targetKey] && state[targetKey][idx]) {
          state[targetKey][idx].active = checked;
          renderPengaturanPenilaian();
          renderNilai(1);
          renderNilai(2);
          scheduleSave();
          markDirty();
        }
      }

      async function simpanPengaturanPenilaian(specificSem = null) {
        const semsToCheck = specificSem ? [specificSem] : [1, 2];
        for (const sem of semsToCheck) {
          const semName = sem === 1 ? "Ganjil" : "Genap";
          const total = calculateTotalBobot(sem);
          if (total !== 100) {
            const diffStr = total < 100 ? `kurang ${(100 - total).toFixed(0)}%` : `kelebihan ${(total - 100).toFixed(0)}%`;
            if (typeof showCustomAlert === "function") {
              showCustomAlert(
                "Validasi Bobot Belum Tepat",
                `Total bobot komponen penilaian aktif Semester ${semName} saat ini adalah <b>${total}%</b> (${diffStr}).<br><br>Sesuai aturan penilaian, total bobot persentase seluruh komponen aktif (Sumatif, STS, SAS) harus <b>tepat 100%</b> sebelum dapat disimpan.<br><br>Silakan sesuaikan bobot komponen penilaian terlebih dahulu.`,
                "warning"
              );
            } else {
              alert(`Total bobot komponen aktif Semester ${semName} adalah ${total}% (${diffStr}). Total bobot harus tepat 100% sebelum dapat disimpan.`);
            }
            if (typeof switchSemContent === "function") switchSemContent("pp", sem);
            return false;
          }
        }

        if (currentUser && currentKelasId) {
          await saveKelasData(currentUser.uid, currentKelasId);
        } else {
          if (typeof scheduleSave === "function") scheduleSave();
        }
        if (typeof showSaveIndicator === "function") {
          showSaveIndicator("Pengaturan Penilaian Tersimpan! ✨", "success", "Total bobot seluruh komponen aktif tepat 100%.");
        }
        return true;
      }

      function renderPengaturanPenilaian() {
        state.pengaturanPenilaianGanjil = migratePengaturan(
          state.pengaturanPenilaianGanjil,
        );
        state.pengaturanPenilaianGenap = migratePengaturan(
          state.pengaturanPenilaianGenap,
        );

        const renderForSem = (sem) => {
          const arr =
            sem === 1
              ? state.pengaturanPenilaianGanjil
              : state.pengaturanPenilaianGenap;

          updatePengaturanPenilaianSummary(sem);

          const tbodyEl = document.getElementById(`body-pengaturan-penilaian-${sem}`);
          if (tbodyEl) {
            tbodyEl.innerHTML = (arr || [])
              .map(
                (p, i) => {
                  const subStr = p.subKomponents && p.subKomponents.length > 0 
                    ? p.subKomponents.map(sk => escH(sk.name + (sk.code ? ` (${sk.code})` : ''))).join(", ") 
                    : "";
                  
                  const upDisabled = i === 0;
                  const downDisabled = i === arr.length - 1;

                  return `
        <tr>
          <td class="td-ctr">${i + 1}</td>
          <td class="td-ctr">
            <input type="checkbox" ${p.active ? "checked" : ""} onchange="toggleActivePenilaian(${sem}, ${i}, this.checked)" title="Tampilkan/Sembunyikan kolom ini di tabel daftar nilai">
          </td>
          <td>
            <div style="display:flex; flex-direction:column; gap:2px;">
              <span style="font-weight:600; color:var(--text);">${escH(p.name)} ${p.fixed ? `<span style="font-size:var(--fs-xs);color:var(--text-light);font-weight:normal;">(Default)</span>` : ""}</span>
              ${p.code ? `<span style="font-size:var(--fs-xs);color:var(--text-light);">Kode: <b>${escH(p.code)}</b></span>` : ""}
              ${subStr ? `<span style="font-size:var(--fs-xs);color:var(--accent);font-weight:500;">Sub: ${subStr}</span>` : ""}
            </div>
          </td>
          <td class="td-ctr">
            <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
              <input type="number" min="0" max="100" style="width:70px; text-align:center;" value="${p.bobot}" placeholder="Bobot" oninput="updateBobotPenilaian(${sem}, ${i}, this.value, true)" onchange="updateBobotPenilaian(${sem}, ${i}, this.value, false)">
              <span style="font-weight:600; font-size:13px; color:var(--text-light);">%</span>
            </div>
          </td>
          <td>
            <div style="display: grid; grid-template-columns: repeat(4, 28px); gap: 6px; justify-content: center; align-items: center;">
              <button class="btn-up" onclick="movePengaturanPenilaian(${sem}, ${i}, -1)" title="Pindahkan Ke Atas" ${upDisabled ? 'disabled style="color:var(--text-muted, #64748b); opacity:0.3; cursor:not-allowed; background:none; border:none; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:6px;"' : 'style="color:var(--text, #f8fafc); background:none; border:none; cursor:pointer; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:6px; transition: background 0.15s;" onmouseover="this.style.background=\'rgba(255,255,255,0.08)\'" onmouseout="this.style.background=\'none\'"'}>
                <i class="material-symbols-rounded" style="font-size:18px" data-lucide="arrow-up"></i>
              </button>
              <button class="btn-down" onclick="movePengaturanPenilaian(${sem}, ${i}, 1)" title="Pindahkan Ke Bawah" ${downDisabled ? 'disabled style="color:var(--text-muted, #64748b); opacity:0.3; cursor:not-allowed; background:none; border:none; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:6px;"' : 'style="color:var(--text, #f8fafc); background:none; border:none; cursor:pointer; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:6px; transition: background 0.15s;" onmouseover="this.style.background=\'rgba(255,255,255,0.08)\'" onmouseout="this.style.background=\'none\'"'}>
                <i class="material-symbols-rounded" style="font-size:18px" data-lucide="arrow-down"></i>
              </button>
              <button class="btn-edit" onclick="openEditKomponenModal(${sem}, ${i})" title="Edit" style="color:var(--accent, #3b82f6); background:none; border:none; cursor:pointer; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:6px; transition: background 0.15s;" onmouseover="this.style.background=\'rgba(59,130,246,0.1)\'" onmouseout="this.style.background=\'none\'">
                <i class="material-symbols-rounded" style="font-size:18px" data-lucide="edit"></i>
              </button>
              ${p.fixed ? `<div style="width:28px; height:28px;"></div>` : `<button class="btn-del" onclick="removePengaturanPenilaian(${sem}, ${i})" title="Hapus" style="color:var(--danger, #ef4444); background:none; border:none; cursor:pointer; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:6px; transition: background 0.15s;" onmouseover="this.style.background=\'rgba(239,68,68,0.1)\'" onmouseout="this.style.background=\'none\'"><i class="material-symbols-rounded" style="font-size:18px" data-lucide="trash"></i></button>`}
            </div>
          </td>
        </tr>`;
                }
              )
              .join("");
          }
        };
        renderForSem(1);
        renderForSem(2);
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      function movePengaturanPenilaian(sem, index, direction) {
        const targetKey = sem === 1 ? "pengaturanPenilaianGanjil" : "pengaturanPenilaianGenap";
        const arr = state[targetKey];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= arr.length) return;

        // Swap items
        const temp = arr[index];
        arr[index] = arr[newIndex];
        arr[newIndex] = temp;

        // Re-render
        renderPengaturanPenilaian();
        renderNilai(1);
        renderNilai(2);
        scheduleSave();
        markDirty();
      }

      let editingKomponenSem = null;
      let editingKomponenIdx = null;
      let tempSubKomponents = [];

      function openEditKomponenModal(sem, index) {
        editingKomponenSem = sem;
        editingKomponenIdx = index;
        const targetKey = sem === 1 ? "pengaturanPenilaianGanjil" : "pengaturanPenilaianGenap";
        const comp = state[targetKey][index];
        if (!comp) return;

        document.getElementById("edit-comp-name").value = comp.name || "";
        document.getElementById("edit-comp-code").value = comp.code || "";
        document.getElementById("edit-comp-bobot").value = comp.bobot || 0;

        tempSubKomponents = comp.subKomponents ? JSON.parse(JSON.stringify(comp.subKomponents)) : [];

        renderEditSubKomponentsList();
        document.getElementById("modal-edit-komponen").classList.remove("hidden");
        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      function syncTempSubKomponentsFromDOM() {
        const rows = document.querySelectorAll("#edit-sub-comps-container .sub-comp-item");
        if (rows && rows.length > 0) {
          const synced = [];
          rows.forEach((row, idx) => {
            const nameInp = row.querySelector(".sub-comp-name-inp");
            const codeInp = row.querySelector(".sub-comp-code-inp");
            const sName = nameInp ? nameInp.value : "";
            const sCode = codeInp ? codeInp.value : "";
            synced.push({
              id: row.dataset.id || (tempSubKomponents[idx] && tempSubKomponents[idx].id) || ("sub_" + Date.now() + "_" + idx),
              name: sName,
              code: sCode
            });
          });
          tempSubKomponents = synced;
        }
      }

      function renderEditSubKomponentsList() {
        const container = document.getElementById("edit-sub-comps-container");
        if (!container) return;

        if (tempSubKomponents.length === 0) {
          container.innerHTML = `<div style="font-size: var(--fs-xs); color: var(--text-light); text-align: center; padding: 12px; border: 1px dashed var(--border); border-radius: 6px;">Belum ada sub komponen. Komponen ini akan memiliki satu kolom input tunggal.</div>`;
          return;
        }

        container.innerHTML = tempSubKomponents.map((sub, sIdx) => `
          <div class="sub-comp-item" data-id="${escH(sub.id || '')}" style="display: flex; gap: 8px; align-items: center; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; border: 1px solid var(--border-light, var(--border));">
            <div style="flex: 2;">
              <input type="text" class="sub-comp-name-inp" value="${escH(sub.name)}" placeholder="Nama Sub (Misal: Nontes)" style="width:100%; padding:6px 10px; font-size: 13px; background: rgba(255,255,255,0.05); color: var(--text); border: 1px solid var(--border); border-radius: 4px;" oninput="if (tempSubKomponents[${sIdx}]) tempSubKomponents[${sIdx}].name=this.value;">
            </div>
            <div style="flex: 1;">
              <input type="text" class="sub-comp-code-inp" value="${escH(sub.code || "")}" placeholder="Kode (Misal: NT)" style="width:100%; padding:6px 10px; font-size: 13px; background: rgba(255,255,255,0.05); color: var(--text); border: 1px solid var(--border); border-radius: 4px;" oninput="if (tempSubKomponents[${sIdx}]) tempSubKomponents[${sIdx}].code=this.value;">
            </div>
            <button type="button" onclick="removeEditSubKomponen(${sIdx})" style="color:var(--danger, #ef4444); background:none; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; justify-content:center; border-radius:4px;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'">
              <i class="material-symbols-rounded" style="font-size:18px" data-lucide="trash"></i>
            </button>
          </div>
        `).join("");

        if (typeof lucide !== "undefined") lucide.createIcons();
      }

      function addEditSubKomponen() {
        syncTempSubKomponentsFromDOM();
        tempSubKomponents.push({
          id: "sub_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          name: "",
          code: ""
        });
        renderEditSubKomponentsList();
      }

      function removeEditSubKomponen(idx) {
        syncTempSubKomponentsFromDOM();
        tempSubKomponents.splice(idx, 1);
        renderEditSubKomponentsList();
      }

      function tutupModalEditKomponen() {
        const modal = document.getElementById("modal-edit-komponen");
        if (modal) modal.classList.add("hidden");
        editingKomponenSem = null;
        editingKomponenIdx = null;
        tempSubKomponents = [];
      }

      function simpanModalEditKomponen() {
        if (editingKomponenSem === null || editingKomponenIdx === null) return;
        const targetKey = editingKomponenSem === 1 ? "pengaturanPenilaianGanjil" : "pengaturanPenilaianGenap";
        if (!state[targetKey] || !state[targetKey][editingKomponenIdx]) {
          tutupModalEditKomponen();
          return;
        }
        const comp = state[targetKey][editingKomponenIdx];

        const nameInput = (document.getElementById("edit-comp-name")?.value || "").trim();
        if (!nameInput) {
          showSaveIndicator("Nama Wajib Diisi", "error", "Nama Komponen Penilaian tidak boleh kosong!");
          document.getElementById("edit-comp-name")?.focus();
          return;
        }

        const codeInput = (document.getElementById("edit-comp-code")?.value || "").trim();
        const bobotVal = parseFloat(document.getElementById("edit-comp-bobot")?.value);
        const bobotInput = isNaN(bobotVal) ? 0 : Math.max(0, bobotVal);

        syncTempSubKomponentsFromDOM();

        const validSubComps = (tempSubKomponents || []).filter(sub => (sub.name && sub.name.trim()) || (sub.code && sub.code.trim())).map(sub => ({
          id: sub.id || ("sub_" + Date.now() + "_" + Math.floor(Math.random() * 1000)),
          name: (sub.name || "").trim() || (sub.code || "").trim(),
          code: (sub.code || "").trim() || (sub.name || "").trim()
        }));

        comp.name = nameInput;
        comp.code = codeInput;
        comp.bobot = bobotInput;
        comp.subKomponents = validSubComps;

        tutupModalEditKomponen();

        renderPengaturanPenilaian();
        renderNilai(1);
        renderNilai(2);
        scheduleSave();
        markDirty();
        showSaveIndicator("Perubahan Tersimpan", "success", "Komponen penilaian berhasil diperbarui");
      }

      function addPengaturanPenilaian(sem) {
        const targetKey =
          sem === 1 ? "pengaturanPenilaianGanjil" : "pengaturanPenilaianGenap";
        if (!state[targetKey]) state[targetKey] = [];
        const newIdx = state[targetKey].length;
        state[targetKey].push({
          id: "col_" + Date.now(),
          name: "Komponen Baru",
          code: "KMP",
          bobot: 0,
          fixed: false,
          subKomponents: [],
        });
        renderPengaturanPenilaian();
        scheduleSave();
        markDirty();
        openEditKomponenModal(sem, newIdx);
      }
      async function removePengaturanPenilaian(sem, i) {
        const ok = await confirmAsync("Hapus penilaian ini?");
        if (ok) {
          const targetKey =
            sem === 1
              ? "pengaturanPenilaianGanjil"
              : "pengaturanPenilaianGenap";
          state[targetKey].splice(i, 1);
          renderPengaturanPenilaian();
          scheduleSave();
          markDirty();
        }
      }

      // ============================================================
      // SISWA
      // ============================================================
      function migrateSiswaArr(arr) {
        if (!arr) return [];
        for (let i = 0; i < arr.length; i++) {
          if (typeof arr[i] === "string") {
            arr[i] = { name: arr[i], nis: "", nisn: "" };
          }
        }
        return arr;
      }

      function renderSiswa() {
        state.siswa = migrateSiswaArr(state.siswa);
        const arr = state.siswa;
        if (document.getElementById("cnt-siswa")) {
          document.getElementById("cnt-siswa").textContent = arr.length + " Murid";
        }
        if (document.getElementById("body-siswa")) {
          document.getElementById("body-siswa").innerHTML = arr
            .map(
              (s, i) => `
    <tr>
      <td class="td-ctr">${i + 1}</td>
      <td><input type="text" value="${escH(s.nis || "")}" placeholder="NIS" style="width:100%;text-align:center;padding:6px;border:1px solid var(--border);border-radius:4px;outline:none;" onchange="state.siswa[${i}].nis=this.value;scheduleSave();markDirty();"></td>
      <td><input type="text" value="${escH(s.nisn || "")}" placeholder="NISN" style="width:100%;text-align:center;padding:6px;border:1px solid var(--border);border-radius:4px;outline:none;" onchange="state.siswa[${i}].nisn=this.value;scheduleSave();markDirty();"></td>
      <td><input type="text" value="${escH(s.name)}" placeholder="Nama murid..." onchange="state.siswa[${i}].name=this.value;scheduleSave();markDirty();"></td>
      <td><button class="btn-del" onclick="removeSiswa(${i})" title="Hapus"><i class="material-symbols-rounded" style="font-size:18px" data-lucide="trash"></i></button></td>
    </tr>`,
            )
            .join("");
        }
        if (window.lucide) window.lucide.createIcons();
      }
      function addSiswa() {
        state.siswa.push({ name: "", nis: "", nisn: "" });
        renderSiswa();
        scheduleSave();
        markDirty();
      }
      function importSiswa() {
        document.getElementById("impor-siswa-textarea").value = "";
        document.getElementById("impor-siswa-append").checked = state.siswa.length > 0;
        document.getElementById("modal-impor-siswa").classList.remove("hidden");
      }

      function closeImporSiswaModal() {
        document.getElementById("modal-impor-siswa").classList.add("hidden");
      }

      async function submitImporSiswa() {
        const text = document.getElementById("impor-siswa-textarea").value;
        const isAppend = document.getElementById("impor-siswa-append").checked;
        
        const names = text
          .split("\n")
          .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
          .filter((s) => s.length > 0)
          .map((name) => ({ name, nis: "", nisn: "" }));

        if (names.length === 0) {
          await alert("Tidak ada nama yang ditemukan. Silakan tempelkan daftar nama terlebih dahulu.");
          return;
        }

        if (isAppend) {
          state.siswa.push(...names);
        } else {
          state.siswa = names;
        }

        renderSiswa();
        scheduleSave();
        markDirty();
        closeImporSiswaModal();
        await alert(`Berhasil mengimpor ${names.length} nama murid!`);
      }
      function removeSiswa(i) {
        state.siswa.splice(i, 1);
        // Re-index absensi data: entries with idx>i get shifted down, idx===i removed
        const shift = (absObj) => {
          const newObj = {};
          for (const [k, v] of Object.entries(absObj)) {
            const under = k.indexOf("_");
            const si = parseInt(k.substring(0, under));
            const iso = k.substring(under + 1);
            if (si === i) continue;
            newObj[`${si > i ? si - 1 : si}_${iso}`] = v;
          }
          return newObj;
        };
        state.absensiGanjil = shift(state.absensiGanjil);
        state.absensiGenap = shift(state.absensiGenap);
        renderSiswa();
        scheduleSave();
        markDirty();
      }

      async function clearAllSiswa() {
        if (!state.siswa || state.siswa.length === 0) {
          alert("Daftar murid sudah kosong.");
          return;
        }
        const ok1 = await confirmAsync("PERINGATAN: Semua data murid beserta rekap absensi dan nilai mereka akan dihapus secara permanen. Apakah Anda yakin?");
        if (!ok1) return;
        const ok2 = await confirmAsync("Apakah Anda BENAR-BENAR yakin? Tindakan ini tidak dapat dibatalkan!");
        if (!ok2) return;
        
        state.siswa = [];
        state.absensiGanjil = {};
        state.absensiGenap = {};
        if (state.nilaiGanjil) state.nilaiGanjil = {};
        if (state.nilaiGenap) state.nilaiGenap = {};
        
        renderSiswa();
        if (typeof generate === 'function') {
          generate();
        }
        scheduleSave();
        markDirty();
        alert("Semua data murid berhasil dihapus.");
      }

      // ============================================================
      // ABSENSI MONTH FILTER STATE
      // Stores Set of selected "YYYY-MM" keys per semester.
      // null = not yet initialised (generate() will set it to all months).
      // ============================================================
      const _absFilter = { 1: null, 2: null };
      const _absSplit = { 1: true, 2: true };
      let _lastDU = null; // cached du so month-toggle can re-render without full generate

      function _absAllMonths(sem) {
        const he = buildHariEfektif(sem);
        const order = [];
        const seen = new Set();
        for (const h of he) {
          const mk = h.tanggal.substring(0, 7);
          if (!seen.has(mk)) {
            seen.add(mk);
            order.push(mk);
          }
        }
        return order;
      }

      function setAbsensiMonth(sem, mKey) {
        const allM = _absAllMonths(sem);
        if (mKey === 'ALL') {
          _absFilter[sem] = new Set(allM);
        } else {
          if (_absFilter[sem] && _absFilter[sem].size === 1 && _absFilter[sem].has(mKey)) {
            _absFilter[sem] = new Set(allM);
          } else {
            _absFilter[sem] = new Set([mKey]);
          }
        }
        if (_lastDU) renderAbsensi(sem, _lastDU);
      }

      // ============================================================
      // ABSENSI TOGGLE (cell click)
      // ============================================================
      function toggleAbsensi(sem, si, iso, cellEl) {
        const absObj = sem === 1 ? state.absensiGanjil : state.absensiGenap;
        const key = `${si}_${iso}`;
        const cycle = ["", "H", "S", "I", "A"];
        const cur = absObj[key] || "";
        const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
        if (next === "") delete absObj[key];
        else absObj[key] = next;
        cellEl.textContent = next;
        cellEl.className = `clickable${next ? " abs-" + next : ""}`;
        const st = (id, v) => {
          const el = document.getElementById(id);
          if (el) el.textContent = v || "";
        };
        // Update per-month row totals for this student
        const sel = _absFilter[sem] || new Set(_absAllMonths(sem));
        const hariEfektif = buildHariEfektif(sem);
        const monthGroups = {};
        const monthOrder = [];
        for (const h of hariEfektif) {
          const mk = h.tanggal.substring(0, 7);
          if (!monthGroups[mk]) {
            monthGroups[mk] = [];
            monthOrder.push(mk);
          }
          monthGroups[mk].push(h.tanggal);
        }
        for (const mk of monthOrder) {
          if (!sel.has(mk)) continue;
          const mDates = monthGroups[mk];
          st(
            `absSum-${sem}-${si}-${mk}-H`,
            mDates.filter((d) => (absObj[`${si}_${d}`] || "") === "H").length,
          );
          st(
            `absSum-${sem}-${si}-${mk}-S`,
            mDates.filter((d) => (absObj[`${si}_${d}`] || "") === "S").length,
          );
          st(
            `absSum-${sem}-${si}-${mk}-I`,
            mDates.filter((d) => (absObj[`${si}_${d}`] || "") === "I").length,
          );
          st(
            `absSum-${sem}-${si}-${mk}-A`,
            mDates.filter((d) => (absObj[`${si}_${d}`] || "") === "A").length,
          );
        }
        // Update column summary for this date
        const n = state.siswa.length;
        st(
          `absDH-${sem}-${iso}`,
          Array.from(
            { length: n },
            (_, x) => (absObj[`${x}_${iso}`] || "") === "H",
          ).filter(Boolean).length,
        );
        st(
          `absDX-${sem}-${iso}`,
          Array.from({ length: n }, (_, x) => {
            const v = absObj[`${x}_${iso}`] || "";
            return v === "S" || v === "I" || v === "A";
          }).filter(Boolean).length,
        );
        scheduleSave();
      }

      // ============================================================
      // RENDER ABSENSI
      // ============================================================
      function renderAbsensi(sem, du) {
        if (du) _lastDU = du;
        else du = _lastDU;
        const semLabel = sem === 1 ? "Ganjil" : "Genap";
        const hariEfektif = buildHariEfektif(sem);
        const absObj = sem === 1 ? state.absensiGanjil : state.absensiGenap;
        const siswa = state.siswa;
        const el = document.getElementById(`absensi-${sem}-content`);

        if (siswa.length === 0) {
          el.innerHTML = `<div class="empty"><div class="ic"><i class="material-symbols-rounded" style="font-size:48px; color:inherit" data-lucide="users"></i></div><h3>Daftar murid kosong</h3>
      <p>Tambahkan nama murid di tab <strong>Daftar Murid</strong> terlebih dahulu, lalu klik <strong><i class="material-symbols-rounded" style="font-size:16px; vertical-align:middle;" data-lucide="zap"></i> Generate</strong> lagi.</p></div>`;
          return;
        }
        if (hariEfektif.length === 0) {
          el.innerHTML = `<div class="empty"><div class="ic"><i class="material-symbols-rounded" style="font-size:48px; color:inherit" data-lucide="calendar-days"></i></div><h3>Tidak ada hari efektif</h3>
      <p>Periksa pengaturan jadwal dan libur semester ${semLabel}.</p></div>`;
          return;
        }

        // Build full month order and groups
        const monthGroups = {};
        const monthOrder = [];
        for (const h of hariEfektif) {
          const mk = h.tanggal.substring(0, 7);
          if (!monthGroups[mk]) {
            monthGroups[mk] = [];
            monthOrder.push(mk);
          }
          monthGroups[mk].push(h.tanggal);
        }

        // Initialise filter if not yet set
        if (!_absFilter[sem]) _absFilter[sem] = new Set(monthOrder);
        const sel = _absFilter[sem];

        // Selected months in order
        const selMonths = monthOrder.filter((mk) => sel.has(mk));

        // All selected dates in order
        const selDates = selMonths.flatMap((mk) => monthGroups[mk]);

        const HARI_S = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        const TH = (extra = "") =>
          `style="background:#BDD7EE;color:#000;padding:4px 5px;text-align:center;font-weight:700;border:1px solid #1E3A5F;font-size:var(--fs-xs);${extra}"`;
        const TH2 = (extra = "") =>
          `style="background:#9DC3E6;color:#000;padding:4px 5px;text-align:center;font-weight:700;border:1px solid #1E3A5F;font-size:var(--fs-xs);${extra}"`;
        const TD = (extra = "") =>
          `style="padding:3px 5px;border:1px solid #1E3A5F;text-align:center;font-size:var(--fs-xs);${extra}"`;

        // -- Month filter chips (not printed) ----------------------
        const isAll = sel.size === monthOrder.length;
        const btnSemua = `<button onclick="setAbsensiMonth(${sem},'ALL')" style="
          padding:5px 14px;border-radius:999px;font-family:var(--f);font-size:var(--fs-xs);
          font-weight:${isAll ? 700 : 500};cursor:pointer;transition:all .15s;
          background:${isAll ? "var(--primary)" : "rgba(0,0,0,0.06)"};
          color:${isAll ? "#fff" : "var(--text)"};
          border:1px solid ${isAll ? "var(--primary)" : "#ccc"};
        ">Semua</button>`;

        const chips = monthOrder
          .map((mk) => {
            const [yr, mo] = mk.split("-").map(Number);
            const on = !isAll && sel.has(mk);
            return `<button onclick="setAbsensiMonth(${sem},'${mk}')" style="
              padding:5px 12px;border-radius:999px;font-family:var(--f);font-size:var(--fs-xs);
              font-weight:${on ? 700 : 500};cursor:pointer;transition:all .15s;
              background:${on ? "var(--primary)" : "rgba(0,0,0,0.06)"};
              color:${on ? "#fff" : "var(--text)"};
              border:1px solid ${on ? "var(--primary)" : "#ccc"};
            ">${BULAN[mo - 1]}</button>`;
          })
          .join("");

        let html = `
  <div class="abs-filter-bar" style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
    ${btnSemua}${chips}
  </div>`;

        // -- doc-frame ---------------------------------------------
        if (selMonths.length === 0) {
          html += `<div class="doc-frame"><div class="empty" style="padding:40px 20px;"><div class="ic"><i class="material-symbols-rounded" style="font-size:48px; color:inherit" data-lucide="calendar-days"></i></div><h3>Tidak ada bulan yang dipilih</h3><p>Centang minimal satu bulan di atas.</p></div></div>`;
          el.innerHTML = html;
          return;
        }

        // Build per-month date-ranges label for doc-title subtitle
        const rangeLabel = `${BULAN[+selMonths[0].split("-")[1] - 1]} - ${BULAN[+selMonths[selMonths.length - 1].split("-")[1] - 1]} ${selMonths[selMonths.length - 1].split("-")[0]}`;

        html += `<div class="doc-frame">
  <div class="doc-info" style="margin-bottom:14px;">
    <div class="doc-title">Daftar Hadir Murid</div>
    <div class="doc-meta-list">
      <div class="dml-row"><span class="dml-lbl">Nama Sekolah</span><span class="dml-sep">:</span><span class="dml-val">${du.sekolah}</span></div>
      <div class="dml-row"><span class="dml-lbl">Mata Pelajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.mapel}</span></div>
      <div class="dml-row"><span class="dml-lbl">Fase / Kelas</span><span class="dml-sep">:</span><span class="dml-val">${escH(formatFaseKelas(du.fase, du.kelas))}</span></div>
      <div class="dml-row"><span class="dml-lbl">Semester</span><span class="dml-sep">:</span><span class="dml-val">${semLabel}</span></div>
      <div class="dml-row"><span class="dml-lbl">Tahun Ajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.tahun}</span></div>
    </div>
  </div>

  <!-- MERGED TABLE: fixed date+HSIA cols, flexible Nama Murid -->
  <div style="overflow-x:auto;margin-bottom:18px;">
  <table class="abt" style="table-layout:auto;width:100%;min-width:100%;">
    <thead>
      <tr>
        <th ${TH("width:42px;min-width:42px;")} rowspan="3">No.</th>
        <th ${TH("text-align:center;padding:4px 8px;min-width:140px;")} rowspan="3">Nama Murid</th>
        ${selMonths
          .map((mk) => {
            const [yr, mo] = mk.split("-").map(Number);
            return `<th ${TH2("background:#9DC3E6;")} colspan="${monthGroups[mk].length + 4}">${BULAN[mo - 1]} ${yr}</th>`;
          })
          .join("")}
      </tr>
      <tr>
        ${selMonths
          .map((mk) => {
            const dates = monthGroups[mk];
            return (
              dates
                .map((iso) => {
                  const d = pd(iso);
                  return `<th ${TH("width:34px;min-width:34px;max-width:34px;")}>${HARI_S[d.getUTCDay()]}</th>`;
                })
                .join("") +
              `<th ${TH2("background:var(--th-ket-bg, #dbeafe)!important;color:var(--th-ket-fg, #1e3a8a)!important;")} colspan="4">Keterangan</th>`
            );
          })
          .join("")}
      </tr>
      <tr>
        ${selMonths
          .map((mk) => {
            const dates = monthGroups[mk];
            return (
              dates
                .map((iso) => {
                  const d = pd(iso);
                  return `<th ${TH("width:34px;min-width:34px;max-width:34px;")}>${d.getUTCDate()}</th>`;
                })
                .join("") +
              `<th ${TH("background:var(--th-h-bg, #dcfce7)!important;color:var(--th-h-fg, #166534)!important;width:30px;min-width:30px;max-width:30px;")}>H</th>` +
              `<th ${TH("background:var(--th-s-bg, #fef08a)!important;color:var(--th-s-fg, #713f12)!important;width:30px;min-width:30px;max-width:30px;")}>S</th>` +
              `<th ${TH("background:var(--th-i-bg, #ffedd5)!important;color:var(--th-i-fg, #9a3412)!important;width:30px;min-width:30px;max-width:30px;")}>I</th>` +
              `<th ${TH("background:var(--th-a-bg, #fee2e2)!important;color:var(--th-a-fg, #991b1b)!important;width:30px;min-width:30px;max-width:30px;")}>A</th>`
            );
          })
          .join("")}
      </tr>
    </thead>
    <tbody>`;

        for (let si = 0; si < siswa.length; si++) {
          html += `<tr>
      <td ${TD("width:42px;min-width:42px;")}>${si + 1}</td>
      <td ${TD("text-align:left;padding:3px 8px;font-size:var(--fs-sm);min-width:140px;")}>${escH(typeof siswa[si] === "string" ? siswa[si] : siswa[si].name)}</td>
      ${selMonths
        .map((mk) => {
          const mDates = monthGroups[mk];
          const mH = mDates.filter(
            (d) => (absObj[`${si}_${d}`] || "") === "H",
          ).length;
          const mS = mDates.filter(
            (d) => (absObj[`${si}_${d}`] || "") === "S",
          ).length;
          const mI = mDates.filter(
            (d) => (absObj[`${si}_${d}`] || "") === "I",
          ).length;
          const mA = mDates.filter(
            (d) => (absObj[`${si}_${d}`] || "") === "A",
          ).length;
          return (
            mDates
              .map((iso) => {
                const v = absObj[`${si}_${iso}`] || "";
                return `<td id="abs-${sem}-${si}-${iso}" class="clickable${v ? " abs-" + v : ""}" onclick="toggleAbsensi(${sem},${si},'${iso}',this)" ${TD("width:34px;min-width:34px;max-width:34px;")}>${v}</td>`;
              })
              .join("") +
            `<td id="absSum-${sem}-${si}-${mk}-H" ${TD("background:#C6EFCE;color:#1A6B3A;font-weight:normal;width:30px;min-width:30px;max-width:30px;")}>${mH || ""}</td>` +
            `<td id="absSum-${sem}-${si}-${mk}-S" ${TD("background:#FFF3CD;color:#856404;font-weight:normal;width:30px;min-width:30px;max-width:30px;")}>${mS || ""}</td>` +
            `<td id="absSum-${sem}-${si}-${mk}-I" ${TD("background:#FFE0B2;color:#8B4500;font-weight:normal;width:30px;min-width:30px;max-width:30px;")}>${mI || ""}</td>` +
            `<td id="absSum-${sem}-${si}-${mk}-A" ${TD("background:#FFCDD2;color:#B71C1C;font-weight:normal;width:30px;min-width:30px;max-width:30px;")}>${mA || ""}</td>`
          );
        })
        .join("")}
    </tr>`;
        }

        // Footer rows with per-month structure
        html += `<tr>
    <td colspan="2" ${TD("background:#E8F0FE;font-weight:normal;text-align:center;")}>Jumlah Kehadiran</td>
    ${selMonths
      .map((mk) => {
        const mDates = monthGroups[mk];
        return (
          mDates
            .map((iso) => {
              const cnt = Array.from(
                { length: siswa.length },
                (_, x) => (absObj[`${x}_${iso}`] || "") === "H",
              ).filter(Boolean).length;
              return `<td id="absDH-${sem}-${iso}" ${TD("width:34px;min-width:34px;max-width:34px;background:#C6EFCE;color:#1A6B3A;font-weight:normal;")}>${cnt || ""}</td>`;
            })
            .join("") + `<td colspan="4" ${TD("background:#E8F0FE;")}></td>`
        );
      })
      .join("")}
  </tr>
  <tr>
    <td colspan="2" ${TD("background:#FFE4E4;font-weight:normal;text-align:center;color:#B71C1C;")}>Jumlah Ketidakhadiran</td>
    ${selMonths
      .map((mk) => {
        const mDates = monthGroups[mk];
        return (
          mDates
            .map((iso) => {
              const cnt = Array.from({ length: siswa.length }, (_, x) => {
                const v = absObj[`${x}_${iso}`] || "";
                return v === "S" || v === "I" || v === "A";
              }).filter(Boolean).length;
              return `<td id="absDX-${sem}-${iso}" ${TD("width:34px;min-width:34px;max-width:34px;background:#FFCDD2;color:#B71C1C;font-weight:normal;")}>${cnt || ""}</td>`;
            })
            .join("") + `<td colspan="4" ${TD("background:#FFE4E4;")}></td>`
        );
      })
      .join("")}
  </tr>
  </tbody></table></div>`;

        html += `


  ${renderDUSignHTML(du)}</div>`;

        el.innerHTML = html;
      }

      // ============================================================
      // NILAI
      // ============================================================
      function updateNilai(sem, key, val) {
        const obj = sem === 1 ? state.nilaiGanjil : state.nilaiGenap;
        if (val === "") {
          delete obj[key];
        } else {
          obj[key] = val;
        }
        scheduleSave();
        markDirty();
        renderNilai(sem);
      }

      let currentBabFilterGanjil = "";
      let currentBabFilterGenap = "";

      

      function renderNilai(sem, du) {
        if (du) _lastDU = du;
        else du = _lastDU;

        const allTps = sem === 1 ? state.tpGanjil : state.tpGenap;
        const babs = [];
        allTps.forEach((tp) => {
          if (tp.bab && !babs.includes(tp.bab)) babs.push(tp.bab);
        });

        let activeBab = "";

        const tps = allTps
          .map((tp, originalIndex) => ({ ...tp, originalIndex }))
          .filter((tp) => !tp.ev);

        const penilaianConfigs =
          sem === 1
            ? state.pengaturanPenilaianGanjil || []
            : state.pengaturanPenilaianGenap || [];

        const activeConfigs = (penilaianConfigs || []).filter(p => p.active);

        const obj = sem === 1 ? state.nilaiGanjil : state.nilaiGenap;
        const siswa = state.siswa;
        const el = document.getElementById("nilai-" + sem + "-content");

        if (siswa.length === 0) {
          el.innerHTML =
            '<div class="empty"><div class="ic"><i class="material-symbols-rounded" style="font-size:48px; color:inherit" data-lucide="users"></i></div><h3>Daftar murid kosong</h3><p>Tambahkan murid di tab <strong>Daftar Murid</strong>.</p></div>';
          return;
        }

        let filterHtml = "";

        const fnTH = (ex = "") =>
          `style="background:#BDD7EE;color:#000;padding:4px 6px;font-size:var(--fs-xs);font-weight:700;text-align:center;border:1px solid #1E3A5F;vertical-align:middle;white-space:normal;word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;line-height:1.2;${ex}"`;
        const fnTD = (ex = "") =>
          `style="padding:4px 6px;border:1px solid #1E3A5F;text-align:center;font-size:var(--fs-xs);white-space:nowrap;${ex}"`;

        let html = '<div class="doc-frame">';
        html += '<div class="doc-info" style="margin-bottom:16px;">';
        html +=
          '<div class="doc-title">Daftar Nilai Semester ' +
          (sem === 1 ? "Ganjil" : "Genap") +
          "</div>";
        html += '<div class="doc-meta-list">';
        html +=
          '<div class="dml-row"><span class="dml-lbl">Nama Sekolah</span><span class="dml-sep">:</span><span class="dml-val">' +
          escH(du.sekolah) +
          "</span></div>";
        html +=
          '<div class="dml-row"><span class="dml-lbl">Mata Pelajaran</span><span class="dml-sep">:</span><span class="dml-val">' +
          escH(du.mapel) +
          "</span></div>";
        html +=
          '<div class="dml-row"><span class="dml-lbl">Fase / Kelas</span><span class="dml-sep">:</span><span class="dml-val">' +
          escH(formatFaseKelas(du.fase, du.kelas, du.rombel)) +
          "</span></div>";
        html +=
          '<div class="dml-row"><span class="dml-lbl">Tahun Ajaran</span><span class="dml-sep">:</span><span class="dml-val">' +
          escH(du.tahun) +
          "</span></div>";
        html += "</div></div>";

        html +=
          '<div style="overflow-x:auto;margin-bottom:18px;"><table class="abt" style="table-layout:auto;width:max-content;min-width:100%;">';

        let headerRow1Cols = "";
        let headerRow2Cols = "";

        activeConfigs.forEach((col) => {
          const cLabel = col.code || col.name;
          if (col.id === "slm") {
            const slmColspan = (tps.length > 0 ? tps.length : 1) + 1;
            headerRow1Cols += `<th ${fnTH("background:#C6E0B4;")} colspan="${slmColspan}">Sumatif Lingkup Materi</th>`;
            if (tps.length > 0) {
              tps.forEach((tp, i) => {
                const sLabel = (tp.kode || "").replace(/^TP\s*/i, "S ") || ("S " + (i + 1));
                headerRow2Cols += `<th ${fnTH("width:50px;background:#E2EFDA;")} title="${escH(tp.tp)}">${escH(sLabel)}</th>`;
              });
            } else {
              headerRow2Cols += `<th ${fnTH("width:50px;background:#E2EFDA;")}>S 1</th>`;
            }
            headerRow2Cols += `<th ${fnTH("width:58px;min-width:56px;max-width:62px;background:#C6E0B4;font-weight:700;")}>NA SLM</th>`;

          } else if (col.id === "sas") {
            const subs = col.subKomponents || [];
            if (subs.length > 0) {
              headerRow1Cols += `<th ${fnTH("background:#FFE699;")} colspan="${subs.length + 1}">Sumatif Akhir Semester</th>`;
              subs.forEach((sub) => {
                headerRow2Cols += `<th ${fnTH("width:50px;background:#FFF2CC;")}>${escH(sub.code || sub.name)}</th>`;
              });
              headerRow2Cols += `<th ${fnTH("width:58px;min-width:56px;max-width:62px;background:#FFE699;font-weight:700;")}>NA SAS</th>`;
            } else {
              headerRow1Cols += `<th ${fnTH("background:#FFE699;")} colspan="1">Sumatif Akhir Semester</th>`;
              headerRow2Cols += `<th ${fnTH("width:58px;min-width:56px;max-width:62px;background:#FFE699;font-weight:700;")}>NA SAS</th>`;
            }

          } else {
            const subs = col.subKomponents || [];
            if (subs.length > 0) {
              headerRow1Cols += `<th ${fnTH("background:#E2EFDA;")} colspan="${subs.length + 1}">${escH(cLabel)}</th>`;
              subs.forEach((sub) => {
                headerRow2Cols += `<th ${fnTH("width:50px;background:#F2F9EE;")}>${escH(sub.code || sub.name)}</th>`;
              });
              headerRow2Cols += `<th ${fnTH("width:58px;min-width:56px;max-width:62px;background:#E2EFDA;font-weight:700;")}>NA ${escH(col.code || col.name)}</th>`;
            } else {
              headerRow1Cols += `<th ${fnTH("background:#E2EFDA;width:60px;min-width:56px;max-width:70px;font-weight:700;")} rowspan="2">${escH(cLabel)}</th>`;
            }
          }
        });

        html += "<thead><tr>";
        html += "<th " + fnTH("width:40px;") + ` rowspan="2">No.</th>`;
        html += "<th " + fnTH("width:80px;") + ` rowspan="2">NIS</th>`;
        html += "<th " + fnTH("width:90px;") + ` rowspan="2">NISN</th>`;
        html += "<th " + fnTH("width:180px;") + ` rowspan="2">Nama Murid</th>`;
        html += headerRow1Cols;
        html += `<th ${fnTH("background:#9DC3E6;width:58px;min-width:56px;max-width:62px;")} rowspan="2">Nilai Rapor</th>`;
        html += "</tr>";

        html += "<tr>" + headerRow2Cols + "</tr>";
        html += "</thead><tbody>";

        siswa.forEach((sVal, si) => {
          const sName = typeof sVal === "string" ? sVal : sVal.name;
          const sNis = typeof sVal === "string" ? "" : sVal.nis || "";
          const sNisn = typeof sVal === "string" ? "" : sVal.nisn || "";

          let sumWeighted = 0;
          let sumBobot = 0;
          let studentRowCellsHtml = "";

          activeConfigs.forEach((col) => {
            if (col.id === "slm") {
              let sumTP = 0;
              let countTP = 0;
              if (tps.length > 0) {
                tps.forEach((tp) => {
                  const key = "tp_" + tp.originalIndex + "_" + si;
                  const val = obj[key] || "";
                  const numVal = parseFloat(val);
                  if (!isNaN(numVal)) {
                    sumTP += numVal;
                    countTP++;
                  }
                  studentRowCellsHtml +=
                    "<td " +
                    fnTD() +
                    '><input type="text" class="nilai-input" style="width:100%;height:100%;min-width:40px;border:none;text-align:center;background:transparent;outline:none;" value="' +
                    escH(val) +
                    '" onblur="updateNilai(' +
                    sem +
                    ", '" +
                    key +
                    "', this.value)\"></td>";
                });
              } else {
                studentRowCellsHtml += `<td ${fnTD()}>-</td>`;
              }

              const rataTP = countTP > 0 ? (sumTP / countTP) : null;
              if (rataTP !== null) {
                sumWeighted += rataTP * col.bobot;
                sumBobot += col.bobot;
              }
              const rataTPStr = rataTP !== null ? rataTP.toFixed(1) : "";
              studentRowCellsHtml += `<td ${fnTD("background:rgba(226,239,218,0.35);font-weight:700;width:58px;min-width:56px;")}>${rataTPStr}</td>`;

            } else if (col.id === "sas") {
              const subs = col.subKomponents || [];
              if (subs.length > 0) {
                let sumSub = 0;
                let countSub = 0;
                subs.forEach((sub) => {
                  let key;
                  if (sub.id === "sasnt") key = "sasnt_" + si;
                  else if (sub.id === "sast") key = "sast_" + si;
                  else key = "sub_comp_sas_" + sub.id + "_" + si;

                  const val = obj[key] || "";
                  const numVal = parseFloat(val);
                  if (!isNaN(numVal)) {
                    sumSub += numVal;
                    countSub++;
                  }

                  studentRowCellsHtml +=
                    "<td " +
                    fnTD() +
                    '><input type="text" class="nilai-input" style="width:100%;height:100%;min-width:42px;border:none;text-align:center;background:transparent;outline:none;" value="' +
                    escH(val) +
                    '" onblur="updateNilai(' +
                    sem +
                    ", '" +
                    key +
                    "', this.value)\"></td>";
                });

                const scoreSAS = countSub > 0 ? (sumSub / countSub) : null;
                if (scoreSAS !== null) {
                  sumWeighted += scoreSAS * col.bobot;
                  sumBobot += col.bobot;
                }
                const scoreSASStr = scoreSAS !== null ? scoreSAS.toFixed(1) : "";
                studentRowCellsHtml += `<td ${fnTD("background:rgba(255,242,204,0.4);font-weight:700;width:58px;min-width:56px;")}>${scoreSASStr}</td>`;

              } else {
                const key = "sas_" + si;
                const val = obj[key] || "";
                const numVal = parseFloat(val);

                if (!isNaN(numVal)) {
                  sumWeighted += numVal * col.bobot;
                  sumBobot += col.bobot;
                }

                studentRowCellsHtml +=
                  "<td " +
                  fnTD("width:58px;min-width:56px;") +
                  '><input type="text" class="nilai-input" style="width:100%;height:100%;min-width:42px;border:none;text-align:center;background:transparent;outline:none;" value="' +
                  escH(val) +
                  '" onblur="updateNilai(' +
                  sem +
                  ", '" +
                  key +
                  "', this.value)\"></td>";
              }

            } else {
              const subs = col.subKomponents || [];
              if (subs.length > 0) {
                let sumSub = 0;
                let countSub = 0;
                subs.forEach((sub) => {
                  const key = "sub_comp_" + col.id + "_" + sub.id + "_" + si;
                  const val = obj[key] || "";
                  const numVal = parseFloat(val);
                  if (!isNaN(numVal)) {
                    sumSub += numVal;
                    countSub++;
                  }

                  studentRowCellsHtml +=
                    "<td " +
                    fnTD() +
                    '><input type="text" class="nilai-input" style="width:100%;height:100%;min-width:42px;border:none;text-align:center;background:transparent;outline:none;" value="' +
                    escH(val) +
                    '" onblur="updateNilai(' +
                    sem +
                    ", '" +
                    key +
                    "', this.value)\"></td>";
                });

                const scoreCust = countSub > 0 ? (sumSub / countSub) : null;
                if (scoreCust !== null) {
                  sumWeighted += scoreCust * col.bobot;
                  sumBobot += col.bobot;
                }
                const scoreCustStr = scoreCust !== null ? scoreCust.toFixed(1) : "";
                studentRowCellsHtml += `<td ${fnTD("background:rgba(242,249,238,0.35);font-weight:700;width:58px;min-width:56px;")}>${scoreCustStr}</td>`;

              } else {
                const key = "c_" + col.id + "_" + si;
                const val = obj[key] || "";
                const numVal = parseFloat(val);

                if (!isNaN(numVal)) {
                  sumWeighted += numVal * col.bobot;
                  sumBobot += col.bobot;
                }

                studentRowCellsHtml +=
                  "<td " +
                  fnTD("width:60px;min-width:56px;") +
                  '><input type="text" class="nilai-input" style="width:100%;height:100%;min-width:42px;border:none;text-align:center;background:transparent;outline:none;" value="' +
                  escH(val) +
                  '" onblur="updateNilai(' +
                  sem +
                  ", '" +
                  key +
                  "', this.value)\"></td>";
              }
            }
          });

          const keyNA = "na_" + si;
          const manualNA = obj[keyNA];
          const calcNA = sumBobot > 0 ? (sumWeighted / sumBobot).toFixed(1) : "";

          html += `<tr>`;
          html += `<td ${fnTD("width:40px;")} class="td-ctr">${si + 1}</td>`;
          html += `<td ${fnTD("width:80px;")} class="td-ctr">${escH(sNis)}</td>`;
          html += `<td ${fnTD("width:90px;")} class="td-ctr">${escH(sNisn)}</td>`;
          html += `<td ${fnTD("text-align:left;padding-left:8px;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:180px;")}>${escH(sName)}</td>`;
          html += studentRowCellsHtml;
          html += `<td ${fnTD("background:rgba(217,225,242,0.35);font-weight:700;width:58px;min-width:56px;")}>
            <input type="text" style="width:100%;height:100%;min-width:42px;border:none;background:transparent;text-align:center;font-weight:700;color:var(--text);outline:none;" value="${escH(manualNA || "")}" onblur="updateNilai(${sem}, '${keyNA}', this.value)" placeholder="${calcNA}">
          </td>`;
          html += `</tr>`;
        });

        html += "</tbody></table></div>";

        html += renderDUSignHTML(du);

        html += "</div>";

        el.innerHTML = filterHtml + html;
      }

      function generate() {
        const du = getDU();
        const hG = buildHariEfektif(1),
          hE = buildHariEfektif(2);
        const dG = distributeTP(state.tpGanjil, hG);
        const dE = distributeTP(state.tpGenap, hE);
        const jpTG = state.tpGanjil.reduce((s, t) => s + +t.jp, 0);
        const jpTE = state.tpGenap.reduce((s, t) => s + +t.jp, 0);
        const jpAG = hG.reduce((s, h) => s + h.jp, 0);
        const jpAE = hE.reduce((s, h) => s + h.jp, 0);

        renderATP(du);
        renderProta(du, dG, dE, jpTG, jpTE, jpAG, jpAE);
        renderProsem(1, du, dG, jpTG, jpAG);
        renderProsem(2, du, dE, jpTE, jpAE);
        renderRPE(1, du);
        renderRPE(2, du);
        renderJurnal(1, du, dG);
        renderJurnal(2, du, dE);
        renderAbsensi(1, du);
        renderAbsensi(2, du);
        renderNilai(1, du);
        renderNilai(2, du);
        renderKKTPOutput();
        renderTPStats(1, jpTG, jpAG);
        renderTPStats(2, jpTE, jpAE);
        markGenerated();

        // Show print & docx buttons for non-semester tabs
        ["prota", "atp", "kktp"].forEach((id) => {
          const btn = document.getElementById("btn-print-" + id);
          if (btn) btn.style.display = "inline-flex";
          const btnD = document.getElementById("btn-docx-" + id);
          if (btnD) btnD.style.display = "inline-flex";
        });

        // Trigger switchSemContent for all semester tabs to show correct print buttons
        ["prosem", "rpe", "jurnal", "absensi", "nilai"].forEach((prefix) => {
          const btn1 = document.getElementById(`btn-${prefix}-sem-1`);
          const sem = btn1 && btn1.classList.contains("active") ? 1 : 2;
          switchSemContent(prefix, sem);
        });
      }

      function getDUSignObj(name, idType, idVal) {
        if (
          !idType ||
          idType === "" ||
          idType === "Tanpa ID" ||
          !idVal ||
          idVal.trim() === ""
        ) {
          return `<div style="display: inline-block; text-align: center; min-width: 160px; line-height: 1.15; pointer-events: none;"><span style="font-weight: normal; display: inline-block; white-space: nowrap;">${escH(name)}</span></div>`;
        }
        return `<div style="display: inline-block; text-align: center; min-width: 160px; line-height: 1.15; pointer-events: none;">
          <span style="font-weight: normal; border-bottom: 1.5px solid currentColor; padding-bottom: 1px; display: inline-block; min-width: 150px; margin-bottom: 3px; white-space: nowrap;">${escH(name)}</span>
          <div style="font-weight: normal; font-size: 0.9em; white-space: nowrap; line-height: 1.15;">
            ${escH(idType)} ${escH(idVal.trim())}
          </div>
        </div>`;
      }

      function renderDUSignHTML(du, isPrint = false, fsPt = 11) {
        const spaceBottom = "70px";

        let ttdGuruImg = "";
        let ttdKepsekImg = "";
        let capSekolahImg = "";

        if (du.imgTtdGuru)
          ttdGuruImg = `<img class="img-sign-print" src="${du.imgTtdGuru}" style="position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(100% - 35px); max-height: 200px; max-width: 320px; object-fit: contain; z-index: 1;">`;
        if (du.imgTtdKepsek)
          ttdKepsekImg = `<img class="img-sign-print" src="${du.imgTtdKepsek}" style="position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(100% - 35px); max-height: 200px; max-width: 320px; object-fit: contain; z-index: 1;">`;
        if (du.imgCapSekolah)
          capSekolahImg = `<img class="img-sign-print" src="${du.imgCapSekolah}" style="position: absolute; right: 80%; transform: translateX(50%); bottom: calc(100% - 50px); opacity: 0.8; max-height: 240px; max-width: 240px; object-fit: contain; z-index: 0; mix-blend-mode: multiply;">`;

        return `
          <div class="sign-box" style="display: flex; justify-content: space-between; width: 100%; margin-top: 24px; gap: 24px; break-inside: avoid; page-break-inside: avoid; border: none !important; padding: 0 !important; background: transparent !important; color: var(--text); font-size: ${fsPt}pt;">
            <!-- Left Column: Kepala Sekolah -->
            <div class="sign-col" style="text-align: center; min-width: 150px; max-width: 45%; flex: 1; display: flex; flex-direction: column; align-items: center; border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important;">
              <!-- Spacer to align with Tempat, Tanggal on the right -->
              <div style="line-height: 1.15; margin-bottom: 2px; color: transparent; user-select: none; pointer-events: none; white-space: nowrap;">&nbsp;</div>
              <!-- Mengetahui label -->
              <div style="line-height: 1.15; margin-bottom: 2px; color: var(--text); font-weight: normal; text-align: center; white-space: nowrap;">Mengetahui,</div>
              <div class="role" style="color: var(--text); font-weight: normal; text-align: center; border: none !important; padding: 0 !important; margin: 0 0 ${spaceBottom} 0 !important; white-space: nowrap; line-height: 1.15;">Kepala Sekolah</div>
              <div class="name" style="position: relative; border: none !important; padding: 0 !important; margin: 0 !important; color: var(--text); line-height: 1.15;">
                ${capSekolahImg}
                ${ttdKepsekImg}
                <div style="position: relative; z-index: 2;">${du.kepsekSign}</div>
              </div>
            </div>
            
            <!-- Right Column: Guru Pengampu -->
            <div class="sign-col" style="text-align: center; min-width: 150px; max-width: 45%; flex: 1; display: flex; flex-direction: column; align-items: center; border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important;">
              <!-- Tempat, Tanggal at the very top, centered with this column -->
              <div style="line-height: 1.15; margin-bottom: 2px; color: var(--text); font-weight: normal; text-align: center; white-space: nowrap;">
                ${escH(du.tempat)}, ${fmtD(du.tgl)}
              </div>
              <!-- Spacer aligning with Mengetahui on the left -->
              <div style="line-height: 1.15; margin-bottom: 2px; color: transparent; user-select: none; pointer-events: none; white-space: nowrap;">&nbsp;</div>
              <div class="role" style="color: var(--text); font-weight: normal; text-align: center; border: none !important; padding: 0 !important; margin: 0 0 ${spaceBottom} 0 !important; white-space: nowrap; line-height: 1.15;">Guru Pengampu</div>
              <div class="name" style="position: relative; border: none !important; padding: 0 !important; margin: 0 !important; color: var(--text); line-height: 1.15;">
                ${ttdGuruImg}
                <div style="position: relative; z-index: 2;">${du.guruSign}</div>
              </div>
            </div>
          </div>
        `;
      }

      function getDU() {
        const guruIdType =
          document.querySelector('input[name="f-guru-id-type"]:checked')
            ?.value || "";
        const guruId = document.getElementById("f-guru-id").value;
        const kepsekIdType =
          document.querySelector('input[name="f-kepsek-id-type"]:checked')
            ?.value || "";
        const kepsekId = document.getElementById("f-kepsek-id").value;

        const sekolahEl = document.getElementById("f-sekolah");
        const rombelEl = document.getElementById("f-rombel");
        const kepsekEl = document.getElementById("f-kepsek");

        const sekolahVal = (sekolahEl?.value || "").trim() || (sekolahEl?.placeholder || "");
        const rombelVal = (rombelEl?.value || "").trim() || (rombelEl?.placeholder || "");
        const kepsekVal = (kepsekEl?.value || "").trim() || (kepsekEl?.placeholder || "");
        const guruVal = document.getElementById("f-guru").value;

        return {
          jenjang: document.getElementById("f-jenjang").value,
          sekolah: sekolahVal,
          mapel: getMapelValue("f-mapel", "f-mapel-manual"),
          fase: document.getElementById("f-fase").value,
          kelas: document.getElementById("f-kelas").value,
          rombel: rombelVal,
          tahun: document.getElementById("f-tahun").value,
          firstDay: document.getElementById("f-first-day").value,
          guru: guruVal,
          guruIdType,
          guruId,
          guruSign: getDUSignObj(
            guruVal,
            guruIdType,
            guruId,
          ),
          kepsek: kepsekVal,
          kepsekIdType,
          kepsekId,
          kepsekSign: getDUSignObj(
            kepsekVal,
            kepsekIdType,
            kepsekId,
          ),
          tempat: document.getElementById("f-tempat").value,
          tgl: document.getElementById("f-tgl").value,
          imgTtdKepsek: state.imgTtdKepsek,
          imgCapSekolah: state.imgCapSekolah,
          imgTtdGuru: state.imgTtdGuru,
        };
      }

      function renderProta(du, dG, dE, jpTG, jpTE, jpAG, jpAE) {
        const yr = du.tahun.split("/");
        let no = 0;
        const rows = (arr, sem) =>
          arr
            .map((t) => {
              no++;
              return `<tr class="${t.ev ? "eval-row" : ""}">
      <td class="ctr">${no}</td>
      <td class="ctr">${t.bab || "-"}</td>
      <td class="kode">${t.kode}</td>
      <td>${t.tp}</td>
      <td class="jp ctr">${t.jp}</td>
      <td class="ctr">${sem}</td>
    </tr>`;
            })
            .join("");

        const jadwalStr = formatJadwalText(state.jadwal);
        const jpPM = state.jadwal.reduce((s, j) => s + +j.jp, 0);

        if(document.getElementById("prota-content")) document.getElementById("prota-content").innerHTML = `
  <div class="doc-frame">
  <div class="doc-info">
    <div class="doc-title">Program Tahunan</div>
    <div class="doc-meta-list">
      <div class="dml-row"><span class="dml-lbl">Nama Sekolah</span><span class="dml-sep">:</span><span class="dml-val">${du.sekolah}</span></div>
      <div class="dml-row"><span class="dml-lbl">Mata Pelajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.mapel}</span></div>
      <div class="dml-row"><span class="dml-lbl">Fase / Kelas</span><span class="dml-sep">:</span><span class="dml-val">${escH(formatFaseKelas(du.fase, du.kelas))}</span></div>
      <div class="dml-row"><span class="dml-lbl">Tahun Ajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.tahun}</span></div>
      <div class="dml-row"><span class="dml-lbl">Hari Mengajar / JP</span><span class="dml-sep">:</span><span class="dml-val">${jadwalStr}</span></div>
    </div>
  </div>
  <div class="prota-wrap">
    <table class="pt" style="width:100%; table-layout:fixed; border-collapse:collapse;">
      <colgroup>
        <col class="c-no" style="width:38px;">
        <col class="c-bab" style="width:48px;">
        <col class="c-kode" style="width:72px;">
        <col class="c-tp" style="width:auto;">
        <col class="c-jp" style="width:95px;">
        <col class="c-sem" style="width:85px;">
      </colgroup>
      <thead><tr>
        <th style="vertical-align:middle; text-align:center; padding:8px 4px;">No.</th>
        <th style="vertical-align:middle; text-align:center; padding:8px 4px;">Bab</th>
        <th style="vertical-align:middle; text-align:center; padding:8px 4px;">Kode TP</th>
        <th style="vertical-align:middle; text-align:center; padding:8px 10px;">Alur Tujuan Pembelajaran</th>
        <th style="vertical-align:middle; text-align:center; padding:8px 4px; white-space:normal; line-height:1.2;">Alokasi Waktu<br>(JP)</th>
        <th style="vertical-align:middle; text-align:center; padding:8px 4px; white-space:normal; line-height:1.2;">Semester</th>
      </tr></thead>
      <tbody>
        <tr class="sem-hdr"><td colspan="6">Semester Ganjil</td></tr>
        ${rows(dG, "Ganjil")}
        <tr class="sem-total-row">
          <td colspan="4" style="text-align:center;font-weight:700;">Jumlah Alokasi Waktu Semester Ganjil</td>
          <td class="jp ctr" style="font-weight:700;text-align:center;">${jpTG} JP</td>
          <td></td>
        </tr>
        <tr class="sem-hdr"><td colspan="6">Semester Genap</td></tr>
        ${rows(dE, "Genap")}
        <tr class="sem-total-row">
          <td colspan="4" style="text-align:center;font-weight:700;">Jumlah Alokasi Waktu Semester Genap</td>
          <td class="jp ctr" style="font-weight:700;text-align:center;">${jpTE} JP</td>
          <td></td>
        </tr>
      </tbody>
      <tfoot><tr>
        <td colspan="4" style="text-align:center;font-weight:700;padding:8px 4px;">Total Alokasi Waktu Per Tahun</td>
        <td style="text-align:center;font-weight:700;padding:8px 4px;">${jpTG + jpTE} JP</td>
        <td></td>
      </tr></tfoot>
    </table>
  </div>
  ${renderDUSignHTML(du)}
  </div>`;
      }

      // ============================================================
      // RENDER PROSEM
      // ============================================================
      function renderProsem(sem, du, dist, jpTotal, jpAvail) {
        const yr = du.tahun.split("/");
        const semLabel = sem === 1 ? "Ganjil" : "Genap";
        const semYear = sem === 1 ? yr[0] : yr[1] || parseInt(yr[0]) + 1;

        // Build week structure with majority rule
        const { months, monthWeeksArr, dateLookup } = buildMonthWeeks(sem);

        // Build header rows using actual week counts per month
        const mthHdr = months
          .map(
            (m, mi) =>
              `<th class="mth" colspan="${monthWeeksArr[mi]}">${m.name}</th>`,
          )
          .join("");
        const wkHdr = months
          .map((m, mi) =>
            Array.from(
              { length: monthWeeksArr[mi] },
              (_, w) => `<th class="wk wk-cell">${w + 1}</th>`,
            ).join(""),
          )
          .join("");

        // JP per cell + libur detection via dateLookup
        const jpMap = {}; // active JP per cell key
        const jpLiburMap = {}; // holiday JP per cell key
        const liburArr = sem === 1 ? kalender.ganjil : kalender.genap;
        const liburSet = new Set(
          liburArr
            .filter((l) => !katById(l.kategori || "custom").countEfektif)
            .map((l) => l.tanggal),
        );
        const jadwalMap = {};
        for (const j of state.jadwal) {
          const dow = HARI_DOW[j.hari];
          if (dow !== undefined) jadwalMap[dow] = +j.jp;
        }

        const liburWkMap = {}; // key -> Set<keterangan>

        const semStart = new Date(Date.UTC(months[0].year, months[0].month, 1));
        const semEnd = new Date(
          Date.UTC(
            months[months.length - 1].year,
            months[months.length - 1].month + 1,
            0,
          ),
        );
        const calendarLiburWkSet = new Set();
        let cur = new Date(semStart);
        while (cur <= semEnd) {
          const iso = fi(cur),
            dow = cur.getUTCDay();
          const isWorkingDay = dow >= 1 && dow <= 5;
          const isScheduled = jadwalMap[dow] !== undefined;
          const cell = dateLookup[iso];
          if (cell) {
            const key = `${cell.mi}-${cell.wk}`;
            if (liburSet.has(iso)) {
              // Only consider holidays on actual school working days (Mon-Fri or scheduled teaching days)
              if (isWorkingDay || isScheduled) {
                const entry = liburArr.find((l) => l.tanggal === iso);
                const ket = entry ? entry.keterangan || "Libur" : "Libur";
                if (!liburWkMap[key]) liburWkMap[key] = new Set();
                liburWkMap[key].add(ket);
                if (isScheduled) {
                  jpLiburMap[key] = (jpLiburMap[key] || 0) + jadwalMap[dow];
                } else {
                  calendarLiburWkSet.add(key);
                }
              }
            } else if (isScheduled) {
              jpMap[key] = (jpMap[key] || 0) + jadwalMap[dow];
            }
          }
          cur = ad(cur, 1);
        }

        // liburWkSet = weeks with ZERO active teaching JP where holidays occurred (full non-effective week)
        // partialWkSet = weeks with active teaching JP (>0) BUT also having holiday dates on scheduled teaching days
        const liburWkSet = new Set();
        const partialWkSet = new Set();
        months.forEach((m, mi) => {
          for (let w = 1; w <= monthWeeksArr[mi]; w++) {
            const key = `${mi}-${w}`;
            const hasActive = (jpMap[key] || 0) > 0;
            const hasLiburScheduled = (jpLiburMap[key] || 0) > 0;
            const hasGeneralLibur = calendarLiburWkSet.has(key);
            if (!hasActive && (hasLiburScheduled || hasGeneralLibur)) {
              liburWkSet.add(key);
            } else if (hasActive && hasLiburScheduled) {
              partialWkSet.add(key);
            }
          }
        });

        // Build libur legend grouped by keterangan
        const ketGroups = {};
        for (const l of liburArr) {
          const ket = l.keterangan || "Libur";
          if (!ketGroups[ket])
            ketGroups[ket] = { ket, dates: [], wkLabels: new Set() };
          ketGroups[ket].dates.push(l.tanggal);
        }
        for (const [ket, grp] of Object.entries(ketGroups)) {
          grp.dates.sort();
          let c = pd(grp.dates[0]);
          const e = pd(grp.dates[grp.dates.length - 1]);
          while (c <= e) {
            const iso = fi(c);
            const dow = c.getUTCDay();
            const isWorkingDay = dow >= 1 && dow <= 5;
            const isScheduled = jadwalMap[dow] !== undefined;
            const cell = dateLookup[iso];
            if (cell && (isWorkingDay || isScheduled)) {
              const key = `${cell.mi}-${cell.wk}`;
              if (
                liburWkMap[key] &&
                liburWkMap[key].has(ket) &&
                (liburWkSet.has(key) || partialWkSet.has(key))
              )
                grp.wkLabels.add(key);
            }
            c = ad(c, 1);
          }
        }
        const liburLegend = Object.values(ketGroups)
          .filter((g) => g.wkLabels.size > 0)
          .map((g) => {
            // Convert Set of "mi-wk" keys to sorted array, then build range strings
            const sorted = [...g.wkLabels].sort((a, b) => {
              const [ami, awk] = a.split("-").map(Number);
              const [bmi, bwk] = b.split("-").map(Number);
              return ami !== bmi ? ami - bmi : awk - bwk;
            });
            // Group into consecutive ranges
            const ranges = [];
            let rStart = sorted[0],
              rEnd = sorted[0];
            for (let i = 1; i < sorted.length; i++) {
              const [pm, pw] = sorted[i - 1].split("-").map(Number);
              const [cm, cw] = sorted[i].split("-").map(Number);
              const consecutive =
                (cm === pm && cw === pw + 1) ||
                (cm === pm + 1 && pw === monthWeeksArr[pm] && cw === 1);
              if (consecutive) {
                rEnd = sorted[i];
              } else {
                ranges.push([rStart, rEnd]);
                rStart = sorted[i];
                rEnd = sorted[i];
              }
            }
            ranges.push([rStart, rEnd]);
            // Format each range
            const fmtKey = (k) => {
              const [mi, wk] = k.split("-").map(Number);
              return `${months[mi].name} Pekan ke-${wk}`;
            };
            const fmtRange = ([s, e]) => {
              if (s === e) return fmtKey(s);
              const [smi, swk] = s.split("-").map(Number);
              const [emi, ewk] = e.split("-").map(Number);
              // Same month: "Juli Pekan ke-1 s.d. 3"
              if (smi === emi)
                return `${months[smi].name} Pekan ke-${swk} s.d. ${ewk}`;
              // Different months: full label both sides
              return `${fmtKey(s)} s.d. ${fmtKey(e)}`;
            };
            const rangeStr = ranges.map(fmtRange).join(", ");
            return {
              ket: g.ket,
              tglMulai: g.dates[0],
              tglSelesai: g.dates[g.dates.length - 1],
              wkLabels: rangeStr,
            };
          })
          .sort((a, b) => a.tglMulai.localeCompare(b.tglMulai));

        // Calculate weekly JP distribution for each item
        const hEfektif = buildHariEfektif(sem);
        const HARI_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        let hi = 0,
          jpUsed = 0;

        dist.forEach((item) => {
          let need = +item.jp || 0;
          item.weeklyJp = {};
          item.weeklyDates = {};
          while (need > 0 && hi < hEfektif.length) {
            const h = hEfektif[hi];
            const avail = h.jp - jpUsed;
            const take = Math.min(need, avail);
            need -= take;
            jpUsed += take;

            if (dateLookup && dateLookup[h.tanggal]) {
              const cell = dateLookup[h.tanggal];
              const key = `${cell.mi}-${cell.wk}`;
              item.weeklyJp[key] = (item.weeklyJp[key] || 0) + take;
              if (!item.weeklyDates[key]) item.weeklyDates[key] = [];
              const dt = pd(h.tanggal);
              const dayName = HARI_NAMES[dt.getUTCDay()];
              item.weeklyDates[key].push({
                tanggal: h.tanggal,
                hari: dayName,
                jp: take,
              });
            }

            if (jpUsed >= h.jp) {
              hi++;
              jpUsed = 0;
            }
          }
        });

        // Build body rows
        let psNo = 0;
        let totalPertemuan = 0;
        const bodyRows = dist
          .map((item) => {
            psNo++;
            // Calculate number of unique teaching days (tatap muka) for this item
            const uniqueDates = new Set();
            if (item.weeklyDates) {
              Object.values(item.weeklyDates).forEach((dList) => {
                if (Array.isArray(dList)) {
                  dList.forEach((d) => {
                    if (d && d.tanggal && d.jp > 0) uniqueDates.add(d.tanggal);
                  });
                }
              });
            }
            const jmlPertemuan = uniqueDates.size;
            totalPertemuan += jmlPertemuan;
            const pertLabel = jmlPertemuan > 0 ? `${jmlPertemuan} x Pertemuan` : "-";

            const tds = months
              .map((m, mi) =>
                Array.from({ length: monthWeeksArr[mi] }, (_, w) => {
                  const key = `${mi}-${w + 1}`;
                  const isFullLibur = liburWkSet.has(key);
                  const isPartial = partialWkSet.has(key);
                  const cellJp = item.weeklyJp ? item.weeklyJp[key] : null;
                  const isFilled = cellJp !== undefined && cellJp > 0;
                  const dates = item.weeklyDates && item.weeklyDates[key] ? item.weeklyDates[key] : [];

                  let tip = "";
                  if (isFilled && dates.length > 0) {
                    const lines = dates.map((d) => `• ${d.hari}, ${fmtD(d.tanggal)}`);
                    tip = lines.join("\n");
                  }
                  const tipAttr = tip ? ` title="${escH(tip)}"` : "";

                  if (isPartial) {
                    if (isFilled) {
                      return `<td class="filled partial-fill wk-cell"${tipAttr}><span class="prosem-jp-val">${cellJp}</span></td>`;
                    }
                    return `<td class="libur-col wk-cell"></td>`;
                  }
                  if (isFullLibur) {
                    return `<td class="libur-col wk-cell"></td>`;
                  }
                  if (isFilled) {
                    return `<td class="filled wk-cell"${tipAttr}><span class="prosem-jp-val">${cellJp}</span></td>`;
                  }
                  return `<td class="wk-cell"></td>`;
                }).join(""),
              )
              .join("");
            return `<tr class="${item.ev ? "eval-row" : ""}">
      <td class="ctr">${psNo}</td>
      <td class="kode">${item.kode}</td>
      <td class="alur">${item.tp}</td>
      <td class="jp-td">${item.jp}</td>
      <td class="pert-td">${pertLabel}</td>
      ${tds}
    </tr>`;
          })
          .join("");

        // Footer: full libur -> "L", partial -> active JP with libur-wk (red), active -> normal active JP
        const footTds = months
          .map((m, mi) =>
            Array.from({ length: monthWeeksArr[mi] }, (_, w) => {
              const key = `${mi}-${w + 1}`;
              const isFullLibur = liburWkSet.has(key);
              const isPartial = partialWkSet.has(key);
              if (isFullLibur) return `<td class="libur-wk wk-cell" title="Libur Penuh">L</td>`;
              const v = jpMap[key] || "";
              const footTip = v ? `Total ${m.name} Pekan ke-${w + 1}: ${v} JP` : "";
              const footTipAttr = footTip ? ` title="${escH(footTip)}"` : "";
              if (isPartial) return `<td class="libur-wk wk-cell"${footTipAttr}>${v}</td>`;
              return `<td class="wk-cell"${footTipAttr}>${v}</td>`;
            }).join(""),
          )
          .join("");

        const jadwalStr = formatJadwalText(state.jadwal);

        if(document.getElementById("prosem-" + sem + "-content")) document.getElementById("prosem-" + sem + "-content").innerHTML = `
  <div class="doc-frame">
  <div class="doc-info">
    <div class="doc-title">Program Semester ${semLabel}</div>
    <div class="doc-meta-list">
      <div class="dml-row"><span class="dml-lbl">Nama Sekolah</span><span class="dml-sep">:</span><span class="dml-val">${du.sekolah}</span></div>
      <div class="dml-row"><span class="dml-lbl">Mata Pelajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.mapel}</span></div>
      <div class="dml-row"><span class="dml-lbl">Fase / Kelas</span><span class="dml-sep">:</span><span class="dml-val">${escH(formatFaseKelas(du.fase, du.kelas))}</span></div>
      <div class="dml-row"><span class="dml-lbl">Semester</span><span class="dml-sep">:</span><span class="dml-val">${semLabel}</span></div>
      <div class="dml-row"><span class="dml-lbl">Tahun Ajaran</span><span class="dml-sep">:</span><span class="dml-val">${du.tahun}</span></div>
      <div class="dml-row"><span class="dml-lbl">Hari Mengajar / JP</span><span class="dml-sep">:</span><span class="dml-val">${jadwalStr}</span></div>
    </div>
  </div>
  <div class="prosem-scroll">
    <table class="ps">
      <thead>
        <tr>
          <th style="width:36px;min-width:36px;white-space:nowrap;" rowspan="2">No.</th>
          <th style="width:66px;min-width:60px;white-space:nowrap;" rowspan="2">Kode TP</th>
          <th class="alur" rowspan="2">Alur Tujuan Pembelajaran</th>
          <th style="width:36px;min-width:32px;white-space:nowrap;" rowspan="2">JP</th>
          <th style="width:105px;min-width:95px;white-space:nowrap;" rowspan="2">Jml. Pertemuan</th>
          ${mthHdr}
        </tr>
        <tr>
          ${wkHdr}
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
      <tfoot><tr>
        <td colspan="3" style="text-align:right;padding-right:10px;font-weight:700;">Total Alokasi Waktu</td>
        <td style="text-align:center;font-weight:700;">${jpTotal}</td>
        <td style="text-align:center;font-weight:700;white-space:nowrap;">${totalPertemuan > 0 ? totalPertemuan + " x Pertemuan" : "-"}</td>
        ${footTds}
      </tr></tfoot>
    </table>
  </div>
  <div style="display:flex;gap:20px;margin-bottom:10px;font-size:var(--fs);align-items:center;flex-wrap:wrap;">
    <span style="font-weight:700;">Keterangan:</span>
    <span style="display:flex;align-items:center;gap:5px;"><span style="width:14px;height:14px;background:#4DAF7C;display:inline-block;border:1px solid #1E3A5F;"></span> Pekan aktif penuh</span>
    <span style="display:flex;align-items:center;gap:5px;"><span style="width:14px;height:14px;background:linear-gradient(rgba(77, 175, 124, 0.45), rgba(77, 175, 124, 0.45)), #ffd0da;display:inline-block;border:1px solid #1E3A5F;"></span> Pekan aktif parsial (ada hari libur)</span>
    <span style="display:flex;align-items:center;gap:5px;"><span style="width:14px;height:14px;background:#FF2D55;display:inline-block;border:1px solid #1E3A5F;"></span> Pekan libur / KBM non-aktif</span>
  </div>
  ${
    liburLegend.length > 0
      ? `
  <table style="width:100%;border-collapse:collapse;font-size:var(--fs);margin-bottom:18px;">
    <thead>
      <tr>
        <th style="background:#BDD7EE;color:#000;padding:5px 8px;border:1px solid #1E3A5F;text-align:center;width:44px;min-width:44px;white-space:nowrap;font-weight:700;">No.</th>
        <th style="background:#BDD7EE;color:#000;padding:5px 8px;border:1px solid #1E3A5F;text-align:center;font-weight:700;">Keterangan Libur / KBM Non-Aktif</th>
        <th style="background:#BDD7EE;color:#000;padding:5px 8px;border:1px solid #1E3A5F;text-align:center;white-space:nowrap;font-weight:700;">Tanggal Mulai</th>
        <th style="background:#BDD7EE;color:#000;padding:5px 8px;border:1px solid #1E3A5F;text-align:center;white-space:nowrap;font-weight:700;">Tanggal Selesai</th>
        <th style="background:#BDD7EE;color:#000;padding:5px 8px;border:1px solid #1E3A5F;text-align:center;font-weight:700;">Pekan Terdampak</th>
      </tr>
    </thead>
    <tbody>
      ${liburLegend
        .map(
          (item, i) => `
      <tr style="${i % 2 === 1 ? "background:#F2F2F2" : ""}">
        <td style="padding:5px 8px;border:1px solid #1E3A5F;text-align:center;white-space:nowrap;">${i + 1}</td>
        <td style="padding:5px 8px;border:1px solid #1E3A5F;">${item.ket}</td>
        <td style="padding:5px 8px;border:1px solid #1E3A5F;text-align:center;white-space:nowrap;">${fmtD(item.tglMulai)}</td>
        <td style="padding:5px 8px;border:1px solid #1E3A5F;text-align:center;white-space:nowrap;">${item.tglMulai === item.tglSelesai ? " - " : fmtD(item.tglSelesai)}</td>
        <td style="padding:5px 8px;border:1px solid #1E3A5F;">${item.wkLabels}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>`
      : ""
  }
  ${renderDUSignHTML(du)}
  </div>`;
        setTimeout(() => updateProsemJpVisibility(), 0);
      }

      function toggleProsemJPText() {
        if (state.prosemShowJp === undefined) state.prosemShowJp = true;
        state.prosemShowJp = !state.prosemShowJp;
        updateProsemJpVisibility();
        if (typeof scheduleSave === "function") scheduleSave();
      }

      function updateProsemJpVisibility() {
        const show = state.prosemShowJp !== false;
        const tab = document.getElementById("tab-prosem");
        if (tab) {
          if (show) {
            tab.classList.remove("hide-prosem-jp");
          } else {
            tab.classList.add("hide-prosem-jp");
          }
        }
        const btn = document.getElementById("btn-toggle-prosem-jp");
        if (btn) {
          btn.innerHTML = show
            ? `<i class="material-symbols-rounded" style="font-size:16px" data-lucide="eye-off"></i> <span>Sembunyikan Teks JP</span>`
            : `<i class="material-symbols-rounded" style="font-size:16px" data-lucide="eye"></i> <span>Tampilkan Teks JP</span>`;
          if (window.lucide) window.lucide.createIcons();
        }
      }

      // ============================================================
      // ATP PRINT BUILDER  -  no rowspan, full borders per row
      // ============================================================
      function buildATPPrintHTML(du) {
        const arr = state.atpData;
        if (!arr || arr.length === 0) return "<p>Data ATP kosong.</p>";

        const tableFsPt = 11; // 11pt agar proporsional dan muat halaman dengan efisien
        const BC = "#1E3A5F";
        const B = `0.5pt solid ${BC}`;

        const CS =
          `padding:5px 7px;font-size:${tableFsPt}pt;font-family:'Times New Roman',Times,serif;` +
          `line-height:1.3;word-break:break-word;overflow-wrap:break-word;box-sizing:border-box;border:${B};text-align:left;vertical-align:top;color:#000000;`;
        const elData = arr.filter((el) => el.rows && el.rows.length > 0);
        const hasSubelemen = elData.some(el => el.subElemen && el.subElemen.trim() !== "");

        const CG = `<colgroup>
    <col style="width:${hasSubelemen ? "14%" : "15%"};">
    ${hasSubelemen ? `<col style="width:14%;">` : ""}
    <col style="width:${hasSubelemen ? "24%" : "25%"};">
    <col style="width:${hasSubelemen ? "24%" : "30%"};">
    <col style="width:${hasSubelemen ? "24%" : "30%"};">
  </colgroup>`;

        // -- Header dokumen & Identitas (11pt, Single Spacing) ----------
        const metaHTML = [
          ["Nama Sekolah", escH(du.sekolah)],
          ["Mata Pelajaran", escH(du.mapel)],
          ["Fase / Kelas", escH(formatFaseKelas(du.fase, du.kelas))],
          ["Tahun Ajaran", escH(du.tahun)],
        ]
          .map(
            ([l, v]) => `
    <div style="display:flex;font-size:11pt;line-height:1.2;margin:0;padding:0;font-family:'Times New Roman',Times,serif;color:#000000;">
      <span style="min-width:120pt;flex-shrink:0;">${l}</span>
      <span style="margin-right:6pt;">:</span>
      <span>${v}</span>
    </div>`,
          )
          .join("");

        const HDR_TD = (ex = "") =>
          `style="${CS}font-weight:700;background:#BDD7EE;color:#000000;text-align:center;${ex}"`;

        const totalRows = elData.length;
        const orderedAtp = getOrderedATPList();
        const allAtpItems = orderedAtp.length > 0
          ? orderedAtp
              .map(item => `<li style="margin-bottom:3px; line-height:1.3; text-align:left; color:#000000; word-break:break-word; overflow-wrap:break-word;">${escH(item.tp)}</li>`)
              .join("")
          : "<li>-</li>";

        let rowsHTML = "";
        rowsHTML += `<tbody style="page-break-inside: auto; break-inside: auto; color:#000000;">`;
        elData.forEach((el, index) => {
          const tpItems = (el.rows || [])
            .map(row => `<li style="margin-bottom:3px; line-height:1.3; text-align:left; color:#000000; word-break:break-word;">${escH(row.tp)}</li>`)
            .join("");

          const atpCell = index === 0
            ? `<td rowspan="${totalRows}" style="${CS}vertical-align:top;color:#000000;word-break:break-word;overflow-wrap:break-word;">
                <ol style="margin:0;padding-left:14pt;list-style-type:decimal;color:#000000;word-break:break-word;overflow-wrap:break-word;">
                  ${allAtpItems}
                </ol>
              </td>`
            : "";

          const subElemenCell = hasSubelemen
            ? `<td style="${CS}font-weight:normal;text-align:left;color:#000000;vertical-align:top;">${escH(el.subElemen || "-")}</td>`
            : "";

          rowsHTML += `<tr style="page-break-inside: auto !important; break-inside: auto !important;">
            <td style="${CS}font-weight:normal;text-align:left;color:#000000;vertical-align:top;">${escH(el.elemen)}</td>
            ${subElemenCell}
            <td style="${CS}vertical-align:top;color:#000000;">${escH(el.cp)}</td>
            <td style="${CS}vertical-align:top;color:#000000;">
              <ul style="margin:0;padding-left:14pt;list-style-type:disc;color:#000000;word-break:break-word;">
                ${tpItems || "<li>-</li>"}
              </ul>
            </td>
            ${atpCell}
          </tr>`;
        });
        rowsHTML += `</tbody>`;

        const tablesHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:${tableFsPt}pt;table-layout:fixed;margin-bottom:10pt;page-break-inside:auto;break-inside:auto;">
      ${CG}
      <thead style="display:table-header-group;">
        <tr>
          <th ${HDR_TD()}>Elemen</th>
          ${hasSubelemen ? `<th ${HDR_TD()}>Sub Elemen</th>` : ""}
          <th ${HDR_TD()}>Capaian Pembelajaran</th>
          <th ${HDR_TD()}>Tujuan Pembelajaran</th>
          <th ${HDR_TD()}>Alur Tujuan Pembelajaran</th>
        </tr>
      </thead>
      ${rowsHTML}
    </table>
  `;

        // -- Footer Tanda Tangan ---------------------------------------
        const footerHTML = renderDUSignHTML(du, true, 11);

        return `
    <div style="margin-bottom:8pt;font-family:'Times New Roman',Times,serif;">
      <div style="font-size:13pt;font-weight:700;text-align:center;
        text-transform:uppercase;margin-bottom:6pt;">Alur Tujuan Pembelajaran</div>
      ${metaHTML}
      <div style="margin-top:8pt;font-size:11pt;font-weight:700;">
        Capaian Pembelajaran Fase ${escH(du.fase)}
      </div>
    </div>
    ${tablesHTML}
    ${footerHTML}`;
      }
      function buildAbsensiPrintHTML(sem, du, customFilter = null, customSplit = null) {
        const semLabel = sem === 1 ? "Ganjil" : "Genap";
        const absObj = sem === 1 ? state.absensiGanjil : state.absensiGenap;
        const siswa = state.siswa;
        const HARI_S = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

        const hariEfektif = buildHariEfektif(sem);
        const monthGroups = {};
        const monthOrder = [];
        for (const h of hariEfektif) {
          const mk = h.tanggal.substring(0, 7);
          if (!monthGroups[mk]) {
            monthGroups[mk] = [];
            monthOrder.push(mk);
          }
          monthGroups[mk].push(h.tanggal);
        }
        const sel = customFilter ? customFilter : (_absFilter[sem] || new Set(monthOrder));
        const selMonths = monthOrder.filter((mk) => sel.has(mk));
        const selDates = selMonths.flatMap((mk) => monthGroups[mk]);
        if (!selDates.length) return "<p style='padding:20px;text-align:center;'>Tidak ada tanggal yang dipilih.</p>";

        const isSplit = customSplit !== null ? customSplit : (_absSplit[sem] && selMonths.length > 1);
        let groups = (isSplit && selMonths.length > 1)
          ? selMonths.map((mk) => ({ dates: monthGroups[mk] }))
          : [{ dates: selDates }];

        // A4 portrait usable: 184.6mm wide x 271.6mm tall
        const PW = 184.6,
          PH = 271.6;
        const fsPt = 8;
        const pt2mm = (v) => v / 2.8346,
          mm2pt = (v) => v * 2.8346;
        const noW = 6,
          dateW = 7,
          ketW = 6;
        const rowHmm = pt2mm(fsPt) * 1.35 + 1.0,
          hdrHmm = pt2mm(fsPt) * 1.5 + 1.5;
        const fsS = +(fsPt * 0.88).toFixed(1);
        const p = (v) => mm2pt(v).toFixed(1) + "pt";

        const TH = (ex) =>
          `style="background:#BDD7EE;color:#000;font-weight:700;border:0.5pt solid #1E3A5F;text-align:center;vertical-align:middle;font-size:${fsPt}pt;padding:1pt 2pt;height:${p(hdrHmm)};${ex}"`;
        const TH2 = (ex) =>
          `style="background:#9DC3E6;color:#000;font-weight:700;border:0.5pt solid #1E3A5F;text-align:center;vertical-align:middle;font-size:${fsPt}pt;padding:1pt 2pt;height:${p(hdrHmm)};${ex}"`;
        const TD = (ex) =>
          `style="border:0.5pt solid #1E3A5F;text-align:center;vertical-align:middle;font-size:${fsPt}pt;padding:1pt 2pt;height:${p(rowHmm)};${ex}"`;

        function headerBlock(pg, tot) {
          return `<div style="margin-bottom:${p(3)};font-size:${fsPt}pt;color:#000000;">
      <div style="font-size:${fsPt + 2}pt;font-weight:700;text-align:center;text-transform:uppercase;margin-bottom:${p(2)};color:#000000;">Daftar Hadir Murid</div>
      <div style="display:flex;flex-direction:column;gap:1.5pt;">
        ${[
          ["Nama Sekolah", escH(du.sekolah)],
          ["Mata Pelajaran", escH(du.mapel)],
          ["Fase / Kelas", escH(formatFaseKelas(du.fase, du.kelas))],
          ["Semester", semLabel],
          ["Tahun Ajaran", escH(du.tahun)],
        ]
          .map(
            ([l, v]) =>
              `<div style="display:flex;font-size:${fsPt}pt;line-height:1.2;margin:0;padding:0;color:#000000;"><span style="min-width:85pt;flex-shrink:0;">${l}</span><span style="margin-right:6pt;">:</span><span style="font-weight:normal;">${v}</span></div>`,
          )
          .join("")}
      </div>
    </div>`;
        }

        function chunkMonthSpans(chunk) {
          const spans = [];
          for (const mk of selMonths) {
            const cnt = chunk.filter((d) => d.startsWith(mk)).length;
            if (cnt > 0) {
              const [yr, mo] = mk.split("-").map(Number);
              spans.push({ label: `${BULAN[mo - 1]} ${yr}`, count: cnt });
            }
          }
          return spans;
        }

        function studentRows(chunk, scopeTotals, namaWVal) {
          const chunkByMonth = selMonths
            .map((mk) => ({ mk, dates: chunk.filter((d) => d.startsWith(mk)) }))
            .filter((g) => g.dates.length > 0);
          return siswa
            .map((sVal, si) => {
              const snm = typeof sVal === "string" ? sVal : sVal.name;
              const zb = si % 2 === 1 ? "background:#F8F8F8;" : "";
              const cells = chunkByMonth
                .map(({ mk, dates }) => {
                  const mH = dates.filter(
                    (d) => (absObj[`${si}_${d}`] || "") === "H",
                  ).length;
                  const mS = dates.filter(
                    (d) => (absObj[`${si}_${d}`] || "") === "S",
                  ).length;
                  const mI = dates.filter(
                    (d) => (absObj[`${si}_${d}`] || "") === "I",
                  ).length;
                  const mA = dates.filter(
                    (d) => (absObj[`${si}_${d}`] || "") === "A",
                  ).length;
                  return (
                    dates
                      .map((iso) => {
                        const v = absObj[`${si}_${iso}`] || "";
                        const bg =
                          v === "H"
                            ? "#D4EDDA;color:#155724"
                            : v === "S"
                              ? "#FFF3CD;color:#856404"
                              : v === "I"
                                ? "#FFE0B2;color:#8B4500"
                                : v === "A"
                                  ? "#FFCDD2;color:#B71C1C"
                                  : "transparent;color:#000";
                        return `<td ${TD(`width:${p(dateW)};background:${bg};font-weight:normal;`)}>${v}</td>`;
                      })
                      .join("") +
                    `<td ${TD(`width:${p(ketW)};background:#D4EDDA;color:#155724;font-weight:normal;`)}>${mH || ""}</td>` +
                    `<td ${TD(`width:${p(ketW)};background:#FFF3CD;color:#856404;font-weight:normal;`)}>${mS || ""}</td>` +
                    `<td ${TD(`width:${p(ketW)};background:#FFE0B2;color:#8B4500;font-weight:normal;`)}>${mI || ""}</td>` +
                    `<td ${TD(`width:${p(ketW)};background:#FFCDD2;color:#B71C1C;font-weight:normal;`)}>${mA || ""}</td>`
                  );
                })
                .join("");
              return `<tr>
        <td ${TD(`width:${p(noW)};text-align:center;${zb}`)}>${si + 1}</td>
        <td ${TD(`width:${p(namaWVal)};text-align:left;padding:1pt 3pt;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${zb}`)}>${escH(snm)}</td>
        ${cells}
      </tr>`;
            })
            .join("");
        }

        function summaryRows(chunk) {
          const chunkByMonth = selMonths
            .map((mk) => ({ mk, dates: chunk.filter((d) => d.startsWith(mk)) }))
            .filter((g) => g.dates.length > 0);
          const rH = chunkByMonth
            .map(
              ({ dates }) =>
                dates
                  .map((iso) => {
                    const c = Array.from(
                      { length: siswa.length },
                      (_, x) => (absObj[`${x}_${iso}`] || "") === "H",
                    ).filter(Boolean).length;
                    return `<td ${TD(`width:${p(dateW)};background:#C6EFCE;color:#1A6B3A;font-weight:normal;`)}>${c || ""}</td>`;
                  })
                  .join("") +
                `<td colspan="4" ${TD("background:#E8F0FE;")}></td>`,
            )
            .join("");
          const rX = chunkByMonth
            .map(
              ({ dates }) =>
                dates
                  .map((iso) => {
                    const c = Array.from({ length: siswa.length }, (_, x) => {
                      const v = absObj[`${x}_${iso}`] || "";
                      return v === "S" || v === "I" || v === "A";
                    }).filter(Boolean).length;
                    return `<td ${TD(`width:${p(dateW)};background:#FFCDD2;color:#B71C1C;font-weight:normal;`)}>${c || ""}</td>`;
                  })
                  .join("") +
                `<td colspan="4" ${TD("background:#FFE4E4;")}></td>`,
            )
            .join("");
          return `
      <tr><td colspan="2" ${TD("background:#E8F0FE;font-weight:normal;text-align:center;")}>Jumlah Kehadiran</td>${rH}</tr>
      <tr><td colspan="2" ${TD("background:#FFE4E4;font-weight:normal;text-align:center;color:#B71C1C;")}>Jumlah Ketidakhadiran</td>${rX}</tr>`;
        }

        const footerHTML = renderDUSignHTML(du, true, 10);

        let html = "";
        groups.forEach((group) => {
          const scopeTotals = siswa.map((_, si) => ({
            H: group.dates.filter((d) => (absObj[`${si}_${d}`] || "") === "H")
              .length,
            S: group.dates.filter((d) => (absObj[`${si}_${d}`] || "") === "S")
              .length,
            I: group.dates.filter((d) => (absObj[`${si}_${d}`] || "") === "I")
              .length,
            A: group.dates.filter((d) => (absObj[`${si}_${d}`] || "") === "A")
              .length,
          }));
          // Dates per page: fill remaining width after No + fixed date/ket cols
          // We don't know nMonths per chunk yet, so estimate with 1 HSIA group per chunk
          // then namaW = PW - noW - nDatesxdateW - nMonthsInChunkx4xketW
          // Start with a max dpp ignoring namaW, then adjust
          const maxDpp = Math.max(
            1,
            Math.floor((PW - noW - 4 * ketW - 20) / dateW),
          );
          const dpp = maxDpp;
          const chunks = [];
          for (let i = 0; i < group.dates.length; i += dpp)
            chunks.push(group.dates.slice(i, i + dpp));
          chunks.forEach((chunk, ci) => {
            const spans = chunkMonthSpans(chunk);
            html += `<div class="abs-print-page">
      ${headerBlock(ci + 1, chunks.length)}`;

            // Compute namaW for this chunk: remaining space but never less than longest name width
            const nMonthsInChunk = spans.length;
            const longestNameMM =
              Math.max(
                ...siswa.map((sVal) => {
                  const snm = typeof sVal === "string" ? sVal : sVal.name;
                  return snm ? snm.length : 8;
                }),
                8,
              ) *
                pt2mm(fsPt) *
                0.58 +
              4;
            const availNamaW =
              PW - noW - chunk.length * dateW - nMonthsInChunk * 4 * ketW;
            const namaW = Math.max(longestNameMM, availNamaW);

            html += `<table style="border-collapse:collapse;width:100%;table-layout:fixed;font-size:${fsPt}pt;">
        <colgroup>
          <col style="width:${p(noW)}"><col style="width:${p(namaW)}">
          ${spans
            .map((s) => {
              const mk =
                selMonths.find((mk) => {
                  const [yr, mo] = mk.split("-").map(Number);
                  return `${BULAN[mo - 1]} ${yr}` === s.label;
                }) || "";
              const mDates = chunk.filter((d) => d.startsWith(mk));
              return (
                mDates.map(() => `<col style="width:${p(dateW)}">`).join("") +
                `<col style="width:${p(ketW)}"><col style="width:${p(ketW)}"><col style="width:${p(ketW)}"><col style="width:${p(ketW)}">`
              );
            })
            .join("")}
        </colgroup>
        <thead>
          <tr>
            <th ${TH(`width:${p(noW)};`)} rowspan="3">No.</th>
            <th ${TH(`width:${p(namaW)};`)} rowspan="3">Nama Murid</th>
            ${spans.map((s) => `<th ${TH2("")} colspan="${s.count + 4}">${s.label}</th>`).join("")}
          </tr>
          <tr>
            ${spans
              .map((s) => {
                const mk =
                  selMonths.find((mk) => {
                    const [yr, mo] = mk.split("-").map(Number);
                    return `${BULAN[mo - 1]} ${yr}` === s.label;
                  }) || "";
                const mDates = chunk.filter((d) => d.startsWith(mk));
                return (
                  mDates
                    .map((iso) => {
                      const d = pd(iso);
                      return `<th ${TH(`width:${p(dateW)};`)}>${HARI_S[d.getUTCDay()]}</th>`;
                    })
                    .join("") +
                  `<th ${TH2("background:var(--th-ket-bg, #dbeafe)!important;color:var(--th-ket-fg, #1e3a8a)!important;")} colspan="4">Keterangan</th>`
                );
              })
              .join("")}
          </tr>
          <tr>
            ${spans
              .map((s) => {
                const mk =
                  selMonths.find((mk) => {
                    const [yr, mo] = mk.split("-").map(Number);
                    return `${BULAN[mo - 1]} ${yr}` === s.label;
                  }) || "";
                const mDates = chunk.filter((d) => d.startsWith(mk));
                return (
                  mDates
                    .map((iso) => {
                      const d = pd(iso);
                      return `<th ${TH(`width:${p(dateW)};`)}>${d.getUTCDate()}</th>`;
                    })
                    .join("") +
                  `<th ${TH(`background:var(--th-h-bg, #dcfce7)!important;color:var(--th-h-fg, #166534)!important;width:${p(ketW)};`)}>H</th>` +
                  `<th ${TH(`background:var(--th-s-bg, #fef08a)!important;color:var(--th-s-fg, #713f12)!important;width:${p(ketW)};`)}>S</th>` +
                  `<th ${TH(`background:var(--th-i-bg, #ffedd5)!important;color:var(--th-i-fg, #9a3412)!important;width:${p(ketW)};`)}>I</th>` +
                  `<th ${TH(`background:var(--th-a-bg, #fee2e2)!important;color:var(--th-a-fg, #991b1b)!important;width:${p(ketW)};`)}>A</th>`
                );
              })
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${studentRows(chunk, scopeTotals, namaW)}
          ${summaryRows(chunk)}
        </tbody>
      </table>
      ${footerHTML}
      </div>`;
          });
        });
        return html;
      }

      // ============================================================
      // BUILD NILAI PRINT HTML
      // Mengikuti pendekatan absensi: lebar TP tetap & seragam,
      // kolom nama murid = sisa lebar halaman (PW - fixed cols).
      // Jika TP terlalu banyak, di-chunk per halaman (seperti absensi).
      //
      // babFilter: '' = semua bab -> per bab + rekap + referensi TP
      //            'X' = satu bab saja
      // ============================================================
      function buildNilaiPrintHTML(sem, du, babFilter) {
        const allTps = sem === 1 ? state.tpGanjil : state.tpGenap;
        const penilaianConfigs =
          sem === 1
            ? state.pengaturanPenilaianGanjil || []
            : state.pengaturanPenilaianGenap || [];
        const slmConfig = penilaianConfigs.find((p) => p.id === "slm") || {
          name: "Sumatif Lingkup Materi",
          active: true,
          bobot: 50,
        };
        const sasConfig = penilaianConfigs.find((p) => p.id === "sas") || {
          name: "Sumatif Akhir Semester",
          active: true,
          bobot: 50,
        };
        const activeCustomCols = penilaianConfigs.filter(
          (p) => p.id !== "nr" && p.id !== "slm" && p.id !== "sas" && p.active,
        );

        const obj = sem === 1 ? state.nilaiGanjil : state.nilaiGenap;
        const siswa = state.siswa;
        const semLabel = sem === 1 ? "Ganjil" : "Genap";
        const semUpper = sem === 1 ? "GANJIL" : "GENAP";

        // -- Ukuran halaman (Portrait A4) -----------------------------------
        const PW = 190; // usable width mm (210 - 2x10) untuk A4 portrait
        const siswaCount = (siswa || []).length;
        // Optimasi font & tinggi baris agar 36 siswa + TTD selalu muat 1 halaman
        const isCompact = siswaCount > 28;
        const fsPt = isCompact ? 10.5 : 11.5;
        const p2m = (v) => v / 2.8346; // pt -> mm
        const m2p = (v) => (v * 2.8346).toFixed(1) + "pt"; // mm -> pt string
        const rowH = isCompact ? (p2m(fsPt) * 0.95 + 0.1) : (p2m(fsPt) * 1.05 + 0.1);
        const hdrH = p2m(fsPt) * 1.15 + 0.2;

        const getHdrFs = (txt) => {
          if (!txt) return "";
          const len = String(txt).length;
          if (len > 12) return "font-size:9pt;line-height:1.05;";
          if (len > 8) return "font-size:10pt;line-height:1.1;";
          return "";
        };

        const B = "0.5pt solid #000000";
        const TH = (
          ex = "",
        ) => `style="background:#BDD7EE;color:#000;font-weight:700;border:${B};
    text-align:center;vertical-align:middle;font-size:${fsPt}pt;
    padding:0.5pt 1pt;height:${m2p(hdrH)};word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;line-height:1.1;${ex}"`;
        const TH2 = (
          ex = "",
        ) => `style="background:#BDD7EE;color:#000;font-weight:700;border:${B};
    text-align:center;vertical-align:middle;font-size:${fsPt}pt;
    padding:0.5pt 1pt;height:${m2p(hdrH)};word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;line-height:1.1;${ex}"`;
        const TH3 = (
          ex = "",
        ) => `style="background:#BDD7EE;color:#000;font-weight:700;border:${B};
    text-align:center;vertical-align:middle;font-size:${fsPt}pt;
    padding:0.5pt 1pt;height:${m2p(hdrH)};word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;line-height:1.1;${ex}"`;
        const THC = (
          ex = "",
        ) => `style="background:#BDD7EE;color:#000;font-weight:700;border:${B};
    text-align:center;vertical-align:middle;font-size:${fsPt}pt;
    padding:0.5pt 1pt;height:${m2p(hdrH)};word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;line-height:1.1;${ex}"`;
        const TD = (
          ex = "",
        ) => `style="border:${B};text-align:center;vertical-align:middle;
    font-size:${fsPt}pt;padding:0.3pt 1.5pt;height:${m2p(rowH)};${ex}"`;

        // -- Daftar bab & helper ---------------------------------
        const babs = [];
        allTps.forEach((tp) => {
          if (tp.bab !== undefined && tp.bab !== null && String(tp.bab).trim() !== "") {
            const bStr = String(tp.bab).trim();
            if (!babs.includes(bStr)) babs.push(bStr);
          }
        });
        const targetBabs =
          babFilter === ""
            ? babs
            : babs.filter((b) => String(b).trim() === String(babFilter).trim());
        const getTpsBab = (bab) =>
          allTps
            .map((tp, oi) => ({ ...tp, originalIndex: oi }))
            .filter((tp) => !tp.ev && String(tp.bab || "").trim() === String(bab).trim());

        // -- Meta header (1 Kolom Vertikal dengan Jarak Bersih) --
        const metaHTML = (sub = "") => `
    <div style="margin-bottom:7pt;color:#000000;font-family:'Times New Roman',Times,serif;">
      <div style="font-size:${fsPt + 2.5}pt;font-weight:700;text-align:center;
        text-transform:uppercase;margin-bottom:6pt;letter-spacing:0.5px;color:#000000;">
        DAFTAR NILAI SEMESTER ${semUpper}${sub}
      </div>
      <div style="display:flex;flex-direction:column;gap:1.5pt;margin-bottom:6pt;">
        ${[
          ["Nama Sekolah", escH(du.sekolah)],
          ["Mata Pelajaran", escH(du.mapel)],
          ["Fase / Kelas", escH(formatFaseKelas(du.fase, du.kelas))],
          ["Tahun Ajaran", escH(du.tahun)],
        ]
          .map(
            ([l, v]) =>
              `<div style="display:flex;font-size:${fsPt}pt;line-height:1.2;margin:0;padding:0;color:#000000;"><span style="min-width:85pt;flex-shrink:0;">${l}</span><span style="margin-right:6pt;">:</span><span style="font-weight:normal;">${v}</span></div>`,
          )
          .join("")}
      </div>
    </div>`;

        // -- Tanda tangan (Disesuaikan dengan gap proporsional) --
        const signSpaceBottom = isCompact ? "68px" : "80px";
        const signMarginTop = isCompact ? "16px" : "24px";
        let ttdGuruImg = "";
        let ttdKepsekImg = "";
        let capSekolahImg = "";

        if (du.imgTtdGuru)
          ttdGuruImg = `<img class="img-sign-print" src="${du.imgTtdGuru}" style="position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(100% - 30px); max-height: 160px; max-width: 260px; object-fit: contain; z-index: 1;">`;
        if (du.imgTtdKepsek)
          ttdKepsekImg = `<img class="img-sign-print" src="${du.imgTtdKepsek}" style="position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(100% - 30px); max-height: 160px; max-width: 260px; object-fit: contain; z-index: 1;">`;
        if (du.imgCapSekolah)
          capSekolahImg = `<img class="img-sign-print" src="${du.imgCapSekolah}" style="position: absolute; right: 80%; transform: translateX(50%); bottom: calc(100% - 40px); opacity: 0.8; max-height: 200px; max-width: 200px; object-fit: contain; z-index: 0; mix-blend-mode: multiply;">`;

        const signHTML = `
          <div class="sign-box" style="display: flex; justify-content: space-between; width: 100%; margin-top: ${signMarginTop}; gap: 20px; break-inside: avoid; page-break-inside: avoid; border: none !important; padding: 0 !important; background: transparent !important; color: var(--text); font-size: ${fsPt}pt;">
            <!-- Left Column: Kepala Sekolah -->
            <div class="sign-col" style="text-align: center; min-width: 140px; max-width: 45%; flex: 1; display: flex; flex-direction: column; align-items: center; border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important;">
              <!-- Spacer aligning with Tempat, Tanggal on the right -->
              <div style="line-height: 1.15; margin-bottom: 2px; color: transparent; user-select: none; pointer-events: none; white-space: nowrap;">&nbsp;</div>
              <!-- Mengetahui label -->
              <div style="line-height: 1.15; margin-bottom: 2px; color: var(--text); font-weight: normal; text-align: center; white-space: nowrap;">Mengetahui,</div>
              <div class="role" style="color: var(--text); font-weight: normal; text-align: center; border: none !important; padding: 0 !important; margin: 0 0 ${signSpaceBottom} 0 !important; white-space: nowrap; line-height: 1.15;">Kepala Sekolah</div>
              <div class="name" style="position: relative; border: none !important; padding: 0 !important; margin: 0 !important; color: var(--text); line-height: 1.15;">
                ${capSekolahImg}
                ${ttdKepsekImg}
                <div style="position: relative; z-index: 2;">${du.kepsekSign}</div>
              </div>
            </div>
            
            <!-- Right Column: Guru Pengampu -->
            <div class="sign-col" style="text-align: center; min-width: 140px; max-width: 45%; flex: 1; display: flex; flex-direction: column; align-items: center; border: none !important; background: transparent !important; padding: 0 !important; margin: 0 !important;">
              <!-- Tempat, Tanggal at the very top -->
              <div style="line-height: 1.15; margin-bottom: 2px; color: var(--text); font-weight: normal; text-align: center; white-space: nowrap;">
                ${escH(du.tempat)}, ${fmtD(du.tgl)}
              </div>
              <!-- Spacer aligning with Mengetahui on the left -->
              <div style="line-height: 1.15; margin-bottom: 2px; color: transparent; user-select: none; pointer-events: none; white-space: nowrap;">&nbsp;</div>
              <div class="role" style="color: var(--text); font-weight: normal; text-align: center; border: none !important; padding: 0 !important; margin: 0 0 ${signSpaceBottom} 0 !important; white-space: nowrap; line-height: 1.15;">Guru Pengampu</div>
              <div class="name" style="position: relative; border: none !important; padding: 0 !important; margin: 0 !important; color: var(--text); line-height: 1.15;">
                ${ttdGuruImg}
                <div style="position: relative; z-index: 2;">${du.guruSign}</div>
              </div>
            </div>
          </div>
        `;

        let html = "";

        // ========================================================
        // DAFTAR NILAI - Filter & Deduplikasi Konfigurasi
        // ========================================================
        const activeConfigs = [];
        const seenConfigIds = new Set();
        (penilaianConfigs || []).forEach((p) => {
          if (p && p.active && p.id !== "nr" && !seenConfigIds.has(p.id)) {
            seenConfigIds.add(p.id);
            activeConfigs.push(p);
          }
        });

        const allActiveTps = allTps
          .map((tp, oi) => ({ ...tp, originalIndex: oi }))
          .filter(
            (tp) =>
              !tp.ev &&
              (babFilter === "" || String(tp.bab || "").trim() === String(babFilter).trim()),
          );

        // Pre-compute nilai murid untuk efisiensi
        const studentCalculations = siswa.map((sVal, si) => {
          const snm = typeof sVal === "string" ? sVal : sVal.name;
          const snis = typeof sVal === "string" ? "" : sVal.nis || "";
          const snisn = typeof sVal === "string" ? "" : sVal.nisn || "";
          
          let sumWeighted = 0;
          let sumBobot = 0;

          // 1. Sumatif Lingkup Materi (TPs)
          let sumTP = 0;
          let countTP = 0;
          const tpScores = allActiveTps.map((tp) => {
            const val = obj[`tp_${tp.originalIndex}_${si}`] || "";
            const numVal = parseFloat(val);
            if (!isNaN(numVal)) {
              sumTP += numVal;
              countTP++;
            }
            return val;
          });
          const rataTP = countTP > 0 ? (sumTP / countTP) : null;
          const slmConfig = activeConfigs.find(c => c.id === 'slm');
          if (slmConfig && rataTP !== null) {
            sumWeighted += rataTP * slmConfig.bobot;
            sumBobot += slmConfig.bobot;
          }

          // 2. Sumatif Akhir Semester (SAS)
          const sasConfig = activeConfigs.find(c => c.id === 'sas');
          const sasSubScores = [];
          let scoreSAS = null;
          if (sasConfig) {
            const subs = sasConfig.subKomponents || [];
            if (subs.length > 0) {
              let sumSub = 0, countSub = 0;
              subs.forEach((sub) => {
                let key = (sub.id === "sasnt") ? "sasnt_" + si : (sub.id === "sast") ? "sast_" + si : "sub_comp_sas_" + sub.id + "_" + si;
                const val = obj[key] || "";
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                  sumSub += numVal;
                  countSub++;
                }
                sasSubScores.push(val);
              });
              if (countSub > 0) scoreSAS = sumSub / countSub;
            } else {
              const val = obj["sas_" + si] || "";
              const numVal = parseFloat(val);
              if (!isNaN(numVal)) scoreSAS = numVal;
              sasSubScores.push(val);
            }
            if (scoreSAS !== null) {
              sumWeighted += scoreSAS * sasConfig.bobot;
              sumBobot += sasConfig.bobot;
            }
          }

          // 3. Custom components
          const customCalculations = activeConfigs.filter(c => c.id !== 'slm' && c.id !== 'sas').map(col => {
            const subs = col.subKomponents || [];
            const subScores = [];
            let scoreCust = null;
            if (subs.length > 0) {
              let sumSub = 0, countSub = 0;
              subs.forEach(sub => {
                const key = "sub_comp_" + col.id + "_" + sub.id + "_" + si;
                const val = obj[key] || "";
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                  sumSub += numVal;
                  countSub++;
                }
                subScores.push(val);
              });
              if (countSub > 0) scoreCust = sumSub / countSub;
            } else {
              const key = "c_" + col.id + "_" + si;
              const val = obj[key] || "";
              const numVal = parseFloat(val);
              if (!isNaN(numVal)) scoreCust = numVal;
              subScores.push(val);
            }
            if (scoreCust !== null) {
              sumWeighted += scoreCust * col.bobot;
              sumBobot += col.bobot;
            }
            return { col, subScores, scoreCust };
          });

          // 4. Nilai Rapor
          const manualNA = obj[`na_${si}`];
          const calcNA = sumBobot > 0 ? (sumWeighted / sumBobot).toFixed(1) : "";
          const finalNA = manualNA !== undefined && manualNA !== "" ? manualNA : calcNA;

          return {
            snm, snis, snisn,
            tpScores,
            rataTPStr: rataTP !== null ? rataTP.toFixed(1) : "",
            scoreSASStr: scoreSAS !== null ? scoreSAS.toFixed(1) : "",
            sasSubScores,
            customCalculations,
            finalNA
          };
        });

        // -- 1. Susun definisi seluruh kolom nilai (SLM -> SAS -> Custom -> Nilai Rapor) --
        const scoreColsDef = [];

        // SLM TPs
        if (allActiveTps.length > 0) {
          allActiveTps.forEach((tp, tpIdx) => {
            const sLabel = (tp.kode || "").replace(/^TP\s*/i, "S ") || ("S " + (tpIdx + 1));
            scoreColsDef.push({
              group: "slm",
              type: "tp",
              tpObj: tp,
              tpIndex: tpIdx,
              label: sLabel,
              title: tp.tp,
              isAverage: false
            });
          });
        } else {
          scoreColsDef.push({
            group: "slm",
            type: "tp",
            tpObj: null,
            tpIndex: 0,
            label: "S 1",
            title: "",
            isAverage: false
          });
        }

        // NA Sumatif SLM
        scoreColsDef.push({
          group: "slm",
          type: "na_slm",
          label: "NA SLM",
          isAverage: true,
          bgCell: "rgba(226, 239, 218, 0.75)"
        });

        // Komponen Aktif Lainnya (SAS & Custom)
        activeConfigs.forEach((col) => {
          if (col.id === "slm") return;
          const cLabel = col.code || col.name;
          const subs = col.subKomponents || [];

          if (col.id === "sas") {
            if (subs.length > 0) {
              subs.forEach((sub, subIdx) => {
                let subLabel = sub.code || sub.name;
                if (/^non[\s-]?tes$/i.test(String(subLabel).trim())) {
                  subLabel = "Nontes";
                }
                scoreColsDef.push({
                  group: "sas",
                  type: "sub",
                  colId: "sas",
                  subId: sub.id,
                  subIndex: subIdx,
                  label: subLabel,
                  parentLabel: "Sumatif Akhir Semester",
                  isAverage: false
                });
              });
              scoreColsDef.push({
                group: "sas",
                type: "na_sas",
                label: "NA SAS",
                parentLabel: "Sumatif Akhir Semester",
                isAverage: true,
                bgCell: "rgba(255, 242, 204, 0.75)"
              });
            } else {
              scoreColsDef.push({
                group: "sas",
                type: "na_sas",
                label: "NA SAS",
                parentLabel: "Sumatif Akhir Semester",
                isAverage: true,
                bgCell: "rgba(255, 242, 204, 0.75)"
              });
            }
          } else {
            if (subs.length > 0) {
              subs.forEach((sub, subIdx) => {
                let subLabel = sub.code || sub.name;
                if (/^non[\s-]?tes$/i.test(String(subLabel).trim())) {
                  subLabel = "Nontes";
                }
                scoreColsDef.push({
                  group: col.id,
                  type: "sub",
                  colId: col.id,
                  subId: sub.id,
                  subIndex: subIdx,
                  label: subLabel,
                  parentLabel: cLabel,
                  isAverage: false
                });
              });
              scoreColsDef.push({
                group: col.id,
                type: "na_custom",
                colId: col.id,
                label: "NA " + cLabel,
                parentLabel: cLabel,
                isAverage: true,
                bgCell: "rgba(242, 249, 238, 0.75)"
              });
            } else {
              scoreColsDef.push({
                group: col.id,
                type: "na_custom",
                colId: col.id,
                label: cLabel,
                parentLabel: cLabel,
                isAverage: true,
                bgCell: "rgba(242, 249, 238, 0.75)"
              });
            }
          }
        });

        // Nilai Rapor
        scoreColsDef.push({
          group: "nr",
          type: "nr",
          label: "Nilai Rapor",
          isAverage: true,
          bgCell: "rgba(217, 225, 242, 0.75)"
        });

        // -- 2. Hitung Ukuran & Pembagian Proporsional Berdasarkan Jenis Kolom --
        const noW = 9; // mm (Nomor)
        const maxNameLen = Math.max(
          ...studentCalculations.map((s) => (s.snm || "").length),
          15,
        );
        // Estimasi ~2.2mm per karakter pada font 12pt, min 50mm, max 65mm
        const namaW = Math.max(50, Math.min(65, Math.ceil(maxNameLen * 2.2)));
        const maxAvailScoreW = PW - noW - namaW; // Max ruang untuk kolom nilai (~116-131mm)

        // Helper rekomendasi lebar alami kolom nilai berdasarkan jenis kontennya
        function getOptimalColWidth(col) {
          if (col.type === "tp" || col.type === "sub") {
            if (/nontes|non[\s-]?tes/i.test(col.label || "")) {
              return 14; // 14mm agar kata "Nontes" tidak terpotong atau terpisah
            }
            return 11; // 11mm untuk kolom nilai angka tunggal (S1, S2, Tes)
          }
          if (
            col.type === "na_slm" ||
            col.type === "na_sas" ||
            col.type === "nr"
          ) {
            return 13; // 13mm pas & cukup untuk 4 digit (misal: 98,75) serta header 2 baris
          }
          if (col.isAverage || col.type === "na_custom") {
            const lblLen = (col.label || "").length;
            return Math.max(13, Math.min(18, Math.ceil(lblLen * 1.8)));
          }
          return 12;
        }

        // Pembagian kolom secara seimbang dan proporsional per halaman
        function partitionColumnsEqually(cols, maxW) {
          const totalW = cols.reduce(
            (sum, col) => sum + getOptimalColWidth(col),
            0,
          );
          if (totalW <= maxW) {
            return [cols];
          }

          let numPages = Math.max(2, Math.ceil(totalW / maxW));

          while (numPages <= cols.length) {
            const targetColsPerPage = cols.length / numPages;
            const chunks = [];
            let startIdx = 0;
            let possible = true;

            for (let p = 0; p < numPages; p++) {
              let endIdx;
              if (p === numPages - 1) {
                endIdx = cols.length;
              } else {
                endIdx = Math.round((p + 1) * targetColsPerPage);
              }

              let chunk = cols.slice(startIdx, endIdx);
              let chunkW = chunk.reduce(
                (sum, col) => sum + getOptimalColWidth(col),
                0,
              );

              // Jika chunkW melebihi batas, mundurkan batas sampai muat
              while (chunkW > maxW && endIdx > startIdx + 1) {
                endIdx--;
                chunk = cols.slice(startIdx, endIdx);
                chunkW = chunk.reduce(
                  (sum, col) => sum + getOptimalColWidth(col),
                  0,
                );
              }

              if (chunkW > maxW) {
                possible = false;
                break;
              }

              chunks.push(chunk);
              startIdx = endIdx;
            }

            if (possible && startIdx === cols.length) {
              return chunks;
            }

            numPages++;
          }

          // Fallback jika kondisi di atas tidak terpenuhi
          const chunks = [];
          let currentChunk = [];
          let currentChunkW = 0;
          cols.forEach((col) => {
            const colW = getOptimalColWidth(col);
            if (
              currentChunk.length > 0 &&
              currentChunkW + colW > maxW
            ) {
              chunks.push(currentChunk);
              currentChunk = [col];
              currentChunkW = colW;
            } else {
              currentChunk.push(col);
              currentChunkW += colW;
            }
          });
          if (currentChunk.length > 0) {
            chunks.push(currentChunk);
          }
          return chunks;
        }

        const tableChunks = partitionColumnsEqually(scoreColsDef, maxAvailScoreW);

        // -- 3. Helper Render Tabel Per Halaman --
        function renderTableChunk(chunkCols, pageSubTitle, showSign, isLastChunk) {
          const naturalScoreW = chunkCols.reduce(
            (sum, col) => sum + getOptimalColWidth(col),
            0,
          );

          let effectiveNamaW = namaW;
          let colWidths = [];

          if (naturalScoreW <= maxAvailScoreW) {
            // Kolom nilai muat di ruang yang ada
            // Batasi pembesaran maksimal 1.15x agar kolom nilai tidak merenggang terlalu lebar
            const rawScale = maxAvailScoreW / naturalScoreW;
            const scale = Math.min(1.15, rawScale);
            colWidths = chunkCols.map((col) =>
              Math.round(getOptimalColWidth(col) * scale),
            );

            // Jika masih ada sisa ruang (karena scale dibatasi 1.15x), berikan ke Nama Murid hingga max 85mm
            const scoreW = colWidths.reduce((a, b) => a + b, 0);
            const rem = PW - noW - effectiveNamaW - scoreW;
            if (rem > 0) {
              const extraNama = Math.min(30, rem);
              effectiveNamaW += extraNama;
            }
          } else {
            // Jika melebihi batas, kecilkan secara proporsional
            const scale = maxAvailScoreW / naturalScoreW;
            colWidths = chunkCols.map((col) =>
              Math.max(9, Math.round(getOptimalColWidth(col) * scale)),
            );
          }

          const finalScoreW = colWidths.reduce((a, b) => a + b, 0);
          const totalTableW = noW + effectiveNamaW + finalScoreW;

          // Kelompokkan kolom berturutan yang memiliki 'group' yang sama untuk header
          const groups = [];
          chunkCols.forEach((col) => {
            if (
              groups.length === 0 ||
              groups[groups.length - 1].group !== col.group
            ) {
              groups.push({
                group: col.group,
                parentLabel: col.parentLabel,
                cols: [col],
              });
            } else {
              groups[groups.length - 1].cols.push(col);
            }
          });

          const formatHeaderLabel = (lbl) => {
            if (!lbl) return "";
            if (lbl === "NA SLM") return "NA<br>SLM";
            if (lbl === "NA SAS") return "NA<br>SAS";
            if (lbl === "Nilai Rapor") return "Nilai<br>Rapor";
            if (/^NA\s+/i.test(lbl)) {
              return escH(lbl).replace(/^NA\s+/i, "NA<br>");
            }
            if (/^non[\s-]?tes$/i.test(String(lbl).trim())) {
              return "Nontes";
            }
            return escH(lbl);
          };

          const r2H = m2p(hdrH * 1.8);

          let row1HTML = `<th ${TH("font-weight:700;")} rowspan="2">No</th><th ${TH("text-align:center;padding:1pt 6pt;white-space:nowrap;font-weight:700;")} rowspan="2">Nama Murid</th>`;
          let row2HTML = "";

          groups.forEach((g) => {
            const groupWidthMM = g.cols.reduce(
              (sum, col) => sum + (colWidths[chunkCols.indexOf(col)] || 0),
              0,
            );

            let fullTitle = "";
            let shortTitle = "";
            let isContinuation = false;

            // Cek apakah grup ini merupakan lanjutan dari halaman sebelumnya
            const firstColInChunk = g.cols[0];
            const originalIndexInAll = scoreColsDef.indexOf(firstColInChunk);
            if (originalIndexInAll > 0 && scoreColsDef[originalIndexInAll - 1].group === g.group) {
              isContinuation = true;
            }

            if (g.group === "slm") {
              fullTitle = isContinuation ? "Sumatif Lingkup Materi (Lanjutan)" : "Sumatif Lingkup Materi";
              shortTitle = isContinuation ? "SLM (Lanjutan)" : "SLM";
            } else if (g.group === "sas") {
              fullTitle = isContinuation ? "Sumatif Akhir Semester (Lanjutan)" : "Sumatif Akhir Semester";
              shortTitle = isContinuation ? "SAS (Lanjutan)" : "SAS";
            } else if (g.group === "nr") {
              fullTitle = "Nilai Rapor";
              shortTitle = "Nilai Rapor";
            } else {
              fullTitle =
                g.parentLabel ||
                (g.cols[0] ? g.cols[0].parentLabel || g.cols[0].label : "");
              shortTitle = g.cols[0] ? g.cols[0].label || fullTitle : fullTitle;
              if (isContinuation) {
                fullTitle += " (Lanjutan)";
                shortTitle += " (Lanjutan)";
              }
            }

            // Hitung estimasi kebutuhan ruang teks (~2.2mm per karakter + margin agar tidak mepet garis batas)
            const fullReqW = fullTitle.length * 2.2 + 8;
            const shortReqW = shortTitle.length * 2.2 + 6;

            let displayText = fullTitle;
            if (groupWidthMM < fullReqW) {
              if (groupWidthMM >= shortReqW) {
                displayText = shortTitle;
              } else if (g.group === "slm" || g.group === "sas") {
                displayText = g.group.toUpperCase(); // Fallback singkat "SLM" / "SAS"
              } else {
                displayText = shortTitle;
              }
            }

            // Aturan khusus untuk lanjutan "Sumatif Lingkup Materi" (slm)
            if (g.group === "slm" && isContinuation) {
              const reqWForSAS = "Sumatif Akhir Semester".length * 2.2 + 8;
              if (groupWidthMM < reqWForSAS) {
                displayText = "...";
              } else {
                displayText = "Sumatif Lingkup Materi";
              }
            }

            if (g.group === "slm") {
              row1HTML += `<th ${THC("padding:1pt 3pt;font-weight:700;")} colspan="${g.cols.length}" title="${escH(fullTitle)}"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;font-weight:700;padding:0 2px;">${escH(displayText)}</div></th>`;
              g.cols.forEach((col) => {
                if (col.type === "tp") {
                  row2HTML += `<th ${THC(`font-size:${fsPt}pt;white-space:nowrap;font-weight:700;height:${r2H};vertical-align:middle;`)} title="${escH(col.title || "")}">${formatHeaderLabel(col.label)}</th>`;
                } else {
                  row2HTML += `<th ${THC(`font-size:${fsPt}pt;white-space:nowrap;font-weight:700;height:${r2H};vertical-align:middle;`)}>${formatHeaderLabel(col.label)}</th>`;
                }
              });
            } else if (g.group === "sas") {
              row1HTML += `<th ${THC("padding:1pt 3pt;font-weight:700;")} colspan="${g.cols.length}" title="${escH(fullTitle)}"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;font-weight:700;padding:0 2px;">${escH(displayText)}</div></th>`;
              g.cols.forEach((col) => {
                row2HTML += `<th ${THC(`font-size:${fsPt}pt;white-space:nowrap;font-weight:700;height:${r2H};vertical-align:middle;`)}>${formatHeaderLabel(col.label)}</th>`;
              });
            } else if (g.group === "nr") {
              row1HTML += `<th ${TH3("font-weight:700;")} rowspan="2"><div style="text-align:center;font-weight:700;line-height:1.1;white-space:nowrap;">Nilai<br>Rapor</div></th>`;
            } else {
              if (g.cols.length > 1) {
                row1HTML += `<th ${THC("padding:1pt 3pt;font-weight:700;")} colspan="${g.cols.length}" title="${escH(fullTitle)}"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;font-weight:700;padding:0 2px;">${escH(displayText)}</div></th>`;
                g.cols.forEach((col) => {
                  row2HTML += `<th ${THC(`font-size:${fsPt}pt;white-space:nowrap;font-weight:700;height:${r2H};vertical-align:middle;`)}>${formatHeaderLabel(col.label)}</th>`;
                });
              } else {
                row1HTML += `<th ${THC("padding:1pt 3pt;font-weight:700;white-space:nowrap;")} rowspan="2" title="${escH(fullTitle)}"><div style="text-align:center;font-weight:700;line-height:1.1;white-space:nowrap;padding:0 2px;">${formatHeaderLabel(g.cols[0].label || fullTitle)}</div></th>`;
              }
            }
          });

          const pbStyle = isLastChunk ? "" : "page-break-after:always;break-after:page;";
          let tHTML = `<div style="${pbStyle}">`;
          tHTML += metaHTML(pageSubTitle ? `  -  ${pageSubTitle}` : "");

          tHTML += `
        <table style="width:${totalTableW}mm;border-collapse:collapse;font-size:${fsPt}pt;table-layout:fixed;margin-bottom:5pt;margin-left:0;">
          <colgroup>
            <col style="width:${noW}mm;">
            <col style="width:${effectiveNamaW}mm;">
            ${chunkCols.map((_, i) => `<col style="width:${colWidths[i]}mm;">`).join("")}
          </colgroup>
          <thead>
            <tr>${row1HTML}</tr>
            ${row2HTML ? `<tr>${row2HTML}</tr>` : ""}
          </thead>
          <tbody>
            ${studentCalculations
              .map((sc, si) => {
                const zb = si % 2 === 1 ? "background:#F2F2F2;" : "";
                let rowData = "";

                chunkCols.forEach((col) => {
                  if (col.type === "tp") {
                    const val = sc.tpScores[col.tpIndex] || "";
                    rowData += `<td ${TD(`white-space:nowrap;${zb}`)}>${escH(val)}</td>`;
                  } else if (col.type === "na_slm") {
                    rowData += `<td ${TD(`font-weight:700;background:${col.bgCell};white-space:nowrap;`)}>${sc.rataTPStr}</td>`;
                  } else if (col.type === "sub") {
                    let val = "";
                    if (col.colId === "sas") {
                      val = sc.sasSubScores[col.subIndex] || "";
                    } else {
                      const cc = sc.customCalculations.find(
                        (c) => c.col.id === col.colId,
                      );
                      if (cc && cc.subScores) {
                        val = cc.subScores[col.subIndex] || "";
                      }
                    }
                    rowData += `<td ${TD(`white-space:nowrap;${zb}`)}>${escH(val)}</td>`;
                  } else if (col.type === "na_sas") {
                    rowData += `<td ${TD(`font-weight:700;background:${col.bgCell};white-space:nowrap;`)}>${sc.scoreSASStr}</td>`;
                  } else if (col.type === "na_custom") {
                    const cc = sc.customCalculations.find(
                      (c) => c.col.id === col.colId,
                    );
                    const str =
                      cc && cc.scoreCust !== null
                        ? cc.scoreCust.toFixed(1)
                        : "";
                    rowData += `<td ${TD(`font-weight:700;background:${col.bgCell};white-space:nowrap;`)}>${str}</td>`;
                  } else if (col.type === "nr") {
                    rowData += `<td ${TD(`font-weight:700;background:${col.bgCell};white-space:nowrap;`)}>${escH(sc.finalNA)}</td>`;
                  }
                });

                return `<tr>
                <td ${TD(`white-space:nowrap;${zb}`)}>${si + 1}</td>
                <td ${TD(`text-align:left;padding:1pt 6pt;white-space:nowrap;word-break:keep-all;overflow:hidden;text-overflow:ellipsis;${zb}`)}>${escH(sc.snm)}</td>
                ${rowData}
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>`;

          if (showSign) {
            tHTML += signHTML;
          }
          tHTML += `</div>`;
          return tHTML;
        }

        // -- 4. Render Seluruh Halaman Chunk --
        tableChunks.forEach((chunkCols, cIdx) => {
          const isLast = cIdx === tableChunks.length - 1;
          const subTitle = babFilter !== "" ? `Bab ${escH(babFilter)}` : "";
          html += renderTableChunk(chunkCols, subTitle, isLast, isLast);
        });

          // ====================================================
          // HALAMAN REFERENSI TP  -  semua bab, halaman terakhir
          // ====================================================
          html += `<div style="page-break-before:always;break-before:page;">`;
          html += `<div style="margin-bottom:7pt;">
      <div style="font-size:${fsPt + 3}pt;font-weight:700;text-align:center;
        text-transform:uppercase;margin-bottom:3pt;">Referensi Tujuan Pembelajaran</div>
      <div style="font-size:${fsPt}pt;text-align:center;color:#555;margin-bottom:7pt;">
        Semester ${semLabel}  -  ${escH(du.mapel)}  - 
        ${escH(formatKelas(du.kelas))}  -  TA ${escH(du.tahun)}
      </div>
    </div>`;

          if (babs.length === 0) {
            const activeTpsAll = allTps
              .map((tp, oi) => ({ ...tp, originalIndex: oi }))
              .filter((tp) => !tp.ev);
            if (activeTpsAll.length > 0) {
              html += `
        <div style="page-break-inside:auto;break-inside:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:${fsPt}pt;">
            <thead><tr>
              <th ${TH("width:52pt;")}>Kode TP</th>
              <th ${TH("text-align:center;padding:2pt 6pt;")}>Tujuan Pembelajaran</th>
            </tr></thead>
            <tbody>
              ${activeTpsAll
                .map((tp, i) => {
                  const zb = i % 2 === 1 ? "background:#F2F2F2;" : "";
                  return `<tr>
                  <td ${TD(`font-weight:700;${zb}`)}>${escH(tp.kode)}</td>
                  <td ${TD(`text-align:left;padding:1pt 6pt;${zb}`)}>${escH(tp.tp)}</td>
                </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>`;
            }
          } else {
            babs.forEach((bab, bi) => {
              const bTps = getTpsBab(bab);
              if (!bTps.length) return;
              html += `
        <div style="${bi > 0 ? "margin-top:8pt;" : ""}
            page-break-inside:auto;break-inside:auto;">
          <div style="font-size:${fsPt}pt;font-weight:700;background:#1B3A5C;
            color:#fff;padding:2pt 6pt;">Bab ${escH(bab)}</div>
          <table style="width:100%;border-collapse:collapse;font-size:${fsPt}pt;">
            <thead><tr>
              <th ${TH("width:52pt;")}>Kode TP</th>
              <th ${TH("text-align:center;padding:2pt 6pt;")}>Tujuan Pembelajaran</th>
            </tr></thead>
            <tbody>
              ${bTps
                .map((tp, i) => {
                  const zb = i % 2 === 1 ? "background:#F2F2F2;" : "";
                  return `<tr>
                  <td ${TD(`font-weight:700;${zb}`)}>${escH(tp.kode)}</td>
                  <td ${TD(`text-align:left;padding:1pt 6pt;${zb}`)}>${escH(tp.tp)}</td>
                </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>`;
            });

            const unbaggedTps = allTps
              .map((tp, oi) => ({ ...tp, originalIndex: oi }))
              .filter(
                (tp) =>
                  !tp.ev &&
                  (tp.bab === undefined || tp.bab === null || String(tp.bab).trim() === ""),
              );
            if (unbaggedTps.length > 0) {
              html += `
        <div style="margin-top:8pt;page-break-inside:auto;break-inside:auto;">
          <div style="font-size:${fsPt}pt;font-weight:700;background:#1B3A5C;
            color:#fff;padding:2pt 6pt;">Tujuan Pembelajaran Lainnya</div>
          <table style="width:100%;border-collapse:collapse;font-size:${fsPt}pt;">
            <thead><tr>
              <th ${TH("width:52pt;")}>Kode TP</th>
              <th ${TH("text-align:center;padding:2pt 6pt;")}>Tujuan Pembelajaran</th>
            </tr></thead>
            <tbody>
              ${unbaggedTps
                .map((tp, i) => {
                  const zb = i % 2 === 1 ? "background:#F2F2F2;" : "";
                  return `<tr>
                  <td ${TD(`font-weight:700;${zb}`)}>${escH(tp.kode)}</td>
                  <td ${TD(`text-align:left;padding:1pt 6pt;${zb}`)}>${escH(tp.tp)}</td>
                </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>`;
            }
          }
          html += signHTML;
          html += `</div>`;

        return html;
      }

      // ============================================================
      // LOCALSTORAGE SAVING & EXPORT
      // ============================================================

      // ============================================================
      // PRINT
      // ============================================================
      let _currentPrintAbsensiSem = 1;

      function openPrintAbsensiModal(sem) {
        _currentPrintAbsensiSem = sem || 1;
        const modal = document.getElementById("modal-print-absensi");
        if (!modal) return;

        const titleEl = document.getElementById("print-absensi-modal-title");
        if (titleEl) {
          titleEl.textContent = `Cetak Absensi Murid  -  Semester ${sem === 1 ? 'Ganjil' : 'Genap'}`;
        }

        const listEl = document.getElementById("print-absensi-months-list");
        if (listEl) {
          const monthOrder = _absAllMonths(_currentPrintAbsensiSem);
          const currentSel = _absFilter[_currentPrintAbsensiSem] || new Set(monthOrder);

          if (monthOrder.length === 0) {
            listEl.innerHTML = '<p style="font-size:12px; color:var(--text-light); grid-column:span 2;">Tidak ada bulan tersedia</p>';
          } else {
            listEl.innerHTML = monthOrder
              .map((mk) => {
                const [yr, mo] = mk.split("-").map(Number);
                const checked = currentSel.has(mk) ? "checked" : "";
                return `
                  <label style="display: flex; align-items: center; gap: 8px; font-size: var(--fs-sm); cursor: pointer; color: var(--text);">
                    <input type="checkbox" class="print-abs-month-cb" value="${mk}" ${checked} style="accent-color: var(--accent); width: 16px; height: 16px;">
                    <span>${BULAN[mo - 1]} ${yr}</span>
                  </label>
                `;
              })
              .join("");
          }
        }

        const splitCb = document.getElementById("print-absensi-split-cb");
        if (splitCb) {
          splitCb.checked = _absSplit[_currentPrintAbsensiSem] !== undefined ? _absSplit[_currentPrintAbsensiSem] : true;
        }

        modal.classList.remove("hidden");
      }

      function closePrintAbsensiModal() {
        const modal = document.getElementById("modal-print-absensi");
        if (modal) modal.classList.add("hidden");
      }

      function toggleAllPrintAbsensiMonths(checked) {
        document.querySelectorAll(".print-abs-month-cb").forEach((cb) => (cb.checked = checked));
      }

      function executePrintAbsensiFromModal() {
        const cbs = document.querySelectorAll(".print-abs-month-cb:checked");
        const selectedMonths = Array.from(cbs).map((cb) => cb.value);

        if (selectedMonths.length === 0) {
          alertAsync("Silakan pilih minimal satu bulan untuk dicetak.");
          return;
        }

        const splitCb = document.getElementById("print-absensi-split-cb");
        const isSplit = splitCb ? splitCb.checked : true;

        closePrintAbsensiModal();

        const customFilter = new Set(selectedMonths);
        runAbsensiPrint(_currentPrintAbsensiSem, customFilter, isSplit);
      }

      function getPDFFileName(docType, sem = null) {
        const du =
          typeof _lastDU !== "undefined" && _lastDU
            ? _lastDU
            : typeof getDU === "function"
            ? getDU()
            : {};
        let semStr = "";
        if (sem !== null && sem !== undefined && sem !== "") {
          if (String(sem) === "1" || String(sem).toLowerCase() === "ganjil") {
            semStr = "ganjil";
          } else if (String(sem) === "2" || String(sem).toLowerCase() === "genap") {
            semStr = "genap";
          } else {
            semStr = String(sem).toLowerCase();
          }
        }

        const cleanPart = (s) =>
          (s || "")
            .toString()
            .trim()
            .replace(/[\/\\:\*\?"<>\|]/g, "-")
            .replace(/\s+/g, "_");

        let doc = cleanPart(docType).toLowerCase();

        let mapel = (du.mapel || "")
          .trim()
          .toLowerCase()
          .replace(/[\/\\:\*\?"<>\|]/g, "-")
          .replace(/[^a-z0-9\-_]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");

        let cleanKelas = (du.kelas || "").trim().replace(/^kelas\s+/i, "").trim();
        let cleanRombel = (du.rombel || "").trim().replace(/^kelas\s+/i, "").trim();

        let kelasStr = "";
        if (cleanRombel) {
          const ckLower = cleanKelas.toLowerCase();
          const crLower = cleanRombel.toLowerCase();
          if (ckLower && crLower.includes(ckLower)) {
            kelasStr = cleanRombel;
          } else if (/^(I|V|X|L|C|D|M|[0-9])/i.test(cleanRombel)) {
            kelasStr = cleanRombel;
          } else if (cleanKelas) {
            kelasStr = `${cleanKelas} ${cleanRombel}`;
          } else {
            kelasStr = cleanRombel;
          }
        } else {
          kelasStr = cleanKelas;
        }

        kelasStr = cleanPart(kelasStr);

        let tahun = (du.tahun || "")
          .trim()
          .replace(/\//g, "-")
          .replace(/\s+/g, "")
          .replace(/[^a-zA-Z0-9\-]/g, "");

        const parts = [doc];
        if (semStr) parts.push(semStr);
        if (mapel && !["kaldik", "kalender", "kalender_pendidikan"].includes(doc)) {
          parts.push(mapel);
        }
        if (kelasStr) parts.push(kelasStr);
        if (tahun) parts.push(tahun);

        return parts.filter(Boolean).join("_");
      }

      function executeSystemPrint(customTitle) {
        const origTitle = "promesta.id";
        if (customTitle) {
          document.title = customTitle;
        }

        let cleaned = false;
        const cleanup = () => {
          if (cleaned) return;
          cleaned = true;
          document
            .querySelectorAll(".tab-pane")
            .forEach((p) => p.classList.remove("printing"));
          const pf = document.getElementById("kal-print-footer-wrap");
          if (pf) pf.remove();
          const atpP = document.getElementById("atp-print-page");
          if (atpP) atpP.remove();
          const absP = document.getElementById("abs-print-pages");
          if (absP) absP.remove();
          const nilP = document.getElementById("nilai-print-pages");
          if (nilP) nilP.remove();
          document.title = origTitle;
        };

        window.addEventListener("afterprint", cleanup, { once: true });

        // Delay 50ms to ensure DOM updates and title change are fully applied before opening print dialog
        setTimeout(() => {
          window.print();
          // Fallback cleanup after print dialog closes
          setTimeout(cleanup, 2000);
        }, 50);
      }

      function checkIframePrint() {
        if (window !== window.parent) {
          let el = document.getElementById("print-overlay");
          if (!el) {
            el = document.createElement("div");
            el.id = "print-overlay";
            el.style.cssText =
              "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;pointer-events:none;";
            el.innerHTML = `<div style="background:var(--card);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--border);padding:24px;border-radius:12px;max-width:320px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.5);pointer-events:auto;transform:translateY(20px);transition:transform 0.3s;font-family:'Inter',sans-serif;"><div style="margin-bottom:12px;color:var(--accent)"><i class="material-symbols-rounded" style="font-size:48px" data-lucide="printer"></i></div><h3 style="margin:0 0 10px;color:var(--text);font-size:18px;">Buka di Tab Baru</h3><p style="margin:0 0 20px;color:var(--text-light);font-size:14px;line-height:1.5;">Pratinjau memblokir fitur cetak. Silakan klik tombol di bawah ini untuk membuka aplikasi di tab baru, lalu coba cetak kembali.</p><div style="display:flex;flex-direction:column;gap:10px;"><a href="${window.location.href}" target="_blank" style="background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3);padding:10px 20px;border-radius:6px;font-weight:600;text-decoration:none;font-family:'Inter',sans-serif;font-size:14px;display:block;width:100%;box-sizing:border-box;">Buka di Tab Baru Sekarang</a><button onclick="document.getElementById('print-overlay').style.opacity='0';document.getElementById('print-overlay').style.pointerEvents='none';" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:10px 20px;border-radius:6px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;font-size:14px;width:100%;box-sizing:border-box;">Tutup</button></div></div>`;
            document.body.appendChild(el);
          }
          el.style.pointerEvents = "auto";
          el.offsetWidth;
          el.style.opacity = "1";
          el.querySelector("div").style.transform = "translateY(0)";
          return true;
        }
        return false;
      }

      function runAbsensiPrint(sem, customFilter = null, customSplit = null) {
        if (checkIframePrint()) return;

        document
          .querySelectorAll(".tab-pane")
          .forEach((p) => p.classList.remove("printing"));
        const pane = document.getElementById("tab-absensi");
        if (pane) pane.classList.add("printing");

        let styleEl = document.getElementById("print-page-style");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "print-page-style";
          document.head.appendChild(styleEl);
        }

        const du = _lastDU || getDU();
        const printHTML = buildAbsensiPrintHTML(sem, du, customFilter, customSplit);

        let printDiv = document.getElementById("abs-print-pages");
        if (printDiv) printDiv.remove();
        printDiv = document.createElement("div");
        printDiv.id = "abs-print-pages";
        printDiv.innerHTML = printHTML;
        if (pane) pane.appendChild(printDiv);

        styleEl.textContent = `
          @media print {
            @page { size: A4 portrait; margin: 12.7mm; }
            * { -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; font-family: 'Times New Roman', Times, serif !important; }
            html, body {
              display: block !important;
              flex: none !important;
              float: none !important;
              position: static !important;
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              overflow: visible !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }
            .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .sem-toggle,
            .out-actions, .btn-print, .tbl-actions, .nav-btn, .stats-row, .tab-header, .no-print, .modal, .modal-backdrop { display:none!important; }
            .content { display: block !important; flex: none !important; float: none !important; height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; margin: 0 !important; padding: 0 !important; }
            .tab-pane { display:none!important; padding:0; }
            .tab-pane.printing { display:block!important; flex: none !important; float: none !important; padding:0; background:#fff!important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; margin: 0 !important; }
            .printing .doc-frame, .printing .abs-filter-bar { display:none!important; }
            .printing > div:not(#abs-print-pages) { display:none!important; }
            #abs-print-pages { display:block!important; overflow:visible!important; }
            .abs-print-page {
              page-break-after: always;
              break-after: page;
              page-break-inside: auto !important;
              break-inside: auto !important;
              padding: 0;
            }
            .abs-print-page:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            table:not(.kal-tbl) { border-collapse: collapse !important; }
            table:not(.kal-tbl):not(.layout-tbl) th,
            table:not(.kal-tbl):not(.layout-tbl) td { border-width: 0.5pt !important; }
            .layout-tbl, .layout-tbl td, .layout-tbl th,
            .doc-meta-list, .doc-meta-list table, .doc-meta-list td, .doc-meta-list th,
            .sign-box, .sign-box table, .sign-box td, .sign-box th { border: none !important; }
          }
          #abs-print-pages { display: none; }
        `;

        const customTitle = getPDFFileName("absensi", sem);
        executeSystemPrint(customTitle);
      }

      function buildDocxSignHTML(du) {
        const kepsekName = du.kepsek || "....................................";
        const kepsekIdStr = du.kepsekIdType && du.kepsekIdType !== "Tanpa ID" && du.kepsekId ? `${du.kepsekIdType}. ${du.kepsekId}` : "";
        const guruName = du.guru || "....................................";
        const guruIdStr = du.guruIdType && du.guruIdType !== "Tanpa ID" && du.guruId ? `${du.guruIdType}. ${du.guruId}` : "";
        const tempatTgl = `${du.tempat || ".................."}, ${fmtD(du.tgl)}`;

        const ttdSpace = `
          <p style="margin: 0; line-height: 1.0; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
          <p style="margin: 0; line-height: 1.0; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
          <p style="margin: 0; line-height: 1.0; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
          <p style="margin: 0; line-height: 1.0; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
        `;
        const ttdKepsekHTML = du.imgTtdKepsek ? `<p style="margin: 2pt 0; text-align: center;"><img src="${du.imgTtdKepsek}" style="max-height: 48pt; max-width: 130pt; object-fit: contain;"></p>` : ttdSpace;
        const ttdGuruHTML = du.imgTtdGuru ? `<p style="margin: 2pt 0; text-align: center;"><img src="${du.imgTtdGuru}" style="max-height: 48pt; max-width: 130pt; object-fit: contain;"></p>` : ttdSpace;

        return `
          <p style="margin: 0; line-height: 12pt; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
          <table class="sign-table-doc" border="0" cellspacing="0" cellpadding="0" style="width: 100%; border: none !important; margin-top: 14pt; border-collapse: collapse; page-break-inside: avoid; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
            <tbody>
              <tr>
                <td style="width: 45%; text-align: center; vertical-align: top; border: none !important; padding: 0 !important; font-family: 'Times New Roman', serif; font-size: 12pt;">
                  <p style="margin: 0 0 2pt 0; line-height: 1.0;">&nbsp;</p>
                  <p style="margin: 0 0 2pt 0; line-height: 1.0;">Mengetahui,</p>
                  <p style="margin: 0 0 2pt 0; line-height: 1.0;">Kepala Sekolah</p>
                  ${ttdKepsekHTML}
                  <p style="margin: 2pt 0 1pt 0; line-height: 1.0; text-decoration: underline; font-weight: bold;">${escH(kepsekName)}</p>
                  <p style="margin: 0; line-height: 1.0; font-size: 11pt;">${escH(kepsekIdStr)}</p>
                </td>
                <td style="width: 10%; border: none !important; padding: 0 !important;">&nbsp;</td>
                <td style="width: 45%; text-align: center; vertical-align: top; border: none !important; padding: 0 !important; font-family: 'Times New Roman', serif; font-size: 12pt;">
                  <p style="margin: 0 0 2pt 0; line-height: 1.0;">${escH(tempatTgl)}</p>
                  <p style="margin: 0 0 2pt 0; line-height: 1.0;">&nbsp;</p>
                  <p style="margin: 0 0 2pt 0; line-height: 1.0;">Guru Pengampu,</p>
                  ${ttdGuruHTML}
                  <p style="margin: 2pt 0 1pt 0; line-height: 1.0; text-decoration: underline; font-weight: bold;">${escH(guruName)}</p>
                  <p style="margin: 0; line-height: 1.0; font-size: 11pt;">${escH(guruIdStr)}</p>
                </td>
              </tr>
            </tbody>
          </table>
        `;
      }

      function buildDocxMetaHTML(du, semLabel, extraRows = []) {
        let rows = [
          { lbl: "Nama Sekolah", val: du.sekolah || "-" },
          { lbl: "Mata Pelajaran", val: du.mapel || "-" },
          { lbl: "Fase / Kelas", val: formatFaseKelas(du.fase, du.kelas, du.rombel) },
          { lbl: "Semester", val: semLabel || "-" },
          { lbl: "Tahun Ajaran", val: du.tahun || "-" }
        ];
        if (extraRows && extraRows.length > 0) {
          rows = rows.concat(extraRows);
        }
        const trs = rows.map(item => `
          <tr>
            <td style="width: 135pt; font-weight: normal !important; border: none !important; padding: 1pt 0; font-family: 'Times New Roman', serif; font-size: 12pt; vertical-align: top; line-height: 1.15; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; color: #000000;">${escH(item.lbl)}</td>
            <td style="width: 14pt; text-align: center; font-weight: normal !important; border: none !important; padding: 1pt 0; font-family: 'Times New Roman', serif; font-size: 12pt; vertical-align: top; line-height: 1.15; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; color: #000000;">:</td>
            <td style="font-weight: normal !important; border: none !important; padding: 1pt 0; font-family: 'Times New Roman', serif; font-size: 12pt; vertical-align: top; line-height: 1.15; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; color: #000000;">${escH(item.val)}</td>
          </tr>
        `).join("");

        return `
          <table class="doc-meta-doc-tbl" border="0" cellspacing="0" cellpadding="0" style="width: auto; border: none !important; margin-bottom: 8pt; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
            <tbody>${trs}</tbody>
          </table>
          <p style="margin: 0; line-height: 12pt; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
        `;
      }

      function buildDocxAbsensiHTML(sem, du) {
        const semLabel = sem === 1 ? "Ganjil" : "Genap";
        const hariEfektif = buildHariEfektif(sem);
        const absObj = sem === 1 ? state.absensiGanjil : state.absensiGenap;
        const siswa = state.siswa || [];

        const monthGroups = {};
        const monthOrder = [];
        for (const h of hariEfektif) {
          const mk = h.tanggal.substring(0, 7);
          if (!monthGroups[mk]) {
            monthGroups[mk] = [];
            monthOrder.push(mk);
          }
          monthGroups[mk].push(h.tanggal);
        }

        const HARI_S = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

        let html = `<div class="doc-title">DAFTAR HADIR MURID</div>`;
        html += buildDocxMetaHTML(du, semLabel);

        if (siswa.length === 0 || monthOrder.length === 0) {
          html += `<p style="text-align:center;">Data siswa atau jadwal presensi belum tersedia.</p>`;
          html += buildDocxSignHTML(du);
          return html;
        }

        monthOrder.forEach((mk, mIndex) => {
          const [yr, mo] = mk.split("-").map(Number);
          const mDates = monthGroups[mk];
          const monthTitle = `${BULAN[mo - 1]} ${yr}`;

          html += `
            <div style="font-weight: bold; font-size: 11pt; margin-top: 10pt; margin-bottom: 4pt; font-family: 'Times New Roman', serif; line-height: 1.0; mso-line-height-rule: exactly;">Bulan: ${monthTitle}</div>
            <table border="1" cellspacing="0" cellpadding="1" style="border-collapse: collapse; width: 100%; font-family: 'Times New Roman', serif; margin-bottom: 8pt; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; mso-para-margin: 0pt; mso-para-margin-bottom: .0001pt;">
              <thead>
                <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                  <th rowspan="3" style="width: 22pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#BDD7EE">No.</th>
                  <th rowspan="3" style="width: 130pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt 4pt;" bgcolor="#BDD7EE">Nama Murid</th>
                  <th colspan="${mDates.length + 4}" style="background-color: #9DC3E6 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#9DC3E6">${monthTitle}</th>
                </tr>
                <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                  ${mDates.map(iso => {
                    const d = pd(iso);
                    const dayName = HARI_S[d.getUTCDay()];
                    return `<th style="width: 18pt; background-color: #BDD7EE !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; font-weight: bold; text-align: center; padding: 1pt;" bgcolor="#BDD7EE">${dayName}</th>`;
                  }).join("")}
                  <th colspan="4" style="background-color: #DBEAFE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt; color: #1e3a8a;" bgcolor="#DBEAFE">Keterangan</th>
                </tr>
                <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                  ${mDates.map(iso => {
                    const d = pd(iso);
                    const dateNum = d.getUTCDate();
                    return `<th style="width: 18pt; background-color: #BDD7EE !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; font-weight: bold; text-align: center; padding: 1pt;" bgcolor="#BDD7EE">${dateNum}</th>`;
                  }).join("")}
                  <th style="width: 16pt; background-color: #DCFCE7 !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; font-weight: bold; text-align: center; padding: 1pt; color: #166534;" bgcolor="#DCFCE7">H</th>
                  <th style="width: 16pt; background-color: #FEF08A !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; font-weight: bold; text-align: center; padding: 1pt; color: #713f12;" bgcolor="#FEF08A">S</th>
                  <th style="width: 16pt; background-color: #FFEDD5 !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; font-weight: bold; text-align: center; padding: 1pt; color: #9a3412;" bgcolor="#FFEDD5">I</th>
                  <th style="width: 16pt; background-color: #FEE2E2 !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; font-weight: bold; text-align: center; padding: 1pt; color: #991b1b;" bgcolor="#FEE2E2">A</th>
                </tr>
              </thead>
              <tbody>
          `;

          siswa.forEach((sVal, si) => {
            const sName = typeof sVal === "string" ? sVal : sVal.name;
            const mH = mDates.filter(d => (absObj[`${si}_${d}`] || "") === "H").length;
            const mS = mDates.filter(d => (absObj[`${si}_${d}`] || "") === "S").length;
            const mI = mDates.filter(d => (absObj[`${si}_${d}`] || "") === "I").length;
            const mA = mDates.filter(d => (absObj[`${si}_${d}`] || "") === "A").length;

            html += `
              <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt;">${si + 1}</td>
                <td style="text-align: left; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 3pt;">${escH(sName)}</td>
                ${mDates.map(iso => {
                  const v = absObj[`${si}_${iso}`] || "";
                  return `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;">${v}</td>`;
                }).join("")}
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0; background-color: #C6EFCE;" bgcolor="#C6EFCE">${mH || ""}</td>
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0; background-color: #FFF3CD;" bgcolor="#FFF3CD">${mS || ""}</td>
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0; background-color: #FFE0B2;" bgcolor="#FFE0B2">${mI || ""}</td>
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0; background-color: #FFCDD2;" bgcolor="#FFCDD2">${mA || ""}</td>
              </tr>
            `;
          });

          // Monthly totals footer
          html += `
            <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
              <td colspan="2" style="text-align: center; font-weight: bold; background-color: #E8F0FE; font-size: 11pt; line-height: 1.0; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 3pt;" bgcolor="#E8F0FE">Jumlah Kehadiran</td>
              ${mDates.map(iso => {
                const cnt = Array.from({ length: siswa.length }, (_, x) => (absObj[`${x}_${iso}`] || "") === "H").filter(Boolean).length;
                return `<td style="text-align: center; font-weight: bold; background-color: #C6EFCE; font-size: 11pt; line-height: 1.0; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;" bgcolor="#C6EFCE">${cnt || ""}</td>`;
              }).join("")}
              <td colspan="4" style="background-color: #E8F0FE; font-size: 11pt; line-height: 1.0; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;" bgcolor="#E8F0FE">&nbsp;</td>
            </tr>
            <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
              <td colspan="2" style="text-align: center; font-weight: bold; background-color: #FFE4E4; color: #B71C1C; font-size: 11pt; line-height: 1.0; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 3pt;" bgcolor="#FFE4E4">Jumlah Ketidakhadiran</td>
              ${mDates.map(iso => {
                const cnt = Array.from({ length: siswa.length }, (_, x) => {
                  const v = absObj[`${x}_${iso}`] || "";
                  return v === "S" || v === "I" || v === "A";
                }).filter(Boolean).length;
                return `<td style="text-align: center; font-weight: bold; background-color: #FFCDD2; color: #B71C1C; font-size: 11pt; line-height: 1.0; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;" bgcolor="#FFCDD2">${cnt || ""}</td>`;
              }).join("")}
              <td colspan="4" style="background-color: #FFE4E4; font-size: 11pt; line-height: 1.0; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;" bgcolor="#FFE4E4">&nbsp;</td>
            </tr>
          `;

          html += `</tbody></table>`;

          // Add page break between months if not the last month
          if (mIndex < monthOrder.length - 1) {
            html += `<div style="page-break-after: always; mso-break-type: section-break;"><br clear="all" style="page-break-before:always"></div>`;
          }
        });

        html += buildDocxSignHTML(du);
        return html;
      }

      function buildDocxNilaiHTML(sem, du) {
        const semLabel = sem === 1 ? "Ganjil" : "Genap";
        const allTps = sem === 1 ? state.tpGanjil : state.tpGenap;
        const tps = (allTps || [])
          .map((tp, originalIndex) => ({ ...tp, originalIndex }))
          .filter((tp) => !tp.ev);

        const penilaianConfigs =
          sem === 1
            ? state.pengaturanPenilaianGanjil || []
            : state.pengaturanPenilaianGenap || [];

        const activeConfigs = (penilaianConfigs || []).filter((p) => p.active);
        const obj = sem === 1 ? state.nilaiGanjil : state.nilaiGenap;
        const siswa = state.siswa || [];

        let html = `<div class="doc-title">DAFTAR NILAI ASESMEN</div>`;
        html += buildDocxMetaHTML(du, semLabel);

        if (siswa.length === 0) {
          html += `<p style="text-align:center;">Data siswa belum tersedia.</p>`;
          html += buildDocxSignHTML(du);
          return html;
        }

        const hasSLM = activeConfigs.some(c => c.id === "slm");
        const hasSASOrOthers = activeConfigs.some(c => c.id !== "slm");
        const shouldSplit = (tps.length >= 4 && hasSASOrOthers) || (tps.length >= 6);

        if (shouldSplit) {
          // PART 1: Sumatif Lingkup Materi (SLM)
          html += `<div style="font-weight: bold; font-size: 11pt; margin-top: 6pt; margin-bottom: 4pt; font-family: 'Times New Roman', serif; line-height: 1.0; mso-line-height-rule: exactly;">A. Asesmen Sumatif Lingkup Materi (SLM)</div>`;
          html += `
            <table border="1" cellspacing="0" cellpadding="1" style="border-collapse: collapse; width: 100%; font-family: 'Times New Roman', serif; margin-bottom: 8pt; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; mso-para-margin: 0pt; mso-para-margin-bottom: .0001pt;">
              <thead>
                <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                  <th rowspan="2" style="width: 22pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#BDD7EE">No.</th>
                  <th rowspan="2" style="width: 48pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#BDD7EE">NIS</th>
                  <th rowspan="2" style="width: 130pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt 4pt;" bgcolor="#BDD7EE">Nama Murid</th>
                  <th colspan="${Math.max(tps.length, 1)}" style="background-color: #C6E0B4 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#C6E0B4">Sumatif Lingkup Materi</th>
                  <th rowspan="2" style="width: 40pt; background-color: #C6E0B4 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#C6E0B4">NA SLM</th>
                </tr>
                <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                  ${tps.length > 0 ? tps.map((tp, i) => {
                    const sLabel = (tp.kode || "").replace(/^TP\s*/i, "S ") || ("S " + (i + 1));
                    return `<th style="width: 26pt; background-color: #E2EFDA !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; text-align: center; padding: 1pt;" bgcolor="#E2EFDA">${escH(sLabel)}</th>`;
                  }).join("") : `<th style="width: 26pt; background-color: #E2EFDA !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; text-align: center; padding: 1pt;" bgcolor="#E2EFDA">S 1</th>`}
                </tr>
              </thead>
              <tbody>
          `;

          siswa.forEach((sVal, si) => {
            const sName = typeof sVal === "string" ? sVal : sVal.name;
            const sNis = typeof sVal === "string" ? "" : sVal.nis || "";
            let sumTP = 0, countTP = 0;
            let tpCells = "";

            if (tps.length > 0) {
              tps.forEach(tp => {
                const key = "tp_" + tp.originalIndex + "_" + si;
                const val = obj[key] || "";
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                  sumTP += numVal;
                  countTP++;
                }
                tpCells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;">${escH(val)}</td>`;
              });
            } else {
              tpCells = `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;">-</td>`;
            }

            const rataTP = countTP > 0 ? (sumTP / countTP) : null;
            const rataTPStr = rataTP !== null ? rataTP.toFixed(1) : "";

            html += `
              <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt;">${si + 1}</td>
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt;">${escH(sNis)}</td>
                <td style="text-align: left; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 3pt;">${escH(sName)}</td>
                ${tpCells}
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #F2F9EE;" bgcolor="#F2F9EE">${rataTPStr}</td>
              </tr>
            `;
          });

          html += `</tbody></table>`;

          // Page Break before Part 2
          html += `<div style="page-break-after: always; mso-break-type: section-break;"><br clear="all" style="page-break-before:always"></div>`;

          // PART 2: SAS & Nilai Rapor
          html += `<div style="font-weight: bold; font-size: 11pt; margin-top: 6pt; margin-bottom: 4pt; font-family: 'Times New Roman', serif; line-height: 1.0; mso-line-height-rule: exactly;">B. Asesmen Sumatif Akhir Semester (SAS) & Nilai Rapor</div>`;
          
          let part2Hdr1 = "";
          let part2Hdr2 = "";

          activeConfigs.forEach(col => {
            if (col.id === "slm") {
              part2Hdr1 += `<th rowspan="2" style="width: 40pt; background-color: #C6E0B4 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#C6E0B4">NA SLM</th>`;
            } else if (col.id === "sas") {
              const subs = col.subKomponents || [];
              if (subs.length > 0) {
                part2Hdr1 += `<th colspan="${subs.length + 1}" style="background-color: #FFE699 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#FFE699">Sumatif Akhir Semester</th>`;
                subs.forEach(sub => {
                  part2Hdr2 += `<th style="width: 34pt; background-color: #FFF2CC !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; text-align: center; padding: 1pt;" bgcolor="#FFF2CC">${escH(sub.code || sub.name)}</th>`;
                });
                part2Hdr2 += `<th style="width: 40pt; background-color: #FFE699 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt;" bgcolor="#FFE699">NA SAS</th>`;
              } else {
                part2Hdr1 += `<th colspan="1" style="background-color: #FFE699 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#FFE699">SAS</th>`;
                part2Hdr2 += `<th style="width: 40pt; background-color: #FFE699 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt;" bgcolor="#FFE699">NA SAS</th>`;
              }
            } else {
              const subs = col.subKomponents || [];
              if (subs.length > 0) {
                part2Hdr1 += `<th colspan="${subs.length + 1}" style="background-color: #E2EFDA !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#E2EFDA">${escH(col.code || col.name)}</th>`;
                subs.forEach(sub => {
                  part2Hdr2 += `<th style="width: 34pt; background-color: #F2F9EE !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; text-align: center; padding: 1pt;" bgcolor="#F2F9EE">${escH(sub.code || sub.name)}</th>`;
                });
                part2Hdr2 += `<th style="width: 40pt; background-color: #E2EFDA !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt;" bgcolor="#E2EFDA">NA</th>`;
              } else {
                part2Hdr1 += `<th rowspan="2" style="width: 40pt; background-color: #E2EFDA !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#E2EFDA">${escH(col.code || col.name)}</th>`;
              }
            }
          });

          html += `
            <table border="1" cellspacing="0" cellpadding="1" style="border-collapse: collapse; width: 100%; font-family: 'Times New Roman', serif; margin-bottom: 8pt; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; mso-para-margin: 0pt; mso-para-margin-bottom: .0001pt;">
              <thead>
                <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                  <th rowspan="2" style="width: 22pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#BDD7EE">No.</th>
                  <th rowspan="2" style="width: 48pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#BDD7EE">NIS</th>
                  <th rowspan="2" style="width: 130pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt 4pt;" bgcolor="#BDD7EE">Nama Murid</th>
                  ${part2Hdr1}
                  <th rowspan="2" style="width: 44pt; background-color: #9DC3E6 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#9DC3E6">Nilai Rapor</th>
                </tr>
                ${part2Hdr2 ? `<tr style="line-height: 1.0; mso-line-height-rule: exactly;">${part2Hdr2}</tr>` : ""}
              </thead>
              <tbody>
          `;

          siswa.forEach((sVal, si) => {
            const sName = typeof sVal === "string" ? sVal : sVal.name;
            const sNis = typeof sVal === "string" ? "" : sVal.nis || "";

            let sumWeighted = 0;
            let sumBobot = 0;
            let part2Cells = "";

            activeConfigs.forEach(col => {
              if (col.id === "slm") {
                let sumTP = 0, countTP = 0;
                if (tps.length > 0) {
                  tps.forEach(tp => {
                    const val = obj["tp_" + tp.originalIndex + "_" + si] || "";
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal)) {
                      sumTP += numVal;
                      countTP++;
                    }
                  });
                }
                const rataTP = countTP > 0 ? (sumTP / countTP) : null;
                if (rataTP !== null) {
                  sumWeighted += rataTP * col.bobot;
                  sumBobot += col.bobot;
                }
                const rataTPStr = rataTP !== null ? rataTP.toFixed(1) : "";
                part2Cells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #F2F9EE;" bgcolor="#F2F9EE">${rataTPStr}</td>`;

              } else if (col.id === "sas") {
                const subs = col.subKomponents || [];
                if (subs.length > 0) {
                  let sumSub = 0, countSub = 0;
                  subs.forEach(sub => {
                    let key = sub.id === "sasnt" ? "sasnt_" + si : sub.id === "sast" ? "sast_" + si : "sub_comp_sas_" + sub.id + "_" + si;
                    const val = obj[key] || "";
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal)) {
                      sumSub += numVal;
                      countSub++;
                    }
                    part2Cells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;">${escH(val)}</td>`;
                  });
                  const rataSAS = countSub > 0 ? (sumSub / countSub) : null;
                  if (rataSAS !== null) {
                    sumWeighted += rataSAS * col.bobot;
                    sumBobot += col.bobot;
                  }
                  const rataSASStr = rataSAS !== null ? rataSAS.toFixed(1) : "";
                  part2Cells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #FFFDF0;" bgcolor="#FFFDF0">${rataSASStr}</td>`;
                } else {
                  const key = "sas_" + si;
                  const val = obj[key] || "";
                  const numVal = parseFloat(val);
                  if (!isNaN(numVal)) {
                    sumWeighted += numVal * col.bobot;
                    sumBobot += col.bobot;
                  }
                  part2Cells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #FFFDF0;" bgcolor="#FFFDF0">${escH(val)}</td>`;
                }

              } else {
                const subs = col.subKomponents || [];
                if (subs.length > 0) {
                  let sumSub = 0, countSub = 0;
                  subs.forEach(sub => {
                    const key = "sub_comp_" + col.id + "_" + sub.id + "_" + si;
                    const val = obj[key] || "";
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal)) {
                      sumSub += numVal;
                      countSub++;
                    }
                    part2Cells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;">${escH(val)}</td>`;
                  });
                  const rataOther = countSub > 0 ? (sumSub / countSub) : null;
                  if (rataOther !== null) {
                    sumWeighted += rataOther * col.bobot;
                    sumBobot += col.bobot;
                  }
                  const rataOtherStr = rataOther !== null ? rataOther.toFixed(1) : "";
                  part2Cells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #F2F9EE;" bgcolor="#F2F9EE">${rataOtherStr}</td>`;
                } else {
                  const key = "comp_" + col.id + "_" + si;
                  const val = obj[key] || "";
                  const numVal = parseFloat(val);
                  if (!isNaN(numVal)) {
                    sumWeighted += numVal * col.bobot;
                    sumBobot += col.bobot;
                  }
                  part2Cells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #F2F9EE;" bgcolor="#F2F9EE">${escH(val)}</td>`;
                }
              }
            });

            const nilaiAkhir = sumBobot > 0 ? Math.round(sumWeighted / sumBobot) : "";

            html += `
              <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt;">${si + 1}</td>
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt;">${escH(sNis)}</td>
                <td style="text-align: left; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 3pt;">${escH(sName)}</td>
                ${part2Cells}
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #D9E1F2;" bgcolor="#D9E1F2">${nilaiAkhir}</td>
              </tr>
            `;
          });

          html += `</tbody></table>`;

        } else {
          // Single compact table for small number of columns
          let hdr1 = "";
          let hdr2 = "";

          activeConfigs.forEach(col => {
            if (col.id === "slm") {
              const slmSpan = (tps.length > 0 ? tps.length : 1) + 1;
              hdr1 += `<th colspan="${slmSpan}" style="background-color: #C6E0B4 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#C6E0B4">Sumatif Lingkup Materi</th>`;
              if (tps.length > 0) {
                tps.forEach((tp, i) => {
                  const sLabel = (tp.kode || "").replace(/^TP\s*/i, "S ") || ("S " + (i + 1));
                  hdr2 += `<th style="width: 26pt; background-color: #E2EFDA !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; text-align: center; padding: 1pt;" bgcolor="#E2EFDA">${escH(sLabel)}</th>`;
                });
              } else {
                hdr2 += `<th style="width: 26pt; background-color: #E2EFDA !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; text-align: center; padding: 1pt;" bgcolor="#E2EFDA">S 1</th>`;
              }
              hdr2 += `<th style="width: 38pt; background-color: #C6E0B4 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt;" bgcolor="#C6E0B4">NA SLM</th>`;
            } else if (col.id === "sas") {
              const subs = col.subKomponents || [];
              if (subs.length > 0) {
                hdr1 += `<th colspan="${subs.length + 1}" style="background-color: #FFE699 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#FFE699">SAS</th>`;
                subs.forEach(sub => {
                  hdr2 += `<th style="width: 30pt; background-color: #FFF2CC !important; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; text-align: center; padding: 1pt;" bgcolor="#FFF2CC">${escH(sub.code || sub.name)}</th>`;
                });
                hdr2 += `<th style="width: 38pt; background-color: #FFE699 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt;" bgcolor="#FFE699">NA SAS</th>`;
              } else {
                hdr1 += `<th rowspan="2" style="width: 38pt; background-color: #FFE699 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#FFE699">SAS</th>`;
              }
            } else {
              hdr1 += `<th rowspan="2" style="width: 38pt; background-color: #E2EFDA !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#E2EFDA">${escH(col.code || col.name)}</th>`;
            }
          });

          html += `
            <table border="1" cellspacing="0" cellpadding="1" style="border-collapse: collapse; width: 100%; font-family: 'Times New Roman', serif; margin-bottom: 8pt; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; mso-para-margin: 0pt; mso-para-margin-bottom: .0001pt;">
              <thead>
                <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                  <th rowspan="2" style="width: 22pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#BDD7EE">No.</th>
                  <th rowspan="2" style="width: 42pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#BDD7EE">NIS</th>
                  <th rowspan="2" style="width: 120pt; background-color: #BDD7EE !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt 4pt;" bgcolor="#BDD7EE">Nama Murid</th>
                  ${hdr1}
                  <th rowspan="2" style="width: 40pt; background-color: #9DC3E6 !important; font-weight: bold; text-align: center; font-size: 11pt; line-height: 1.0; mso-line-height-rule: exactly; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 2pt;" bgcolor="#9DC3E6">Nilai Rapor</th>
                </tr>
                ${hdr2 ? `<tr style="line-height: 1.0; mso-line-height-rule: exactly;">${hdr2}</tr>` : ""}
              </thead>
              <tbody>
          `;

          siswa.forEach((sVal, si) => {
            const sName = typeof sVal === "string" ? sVal : sVal.name;
            const sNis = typeof sVal === "string" ? "" : sVal.nis || "";

            let sumWeighted = 0;
            let sumBobot = 0;
            let rowCells = "";

            activeConfigs.forEach(col => {
              if (col.id === "slm") {
                let sumTP = 0, countTP = 0;
                if (tps.length > 0) {
                  tps.forEach(tp => {
                    const val = obj["tp_" + tp.originalIndex + "_" + si] || "";
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal)) {
                      sumTP += numVal;
                      countTP++;
                    }
                    rowCells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;">${escH(val)}</td>`;
                  });
                } else {
                  rowCells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;">-</td>`;
                }
                const rataTP = countTP > 0 ? (sumTP / countTP) : null;
                if (rataTP !== null) {
                  sumWeighted += rataTP * col.bobot;
                  sumBobot += col.bobot;
                }
                const rataTPStr = rataTP !== null ? rataTP.toFixed(1) : "";
                rowCells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #F2F9EE;" bgcolor="#F2F9EE">${rataTPStr}</td>`;

              } else if (col.id === "sas") {
                const subs = col.subKomponents || [];
                if (subs.length > 0) {
                  let sumSub = 0, countSub = 0;
                  subs.forEach(sub => {
                    let key = sub.id === "sasnt" ? "sasnt_" + si : sub.id === "sast" ? "sast_" + si : "sub_comp_sas_" + sub.id + "_" + si;
                    const val = obj[key] || "";
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal)) {
                      sumSub += numVal;
                      countSub++;
                    }
                    rowCells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 0;">${escH(val)}</td>`;
                  });
                  const rataSAS = countSub > 0 ? (sumSub / countSub) : null;
                  if (rataSAS !== null) {
                    sumWeighted += rataSAS * col.bobot;
                    sumBobot += col.bobot;
                  }
                  const rataSASStr = rataSAS !== null ? rataSAS.toFixed(1) : "";
                  rowCells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #FFFDF0;" bgcolor="#FFFDF0">${rataSASStr}</td>`;
                } else {
                  const key = "sas_" + si;
                  const val = obj[key] || "";
                  const numVal = parseFloat(val);
                  if (!isNaN(numVal)) {
                    sumWeighted += numVal * col.bobot;
                    sumBobot += col.bobot;
                  }
                  rowCells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #FFFDF0;" bgcolor="#FFFDF0">${escH(val)}</td>`;
                }

              } else {
                const key = "comp_" + col.id + "_" + si;
                const val = obj[key] || "";
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                  sumWeighted += numVal * col.bobot;
                  sumBobot += col.bobot;
                }
                rowCells += `<td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #F2F9EE;" bgcolor="#F2F9EE">${escH(val)}</td>`;
              }
            });

            const nilaiAkhir = sumBobot > 0 ? Math.round(sumWeighted / sumBobot) : "";

            html += `
              <tr style="line-height: 1.0; mso-line-height-rule: exactly;">
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt;">${si + 1}</td>
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt;">${escH(sNis)}</td>
                <td style="text-align: left; vertical-align: middle; line-height: 1.0; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 3pt;">${escH(sName)}</td>
                ${rowCells}
                <td style="text-align: center; vertical-align: middle; line-height: 1.0; font-weight: bold; font-size: 11pt; margin: 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; padding: 1pt 2pt; background-color: #D9E1F2;" bgcolor="#D9E1F2">${nilaiAkhir}</td>
              </tr>
            `;
          });

          html += `</tbody></table>`;
        }

        html += buildDocxSignHTML(du);
        return html;
      }

      function downloadDocx(type) {
        let elementId = "";
        let isLandscape = false;
        let titlePrefix = "Dokumen";

        if (type === "atp") {
          elementId = "atp-content";
          isLandscape = true;
          titlePrefix = "ATP";
        } else if (type === "prota") {
          elementId = "prota-content";
          isLandscape = true;
          titlePrefix = "Prota";
        } else if (type === "prosem-1") {
          elementId = "prosem-1-content";
          isLandscape = true;
          titlePrefix = "Prosem_Sem1";
        } else if (type === "prosem-2") {
          elementId = "prosem-2-content";
          isLandscape = true;
          titlePrefix = "Prosem_Sem2";
        } else if (type === "rpe-1") {
          elementId = "rpe-1-content";
          isLandscape = false;
          titlePrefix = "RPE_Sem1";
        } else if (type === "rpe-2") {
          elementId = "rpe-2-content";
          isLandscape = false;
          titlePrefix = "RPE_Sem2";
        } else if (type === "kktp") {
          elementId = "kktp-content";
          isLandscape = true;
          titlePrefix = "KKTP";
        } else if (type === "absensi-1") {
          elementId = "absensi-1-content";
          isLandscape = false;
          titlePrefix = "Presensi_Sem1";
        } else if (type === "absensi-2") {
          elementId = "absensi-2-content";
          isLandscape = false;
          titlePrefix = "Presensi_Sem2";
        } else if (type === "jurnal-1") {
          elementId = "jurnal-1-content";
          isLandscape = true;
          titlePrefix = "Jurnal_Harian_Sem1";
        } else if (type === "jurnal-2") {
          elementId = "jurnal-2-content";
          isLandscape = true;
          titlePrefix = "Jurnal_Harian_Sem2";
        } else if (type === "nilai-1") {
          elementId = "nilai-1-content";
          isLandscape = false;
          titlePrefix = "Daftar_Nilai_Sem1";
        } else if (type === "nilai-2") {
          elementId = "nilai-2-content";
          isLandscape = false;
          titlePrefix = "Daftar_Nilai_Sem2";
        }

        let container = document.getElementById(elementId);
        if (!container || container.querySelector(".empty") || (typeof isGenerated !== "undefined" && !isGenerated)) {
          if (typeof generate === "function") {
            generate();
          }
          container = document.getElementById(elementId);
        }

        if (!container || container.querySelector(".empty")) {
          if (typeof showCustomAlert === "function") {
            showCustomAlert(
              "Data Belum Lengkap",
              "Silakan lengkapi data TP dan Jadwal terlebih dahulu.",
              "warning"
            );
          } else {
            alert("Silakan lengkapi data TP dan Jadwal terlebih dahulu.");
          }
          return;
        }

        const du = typeof getDU === "function" ? getDU() : {};
        const mapelClean = (du.mapel || "").replace(/[^a-zA-Z0-9_\-]/g, "_");
        const kelasClean = (du.kelas || "").replace(/[^a-zA-Z0-9_\-]/g, "_");
        const filename = `${titlePrefix}_${mapelClean || "Dokumen"}_Kelas_${kelasClean || "1"}.doc`;
        const isDense = type.startsWith("absensi") || type.startsWith("nilai") || type.startsWith("prosem");

        let contentHtml = "";

        // Custom specialized builders for Presensi and Daftar Nilai
        if (type === "absensi-1" || type === "absensi-2") {
          const sem = type === "absensi-1" ? 1 : 2;
          contentHtml = buildDocxAbsensiHTML(sem, du);
        } else if (type === "nilai-1" || type === "nilai-2") {
          const sem = type === "nilai-1" ? 1 : 2;
          contentHtml = buildDocxNilaiHTML(sem, du);
        } else {
          // Clone element for HTML preparation
          const clone = container.cloneNode(true);

          // Remove non-printable / action controls
          clone
            .querySelectorAll(
              ".no-print, .btn-print, .btn-docx, .out-actions, button, .prosem-toolbar, .kktp-toolbar, .abs-filter-bar, .kal-filter-bar, .tbl-actions, .kktp-filter-bar, .nilai-filter-bar"
            )
            .forEach((el) => el.remove());

          // Replace .doc-meta-list with Word-native tabulated 3-column table + single space gap
          clone.querySelectorAll(".doc-meta-list, .doc-meta-table").forEach((metaEl) => {
            const metaTable = document.createElement("table");
            metaTable.className = "doc-meta-doc-tbl";
            metaTable.setAttribute("border", "0");
            metaTable.setAttribute("cellspacing", "0");
            metaTable.setAttribute("cellpadding", "0");
            metaTable.style.cssText = "width: auto; border: none !important; margin-bottom: 8pt; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;";

            const rows = [];
            const dmlRows = metaEl.querySelectorAll(".dml-row");
            if (dmlRows.length > 0) {
              dmlRows.forEach((r) => {
                const lbl = r.querySelector(".dml-lbl")?.textContent?.trim() || "";
                const val = r.querySelector(".dml-val")?.textContent?.trim() || "";
                if (lbl || val) {
                  rows.push({ lbl, val });
                }
              });
            } else {
              metaEl.querySelectorAll("tr").forEach((tr) => {
                const tds = tr.querySelectorAll("td, th");
                if (tds.length >= 2) {
                  const lbl = tds[0]?.textContent?.replace(":", "").trim() || "";
                  const val = (tds.length === 2 ? tds[1]?.textContent?.trim() : tds[2]?.textContent?.trim()) || "";
                  if (lbl || val) {
                    rows.push({ lbl, val });
                  }
                }
              });
            }

            if (rows.length > 0) {
              const tbody = document.createElement("tbody");
              rows.forEach((item) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                  <td style="width: 135pt; font-weight: normal !important; border: none !important; padding: 1pt 0; font-family: 'Times New Roman', serif; font-size: 12pt; vertical-align: top; line-height: 1.15; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; color: #000000;">${escH(item.lbl)}</td>
                  <td style="width: 14pt; text-align: center; font-weight: normal !important; border: none !important; padding: 1pt 0; font-family: 'Times New Roman', serif; font-size: 12pt; vertical-align: top; line-height: 1.15; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; color: #000000;">:</td>
                  <td style="font-weight: normal !important; border: none !important; padding: 1pt 0; font-family: 'Times New Roman', serif; font-size: 12pt; vertical-align: top; line-height: 1.15; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt; color: #000000;">${escH(item.val)}</td>
                `;
                tbody.appendChild(tr);
              });
              metaTable.appendChild(tbody);
              
              const metaWrap = document.createElement("div");
              metaWrap.appendChild(metaTable);
              const metaGapP = document.createElement("p");
              metaGapP.style.cssText = "margin: 0; line-height: 12pt; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;";
              metaGapP.innerHTML = "&nbsp;";
              metaWrap.appendChild(metaGapP);

              metaEl.parentNode.replaceChild(metaWrap, metaEl);
            }
          });

          // Replace .sign-box with Word-native borderless table with 4-line single space height between role and name
          clone.querySelectorAll(".sign-box").forEach((signBox) => {
            const duSignTable = document.createElement("table");
            duSignTable.className = "sign-table-doc";
            duSignTable.setAttribute("border", "0");
            duSignTable.setAttribute("cellspacing", "0");
            duSignTable.setAttribute("cellpadding", "0");
            duSignTable.style.cssText = "width: 100%; border: none !important; margin-top: 14pt; border-collapse: collapse; page-break-inside: avoid; mso-table-lspace: 0pt; mso-table-rspace: 0pt;";

            const kepsekName = du.kepsek || "....................................";
            const kepsekIdStr = du.kepsekIdType && du.kepsekIdType !== "Tanpa ID" && du.kepsekId ? `${du.kepsekIdType}. ${du.kepsekId}` : "";
            const guruName = du.guru || "....................................";
            const guruIdStr = du.guruIdType && du.guruIdType !== "Tanpa ID" && du.guruId ? `${du.guruIdType}. ${du.guruId}` : "";
            const tempatTgl = `${du.tempat || ".................."}, ${fmtD(du.tgl)}`;

            const ttdSpace = `
              <p style="margin: 0; line-height: 1.0; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
              <p style="margin: 0; line-height: 1.0; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
              <p style="margin: 0; line-height: 1.0; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
              <p style="margin: 0; line-height: 1.0; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;">&nbsp;</p>
            `;
            const ttdKepsekHTML = du.imgTtdKepsek ? `<p style="margin: 2pt 0; text-align: center;"><img src="${du.imgTtdKepsek}" style="max-height: 48pt; max-width: 130pt; object-fit: contain;"></p>` : ttdSpace;
            const ttdGuruHTML = du.imgTtdGuru ? `<p style="margin: 2pt 0; text-align: center;"><img src="${du.imgTtdGuru}" style="max-height: 48pt; max-width: 130pt; object-fit: contain;"></p>` : ttdSpace;

            duSignTable.innerHTML = `
              <tbody>
                <tr>
                  <td style="width: 45%; text-align: center; vertical-align: top; border: none !important; padding: 0 !important; font-family: 'Times New Roman', serif; font-size: 12pt;">
                    <p style="margin: 0 0 2pt 0; line-height: 1.0;">&nbsp;</p>
                    <p style="margin: 0 0 2pt 0; line-height: 1.0;">Mengetahui,</p>
                    <p style="margin: 0 0 2pt 0; line-height: 1.0;">Kepala Sekolah</p>
                    ${ttdKepsekHTML}
                    <p style="margin: 2pt 0 1pt 0; line-height: 1.0; text-decoration: underline; font-weight: bold;">${escH(kepsekName)}</p>
                    <p style="margin: 0; line-height: 1.0; font-size: 11pt;">${escH(kepsekIdStr)}</p>
                  </td>
                  <td style="width: 10%; border: none !important; padding: 0 !important;">&nbsp;</td>
                  <td style="width: 45%; text-align: center; vertical-align: top; border: none !important; padding: 0 !important; font-family: 'Times New Roman', serif; font-size: 12pt;">
                    <p style="margin: 0 0 2pt 0; line-height: 1.0;">${escH(tempatTgl)}</p>
                    <p style="margin: 0 0 2pt 0; line-height: 1.0;">&nbsp;</p>
                    <p style="margin: 0 0 2pt 0; line-height: 1.0;">Guru Pengampu,</p>
                    ${ttdGuruHTML}
                    <p style="margin: 2pt 0 1pt 0; line-height: 1.0; text-decoration: underline; font-weight: bold;">${escH(guruName)}</p>
                    <p style="margin: 0; line-height: 1.0; font-size: 11pt;">${escH(guruIdStr)}</p>
                  </td>
                </tr>
              </tbody>
            `;

            const signWrap = document.createElement("div");
            const signGapP = document.createElement("p");
            signGapP.style.cssText = "margin: 0; line-height: 12pt; font-size: 12pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 0pt;";
            signGapP.innerHTML = "&nbsp;";
            signWrap.appendChild(signGapP);
            signWrap.appendChild(duSignTable);

            signBox.parentNode.replaceChild(signWrap, signBox);
          });

          // Prosem Specific Adjustments: widen week columns, narrow ATP column, apply colors
          if (type === "prosem-1" || type === "prosem-2") {
            clone.querySelectorAll("table.ps").forEach((tbl) => {
              tbl.querySelectorAll("th.wk, td.wk-cell").forEach((c) => {
                c.style.width = "18pt";
                c.style.minWidth = "16pt";
                c.style.textAlign = "center";
              });
              tbl.querySelectorAll("th.alur, td.alur").forEach((c) => {
                c.style.width = "180pt";
                c.style.maxWidth = "195pt";
              });
              tbl.querySelectorAll("th.mth").forEach((c) => {
                c.setAttribute("bgcolor", "#BDD7EE");
                c.style.backgroundColor = "#BDD7EE";
                c.style.cssText += "; background-color: #BDD7EE !important; background: #BDD7EE !important; mso-pattern: auto none; mso-shading: #BDD7EE; font-weight: bold; text-align: center;";
              });
              tbl.querySelectorAll("th.wk").forEach((c) => {
                c.setAttribute("bgcolor", "#D9E1F2");
                c.style.backgroundColor = "#D9E1F2";
                c.style.cssText += "; background-color: #D9E1F2 !important; background: #D9E1F2 !important; mso-pattern: auto none; mso-shading: #D9E1F2; font-weight: bold; text-align: center;";
              });
              tbl.querySelectorAll("td.filled").forEach((c) => {
                const bg = c.classList.contains("partial-fill") ? "#E2EFDA" : "#C6E0B4";
                c.setAttribute("bgcolor", bg);
                c.style.backgroundColor = bg;
                c.style.cssText += `; background-color: ${bg} !important; background: ${bg} !important; mso-pattern: auto none; mso-shading: ${bg}; font-weight: normal; text-align: center;`;
              });
              tbl.querySelectorAll("td.libur-col, td.libur-wk").forEach((c) => {
                c.setAttribute("bgcolor", "#FF9999");
                c.style.backgroundColor = "#FF9999";
                c.style.cssText += "; background-color: #FF9999 !important; background: #FF9999 !important; mso-pattern: auto none; mso-shading: #FF9999; text-align: center;";
              });
            });
          }

          // Jurnal Specific Adjustments: Ensure header has proper light background and explicitly black text
          if (type === "jurnal-1" || type === "jurnal-2") {
            clone.querySelectorAll("table").forEach((tbl) => {
              tbl.querySelectorAll("th").forEach((th) => {
                th.setAttribute("bgcolor", "#BDD7EE");
                th.style.backgroundColor = "#BDD7EE";
                th.style.color = "#000000";
                th.style.cssText += "; background-color: #BDD7EE !important; background: #BDD7EE !important; mso-pattern: auto none; mso-shading: #BDD7EE; color: #000000 !important; font-weight: bold; text-align: center;";
                th.querySelectorAll("*").forEach((c) => {
                  c.style.color = "#000000";
                });
              });
            });
          }

          // Ensure all data tables have explicit Word-friendly border, zero paragraph spacing, single line-height, and minimal list indentation
          clone.querySelectorAll("table").forEach((tbl) => {
            if (tbl.classList.contains("sign-table-doc") || tbl.classList.contains("doc-meta-doc-tbl")) {
              return;
            }

            // Tables for layout calculation (like Section C in RPE) should NOT have borders
            if (tbl.classList.contains("layout-tbl")) {
              tbl.removeAttribute("border");
              tbl.setAttribute("border", "0");
              tbl.setAttribute("cellspacing", "0");
              tbl.setAttribute("cellpadding", "1");
              tbl.style.border = "none";
              tbl.style.borderCollapse = "collapse";
              tbl.style.width = "auto";
              tbl.style.marginTop = "2pt";
              tbl.style.marginBottom = "8pt";
              tbl.style.fontFamily = "'Times New Roman', serif";

              tbl.querySelectorAll("th, td").forEach((cell) => {
                cell.style.border = "none";
                cell.style.fontFamily = "'Times New Roman', serif";
                cell.style.lineHeight = "1.0";
                cell.style.verticalAlign = "top";
                cell.style.margin = "0";
                cell.setAttribute(
                  "style",
                  (cell.getAttribute("style") || "") +
                    "; border: none !important; mso-border-alt: none !important; font-family: 'Times New Roman', serif; line-height: 1.0 !important; mso-line-height-rule: exactly !important; margin: 0 !important; mso-margin-top-alt: 0pt !important; mso-margin-bottom-alt: 0pt !important;"
                );
              });
              return;
            }

            tbl.setAttribute("border", "1");
            tbl.setAttribute("cellspacing", "0");
            tbl.setAttribute("cellpadding", "0");
            tbl.style.borderCollapse = "collapse";
            tbl.style.width = "100%";
            tbl.style.marginTop = "2pt";
            tbl.style.marginBottom = "6pt";
            tbl.style.fontFamily = "'Times New Roman', serif";

            // Format cells
            tbl.querySelectorAll("th, td").forEach((cell) => {
              const isTh = cell.tagName.toLowerCase() === "th";
              const isJurnal = type === "jurnal-1" || type === "jurnal-2";
              const styleAttr = cell.getAttribute("style") || "";
              const hasDarkBg = !isJurnal && (
                /background(-color)?\s*:\s*(#1E3A5F|rgb\(30,\s*58,\s*95\))/i.test(styleAttr) ||
                cell.style.backgroundColor === "#1E3A5F" ||
                cell.getAttribute("bgcolor") === "#1E3A5F"
              );
              const isDarkHeader = isTh && hasDarkBg;
              const cellColor = (isJurnal && isTh) ? "#000000" : (isDarkHeader ? "#ffffff" : "#000000");

              cell.style.fontFamily = "'Times New Roman', serif";
              cell.style.fontSize = isDense ? "9.5pt" : "11pt";
              cell.style.lineHeight = "1.0";
              cell.style.padding = isDense ? "0.5pt 2pt" : "0.75pt 3pt";
              cell.style.margin = "0";
              cell.style.color = cellColor;
              cell.style.verticalAlign = isTh ? "middle" : "top";

              // Clean any existing conflicting color in style attribute before appending explicit color
              let cleanStyle = cell.getAttribute("style") || "";
              if (isJurnal && isTh) {
                cleanStyle = cleanStyle.replace(/color\s*:\s*[^;]+;?/gi, "");
              }

              cell.setAttribute(
                "style",
                cleanStyle +
                  `; padding: ${isDense ? "0.5pt 2pt" : "0.75pt 3pt"} !important; mso-padding-alt: ${isDense ? "0.5pt 1.5pt 0.5pt 1.5pt" : "0.75pt 2.5pt 0.75pt 2.5pt"} !important; font-size: ${isDense ? "9.5pt" : "11pt"} !important; font-family: 'Times New Roman', serif !important; line-height: 1.0 !important; mso-line-height-rule: exactly !important; margin: 0 !important; mso-margin-top-alt: 0pt !important; mso-margin-bottom-alt: 0pt !important; color: ${cellColor} !important;`
              );

              // Clear any accidental white text on child elements inside cells
              cell.querySelectorAll("p, span, div, b, strong, i, em, li, ul, ol").forEach((child) => {
                if (isJurnal && isTh) {
                  child.style.color = "#000000";
                } else if (child.style && child.style.color) {
                  if (child.style.color === "rgb(255, 255, 255)" || child.style.color === "#ffffff" || child.style.color === "#fff") {
                    child.style.color = cellColor;
                  }
                }
              });

              // Format any paragraph or block element inside cell (excluding list items)
              cell.querySelectorAll("p:not(.tbl-list-p), div:not(.tbl-list-p)").forEach((el) => {
                el.style.margin = "0";
                el.style.padding = "0";
                el.style.lineHeight = "1.0";
                el.style.color = cellColor;
              });

              // Convert lists inside cells to official Word-native list paragraphs (MsoListParagraph) with @list binding
              // This controls Microsoft Word's ruler precisely: 0.7cm hanging left indent with -0.6cm text indent for 2-digit numbers
              cell.querySelectorAll("ol").forEach((ol) => {
                const frag = document.createDocumentFragment();
                const startVal = parseInt(ol.getAttribute("start"), 10) || 1;
                const listItems = Array.from(ol.querySelectorAll("li"));
                listItems.forEach((li, idx) => {
                  const p = document.createElement("p");
                  p.className = "MsoListParagraph";
                  p.setAttribute(
                    "style",
                    `margin: 0 0 2pt 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 2pt; margin-left: 0.7cm; mso-para-margin-left: 0.7cm; mso-margin-left-alt: 0.7cm; text-indent: -0.6cm; mso-text-indent-alt: -0.6cm; tab-stops: 0.7cm; mso-tab-stops: 0.7cm; line-height: 1.15; mso-line-height-rule: exactly; font-family: 'Times New Roman', serif; text-align: left; font-size: ${isDense ? "9.5pt" : "11pt"}; color: #000000; mso-list: l0 level1 lfo1;`
                  );
                  p.innerHTML = `<!--[if !supportLists]--><span style="font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';color:#000000;"><span style="mso-list:Ignore">${startVal + idx}.<span style="font:7.0pt 'Times New Roman'">&nbsp;&nbsp;&nbsp;</span></span></span><!--[endif]-->` + li.innerHTML.trim();
                  frag.appendChild(p);
                });
                if (ol.parentNode) {
                  ol.parentNode.replaceChild(frag, ol);
                }
              });

              cell.querySelectorAll("ul").forEach((ul) => {
                const frag = document.createDocumentFragment();
                const listItems = Array.from(ul.querySelectorAll("li"));
                listItems.forEach((li) => {
                  const p = document.createElement("p");
                  p.className = "MsoListParagraph";
                  p.setAttribute(
                    "style",
                    `margin: 0 0 2pt 0; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 2pt; margin-left: 0.7cm; mso-para-margin-left: 0.7cm; mso-margin-left-alt: 0.7cm; text-indent: -0.6cm; mso-text-indent-alt: -0.6cm; tab-stops: 0.7cm; mso-tab-stops: 0.7cm; line-height: 1.15; mso-line-height-rule: exactly; font-family: 'Times New Roman', serif; text-align: left; font-size: ${isDense ? "9.5pt" : "11pt"}; color: #000000; mso-list: l1 level1 lfo2;`
                  );
                  p.innerHTML = `<!--[if !supportLists]--><span style="font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:Symbol;color:#000000;"><span style="mso-list:Ignore">&#183;<span style="font:7.0pt 'Times New Roman'">&nbsp;&nbsp;&nbsp;</span></span></span><!--[endif]-->` + li.innerHTML.trim();
                  frag.appendChild(p);
                });
                if (ul.parentNode) {
                  ul.parentNode.replaceChild(frag, ul);
                }
              });
            });
          });

          // Convert input/textarea controls to static text nodes
          clone.querySelectorAll("input, textarea").forEach((inp) => {
            const txt = document.createTextNode(inp.value || inp.placeholder || "");
            inp.parentNode.replaceChild(txt, inp);
          });

          contentHtml = clone.innerHTML;
        }

        // Construct Word-compatible XML/HTML wrapper
        const pageSize = isLandscape
          ? "size: 29.7cm 21.0cm; mso-page-orientation: landscape;"
          : "size: 21.0cm 29.7cm; mso-page-orientation: portrait;";

        const wordDoc = `<html xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<meta name="Originator" content="Microsoft Word 15">
<title>${titlePrefix}</title>
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
  /* Microsoft Word Official List Definitions */
  @list l0 {
    mso-list-id: 10001;
    mso-list-type: hybrid;
    mso-list-template-ids: 10001 67698703 67698713 67698715 67698703 67698713 67698715 67698703 67698713 67698715;
  }
  @list l0:level1 {
    mso-level-tab-stop: 0.7cm;
    mso-level-number-position: left;
    margin-left: 0.7cm;
    text-indent: -0.6cm;
    mso-ansi-font-size: ${isDense ? "9.5pt" : "11pt"};
    font-family: "Times New Roman", serif;
  }
  @list l1 {
    mso-list-id: 10002;
    mso-list-type: hybrid;
    mso-list-template-ids: 10002 67698689 67698691 67698693 67698689 67698691 67698693 67698689 67698691 67698693;
  }
  @list l1:level1 {
    mso-level-number-format: bullet;
    mso-level-text: \\F0B7;
    mso-level-tab-stop: 0.7cm;
    mso-level-number-position: left;
    margin-left: 0.7cm;
    text-indent: -0.6cm;
    font-family: Symbol;
  }
  p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph {
    margin: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 2pt !important;
    mso-margin-top-alt: 0pt !important;
    mso-margin-bottom-alt: 2pt !important;
    margin-left: 0.7cm !important;
    mso-para-margin-left: 0.7cm !important;
    mso-margin-left-alt: 0.7cm !important;
    text-indent: -0.6cm !important;
    mso-text-indent-alt: -0.6cm !important;
    tab-stops: 0.7cm !important;
    mso-tab-stops: 0.7cm !important;
    line-height: 1.15 !important;
    mso-line-height-rule: exactly !important;
    font-family: 'Times New Roman', Times, serif;
    font-size: ${isDense ? "9.5pt" : "11pt"};
    text-align: left !important;
  }
  @page Section1 {
    ${pageSize}
    margin: 1.25cm 1.25cm 1.25cm 1.25cm;
    mso-header-margin: 28.3pt;
    mso-footer-margin: 28.3pt;
    mso-paper-source: 0;
  }
  div.Section1 { page: Section1; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #000000;
    line-height: 1.15;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }
  p, div, span {
    font-family: 'Times New Roman', Times, serif;
    color: #000000;
  }
  .doc-title {
    font-family: 'Times New Roman', Times, serif;
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    margin-top: 0;
    margin-bottom: 12pt;
    text-transform: uppercase;
  }
  /* Identity Metadata Table */
  .doc-meta-doc-tbl {
    width: auto !important;
    margin-top: 0 !important;
    margin-bottom: 12pt !important;
    border: none !important;
    mso-border-alt: none !important;
    border-collapse: collapse !important;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  .doc-meta-doc-tbl td, .doc-meta-doc-tbl th {
    border: none !important;
    mso-border-alt: none !important;
    padding: 1pt 0 !important;
    font-family: 'Times New Roman', Times, serif !important;
    font-size: 12pt !important;
    font-weight: normal !important;
    color: #000000 !important;
    vertical-align: top !important;
    line-height: 1.15 !important;
    margin: 0 !important;
    mso-margin-top-alt: 0pt !important;
    mso-margin-bottom-alt: 0pt !important;
  }
  .doc-meta-list {
    margin-bottom: 12pt;
    font-size: 12pt;
    font-family: 'Times New Roman', Times, serif;
    font-weight: normal;
  }
  .doc-meta-list table, .doc-meta-list td, .doc-meta-list th {
    border: none !important;
    mso-border-alt: none !important;
    padding: 1pt 0 !important;
    font-size: 12pt !important;
    font-family: 'Times New Roman', Times, serif !important;
    font-weight: normal !important;
  }
  .dml-row {
    margin-bottom: 1pt;
    font-size: 12pt;
    font-weight: normal !important;
  }
  .dml-lbl {
    display: inline-block;
    width: 140pt;
    font-weight: normal !important;
  }
  .dml-sep {
    margin-right: 6px;
    font-weight: normal !important;
  }
  .dml-val {
    font-weight: normal !important;
  }
  /* Main Data Tables */
  table:not(.layout-tbl):not(.doc-meta-doc-tbl):not(.sign-table-doc) {
    border-collapse: collapse !important;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    width: 100%;
    margin-top: 2pt;
    margin-bottom: 6pt;
    font-family: 'Times New Roman', Times, serif;
  }
  table:not(.layout-tbl):not(.doc-meta-doc-tbl):not(.sign-table-doc) th, 
  table:not(.layout-tbl):not(.doc-meta-doc-tbl):not(.sign-table-doc) td {
    border: 0.75pt solid #000000 !important;
    mso-border-alt: solid 0.75pt #000000;
    padding: ${isDense ? "0.5pt 2pt" : "0.75pt 3pt"} !important;
    mso-padding-alt: ${isDense ? "0.5pt 1.5pt 0.5pt 1.5pt" : "0.75pt 2.5pt 0.75pt 2.5pt"} !important;
    font-size: ${isDense ? "9.5pt" : "11pt"};
    color: #000000;
    vertical-align: middle;
    font-family: 'Times New Roman', Times, serif;
    line-height: 1.0 !important;
    mso-line-height-rule: exactly !important;
    margin: 0 !important;
    mso-margin-top-alt: 0pt !important;
    mso-margin-bottom-alt: 0pt !important;
  }
  table.layout-tbl {
    border: none !important;
    mso-border-alt: none !important;
    border-collapse: collapse !important;
    width: auto !important;
    margin-top: 2pt !important;
    margin-bottom: 8pt !important;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  table.layout-tbl td, table.layout-tbl th {
    border: none !important;
    mso-border-alt: none !important;
    padding: 0.5pt 4pt 0.5pt 0 !important;
    mso-padding-alt: 0.5pt 4pt 0.5pt 0 !important;
    font-size: 11pt !important;
    color: #000000 !important;
    vertical-align: top !important;
    font-family: 'Times New Roman', Times, serif !important;
    line-height: 1.0 !important;
    mso-line-height-rule: exactly !important;
    margin: 0 !important;
    mso-margin-top-alt: 0pt !important;
    mso-margin-bottom-alt: 0pt !important;
  }
  th {
    background-color: #f2f2f2 !important;
    color: #000000 !important;
    font-weight: bold;
    text-align: center;
    font-size: ${isDense ? "9.5pt" : "11pt"};
  }
  /* Table Body Paragraphs & Elements: Zero Space Before/After & Single Space */
  table p:not(.tbl-list-p), table div:not(.tbl-list-p), table span:not(.tbl-list-p) {
    margin: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    mso-margin-top-alt: 0pt !important;
    mso-margin-bottom-alt: 0pt !important;
    padding: 0 !important;
    line-height: 1.0 !important;
    mso-line-height-rule: exactly !important;
    font-family: 'Times New Roman', Times, serif;
  }
  /* Table Lists (Ordered / Unordered): Native Word Bullets & Numbering with precise indentation */
  table ul, table ol {
    margin: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    margin-left: 0cm !important;
    padding: 0 !important;
    padding-left: 0cm !important;
    mso-margin-top-alt: 0pt !important;
    mso-margin-bottom-alt: 0pt !important;
    mso-margin-left-alt: 0cm !important;
    mso-padding-alt: 0pt !important;
    list-style-position: outside !important;
  }
  table ul {
    list-style-type: disc !important;
  }
  table ol {
    list-style-type: decimal !important;
  }
  table ul li, table ol li {
    margin: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 2pt !important;
    margin-left: 0.5cm !important;
    text-indent: -0.4cm !important;
    padding: 0 !important;
    padding-left: 0.1cm !important;
    mso-margin-top-alt: 0pt !important;
    mso-margin-bottom-alt: 2pt !important;
    mso-para-margin-left: 0.5cm !important;
    mso-margin-left-alt: 0.5cm !important;
    mso-text-indent-alt: -0.4cm !important;
    tab-stops: 0.5cm !important;
    mso-tab-stops: 0.5cm !important;
    line-height: 1.15 !important;
    mso-line-height-rule: exactly !important;
    font-family: 'Times New Roman', Times, serif;
    text-align: left !important;
    display: list-item !important;
  }
  /* Signatures Table */
  .sign-table-doc {
    width: 100% !important;
    border: none !important;
    mso-border-alt: none !important;
    margin-top: 14pt !important;
    page-break-inside: avoid !important;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  .sign-table-doc td, .sign-table-doc th {
    border: none !important;
    mso-border-alt: none !important;
    padding: 0 !important;
    font-size: 12pt !important;
    font-family: 'Times New Roman', Times, serif;
    line-height: 1.15 !important;
  }
  .sign-table-doc p {
    margin: 0 0 2pt 0 !important;
    line-height: 1.15 !important;
    mso-margin-top-alt: 0pt !important;
    mso-margin-bottom-alt: 2pt !important;
  }
  .ctr, .text-center { text-align: center; }
  .lft, .text-left { text-align: left; }
  .rgt, .text-right { text-align: right; }
  .bold, .font-bold { font-weight: bold; }
  .bg-gray { background-color: #f3f4f6; }
</style>
</head>
<body>
<div class="Section1">
  ${contentHtml}
</div>
</body>
</html>`;

        const blob = new Blob(["\ufeff" + wordDoc], {
          type: "application/msword;charset=utf-8"
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);

        if (typeof showSaveIndicator === "function") {
          showSaveIndicator(`Dokumen Word (.doc) berhasil diunduh! 📄`, "success");
        }
      }

      function printTab(id) {
        if (id === "absensi-1" || id === "absensi-2") {
          const sem = id === "absensi-1" ? 1 : 2;
          openPrintAbsensiModal(sem);
          return;
        }

        if (checkIframePrint()) return;

        document
          .querySelectorAll(".tab-pane")
          .forEach((p) => p.classList.remove("printing"));
        let paneId = id;
        if (id.endsWith("-1") || id.endsWith("-2")) {
          paneId = id.substring(0, id.length - 2);
        }
        const pane = document.getElementById("tab-" + paneId);
        if (pane) pane.classList.add("printing");

        const isKalender = id === "kalender";
        if (isKalender && window.kalMode !== "semua") {
          window.kalMode = "semua";
          renderKalenderPendidikan();
        }

        const isProta = id === "prota";
        const isProsem = id === "prosem" || id === "prosem-1" || id === "prosem-2";
        const isRPE = id === "rpe-1" || id === "rpe-2";
        const isATP = id === "atp";
        const isKKTP = id === "kktp";

        let styleEl = document.getElementById("print-page-style");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "print-page-style";
          document.head.appendChild(styleEl);
        }

        // -- KALENDER: portrait, 3 col grid ---------------------------
        if (isKalender) {
          const du = getDU();

          const entriesGanjil = mergeLiburByTip(kalender.ganjil);
          const entriesGenap = mergeLiburByTip(kalender.genap);
          const hasEntries = entriesGanjil.length > 0 || entriesGenap.length > 0;

          const makeRow = (
            e,
          ) => `<tr style="page-break-inside: avoid; break-inside: avoid;">
        <td style="padding:2px 5px 2px 0;vertical-align:top;width:14px;">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${e.warna};margin-top:3px;flex-shrink:0;"></span>
        </td>
        <td style="white-space:nowrap;font-weight:700;padding:2px 4px 2px 0;vertical-align:top;">${fmtNoteDateShort(e.isoStart, e.isoEnd)}</td>
        <td style="padding:2px 4px 2px 0;vertical-align:top;color:#999;">:</td>
        <td style="padding:2px 0;vertical-align:top;line-height:1.35;">${escH(e.tip)}</td>
      </tr>`;
      
          let rowsHtml = "";
          if (entriesGanjil.length > 0) {
            rowsHtml += `<tr><td colspan="4" style="font-weight:800;font-size:7pt;color:#1B3A5C;padding:5px 0 2.5px 0;border-bottom:1px solid #E2EBF5;margin-bottom:4px;">SEMESTER GANJIL</td></tr>`;
            rowsHtml += entriesGanjil.map(makeRow).join("");
          }
          if (entriesGenap.length > 0) {
            rowsHtml += `<tr><td colspan="4" style="font-weight:800;font-size:7pt;color:#1B3A5C;padding:6px 0 2.5px 0;border-bottom:1px solid #E2EBF5;margin-bottom:4px;">SEMESTER GENAP</td></tr>`;
            rowsHtml += entriesGenap.map(makeRow).join("");
          }

          let ttdKepsekImg = "";
          let capSekolahImg = "";

          if (du.imgTtdKepsek)
            ttdKepsekImg = `<img class="img-sign-print" src="${du.imgTtdKepsek}" style="position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(100% - 30px); max-height: 200px; max-width: 320px; object-fit: contain; z-index: 1;">`;
          if (du.imgCapSekolah)
            capSekolahImg = `<img class="img-sign-print" src="${du.imgCapSekolah}" style="position: absolute; right: 80%; transform: translateX(50%); bottom: calc(100% - 40px); opacity: 0.8; max-height: 240px; max-width: 240px; object-fit: contain; z-index: 0; mix-blend-mode: multiply;">`;

          const notesFooterHtml = `
      <div id="kal-print-footer" style="margin-top:6px; display: grid; grid-template-columns: ${hasEntries ? "2fr 1fr" : "1fr"}; gap: 12px; align-items: stretch;">
        ${
          hasEntries
            ? `
        <div style="border: 1.5px solid #C5D8EC; border-radius: 6px; padding: 6px 12px;">
          <div style="font-weight:700;font-size:7pt;color:#1B3A5C;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;">Keterangan</div>
          <div style="column-count: 2; column-gap: 12px; column-rule: 1px dashed #E2EBF5; font-size: 6.5pt;">
            <table style="width:100%;border-collapse:collapse;">
              ${rowsHtml}
            </table>
          </div>
        </div>`
            : `<div style="flex: 1;"></div>`
        }
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: ${hasEntries ? "center" : "flex-end"}; text-align: center; font-size: 8.5pt;">
          <div style="text-align: center; color: var(--text);">
            <div style="margin-bottom: 2px; font-weight: normal; white-space: nowrap;">${escH(du.tempat)}, ${fmtD(du.tgl)}</div>
            <div style="font-weight: normal; margin-bottom: 65px; white-space: nowrap;">Kepala Sekolah</div>
            <div style="position: relative; font-weight:normal;white-space:nowrap;">
              ${capSekolahImg}
              ${ttdKepsekImg}
              <div style="position: relative; z-index: 2;">${du.kepsekSign}</div>
            </div>
          </div>
        </div>
      </div>`;

          let printFooter = document.getElementById("kal-print-footer-wrap");
          if (printFooter) printFooter.remove();
          if (notesFooterHtml) {
            printFooter = document.createElement("div");
            printFooter.id = "kal-print-footer-wrap";
            printFooter.innerHTML = notesFooterHtml;
            document
              .getElementById("kalender-content")
              .appendChild(printFooter);
          }

          styleEl.textContent = `
      @media print {
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        *, *:before, *:after {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        @page { size: A4 landscape; margin: 7mm 10mm; }
        html, body {
          background: #fff !important;
          position: static !important;
          height: auto !important;
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
          top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
          clip-path: none !important;
          contain: none !important;
          touch-action: auto !important;
        }
        *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; font-family: 'Inter', sans-serif !important; }
        .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .tab-header, .kal-workday-bar,
        .out-actions, .btn-print, .tbl-actions, .no-print { display:none!important; }
        .content { height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; }
        .tab-pane { display:none!important; padding:0; }
        .tab-pane.printing { display:block!important; padding:0; background:#fff!important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; }
        .printing .kal-outer { padding:0; }
        .printing .kal-legend { display:none!important; }
        .printing .kal-notes-legend { display:none!important; }
        .printing #kal-title-header { display: block !important; margin-bottom: 12px !important; padding-bottom: 6px !important; border-bottom: 1pt solid #254b77 !important; }
        .printing #kal-title-header div { font-size: 11pt !important; line-height: 1.3 !important; color: #0f172a !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; }
        #kal-print-footer-wrap { display:none; }
        .printing #kal-print-footer-wrap { display:block!important; }
        .printing .kal-tbl thead { display:table-row-group!important; }
        .printing .kal-grid { grid-template-columns:repeat(6,1fr)!important; gap:4px 6px!important; margin-bottom:0!important; }
        .printing .kal-month { border-radius:4px!important; box-shadow:none!important; overflow:hidden!important; border: 1px solid #254b77 !important; background: #ffffff !important; }
        .printing .kal-month-hdr { background: #254b77 !important; color: #ffffff !important; padding:2px 4px!important; border-radius:0!important; justify-content:center!important; border:none!important; }
        .printing .kal-month-title,
        .printing .kal-month-hdr-name { font-size:7.5pt!important; padding:0!important; letter-spacing:0!important; color: #ffffff !important; font-weight:800!important; }
        .printing .kal-tbl { border-collapse: collapse !important; border: none !important; }
        .printing .kal-tbl th { background: #8faadc !important; color: #ffffff !important; padding:1px 0!important; font-size:6.5pt!important; border:0.5px solid #7c9bc9!important; border-top:none!important; }
        .printing .kal-tbl td,
        .printing .doc-frame table.kal-tbl td { padding:0!important; height:17px!important; max-height:17px!important; vertical-align:middle!important; border:0.5px solid #c9daf0!important; background:#ffffff!important; color:#0f172a!important; }
        .printing .kal-tbl td.kal-empty-cell,
        .printing .kal-tbl td.empty,
        .printing .doc-frame table.kal-tbl td.kal-empty-cell,
        .printing .doc-frame table.kal-tbl td.empty { background: #c9daf0 !important; border:0.5px solid #c9daf0!important; }
        .printing .kal-tbl th:first-child,
        .printing .kal-tbl td:first-child,
        .printing .doc-frame table.kal-tbl td:first-child { border-left: none !important; }
        .printing .kal-tbl th:last-child,
        .printing .kal-tbl td:last-child,
        .printing .doc-frame table.kal-tbl td:last-child { border-right: none !important; }
        .printing .kal-tbl td span,
        .printing .kal-cell-num {
          height:17px!important; min-height:17px!important; max-height:17px!important;
          line-height:17px!important; font-size:7.5pt!important; font-weight:700!important;
          display:block!important; text-align:center!important;
          color: #0f172a !important;
        }
        .printing .kal-tbl td span.kal-cell-wknd-off,
        .printing .kal-tbl td span.kal-cell-sun,
        .printing .kal-tbl td span.kal-cell-sat,
        .printing .kal-cell-wknd-off,
        .printing .kal-cell-sun,
        .printing .kal-cell-sat {
          color: #dc2626 !important;
        }
        .printing .kal-td-hl,
        .printing table.kal-tbl td.kal-td-hl,
        .printing .doc-frame table.kal-tbl td.kal-td-hl {
          background: var(--kal-out-screen, #dc2626) !important;
          --out-col: var(--kal-out-print, #b91c1c) !important; --pw: 1.5px !important;
        }
        .printing .kal-td-hl.kal-penting,
        .printing table.kal-tbl td.kal-td-hl.kal-penting,
        .printing .doc-frame table.kal-tbl td.kal-td-hl.kal-penting {
          box-shadow: inset 0 0 0 1.5px var(--out-col, #0f172a) !important;
        }
        .printing .kal-txt-hl,
        .printing .kal-td-hl span,
        .printing table.kal-tbl td.kal-td-hl span,
        .printing .doc-frame table.kal-tbl td.kal-td-hl span.kal-txt-hl {
          color: #ffffff !important;
          font-weight: 800 !important;
          --kal-hl-wknd: #ffffff !important;
        }
        .printing .holiday-wknd {
          color: #ffffff !important;
          font-weight: 800 !important;
        }
        .printing .kal-hari-efektif { display:flex!important; justify-content:space-between!important; align-items:center!important; border-radius:0!important; padding:2px 4px!important; font-size:5.5pt!important; font-weight:700!important; background:#eef4fc!important; color:#1e3a8a!important; border-top:none!important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .printing .kal-sem-container {
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin-bottom: 6px !important;
          background: transparent !important;
          box-sizing: border-box !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .printing .kal-sem-container:last-child {
          margin-bottom: 0 !important;
        }
        .printing .kal-sem-pill {
          display: none !important;
        }
        .printing #kal-print-footer { margin-top:6px!important; padding-top:2px!important; }
        .printing #kal-print-footer table { font-size:6.5pt!important; }
        .printing #kal-print-footer td { padding:2px 1px!important; line-height: 1.3!important; vertical-align: top!important; }
        #kal-print-footer-wrap { page-break-inside:avoid!important; break-inside:avoid!important; }
      }
      #kal-print-footer-wrap { display: none !important; }
      `;

          const customTitle = getPDFFileName("kaldik");
          executeSystemPrint(customTitle);
          return;
        }

        // -- PROTA: landscape ---------------------------------------
        if (isProta) {
          styleEl.textContent = `
      @media print {
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        *, *:before, *:after {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        @page { size: A4 landscape; margin: 10mm 12mm 12mm 12mm; }
        html, body {
          display: block !important;
          flex: none !important;
          float: none !important;
          background: #fff !important;
          position: static !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
          top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
          clip-path: none !important;
          contain: none !important;
          touch-action: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; font-family: 'Times New Roman', Times, serif !important; }
        .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .sem-toggle,
        .out-actions,.btn-print,.tbl-actions,.nav-btn,
        .stats-row,.tab-header, .no-print { display:none!important; }
        .content { display: block !important; flex: none !important; float: none !important; height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; margin: 0 !important; padding: 0 !important; }
        .tab-pane { display:none!important; padding:0; }
        .tab-pane.printing { display:block!important; flex: none !important; float: none !important; padding:0; background:#fff!important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; margin: 0 !important; }
        .printing .doc-frame { border:none!important; box-shadow:none!important; padding:0!important; width:100%!important; max-width:100%!important; background:#fff!important; overflow:visible!important; }
        .printing .doc-title { margin-bottom:12px!important; font-size:14pt!important; text-align:center!important; font-weight:bold!important; text-transform:uppercase!important; }
        .printing .doc-info { margin-bottom:14px!important; }
        .printing .doc-meta-list { gap:2px!important; font-size:12pt!important; }
        .printing .dml-row { padding:1px 0!important; font-size:12pt!important; font-weight:normal!important; }
        .printing .dml-lbl { font-size:12pt!important; font-weight:normal!important; min-width:180px!important; }
        .printing .dml-sep { font-size:12pt!important; font-weight:normal!important; }
        .printing .dml-val { font-size:12pt!important; font-weight:normal!important; }
        .printing .prota-wrap { width:100%!important; margin-bottom:14px!important; overflow:visible!important; }
        .printing table.pt {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          font-size: 12pt !important;
        }
        .printing .pt th,
        .printing .pt td {
          box-sizing: border-box !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
          border: 0.5pt solid #1e3a5f !important;
        }
        .printing .pt th {
          background: #bdd7ee !important;
          color: #000 !important;
          font-size: 12pt !important;
          font-weight: 700 !important;
          text-align: center !important;
          padding: 8px 4px !important;
          vertical-align: middle !important;
          white-space: normal !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
          line-height: 1.25 !important;
        }
        .printing .pt td {
          font-size: 12pt !important;
          padding: 6px 8px !important;
          color: #000 !important;
          line-height: 1.4 !important;
          vertical-align: top !important;
        }
        .printing .pt col.c-no,
        .printing .pt th:nth-child(1),
        .printing .pt tbody tr:not(.sem-hdr):not(.sem-total-row) td:nth-child(1) { width: 44px !important; max-width: 44px !important; text-align: center !important; padding: 6px 2px !important; }
        
        .printing .pt col.c-bab,
        .printing .pt th:nth-child(2),
        .printing .pt tbody tr:not(.sem-hdr):not(.sem-total-row) td:nth-child(2) { width: 56px !important; max-width: 56px !important; text-align: center !important; padding: 6px 2px !important; }
        
        .printing .pt col.c-kode,
        .printing .pt th:nth-child(3),
        .printing .pt tbody tr:not(.sem-hdr):not(.sem-total-row) td:nth-child(3) { width: 90px !important; max-width: 90px !important; text-align: center !important; padding: 6px 3px !important; }
        
        .printing .pt col.c-tp { width: auto !important; }
        .printing .pt th:nth-child(4) { width: auto !important; text-align: center !important; padding: 8px 6px !important; }
        .printing .pt tbody tr:not(.sem-hdr):not(.sem-total-row) td:nth-child(4) { width: auto !important; text-align: left !important; padding: 6px 12px !important; }
        
        .printing .pt col.c-jp,
        .printing .pt th:nth-child(5),
        .printing .pt tbody tr:not(.sem-hdr):not(.sem-total-row) td:nth-child(5) { width: 110px !important; max-width: 110px !important; text-align: center !important; padding: 6px 4px !important; font-size: 12pt !important; }
        
        .printing .pt col.c-sem,
        .printing .pt th:nth-child(6),
        .printing .pt tbody tr:not(.sem-hdr):not(.sem-total-row) td:nth-child(6) { width: 100px !important; max-width: 100px !important; text-align: center !important; padding: 6px 4px !important; }

        .printing .pt tr.sem-hdr td {
          background: #4472c4 !important;
          color: #fff !important;
          font-weight: 700 !important;
          font-size: 12pt !important;
          text-align: center !important;
          padding: 6px 4px !important;
        }
        .printing .pt tr.sem-total-row td {
          background: #bdd7ee !important;
          color: #000 !important;
          font-weight: 700 !important;
          font-size: 12pt !important;
          padding: 6px 8px !important;
        }
        .printing .pt tbody tr.eval-row td {
          background: #fff2cc !important;
        }
        .printing .pt tfoot tr td {
          background: #bdd7ee !important;
          font-weight: 700 !important;
          font-size: 12pt !important;
          text-align: center !important;
          padding: 8px 4px !important;
        }
        .printing .sign-box {
          margin-top: 24px !important;
          font-size: 12pt !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .printing .sign-col {
          font-size: 12pt !important;
        }
        .printing .sign-col .role {
          font-size: 12pt !important;
          margin-bottom: 75px !important;
        }
        .printing .sign-col .name {
          font-size: 12pt !important;
        }
        .printing .sign-col .nip {
          font-size: 12pt !important;
        }
        .printing tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .printing thead {
          display: table-header-group !important;
        }
      }`;

          const customTitle = getPDFFileName("prota");
          executeSystemPrint(customTitle);
          return;
        }

        // -- PROSEM: landscape --------------------------------------
        if (isProsem) {
          styleEl.textContent = `
      @media print {
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        *, *:before, *:after {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        @page { size: A4 landscape; margin: 8mm 10mm; }
        html, body {
          display: block !important;
          flex: none !important;
          float: none !important;
          background: #fff !important;
          position: static !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
          top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
          clip-path: none !important;
          contain: none !important;
          touch-action: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; font-family: 'Times New Roman', Times, serif !important; }
        .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .tab-header, .sem-toggle,
        .out-actions, .btn-print, .tbl-actions, .nav-btn, .stats-row, .prosem-toolbar, .prosem-legend, .no-print { display:none!important; }
        .content { display: block !important; flex: none !important; float: none !important; height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; margin: 0 !important; padding: 0 !important; }
        .tab-pane { display:none!important; padding:0; }
        .tab-pane.printing { display:block!important; flex: none !important; float: none !important; padding:0; background:#fff!important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; margin: 0 !important; }
        .printing .doc-frame { border:none!important; box-shadow:none!important; padding:0!important; width:100%!important; max-width:100%!important; background:#fff!important; overflow:visible!important; }
        .printing .prosem-scroll, .printing .prota-wrap { overflow:visible!important; width:100%!important; max-width:none!important; border:none!important; box-shadow:none!important; }
        .printing table.ps { width:100%!important; max-width:100%!important; table-layout:auto!important; border-collapse:collapse!important; font-size:8.5pt!important; }
        .printing table.ps th, .printing table.ps td { padding:3px 2px!important; border: 0.5pt solid #1e3a5f !important; }
        .printing table.ps th { white-space: nowrap !important; }
        .printing table.ps th.alur, .printing table.ps td.alur { white-space: normal !important; }
        .printing table th, .printing table td { word-wrap: normal !important; }
        .printing table th:first-child, .printing table td:first-child { white-space: nowrap !important; }
        .printing tr { page-break-inside:avoid!important; break-inside:avoid!important; }
        .printing thead { display:table-header-group!important; }
        .printing tfoot { display:table-row-group!important; }
        .printing .sign-box { margin-top:16px!important; font-size:10pt!important; page-break-inside:avoid!important; break-inside:avoid!important; }
      }`;

          const sem =
            id === "prosem-1"
              ? 1
              : id === "prosem-2"
              ? 2
              : document
                  .getElementById("btn-prosem-sem-2")
                  ?.classList.contains("active")
              ? 2
              : 1;
          const customTitle = getPDFFileName("prosem", sem);
          executeSystemPrint(customTitle);
          return;
        }

        // -- RPE: portrait -----------------------------------------
        if (isRPE) {
          styleEl.textContent = `
      @media print {
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        *, *:before, *:after {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        @page { size: A4 portrait; margin: 8mm 12.7mm 12.7mm 12.7mm; }
        html, body {
          display: block !important;
          flex: none !important;
          float: none !important;
          background: #fff !important;
          position: static !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
          top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
          clip-path: none !important;
          contain: none !important;
          touch-action: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .sem-toggle { display:none!important; }
        .content { display: block !important; flex: none !important; float: none !important; height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; margin: 0 !important; padding: 0 !important; }
        .tab-pane.printing { display: block !important; flex: none !important; float: none !important; background: #fff !important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; margin: 0 !important; }
        .printing .doc-frame { background:#fff!important; padding:0!important; border:none!important; overflow:visible!important; }
        .printing, .printing * { font-size:10pt!important; font-family: 'Times New Roman', Times, serif !important; }
        .printing .doc-title { margin-bottom:10px!important; }
        .printing .doc-info { margin-bottom:8px!important; }
        .printing .doc-meta-list { gap:1px!important; }
        .printing .dml-row { padding:1px 0!important; }
        .printing .prota-wrap { margin-bottom:6px!important; overflow:visible!important; }
        .printing p { margin-bottom:4px!important; }
        .printing .prota-wrap + p { margin-top:14px!important; }
        .printing table:not(.kal-tbl) { border-collapse: collapse !important; }
        .printing table:not(.kal-tbl):not(.layout-tbl) th, .printing table:not(.kal-tbl):not(.layout-tbl) td { padding:3px 6px!important; border-width: 0.5pt !important; }
        .printing .layout-tbl, .printing .layout-tbl td, .printing .layout-tbl th, .printing .sign-box, .printing .sign-box td, .printing .sign-box th { border: none !important; }
        .printing .prota-wrap:first-of-type col:nth-child(2){ width:90px!important; }
        .printing .prota-wrap:first-of-type col:nth-child(3),
        .printing .prota-wrap:first-of-type col:nth-child(4),
        .printing .prota-wrap:first-of-type col:nth-child(5){ width:80px!important; }
        .printing .sign-box { margin-top:20px!important; page-break-inside:avoid!important; break-inside:avoid!important; }
        .printing .sign-col .role { margin-bottom:95px!important; }
        tr { page-break-inside:avoid!important; break-inside:avoid!important; }
        .out-actions,.btn-print,.tbl-actions,.nav-btn,.sidebar-bottom,
        .stats-row,.tab-header,.abs-filter-bar, .no-print { display:none!important; }
        *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
      }`;

          const sem =
            id === "rpe-1"
              ? 1
              : id === "rpe-2"
              ? 2
              : document
                  .getElementById("btn-rpe-sem-2")
                  ?.classList.contains("active")
              ? 2
              : 1;
          const customTitle = getPDFFileName("rpe", sem);
          executeSystemPrint(customTitle);
          return;
        }

        // -- KKTP: landscape -----------------------------------------
        if (isKKTP) {
          styleEl.textContent = `
      @media print {
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        *, *:before, *:after {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        @page { size: A4 landscape; margin: 10mm 12mm 12mm 12mm; }
        html, body {
          display: block !important;
          flex: none !important;
          float: none !important;
          background: #fff !important;
          position: static !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
          top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
          clip-path: none !important;
          contain: none !important;
          touch-action: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; font-family: 'Times New Roman', Times, serif !important; }
        .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .sem-toggle, .kktp-toolbar, .kktp-filter-bar,
        .out-actions,.btn-print,.tbl-actions,.nav-btn,.stats-row,.tab-header, .no-print { display:none!important; }
        .content { display: block !important; flex: none !important; float: none !important; height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; margin: 0 !important; padding: 0 !important; }
        .tab-pane { display:none!important; padding:0; }
        .tab-pane.printing { display:block!important; flex: none !important; float: none !important; padding:0; background:#fff!important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; margin: 0 !important; }
        .printing .doc-frame { border:none!important; box-shadow:none!important; padding:0!important; overflow:visible!important; background:#fff!important; }
        .printing .doc-title { margin-bottom:10px!important; font-size:14pt!important; }
        .printing .doc-info { margin-bottom:12px!important; }
        .printing .doc-meta-list { gap:1px!important; }
        .printing .dml-row { padding:1px 0!important; }
        .printing table:not(.kal-tbl) { border-collapse: collapse !important; }
        .printing table:not(.kal-tbl):not(.layout-tbl) th, .printing table:not(.kal-tbl):not(.layout-tbl) td { border-width: 0.5pt !important; }
        .printing .layout-tbl, .printing .layout-tbl td, .printing .layout-tbl th, .printing .sign-box, .printing .sign-box td, .printing .sign-box th { border: none !important; }
        tr { page-break-inside: avoid !important; break-inside: avoid !important; }
        thead { display: table-header-group !important; }
        .printing .sign-box { margin-top:20px!important; page-break-inside:avoid!important; break-inside:avoid!important; }
      }`;

          const sem =
            id === "kktp-1"
              ? 1
              : id === "kktp-2"
              ? 2
              : document
                  .getElementById("btn-kktp-sem-2")
                  ?.classList.contains("active")
              ? 2
              : 1;
          const customTitle = getPDFFileName("kktp", sem);
          executeSystemPrint(customTitle);
          return;
        }

        // -- ATP: landscape -----------------------------------------
        if (isATP) {
          const du = _lastDU || getDU();
          const printHTML = buildATPPrintHTML(du);

          let printDiv = document.getElementById("atp-print-page");
          if (printDiv) printDiv.remove();
          printDiv = document.createElement("div");
          printDiv.id = "atp-print-page";
          printDiv.innerHTML = printHTML;
          pane.appendChild(printDiv);

          styleEl.textContent = `
      @media print {
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        *, *:before, *:after {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        @page { size: A4 landscape; margin: 10mm 12mm 12mm 12mm; }
        html, body {
          display: block !important;
          flex: none !important;
          float: none !important;
          background: #fff !important;
          position: static !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
          top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
          clip-path: none !important;
          contain: none !important;
          touch-action: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; font-family: 'Times New Roman', Times, serif !important; }
        .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .sem-toggle,
        .out-actions,.btn-print,.tbl-actions,.nav-btn,.stats-row,.tab-header, .no-print { display:none!important; }
        .content { display: block !important; flex: none !important; float: none !important; height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; margin: 0 !important; padding: 0 !important; }
        .tab-pane { display:none!important; padding:0; }
        .tab-pane.printing { display:block!important; flex: none !important; float: none !important; padding:0; background:#fff!important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; margin: 0 !important; }
        .printing .doc-frame { display:none!important; }
        #atp-print-page { display:block!important; overflow:visible!important; }
        table:not(.kal-tbl) { page-break-inside: auto !important; break-inside: auto !important; page-break-before: avoid !important; break-before: avoid !important; border-collapse: collapse !important; width: 100% !important; }
        table:not(.kal-tbl):not(.layout-tbl) th, table:not(.kal-tbl):not(.layout-tbl) td { border-width: 0.5pt !important; page-break-inside: auto !important; break-inside: auto !important; }
        .layout-tbl, .layout-tbl td, .layout-tbl th, .doc-meta-list, .doc-meta-list table, .doc-meta-list td, .doc-meta-list th, .sign-box, .sign-box table, .sign-box td, .sign-box th { border: none !important; }
        tr { page-break-inside: auto !important; break-inside: auto !important; }
        thead { display: table-header-group !important; }
        .sign-box { margin-top:20px!important; page-break-inside:avoid!important; break-inside:avoid!important; }
      }
      #atp-print-page { display:none; }
    `;

          const customTitle = getPDFFileName("atp");
          executeSystemPrint(customTitle);
          return;
        }

        // -- NILAI: per bab + rekap + referensi TP ----------------
        const isNilai = id === "nilai-1" || id === "nilai-2";
        if (isNilai) {
          const sem = id === "nilai-1" ? 1 : 2;
          const du = _lastDU || getDU();
          const babFilter =
            sem === 1 ? currentBabFilterGanjil : currentBabFilterGenap;
          const printHTML = buildNilaiPrintHTML(sem, du, babFilter);

          let printDiv = document.getElementById("nilai-print-pages");
          if (printDiv) printDiv.remove();
          printDiv = document.createElement("div");
          printDiv.id = "nilai-print-pages";
          printDiv.innerHTML = printHTML;
          pane.appendChild(printDiv);

          styleEl.textContent = `
      @media print {
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        *, *:before, *:after {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        @page { size: A4 portrait; margin: 10mm; }
        html, body {
          display: block !important;
          flex: none !important;
          float: none !important;
          background: #fff !important;
          position: static !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
          top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
          clip-path: none !important;
          contain: none !important;
          touch-action: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; font-family: 'Times New Roman', Times, serif !important; }
        .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .sem-toggle,
        .out-actions,.btn-print,.tbl-actions,.nav-btn,.stats-row,.tab-header,.no-print { display:none!important; }
        .content { display: block !important; flex: none !important; float: none !important; height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; margin: 0 !important; padding: 0 !important; }
        .tab-pane { display:none!important; padding:0; }
        .tab-pane.printing { display:block!important; flex: none !important; float: none !important; padding:0; background:#fff!important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; margin: 0 !important; }
        .printing .doc-frame { display:none!important; }
        .printing > div:not(#nilai-print-pages) { display:none!important; }
        #nilai-print-pages { display:block!important; overflow:visible!important; }
        table:not(.kal-tbl) { page-break-inside: auto; border-collapse: collapse !important; width: 100% !important; }
        table:not(.kal-tbl):not(.layout-tbl) th, table:not(.kal-tbl):not(.layout-tbl) td { border-width: 0.5pt !important; }
        .layout-tbl, .layout-tbl td, .layout-tbl th, .doc-meta-list, .doc-meta-list table, .doc-meta-list td, .doc-meta-list th, .sign-box, .sign-box table, .sign-box td, .sign-box th { border: none !important; }
        tr { page-break-inside:avoid!important; break-inside:avoid!important; }
        thead { display:table-header-group!important; }
        .sign-box { margin-top:16px!important; page-break-inside:avoid!important; break-inside:avoid!important; }
      }
      #nilai-print-pages { display:none; }
    `;

          const customTitle = getPDFFileName("nilai", sem);
          executeSystemPrint(customTitle);
          return;
        }

        // -- Others: landscape -------------------------------------
        styleEl.textContent = `@media print{
        ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        *, *:before, *:after {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        .ps td.filled,
        .ps tbody tr td.filled,
        .ps tbody tr.eval-row td.filled,
        .ps tr.eval-row td.filled,
        .ps tr:nth-child(even) td.filled,
        .ps td.filled .prosem-jp-val,
        .ps td.wk-cell .prosem-jp-val,
        .ps td.partial-fill,
        .ps td.partial-fill .prosem-jp-val,
        .prosem-jp-val {
          color: #0f1d3a !important;
          font-weight: 400 !important;
        }
        @page{size:A4 landscape;margin:10mm;}
        html, body{
          font-size:9pt;
          background: #fff !important;
          position: static !important;
          height: auto !important;
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
          top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
          clip-path: none !important;
          contain: none !important;
          touch-action: auto !important;
        }
        .sidebar, #app-sidebar, .sidebar-brand, .sidebar-bottom, .tab-header, .sem-toggle { display:none!important; }
        .content { height:auto!important; overflow:visible!important; position:static!important; width:100%!important; max-width:none!important; }
        .tab-pane.printing { display:block!important; position:static!important; overflow:visible!important; width:100%!important; max-width:none!important; background:#fff!important; }
        .printing .doc-frame { border:none!important; box-shadow:none!important; padding:0!important; overflow:visible!important; }
        table:not(.kal-tbl) { border-collapse: collapse !important; }
        table:not(.kal-tbl):not(.layout-tbl) th, table:not(.kal-tbl):not(.layout-tbl) td { border-width: 0.5pt !important; }
        .layout-tbl, .layout-tbl td, .layout-tbl th, .doc-meta-list, .doc-meta-list table, .doc-meta-list td, .doc-meta-list th, .sign-box, .sign-box table, .sign-box td, .sign-box th { border: none !important; }
        *{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; font-family: 'Times New Roman', Times, serif !important; }}`;

        let sem = null;
        if (id.endsWith("-1")) sem = 1;
        else if (id.endsWith("-2")) sem = 2;
        else if (id === "jurnal") {
          sem = document
            .getElementById("btn-jurnal-sem-2")
            ?.classList.contains("active")
            ? 2
            : 1;
        } else if (id === "tp") {
          sem = document
            .getElementById("btn-tp-sem-2")
            ?.classList.contains("active")
            ? 2
            : 1;
        }
        const customTitle = getPDFFileName(
          paneId === "jurnal" ? "jurnal_harian" : paneId,
          sem
        );
        executeSystemPrint(customTitle);
      }

      // ============================================================
      // SAVE / LOAD / RESET (JSON Backup  -  bukan localStorage)
      // ============================================================
      function saveData() {
        // Export full backup sebagai JSON
        const du = getDU();
        const data = {
          _info: "Backup Promesta  -  promesta.id",
          exported_at: new Date().toISOString(),
          mapel: du.mapel,
          fase: du.fase,
          kelas: du.kelas,
          tahun: du.tahun,
          sekolah: du.sekolah,
          kepsek: du.kepsek,
          tempat: du.tempat,
          tgl: du.tgl,
          firstDay: du.firstDay,
          guru: du.guru,
          jadwal: state.jadwal,
          tpGanjil: state.tpGanjil,
          tpGenap: state.tpGenap,
          siswa: state.siswa,
          absensiGanjil: state.absensiGanjil,
          absensiGenap: state.absensiGenap,
          nilaiGanjil: state.nilaiGanjil,
          nilaiGenap: state.nilaiGenap,
          pengaturanPenilaianGanjil: state.pengaturanPenilaianGanjil,
          pengaturanPenilaianGenap: state.pengaturanPenilaianGenap,
          atpData: state.atpData,
          modulAjar: state.modulAjar,
          imgTtdKepsek: state.imgTtdKepsek,
          imgCapSekolah: state.imgCapSekolah,
          imgTtdGuru: state.imgTtdGuru,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        const kelas = (du.kelas || "kelas").replace(/\s+/g, "_");
        const mapel = (du.mapel || "mapel").replace(/\s+/g, "_");
        a.download = `backup_${kelas}_${mapel}.json`;
        a.click();
      }

      function loadData() {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = ".json";
        inp.onchange = (e) => {
          const f = e.target.files[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = async (ev) => {
            try {
              let d = JSON.parse(ev.target.result);
              if (Array.isArray(d)) {
                if (d.length === 0) throw new Error("File backup kosong.");
                d = d[0];
              }
              if (d.jadwal) state.jadwal = d.jadwal;
              if (d.tpGanjil) state.tpGanjil = d.tpGanjil;
              if (d.tpGenap) state.tpGenap = d.tpGenap;
              if (d.siswa) state.siswa = d.siswa;
              if (d.kktp) state.kktp = d.kktp;
              if (d.absensiGanjil) state.absensiGanjil = d.absensiGanjil;
              if (d.absensiGenap) state.absensiGenap = d.absensiGenap;
              if (d.nilaiGanjil) state.nilaiGanjil = d.nilaiGanjil;
              if (d.nilaiGenap) state.nilaiGenap = d.nilaiGenap;

              if (d.pengaturanPenilaianGanjil) {
                state.pengaturanPenilaianGanjil = d.pengaturanPenilaianGanjil;
              } else if (d.pengaturanPenilaian) {
                state.pengaturanPenilaianGanjil = d.pengaturanPenilaian;
              } else if (d.customColsGanjil) {
                let def = [
                  { id: "nr", name: "Nilai Rataan TP", bobot: 50, fixed: true },
                ];
                d.customColsGanjil.forEach((colName, idx) => {
                  def.push({
                    id: String(idx),
                    name: colName,
                    bobot: 50,
                    fixed: false,
                  });
                });
                state.pengaturanPenilaianGanjil = def;
              }

              if (d.pengaturanPenilaianGenap) {
                state.pengaturanPenilaianGenap = d.pengaturanPenilaianGenap;
              } else if (d.pengaturanPenilaian) {
                state.pengaturanPenilaianGenap = d.pengaturanPenilaian;
              } else if (d.customColsGenap) {
                let def = [
                  { id: "nr", name: "Nilai Rataan TP", bobot: 50, fixed: true },
                ];
                d.customColsGenap.forEach((colName, idx) => {
                  def.push({
                    id: String(idx),
                    name: colName,
                    bobot: 50,
                    fixed: false,
                  });
                });
                state.pengaturanPenilaianGenap = def;
              }

              if (d.atpData) state.atpData = d.atpData;
              if (d.modulAjar) state.modulAjar = d.modulAjar;
              if (d.imgTtdKepsek) state.imgTtdKepsek = d.imgTtdKepsek;
              if (d.imgCapSekolah) state.imgCapSekolah = d.imgCapSekolah;
              if (d.imgTtdGuru) state.imgTtdGuru = d.imgTtdGuru;

              const setVal = (id, v) => {
                const el = document.getElementById(id);
                if (el && v !== undefined && v !== null) el.value = v;
              };
              setVal("f-jenjang", d.jenjang || "SD");
              if (typeof updateFaseOptions === "function") updateFaseOptions(false);
              setVal("f-fase", d.fase);
              if (typeof updateKelasSuggestions === "function") updateKelasSuggestions(false, d.kelas);
              setVal("f-kelas", d.kelas);
              setVal("f-rombel", d.rombel || "");
              if (typeof loadMapelUI === "function") loadMapelUI("f-mapel", "f-mapel-manual-container", "f-mapel-manual", d.mapel, d.fase, d.kelas, d.jenjang || "SD");
              if (typeof checkDataUmumMapelLock === "function") checkDataUmumMapelLock();
              setVal("f-tahun", d.tahun);
              setVal("f-sekolah", d.sekolah);
              setVal("f-kepsek", d.kepsek);
              setVal("f-tempat", d.tempat);
              setVal("f-tgl", d.tgl);
              setVal("f-guru", d.guru);
              if (d.firstDay !== undefined) {
                const fd = document.getElementById("f-first-day");
                if (fd) fd.value = d.firstDay;
              }
              if (typeof refreshAll === "function") refreshAll();
              
              if (currentUser && currentKelasId && typeof saveKelasData === "function") {
                await saveKelasData(currentUser.uid, currentKelasId);
              } else if (typeof scheduleSave === "function") {
                scheduleSave();
              }
              
              if (typeof showCustomAlert === "function") {
                await showCustomAlert("Backup Berhasil Dimuat", "Seluruh data mata pelajaran berhasil diimpor dan diperbarui.", "success");
              } else {
                alert("Backup berhasil dimuat!");
              }
            } catch (err) {
              console.error("loadData error:", err);
              if (typeof showCustomAlert === "function") {
                await showCustomAlert("Gagal Membaca File", err.message || "File backup tidak valid atau rusak.", "error");
              } else {
                alert("Gagal membaca file backup: " + (err.message || ""));
              }
            }
          };
          r.readAsText(f);
        };
        inp.click();
      }

      function resetData() {
        if (
          !confirm(
            "Reset semua data ke default? Data yang belum disimpan akan hilang.",
          )
        )
          return;
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        state.siswa = [];
        state.absensiGanjil = {};
        state.absensiGenap = {};
        state.nilaiGanjil = {};
        state.nilaiGenap = {};
        kalender.ganjil = JSON.parse(JSON.stringify(DEFAULT_STATE.liburGanjil));
        kalender.genap = JSON.parse(JSON.stringify(DEFAULT_STATE.liburGenap));
        state.liburGanjil = kalender.ganjil;
        state.liburGenap = kalender.genap;
        document.getElementById("f-jenjang").value = "SD";
        updateFaseOptions(false);
        document.getElementById("f-fase").value = "C";
        document.getElementById("f-kelas").value = "";
        document.getElementById("f-rombel").value = "";
        const autoTA = getAutoTahunAjaran();
        document.getElementById("f-tahun").value = autoTA;
        document.getElementById("f-sekolah").value = "";
        document.getElementById("f-kepsek").value = "";
        document.getElementById("f-tempat").value = "";
        document.getElementById("f-tgl").value = getDefaultTanggalPengesahan(autoTA);
        document.getElementById("f-guru").value = currentUser
          ? currentUser.displayName || ""
          : "";
        checkDataUmumMapelLock();
        refreshAll();
      }

      function resizeAllAutoTextareas() {
        document.querySelectorAll("textarea.auto-resize").forEach((el) => {
          if (el.offsetParent !== null) {
            el.style.height = "auto";
            el.style.height = (el.scrollHeight + 2) + "px";
          }
        });
      }

      function refreshAll() {
        updateDataUmumPlaceholders();
        resizeAllAutoTextareas();
        renderJadwal();
        renderTP("ganjil");
        renderTP("genap");
        renderTPCombined();
        renderAtpInput();
        renderKKTP();
        renderPengaturanPenilaian();
        renderSiswa();
        // Update sidebar info
        const sekolah = document.getElementById("f-sekolah").value;
        const el = document.getElementById("sidebar-sekolah");
        if (el) el.textContent = sekolah || "promesta.id";
      }

      

      // ============================================================
      // DEBOUNCED AUTO-SAVE TO LOCAL STORAGE
      // ============================================================
      let saveTimer = null;
      function scheduleSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
          if (currentUser && currentKelasId) {
            try {
              await saveKelasData(currentUser.uid, currentKelasId);
              showSaveIndicator("Perubahan Disimpan", "success");
            } catch (e) {
              console.warn("Auto-save failed:", e);
              showSaveIndicator("Gagal Menyimpan", "error");
            }
          }
        }, 1500);
      }

      // Toast indicator
      function showSaveIndicator(msg, type = "success", customSubtitle = null) {
        let el = document.getElementById("save-toast");
        if (!el) {
          el = document.createElement("div");
          el.id = "save-toast";
          el.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: rgba(17, 24, 39, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 13px;
            font-family: 'Inter', sans-serif;
            z-index: 99999;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
          `;
          document.body.appendChild(el);
        }

        let iconHtml = '';
        if (type === "success") {
          iconHtml = `<div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border-radius: 50%;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>`;
        } else if (type === "error") {
          iconHtml = `<div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: rgba(239, 68, 68, 0.15); color: #f87171; border-radius: 50%;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>`;
        } else {
          iconHtml = `<div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-radius: 50%;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>`;
        }

        const title = msg || "Perubahan Disimpan";
        const subtitle = customSubtitle !== null ? customSubtitle : (type === "success" ? "Data berhasil disimpan" : (type === "error" ? "Gagal menyimpan data" : ""));

        el.innerHTML = `
          ${iconHtml}
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-weight: 600; color: #f3f4f6; letter-spacing: -0.01em;">${title}</span>
            ${subtitle ? `<span style="font-size: 11px; color: #9ca3af;">${subtitle}</span>` : ""}
          </div>
        `;

        // Trigger reflow for animation
        void el.offsetWidth;

        el.style.opacity = "1";
        el.style.transform = "translateY(0)";

        clearTimeout(el._timer);
        el._timer = setTimeout(() => {
          el.style.opacity = "0";
          el.style.transform = "translateY(20px)";
        }, 3000);
      }

      // Patch mutation functions to trigger auto-save
      const _toggleJadwalHari = toggleJadwalHari;
      const _updateJadwalJp = updateJadwalJp;
      const _addTP = addTP;
      const _addEval = addEval;
      const _removeTP = removeTP;

      toggleJadwalHari = (h, c) => {
        _toggleJadwalHari(h, c);
        scheduleSave();
        markDirty();
      };
      updateJadwalJp = (h, jp) => {
        _updateJadwalJp(h, jp);
        scheduleSave();
        markDirty();
      };
      addTP = (s) => {
        _addTP(s);
        scheduleSave();
        markDirty();
      };
      addEval = (s) => {
        _addEval(s);
        scheduleSave();
        markDirty();
      };
      removeTP = (s, i) => {
        _removeTP(s, i);
        scheduleSave();
        markDirty();
      };

      // Listen to all input/change events for inline edits
      document.addEventListener("input", (e) => {
        if (
          e.target.tagName.toLowerCase() === "textarea" &&
          e.target.classList.contains("auto-resize")
        ) {
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + 2 + "px";
        }
        if (e.target.id === "f-sekolah") {
          const el = document.getElementById("sidebar-sekolah");
          if (el) el.textContent = e.target.value || "promesta.id";
        }
        if (e.target.id === "f-mapel" || e.target.id === "f-mapel-manual" || e.target.id === "f-fase" || e.target.id === "f-kelas" || e.target.id === "f-rombel") {
          triggerMapelChange();
        }
        if (e.target.id === "f-tahun") {
          const taVal = e.target.value;
          const autoTgl = getDefaultTanggalPengesahan(taVal);
          const tglInput = document.getElementById("f-tgl");
          if (tglInput) tglInput.value = autoTgl;
          if (currentKelasId) {
            const idx = daftarKelas.findIndex((k) => k.id === currentKelasId);
            if (idx >= 0) {
              daftarKelas[idx].tahun = taVal;
              daftarKelas[idx].tgl = autoTgl;
            }
          }
          renderKalenderPendidikan();
          refreshAll();
          scheduleSave();
          markDirty();
        }
        if (e.target.id === "f-tgl") {
          if (currentKelasId) {
            const idx = daftarKelas.findIndex((k) => k.id === currentKelasId);
            if (idx >= 0) {
              daftarKelas[idx].tgl = e.target.value;
            }
          }
          refreshAll();
          scheduleSave();
          markDirty();
        }
        if (e.target.closest(".content")) {
          scheduleSave();
          markDirty();
        }
      });
      document.addEventListener("change", (e) => {
        if (e.target.id === "f-first-day") {
          renderKalenderPendidikan();
          renderWdBar();
        }
        if (e.target.id === "f-tahun") {
          const taVal = e.target.value;
          const autoTgl = getDefaultTanggalPengesahan(taVal);
          const tglInput = document.getElementById("f-tgl");
          if (tglInput) tglInput.value = autoTgl;
          if (currentKelasId) {
            const idx = daftarKelas.findIndex((k) => k.id === currentKelasId);
            if (idx >= 0) {
              daftarKelas[idx].tahun = taVal;
              daftarKelas[idx].tgl = autoTgl;
            }
          }
          renderKalenderPendidikan();
          refreshAll();
          scheduleSave();
          markDirty();
        }
        if (e.target.id === "f-tgl") {
          if (currentKelasId) {
            const idx = daftarKelas.findIndex((k) => k.id === currentKelasId);
            if (idx >= 0) {
              daftarKelas[idx].tgl = e.target.value;
            }
          }
          refreshAll();
          scheduleSave();
          markDirty();
        }
        if (e.target.id === "f-mapel" || e.target.id === "f-mapel-manual" || e.target.id === "f-fase" || e.target.id === "f-kelas" || e.target.id === "f-rombel") {
          triggerMapelChange();
        }
        if (e.target.closest(".content")) {
          scheduleSave();
          markDirty();
        }
      });

      window.addEventListener("resize", () => {
        resizeAllAutoTextareas();
      });


      // ============================================================
      // INIT  -  Sesi Pengguna Lokal
      // ============================================================
      document.querySelector(".sidebar").style.display = "none";
      document.querySelector(".content").style.display = "none";

      renderWdBar();
    
            // Auto collapse sidebar on tablet sized screens
      function checkTabletWidth() {
        const sidebar = document.getElementById("app-sidebar");
        const btn = document.querySelector(".btn-collapse-sidebar");
        if (!sidebar) return;
        
        if (window.innerWidth > 768 && window.innerWidth <= 1024) {
          sidebar.classList.add("collapsed");
          if(btn) btn.innerHTML = '<i data-lucide="panel-left-close"></i>';
        } else if (window.innerWidth <= 768) {
          sidebar.classList.remove("collapsed");
          if(btn) btn.innerHTML = '<i data-lucide="panel-left-open"></i>';
        }
        if (window.lucide) window.lucide.createIcons();
      }
      let resizeTimer;
      window.addEventListener('resize', () => {
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(checkTabletWidth, 150);
      });
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkTabletWidth);
      } else {
        checkTabletWidth();
      }

      let touchStartY = 0;
      document.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches.length > 0) {
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        let el = e.target;
        let scrollableEl = null;
        while (el && el !== document.body && el !== document.documentElement) {
          const style = window.getComputedStyle(el);
          const oy = style.overflowY;
          if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) {
            scrollableEl = el;
            break;
          }
          el = el.parentElement;
        }
        if (!scrollableEl) {
          if (e.cancelable) e.preventDefault();
          return;
        }
        if (e.touches && e.touches.length > 0) {
          const currentY = e.touches[0].clientY;
          const isDraggingDown = currentY > touchStartY;
          const isDraggingUp = currentY < touchStartY;
          const isAtTop = scrollableEl.scrollTop <= 0;
          const isAtBottom = scrollableEl.scrollTop + scrollableEl.clientHeight >= scrollableEl.scrollHeight - 1;
          if ((isAtTop && isDraggingDown) || (isAtBottom && isDraggingUp)) {
            if (e.cancelable) e.preventDefault();
          }
        }
      }, { passive: false });



// Expose top-level module functions to window object for inline HTML event handlers
[
  "_absAllMonths",
  "activateLoginMode",
  "ad",
  "addAtpElemen",
  "addAtpRow",
  "addEditSubKomponen",
  "addEval",
  "addKKTP",
  "addKalenderRange",
  "addPengaturanPenilaian",
  "addSiswa",
  "addTP",
  "addTPDropdown",
  "addTourHighlight",
  "applyAutoCP",
  "autoPopulateTPFromCP",
  "autoResizeTextarea",
  "backupAllData",
  "buildATPPrintHTML",
  "buildAbsensiPrintHTML",
  "buildConsolidatedNotes",
  "buildDocxAbsensiHTML",
  "buildDocxMetaHTML",
  "buildDocxNilaiHTML",
  "buildDocxSignHTML",
  "buildHariEfektif",
  "buildMonthWeeks",
  "buildMonths",
  "buildNilaiPrintHTML",
  "bukaKelas",
  "bukaModalKelas",
  "bukaModalOnboarding",
  "bukaModalPetunjukCP",
  "bukaModalPetunjukLibur",
  "bukaModalPetunjukPenilaian",
  "bukaModalPetunjukSiswa",
  "bukaModalPetunjukTP",
  "calculateTotalBobot",
  "changeKatColor",
  "checkClassTour",
  "checkDataUmumMapelLock",
  "checkIframePrint",
  "checkKodeTP",
  "checkModalMapelLock",
  "checkNameRegistration",
  "checkOnboarding",
  "checkTabletWidth",
  "chunkMonthSpans",
  "cleanCPText",
  "clearAllSiswa",
  "clearKalender",
  "clearTourHighlights",
  "closeAllHeaderDropdowns",
  "closeChangePasswordModal",
  "closeImporSiswaModal",
  "closePrintAbsensiModal",
  "confirmDeleteKalenderGroup",
  "conn",
  "darkenColor",
  "daysInMonth",
  "deactivateLoginMode",
  "distributeJPProportional",
  "distributeJPProportionalAll",
  "distributeTP",
  "doForgotPassword",
  "doLogin",
  "doLogout",
  "downloadDocx",
  "downloadTemplateCP",
  "downloadTemplateTP",
  "endClassTour",
  "escH",
  "executePrintAbsensiFromModal",
  "executeSystemPrint",
  "expandRange",
  "exportKalender",
  "extractTPFromCPText",
  "fi",
  "findUserKey",
  "fmtD",
  "fmtJurnalDate",
  "fmtNoteDate",
  "fmtNoteDateShort",
  "fmtRange",
  "formatFaseKelas",
  "formatJadwalText",
  "formatKelas",
  "formatMapelName",
  "formatTanggalIndo",
  "formatTanggalRangeIndo",
  "generate",
  "getAllTPOptions",
  "getAutoCPData",
  "getAutoTahunAjaran",
  "getDU",
  "getDUSignObj",
  "getDefaultTanggalPengesahan",
  "getKelasSuggestionsByFase",
  "getMapelDataForKelasFase",
  "getMapelValue",
  "getMappedKategori",
  "getNamaHariIndo",
  "getOptimalColWidth",
  "getOrCreateTooltip",
  "getPDFFileName",
  "groupKalenderEntries",
  "handleUploadCP",
  "handleUploadCPJson",
  "handleUploadTP",
  "hapusKelas",
  "headerBlock",
  "hexToRgba",
  "importAllData",
  "importKalender",
  "importSiswa",
  "initAppSession",
  "initLucideObserver",
  "initTooltipsEngine",
  "isValidLicenseKey",
  "katById",
  "katWarna",
  "kembaliKeDashboard",
  "loadBSKAP046Database",
  "loadDaftarKelas",
  "loadData",
  "loadMapelUI",
  "markDirty",
  "markGenerated",
  "matchMapelOption",
  "mergeLiburByTip",
  "migratePengaturan",
  "migrateSiswaArr",
  "moveAtpRow",
  "movePengaturanPenilaian",
  "moveTPRow",
  "muatContohCPModal",
  "normalizeFase",
  "onCPDatabaseFailed",
  "onCPDatabaseLoaded",
  "openChangePasswordModal",
  "openEditKalenderGroupModal",
  "openEditKomponenModal",
  "openEditLibur",
  "openEditTP",
  "openHariKerjaModal",
  "openPrintAbsensiModal",
  "parseGradeNumber",
  "partitionColumnsEqually",
  "pd",
  "printTab",
  "prosesUraiCPModal",
  "refreshAll",
  "removeAtpElemen",
  "removeAtpRow",
  "removeEditSubKomponen",
  "removeKKTP",
  "removeLibur",
  "removePengaturanPenilaian",
  "removeSiswa",
  "removeTP",
  "removeTPCombined",
  "renderATP",
  "renderAbsensi",
  "renderAtpInput",
  "renderAtpRowHtml",
  "renderDUSignHTML",
  "renderDaftarKelas",
  "renderEditSubKomponentsList",
  "renderJadwal",
  "renderJurnal",
  "renderKKTP",
  "renderKKTPOutput",
  "renderKalender",
  "renderKalenderPendidikan",
  "renderKatColorSettings",
  "renderLibur",
  "renderMapelSelectOptions",
  "renderModalColorCtrls",
  "renderMonth",
  "renderNilai",
  "renderPengaturanPenilaian",
  "renderProsem",
  "renderProta",
  "renderRPE",
  "renderSiswa",
  "renderTP",
  "renderTPCombined",
  "renderTPStats",
  "renderTableChunk",
  "renderWdBar",
  "resetAllDataLocal",
  "resetCPJsonDatabase",
  "resetData",
  "resizeAllAutoTextareas",
  "runAbsensiPrint",
  "salinHasilUraiTP",
  "saveData",
  "saveEditLibur",
  "saveEditTP",
  "saveKalender",
  "saveKalenderAndRefresh",
  "saveKelasData",
  "scheduleSave",
  "searchBSKAP046Data",
  "setAbsensiMonth",
  "setupRandomWelcoming",
  "showCustomAlert",
  "showCustomPrompt",
  "showDashboard",
  "showKelas",
  "showLoginScreen",
  "showSaveIndicator",
  "showTab",
  "showTourStep",
  "simpanDataUmumManually",
  "simpanModalEditKomponen",
  "simpanModalKelas",
  "simpanPengaturanPenilaian",
  "startClassTour",
  "studentRows",
  "submitChangePassword",
  "submitImporSiswa",
  "submitTPForm",
  "summaryRows",
  "switchPanduanRTPTab",
  "switchSemContent",
  "syncTempSubKomponentsFromDOM",
  "terapkanUraiTPKeElemen",
  "thStyleFor",
  "toggleAbsensi",
  "toggleActivePenilaian",
  "toggleAllPrintAbsensiMonths",
  "toggleCollapseSidebar",
  "toggleHeaderDropdown",
  "toggleIdInput",
  "toggleJadwalHari",
  "toggleLoginPasswordVisibility",
  "toggleMapelManual",
  "toggleProsemJPText",
  "toggleSidebar",
  "toggleWorkDay",
  "triggerAutoPopulateTP",
  "triggerManualAutoCP",
  "triggerMapelChange",
  "tutupModalEditKomponen",
  "tutupModalKelas",
  "tutupModalOnboarding",
  "tutupModalPanduanRumusTP",
  "tutupModalPetunjukCP",
  "tutupModalPetunjukLibur",
  "tutupModalPetunjukPenilaian",
  "tutupModalPetunjukSiswa",
  "tutupModalPetunjukTP",
  "updateBobotPenilaian",
  "updateChipsView",
  "updateDataUmumMapelOptions",
  "updateDataUmumPlaceholders",
  "updateFaseOptions",
  "updateJadwalJp",
  "updateKelasSuggestions",
  "updateLibur",
  "updateModalFaseOptions",
  "updateModalKelasSuggestions",
  "updateModalMapelOptions",
  "updateModalPlaceholders",
  "updateModalSelectedColor",
  "updateNilai",
  "updateProsemJpVisibility",
  "updateTP",
  "updateTPStatsOnly",
  "autoUrutKodeTP",
  "detectTPPrefixStyle",
  "formatTPKode",
  "handleTPRowDragEnd",
  "handleTPRowDragEnter",
  "handleTPRowDragLeave",
  "handleTPRowDragOver",
  "handleTPRowDragStart",
  "handleTPRowDrop",
  "isAutoUrutKodeTPEnabled",
  "isEvalRow",
  "openModalUrutKodeTP",
  "pindahSemesterTP",
  "terapkanUrutKodeTPModal",
  "toggleAutoUrutKodeTP",
  "tutupModalUrutKodeTP",
  "clearAtpRows",
  "clearAllAtpTP",
  "updateAutoUrutCheckboxes",
  "updateModalUrutPreview",
].forEach((fnName) => {
  try {
    const fn = eval(fnName);
    if (typeof fn === "function") {
      window[fnName] = fn;
    }
  } catch (e) {
    // Function is inner-scoped or not in top module scope
  }
});
