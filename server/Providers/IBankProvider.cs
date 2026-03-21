using BankingSystem.Models;

namespace BankingSystem.Providers;

public interface IBankProvider
{
    Task<string> GetTokenAsync(string userId, string secretId);
    Task<BankResponse> ExecuteTransactionAsync(string token, Transaction transaction);
}
