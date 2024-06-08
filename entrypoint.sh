#!/bin/bash
# Start cron service in the background
crontab /etc/cron.d/cronjob && service cron start &

# Start Node.js server
npm run serve
