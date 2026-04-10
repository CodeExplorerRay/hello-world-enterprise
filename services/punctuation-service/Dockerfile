FROM rust:latest

WORKDIR /app

# Copy dependency manifest first. This repo does not check in Cargo.lock.
COPY Cargo.toml ./

# Copy source code
COPY . .

# Build the application
RUN cargo build --release

RUN groupadd -r app && useradd -r -g app app && chown -R app:app /app

EXPOSE 8083

USER app

CMD ["./target/release/punctuation-service"]
