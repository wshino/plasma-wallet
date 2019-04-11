FROM node:10.15.3-alpine

COPY . .
ENV PARCEL_WORKERS=1
RUN apk update && apk add git make g++ python --virtual build-dependencies build-base 
RUN yarn install
RUN cp .env.example .env
RUN yarn start

# multi stage build
# FROM nginx
# COPY --from=builder ./dist/ /usr/share/nginx/html
