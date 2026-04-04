FROM rust:latest

WORKDIR /app

# Copy dependency files first
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY . .

# Build the application
RUN cargo build --release

RUN cargo build --release

EXPOSE 8083

CMD ["./target/release/punctuation-service"]