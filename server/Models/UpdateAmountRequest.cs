using System.ComponentModel.DataAnnotations;

namespace BankingSystem.Models;

public class UpdateAmountRequest
{
    [Range(0.01, 9999999999.99, ErrorMessage = "Amount must be between 0.01 and 9,999,999,999.99.")]
    public decimal Amount { get; set; }
}
