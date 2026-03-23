using System.ComponentModel.DataAnnotations;

namespace BankingSystem.Models;

public class MustBeInPastAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is DateOnly date && date >= DateOnly.FromDateTime(DateTime.Today))
            return new ValidationResult("BirthDate must be a past date.");

        return ValidationResult.Success;
    }
}
