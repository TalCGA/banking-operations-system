using BankingSystem.Models;

namespace BankingSystem.Providers;

public interface IBankProvider
{
    Task<string> GetTokenAsync(string personalId);
    Task<BankResponse> ExecuteTransactionAsync(string token, Transaction transaction);
}
