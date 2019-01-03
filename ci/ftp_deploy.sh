#!/usr/bin/env bash
set -e

LOCALPATH='./dist/bestia-angular'
REMOTEPATH='demo.bestia-game.net'

cd ${LOCALPATH}
find . -type f -exec curl -u ${FTP_USER}:${FTP_PASSWORD} --ftp-create-dirs -T {} sftp://bestia-game.net/${REMOTEPATH}/{} \;