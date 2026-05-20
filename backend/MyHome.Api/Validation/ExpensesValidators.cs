using FluentValidation;
using MyHome.Api.Controllers;

namespace MyHome.Api.Validation;

public sealed class SubmitMeterReadingDtoValidator : AbstractValidator<ExpensesController.SubmitMeterReadingDto>
{
    public SubmitMeterReadingDtoValidator()
    {
        RuleFor(x => x.MeterType)
            .NotEmpty()
            .MinimumLength(2)
            .MaximumLength(80);

        RuleFor(x => x.Value)
            .GreaterThanOrEqualTo(0);

        RuleFor(x => x.Comment)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Comment));
    }
}

public sealed class UpsertAutoPayDtoValidator : AbstractValidator<ExpensesController.UpsertAutoPayDto>
{
    public UpsertAutoPayDtoValidator()
    {
        RuleFor(x => x.DayOfMonth)
            .InclusiveBetween(1, 28);

        RuleFor(x => x.LimitAmount)
            .GreaterThan(0);

        RuleFor(x => x.CardMask)
            .MaximumLength(32)
            .When(x => !string.IsNullOrWhiteSpace(x.CardMask));
    }
}
