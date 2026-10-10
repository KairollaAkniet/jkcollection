# JKCOLLECTION

Flask, PostgreSQL, Nginx и Gunicorn.

## Запуск в Docker

Работай из папки проекта. Docker Compose запускает отдельную базу данных;
данные из локального PostgreSQL автоматически в неё не копируются.

На новом компьютере скопируй `.env.example` в `.env` и укажи свои значения.
В существующем проекте `.env` уже настроен, не перезаписывай его примером.
Для генерации SECRET_KEY: `python -c "import secrets; print(secrets.token_hex(32))"`.

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 flask nginx
```

Сайт: http://127.0.0.1:8080 . Порт можно изменить через WEB_PORT в `.env`.
PostgreSQL доступен только внутри Docker. HOST и PORT из `.env` остаются для
локального Flask; в контейнере они заменяются на postgres:5432.

```bash
docker compose down
```

Эта команда сохраняет тома базы данных и загруженных изображений.
Не добавляй `-v`, если нужно сохранить эти данные.

## Локальная разработка в WSL

```bash
source env/bin/activate
pip install -r requirements.txt
flask --app app:create_app run --debug
```

Локальный PostgreSQL должен быть запущен по HOST и PORT из `.env`.
Если загружать старые приложения из терминала без Flask CLI, используй
`run:application`: там .env загружается до импорта настроек.

## Деплой

Контейнеры запускаются теми же командами. До публикации выбери хостинг,
домен и настрой HTTPS. По умолчанию сайт привязан к 127.0.0.1, чтобы его
можно было безопасно проверить до публикации. Для прямого доступа на VPS
нужен WEB_BIND=0.0.0.0; при HTTPS установи COOKIE_SECURE=true.
Сначала настрой сертификат и HTTPS-прокси, затем включай secure cookies.
На HTTPS-прокси направляй запросы на порт WEB_PORT.

Существующие данные нужно переносить через pg_dump/pg_restore отдельно.
Приложение создаёт таблицы на пустой базе. Миграции хранятся в migrations;
перед изменением схемы на рабочем сервере создай и проверь миграцию.

Корзина сейчас хранится в браузере. Каталог задан в JavaScript;
онлайн-оплата и оформление заказов на сервере пока не подключены.

## GitHub

.env, виртуальное окружение, дампы базы и пользовательские загрузки
исключены из Git и Docker-образа. migrations нужно хранить в репозитории.
Локальный репозиторий уже создан; код ещё не опубликован на GitHub.

```bash
git init -b main
git add .
git status
```

Перед коммитом убедись, что в списке нет .env, env/ и дампов базы.
После выбора GitHub-репозитория можно сделать коммит и добавить remote.

В Docker используется Gunicorn. app.ini — прежняя настройка uWSGI,
в текущем запуске она не используется.

## Render + Neon

Для Render используется Dockerfile из корня репозитория, не docker-compose.yaml.
В Render выбери Web Service, подключи GitHub-репозиторий и тариф Free.
Runtime: Docker. Dockerfile Path: ./Dockerfile. Health Check Path: /.

В Neon создай PostgreSQL-проект на бесплатном тарифе. В Connect скопируй
строку подключения, включая sslmode=require. В Render добавь секретные
переменные через Environment, не коммить их в Git:

- DATABASE_URL: строка подключения из Neon.
- SECRET_KEY: отдельный случайный ключ (Generate в Render).
- COOKIE_SECURE: true.
- FLASK_DEBUG: 0.

Порт берётся из PORT, который предоставляет Render. Если PORT не задан,
Docker запускает сайт на 8080 как раньше.

На бесплатном Render аватарки, загруженные пользователями, не сохраняются
после перезапуска. Для их постоянного хранения понадобится отдельное
облачное хранилище. Фото товаров входят в исходники и сохраняются.
Аккаунты будут храниться в Neon; старая локальная база не переносится автоматически.

Документация: https://render.com/docs/deploy-flask и https://render.com/docs/free.
