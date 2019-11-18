# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# pylint: disable=C,R,W
import json

from flask import session, redirect
from mixpanel import Mixpanel

mp = Mixpanel('8b85dcbb1c5f693a3b045b24fca1e787')

def post_request(url, params):
    import requests
    return requests.post(url, data=json.dumps(params))


def set_session_team(id, name):
    session['team_id'] = id
    session['team_name'] = name


def get_session_team(securitymanager, user_id):
    try:
        return session['team_id'], session['team_name']
    except Exception as e:
        team = securitymanager.find_team(user_id=user_id)
        if team:
            set_session_team(team.id, team.team_name)
            return team.id, team.team_name
        else:
            # No team found, return None
            # Need more handling on this
            return None


def log_to_mp(user, team_name, action, metadata):
    metadata['Team'] = team_name
    mp.track(user.username, action, metadata)


def create_mp_team(team):
    mp.group_set('Team', team.team_name, {
        '$name': team.team_name
    })


def update_mp_user(user):
    mp.people_set(user.username, {
        '$first_name': user.first_name,
        '$last_name': user.last_name,
        '$email': user.email
    })


def update_mp_team(team, metadata):
    mp.group_set('Team', team.team_name, metadata)


def mp_add_user_to_team(user, team):
    mp.people_append(user.username, {
        'Team': team.team_name
    })
