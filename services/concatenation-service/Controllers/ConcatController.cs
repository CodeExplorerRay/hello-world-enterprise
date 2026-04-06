using Microsoft.AspNetCore.Mvc;

namespace ConcatenationService.Controllers
{
    [ApiController]
    [Route("concat")]
    public class ConcatController : ControllerBase
    {
        [HttpGet]
        public IActionResult Describe([FromQuery] string[]? parts)
        {
            if (parts == null || parts.Length == 0)
            {
                return Ok(new
                {
                    Service = "concatenation-service",
                    Status = "running",
                    Usage = "POST /concat with JSON {\"parts\":[\"Hello\",\" \",\"World\"]} or GET /concat?parts=Hello&parts=%20&parts=World",
                });
            }

            return Ok(BuildConcatenationResponse(parts));
        }

        /// <summary>
        /// Enterprise String Concatenation as a Service (SCaaS)
        /// Because string.Join() deserves its own Kubernetes pod.
        /// </summary>
        [HttpPost]
        public IActionResult Concatenate([FromBody] ConcatRequest? request)
        {
            if (request?.Parts == null || request.Parts.Length == 0)
            {
                return BadRequest(new
                {
                    Error = "parts is required",
                    Usage = "POST /concat with JSON {\"parts\":[\"Hello\",\" \",\"World\"]}",
                });
            }

            return Ok(BuildConcatenationResponse(request.Parts));
        }

        private static object BuildConcatenationResponse(string[] parts)
        {
            // Add artificial delay to simulate "complexity"
            Thread.Sleep(100);

            var result = string.Join("", parts);

            return new
            {
                Result = result,
                PartsReceived = parts.Length,
                ConcatenationStrategy = "StringBuilder (enterprise-grade)",
                AllocationsCreated = 42,
                GarbageCollectionsTriggered = 3,
                Note = "We deployed a .NET service to concatenate two strings. The cloud bill weeps."
            };
        }
    }

    public class ConcatRequest
    {
        public string[] Parts { get; set; } = Array.Empty<string>();
    }
}
