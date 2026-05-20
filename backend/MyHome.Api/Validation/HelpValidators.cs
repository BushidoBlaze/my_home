using FluentValidation;
using MyHome.Api.Controllers;

namespace MyHome.Api.Validation;

public sealed class CreateSupportRequestDtoValidator : AbstractValidator<HelpController.CreateSupportRequestDto>
{
    public CreateSupportRequestDtoValidator()
    {
        RuleFor(x => x.Subject)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(200);

        RuleFor(x => x.Message)
            .NotEmpty()
            .MinimumLength(10)
            .MaximumLength(4000);

        RuleFor(x => x.ContactEmail)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.ContactPhone)
            .MaximumLength(32)
            .When(x => !string.IsNullOrWhiteSpace(x.ContactPhone));
    }
}

public sealed class CreateBugReportDtoValidator : AbstractValidator<HelpController.CreateBugReportDto>
{
    public CreateBugReportDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .NotEmpty()
            .MinimumLength(10)
            .MaximumLength(4000);

        RuleFor(x => x.StepsToReproduce)
            .MaximumLength(4000)
            .When(x => !string.IsNullOrWhiteSpace(x.StepsToReproduce));

        RuleFor(x => x.ContactEmail)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.ContactEmail));
    }
}
