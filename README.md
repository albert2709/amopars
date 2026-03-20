# amoPars Caller & SMS extension

Chrome Extension (Manifest V3) с popup и страницей настроек.

## Возможности

- Кнопка **Позвонить** берёт номер телефона по XPath `//div[@class="pipeline_leads__field h-text-overflow"]` на текущей странице.
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

По умолчанию расширение отправляет `POST` в:

- Base URL: `https://api.moizvonki.ru`
- Endpoint: `/api/calls/make`
- Заголовок: `Authorization: Bearer <apiKey>`

Тело запроса отправляется в JSON с полями `phone`, `from`, `user_id`, `sip_account`.

### Wappi / MAX API

По умолчанию расширение отправляет `POST` в:

- Base URL: `https://gate.whapi.cloud`
- Endpoint: `/messages/text`
- Заголовок: `Authorization: <apiKey>`
- Query-параметр: `profile_id=<profileId>`

Тело запроса: `{ "phone": "...", "body": "..." }`.

> Если ваши реальные endpoints отличаются, их можно изменить прямо в настройках для каждого аккаунта.
