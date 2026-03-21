using BankingSystem.Data;
using BankingSystem.Models;
using BankingSystem.Providers;

namespace BankingSystem.Services;

public class BankingService
{
    private readonly IBankProvider _bankProvider;
    private readonly BankingDbContext _dbContext;

    public BankingService(IBankProvider bankProvider, BankingDbContext dbContext)
    {
        _bankProvider = bankProvider;
        _dbContext = dbContext;
    }

    public async Task<Transaction> ProcessTransactionAsync(TransactionRequest request)
    {
        string token = await _bankProvider.GetTokenAsync(request.PersonalId, request.AccountNumber);

        var transaction = new Transaction
        {
            FullNameHebrew   = request.FullNameHebrew,
            FullNameEnglish  = request.FullNameEnglish,
            BirthDate        = request.BirthDate,
            PersonalId       = request.PersonalId,
            Amount           = request.Amount,
            AccountNumber    = request.AccountNumber,
            ActionType       = request.ActionType,
            TransactionDate  = DateTime.UtcNow,
            Status           = TransactionStatus.Cancelled // default; overwritten below
        };

        BankResponse response = await _bankProvider.ExecuteTransactionAsync(token, transaction);

        transaction.Status = response.IsSuccess
            ? TransactionStatus.Success
            : TransactionStatus.Failed;

        _dbContext.Transactions.Add(transaction);
        await _dbContext.SaveChangesAsync();

        return transaction;
    }

    public async Task<List<Transaction>> GetAllTransactionsAsync()
    {
        return await System.Threading.Tasks.Task.FromResult(
            _dbContext.Transactions.OrderByDescending(t => t.TransactionDate).ToList());
    }
}
