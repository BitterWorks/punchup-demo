FROM node:18

WORKDIR /app
ENV DOCKER=1

RUN apt-get update 
RUN apt-get install -y cron

COPY . .

RUN npm install
RUN npx playwright install-deps
RUN npx playwright install
RUN npm run build

COPY cronjob /etc/cron.d/cronjob
RUN chmod 0644 /etc/cron.d/cronjob
RUN crontab /etc/cron.d/cronjob

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
