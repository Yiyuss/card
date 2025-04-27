/**
 * 成就管理器模組
 * 負責管理遊戲中的所有成就，包括成就的解鎖、顯示和保存等功能
 */

import { Logger } from './Logger.js';

export class AchievementManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('AchievementManager');
    this.logger.info('初始化成就管理器');
    
    // 成就UI元素
    this.uiElements = {
      achievementContainer: null,
      achievementList: null,
      achievementNotification: null
    };
    
    // 成就解鎖動畫計時器
    this.notificationTimer = null;
    
    // 成就類型
    this.achievementTypes = {
      PROGRESS: 'progress',    // 進度類成就
      COLLECTION: 'collection', // 收集類成就
      CHALLENGE: 'challenge',   // 挑戰類成就
      SECRET: 'secret'          // 隱藏類成就
    };
  }
  
  /**
   * 初始化成就管理器
   */
  init() {
    try {
      this.logger.info('初始化成就管理器');
      
      // 初始化UI元素引用
      this._initUIElements();
      
      this.logger.info('成就管理器初始化完成');
    } catch (error) {
      this.logger.error('初始化成就管理器失敗', error);
    }
  }
  
  /**
   * 初始化UI元素引用
   * @private
   */
  _initUIElements() {
    try {
      // 獲取成就相關UI元素
      this.uiElements.achievementContainer = document.getElementById('achievements-screen');
      this.uiElements.achievementList = document.getElementById('achievements-list');
      this.uiElements.achievementNotification = document.getElementById('achievement-notification');
      
      this.logger.debug('成就UI元素初始化完成');
    } catch (error) {
      this.logger.error('初始化成就UI元素失敗', error);
    }
  }
  
  /**
   * 解鎖成就
   * @param {string} achievementId - 成就ID
   * @returns {boolean} - 是否成功解鎖
   */
  unlockAchievement(achievementId) {
    try {
      // 檢查成就是否已解鎖
      if (this.gameController.state.progress.achievements.includes(achievementId)) {
        this.logger.debug(`成就已解鎖: ${achievementId}`);
        return false;
      }
      
      // 獲取成就數據
      const achievement = this.gameController.resourceManager.getAchievementById(achievementId);
      if (!achievement) {
        this.logger.error(`找不到成就: ${achievementId}`);
        return false;
      }
      
      // 添加到已解鎖成就
      this.gameController.state.progress.achievements.push(achievementId);
      
      // 播放成就解鎖音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.achievement);
      
      // 顯示成就解鎖提示
      this.showAchievementUnlocked(achievement);
      
      // 保存遊戲
      this.gameController.saveManager.saveGame(this.gameController.state.progress);
      
      this.logger.info(`解鎖成就: ${achievement.name}`);
      
      return true;
    } catch (error) {
      this.logger.error('解鎖成就失敗', error);
      return false;
    }
  }
  
  /**
   * 顯示成就解鎖提示
   * @param {Object} achievement - 成就對象
   */
  showAchievementUnlocked(achievement) {
    try {
      // 如果不在成就屏幕，顯示通知
      if (this.gameController.state.currentScreen !== 'achievements') {
        // 創建通知元素
        this._showAchievementNotification(achievement);
      }
      
      // 如果在成就屏幕，更新成就列表
      if (this.gameController.state.currentScreen === 'achievements') {
        this.updateAchievementList();
      }
      
      this.logger.debug(`顯示成就解鎖提示: ${achievement.name}`);
    } catch (error) {
      this.logger.error('顯示成就解鎖提示失敗', error);
    }
  }
  
  /**
   * 顯示成就解鎖通知
   * @param {Object} achievement - 成就對象
   * @private
   */
  _showAchievementNotification(achievement) {
    try {
      // 清除之前的計時器
      if (this.notificationTimer) {
        clearTimeout(this.notificationTimer);
      }
      
      // 如果通知元素不存在，創建一個
      if (!this.uiElements.achievementNotification) {
        this.uiElements.achievementNotification = document.createElement('div');
        this.uiElements.achievementNotification.id = 'achievement-notification';
        this.uiElements.achievementNotification.className = 'achievement-notification';
        document.body.appendChild(this.uiElements.achievementNotification);
      }
      
      // 設置通知內容
      this.uiElements.achievementNotification.innerHTML = `
        <div class="achievement-icon">
          <img src="${achievement.icon || this.gameController.imageAssets.ui.icons.achievement}" alt="成就">
        </div>
        <div class="achievement-info">
          <div class="achievement-title">${this.gameController.uiTexts.achievements.unlocked}</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
      `;
      
      // 顯示通知
      this.uiElements.achievementNotification.classList.add('show');
      
      // 設置自動隱藏計時器
      this.notificationTimer = setTimeout(() => {
        this.uiElements.achievementNotification.classList.remove('show');
      }, 5000);
      
      this.logger.debug(`顯示成就通知: ${achievement.name}`);
    } catch (error) {
      this.logger.error('顯示成就通知失敗', error);
    }
  }
  
  /**
   * 更新成就列表
   */
  updateAchievementList() {
    try {
      // 確保成就列表元素存在
      if (!this.uiElements.achievementList) {
        this._initUIElements();
        if (!this.uiElements.achievementList) {
          this.logger.warn('找不到成就列表元素');
          return;
        }
      }
      
      // 清空成就列表
      this.uiElements.achievementList.innerHTML = '';
      
      // 獲取所有成就
      const allAchievements = this.gameController.resourceManager.getAllAchievements();
      
      // 獲取已解鎖成就
      const unlockedAchievements = this.gameController.state.progress.achievements;
      
      // 創建成就分類
      const categories = {};
      for (const type in this.achievementTypes) {
        categories[this.achievementTypes[type]] = [];
      }
      
      // 將成就分類
      for (const achievement of allAchievements) {
        if (categories[achievement.type]) {
          categories[achievement.type].push(achievement);
        } else {
          categories[this.achievementTypes.PROGRESS].push(achievement);
        }
      }
      
      // 為每個分類創建一個部分
      for (const type in categories) {
        if (categories[type].length === 0) continue;
        
        // 創建分類標題
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'achievement-category-title';
        categoryTitle.textContent = this.gameController.uiTexts.achievements.categories[type] || type;
        this.uiElements.achievementList.appendChild(categoryTitle);
        
        // 創建成就容器
        const achievementsContainer = document.createElement('div');
        achievementsContainer.className = 'achievements-container';
        
        // 添加該分類的所有成就
        for (const achievement of categories[type]) {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          
          // 創建成就元素
          const achievementElement = document.createElement('div');
          achievementElement.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
          achievementElement.setAttribute('data-id', achievement.id);
          
          // 設置成就內容
          achievementElement.innerHTML = `
            <div class="achievement-icon">
              <img src="${isUnlocked ? achievement.icon : this.gameController.imageAssets.ui.icons.achievementLocked}" alt="${achievement.name}">
            </div>
            <div class="achievement-info">
              <div class="achievement-name">${isUnlocked ? achievement.name : (achievement.type === this.achievementTypes.SECRET ? '???' : achievement.name)}</div>
              <div class="achievement-description">${isUnlocked ? achievement.description : (achievement.type === this.achievementTypes.SECRET ? this.gameController.uiTexts.achievements.secretAchievement : achievement.description)}</div>
            </div>
            ${isUnlocked ? `<div class="achievement-date">${this._formatUnlockDate(achievement.id)}</div>` : ''}
          `;
          
          // 添加到容器
          achievementsContainer.appendChild(achievementElement);
        }
        
        // 添加到列表
        this.uiElements.achievementList.appendChild(achievementsContainer);
      }
      
      this.logger.debug('成就列表已更新');
    } catch (error) {
      this.logger.error('更新成就列表失敗', error);
    }
  }
  
  /**
   * 格式化解鎖日期
   * @param {string} achievementId - 成就ID
   * @returns {string} - 格式化的日期字符串
   * @private
   */
  _formatUnlockDate(achievementId) {
    try {
      // 獲取解鎖時間
      const unlockTime = this.gameController.state.progress.achievementDates?.[achievementId];
      
      // 如果沒有記錄解鎖時間，返回空字符串
      if (!unlockTime) {
        return '';
      }
      
      // 格式化日期
      const date = new Date(unlockTime);
      return date.toLocaleDateString();
    } catch (error) {
      this.logger.error('格式化解鎖日期失敗', error);
      return '';
    }
  }
  
  /**
   * 檢查成就進度
   * @param {string} achievementId - 成就ID
   * @param {number} currentValue - 當前值
   * @param {number} targetValue - 目標值
   * @returns {number} - 完成百分比 (0-100)
   */
  checkAchievementProgress(achievementId, currentValue, targetValue) {
    try {
      // 如果成就已解鎖，返回100%
      if (this.gameController.state.progress.achievements.includes(achievementId)) {
        return 100;
      }
      
      // 計算完成百分比
      const progress = Math.min(100, Math.floor((currentValue / targetValue) * 100));
      
      // 如果達到目標，解鎖成就
      if (currentValue >= targetValue) {
        this.unlockAchievement(achievementId);
      }
      
      return progress;
    } catch (error) {
      this.logger.error('檢查成就進度失敗', error);
      return 0;
    }
  }
  
  /**
   * 檢查收集類成就
   * @param {string} achievementId - 成就ID
   * @param {Array} collection - 收集的項目數組
   * @param {Array} targetItems - 目標項目數組
   * @returns {number} - 完成百分比 (0-100)
   */
  checkCollectionAchievement(achievementId, collection, targetItems) {
    try {
      // 如果成就已解鎖，返回100%
      if (this.gameController.state.progress.achievements.includes(achievementId)) {
        return 100;
      }
      
      // 計算已收集的目標項目數量
      let collectedCount = 0;
      for (const item of targetItems) {
        if (collection.includes(item)) {
          collectedCount++;
        }
      }
      
      // 計算完成百分比
      const progress = Math.min(100, Math.floor((collectedCount / targetItems.length) * 100));
      
      // 如果全部收集完成，解鎖成就
      if (collectedCount === targetItems.length) {
        this.unlockAchievement(achievementId);
      }
      
      return progress;
    } catch (error) {
      this.logger.error('檢查收集類成就失敗', error);
      return 0;
    }
  }
  
  /**
   * 檢查挑戰類成就
   * @param {string} achievementId - 成就ID
   * @param {boolean} isCompleted - 是否完成挑戰
   * @returns {boolean} - 是否成功解鎖
   */
  checkChallengeAchievement(achievementId, isCompleted) {
    try {
      // 如果成就已解鎖，返回false
      if (this.gameController.state.progress.achievements.includes(achievementId)) {
        return false;
      }
      
      // 如果完成挑戰，解鎖成就
      if (isCompleted) {
        return this.unlockAchievement(achievementId);
      }
      
      return false;
    } catch (error) {
      this.logger.error('檢查挑戰類成就失敗', error);
      return false;
    }
  }
  
  /**
   * 獲取已解鎖成就數量
   * @returns {Object} - 包含已解鎖數量和總數量的對象
   */
  getAchievementCounts() {
    try {
      const totalAchievements = this.gameController.resourceManager.getAllAchievements().length;
      const unlockedAchievements = this.gameController.state.progress.achievements.length;
      
      return {
        unlocked: unlockedAchievements,
        total: totalAchievements,
        percentage: Math.floor((unlockedAchievements / totalAchievements) * 100)
      };
    } catch (error) {
      this.logger.error('獲取成就數量失敗', error);
      return { unlocked: 0, total: 0, percentage: 0 };
    }
  }
  
  /**
   * 重置所有成就
   * @returns {boolean} - 是否成功重置
   */
  resetAchievements() {
    try {
      // 清空已解鎖成就
      this.gameController.state.progress.achievements = [];
      
      // 清空成就解鎖日期
      this.gameController.state.progress.achievementDates = {};
      
      // 保存遊戲
      this.gameController.saveManager.saveGame(this.gameController.state.progress);
      
      // 更新成就列表
      this.updateAchievementList();
      
      this.logger.info('所有成就已重置');
      return true;
    } catch (error) {
      this.logger.error('重置成就失敗', error);
      return false;
    }
  }
  
  /**
   * 顯示成就屏幕
   */
  showAchievementsScreen() {
    try {
      // 切換到成就屏幕
      this.gameController.showScreen('achievements');
      
      // 更新成就列表
      this.updateAchievementList();
      
      this.logger.info('顯示成就屏幕');
    } catch (error) {
      this.logger.error('顯示成就屏幕失敗', error);
    }
  }
}