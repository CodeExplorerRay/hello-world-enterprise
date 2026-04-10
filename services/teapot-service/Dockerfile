FROM golang:1.21-alpine

WORKDIR /app

COPY go.mod ./

RUN go mod download

COPY . .

RUN go build -o main .

RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app

EXPOSE 8082

USER app

CMD ["./main"]
