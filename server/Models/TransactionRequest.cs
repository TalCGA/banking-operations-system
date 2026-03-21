using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankingSystem.Models;

public class TransactionRequest
{
    [Required]
    [MaxLength(20)]
    [RegularExpression(@"^[\u05D0-\u05EA\s\-']+$",
        ErrorMessage = "FullNameHebrew may only contain Hebrew letters, spaces, hyphens, and apostrophes.")]
    public string FullNameHebrew { get; set; } = string.Empty;

    [Required]
    [MaxLength(15)]
    [RegularExpression(@"^[A-Za-z\s\-']+$",
        ErrorMessage = "FullNameEnglish may only contain English letters, spaces, hyphens, and apostrophes.")]
    public string FullNameEnglish { get; set; } = string.Empty;

    [Required]
    public DateOnly BirthDate { get; set; }

    [Required]
    [RegularExpression(@"^\d{9}$",
        ErrorMessage = "PersonalId must be exactly 9 digits.")]
    public string PersonalId { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(10,2)")]
    [Range(0.01, 9999999999.99, ErrorMessage = "Amount must be a positive number up to 10 digits.")]
    public decimal Amount { get; set; }

    [Required]
    [RegularExpression(@"^\d{1,10}$",
        ErrorMessage = "AccountNumber must be up to 10 digits.")]
    public string AccountNumber { get; set; } = string.Empty;

    [Required]
    public ActionType ActionType { get; set; }
}
