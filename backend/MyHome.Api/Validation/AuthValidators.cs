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
            .MinimumLength(8)
            .MaximumLength(128)
            .Matches("[A-Za-zА-Яа-яЁё]").WithMessage("Пароль должен содержать буквы")
            .Matches("[0-9]").WithMessage("Пароль должен содержать цифру");

        RuleFor(x => x.FullName)
            .NotEmpty()
            .MinimumLength(2)
            .MaximumLength(120);

        // Поле Role в self-register игнорируется на сервере, но валидируем формат
        // для обратной совместимости с фронтом, который может его слать.
        RuleFor(x => x.Role)
            .Must(role => role is null or "Resident" or "Manager")
            .WithMessage("Role must be Resident or Manager.");

        RuleFor(x => x.Phone)
            .MaximumLength(32);
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
            .MinimumLength(1) // на логине не раскрываем политику пароля
            .MaximumLength(128);
    }
}
