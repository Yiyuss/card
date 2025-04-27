/**
 * 日誌管理器模組
 * 負責記錄遊戲中的各種日誌信息，便於調試和錯誤追蹤
 */

/**
 * 日誌管理器類
 */
export class Logger {
    /**
     * 創建日誌管理器實例
     * @param {string} moduleName - 模組名稱，用於標識日誌來源
     */
    constructor(moduleName) {
      this.moduleName = moduleName;
      this.logLevel = this._getLogLevel();
      this.logHistory = [];
      this.maxLogHistory = 100; // 最大日誌歷史記錄數
    }
    
    /**
     * 獲取當前日誌級別
     * @returns {number} 日誌級別 (0: 關閉, 1: 錯誤, 2: 警告, 3: 信息, 4: 調試)
     * @private
     */
    _getLogLevel() {
      try {
        // 嘗試從 localStorage 獲取日誌級別設置
        const savedLevel = localStorage.getItem('logLevel');
        if (savedLevel !== null) {
          return parseInt(savedLevel, 10);
        }
        
        // 默認日誌級別：生產環境為警告，開發環境為調試
        return process.env.NODE_ENV === 'production' ? 2 : 4;
      } catch (error) {
        // 如果無法訪問 localStorage，默認為警告級別
        return 2;
      }
    }
    
    /**
     * 設置日誌級別
     * @param {number} level - 日誌級別 (0: 關閉, 1: 錯誤, 2: 警告, 3: 信息, 4: 調試)
     */
    setLogLevel(level) {
      if (level >= 0 && level <= 4) {
        this.logLevel = level;
        try {
          localStorage.setItem('logLevel', level.toString());
        } catch (error) {
          // 忽略 localStorage 錯誤
        }
      }
    }
    
    /**
     * 格式化日誌消息
     * @param {string} level - 日誌級別名稱
     * @param {string} message - 日誌消息
     * @param {Error|null} error - 錯誤對象（可選）
     * @returns {string} 格式化後的日誌消息
     * @private
     */
    _formatMessage(level, message, error) {
      const timestamp = new Date().toISOString();
      let formattedMessage = `[${timestamp}] [${level}] [${this.moduleName}] ${message}`;
      
      if (error) {
        formattedMessage += `\nError: ${error.message}`;
        if (error.stack) {
          formattedMessage += `\nStack: ${error.stack}`;
        }
      }
      
      return formattedMessage;
    }
    
    /**
     * 添加日誌到歷史記錄
     * @param {string} level - 日誌級別名稱
     * @param {string} message - 日誌消息
     * @param {Error|null} error - 錯誤對象（可選）
     * @private
     */
    _addToHistory(level, message, error) {
      const logEntry = {
        timestamp: new Date(),
        level,
        module: this.moduleName,
        message,
        error: error ? {
          message: error.message,
          stack: error.stack
        } : null
      };
      
      this.logHistory.unshift(logEntry);
      
      // 限制歷史記錄大小
      if (this.logHistory.length > this.maxLogHistory) {
        this.logHistory.pop();
      }
    }
    
    /**
     * 記錄調試級別的日誌
     * @param {string} message - 日誌消息
     */
    debug(message) {
      if (this.logLevel >= 4) {
        const formattedMessage = this._formatMessage('DEBUG', message);
        console.debug(formattedMessage);
        this._addToHistory('DEBUG', message);
      }
    }
    
    /**
     * 記錄信息級別的日誌
     * @param {string} message - 日誌消息
     */
    info(message) {
      if (this.logLevel >= 3) {
        const formattedMessage = this._formatMessage('INFO', message);
        console.info(formattedMessage);
        this._addToHistory('INFO', message);
      }
    }
    
    /**
     * 記錄警告級別的日誌
     * @param {string} message - 日誌消息
     */
    warn(message) {
      if (this.logLevel >= 2) {
        const formattedMessage = this._formatMessage('WARN', message);
        console.warn(formattedMessage);
        this._addToHistory('WARN', message);
      }
    }
    
    /**
     * 記錄錯誤級別的日誌
     * @param {string} message - 日誌消息
     * @param {Error} [error] - 錯誤對象（可選）
     */
    error(message, error) {
      if (this.logLevel >= 1) {
        const formattedMessage = this._formatMessage('ERROR', message, error);
        console.error(formattedMessage);
        this._addToHistory('ERROR', message, error);
      }
    }
    
    /**
     * 獲取日誌歷史記錄
     * @returns {Array} 日誌歷史記錄
     */
    getLogHistory() {
      return [...this.logHistory];
    }
    
    /**
     * 清除日誌歷史記錄
     */
    clearLogHistory() {
      this.logHistory = [];
    }
    
    /**
     * 將日誌導出為文本
     * @returns {string} 導出的日誌文本
     */
    exportLogs() {
      return this.logHistory.map(entry => {
        let log = `[${entry.timestamp.toISOString()}] [${entry.level}] [${entry.module}] ${entry.message}`;
        if (entry.error) {
          log += `\nError: ${entry.error.message}`;
          if (entry.error.stack) {
            log += `\nStack: ${entry.error.stack}`;
          }
        }
        return log;
      }).join('\n\n');
    }
  }