/**
 * 存檔管理器模組
 * 負責遊戲存檔的保存和讀取，使用 localStorage 實現數據持久化
 */

import { Logger } from './Logger.js';

export class SaveManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('SaveManager');
    this.logger.info('初始化存檔管理器');
    
    // 存檔相關常量
    this.SAVE_KEY = 'cardGame_saveData';
    this.SETTINGS_KEY = 'cardGame_settings';
    this.PLAYER_ID_KEY = 'cardGame_playerId';
  }
  
  /**
   * 保存遊戲進度
   * @param {Object} progressData - 遊戲進度數據
   * @returns {boolean} - 保存是否成功
   */
  saveGame(progressData) {
    try {
      if (!progressData) {
        this.logger.warn('嘗試保存空的進度數據');
        return false;
      }
      
      // 確保玩家ID存在
      const playerId = this._getOrCreatePlayerId();
      
      // 添加時間戳
      const saveData = {
        ...progressData,
        playerId: playerId,
        lastSaved: new Date().toISOString()
      };
      
      // 保存到 localStorage
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      
      this.logger.info('遊戲進度已保存');
      return true;
    } catch (error) {
      this.logger.error('保存遊戲進度失敗', error);
      return false;
    }
  }
  
  /**
   * 載入遊戲進度
   * @returns {Object|null} - 遊戲進度數據，如果沒有存檔則返回 null
   */
  loadGame() {
    try {
      // 從 localStorage 讀取
      const saveDataString = localStorage.getItem(this.SAVE_KEY);
      
      if (!saveDataString) {
        this.logger.info('沒有找到存檔數據');
        return null;
      }
      
      const saveData = JSON.parse(saveDataString);
      
      // 驗證存檔數據
      if (!this._validateSaveData(saveData)) {
        this.logger.warn('存檔數據無效');
        return null;
      }
      
      this.logger.info('遊戲進度已載入');
      return saveData;
    } catch (error) {
      this.logger.error('載入遊戲進度失敗', error);
      return null;
    }
  }
  
  /**
   * 保存遊戲設置
   * @param {Object} settings - 遊戲設置
   * @returns {boolean} - 保存是否成功
   */
  saveSettings(settings) {
    try {
      if (!settings) {
        this.logger.warn('嘗試保存空的設置數據');
        return false;
      }
      
      // 保存到 localStorage
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      
      this.logger.info('遊戲設置已保存');
      return true;
    } catch (error) {
      this.logger.error('保存遊戲設置失敗', error);
      return false;
    }
  }
  
  /**
   * 載入遊戲設置
   * @returns {Object} - 遊戲設置，如果沒有則返回默認設置
   */
  loadSettings() {
    try {
      // 從 localStorage 讀取
      const settingsString = localStorage.getItem(this.SETTINGS_KEY);
      
      if (!settingsString) {
        this.logger.info('沒有找到設置數據，使用默認設置');
        return {
          musicVolume: 0.5,
          soundVolume: 0.5,
          difficulty: 'normal'
        };
      }
      
      const settings = JSON.parse(settingsString);
      
      this.logger.info('遊戲設置已載入');
      return settings;
    } catch (error) {
      this.logger.error('載入遊戲設置失敗', error);
      return {
        musicVolume: 0.5,
        soundVolume: 0.5,
        difficulty: 'normal'
      };
    }
  }
  
  /**
   * 刪除遊戲存檔
   * @returns {boolean} - 刪除是否成功
   */
  deleteSave() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      this.logger.info('遊戲存檔已刪除');
      return true;
    } catch (error) {
      this.logger.error('刪除遊戲存檔失敗', error);
      return false;
    }
  }
  
  /**
   * 重置所有遊戲數據
   * @returns {boolean} - 重置是否成功
   */
  resetAllData() {
    try {
      // 保留玩家ID
      const playerId = this._getOrCreatePlayerId();
      
      // 刪除存檔和設置
      localStorage.removeItem(this.SAVE_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      
      // 重新保存玩家ID
      localStorage.setItem(this.PLAYER_ID_KEY, playerId);
      
      this.logger.info('所有遊戲數據已重置');
      return true;
    } catch (error) {
      this.logger.error('重置遊戲數據失敗', error);
      return false;
    }
  }
  
  /**
   * 獲取或創建玩家唯一ID
   * @returns {string} - 玩家唯一ID
   * @private
   */
  _getOrCreatePlayerId() {
    try {
      let playerId = localStorage.getItem(this.PLAYER_ID_KEY);
      
      if (!playerId) {
        // 生成唯一ID
        playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(this.PLAYER_ID_KEY, playerId);
        this.logger.info('已創建新的玩家ID');
      }
      
      return playerId;
    } catch (error) {
      this.logger.error('獲取或創建玩家ID失敗', error);
      // 返回一個臨時ID
      return 'temp_' + Date.now();
    }
  }
  
  /**
   * 驗證存檔數據是否有效
   * @param {Object} saveData - 存檔數據
   * @returns {boolean} - 數據是否有效
   * @private
   */
  _validateSaveData(saveData) {
    // 基本驗證：檢查必要的字段是否存在
    if (!saveData || typeof saveData !== 'object') {
      return false;
    }
    
    // 檢查必要的進度數據字段
    const requiredFields = ['unlockedLevels', 'ownedCards', 'equippedCards', 'achievements', 'stats'];
    for (const field of requiredFields) {
      if (!saveData[field]) {
        return false;
      }
    }
    
    // 檢查統計數據
    if (!saveData.stats || typeof saveData.stats !== 'object') {
      return false;
    }
    
    return true;
  }
  
  /**
   * 檢查是否有存檔
   * @returns {boolean} - 是否有存檔
   */
  hasSaveData() {
    try {
      return localStorage.getItem(this.SAVE_KEY) !== null;
    } catch (error) {
      this.logger.error('檢查存檔失敗', error);
      return false;
    }
  }
  
  /**
   * 獲取存檔時間
   * @returns {string|null} - 存檔時間字符串，如果沒有存檔則返回 null
   */
  getSaveTime() {
    try {
      const saveDataString = localStorage.getItem(this.SAVE_KEY);
      
      if (!saveDataString) {
        return null;
      }
      
      const saveData = JSON.parse(saveDataString);
      return saveData.lastSaved || null;
    } catch (error) {
      this.logger.error('獲取存檔時間失敗', error);
      return null;
    }
  }
}