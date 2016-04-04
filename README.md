# 2016-02-iu6team
Игра DUEL. Дуэльный шутер летающими "кораблями"


Проверка логина:

curl -H 'Content-Type: application/json' -X PUT -d '{"login": "login", "password" : "password" }' localhost:8080/api/session

curl -H 'Content-Type: application/json' -X PUT -d '{"login": "test", "password" : "test" }' localhost:8080/api/session