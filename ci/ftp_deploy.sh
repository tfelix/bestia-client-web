#!/usr/bin/env bash
set -e

LOCALPATH='./dist/bestia-angular'
REMOTEPATH='demo.bestia-game.net'

find ${LOCALPATH} -type f -exec curl -u ${FTP_USER}:${FTP_PASSWORD} --ftp-create-dirs -T {} ftp://bestia-game.net/${REMOTEPATH}/{} \;