use actix_web::{web, App, HttpServer, HttpResponse};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Deserialize)]
struct PunctuationRequest {
    text: String,
    style: Option<String>,
}

#[derive(Deserialize)]
struct PunctuationQuery {
    text: Option<String>,
    style: Option<String>,
}

#[derive(Serialize)]
struct PunctuationResponse {
    original: String,
    punctuated: String,
    punctuation_applied: String,
    processing_note: String,
}

fn build_punctuation_response(text: &str, style: Option<&str>) -> PunctuationResponse {
    let punctuation = match style {
        Some("excited") => "!",
        Some("questioning") => "?",
        Some("dramatic") => "...",
        Some("enterprise") => ".",
        _ => "!",  // default to excited, life is short
    };

    PunctuationResponse {
        original: text.to_string(),
        punctuated: format!("{}{}", text, punctuation),
        punctuation_applied: punctuation.to_string(),
        processing_note: "A dedicated Rust microservice was deployed to 
            add a single character. Peak engineering.".to_string(),
    }
}

async fn root() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "service": "punctuation-service",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "punctuate_get": "/punctuate?text=Hello%20World&style=excited",
            "punctuate_post": "/punctuate"
        },
        "usage": "Send POST /punctuate with JSON {\"text\":\"Hello World\",\"style\":\"excited\"} or GET /punctuate?text=Hello%20World&style=excited"
    }))
}

async fn punctuate(req: web::Json<PunctuationRequest>) -> HttpResponse {
    HttpResponse::Ok().json(build_punctuation_response(&req.text, req.style.as_deref()))
}

async fn punctuate_from_query(query: web::Query<PunctuationQuery>) -> HttpResponse {
    match query.text.as_deref().map(str::trim).filter(|text| !text.is_empty()) {
        Some(text) => HttpResponse::Ok().json(build_punctuation_response(text, query.style.as_deref())),
        None => HttpResponse::Ok().json(serde_json::json!({
            "service": "punctuation-service",
            "status": "running",
            "usage": "Provide a text query parameter, for example /punctuate?text=Hello%20World&style=excited"
        })),
    }
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "service": "punctuation-service",
        "status": "ok",
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = env::var("PORT").unwrap_or_else(|_| "8083".to_string());
    let bind_address = format!("0.0.0.0:{port}");
    println!("punctuation-service listening on http://{bind_address}");

    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(root))
            .route("/health", web::get().to(health))
            .route("/punctuate", web::get().to(punctuate_from_query))
            .route("/punctuate", web::post().to(punctuate))
    })
    .bind(bind_address)?
    .run()
    .await
}
