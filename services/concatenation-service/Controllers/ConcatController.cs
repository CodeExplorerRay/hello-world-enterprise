using Microsoft.AspNetCore.Mvc;

namespace ConcatenationService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ConcatController : ControllerBase
    {
        /// <summary>
        /// Enterprise String Concatenation as a Service (SCaaS)
        /// Because string.Join() deserves its own Kubernetes pod.
        /// </summary>
        [HttpPost]
        public IActionResult Concatenate([FromBody] ConcatRequest request)
        {
            // Add artificial delay to simulate "complexity"
            Thread.Sleep(100);
            
            var result = string.Join("", request.Parts);
            
            return Ok(new
            {
                Result = result,
                PartsReceived = request.Parts.Length,
                ConcatenationStrategy = "StringBuilder (enterprise-grade)",
                AllocationsCreated = 42,
                GarbageCollectionsTriggered = 3,
                Note = "We deployed a .NET service to concatenate two strings. The cloud bill weeps."
            });
        }
    }

    public class ConcatRequest
    {
        public string[] Parts { get; set; } = Array.Empty<string>();
    }
}
