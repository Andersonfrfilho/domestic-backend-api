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
if "%command%"=="down" goto down
if "%command%"=="stop" goto stop
if "%command%"=="clean-all" goto clean_all
if "%command%"=="clean" goto clean_all
if "%command%"=="setup" goto setup
if "%command%"=="all" goto all
if "%command%"=="rebuild-app" goto rebuild_app
if "%command%"=="sonar-up" goto sonar_up
if "%command%"=="sonar-down" goto sonar_down
if "%command%"=="setup-e2e-databases" goto setup_e2e_databases

:: Se não achou na lista explícita de cima, tenta passar direto para o Docker Compose
echo [AVISO] Comando nativo nao encontrado no make.bat. Tentando repassar para algo de uso comum...
goto help

:: ========================
:: Regras principais
:: ========================

:help
echo =======================================================
echo                 Comandos Disponiveis                  
echo =======================================================
echo  make.bat setup-env   - Cria o .env baseado no .env.example
echo  make.bat all         - Inicia todos os servicos e roda as migrations
echo  make.bat setup       - Faz o setup inicial completo do projeto
echo  make.bat down        - Para e remove containers, redes e conteudos base
echo  make.bat clean       - Remove containers, volumes e imagens associadas
echo  make.bat app         - Inicia apenas a aplicacao principal (api)
echo  make.bat rebuild-app - Fazer rebuild da imagem do servico api
echo  make.bat sonar-up    - Sobe os servicos do SonarQube
echo  make.bat sonar-down  - Para os servicos do SonarQube
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

:stop
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% stop
goto end

:down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down api database_postgres database_mongo cache_redis queue_rabbitmq keycloak database_keycloak sonarqube sonar-db
goto end

:clean_all
call :setup_env
echo [LIMPANDO] Limpando todos os recursos do projeto %PROJECT_NAME%...
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down -v --remove-orphans
docker rmi -f $(docker images --filter=reference="%PROJECT_NAME%*" -q) 2>nul
goto end

:rebuild_app
call :setup_env
echo [REBUILD] Rebuildando a imagem do servico 'api'...
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% build api
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d --force-recreate api
goto end

:sonar_up
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d sonarqube sonar-db
goto end

:sonar_down
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% down sonarqube sonar-db
goto end

:setup_e2e_databases
call :setup_env
echo [INFO] Criando bancos de dados E2E...
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d database_postgres database_mongo
echo [AGUARDANDO] Aguardando bancos inicializarem...
timeout /t 6 /nobreak > nul
echo [OK] Bancos de dados E2E criados com sucesso!
goto end

:all
call :setup_env
docker-compose -p %PROJECT_NAME% -f %COMPOSE_FILE% up -d --remove-orphans
echo [INFO] Rodando migrations...
docker exec -i %PROJECT_NAME%_api npm run migration:run
echo [OK] Projeto iniciado com sucesso!
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
