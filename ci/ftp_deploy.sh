#!/usr/bin/env bash
set -e

LOCALPATH='./dist/bestia-angular'
REMOTEPATH='demo.bestia-game.net'

cd ${LOCALPATH}
find . -type f -exec curl --ftp-ssl -u ${FTP_USER}:${FTP_PASSWORD} -k --ftp-create-dirs -T {} ftp://bestia-game.net/${REMOTEPATH}/{} \;