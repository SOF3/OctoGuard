FROM golang:1.10
LABEL maintainer="sofe2038@gmail.com"

WORKDIR /go/src/
RUN mkdir -p github.com/SOF3/OctoGuard
COPY ../../app github.com/SOF3/OctoGuard/app
COPY ../../views views


RUN go get -d -v ./...
RUN go install -v ./...

CMD ["app"]
