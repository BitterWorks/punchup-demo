# Mail server

## Setup

1. We use MailHog as an SMTP server for email testing
2. How? We run a docker container with the mailhog image exposing 1025 as the SMTP server and 8025 as MailHog's UI port.

```sh
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

## Sending mails

1. Extract the container's IP address:

```
docker inspect -f '{{if eq .Config.Image "mailhog/mailhog"}}{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}{{end}}' e5db10f5eda0
```
