/**
 * 卡牌管理器模組
 * 負責管理卡牌的創建、抽取、使用和棄置等功能
 */

import { Logger } from './Logger.js';

export class CardManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('CardManager');
    this.logger.info('初始化卡牌管理器');
    
    // 卡牌類型
    this.cardTypes = {
      ATTACK: 'attack',     // 攻擊牌
      DEFENSE: 'defense',   // 防禦牌
      SKILL: 'skill',       // 技能牌
      POWER: 'power',       // 能力牌
      CURSE: 'curse'        // 詛咒牌
    };
    
    // 卡牌稀有度
    this.cardRarities = {
      COMMON: 'common',         // 普通
      UNCOMMON: 'uncommon',     // 罕見
      RARE: 'rare',             // 稀有
      EPIC: 'epic',             // 史詩
      LEGENDARY: 'legendary'    // 傳說
    };
    
    // 卡牌UI元素
    this.uiElements = {
      handContainer: null,
      deckPile: null,
      discardPile: null
    };
  }
  
  /**
   * 初始化卡牌管理器
   */
  init() {
    try {
      this.logger.info('初始化卡牌管理器');
      
      // 初始化UI元素引用
      this._initUIElements();
      
      this.logger.info('卡牌管理器初始化完成');
    } catch (error) {
      this.logger.error('初始化卡牌管理器失敗', error);
    }
  }
  
  /**
   * 初始化UI元素引用
   * @private
   */
  _initUIElements() {
    try {
      // 在戰鬥開始時才獲取UI元素
      if (this.gameController.state.currentScreen === 'battle') {
        this.uiElements.handContainer = document.getElementById('hand-container');
        this.uiElements.deckPile = document.getElementById('deck-pile');
        this.uiElements.discardPile = document.getElementById('discard-pile');
      }
    } catch (error) {
      this.logger.error('初始化卡牌UI元素失敗', error);
    }
  }
  
  /**
   * 創建牌組
   * 根據玩家已裝備的卡牌創建牌組
   */
  createDeck() {
    try {
      this.logger.info('創建牌組');
      
      // 清空當前牌組
      this.gameController.state.cards.deck = [];
      this.gameController.state.cards.hand = [];
      this.gameController.state.cards.discardPile = [];
      
      // 獲取玩家已裝備的卡牌ID列表
      const equippedCardIds = this.gameController.state.progress.equippedCards;
      
      // 如果沒有裝備卡牌，添加一些基礎卡牌
      if (!equippedCardIds || equippedCardIds.length === 0) {
        this.logger.warn('玩家沒有裝備卡牌，使用基礎卡牌');
        
        // 添加基礎攻擊牌 x5
        for (let i = 0; i < 5; i++) {
          this.gameController.state.cards.deck.push('attack_basic');
        }
        
        // 添加基礎防禦牌 x5
        for (let i = 0; i < 5; i++) {
          this.gameController.state.cards.deck.push('defense_basic');
        }
      } else {
        // 將裝備的卡牌添加到牌組
        for (const cardId of equippedCardIds) {
          this.gameController.state.cards.deck.push(cardId);
        }
      }
      
      // 洗牌
      this.shuffleDeck();
      
      this.logger.info(`牌組創建完成，共${this.gameController.state.cards.deck.length}張卡牌`);
      return true;
    } catch (error) {
      this.logger.error('創建牌組失敗', error);
      return false;
    }
  }
  
  /**
   * 洗牌
   */
  shuffleDeck() {
    try {
      const deck = this.gameController.state.cards.deck;
      
      // Fisher-Yates 洗牌算法
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      
      // 播放洗牌音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.cardShuffle);
      
      this.logger.info('牌組已洗牌');
      return true;
    } catch (error) {
      this.logger.error('洗牌失敗', error);
      return false;
    }
  }
  
  /**
   * 抽牌
   * @param {number} count - 抽牌數量
   * @returns {Array} - 抽到的卡牌ID數組
   */
  drawCards(count = 1) {
    try {
      const drawnCards = [];
      
      for (let i = 0; i < count; i++) {
        // 檢查牌庫是否為空
        if (this.gameController.state.cards.deck.length === 0) {
          // 如果棄牌堆也為空，則無法抽牌
          if (this.gameController.state.cards.discardPile.length === 0) {
            this.logger.warn('牌庫和棄牌堆都為空，無法抽牌');
            break;
          }
          
          // 將棄牌堆洗入牌庫
          this.reshuffleDiscardPile();
          
          // 如果洗牌後牌庫仍為空，則跳出循環
          if (this.gameController.state.cards.deck.length === 0) {
            break;
          }
        }
        
        // 從牌庫頂部抽一張牌
        const cardId = this.gameController.state.cards.deck.pop();
        
        // 添加到手牌
        this.gameController.state.cards.hand.push(cardId);
        drawnCards.push(cardId);
        
        // 播放抽牌音效
        this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.cardDraw);
      }
      
      // 更新UI
      this.updateUI();
      
      this.logger.info(`抽了${drawnCards.length}張牌`);
      return drawnCards;
    } catch (error) {
      this.logger.error('抽牌失敗', error);
      return [];
    }
  }
  
  /**
   * 將棄牌堆洗入牌庫
   */
  reshuffleDiscardPile() {
    try {
      // 將棄牌堆中的卡牌移到牌庫
      this.gameController.state.cards.deck = [...this.gameController.state.cards.discardPile];
      
      // 清空棄牌堆
      this.gameController.state.cards.discardPile = [];
      
      // 洗牌
      this.shuffleDeck();
      
      // 顯示提示
      this.gameController.uiManager.showToast(this.gameController.uiTexts.battle.reshuffleDiscard);
      
      this.logger.info('棄牌堆已洗入牌庫');
      return true;
    } catch (error) {
      this.logger.error('將棄牌堆洗入牌庫失敗', error);
      return false;
    }
  }
  
  /**
   * 使用卡牌
   * @param {number} handIndex - 手牌索引
   * @returns {boolean} - 是否成功使用卡牌
   */
  playCard(handIndex) {
    try {
      const hand = this.gameController.state.cards.hand;
      
      // 檢查索引是否有效
      if (handIndex < 0 || handIndex >= hand.length) {
        this.logger.warn(`無效的手牌索引: ${handIndex}`);
        return false;
      }
      
      // 獲取卡牌ID
      const cardId = hand[handIndex];
      
      // 獲取卡牌數據
      const card = this.gameController.resourceManager.getCardById(cardId);
      if (!card) {
        this.logger.error(`找不到卡牌數據: ${cardId}`);
        return false;
      }
      
      // 檢查魔力是否足夠
      if (this.gameController.state.player.mana < card.cost) {
        this.logger.warn(`魔力不足，需要${card.cost}點，當前只有${this.gameController.state.player.mana}點`);
        this.gameController.uiManager.showToast(this.gameController.uiTexts.battle.noMana);
        return false;
      }
      
      // 消耗魔力
      this.gameController.playerManager.useMana(card.cost);
      
      // 應用卡牌效果
      this._applyCardEffect(card);
      
      // 從手牌中移除
      hand.splice(handIndex, 1);
      
      // 添加到棄牌堆
      this.gameController.state.cards.discardPile.push(cardId);
      
      // 更新統計數據
      this.gameController.state.progress.stats.totalCardsPlayed++;
      
      // 播放卡牌使用音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.cardPlay);
      
      // 播放卡牌使用動畫
      const cardElement = document.querySelector(`.card[data-index="${handIndex}"]`);
      if (cardElement) {
        this.gameController.animationManager.playCardAnimation(cardElement, 'play');
      }
      
      // 更新UI
      this.updateUI();
      
      this.logger.info(`使用卡牌: ${card.name}`);
      return true;
    } catch (error) {
      this.logger.error('使用卡牌失敗', error);
      return false;
    }
  }
  
  /**
   * 應用卡牌效果
   * @param {Object} card - 卡牌數據
   * @private
   */
  _applyCardEffect(card) {
    try {
      if (!card.effect) {
        this.logger.warn(`卡牌沒有效果: ${card.id}`);
        return;
      }
      
      // 根據卡牌類型決定目標
      let targetType;
      switch (card.type) {
        case this.cardTypes.ATTACK:
          targetType = 'enemy';
          break;
        case this.cardTypes.DEFENSE:
          targetType = 'player';
          break;
        case this.cardTypes.SKILL:
          // 技能牌可能有不同的目標
          targetType = card.effect.targetType || 'player';
          break;
        case this.cardTypes.POWER:
          targetType = 'player';
          break;
        case this.cardTypes.CURSE:
          targetType = 'player';
          break;
        default:
          targetType = 'player';
      }
      
      // 應用效果
      const result = this.gameController.effectManager.applyEffect(card.effect, targetType, { source: 'card', id: card.id });
      
      // 處理多次效果
      if (card.effect.times && card.effect.times > 1) {
        for (let i = 1; i < card.effect.times; i++) {
          this.gameController.effectManager.applyEffect(card.effect, targetType, { source: 'card', id: card.id });
        }
      }
      
      this.logger.debug(`應用卡牌效果: ${card.id}, 目標: ${targetType}, 結果: ${result.success}`);
    } catch (error) {
      this.logger.error(`應用卡牌效果失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 棄牌
   * @param {number} handIndex - 手牌索引
   * @returns {boolean} - 是否成功棄牌
   */
  discardCard(handIndex) {
    try {
      const hand = this.gameController.state.cards.hand;
      
      // 檢查索引是否有效
      if (handIndex < 0 || handIndex >= hand.length) {
        this.logger.warn(`無效的手牌索引: ${handIndex}`);
        return false;
      }
      
      // 獲取卡牌ID
      const cardId = hand[handIndex];
      
      // 從手牌中移除
      hand.splice(handIndex, 1);
      
      // 添加到棄牌堆
      this.gameController.state.cards.discardPile.push(cardId);
      
      // 播放棄牌音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.cardDiscard);
      
      // 播放棄牌動畫
      const cardElement = document.querySelector(`.card[data-index="${handIndex}"]`);
      if (cardElement) {
        this.gameController.animationManager.playCardAnimation(cardElement, 'discard');
      }
      
      // 更新UI
      this.updateUI();
      
      this.logger.info(`棄牌: ${cardId}`);
      return true;
    } catch (error) {
      this.logger.error('棄牌失敗', error);
      return false;
    }
  }
  
  /**
   * 棄掉所有手牌
   * @returns {number} - 棄掉的卡牌數量
   */
  discardHand() {
    try {
      const handCount = this.gameController.state.cards.hand.length;
      
      // 將所有手牌移到棄牌堆
      this.gameController.state.cards.discardPile.push(...this.gameController.state.cards.hand);
      
      // 清空手牌
      this.gameController.state.cards.hand = [];
      
      // 播放棄牌音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.cardDiscard);
      
      // 更新UI
      this.updateUI();
      
      this.logger.info(`棄掉所有手牌，共${handCount}張`);
      return handCount;
    } catch (error) {
      this.logger.error('棄掉所有手牌失敗', error);
      return 0;
    }
  }
  
  /**
   * 更新卡牌UI
   */
  updateUI() {
    try {
      // 確保UI元素已初始化
      if (!this.uiElements.handContainer) {
        this._initUIElements();
        if (!this.uiElements.handContainer) {
          return;
        }
      }
      
      // 更新手牌
      this._updateHandUI();
      
      // 更新牌庫和棄牌堆計數
      this._updatePilesUI();
      
      this.logger.debug('卡牌UI已更新');
    } catch (error) {
      this.logger.error('更新卡牌UI失敗', error);
    }
  }
  
  /**
   * 更新手牌UI
   * @private
   */
  _updateHandUI() {
    try {
      const handContainer = this.uiElements.handContainer;
      if (!handContainer) return;
      
      // 清空手牌容器
      handContainer.innerHTML = '';
      
      // 獲取手牌數據
      const hand = this.gameController.state.cards.hand;
      
      // 為每張手牌創建DOM元素
      hand.forEach((cardId, index) => {
        // 獲取卡牌數據
        const card = this.gameController.resourceManager.getCardById(cardId);
        if (!card) {
          this.logger.warn(`找不到卡牌數據: ${cardId}`);
          return;
        }
        
        // 創建卡牌元素
        const cardElement = document.createElement('div');
        cardElement.className = `card card-${card.type} card-${card.rarity}`;
        cardElement.setAttribute('data-index', index);
        cardElement.setAttribute('data-id', cardId);
        
        // 設置卡牌內容
        cardElement.innerHTML = `
          <div class="card-frame" style="background-image: url('${this.gameController.imageAssets.cards.frame[card.rarity]}')">
            <div class="card-cost">${card.cost}</div>
            <div class="card-image" style="background-image: url('${card.image}')"></div>
            <div class="card-name">${card.name}</div>
            <div class="card-type-icon" style="background-image: url('${this.gameController.imageAssets.cards.types[card.type]}')"></div>
            <div class="card-description">${card.description}</div>
          </div>
        `;
        
        // 添加點擊事件
        cardElement.addEventListener('click', () => {
          this.gameController.triggerEvent('cardClicked', index);
        });
        
        // 添加到手牌容器
        handContainer.appendChild(cardElement);
      });
    } catch (error) {
      this.logger.error('更新手牌UI失敗', error);
    }
  }
  
  /**
   * 更新牌庫和棄牌堆UI
   * @private
   */
  _updatePilesUI() {
    try {
      // 更新牌庫計數
      if (this.uiElements.deckPile) {
        this.uiElements.deckPile.setAttribute('data-count', this.gameController.state.cards.deck.length);
      }
      
      // 更新棄牌堆計數
      if (this.uiElements.discardPile) {
        this.uiElements.discardPile.setAttribute('data-count', this.gameController.state.cards.discardPile.length);
      }
    } catch (error) {
      this.logger.error('更新牌庫和棄牌堆UI失敗', error);
    }
  }
  
  /**
   * 獲取卡牌框架CSS類
   * @param {string} rarity - 卡牌稀有度
   * @returns {string} - CSS類名
   */
  getCardFrameClass(rarity) {
    switch (rarity) {
      case this.cardRarities.COMMON:
        return 'card-frame-common';
      case this.cardRarities.UNCOMMON:
        return 'card-frame-uncommon';
      case this.cardRarities.RARE:
        return 'card-frame-rare';
      case this.cardRarities.EPIC:
        return 'card-frame-epic';
      case this.cardRarities.LEGENDARY:
        return 'card-frame-legendary';
      default:
        return 'card-frame-common';
    }
  }
  
  /**
   * 獲取卡牌類型CSS類
   * @param {string} type - 卡牌類型
   * @returns {string} - CSS類名
   */
  getCardTypeClass(type) {
    switch (type) {
      case this.cardTypes.ATTACK:
        return 'card-type-attack';
      case this.cardTypes.DEFENSE:
        return 'card-type-defense';
      case this.cardTypes.SKILL:
        return 'card-type-skill';
      case this.cardTypes.POWER:
        return 'card-type-power';
      case this.cardTypes.CURSE:
        return 'card-type-curse';
      default:
        return 'card-type-skill';
    }
  }
  
  /**
   * 獲取卡牌數量統計
   * @returns {Object} - 卡牌數量統計
   */
  getCardCounts() {
    return {
      deck: this.gameController.state.cards.deck.length,
      hand: this.gameController.state.cards.hand.length,
      discard: this.gameController.state.cards.discardPile.length,
      total: this.gameController.state.cards.deck.length + 
             this.gameController.state.cards.hand.length + 
             this.gameController.state.cards.discardPile.length
    };
  }
  
  /**
   * 回合開始時的處理
   */
  onTurnStart() {
    try {
      // 如果是玩家回合，抽牌
      if (this.gameController.state.battle.isPlayerTurn) {
        // 默認每回合抽5張牌
        const drawCount = 5;
        
        // 計算實際可抽的牌數（不超過手牌上限）
        const maxHandSize = 10;
        const currentHandSize = this.gameController.state.cards.hand.length;
        const actualDrawCount = Math.min(drawCount, maxHandSize - currentHandSize);
        
        if (actualDrawCount > 0) {
          this.drawCards(actualDrawCount);
        }
      }
      
      this.logger.debug('回合開始卡牌處理完成');
    } catch (error) {
      this.logger.error('回合開始卡牌處理失敗', error);
    }
  }
  
  /**
   * 回合結束時的處理
   */
  onTurnEnd() {
    try {
      // 如果是玩家回合結束，棄掉所有手牌
      if (this.gameController.state.battle.isPlayerTurn) {
        this.discardHand();
      }
      
      this.logger.debug('回合結束卡牌處理完成');
    } catch (error) {
      this.logger.error('回合結束卡牌處理失敗', error);
    }
  }
}