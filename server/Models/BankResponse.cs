namespace BankingSystem.Models;

public class BankResponse
{
    public bool IsSuccess { get; set; }
    public string? FailureReason { get; set; }
}
