# Библиотеки проекта

Эта папка содержит локальные копии всех внешних библиотек, используемых в проекте JSON/YAML Mind Map Visualizer.

## Содержимое

### d3.min.js
- **Версия:** 7.8.5
- **Описание:** Библиотека для создания интерактивных визуализаций данных
- **Использование:** Создание force-directed графов, анимаций, масштабирования
- **Размер:** ~273KB
- **Источник:** https://unpkg.com/d3@7.8.5/dist/d3.min.js

### js-yaml.min.js
- **Версия:** 4.1.0
- **Описание:** Парсер YAML для JavaScript
- **Использование:** Парсинг YAML файлов и строк
- **Размер:** ~39KB
- **Источник:** https://unpkg.com/js-yaml@4.1.0/dist/js-yaml.min.js

### jspdf.umd.min.js
- **Версия:** 2.5.1
- **Описание:** Библиотека для создания PDF документов
- **Использование:** Экспорт mind map в PDF формат
- **Размер:** ~355KB
- **Источник:** https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js

## Преимущества локального хранения

1. **Надежность** - не зависит от внешних CDN
2. **Скорость** - быстрая загрузка без внешних запросов
3. **Офлайн работа** - проект работает без интернета
4. **Стабильность** - версии библиотек не изменяются

## Обновление библиотек

Для обновления библиотек до новых версий:

```bash
# D3.js
curl -o libs/d3.min.js https://unpkg.com/d3@latest/dist/d3.min.js

# js-yaml
curl -o libs/js-yaml.min.js https://unpkg.com/js-yaml@latest/dist/js-yaml.min.js

# jsPDF
curl -o libs/jspdf.umd.min.js https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js
```

## Лицензии

Все библиотеки распространяются под лицензией MIT или совместимыми лицензиями.

- **D3.js:** BSD-3-Clause License
- **js-yaml:** MIT License  
- **jsPDF:** MIT License
