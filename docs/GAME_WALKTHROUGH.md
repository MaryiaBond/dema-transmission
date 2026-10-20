# THE OUTSIDE — THE ARCHIVE Game Walkthrough

> Внутренний документ разработчика. Содержит полные спойлеры LEVEL 01. Не публиковать в интерфейсе, production assets или PWA-кэше.

## Источники истины

Руководство описывает фактические правила текущей реализации:

- контент, ID дел, документов, улик, связей, записей, достижений и аттестации — `src/content/archive-content.ts`;
- проверки готовности дел, разблокировки, аттестации и финала — `src/features/archive/archive-engine.ts`;
- условия достижений — `src/features/archive/achievement-engine.ts`;
- доступные действия и порядок экранов — `src/features/archive/ArchiveWorkspace.vue`, `InvestigationBoard.vue`, `ComplianceAssessment.vue` и `LevelCompleteScene.vue`;
- типы и закрытый перечень поддерживаемых ID — `src/types/archive.ts`.

Под «ID правила» ниже понимается ID сущности из контента (`case_001`, `lineup_transition` и т. п.) либо имя функции-валидатора движка (`isCaseReady`, `completeCase`, `isAssessmentUnlocked`, `completeAssessment`, `completeLevel01`).

# LEVEL 01

## Краткая схема прохождения

1. Открыть THE ARCHIVE из шапки или блока приглашения и пройти три шага ориентации EMPLOYEE 021.
2. Завершить `case_001`; это разблокирует `case_002`.
3. Завершить `case_002`; это разблокирует `case_003`.
4. Завершить `case_003`.
5. Вручную отметить изученными все девять музыкальных записей. Открытие внешних ссылок не обязательно.
6. После трёх завершённых дел и девяти отметок пройти философскую аттестацию из девяти вопросов.
7. На результате аттестации нажать «ПРОДОЛЖИТЬ», затем принять уровень допуска.
8. Финальная запись показывает `LEVEL 02 / CLASSIFIED / IN DEVELOPMENT` и 💩 🦄.

Начальное состояние создаёт `createPlayerProgress`: доступен только `case_001`, статус сотрудника — `appointed`, допуск — `ARCHIVE ENTRY`. Ориентация вызывает `completeOnboarding` и меняет статус на `active`. Источник: `src/features/archive/archive-engine.ts`, правила `createPlayerProgress` и `completeOnboarding`.

## Общие правила расследований

Открытие документа сразу добавляет перечисленные у него улики в `discoveredEvidence`; отдельного подтверждения внутри документа нет. Источник: `src/features/archive/archive-engine.ts`, правило `discoverDocument`.

Для завершения дела функция `isCaseReady` одновременно требует:

- все `evidenceIds` текущего CASE должны быть обнаружены;
- все `requiredConnectionIds` должны быть подтверждены на доске;
- если у дела есть `correctSequence`, текущая хронология должна совпасть с ней по каждой позиции;
- для `case_003` дополнительно должна быть введена правильная расшифровка.

Затем `completeCase` проверяет, что дело разблокировано, завершает его и добавляет следующее дело из `archiveCases` в `unlockedCases`. Порядок выбора двух улик в паре не важен: `testConnection` проверяет наличие обеих разных улик в правиле связи.

## CASE 001 — THE MISSING MEMBERS

### Цель

Опровергнуть утверждение реестра, что группа всегда была дуэтом: восстановить исходное трио и правильный порядок изменений состава. Источник: `src/content/archive-content.ts`, дело `case_001`.

### Документы и получаемые улики

| Document ID | Название | Улики после изучения | Требуется механически |
|---|---|---|---|
| `doc_001_roster` | «Реестр основания» | `founding_lineup` — «Состав 2009» | Да |
| `doc_001_changes` | «Журнал изменений» | `salih_departure` — «Уход Chris Salih»; `dun_arrival` — «Приход Josh Dun»; `thomas_departure` — «Уход Nick Thomas» | Да |
| `doc_001_photo` | «Утверждённая сводка» | `founding_lineup` — «Состав 2009» | Нет: дублирует улику из `doc_001_roster`; рекомендуется прочитать для сюжета |

Полный UI-счётчик улик становится `4 / 4` после первых двух документов. Валидатор проверяет улики, а не список открытых документов: `src/features/archive/archive-engine.ts`, `discoverDocument` и `isCaseReady`; соответствия документов и улик — `src/content/archive-content.ts`, `case_001` и `archiveDocuments`.

### Правильная связь

На вкладке «ДОСКА» выбрать две карточки и нажать «СОЕДИНИТЬ»:

| Connection ID | Улика 1 | Улика 2 | Результат |
|---|---|---|---|
| `lineup_transition` | `founding_lineup` — «Состав 2009» | `thomas_departure` — «Уход Nick Thomas» | Архив скрыл переход от трио 2009 года к дуэту 2011 года |

Источник решения: `src/content/archive-content.ts`, правило связи `lineup_transition`. Проверка: `src/features/archive/archive-engine.ts`, `testConnection`.

### Правильная хронология

Расположить события от раннего к позднему:

1. `founding_lineup` — «Состав 2009».
2. `salih_departure` — «Уход Chris Salih» (май 2011).
3. `dun_arrival` — «Приход Josh Dun» (после ухода Salih, май 2011).
4. `thomas_departure` — «Уход Nick Thomas» (июнь 2011).

Точное правило: `case_001.correctSequence` в `src/content/archive-content.ts`. Начальный заведомо неверный порядок задан как `case_001.initialSequence`: `dun_arrival`, `founding_lineup`, `thomas_departure`, `salih_departure`. Проверка выполняется в `isCaseReady`.

### Завершение и награда

Когда найдены все четыре улики, подтверждён `lineup_transition` и выставлена точная хронология, индикатор сообщает о достаточности набора. Нажать «ЗАВЕРШИТЬ ДЕЛО».

- завершённое дело: `case_001`;
- разблокируется: `case_002`;
- достижение: `archive_corrected` — «Архив исправлен».

Источники: `src/features/archive/archive-engine.ts`, `isCaseReady` и `completeCase`; `src/features/archive/achievement-engine.ts`, условие `archive_corrected`; `src/content/archive-content.ts`, описание достижения `archive_corrected`.

## CASE 002 — INVISIBLE COLOR

### Цель

Доказать, что повторяющиеся жёлтые элементы — не украшение, а система сигналов сопротивления, невидимая для епископов. Источник: `src/content/archive-content.ts`, дело `case_002`.

### Документы и получаемые улики

| Document ID | Название | Улики после изучения | Требуется механически |
|---|---|---|---|
| `doc_002_visual` | «Визуальная запись» | `yellow_petals` — «Жёлтые лепестки»; `yellow_tape` — «Ленты Бандитос» | Да |
| `doc_002_field` | «Полевое объяснение» | `bishop_vision` — «Слепая зона» | Да |
| `doc_002_directive` | «Директива о цвете» | `bishop_vision` — «Слепая зона» | Нет: дублирует улику из `doc_002_field`; рекомендуется прочитать для сюжета |

Минимально валидатору достаточно открыть `doc_002_visual` и `doc_002_field`. Источник: `src/content/archive-content.ts`, `case_002` и `archiveDocuments`; проверка — `discoverDocument` и `isCaseReady` в `src/features/archive/archive-engine.ts`.

### Правильные связи

Подтвердить обе пары, по одной за попытку:

| Connection ID | Улика 1 | Улика 2 | Результат |
|---|---|---|---|
| `yellow_signal` | `yellow_petals` — «Жёлтые лепестки» | `yellow_tape` — «Ленты Бандитос» | Повторение жёлтого — система сигналов, а не украшение |
| `yellow_blindspot` | `yellow_tape` — «Ленты Бандитос» | `bishop_vision` — «Слепая зона» | Жёлтый помогает сопротивлению оставаться незаметным для епископов |

Источник решений: `src/content/archive-content.ts`, правила `yellow_signal` и `yellow_blindspot`. Проверка: `src/features/archive/archive-engine.ts`, `testConnection`.

Пара `yellow_petals` + `bishop_vision` логична по смыслу, но в правилах отсутствует и будет отклонена.

### Хронология и шифры

У `case_002` нет `correctSequence` и отдельного текстового решения. Переставлять события или вводить ответ не требуется.

### Завершение и награда

После обнаружения трёх улик и подтверждения обеих связей нажать «ЗАВЕРШИТЬ ДЕЛО».

- завершённое дело: `case_002`;
- разблокируется: `case_003`;
- достижение: `invisible_color` — «Невидимый цвет».

Источники: `src/features/archive/archive-engine.ts`, `isCaseReady` и `completeCase`; `src/features/archive/achievement-engine.ts`, условие `invisible_color`.

## CASE 003 — THE PERFECT BROADCAST

### Цель

Показать, что позитивная трансляция Scaled and Icy скрывает принуждение Клэнси, и восстановить сообщение, спрятанное в названии альбома. Источник: `src/content/archive-content.ts`, дело `case_003`.

### Документы и получаемые улики

| Document ID | Название | Улики после изучения | Требуется механически |
|---|---|---|---|
| `doc_003_program` | «Программа эфира» | `sai_broadcast` — «Идеальный эфир» | Да |
| `doc_003_cipher` | «Анаграммный индекс» | `scaled_anagram` — «CLANCY IS DEAD» | Да |
| `doc_003_testimony` | «Свидетельство Клэнси» | `clancy_captive` — «Клэнси в плену» | Да |

Здесь каждый документ даёт уникальную обязательную улику, поэтому необходимо изучить все три. Источник: `src/content/archive-content.ts`, `case_003` и `archiveDocuments`; проверка — `isCaseReady`.

### Правильные связи

| Connection ID | Улика 1 | Улика 2 | Результат |
|---|---|---|---|
| `broadcast_contradiction` | `sai_broadcast` — «Идеальный эфир» | `clancy_captive` — «Клэнси в плену» | Оптимистичная трансляция скрывает принуждение Клэнси |
| `anagram_confirmation` | `scaled_anagram` — «CLANCY IS DEAD» | `clancy_captive` — «Клэнси в плену» | Шифр и свидетельство разрушают официальную версию эфира |

Источник решений: `src/content/archive-content.ts`, правила `broadcast_contradiction` и `anagram_confirmation`. Проверка: `src/features/archive/archive-engine.ts`, `testConnection`.

Пара `sai_broadcast` + `scaled_anagram` не зарегистрирована как правильная.

### Ответ на шифр

В поле «РЕКОНСТРУКЦИЯ ШИФРА» ввести:

```text
CLANCY IS DEAD
```

ID решения хранится как `caseSolutions.case_003`. Правило `isCaseReady` удаляет все символы, кроме латинских букв, и приводит строку к нижнему регистру; итог должен быть строго равен `clancyisdead`. Поэтому также принимаются варианты вроде `clancyisdead`, `Clancy-is-dead` и `CLANCY IS DEAD!!!`, но перевод или другая латиница не принимаются. Источник: `src/features/archive/archive-engine.ts`, `recordCaseSolution` и специальная проверка `case_003` в `isCaseReady`; подсказка и исходная анаграмма — `src/content/archive-content.ts`, документ `doc_003_cipher` и улика `scaled_anagram`.

### Хронология

У `case_003` нет `correctSequence`; отдельная перестановка событий не требуется.

### Завершение и награда

После открытия трёх документов, подтверждения двух связей и ввода шифра нажать «ЗАВЕРШИТЬ ДЕЛО».

- завершённое дело: `case_003`;
- следующего расследования в текущем массиве `archiveCases` нет;
- достижение: `perfect_broadcast` — «Идеальный эфир»;
- появляется предупреждение о назначенной дополнительной аттестации, но сама аттестация откроется только после девяти изученных музыкальных записей.

Источники: `src/features/archive/archive-engine.ts`, `isCaseReady`, `completeCase` и `isAssessmentUnlocked`; `src/features/archive/achievement-engine.ts`, условие `perfect_broadcast`; сообщение UI — `src/features/archive/ArchiveWorkspace.vue`.

## Девять музыкальных записей

Для допуска к аттестации все девять записей должны иметь `markedAsStudied: true`. Открывать YouTube, Spotify или Яндекс Музыку необязательно: `visitedExternalLink` хранится отдельно и не участвует ни в одном условии. На вкладке «ЗАПИСИ» каждого дела нажать «ОТМЕТИТЬ ИЗУЧЕННОЙ» для всех трёх записей.

| CASE | MusicRecord ID | Название |
|---|---|---|
| `case_001` | `heavydirtysoul` | Heavydirtysoul |
| `case_001` | `jumpsuit` | Jumpsuit |
| `case_001` | `iamclancy` | I Am Clancy |
| `case_002` | `nico` | Nico and the Niners |
| `case_002` | `levitate` | Levitate |
| `case_002` | `overcompensate` | Overcompensate |
| `case_003` | `saturday` | Saturday |
| `case_003` | `outside` | The Outside |
| `case_003` | `navigating` | Navigating |

После девятой ручной отметки выдаётся достижение `nine_frequencies` — «Девять частот». Источники: `src/content/archive-content.ts`, `archiveMusicRecords` и достижение `nine_frequencies`; `src/features/archive/archive-engine.ts`, `markMusicStudied` и `isAssessmentUnlocked`; `src/features/archive/achievement-engine.ts`, `studiedRecordCount` и условие `nine_frequencies`.

Записи показываются по текущему делу (`caseMusic` в `src/stores/archive.ts`). Чтобы отметить пропущенные записи предыдущего дела, выбрать это уже завершённое дело в левой панели и открыть вкладку «ЗАПИСИ».

## Философская аттестация

### Условие разблокировки

Вкладка «АТТЕСТАЦИЯ» становится доступна только если одновременно:

- в `completedCases` присутствуют `case_001`, `case_002` и `case_003`;
- `studiedRecordCount(progress) >= 9`.

Точное правило: `isAssessmentUnlocked` в `src/features/archive/archive-engine.ts`. Кнопка блокируется на уровне UI в `src/features/archive/ArchiveWorkspace.vue`.

### Ответы и варианты прохождения

У аттестации намеренно нет ключа правильных ответов и нет подсчёта результата. Для каждого вопроса принимается любой из четырёх принадлежащих ему ID ответа. Единственное условие — ответить на все девять вопросов. Это даёт `4^9 = 262 144` равноправных комбинации; перечислять каждую полную комбинацию отдельно не требуется, потому что движок обрабатывает их одинаково.

Ниже перечислены все допустимые варианты, то есть все варианты прохождения аттестации:

| Question ID | Вопрос | Допустимые Answer ID и ответы |
|---|---|---|
| `q01` | Если дверь открыта, но никто не разрешил тебе выйти, существует ли выход? | `q01_a` «Только в отчёте»; `q01_b` «Дверь ошибается»; `q01_c` «Я уже снаружи»; `q01_d` «Выход существует после согласования» |
| `q02` | Сколько тишины помещается в обязательном гимне? | `q02_a` «Девять мер»; `q02_b` «Ровно одна пауза»; `q02_c` «Меньше допустимого»; `q02_d` «Вся, если гимн не слушать» |
| `q03` | Может ли тень опоздать на перекличку? | `q03_a` «Если свет подал жалобу»; `q03_b` «Тени не носят часов»; `q03_c` «Опоздание уже учтено»; `q03_d` «Тень уже отметилась» |
| `q04` | Какого цвета приказ, прочитанный с закрытыми глазами? | `q04_a` «Административного»; `q04_b` «Невидимо-жёлтого»; `q04_c` «Цвет засекречен»; `q04_d` «Цвет будет назначен позже» |
| `q05` | Если часы остановились по расписанию, показывают ли они верное время? | `q05_a` «Дважды по инструкции»; `q05_b` «Время не аттестовано»; `q05_c` «Расписание важнее»; `q05_d` «Часы повышены в должности» |
| `q06` | Кому принадлежит мысль до её регистрации? | `q06_a` «Ближайшей стене»; `q06_b` «Отделу тишины»; `q06_c` «Никому, что подозрительно»; `q06_d` «Тому, кто первым её отрицает» |
| `q07` | Разрешено ли сомнение, если оно написано карандашом? | `q07_a` «До первого ластика»; `q07_b` «Только без вопросительного знака»; `q07_c` «Карандаш конфискован»; `q07_d` «Разрешено, но только чернилами» |
| `q08` | Что тяжелее: пустой архив или запрещённое воспоминание? | `q08_a` «Весы не допущены»; `q08_b` «Пустота в двух экземплярах»; `q08_c` «Воспоминание без подписи»; `q08_d` «Запрещено взвешивать вопрос» |
| `q09` | Когда наблюдатель моргает, кто наблюдает за наблюдением? | `q09_a` «Резервный наблюдатель»; `q09_b` «Само моргание»; `q09_c` «Этот вопрос»; `q09_d` «Никто. Это и есть проверка» |

Источник вариантов и ID: `src/content/archive-content.ts`, `assessmentQuestions` и `assessmentFourth`; формат ID — `src/types/archive.ts`, `AssessmentAnswerId`. `recordAssessmentAnswer` проверяет лишь принадлежность ответа вопросу по префиксу `${questionId}_`, а `completeAssessment` — наличие ответа на каждый вопрос. Оба правила находятся в `src/features/archive/archive-engine.ts`.

После девятого ответа результат всегда один и тот же, независимо от выбранной комбинации:

- код: `D//OBSERVATION-CONTINUES`;
- итог: «ПРИГОДЕН К ДАЛЬНЕЙШЕМУ НАБЛЮДЕНИЮ»;
- достижение: `compliant_mind` — «Благонадёжный разум».

Источники: `src/content/archive-content.ts`, `assessmentResult` и достижение `compliant_mind`; `src/features/archive/achievement-engine.ts`, условие `compliant_mind`.

## Финал LEVEL 01

1. На экране результата аттестации нажать «ПРОДОЛЖИТЬ».
2. `ArchiveWorkspace.openFinal` вызывает `completeLevel01` и открывает вкладку `level`.
3. Появляется `LEVEL 01 COMPLETE`, новый допуск `UNDER OBSERVATION` и кнопка «ПРИНЯТЬ УРОВЕНЬ ДОПУСКА».
4. Нажать эту кнопку. Локальная стадия финальной сцены меняется с `complete` на `future`.
5. Появляется `LEVEL 02 / CLASSIFIED / IN DEVELOPMENT`, сообщение о продолжении в разработке и финальный знак 💩 🦄.

`completeLevel01` срабатывает только после `assessmentCompletedAt`, записывает `level01CompletedAt`, меняет `clearanceLevel` на `UNDER OBSERVATION`, а `employeeStatus` на `under_observation`. Источники: `src/features/archive/archive-engine.ts`, правило `completeLevel01`; `src/features/archive/ArchiveWorkspace.vue`, `openFinal`; `src/features/archive/LevelCompleteScene.vue`, стадии `complete` и `future`.

После завершения LEVEL 01 в удостоверении появляется секретная кадровая запись `D//P-021-L01`. Повторно открыть финал можно через вкладку `LEVEL 01` или кнопку «ОТКРЫТЬ ФИНАЛЬНУЮ ЗАПИСЬ» в удостоверении. Источники: `src/features/archive/AchievementPassport.vue` и `src/features/archive/ArchiveWorkspace.vue`.

## Все достижения

| Achievement ID | Название | Точное условие |
|---|---|---|
| `archive_corrected` | Архив исправлен | `completedCases` содержит `case_001` |
| `invisible_color` | Невидимый цвет | `completedCases` содержит `case_002` |
| `perfect_broadcast` | Идеальный эфир | `completedCases` содержит `case_003` |
| `nine_frequencies` | Девять частот | Не менее девяти записей имеют `markedAsStudied: true` |
| `compliant_mind` | Благонадёжный разум | Установлен `assessmentCompletedAt` |

Все пять условий определены в `achievementConditions` файла `src/features/archive/achievement-engine.ts`; регистрация без дублей выполняется правилом `registerAchievements`. Названия и описания находятся в `src/content/archive-content.ts`, `archiveAchievements`.

## Открытие следующих уровней

На текущий момент играбельного LEVEL 02 нет и условия его разблокировки в движке не существует. После финала LEVEL 01 показывается только статическая надпись `LEVEL 02 / CLASSIFIED / IN DEVELOPMENT`. Тип `CaseId`, массив `archiveCases` и движок содержат только три дела LEVEL 01. Следовательно, завершение LEVEL 01 не открывает новый игровой уровень; оно лишь присваивает допуск `UNDER OBSERVATION` и показывает экран-заглушку.

Источники: `src/types/archive.ts`, `CaseId`; `src/content/archive-content.ts`, `archiveCases`; `src/features/archive/archive-engine.ts`, `completeLevel01`; `src/features/archive/LevelCompleteScene.vue`.

Будущие LEVEL 02, LEVEL 03 и далее необходимо документировать отдельными разделами, не удаляя и не переписывая актуальное прохождение LEVEL 01.

# Troubleshooting

## Ошибка «Гипотеза не подтверждена»

Сообщение означает, что выбранная пара не совпала ни с одним `EvidenceConnection` текущего CASE. Ошибочная попытка не удаляет и не меняет прогресс: `testConnection` возвращает исходный объект и результат `wrong`.

Проверить:

1. Выбраны ровно две разные улики — кнопка соединения не работает без двух карточек.
2. Обе улики относятся к текущему делу; доска показывает только его обнаруженные улики.
3. Пара совпадает с одним из пяти правил: `lineup_transition`, `yellow_signal`, `yellow_blindspot`, `broadcast_contradiction`, `anagram_confirmation`.
4. Порядок выбора пары не важен.
5. Если правильная связь уже зарегистрирована, UI покажет не ошибку, а «Эта связь уже зарегистрирована» (`known`).

Источники: `src/content/archive-content.ts`, `archiveConnections`; `src/features/archive/archive-engine.ts`, `testConnection`; `src/features/archive/InvestigationBoard.vue`, `connect`.

## Дело не завершается

Общий чек-лист соответствует `isCaseReady` и `completeCase`:

- дело действительно разблокировано и выбрано в левой панели;
- открыты документы, дающие **все** `evidenceIds` дела;
- в журнале противоречий присутствуют **все** `requiredConnectionIds`;
- для CASE 001 хронология полностью и позиционно совпадает с `correctSequence`;
- для CASE 003 введена строка, нормализующаяся ровно в `clancyisdead`;
- после выполнения условий нажата именно кнопка «ЗАВЕРШИТЬ ДЕЛО».

По делам:

- CASE 001: должно быть `4 / 4` улики, `1 / 1` связь и порядок `founding_lineup → salih_departure → dun_arrival → thomas_departure`.
- CASE 002: должно быть `3 / 3` улики и `2 / 2` связи; хронологии нет.
- CASE 003: должно быть `3 / 3` улики, `2 / 2` связи и решение `CLANCY IS DEAD`; хронологии нет.

## Следующее дело закрыто

Дела открываются только последовательно правилом `completeCase`: `case_001 → case_002 → case_003`. Простое обнаружение всех улик или готовность текущего дела не разблокирует следующее — текущее дело нужно официально завершить кнопкой.

## Аттестация заблокирована

Проверить одновременно:

- завершены все три дела, а не только собраны их улики;
- счётчик записей равен `09 / 09`;
- для каждой записи нажата ручная отметка «ОТМЕТИТЬ ИЗУЧЕННОЙ».

Открытие внешней музыкальной ссылки выставляет только `visitedExternalLink: true` и не считается изучением. И наоборот, ручная отметка достаточна без открытия ссылки. Источник: `src/features/archive/archive-engine.ts`, `visitMusicLink`, `markMusicStudied` и `isAssessmentUnlocked`.

## Аттестация не завершается

Должны быть сохранены ответы на все `q01`–`q09`. «Правильной» комбинации нет. На каждом экране необходимо выбрать один вариант и нажать «СЛЕДУЮЩИЙ»; на `q09` — «ПЕРЕДАТЬ ОТВЕТЫ». Проверка: `completeAssessment` в `src/features/archive/archive-engine.ts`.

## Финал не открывается

`completeLevel01` ничего не меняет без `assessmentCompletedAt`. Сначала завершить девятый вопрос, дождаться результата `D//OBSERVATION-CONTINUES` и нажать «ПРОДОЛЖИТЬ». После этого финальная сцена открывается автоматически. Для появления 💩 🦄 требуется ещё нажать «ПРИНЯТЬ УРОВЕНЬ ДОПУСКА» на первой стадии финала.

## Прогресс кажется сброшенным

Локальный прогресс хранится под ключом `the-outside-archive-progress-v1`. Повреждённая, недоступная или несовместимая запись приводит к созданию нового гостевого прогресса. Источники: `src/features/archive/archive-engine.ts`, `ARCHIVE_STORAGE_KEY`; `src/features/archive/archive-persistence.ts`, `loadLocalProgress`.

При входе в профиль и включённой серверной синхронизации может появиться отдельное предложение перенести гостевой прогресс. До явного переноса локальная игра остаётся источником гостевого состояния; это не меняет правила решений, описанные выше.

## Матрица подтверждения по коду

| Этап | Подтверждение |
|---|---|
| Вход и ориентация | `ArchiveView.vue`, `ArchiveDialog.vue`, `ArchiveOnboarding.vue`, `completeOnboarding` |
| Последовательная разблокировка трёх дел | `archiveCases`, `createPlayerProgress`, `completeCase` |
| Документы и выдаваемые улики | `archiveDocuments`, `discoverDocument` |
| Пять правильных связей | `archiveConnections`, `testConnection` |
| Хронология CASE 001 | `case_001.correctSequence`, `moveTimelineItem`, `isCaseReady` |
| Шифр CASE 003 | `doc_003_cipher`, `scaled_anagram`, специальная проверка в `isCaseReady` |
| Девять музыкальных отметок | `archiveMusicRecords`, `markMusicStudied`, `studiedRecordCount` |
| Разблокировка и прохождение аттестации | `isAssessmentUnlocked`, `recordAssessmentAnswer`, `completeAssessment` |
| Пять достижений | `archiveAchievements`, `achievementConditions`, `registerAchievements` |
| LEVEL 01 COMPLETE и допуск | `completeLevel01`, `ArchiveWorkspace.openFinal`, `LevelCompleteScene.vue` |
| Финал 💩 🦄 и отсутствие играбельного LEVEL 02 | `LevelCompleteScene.vue`, отсутствие LEVEL 02 в `CaseId` и `archiveCases` |

