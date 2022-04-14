#!/bin/sh 

# Shell script to simulate response to EDI-204
# This script monitors the local file system for EDI-204 requests from 
# the s3FileSync. 
# It mangles sample template files to generate EDI-990 and EDI-214 
# messages that are copied toi the "Inbox" 

pollInterval=5
# Outgoing messages are copied to the Outbox folder
Outbox=data/Outbox
# Template directory has sample response EDI documents
from=template
# Inbound messages
to=data/Inbox

shipmentId="00000000"
# Override the Inbox folder if required
if [ x"$2" != "x" ]; then
  to=$2
fi
# Override the Outbox folder if required
if [ x"$3" != "x" ]; then
  from=$3
fi

# Routine to create the EDI files for a given EDI 204
function sendResponse() {
  oldtxn=17a75ed8
  txn=$1
  echo  "Processing :" ${txn}
  newtime=`date +"%H%M"`
  newdate=`date +"%y%m%d"`
  for i in `ls $from`
  do
    senddate=`head -1 $from/$i | cut -f10 -d'*'`
    sendtime=`head -1 $from/$i | cut -f11 -d'*'`
    newtime=`date +"%H%M"`
    newdate=`date +"%y%m%d"`
    fn=`echo $i | sed -e s/${oldtxn}/${txn}/`
    sed -e s/${oldtxn}/$txn/ $from/$i | sed -e s/${senddate}/${newdate}/ | sed -e s/${sendtime}/${newtime}/ > $to/$fn
  done
}

# Main body polls the Outbox for any new files
touch checkForMessages
# Use find with -newer to check if new files have been created
while(true)
do
  for msg in `find ${Outbox} -type f -newer checkForMessages | xargs basename | cut -f3 -d'-' | cut -f1 -d'.'`
  do
    echo " Processing ID:" ${msg}
    sendResponse ${msg}
  done
  touch checkForMessages
  echo "Waiting ... ${pollInterval} "
  sleep ${pollInterval}
done

