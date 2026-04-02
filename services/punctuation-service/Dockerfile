FROM rust:1.70-slim

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

RUN cargo build --release

COPY . .

RUN cargo build --release

EXPOSE 8083

CMD ["./target/release/punctuation-service"]