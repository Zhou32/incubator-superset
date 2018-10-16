import io
import json
import os
import subprocess
import sys

from setuptools import find_packages, setup

if sys.version_info < (3, 6):
    sys.exit('Sorry, Python < 3.6 is not supported')

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PACKAGE_DIR = os.path.join(BASE_DIR, 'superset', 'static', 'assets')
PACKAGE_FILE = os.path.join(PACKAGE_DIR, 'package.json')
with open(PACKAGE_FILE) as package_file:
    version_string = json.load(package_file)['version']

with io.open('README.md', encoding='utf-8') as f:
    long_description = f.read()


def get_git_sha():
    try:
        s = subprocess.check_output(['git', 'rev-parse', 'HEAD'])
        return s.decode().strip()
    except Exception:
        return ''


GIT_SHA = get_git_sha()
version_info = {
    'GIT_SHA': GIT_SHA,
    'version': version_string,
}
print('-==-' * 15)
print('VERSION: ' + version_string)
print('GIT SHA: ' + GIT_SHA)
print('-==-' * 15)

with open(os.path.join(PACKAGE_DIR, 'version_info.json'), 'w') as version_file:
    json.dump(version_info, version_file)


setup(
    name='superset',
    description=(
        'A modern, enterprise-ready business intelligence web application'),
    long_description=long_description,
    long_description_content_type='text/markdown',
    version=version_string,
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    scripts=['superset/bin/superset'],
    install_requires=[
        'bleach==2.1.2',
        'boto3==1.4.7',
        'botocore>=1.7.0, <1.8.0',
        'celery>=4.2.0',
        'click==6.7',
        'colorama==0.3.9',
        'contextlib2==0.5.5',
        'cryptography==1.9',
        'flask==0.12.2',
        'flask-appbuilder>=1.12.0',
        'flask-caching==1.4.0',
        'flask-compress==1.4.0',
        'flask-migrate==2.1.1',
        'flask-wtf==0.14.2',
        'flower==0.9.2',  # deprecated
        'future>=0.16.0, <0.17',
        'geopy==1.11.0',
        'gunicorn==19.8.0',  # deprecated
        'humanize==0.5.1',
        'idna==2.6',
        'isodate==0.6.0',
        'markdown>=3.0',
        'pandas==0.23.1',
        'parsedatetime==2.0.0',
        'pathlib2==2.3.0',
        'polyline==1.3.2',
        'pydruid==0.4.4',
        'pyhive==0.5.1',
        'python-dateutil==2.6.1',
        'python-geohash==0.8.5',
        'pyyaml==3.12',
        'requests==2.18.4',
        'simplejson==3.15.0',
        'six==1.11.0',
        'sqlalchemy==1.2.2',
        'sqlalchemy-utils==0.32.21',
        'sqlparse==0.2.4',
        'tableschema==1.1.0',
        'thrift==0.11.0',
        'thrift-sasl==0.3.0',
        'unicodecsv==0.14.1',
        'unidecode==1.0.22',
    ],
    extras_require={
        'cors': ['flask-cors>=2.0.0'],
        'console_log': ['console_log==0.2.10'],
    },
    author='Maxime Beauchemin',
    author_email='maximebeauchemin@gmail.com',
    url='https://github.com/apache/incubator-superset',
    download_url=(
        'https://github.com'
        '/apache/incubator-superset/tarball/' + version_string
    ),
    classifiers=[
        'Programming Language :: Python :: 3.6',
    ],
)
