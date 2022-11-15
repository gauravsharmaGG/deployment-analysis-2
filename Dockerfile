FROM node:16 AS ui-build
WORKDIR /usr/src/app
COPY . ./deployment-analysis-2/
RUN cd deployment-analysis-2 && npm install && npm run build


FROM nginx:alpine

#!/bin/sh

COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stahg 1
COPY --from=ui-build /usr/src/app/deployment-analysis-2/build/ /usr/share/nginx/html

EXPOSE 4200 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]