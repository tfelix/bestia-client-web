#!/usr/bin/env bash
set -e

LOCALPATH='./dist/bestia-angular'
REMOTEPATH='/demo.bestia-game.net'

lftp -f "
set ssl:verify-certificate no
open ftp://bestia-game.net
user ${FTP_USER} ${FTP_PASSWORD}
mirror --continue --reverse --delete ${LOCALPATH} ${REMOTEPATH}
bye
"