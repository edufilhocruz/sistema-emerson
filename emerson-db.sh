#!/bin/bash

# Script para gerenciar o banco de dados Emerson
# Uso: ./emerson-db.sh [start|stop|restart|status|logs|connect]

case "$1" in
    start)
        echo "🚀 Iniciando banco de dados Emerson..."
        docker-compose -f docker-compose.emerson.yml up -d
        echo "✅ Banco de dados Emerson iniciado!"
        echo "📊 PostgreSQL: localhost:5433"
        echo "🔴 Redis: localhost:6380"
        ;;
    stop)
        echo "🛑 Parando banco de dados Emerson..."
        docker-compose -f docker-compose.emerson.yml down
        echo "✅ Banco de dados Emerson parado!"
        ;;
    restart)
        echo "🔄 Reiniciando banco de dados Emerson..."
        docker-compose -f docker-compose.emerson.yml restart
        echo "✅ Banco de dados Emerson reiniciado!"
        ;;
    status)
        echo "📊 Status dos containers Emerson:"
        docker ps --filter "name=emerson"
        ;;
    logs)
        echo "📝 Logs do banco de dados Emerson:"
        docker-compose -f docker-compose.emerson.yml logs -f
        ;;
    connect)
        echo "🔌 Conectando ao banco de dados Emerson..."
        docker exec -it postgres-emerson psql -U emerson -d emersonadv
        ;;
    *)
        echo "📋 Uso: $0 {start|stop|restart|status|logs|connect}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  start    - Inicia o banco de dados"
        echo "  stop     - Para o banco de dados"
        echo "  restart  - Reinicia o banco de dados"
        echo "  status   - Mostra status dos containers"
        echo "  logs     - Mostra logs em tempo real"
        echo "  connect  - Conecta ao banco via psql"
        echo ""
        echo "Configurações:"
        echo "  Banco: emersonadv"
        echo "  Usuário: emerson"
        echo "  Senha: qbO#259Qq"
        echo "  Host: localhost"
        echo "  Porta PostgreSQL: 5433"
        echo "  Porta Redis: 6380"
        exit 1
        ;;
esac
