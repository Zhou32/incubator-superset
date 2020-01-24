#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
FROM python:3.6-buster

RUN useradd --user-group --create-home --no-log-init --shell /bin/bash superset

# Configure environment
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

RUN apt-get update -y

# Install dependencies to fix `curl https support error` and `elaying package configuration warning`
RUN apt-get install -y apt-transport-https apt-utils

# Install superset dependencies
# https://superset.incubator.apache.org/installation.html#os-dependencies
RUN apt-get install -y build-essential libssl-dev \
    libffi-dev python3-dev libsasl2-dev libldap2-dev libxi-dev

# Install extra useful tool for development
RUN apt-get install -y vim less redis-tools

RUN apt-get install -y default-jdk-headless

RUN apt-get install libxml2-dev libxslt1-dev zlib1g-dev -y


# Install nodejs for custom build
# https://superset.incubator.apache.org/installation.html#making-your-own-build
# https://nodejs.org/en/download/package-manager/
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs

WORKDIR home/superset

COPY requirements.txt .
COPY requirements-dev.txt .
COPY contrib/docker/requirements-extra.txt .




RUN pip install --upgrade setuptools pip \
    && pip install -r requirements.txt -r requirements-dev.txt -r requirements-extra.txt \
    && rm -rf /root/.cache/pip

RUN pip install gevent

COPY --chown=superset:superset superset superset


ENV PATH=/home/superset/superset/bin:$PATH \
    PYTHONPATH=/home/superset/superset/:$PYTHONPATH

USER superset

# RUN cd superset/assets 
WORKDIR /home/superset/superset/assets
RUN npm cache clean --force

RUN npm ci
RUN npm run build
RUN rm -rf node_modules


WORKDIR /home/superset
COPY contrib/docker/docker-init.sh .
COPY contrib/docker/docker-entrypoint2.sh /entrypoint.sh

ENV SMTP_USERNAME SMTP_USERNAME
ENV SMTP_PASSWORD SMTP_PASSWORD
ENV STRIPE_SK STRIPE_SK
ENV STRIPE_PK STRIPE_PK

ENV MYSQL_USER MYSQL_USER
ENV MYSQL_PASSWORD MYSQL_PASSWORD
ENV MYSQL_HOST MYSQL_HOST
ENV MYSQL_PORT MYSQL_PORT
ENV MYSQL_DB MYSQL_DB
ENV SG_API_KEY SG_API_KEY
ENV VERSION VERSION
ENV FREE_CREDIT_DOLLAR FREE_CREDIT_DOLLAR
ENV GENERATION_API GENERATION_API

USER root
RUN ["chmod", "+x", "/entrypoint.sh"]

USER superset
ENTRYPOINT /entrypoint.sh $SMTP_USERNAME $SMTP_PASSWORD $STRIPE_SK $STRIPE_PK $MYSQL_USER $MYSQL_PASSWORD $MYSQL_HOST $MYSQL_PORT $MYSQL_DB $SG_API_KEY $VERSION $FREE_CREDIT_DOLLAR $GENERATION_API


HEALTHCHECK CMD ["curl", "-f", "http://localhost:8088/health"]

# COPY contrib/docker/superset.db /home/superset/.superset/superset.db

EXPOSE 8088

