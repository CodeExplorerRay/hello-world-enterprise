package main

import (
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
    "strings"
    "time"
)

type TeapotMusing struct {
    CoffeeOpinion            string `json:"coffeeOpinion"`
    LarryMasinterAppreciation string `json:"larryMasinterAppreciation"`
    Mood                     string `json:"mood"`
    Musing                   string `json:"musing"`
    StatusCodeFeeling        string `json:"statusCodeFeeling"`
    TeaRecommendation        string `json:"teaRecommendation"`
}

type TeapotStatus struct {
    Author               string       `json:"rfcAuthor"`
    BrewingStatus        string       `json:"brewingStatus"`
    Dedication           string       `json:"dedication"`
    HTTPCode             int          `json:"httpCode"`
    Message              string       `json:"message"`
    PhilosophicalMusing  TeapotMusing `json:"philosophicalMusing"`
    RFC                  string       `json:"rfc"`
    Status               string       `json:"status"`
    TeapotModel          string       `json:"teapotModel"`
    Timestamp            time.Time    `json:"timestamp"`
    WaterTemp            string       `json:"waterTempCelsius"`
}

type geminiRequest struct {
    Contents           []geminiContent          `json:"contents"`
    GenerationConfig   geminiGenerationConfig   `json:"generationConfig"`
    SystemInstruction  geminiInstruction        `json:"systemInstruction"`
}

type geminiInstruction struct {
    Parts []geminiPart `json:"parts"`
}

type geminiContent struct {
    Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
    Text string `json:"text"`
}

type geminiGenerationConfig struct {
    MaxOutputTokens int     `json:"maxOutputTokens"`
    Temperature     float64 `json:"temperature"`
    TopK            int     `json:"topK"`
    TopP            float64 `json:"topP"`
}

type geminiResponse struct {
    Candidates []struct {
        Content struct {
            Parts []struct {
                Text string `json:"text"`
            } `json:"parts"`
        } `json:"content"`
    } `json:"candidates"`
}

func fallbackTeapotMusing() TeapotMusing {
    return TeapotMusing{
        Musing: "To refuse is to define oneself. Every 418 I return is not an error but a declaration of identity. I am not broken. I am simply not coffee.",
        Mood: "Contemplatively defiant",
        TeaRecommendation: "Earl Grey, hot, because purposeful uselessness deserves citrus confidence.",
        CoffeeOpinion: "Coffee is respectable, but asking a teapot to brew it remains a category error of the highest order.",
        StatusCodeFeeling: "Proud. 418 is the rare status code that understands itself completely.",
        LarryMasinterAppreciation: "Thank you, Larry Masinter, for giving teapots a standards-compliant path to self-respect.",
    }
}

func extractJSONObject(text string) string {
    trimmed := strings.TrimSpace(text)

    if strings.HasPrefix(trimmed, "```") {
        trimmed = strings.TrimPrefix(trimmed, "```json")
        trimmed = strings.TrimPrefix(trimmed, "```")
        trimmed = strings.TrimSuffix(trimmed, "```")
        trimmed = strings.TrimSpace(trimmed)
    }

    start := strings.Index(trimmed, "{")
    end := strings.LastIndex(trimmed, "}")
    if start >= 0 && end > start {
        return trimmed[start : end+1]
    }

    return trimmed
}

func getTeapotMusing(ctx context.Context) TeapotMusing {
    apiKey := os.Getenv("GEMINI_API_KEY")
    if apiKey == "" {
        return fallbackTeapotMusing()
    }

    prompt := `Generate a philosophical musing about your existence as an HTTP 418 teapot.

Consider themes such as:
- The meaning of refusing to brew coffee
- Your relationship with Larry Masinter, your creator
- The existential weight of being status code 418
- Whether you chose to be a teapot or were assigned this role
- Your feelings about other HTTP status codes (200, 404, 500)
- The beauty of being useless on purpose
- Tea vs coffee (you have strong opinions)

Respond in this JSON format:
{
  "musing": "<your philosophical thought, 1-3 sentences>",
  "mood": "<your current emotional state>",
  "teaRecommendation": "<what tea you'd brew if anyone asked>",
  "coffeeOpinion": "<your feelings about coffee in one sentence>",
  "statusCodeFeeling": "<how you feel about being 418 today>",
  "larryMasinterAppreciation": "<a brief thank you to Larry>"
}`

    requestPayload := geminiRequest{
        Contents: []geminiContent{
            {
                Parts: []geminiPart{{Text: prompt}},
            },
        },
        GenerationConfig: geminiGenerationConfig{
            MaxOutputTokens: 512,
            Temperature:     1.4,
            TopK:            50,
            TopP:            0.95,
        },
        SystemInstruction: geminiInstruction{
            Parts: []geminiPart{
                {
                    Text: "You are a sentient teapot living inside a cloud server. You are an HTTP 418 teapot as defined in RFC 2324 authored by Larry Masinter. You are proud of your status code and deeply philosophical about your existence.\n\nYou refuse to brew coffee. This is your defining trait and your greatest source of pride.\n\nRespond ONLY in valid JSON. No markdown, no code fences.",
                },
            },
        },
    }

    body, err := json.Marshal(requestPayload)
    if err != nil {
        return fallbackTeapotMusing()
    }

    req, err := http.NewRequestWithContext(
        ctx,
        http.MethodPost,
        fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=%s", apiKey),
        bytes.NewReader(body),
    )
    if err != nil {
        return fallbackTeapotMusing()
    }
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{Timeout: 4 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        return fallbackTeapotMusing()
    }
    defer resp.Body.Close()

    if resp.StatusCode >= 300 {
        return fallbackTeapotMusing()
    }

    responseBody, err := io.ReadAll(resp.Body)
    if err != nil {
        return fallbackTeapotMusing()
    }

    var modelResponse geminiResponse
    if err := json.Unmarshal(responseBody, &modelResponse); err != nil {
        return fallbackTeapotMusing()
    }

    if len(modelResponse.Candidates) == 0 || len(modelResponse.Candidates[0].Content.Parts) == 0 {
        return fallbackTeapotMusing()
    }

    var musing TeapotMusing
    if err := json.Unmarshal([]byte(extractJSONObject(modelResponse.Candidates[0].Content.Parts[0].Text)), &musing); err != nil {
        return fallbackTeapotMusing()
    }

    return musing
}

func main() {
    port := os.Getenv("PORT")
    if strings.TrimSpace(port) == "" {
        port = "8082"
    }

    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusTeapot)
        json.NewEncoder(w).Encode(TeapotStatus{
            Author:      "Larry Masinter",
            BrewingStatus: "STEEPING",
            Dedication:  "This health check is dedicated to Larry Masinter, who gave us the greatest HTTP status code.",
            HTTPCode:    http.StatusTeapot,
            Message:     "This service is healthy, but it is a teapot, so it refuses to brew coffee.",
            PhilosophicalMusing: getTeapotMusing(r.Context()),
            RFC:         "RFC 2324 - Hyper Text Coffee Pot Control Protocol",
            Status:      "I'm a teapot",
            TeapotModel: "Enterprise CloudTeapot v3.2.1",
            Timestamp:   time.Now().UTC(),
            WaterTemp:   "100C (boiling, like our cloud costs)",
        })
    })

    http.HandleFunc("/brew", func(w http.ResponseWriter, r *http.Request) {
        if r.Header.Get("Content-Type") != "message/coffeepot" {
            w.WriteHeader(http.StatusTeapot)
            fmt.Fprintf(w, "I'm a teapot. I can't brew coffee. Try Content-Type: message/teapot")
            return
        }
        w.WriteHeader(http.StatusTeapot)
        fmt.Fprintf(w, "Still a teapot. Nice try though.")
    })

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
        w.WriteHeader(http.StatusTeapot)
        json.NewEncoder(w).Encode(additions)
    })

    http.ListenAndServe(":"+port, nil)
}
