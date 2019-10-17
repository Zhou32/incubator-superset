sudo systemctl enable redis-server.service

cd ~/incubator-superset
. ~/incubator-superset/venv/bin/activate
export SMTP_USERNAME = $1
export SMTP_PASSWORD = $2
export FLASK_ENV=development
nohup superset run -p 8088 --host 0.0.0.0 --with-threads --reload --debugger >> logs.txt 2>&1 &
ps -aux