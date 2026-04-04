FROM rust:latest

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

COPY . .

RUN cargo build --release

EXPOSE 8083

CMD ["./target/release/punctuation-service"]
