package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type TeapotStatus struct {
    Status        string    `json:"status"`
    HTTPCode      int       `json:"httpCode"`
    Message       string    `json:"message"`
    TeapotModel   string    `json:"teapotModel"`
    WaterTemp     string    `json:"waterTempCelsius"`
    BrewingStatus string    `json:"brewingStatus"`
    RFC           string    `json:"rfc"`
    Author        string    `json:"rfcAuthor"`
    Dedication    string    `json:"dedication"`
    Timestamp     time.Time `json:"timestamp"`
}

func main() {
    // Standard health check — but make it teapot
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(418)
        json.NewEncoder(w).Encode(TeapotStatus{
            Status:        "I'm a teapot",
            HTTPCode:      418,
            Message:       "This service is healthy, but it's a teapot, so it refuses to brew coffee.",
            TeapotModel:   "Enterprise CloudTeapot™ v3.2.1",
            WaterTemp:     "100°C (boiling, like our cloud costs)",
            BrewingStatus: "STEEPING",
            RFC:           "RFC 2324 - Hyper Text Coffee Pot Control Protocol",
            Author:        "Larry Masinter",
            Dedication:    "This health check is dedicated to Larry Masinter, who gave us the greatest HTTP status code.",
            Timestamp:     time.Now(),
        })
    })

    // BREW method handler (yes, BREW is a real HTTP method in HTCPCP)
    http.HandleFunc("/brew", func(w http.ResponseWriter, r *http.Request) {
        if r.Header.Get("Content-Type") != "message/coffeepot" {
            w.WriteHeader(418)
            fmt.Fprintf(w, "I'm a teapot. I can't brew coffee. Try Content-Type: message/teapot")
            return
        }
        w.WriteHeader(418)
        fmt.Fprintf(w, "Still a teapot. Nice try though.")
    })

    // Addition headers per RFC 2324
    http.HandleFunc("/brew/additions", func(w http.ResponseWriter, r *http.Request) {
        additions := map[string]interface{}{
            "Accept-Additions": []string{
                "milk-type: whole",
                "milk-type: oat",
                "syrup-type: vanilla",
                "sugar: 2 lumps",
                "cream: yes-please",
                "whiskey: for-debugging-only",
            },
            "note": "None of these work because I'm a teapot.",
        }
        w.WriteHeader(418)
        json.NewEncoder(w).Encode(additions)
    })

    http.ListenAndServe(":8082", nil)
}