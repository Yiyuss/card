/**
 * UI管理器模組
 * 負責管理遊戲中的所有UI元素和交互，包括屏幕切換、元素顯示隱藏、動畫效果等
 */

import { Logger } from './Logger.js';

export class UIManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('UIManager');
    this.logger.info('初始化UI管理器');
    
    // 屏幕元素
    this.screens = {
      mainMenu: null,
      levelSelect: null,
      battle: null,
      gameOver: null,
      shop: null,
      deck: null,
      settings: null,
      achievements: null,
      credits: null
    };
    
    // 當前活躍的屏幕
    this.activeScreen = null;
    
    // 通知系統
    this.toastContainer = null;
    this.toastQueue = [];
    this.isShowingToast = false;
    
    // 對話框系統
    this.modalContainer = null;
    this.activeModal = null;
    
    // UI元素緩存
    this.uiElements = {};
  }
  
  /**
   * 初始化UI管理器
   */
  init() {
    try {
      this.logger.info('初始化UI系統');
      
      // 獲取屏幕元素引用
      this._initScreens();
      
      // 初始化通知系統
      this._initToastSystem();
      
      // 初始化對話框系統
      this._initModalSystem();
      
      // 設置UI事件監聽器
      this._setupEventListeners();
      
      // 設置CSS變量
      this._setupCSSVariables();
      
      this.logger.info('UI系統初始化完成');
    } catch (error) {
      this.logger.error('初始化UI系統失敗', error);
      throw error;
    }
  }
  
  /**
   * 初始化屏幕元素引用
   * @private
   */
  _initScreens() {
    try {
      // 獲取所有屏幕元素
      this.screens.mainMenu = document.getElementById('main-menu-screen');
      this.screens.levelSelect = document.getElementById('level-select-screen');
      this.screens.battle = document.getElementById('battle-screen');
      this.screens.gameOver = document.getElementById('game-over-screen');
      this.screens.shop = document.getElementById('shop-screen');
      this.screens.deck = document.getElementById('deck-screen');
      this.screens.settings = document.getElementById('settings-screen');
      this.screens.achievements = document.getElementById('achievements-screen');
      this.screens.credits = document.getElementById('credits-screen');
      
      // 隱藏所有屏幕
      for (const screen in this.screens) {
        if (this.screens[screen]) {
          this.screens[screen].style.display = 'none';
        }
      }
      
      this.logger.debug('屏幕元素初始化完成');
    } catch (error) {
      this.logger.error('初始化屏幕元素失敗', error);
    }
  }
  
  /**
   * 初始化通知系統
   * @private
   */
  _initToastSystem() {
    try {
      this.toastContainer = document.getElementById('toast-container');
      if (!this.toastContainer) {
        this.logger.warn('找不到通知容器元素');
      }
      
      this.logger.debug('通知系統初始化完成');
    } catch (error) {
      this.logger.error('初始化通知系統失敗', error);
    }
  }
  
  /**
   * 初始化對話框系統
   * @private
   */
  _initModalSystem() {
    try {
      this.modalContainer = document.getElementById('modal-container');
      if (!this.modalContainer) {
        // 創建對話框容器
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'modal-container';
        this.modalContainer.className = 'modal-container';
        document.body.appendChild(this.modalContainer);
      }
      
      this.logger.debug('對話框系統初始化完成');
    } catch (error) {
      this.logger.error('初始化對話框系統失敗', error);
    }
  }
  
  /**
 * 設置UI事件監聽器
 * @private
 */
_setupEventListeners() {
    try {
      // 主菜單按鈕
      this._setupMainMenuListeners();
      
      // 關卡選擇按鈕
      this._setupLevelSelectListeners();
      
      // 戰鬥屏幕按鈕
      this._setupBattleScreenListeners();
      
      // 遊戲結束屏幕按鈕
      this._setupGameOverListeners();
      
      // 設置屏幕按鈕
      this._setupSettingsListeners();
      
      // 牌組屏幕按鈕
      this._setupDeckListeners();
      
      // 商店屏幕按鈕
      this._setupShopListeners();
      
      // 成就屏幕按鈕
      this._setupAchievementsListeners();
      
      // 學分屏幕按鈕
      this._setupCreditsListeners();
      
      this.logger.debug('UI事件監聽器設置完成');
    } catch (error) {
      this.logger.error('設置UI事件監聽器失敗', error);
    }
  }
  
  /**
 * 設置成就屏幕事件監聽器
 * @private
 */
_setupAchievementsListeners() {
    try {
      const backBtn = document.getElementById('achievements-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.showScreen('mainMenu');
        });
      }
    } catch (error) {
      this.logger.error('設置成就屏幕事件監聽器失敗', error);
    }
  }
  
  /**
   * 設置學分屏幕事件監聽器
   * @private
   */
  _setupCreditsListeners() {
    try {
      const backBtn = document.getElementById('credits-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.showScreen('mainMenu');
        });
      }
    } catch (error) {
      this.logger.error('設置學分屏幕事件監聽器失敗', error);
    }
  }

  /**
   * 設置主菜單事件監聽器
   * @private
   */
  _setupMainMenuListeners() {
    try {
      const newGameBtn = document.getElementById('new-game-btn');
      if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
          this.gameController.triggerEvent('newGameClicked');
        });
      }
      
      const loadGameBtn = document.getElementById('load-game-btn');
      if (loadGameBtn) {
        loadGameBtn.addEventListener('click', () => {
          this.gameController.triggerEvent('loadGameClicked');
        });
      }
      
      const continueBtn = document.getElementById('continue-btn');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          this.gameController.triggerEvent('continueClicked');
        });
      }
      
      const settingsBtn = document.getElementById('settings-btn');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          this.showScreen('settings');
        });
      }
      
      const creditsBtn = document.getElementById('credits-btn');
      if (creditsBtn) {
        creditsBtn.addEventListener('click', () => {
          this.showScreen('credits');
        });
      }
    } catch (error) {
      this.logger.error('設置主菜單事件監聽器失敗', error);
    }
  }
  
  /**
 * 設置關卡選擇事件監聽器
 * @private
 */
_setupLevelSelectListeners() {
    try {
      const backBtn = document.getElementById('back-to-menu-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.gameController.triggerEvent('backToMenuClicked');
        });
      }
      
      // 關卡按鈕將在顯示關卡選擇屏幕時動態創建
    } catch (error) {
      this.logger.error('設置關卡選擇事件監聽器失敗', error);
    }
  }
  
  /**
   * 設置戰鬥屏幕事件監聽器
   * @private
   */
  _setupBattleScreenListeners() {
    try {
      const endTurnBtn = document.getElementById('end-turn-btn');
      if (endTurnBtn) {
        endTurnBtn.addEventListener('click', () => {
          this.gameController.triggerEvent('endTurnClicked');
        });
      }
      
      const surrenderBtn = document.getElementById('surrender-btn');
      if (surrenderBtn) {
        surrenderBtn.addEventListener('click', () => {
          this.showConfirmDialog(
            this.gameController.uiTexts.battle.surrenderConfirm,
            () => {
              this.gameController.triggerEvent('backToMenuClicked');
            }
          );
        });
      }
    } catch (error) {
      this.logger.error('設置戰鬥屏幕事件監聽器失敗', error);
    }
  }
  
  /**
 * 設置遊戲結束事件監聽器
 * @private
 */
_setupGameOverListeners() {
    try {
      const retryBtn = document.getElementById('retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          // 重新開始同一關卡
          const currentEnemyId = this.gameController.state.enemy.id;
          this.gameController.triggerEvent('levelSelected', currentEnemyId);
        });
      }
      
      const nextLevelBtn = document.getElementById('next-level-btn');
      if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
          // 獲取下一關卡ID
          const currentEnemyId = this.gameController.state.enemy.id;
          const nextLevelId = currentEnemyId + 1;
          this.gameController.triggerEvent('levelSelected', nextLevelId);
        });
      }
      
      const backToMenuBtn = document.getElementById('back-to-menu-from-game-over-btn');
      if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
          this.gameController.triggerEvent('backToMenuClicked');
        });
      }
    } catch (error) {
      this.logger.error('設置遊戲結束事件監聽器失敗', error);
    }
  }
  
  /**
 * 設置設置屏幕事件監聽器
 * @private
 */
_setupSettingsListeners() {
    try {
      const applyBtn = document.getElementById('settings-apply-btn');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          // 獲取設置值
          const musicVolume = parseFloat(document.getElementById('music-volume').value);
          const soundVolume = parseFloat(document.getElementById('sound-volume').value);
          const difficulty = document.getElementById('difficulty').value;
          
          // 更新設置
          this.gameController.triggerEvent('settingsChanged', {
            musicVolume,
            soundVolume,
            difficulty
          });
          
          // 返回上一屏幕
          this.gameController.showScreen(this.gameController.state.currentScreen);
        });
      }
      
      const defaultBtn = document.getElementById('settings-default-btn');
      if (defaultBtn) {
        defaultBtn.addEventListener('click', () => {
          // 重置為默認設置
          document.getElementById('music-volume').value = 0.5;
          document.getElementById('sound-volume').value = 0.5;
          document.getElementById('difficulty').value = 'normal';
        });
      }
      
      const backBtn = document.getElementById('back-from-settings-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.gameController.showScreen(this.gameController.state.currentScreen);
        });
      }
    } catch (error) {
      this.logger.error('設置設置屏幕事件監聽器失敗', error);
    }
  }
  
  /**
   * 設置牌組屏幕事件監聽器
   * @private
   */
  _setupDeckListeners() {
    try {
      const backBtn = document.getElementById('deck-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.gameController.showScreen('levelSelect');
        });
      }
      
      // 卡牌相關事件將在顯示牌組屏幕時動態設置
    } catch (error) {
      this.logger.error('設置牌組屏幕事件監聽器失敗', error);
    }
  }
  
  /**
   * 設置商店屏幕事件監聽器
   * @private
   */
  _setupShopListeners() {
    try {
      const backBtn = document.getElementById('shop-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.gameController.showScreen('levelSelect');
        });
      }
      
      // 商品相關事件將在顯示商店屏幕時動態設置
    } catch (error) {
      this.logger.error('設置商店屏幕事件監聽器失敗', error);
    }
  }
  
  /**
   * 設置CSS變量
   * @private
   */
  _setupCSSVariables() {
    try {
      const root = document.documentElement;
      
      // 設置圖片路徑變量
      root.style.setProperty('--img-main-bg', `url('${this.gameController.imageAssets.backgrounds.main}')`);
      root.style.setProperty('--img-logo', `url('${this.gameController.imageAssets.ui.logo}')`);
      root.style.setProperty('--img-button-bg', `url('${this.gameController.imageAssets.ui.button}')`);
      root.style.setProperty('--img-card-back', `url('${this.gameController.imageAssets.cards.back}')`);
      root.style.setProperty('--img-health-bar', `url('${this.gameController.imageAssets.ui.healthBar}')`);
      root.style.setProperty('--img-mana-bar', `url('${this.gameController.imageAssets.ui.manaBar}')`);
      root.style.setProperty('--img-game-over-bg', `url('${this.gameController.imageAssets.backgrounds.gameOver}')`);
      
      this.logger.debug('CSS變量設置完成');
    } catch (error) {
      this.logger.error('設置CSS變量失敗', error);
    }
  }
  
  /**
 * 顯示指定屏幕
 * @param {string} screenName - 屏幕名稱
 */
showScreen(screenName) {
    try {
      // 獲取屏幕元素
      const screenElement = this.screens[screenName];
      if (!screenElement) {
        this.logger.error(`找不到屏幕元素: ${screenName}`);
        return;
      }
      
      // 隱藏當前屏幕
      if (this.activeScreen) {
        this.activeScreen.style.display = 'none';
      }
      
      // 顯示新屏幕
      screenElement.style.display = 'flex';
      this.activeScreen = screenElement;
      
      // 根據屏幕類型執行特定操作
      switch (screenName) {
        case 'mainMenu':
          this._updateMainMenu();
          break;
        case 'levelSelect':
          this._updateLevelSelect();
          break;
        case 'battle':
          this._updateBattleScreen();
          break;
        case 'gameOver':
          this._updateGameOverScreen();
          break;
        case 'shop':
          this._updateShopScreen();
          break;
        case 'deck':
          this._updateDeckScreen();
          break;
        case 'settings':
          this._updateSettingsScreen();
          break;
        case 'achievements':
          this._updateAchievementsScreen();
          break;
        case 'credits':
          this._updateCreditsScreen();
          break;
      }
      
      // 播放屏幕切換音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.screenChange);
      
      this.logger.info(`顯示屏幕: ${screenName}`);
    } catch (error) {
      this.logger.error(`顯示屏幕失敗: ${screenName}`, error);
    }
  }
  
  /**
   * 更新主菜單
   * @private
   */
  _updateMainMenu() {
    try {
      // 更新主菜單標題
      const titleElement = document.getElementById('game-title');
      if (titleElement) {
        titleElement.textContent = this.gameController.uiTexts.mainMenu.title;
      }
      
      // 更新按鈕文字
      const newGameBtn = document.getElementById('new-game-btn');
      if (newGameBtn) {
        newGameBtn.textContent = this.gameController.uiTexts.mainMenu.newGame;
      }
      
      const loadGameBtn = document.getElementById('load-game-btn');
      if (loadGameBtn) {
        loadGameBtn.textContent = this.gameController.uiTexts.mainMenu.loadGame;
      }
      
      const continueBtn = document.getElementById('continue-btn');
      if (continueBtn) {
        continueBtn.textContent = this.gameController.uiTexts.mainMenu.continue;
        
        // 根據是否有存檔決定是否啟用繼續按鈕
        if (this.gameController.state.progress.unlockedLevels.length > 1) {
          continueBtn.disabled = false;
        } else {
          continueBtn.disabled = true;
        }
      }
      
      const settingsBtn = document.getElementById('settings-btn');
      if (settingsBtn) {
        settingsBtn.textContent = this.gameController.uiTexts.mainMenu.settings;
      }
      
      const creditsBtn = document.getElementById('credits-btn');
      if (creditsBtn) {
        creditsBtn.textContent = this.gameController.uiTexts.mainMenu.credits;
      }
    } catch (error) {
      this.logger.error('更新主菜單失敗', error);
    }
  }
  
  /**
   * 更新關卡選擇屏幕
   * @private
   */
  _updateLevelSelect() {
    try {
      const levelContainer = document.getElementById('level-list');
      if (!levelContainer) {
        this.logger.warn('找不到關卡列表容器');
        return;
      }
      
      // 清空關卡列表
      levelContainer.innerHTML = '';
      
      // 獲取已解鎖的關卡
      const unlockedLevels = this.gameController.state.progress.unlockedLevels;
      
      // 獲取所有關卡數據
      const levels = this.gameController.resourceManager.getLevels();
      
      // 創建關卡按鈕
      levels.forEach(level => {
        // 檢查關卡是否已解鎖
        const isUnlocked = unlockedLevels.includes(level.id);
        
        // 創建關卡按鈕
        const levelBtn = document.createElement('div');
        levelBtn.className = `level-btn ${isUnlocked ? 'unlocked' : 'locked'}`;
        levelBtn.setAttribute('data-level-id', level.id);
        
        // 設置按鈕內容
        levelBtn.innerHTML = `
          <div class="level-name">${level.name}</div>
          <div class="level-difficulty">${this.gameController.uiTexts.levelSelect.difficulty}: ${level.difficulty}</div>
          ${isUnlocked ? '' : '<div class="level-locked-icon"></div>'}
        `;
        
        // 設置點擊事件
        if (isUnlocked) {
          levelBtn.addEventListener('click', () => {
            this.gameController.triggerEvent('levelSelected', level.id);
          });
        } else {
          levelBtn.addEventListener('click', () => {
            this.showToast(this.gameController.uiTexts.levelSelect.levelLocked);
          });
        }
        
        // 添加到容器
        levelContainer.appendChild(levelBtn);
      });
      
      // 更新返回按鈕文字
      const backBtn = document.getElementById('level-select-back-btn');
      if (backBtn) {
        backBtn.textContent = this.gameController.uiTexts.common.back;
      }
    } catch (error) {
      this.logger.error('更新關卡選擇屏幕失敗', error);
    }
  }
  
  /**
   * 更新戰鬥屏幕
   * @private
   */
  _updateBattleScreen() {
    try {
      // 更新回合信息
      const turnInfo = document.getElementById('battle-info');
      if (turnInfo) {
        turnInfo.innerHTML = `
          <div class="turn-info">${this.gameController.uiTexts.battle.turnCount}: ${this.gameController.battleManager.turnCount}</div>
          <div class="turn-player">${this.gameController.state.battle.isPlayerTurn ? this.gameController.uiTexts.battle.playerTurn : this.gameController.uiTexts.battle.enemyTurn}</div>
        `;
      }
      
      // 更新結束回合按鈕
      const endTurnBtn = document.getElementById('end-turn-btn');
      if (endTurnBtn) {
        endTurnBtn.textContent = this.gameController.uiTexts.battle.endTurn;
        endTurnBtn.disabled = !this.gameController.state.battle.isPlayerTurn;
      }
      
      // 更新投降按鈕
      const surrenderBtn = document.getElementById('surrender-btn');
      if (surrenderBtn) {
        surrenderBtn.textContent = this.gameController.uiTexts.battle.surrender;
      }
      
      // 更新牌庫和棄牌堆信息
      const deckInfo = document.getElementById('deck-info');
      if (deckInfo) {
        const cardCounts = this.gameController.cardManager.getCardCounts();
        deckInfo.innerHTML = `
          <div>${this.gameController.uiTexts.battle.deckCount}: ${cardCounts.deck}</div>
          <div>${this.gameController.uiTexts.battle.discardCount}: ${cardCounts.discard}</div>
        `;
      }
      
      // 更新玩家和敵人UI
      this.gameController.playerManager.updateUI();
      this.gameController.enemyManager.updateUI();
      this.gameController.cardManager.updateUI();
    } catch (error) {
      this.logger.error('更新戰鬥屏幕失敗', error);
    }
  }
  
  /**
   * 更新遊戲結束屏幕
   * @private
   */
  _updateGameOverScreen() {
    try {
      const isVictory = this.gameController.state.battle.isVictory;
      
      // 更新標題
      const titleElement = document.getElementById('game-over-title');
      if (titleElement) {
        titleElement.textContent = isVictory ? this.gameController.uiTexts.gameOver.victory : this.gameController.uiTexts.gameOver.defeat;
        titleElement.className = isVictory ? 'victory-title' : 'defeat-title';
      }
      
      // 更新獎勵信息（僅在勝利時顯示）
      const rewardsContainer = document.getElementById('rewards-container');
      if (rewardsContainer) {
        if (isVictory) {
          rewardsContainer.style.display = 'block';
          
          // 獲取當前關卡
          const currentLevel = this.gameController.resourceManager.getLevelById(this.gameController.state.enemy.id);
          if (currentLevel) {
            rewardsContainer.innerHTML = `
              <h3>${this.gameController.uiTexts.gameOver.rewards}</h3>
              <div class="reward-item">
                <span>${this.gameController.uiTexts.gameOver.gold}:</span>
                <span>${currentLevel.rewards.gold}</span>
              </div>
              <div class="reward-item">
                <span>${this.gameController.uiTexts.gameOver.experience}:</span>
                <span>${currentLevel.rewards.experience}</span>
              </div>
            `;
            
            // 添加卡牌獎勵（如果有）
            if (currentLevel.rewards.cards && currentLevel.rewards.cards.length > 0) {
              const cardRewardsDiv = document.createElement('div');
              cardRewardsDiv.className = 'card-rewards';
              cardRewardsDiv.innerHTML = `<h4>${this.gameController.uiTexts.gameOver.newCard}</h4>`;
              
              currentLevel.rewards.cards.forEach(cardId => {
                const card = this.gameController.resourceManager.getCardById(cardId);
                if (card) {
                  const cardElement = document.createElement('div');
                  cardElement.className = 'reward-card';
                  cardElement.innerHTML = `
                    <div class="card-name">${card.name}</div>
                    <div class="card-description">${card.description}</div>
                  `;
                  cardRewardsDiv.appendChild(cardElement);
                }
              });
              
              rewardsContainer.appendChild(cardRewardsDiv);
            }
          }
        } else {
          rewardsContainer.style.display = 'none';
        }
      }
      
      // 更新統計信息
      const statsContainer = document.getElementById('battle-stats');
      if (statsContainer) {
        const stats = this.gameController.battleManager.getBattleStats();
        statsContainer.innerHTML = `
          <h3>${this.gameController.uiTexts.gameOver.statistics}</h3>
          <div class="stat-item">
            <span>${this.gameController.uiTexts.gameOver.damageDealt}:</span>
            <span>${stats.damageDealt}</span>
          </div>
          <div class="stat-item">
            <span>${this.gameController.uiTexts.gameOver.healingDone}:</span>
            <span>${stats.healing}</span>
          </div>
          <div class="stat-item">
            <span>${this.gameController.uiTexts.gameOver.cardsPlayed}:</span>
            <span>${stats.cardsPlayed}</span>
          </div>
          <div class="stat-item">
            <span>${this.gameController.uiTexts.gameOver.turnsPlayed}:</span>
            <span>${stats.turnCount}</span>
          </div>
        `;
      }
      
      // 更新按鈕
      const retryBtn = document.getElementById('retry-btn');
      if (retryBtn) {
        retryBtn.textContent = this.gameController.uiTexts.gameOver.retry;
      }
      
      const nextLevelBtn = document.getElementById('next-level-btn');
      if (nextLevelBtn) {
        nextLevelBtn.textContent = this.gameController.uiTexts.gameOver.nextLevel;
        
        // 只在勝利且有下一關時顯示
        if (isVictory && this.gameController.state.enemy.id < this.gameController.resourceManager.getLevelsCount()) {
          nextLevelBtn.style.display = 'block';
        } else {
          nextLevelBtn.style.display = 'none';
        }
      }
      
      const backToMenuBtn = document.getElementById('game-over-back-btn');
      if (backToMenuBtn) {
        backToMenuBtn.textContent = this.gameController.uiTexts.gameOver.backToMenu;
      }
    } catch (error) {
      this.logger.error('更新遊戲結束屏幕失敗', error);
    }
  }
  
  /**
   * 更新商店屏幕
   * @private
   */
  _updateShopScreen() {
    try {
      // 更新玩家金幣顯示
      const goldDisplay = document.getElementById('shop-gold');
      if (goldDisplay) {
        goldDisplay.textContent = `${this.gameController.uiTexts.shop.gold}: ${this.gameController.state.player.gold}`;
      }
      
      // 獲取商品容器
      const shopItemsContainer = document.getElementById('shop-items');
      if (!shopItemsContainer) {
        this.logger.warn('找不到商店商品容器');
        return;
      }
      
      // 清空商品容器
      shopItemsContainer.innerHTML = '';
      
      // 獲取商店商品
      const shopItems = this.gameController.resourceManager.getShopItems();
      
      // 創建商品元素
      shopItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        
        // 設置商品內容
        itemElement.innerHTML = `
          <div class="shop-item-image" style="background-image: url('${item.image}')"></div>
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-description">${item.description}</div>
          <div class="shop-item-price">${item.price} ${this.gameController.uiTexts.shop.goldUnit}</div>
          <button class="shop-item-buy-btn">${this.gameController.uiTexts.shop.buy}</button>
        `;
        
        // 設置購買按鈕事件
        const buyButton = itemElement.querySelector('.shop-item-buy-btn');
        if (buyButton) {
          buyButton.addEventListener('click', () => {
            this.gameController.triggerEvent('shopItemSelected', item.id);
          });
          
          // 如果金幣不足，禁用按鈕
          if (this.gameController.state.player.gold < item.price) {
            buyButton.disabled = true;
            buyButton.textContent = this.gameController.uiTexts.shop.notEnoughGold;
          }
        }
        
        // 添加到容器
        shopItemsContainer.appendChild(itemElement);
      });
      
      // 更新返回按鈕文字
      const backBtn = document.getElementById('shop-back-btn');
      if (backBtn) {
        backBtn.textContent = this.gameController.uiTexts.common.back;
      }
    } catch (error) {
      this.logger.error('更新商店屏幕失敗', error);
    }
  }
  
  /**
   * 更新牌組屏幕
   * @private
   */
  _updateDeckScreen() {
    try {
      // 獲取牌組容器
      const deckContainer = document.getElementById('deck-cards');
      if (!deckContainer) {
        this.logger.warn('找不到牌組容器');
        return;
      }
      
      // 清空牌組容器
      deckContainer.innerHTML = '';
      
      // 獲取玩家擁有的卡牌
      const ownedCards = this.gameController.state.progress.ownedCards;
      const equippedCards = this.gameController.state.progress.equippedCards;
      
      // 創建卡牌元素
      ownedCards.forEach(cardId => {
        // 獲取卡牌數據
        const card = this.gameController.resourceManager.getCardById(cardId);
        if (!card) {
          this.logger.warn(`找不到卡牌數據: ${cardId}`);
          return;
        }
        
        // 檢查卡牌是否已裝備
        const isEquipped = equippedCards.includes(cardId);
        
        // 創建卡牌元素
        const cardElement = document.createElement('div');
        cardElement.className = `deck-card ${isEquipped ? 'equipped' : ''}`;
        cardElement.setAttribute('data-card-id', cardId);
        
        // 設置卡牌內容
        cardElement.innerHTML = `
          <div class="card-frame" style="background-image: url('${this.gameController.imageAssets.cards.frame[card.rarity]}')">
            <div class="card-cost">${card.cost}</div>
            <div class="card-image" style="background-image: url('${card.image}')"></div>
            <div class="card-name">${card.name}</div>
            <div class="card-type-icon" style="background-image: url('${this.gameController.imageAssets.cards.types[card.type]}')"></div>
            <div class="card-description">${card.description}</div>
            <div class="card-equip-status">${isEquipped ? this.gameController.uiTexts.deck.equipped : ''}</div>
          </div>
        `;
        
        // 設置點擊事件
        cardElement.addEventListener('click', () => {
          this.gameController.triggerEvent('deckCardClicked', cardId);
        });
        
        // 添加到容器
        deckContainer.appendChild(cardElement);
      });
      
      // 更新返回按鈕文字
      const backBtn = document.getElementById('deck-back-btn');
      if (backBtn) {
        backBtn.textContent = this.gameController.uiTexts.common.back;
      }
    } catch (error) {
      this.logger.error('更新牌組屏幕失敗', error);
    }
  }
      
      /**
       * 切換卡牌裝備狀態
       * @param {string} cardId - 卡牌ID
       * @private
       */
      _toggleCardEquip(cardId) {
        try {
          const equippedCards = this.gameController.state.progress.equippedCards;
          const isEquipped = equippedCards.includes(cardId);
          
          if (isEquipped) {
            // 取消裝備
            const index = equippedCards.indexOf(cardId);
            if (index !== -1) {
              equippedCards.splice(index, 1);
            }
            this.showToast(this.gameController.uiTexts.deck.cardUnequipped);
          } else {
            // 檢查牌組是否已滿
            const maxDeckSize = 20;
            if (equippedCards.length >= maxDeckSize) {
              this.showToast(this.gameController.uiTexts.deck.deckFull);
              return;
            }
            
            // 裝備卡牌
            equippedCards.push(cardId);
            this.showToast(this.gameController.uiTexts.deck.cardEquipped);
          }
          
          // 播放音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.cardSelect);
          
          // 保存遊戲
          this.gameController.saveManager.saveGame(this.gameController.state.progress);
          
          // 更新UI
          this._updateDeckScreen();
        } catch (error) {
          this.logger.error('切換卡牌裝備狀態失敗', error);
        }
      }
      

    /**
   * 更新設置屏幕
   * @private
   */
  _updateSettingsScreen() {
    try {
      // 獲取設置元素
      const musicVolumeSlider = document.getElementById('music-volume');
      const soundVolumeSlider = document.getElementById('sound-volume');
      const difficultySelect = document.getElementById('difficulty');
      
      // 設置當前值
      if (musicVolumeSlider) {
        musicVolumeSlider.value = this.gameController.state.settings.musicVolume;
      }
      
      if (soundVolumeSlider) {
        soundVolumeSlider.value = this.gameController.state.settings.soundVolume;
      }
      
      if (difficultySelect) {
        difficultySelect.value = this.gameController.state.settings.difficulty;
      }
      
      // 更新按鈕文字
      const applyBtn = document.getElementById('settings-apply-btn');
      if (applyBtn) {
        applyBtn.textContent = this.gameController.uiTexts.settings.apply;
      }
      
      const defaultBtn = document.getElementById('settings-default-btn');
      if (defaultBtn) {
        defaultBtn.textContent = this.gameController.uiTexts.settings.default;
      }
      
      const backBtn = document.getElementById('back-from-settings-btn');
      if (backBtn) {
        backBtn.textContent = this.gameController.uiTexts.common.back;
      }
    } catch (error) {
      this.logger.error('更新設置屏幕失敗', error);
    }
  }
      
  /**
   * 更新成就屏幕
   * @private
   */
  _updateAchievementsScreen() {
    try {
      // 獲取成就容器
      const achievementsContainer = document.getElementById('achievements-list');
      if (!achievementsContainer) {
        this.logger.warn('找不到成就容器');
        return;
      }
      
      // 清空成就容器
      achievementsContainer.innerHTML = '';
      
      // 獲取所有成就
      const allAchievements = this.gameController.resourceManager.getAchievements();
      const unlockedAchievements = this.gameController.state.progress.achievements;
      
      // 創建成就元素
      allAchievements.forEach(achievement => {
        // 檢查成就是否已解鎖
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        
        // 創建成就元素
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        // 設置成就內容
        achievementElement.innerHTML = `
          <div class="achievement-icon" style="background-image: url('${isUnlocked ? achievement.icon : this.gameController.imageAssets.ui.lockedAchievement}')"></div>
          <div class="achievement-info">
            <div class="achievement-name">${isUnlocked ? achievement.name : '???'}</div>
            <div class="achievement-description">${isUnlocked ? achievement.description : this.gameController.uiTexts.achievements.locked}</div>
          </div>
        `;
        
        // 添加到容器
        achievementsContainer.appendChild(achievementElement);
      });
      
      // 更新返回按鈕文字
      const backBtn = document.getElementById('achievements-back-btn');
      if (backBtn) {
        backBtn.textContent = this.gameController.uiTexts.common.back;
      }
    } catch (error) {
      this.logger.error('更新成就屏幕失敗', error);
    }
  }
      
/**
   * 更新製作人員屏幕
   * @private
   */
_updateCreditsScreen() {
    try {
      // 製作人員屏幕通常是靜態的，不需要動態更新
      this.logger.debug('製作人員屏幕已更新');
    } catch (error) {
      this.logger.error('更新製作人員屏幕失敗', error);
    }
  }

  /**
   * 更新學分屏幕
   * @private
   */
  _updateCreditsScreen() {
    try {
      // 獲取學分容器
      const creditsContainer = document.getElementById('credits-content');
      if (creditsContainer) {
        // 設置學分內容
        creditsContainer.innerHTML = this.gameController.uiTexts.credits.content;
      }
      
      // 更新返回按鈕文字
      const backBtn = document.getElementById('credits-back-btn');
      if (backBtn) {
        backBtn.textContent = this.gameController.uiTexts.common.back;
      }
    } catch (error) {
      this.logger.error('更新學分屏幕失敗', error);
    }
  }
      
      /**
       * 購買商店物品
       * @param {Object} item - 商店物品
       * @private
       */
      _buyShopItem(item) {
        try {
          // 檢查玩家金幣是否足夠
          if (this.gameController.state.player.gold < item.price) {
            this.showToast(this.gameController.uiTexts.shop.notEnoughGold);
            return;
          }
          
          // 扣除金幣
          this.gameController.state.player.gold -= item.price;
          
          // 根據物品類型處理
          if (item.type === 'card') {
            // 添加卡牌到玩家擁有的卡牌列表
            if (!this.gameController.state.progress.ownedCards.includes(item.id)) {
              this.gameController.state.progress.ownedCards.push(item.id);
            }
            
            this.showToast(this.gameController.uiTexts.shop.cardPurchased);
          } else if (item.type === 'item') {
            // 處理道具效果
            this._applyItemEffect(item);
            
            this.showToast(this.gameController.uiTexts.shop.itemPurchased);
          }
          
          // 播放購買音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.purchase);
          
          // 保存遊戲
          this.gameController.saveManager.saveGame(this.gameController.state.progress);
          
          // 更新UI
          this._updateShopScreen();
        } catch (error) {
          this.logger.error('購買商店物品失敗', error);
        }
      }
      
      /**
       * 應用道具效果
       * @param {Object} item - 道具物品
       * @private
       */
      _applyItemEffect(item) {
        try {
          if (!item.effect) {
            return;
          }
          
          switch (item.effect.type) {
            case 'heal':
              // 恢復生命值
              this.gameController.playerManager.heal(item.effect.value);
              break;
            case 'maxHealth':
              // 增加最大生命值
              this.gameController.state.player.maxHealth += item.effect.value;
              this.gameController.state.player.health += item.effect.value;
              break;
            case 'maxMana':
              // 增加最大魔力值
              this.gameController.state.player.maxMana += item.effect.value;
              this.gameController.state.player.mana += item.effect.value;
              break;
            case 'strength':
              // 增加力量屬性
              this.gameController.playerManager.attributes.strength += item.effect.value;
              break;
            case 'dexterity':
              // 增加敏捷屬性
              this.gameController.playerManager.attributes.dexterity += item.effect.value;
              break;
            case 'intelligence':
              // 增加智力屬性
              this.gameController.playerManager.attributes.intelligence += item.effect.value;
              break;
            case 'vitality':
              // 增加體力屬性
              this.gameController.playerManager.attributes.vitality += item.effect.value;
              break;
          }
        } catch (error) {
          this.logger.error('應用道具效果失敗', error);
        }
      }

      /**
   * 顯示通知消息
   * @param {string} message - 通知消息
   * @param {number} duration - 顯示時間（毫秒）
   */
  showToast(message, duration = 3000) {
    try {
      if (!message) return;
      
      // 將消息添加到隊列
      this.toastQueue.push({
        message,
        duration
      });
      
      // 如果當前沒有顯示通知，則顯示
      if (!this.isShowingToast) {
        this._showNextToast();
      }
    } catch (error) {
      this.logger.error('顯示通知失敗', error);
    }
  }
  
/**
   * 顯示下一個通知
   * @private
   */
_showNextToast() {
    try {
      if (this.toastQueue.length === 0) {
        this.isShowingToast = false;
        return;
      }
      
      this.isShowingToast = true;
      
      // 獲取下一個通知
      const toast = this.toastQueue.shift();
      
      // 創建通知元素
      const toastElement = document.createElement('div');
      toastElement.className = 'toast';
      toastElement.textContent = toast.message;
      
      // 如果容器不存在，創建一個
      if (!this.toastContainer) {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        document.body.appendChild(this.toastContainer);
      }
      
      // 添加到容器
      this.toastContainer.appendChild(toastElement);
      
      // 添加顯示類
      setTimeout(() => {
        toastElement.classList.add('show');
      }, 10);
      
      // 設置定時器移除通知
      setTimeout(() => {
        toastElement.classList.remove('show');
        
        // 動畫結束後移除元素
        setTimeout(() => {
          if (toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
          }
          
          // 顯示下一個通知
          this._showNextToast();
        }, 300);
      }, toast.duration);
    } catch (error) {
      this.logger.error('顯示下一個通知失敗', error);
      this.isShowingToast = false;
    }
  }

  /**
   * 處理通知隊列
   * @private
   */
  _processToastQueue() {
    try {
      // 如果隊列為空，則結束
      if (this.toastQueue.length === 0) {
        this.isShowingToast = false;
        return;
      }
      
      this.isShowingToast = true;
      
      // 獲取隊列中的第一個通知
      const toast = this.toastQueue.shift();
      
      // 如果沒有通知容器，則創建
      if (!this.toastContainer) {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
      }
      
      // 創建通知元素
      const toastElement = document.createElement('div');
      toastElement.className = 'toast';
      toastElement.textContent = toast.message;
      
      // 添加到容器
      this.toastContainer.appendChild(toastElement);
      
      // 顯示動畫
      setTimeout(() => {
        toastElement.classList.add('show');
      }, 10);
      
      // 設置定時器，在指定時間後隱藏通知
      setTimeout(() => {
        toastElement.classList.remove('show');
        
        // 隱藏動畫完成後移除元素
        setTimeout(() => {
          if (toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
          }
          
          // 處理下一個通知
          this._processToastQueue();
        }, 300);
      }, toast.duration);
    } catch (error) {
      this.logger.error('處理通知隊列失敗', error);
      this.isShowingToast = false;
    }
  }
      
      /**
   * 顯示確認對話框
   * @param {string} message - 確認消息
   * @param {Function} onConfirm - 確認回調
   * @param {Function} onCancel - 取消回調
   */
  showConfirmDialog(message, onConfirm, onCancel = null) {
    try {
      // 創建對話框元素
      const modal = document.createElement('div');
      modal.className = 'modal';
      
      // 設置對話框內容
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-message">${message}</div>
          <div class="modal-buttons">
            <button class="modal-button confirm-button">${this.gameController.uiTexts.common.confirm}</button>
            <button class="modal-button cancel-button">${this.gameController.uiTexts.common.cancel}</button>
          </div>
        </div>
      `;
      
      // 添加到容器
      this.modalContainer.appendChild(modal);
      this.activeModal = modal;
      
      // 設置按鈕事件
      const confirmButton = modal.querySelector('.confirm-button');
      const cancelButton = modal.querySelector('.cancel-button');
      
      confirmButton.addEventListener('click', () => {
        this._closeModal();
        if (onConfirm) onConfirm();
      });
      
      cancelButton.addEventListener('click', () => {
        this._closeModal();
        if (onCancel) onCancel();
      });
      
      // 顯示對話框
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
      
      // 播放音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.dialog);
    } catch (error) {
      this.logger.error('顯示確認對話框失敗', error);
    }
  }

  /**
   * 關閉當前對話框
   * @private
   */
  _closeModal() {
    try {
      if (!this.activeModal) return;
      
      this.activeModal.classList.remove('show');
      
      // 動畫結束後移除元素
      setTimeout(() => {
        if (this.activeModal && this.activeModal.parentNode) {
          this.activeModal.parentNode.removeChild(this.activeModal);
        }
        this.activeModal = null;
      }, 300);
      
      // 播放音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.buttonClick);
    } catch (error) {
      this.logger.error('關閉對話框失敗', error);
    }
  }

/**
 * 顯示提示對話框
 * @param {string} message - 對話框消息
 * @param {Function} onClose - 關閉回調
 */
showAlertDialog(message, onClose = null) {
    try {
      // 創建對話框元素
      const modal = document.createElement('div');
      modal.className = 'modal alert-modal';
      
      // 設置對話框內容
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-message">${message}</div>
          <div class="modal-buttons">
            <button class="modal-button close-button">${this.gameController.uiTexts.common.ok}</button>
          </div>
        </div>
      `;
      
      // 添加到容器
      this.modalContainer.appendChild(modal);
      
      // 設置當前活躍對話框
      this.activeModal = modal;
      
      // 設置按鈕事件
      const closeButton = modal.querySelector('.close-button');
      
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.hideModal();
          if (onClose) onClose();
        });
      }
      
      // 顯示對話框
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
      
      this.logger.debug('顯示提示對話框');
    } catch (error) {
      this.logger.error('顯示提示對話框失敗', error);
    }
  }
      
  /**
 * 隱藏當前對話框
 */
hideModal() {
    try {
      if (this.activeModal) {
        this.activeModal.classList.remove('show');
        
        // 在動畫結束後移除元素
        setTimeout(() => {
          if (this.activeModal && this.activeModal.parentNode) {
            this.activeModal.parentNode.removeChild(this.activeModal);
          }
          this.activeModal = null;
        }, 300);
        
        this.logger.debug('隱藏對話框');
      }
    } catch (error) {
      this.logger.error('隱藏對話框失敗', error);
    }
  }
      
      /**
       * 獲取UI元素
       * @param {string} id - 元素ID
       * @returns {HTMLElement} - UI元素
       */
      getElement(id) {
        try {
          // 檢查緩存
          if (this.uiElements[id]) {
            return this.uiElements[id];
          }
          
          // 獲取元素
          const element = document.getElementById(id);
          
          // 添加到緩存
          if (element) {
            this.uiElements[id] = element;
          }
          
          return element;
        } catch (error) {
          this.logger.error(`獲取UI元素失敗: ${id}`, error);
          return null;
        }
      }
    }