using FluentValidation;
using MyHome.Api.Controllers;

namespace MyHome.Api.Validation;

public sealed class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6);

        RuleFor(x => x.FullName)
            .NotEmpty()
            .MinimumLength(2)
            .MaximumLength(120);

        RuleFor(x => x.Role)
            .Must(role => role is null or "Resident" or "Manager")
            .WithMessage("Role must be Resident or Manager.");

        When(x => x.Role == "Manager", () =>
        {
            RuleFor(x => x.Phone)
                .NotEmpty()
                .MinimumLength(6)
                .MaximumLength(32);
        });
    }
}

public sealed class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6);
    }
}
