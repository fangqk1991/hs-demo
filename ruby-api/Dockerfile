#########################################
FROM ruby

ENV TZ=Asia/Shanghai

WORKDIR /data/hs-ruby

RUN apt-get update && apt-get install -y nodejs

COPY ./Gemfile* ./
RUN bundle install

COPY . .

LABEL maintainer="work@fangqk.com"

ARG commitSHA=Unknown
LABEL commitSHA="${commitSHA}"

ENV CODE_VERSION="${commitSHA}"

COPY ./deps/*.sh /data/deps/

CMD /data/deps/on-container-start.sh && rails s -b 0.0.0.0 -p 5401
