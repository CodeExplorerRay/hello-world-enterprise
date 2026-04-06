var builder = WebApplication.CreateBuilder(args);
var port = Environment.GetEnvironmentVariable("CONCATENATION_SERVICE_PORT")
    ?? Environment.GetEnvironmentVariable("PORT")
    ?? "8086";

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/", () => Results.Ok(new
{
    service = "concatenation-service",
    status = "running",
    port,
    endpoints = new
    {
        health = "/health",
        concat = "/concat",
    },
    usage = "POST /concat with JSON {\"parts\":[\"Hello\",\" \",\"World\"]} or GET /concat?parts=Hello&parts=%20&parts=World",
}));

app.MapGet("/health", () => Results.Ok(new
{
    service = "concatenation-service",
    status = "ok",
    port,
}));

app.MapControllers();

app.Run();
