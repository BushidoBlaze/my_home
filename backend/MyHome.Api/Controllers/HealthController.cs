using Microsoft.AspNetCore.Mvc;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok("API работает");
}
