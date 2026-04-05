FROM rust:latest

WORKDIR /app

# Copy dependency manifest first. This repo does not check in Cargo.lock.
COPY Cargo.toml ./

# Copy source code
COPY . .

# Build the application
RUN cargo build --release

EXPOSE 8083

CMD ["./target/release/punctuation-service"]
