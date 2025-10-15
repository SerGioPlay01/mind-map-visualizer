# 🚀 Инструкции по развертыванию

## 📋 Требования

### Минимальные требования
- **Браузер**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **JavaScript**: ES6+ поддержка
- **Память**: 512MB RAM
- **Место на диске**: 10MB

### Рекомендуемые требования
- **Браузер**: последняя версия
- **Память**: 1GB+ RAM
- **Место на диске**: 50MB
- **Интернет**: для загрузки шрифтов (опционально)

## 🌐 Развертывание на GitHub Pages

### Автоматическое развертывание
1. Форкните репозиторий
2. Перейдите в Settings → Pages
3. Выберите Source: "GitHub Actions"
4. Push в main ветку автоматически развернет сайт

### Ручное развертывание
```bash
# Клонируйте репозиторий
git clone https://github.com/SerGioPlay01/mind-map-visualizer.git

# Перейдите в папку
cd mind-map-visualizer

# Создайте gh-pages ветку
git checkout -b gh-pages

# Добавьте все файлы
git add .

# Зафиксируйте изменения
git commit -m "Deploy to GitHub Pages"

# Отправьте в репозиторий
git push origin gh-pages
```

## 🏠 Локальное развертывание

### Простой HTTP сервер
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/mind-map-visualizer;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Кэширование статических файлов
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/mind-map-visualizer
    
    <Directory /path/to/mind-map-visualizer>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Кэширование
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/svg+xml "access plus 1 year"
    </IfModule>
</VirtualHost>
```

## ☁️ Облачные платформы

### Vercel
```bash
# Установите Vercel CLI
npm i -g vercel

# Разверните проект
vercel

# Или подключите GitHub репозиторий
# Перейдите на vercel.com и импортируйте репозиторий
```

### Netlify
```bash
# Установите Netlify CLI
npm i -g netlify-cli

# Разверните проект
netlify deploy --prod --dir=.

# Или перетащите папку на netlify.com
```

### Firebase Hosting
```bash
# Установите Firebase CLI
npm i -g firebase-tools

# Инициализируйте проект
firebase init hosting

# Разверните
firebase deploy
```

### AWS S3 + CloudFront
```bash
# Установите AWS CLI
pip install awscli

# Настройте credentials
aws configure

# Создайте bucket
aws s3 mb s3://your-bucket-name

# Загрузите файлы
aws s3 sync . s3://your-bucket-name --delete

# Настройте CloudFront для CDN
```

## 🐳 Docker развертывание

### Dockerfile
```dockerfile
FROM nginx:alpine

# Копируем файлы
COPY . /usr/share/nginx/html

# Настраиваем nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  mind-map:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

### Запуск
```bash
# Сборка образа
docker build -t mind-map-visualizer .

# Запуск контейнера
docker run -p 80:80 mind-map-visualizer

# Или с docker-compose
docker-compose up -d
```

## 🔧 Настройка окружения

### Переменные окружения
```bash
# .env файл
NODE_ENV=production
PORT=8000
BASE_URL=https://your-domain.com
```

### Конфигурация
```javascript
// config.js
const config = {
  production: {
    apiUrl: 'https://api.your-domain.com',
    analytics: true,
    debug: false
  },
  development: {
    apiUrl: 'http://localhost:3000',
    analytics: false,
    debug: true
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

## 📊 Мониторинг и аналитика

### Google Analytics
```html
<!-- Добавьте в index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Мониторинг ошибок
```javascript
// Sentry
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV
});
```

## 🔒 Безопасность

### HTTPS
- Используйте SSL сертификаты
- Настройте редирект с HTTP на HTTPS
- Включите HSTS заголовки

### CSP заголовки
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' fonts.googleapis.com;
               font-src 'self' fonts.gstatic.com;
               img-src 'self' data:;">
```

### Заголовки безопасности
```nginx
# Nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## 🚀 Оптимизация производительности

### Сжатие
```nginx
# Gzip сжатие
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Кэширование
```nginx
# Кэширование статических файлов
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### CDN
- Используйте CloudFlare, AWS CloudFront, или другие CDN
- Настройте кэширование для статических ресурсов
- Используйте HTTP/2 для лучшей производительности

## 📱 PWA настройка

### Service Worker
```javascript
// sw.js
const CACHE_NAME = 'mind-map-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/libs/d3.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});
```

### Манифест
```json
{
  "name": "Mind Map Visualizer",
  "short_name": "MindMap",
  "description": "JSON/YAML Mind Map Visualizer",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007bff",
  "icons": [
    {
      "src": "android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🔄 CI/CD

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### GitLab CI
```yaml
deploy:
  stage: deploy
  script:
    - echo "Deploying to production"
  only:
    - main
```

## 📋 Чек-лист развертывания

- [ ] Все файлы загружены
- [ ] HTTPS настроен
- [ ] Аналитика подключена
- [ ] Мониторинг ошибок настроен
- [ ] Кэширование настроено
- [ ] CDN подключен
- [ ] PWA настроен
- [ ] Тесты пройдены
- [ ] Документация обновлена
- [ ] Backup настроен

## 🆘 Устранение неполадок

### Проблемы с загрузкой
- Проверьте пути к файлам
- Убедитесь в правильности MIME типов
- Проверьте консоль браузера на ошибки

### Проблемы с производительностью
- Включите сжатие
- Настройте кэширование
- Оптимизируйте изображения
- Используйте CDN

### Проблемы с безопасностью
- Проверьте CSP заголовки
- Настройте HTTPS
- Обновите зависимости
- Проверьте логи на подозрительную активность
