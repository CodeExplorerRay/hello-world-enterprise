use actix_web::{web, App, HttpServer, HttpResponse};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Deserialize)]
struct PunctuationRequest {
    text: String,
    style: Option<String>,
}

#[derive(Serialize)]
struct PunctuationResponse {
    original: String,
    punctuated: String,
    punctuation_applied: String,
    processing_note: String,
}

async fn punctuate(req: web::Json<PunctuationRequest>) -> HttpResponse {
    let punctuation = match req.style.as_deref() {
        Some("excited") => "!",
        Some("questioning") => "?",
        Some("dramatic") => "...",
        Some("enterprise") => ".",
        _ => "!",  // default to excited, life is short
    };

    HttpResponse::Ok().json(PunctuationResponse {
        original: req.text.clone(),
        punctuated: format!("{}{}", req.text, punctuation),
        punctuation_applied: punctuation.to_string(),
        processing_note: "A dedicated Rust microservice was deployed to 
            add a single character. Peak engineering.".to_string(),
    })
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

    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health))
            .route("/punctuate", web::post().to(punctuate))
    })
    .bind(bind_address)?
    .run()
    .await
}
