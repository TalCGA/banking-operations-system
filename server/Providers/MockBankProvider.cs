using BankingSystem.Models;

namespace BankingSystem.Providers;

public class MockBankProvider : IBankProvider
{
    private static readonly Random _random = new();
    private static readonly string[] _failureReasons = ["Timeout", "Insufficient Funds", "System Error"];

    // Simulates POST https://openBanking/createtoken
    public async Task<string> GetTokenAsync(string userId, string secretId)
    {
        await Task.Delay(500);
        return Guid.NewGuid().ToString();
    }

    // Simulates POST https://openBanking/deposit or https://openBanking/withdraw
    public async Task<BankResponse> ExecuteTransactionAsync(string token, Transaction transaction)
    {
        await Task.Delay(500);

        string endpoint = transaction.ActionType == ActionType.Deposit
            ? "https://openBanking/deposit"
            : "https://openBanking/withdraw";

        // Status 1 = Success (80%), Status 0 = Failure (20%)
        bool isSuccess = _random.NextDouble() < 0.80;

        return new BankResponse
        {
            IsSuccess = isSuccess,
            FailureReason = isSuccess
                ? null
                : _failureReasons[_random.Next(_failureReasons.Length)]
        };
    }
}
