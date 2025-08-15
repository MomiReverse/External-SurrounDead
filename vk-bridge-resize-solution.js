/**
 * Решение для работы с VKWebAppResizeWindow
 * Обрабатывает ограничения ширины (600-1000px) и широкоформатный режим
 */

class VKResizeManager {
    constructor() {
        this.isWideMode = false;
        this.maxStandardWidth = 1000;
        this.minStandardWidth = 600;
        this.maxHeight = 800;
        this.minHeight = 400;
    }

    /**
     * Определяет, работает ли приложение в широкоформатном режиме
     */
    detectWideMode() {
        // Проверяем доступную ширину экрана
        const screenWidth = window.screen.width;
        const viewportWidth = window.innerWidth;
        
        // Если ширина больше 1000px, вероятно это широкоформатный режим
        this.isWideMode = viewportWidth > this.maxStandardWidth;
        
        console.log(`Режим: ${this.isWideMode ? 'Широкоформатный' : 'Стандартный'}`);
        console.log(`Ширина экрана: ${screenWidth}px, Ширина viewport: ${viewportWidth}px`);
        
        return this.isWideMode;
    }

    /**
     * Рассчитывает оптимальные размеры для текущего режима
     */
    calculateOptimalSize(targetWidth, targetHeight) {
        let finalWidth = targetWidth;
        let finalHeight = targetHeight;

        if (this.isWideMode) {
            // В широкоформатном режиме используем всю доступную ширину
            finalWidth = Math.min(window.innerWidth - 20, 1920); // Оставляем небольшой отступ
        } else {
            // В стандартном режиме соблюдаем ограничения VK
            finalWidth = Math.max(this.minStandardWidth, 
                        Math.min(this.maxStandardWidth, targetWidth));
        }

        // Ограничиваем высоту
        finalHeight = Math.max(this.minHeight, 
                     Math.min(this.maxHeight, targetHeight));

        return { width: finalWidth, height: finalHeight };
    }

    /**
     * Безопасное изменение размера окна с учетом ограничений
     */
    resizeWindow(width, height) {
        // Определяем режим работы
        this.detectWideMode();
        
        // Рассчитываем оптимальные размеры
        const optimalSize = this.calculateOptimalSize(width, height);
        
        console.log(`Запрошенный размер: ${width}x${height}`);
        console.log(`Применяемый размер: ${optimalSize.width}x${optimalSize.height}`);

        // Проверяем, доступен ли VK Bridge
        if (window.vkBridge) {
            try {
                // В широкоформатном режиме не используем VKWebAppResizeWindow
                if (this.isWideMode) {
                    console.log('Широкоформатный режим: VKWebAppResizeWindow не используется');
                    // Можно использовать альтернативные методы для управления размером
                    this.handleWideModeResize(optimalSize);
                } else {
                    // В стандартном режиме используем VKWebAppResizeWindow
                    window.vkBridge.send('VKWebAppResizeWindow', {
                        width: optimalSize.width,
                        height: optimalSize.height
                    });
                    console.log('VKWebAppResizeWindow вызван с ограниченными размерами');
                }
            } catch (error) {
                console.error('Ошибка при изменении размера окна:', error);
            }
        } else {
            console.warn('VK Bridge недоступен');
        }
    }

    /**
     * Обработка изменения размера в широкоформатном режиме
     */
    handleWideModeResize(size) {
        // В широкоформатном режиме можно:
        // 1. Изменить размеры контейнера приложения
        // 2. Использовать CSS для адаптации
        // 3. Применить масштабирование
        
        const appContainer = document.getElementById('app-container') || document.body;
        
        // Устанавливаем размеры контейнера
        appContainer.style.width = `${size.width}px`;
        appContainer.style.height = `${size.height}px`;
        
        // Центрируем контент
        appContainer.style.margin = '0 auto';
        appContainer.style.maxWidth = '100%';
        
        console.log('Размер изменен через CSS в широкоформатном режиме');
    }

    /**
     * Адаптивное изменение размера на основе содержимого
     */
    resizeToContent() {
        const content = document.getElementById('main-content') || document.body;
        const contentRect = content.getBoundingClientRect();
        
        // Добавляем отступы
        const padding = 40;
        const targetWidth = contentRect.width + padding;
        const targetHeight = contentRect.height + padding;
        
        this.resizeWindow(targetWidth, targetHeight);
    }

    /**
     * Устанавливает размеры для игрового режима
     */
    setGameMode() {
        // Для игр обычно нужны большие размеры
        const gameWidth = 1200;
        const gameHeight = 800;
        
        this.resizeWindow(gameWidth, gameHeight);
    }

    /**
     * Устанавливает размеры для мобильного режима
     */
    setMobileMode() {
        // Для мобильных устройств используем меньшие размеры
        const mobileWidth = 600;
        const mobileHeight = 600;
        
        this.resizeWindow(mobileWidth, mobileHeight);
    }
}

// Пример использования
const vkResizeManager = new VKResizeManager();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Автоматически определяем режим и устанавливаем начальный размер
    vkResizeManager.detectWideMode();
    
    // Устанавливаем размер в зависимости от режима
    if (vkResizeManager.isWideMode) {
        vkResizeManager.setGameMode();
    } else {
        vkResizeManager.setMobileMode();
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VKResizeManager;
}