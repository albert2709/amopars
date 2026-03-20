# amoPars Caller & SMS extension

Chrome Extension (Manifest V3) с popup и страницей настроек.

## Возможности

- Кнопка **Позвонить** берёт номер телефона по XPath `//input[@class="control-phone__formatted js-form-changes-skip linked-form__cf js-linked-pei text-input prevent-readonly"]` на текущей странице.
- Кнопка **Отправить SMS** получает тот же номер и отправляет текст через Wappi/MAX API.
- Кнопка-шестерёнка открывает настройки аккаунтов.
- Поддерживается несколько аккаунтов для каждого сервиса с ротацией по кругу.
- Если активных аккаунтов нет, соответствующая кнопка блокируется.

## Как использовать

1. Откройте `chrome://extensions`.
2. Включите режим разработчика.
3. Нажмите **Load unpacked** и выберите корень этого репозитория.
4. Откройте настройки расширения и заполните аккаунты.

## Настройки аккаунтов

### Мои Звонки

Расширение теперь использует REST API в формате, который вы прислали:

- URL: `https://[domain].moizvonki.ru/api/v1`
- Метод: `POST`
- Заголовок: `Content-Type: application/json`
- В теле уходит JSON-объект напрямую.

В JSON отправляются:

- `user_name` — email пользователя
- `api_key` — API ключ
- `action` — по умолчанию `calls.make_call`
- `to` — номер из XPath
- дополнительные поля `from` / `line` можно передать при необходимости

В настройках аккаунта **Мои Звонки** теперь нужно заполнить:

- название аккаунта
- email пользователя
- API ключ
- поддомен (`test`, `company`, и т.д.)
- endpoint (по умолчанию `/api/v1`)
- action (по умолчанию `calls.make_call`)

При необходимости можно задать полный `baseUrl`, тогда поддомен не используется.

### Wappi / MAX API

Расширение теперь использует этот формат:

- Base URL: `https://wappi.pro`
- Endpoint: `/maxapi/sync/message/send`
- Метод: `POST`
- Заголовок: `Authorization: <Token>`
- Query-параметр `profile_id` обязателен
- Query-параметр `bot_id` необязателен

Тело запроса отправляется в JSON:

- `recipient` — номер из XPath, если не указан `chat_id`
- `chat_id` — опционально, имеет приоритет над `recipient`
- `body` — текст сообщения
- `manager` — опциональный объект с `id`, `name`, `ava_link`, `description`

В настройках Wappi можно задать `profileId`, `botId`, `chatId` и данные `manager`.
