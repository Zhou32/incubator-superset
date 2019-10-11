sudo systemctl enable redis-server.service

. ~/incubator-superset/venv/bin/activate
export FLASK_ENV=development
nohup superset run -p 8088 --host 0.0.0.0 --with-threads --reload --debugger >> logs.txt 2>&1 &
ps -aux