#!/usr/bin/env bash
set -e

LOCALPATH='./dist/bestia-angular'
REMOTEPATH='/demo.bestia-game.net'

echo "set ssl:verify-certificate no" >> ~/.lftp/rc

lftp -f "
open ftp://${FTP_HOST}
user ${FTP_USER} ${FTP_PASSWORD}
mirror --continue --reverse --delete ${LOCALPATH} ${REMOTEPATH}
bye
"