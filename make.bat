@echo off
setlocal EnableDelayedExpansion

:: ========================
:: Variáveis de ambiente
:: ========================
set ENV_FILE=.env
set ENV_EXAMPLE=.env.example
set COMPOSE_FILE=docker-compose.yml

:: Se o .env existir, carrega suas variáveis
if exist %ENV_FILE% (
    for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_FILE%") do (
        :: Ignora linhas que começam com # (comentários) e vazias
        set "line=%%a"
        if not "!line:~0,1!"=="#" (
            if not "%%b"=="" set "%%a=%%b"
        )
    )
)

if "%PROJECT_NAME%"=="" set PROJECT_NAME=backend

:: Verificador de rotas
set command=%1
if "%command%"=="" goto help
if "%command%"=="help" goto help
if "%command%"=="setup-env" goto setup_env
if "%command%"=="app" goto app
if "%command%"=="database_postgres" goto database_postgres
if "%command%"=="database_postgres-down" goto database_postgres_down
if "%command%"=="database_postgres-stop" goto database_postgres_stop
if "%command%"=="database_mongo" goto database_mongo
if "%command%"=="database_mongo-down" goto database_mongo_down
if "%command%"=="database_mongo-stop" goto database_mongo_stop
if "%command%"=="cache_redis" goto cache_redis
if "%command%"=="cache_redis-down" goto cache_redis_down
if "%command%"=="cache_redis-stop" goto cache_redis_stop
if "%command%"=="queue_rabbitmq" goto queue_rabbitmq
if "%command%"=="queue_rabbitmq-down" goto queue_rabbitmq_down
if "%command%"=="queue_rabbitmq-stop" goto queue_rabbitmq_stop
if "%command%"=="keycloak" goto keycloak
if "%command%"=="keycloak-down" goto keycloak_down
if "%command%"=="keycloak-stop" goto keycloak_stop
if "%command%"=="keycloak-logs" goto keycloak_logs
if "%command%"=="keycloak-admin" goto keycloak_admin
if "%command%"=="sonar-up" goto sonar_up
if "%command%"=="sonar-down" goto sonar_down
if "%command%"=="sonar-scan" goto sonar_scan
if "%command%"=="stop" goto stop
if "%command%"=="down" goto down
if "%command%"=="clean" goto clean_all
if "%command%"=="force-remove" goto force_remove
if "%command%"=="clean-images" goto clean_images
if "%command%"=="clean-safe" goto clean_safe
if "%command%"=="clean-all" goto clean_all
if "%command%"=="rebuild-app" goto rebuild_app
if "%command%"=="all" goto all
if "%command%"=="setup-e2e-databases" goto setup_e2e_databases
if "%command%"=="test-e2e-ready" goto test_e2e_ready
if "%command%"=="test-e2e-docker" goto test_e2e_docker
if "%command%"=="test-unit" goto test_unit
if "%command%"=="setup" goto setup

:: Se não achou na lista explícita de cima
echo [AVISO] Comando '%command%' nao encontrado no make.bat.
goto help

:: ========================
:: Regras principais
:: ========================

:help
echo =======================================================
echo                 Comandos Disponiveis
echo =======================================================
echo  make.bat setup-env          - Cria o .env baseado no .env.example
echo  make.bat app                - Sobe a api principal
echo  make.bat [database_postgres^|database_mongo^|cache_redis^|queue_rabbitmq^|keycloak]
echo                              - Sobe apenas o servico especificado
echo                              - (use sufixos -down ou -stop para parar/destruir o servico)
echo  make.bat all                - Inicia todos os servicos e roda as migrations
echo  make.bat setup              - Faz o setup inicial completo do projeto
echo  make.bat down               - Para e remove containers e redes
echo  make.bat clean              - Alias para clean-all
echo  make.bat clean-all          - Destroi tudo (containers, redes e volumes)
echo  make.bat rebuild-app        - Faz rebuild da imagem do servico api
echo  make.bat sonar-up           - Sobe os servicos do SonarQube
echo  make.bat sonar-down         - Para os servicos do SonarQube
echo  make.bat sonar-scan         - Roda a analise via script npm
echo  make.bat test-unit          - Roda a suite de testes unitarios local (npm)
echo  make.bat test-e2e-ready     - Prepara bancos e roda testes E2E localmente
echo  make.bat test-e2e-docker    - Roda testes E2E usando container
echo =======================================================
goto end

:setup_env
if not exist %ENV_FILE% (
    echo [INFO] Criando %ENV_FILE% a partir de %ENV_EXAMPLE%...
    copy %ENV_EXAMPLE% %ENV_FILE% > nul
) else (
    echo [OK] %ENV_FILE% ja existe - nada a fazer.
)
goto end

:app
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d api
goto end

:database_postgres
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d database_postgres
goto end

:database_postgres_down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down database_postgres
goto end

:database_postgres_stop
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% stop database_postgres
goto end

:database_mongo
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d database_mongo
goto end

:database_mongo_down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down database_mongo
goto end

:database_mongo_stop
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% stop database_mongo
goto end

:cache_redis
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d cache_redis
goto end

:cache_redis_down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down cache_redis
goto end

:cache_redis_stop
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% stop cache_redis
goto end

:queue_rabbitmq
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d queue_rabbitmq
goto end

:queue_rabbitmq_down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down queue_rabbitmq
goto end

:queue_rabbitmq_stop
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% stop queue_rabbitmq
goto end

:keycloak
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d keycloak database_keycloak
goto end

:keycloak_down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down keycloak database_keycloak
goto end

:keycloak_stop
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% stop keycloak database_keycloak
goto end

:keycloak_logs
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% logs -f keycloak
goto end

:keycloak_admin
call :setup_env
echo 🔗 Keycloak Admin Console: http://localhost:%KEYCLOAK_PORT%
echo 👤 Username: %KEYCLOAK_ADMIN_USER%
echo 🔑 Password: %KEYCLOAK_ADMIN_PASSWORD%
goto end

:sonar_up
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d sonarqube sonar-db
goto end

:sonar_down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down sonarqube sonar-db
goto end

:sonar_scan
call :setup_env
call npm run sonar
goto end

:stop
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% stop
goto end

:down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down
goto end
:: Aniquilar contêineres e volumes órfãos antigos que estavam ocupando portas da sua máquina local
:force_remove
call :setup_env
for /f "tokens=*" %%i in ('docker ps -a -q --filter "name=%PROJECT_NAME%_"') do docker rm -f %%i
goto end

:clean_images
call :setup_env
for /f "tokens=*" %%i in ('docker images --filter="reference=%PROJECT_NAME%*" -q') do docker rmi -f %%i
goto end

:clean_safe
call :setup_env
echo [LIMPANDO] Limpando containers e redes mas preservando volumes...
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down --remove-orphans
for /f "tokens=*" %%i in ('docker images --filter="reference=%PROJECT_NAME%*" -q') do docker rmi -f %%i 2>nul
for /f "tokens=*" %%i in ('docker network ls --filter "name=%PROJECT_NAME%" -q') do docker network rm %%i 2>nul
goto end

:clean_all
call :setup_env
echo [LIMPANDO] Limpando todos os recursos do projeto %PROJECT_NAME%...
docker rm -f datadog-agent 2>nul
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down -v --remove-orphans
for /f "tokens=*" %%i in ('docker images --filter="reference=%PROJECT_NAME%*" -q') do docker rmi -f %%i 2>nul
goto end

:rebuild_app
call :setup_env
echo [REBUILD] Rebuildando a imagem do servico 'api'...
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% build api
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d --force-recreate api
goto end

:all
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d --remove-orphans
echo [INFO] Rodando migrations...
docker exec -i %PROJECT_NAME%_api npm run migration:run
echo [OK] Projeto iniciado com sucesso!
goto end

:setup_e2e_databases
call :setup_env
echo [INFO] Criando bancos de dados E2E...
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d database_postgres database_mongo
echo [AGUARDANDO] Aguardando bancos inicializarem...
timeout /t 6 /nobreak > nul
echo [OK] Bancos de dados E2E criados com sucesso!
echo    - PostgreSQL: backend_database_test_e2e
echo    - MongoDB: backend_test_e2e
goto end

:test_e2e_ready
call :setup_e2e_databases
echo [INFO] Bancos de dados E2E preparados e prontos para testes!
call npm run test:e2e
goto end

:test_e2e_docker
call :setup_env
echo [INFO] Iniciando testes E2E com Docker Compose...
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% --profile e2e up --abort-on-container-exit --exit-code-from e2e-tests
goto end

:test_unit
call :setup_env
echo [INFO] Iniciando testes unitarios...
call npm run test:unit
goto end

:setup
call :setup_env
echo [SETUP] Iniciando setup completo do projeto...
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d --remove-orphans
echo [INFO] Rodando migrations...
docker exec -i %PROJECT_NAME%_api npm run migration:run
echo [OK] Setup completo! Projeto pronto para usar.
goto end

:end
endlocal
